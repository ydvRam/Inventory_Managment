import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const PDFDocument = require('pdfkit');
import { Invoice, InvoiceStatus } from './entities/invoice.entity';
import { Payment } from './entities/payment.entity';
import { SalesOrder } from '../sales-orders/entities/sales-order.entity';
import { NotificationsService } from '../notifications/notifications.service';

const COMPANY_NAME = 'INVENTORY SYSTEM';
const COMPANY_ADDRESS = 'Ahmedabad, Gujarat, India';
const GST_RATE = 0.18;

/** Allowed payment methods only. Static – not from API. */
const ALLOWED_PAYMENT_METHODS = ['Bank', 'Cash', 'Card'] as const;
type PaymentMethodType = (typeof ALLOWED_PAYMENT_METHODS)[number];    

function normalizePaymentMethod(method?: string): PaymentMethodType {
  const m = (method && method.trim()) || 'Cash';
  return ALLOWED_PAYMENT_METHODS.includes(m as PaymentMethodType) ? (m as PaymentMethodType) : 'Cash';
}

@Injectable()
export class InvoicesService {
  constructor(
    @InjectRepository(Invoice)
    private readonly repo: Repository<Invoice>,
    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>,
    @InjectRepository(SalesOrder)
    private readonly salesOrderRepo: Repository<SalesOrder>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async findAll(): Promise<Invoice[]> {
    return this.repo.find({
      relations: ['salesOrder', 'customer'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Invoice> {
    const inv = await this.repo.findOne({
      where: { id },
      relations: ['salesOrder', 'salesOrder.items', 'salesOrder.items.product', 'customer'],
    });
    if (!inv) throw new NotFoundException('Invoice not found');
    return inv;
  }

  async findBySalesOrderId(salesOrderId: string): Promise<Invoice | null> {
    return this.repo.findOne({
      where: { salesOrderId },
      relations: ['salesOrder', 'customer'],
    });
  }

  /** Generate invoice from a sales order. One invoice per sales order. */
  async generateFromSalesOrder(salesOrderId: string): Promise<Invoice> {
    const existing = await this.findBySalesOrderId(salesOrderId);
    if (existing) throw new BadRequestException('Invoice already exists for this sales order');
    const so = await this.salesOrderRepo.findOne({
      where: { id: salesOrderId },
      relations: ['customer'],
    });
    if (!so) throw new NotFoundException('Sales order not found');
    const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    const invoice = this.repo.create({
      salesOrderId: so.id,
      customerId: so.customerId,
      amount: so.totalAmount,
      paidAmount: '0',
      status: InvoiceStatus.UNPAID,
      invoiceNumber,
    });
    const saved = await this.repo.save(invoice);
    const full = await this.findOne(saved.id);
    const total = Number(full.amount ?? 0);
    if (total > 0) {
      const productNames = full.salesOrder?.items?.map((i) => (i as { product?: { name?: string } }).product?.name).filter(Boolean) as string[] | undefined;
      await this.notificationsService.notifyDuePayment(full.id, full.invoiceNumber, total, productNames);
    }
    return full;
  }

  async updateStatus(id: string, status: InvoiceStatus): Promise<Invoice> {
    const inv = await this.findOne(id);
    inv.status = status;
    await this.repo.save(inv);
    return this.findOne(id);
  }

  /**
   * Record payment (full or partial). Full: amount = remaining, marks Paid. Partial: creates "still pending" notification.
   */
  async pay(id: string, method?: string, amount?: number): Promise<Invoice> {
    const inv = await this.findOne(id);
    if (inv.status === InvoiceStatus.PAID) {
      throw new BadRequestException('Invoice is already paid.');
    }
    const total = Number(inv.amount ?? 0);
    const paidSoFar = Number(inv.paidAmount ?? 0);
    const due = total - paidSoFar;
    const payAmount = amount != null ? Math.min(Number(amount), due) : due;
    if (payAmount <= 0) return this.findOne(id);

    const paymentMethod = normalizePaymentMethod(method);
    const payment = this.paymentRepo.create({
      invoiceId: inv.id,
      amount: String(payAmount),
      method: paymentMethod,
    });
    await this.paymentRepo.save(payment);
    inv.paidAmount = String(paidSoFar + payAmount);
    if (Number(inv.paidAmount) >= total) inv.status = InvoiceStatus.PAID;
    await this.repo.save(inv);

    const remaining = total - Number(inv.paidAmount);
    if (remaining > 0) {
      const productNames = inv.salesOrder?.items?.map((i) => (i as { product?: { name?: string } }).product?.name).filter(Boolean) as string[] | undefined;
      await this.notificationsService.notifyDuePayment(inv.id, inv.invoiceNumber, remaining, productNames);
    }
    return this.findOne(id);
  }

  /** Summary of due amounts for dashboard. */
  async getDueSummary(): Promise<{ totalPending: number; unpaidCount: number }> {
    const list = await this.repo.find({ select: ['amount', 'paidAmount', 'status'] });
    let totalPending = 0;
    let unpaidCount = 0;
    for (const inv of list) {
      if (inv.status === InvoiceStatus.PAID) continue;
      const due = Number(inv.amount ?? 0) - Number(inv.paidAmount ?? 0);
      if (due > 0) {
        totalPending += due;
        unpaidCount += 1;
      }
    }
    return { totalPending, unpaidCount };
  }

  /** List recent payments (e.g. for dashboard). */
  async findRecentPayments(limit = 10): Promise<Payment[]> {
    return this.paymentRepo.find({
      relations: ['invoice'],
      order: { paidAt: 'DESC' },
      take: Math.min(limit, 50),
    });
  }

  /** Generate PDF buffer for invoice (same layout as on-screen). */
  async generatePdf(id: string): Promise<Buffer> {
    const inv = await this.findOne(id);
    const items = inv.salesOrder?.items ?? [];
    const subtotal = Number(inv.amount ?? 0);
    const gst = Math.round(subtotal * GST_RATE * 100) / 100;
    const total = subtotal + gst;
    const invDate = inv.createdAt
      ? new Date(inv.createdAt).toLocaleString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
      : '—';
    const billToAddress = inv.customer?.address?.trim() || '—';

    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const drawLine = () => {
        doc.moveDown(0.3).strokeColor('#999').lineWidth(0.5).moveTo(50, doc.y).lineTo(545, doc.y).stroke().moveDown(0.3).strokeColor('#000');
      };

      doc.fontSize(18).font('Helvetica-Bold').text(COMPANY_NAME, { align: 'center' });
      doc.moveDown(0.2).fontSize(10).font('Helvetica').text(COMPANY_ADDRESS, { align: 'center' });
      doc.moveDown(0.6);
      drawLine();
      doc.fontSize(10).font('Helvetica').text(`Invoice #: ${inv.invoiceNumber ?? inv.id}`).moveDown(0.2).text(`Date: ${invDate}`).moveDown(0.6);
      doc.font('Helvetica-Bold').text('Bill To:').moveDown(0.2);
      doc.font('Helvetica').text(inv.customer?.name ?? '—').moveDown(0.1).text(billToAddress).moveDown(0.5);
      drawLine();
      const col = { product: 50, sku: 50, qty: 50, price: 500, total: 50 };
      doc.font('Helvetica-Bold').text('Product', col.product, doc.y).text('SKU', col.sku, doc.y).text('Qty', col.qty, doc.y).text('Price', col.price, doc.y).text('Total', col.total, doc.y).moveDown(0.3);
      drawLine();
      for (const item of items) {
        const qty = Number(item.quantity) || 0;
        const price = Number(item.unitPrice) || 0;
        const rowTotal = qty * price;
        doc.font('Helvetica').text(String((item.product?.name ?? '—').slice(0, 20)), col.product, doc.y).text(item.product?.sku ?? '—', col.sku, doc.y).text(String(qty), col.qty, doc.y).text(String(price), col.price, doc.y).text(String(rowTotal), col.total, doc.y).moveDown(0.35);
      }
      drawLine();
      doc.text('Subtotal:', col.product, doc.y).text(String(subtotal), col.total, doc.y, { width: 90, align: 'right' }).moveDown(0.25);
      doc.text('GST (18%):', col.product, doc.y).text(String(gst), col.total, doc.y, { width: 90, align: 'right' }).moveDown(0.5);
      drawLine();
      doc.font('Helvetica-Bold').text('Total:', col.product, doc.y).text(String(total), col.total, doc.y, { width: 90, align: 'right' }).moveDown(0.5);
      doc.font('Helvetica').text(`Payment Status: ${inv.status}`).moveDown(0.5);
      drawLine();
      doc.moveDown(0.5).fontSize(9).text('Thank you for your business!', { align: 'center' });
      doc.end();
    });
  }
}
