import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NOTIFICATION_TYPE_LOW_STOCK, NOTIFICATION_TYPE_DUE_PAYMENT } from './entities/notification.entity';
import { NotificationsGateway } from './notifications.gateway';
import { Product } from '../product-management/entities/product.entity';
import { Invoice, InvoiceStatus } from '../invoices/entities/invoice.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly repo: Repository<Notification>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(Invoice)
    private readonly invoiceRepo: Repository<Invoice>,
    private readonly gateway: NotificationsGateway,
  ) {}

  /** If product stock is below threshold: create notification and emit once; clear flag when restocked. */
  async notifyIfLowStock(product: Product): Promise<void> {
    const threshold = product.minStockLevel ?? product.reorderPoint ?? 0;
    const stockLevel = product.stockLevel ?? 0;

    if (threshold <= 0) return;

    if (stockLevel > threshold) {
      if (product.lowStockAlertSent) {
        product.lowStockAlertSent = false;
        await this.productRepo.save(product);
      }
      return;
    }

    if (product.lowStockAlertSent) return;

    const message = `Low stock: ${product.name} (${product.sku}). Current: ${stockLevel}, threshold: ${threshold}`;
    const notification = this.repo.create({
      type: NOTIFICATION_TYPE_LOW_STOCK,
      productId: product.id,
      message,
      read: false,
    });
    await this.repo.save(notification);

    product.lowStockAlertSent = true;
    await this.productRepo.save(product);

    this.gateway.emitStockAlert({
      productId: product.id,
      productName: product.name,
      sku: product.sku ?? '',
      stockLevel,
      reorderPoint: threshold,
      message,
    });
  }

  /** Ensure every currently low-stock product has a notification (so bell shows all low-stock items). */
  private async ensureLowStockNotifications(): Promise<void> {
    const products = await this.productRepo.find();
    for (const product of products) {
      const threshold = product.minStockLevel ?? product.reorderPoint ?? 0;
      const stockLevel = product.stockLevel ?? 0;
      if (threshold <= 0 || stockLevel > threshold) continue;

      const existing = await this.repo.findOne({
        where: { productId: product.id },
      });
      if (existing) continue;

      const message = `Low stock: ${product.name} (${product.sku}). Current: ${stockLevel}, threshold: ${threshold}`;
      const notification = this.repo.create({
        type: NOTIFICATION_TYPE_LOW_STOCK,
        productId: product.id,
        message,
        read: false,
      });
      await this.repo.save(notification);
    }
  }

  /** Create a due-payment notification (no socket). Uses product names when provided, else invoice number. */
  async notifyDuePayment(
    invoiceId: string,
    invoiceNumber: string | null,
    pendingAmount: number,
    productNames?: string[],
  ): Promise<void> {
    if (pendingAmount <= 0) return;
    const names = productNames?.filter(Boolean).length ? productNames!.filter(Boolean).join(', ') : null;
    const msg = names
      ? `Payment pending for ${names} - ₹${pendingAmount.toLocaleString('en-IN')}`
      : `Invoice #${invoiceNumber ?? invoiceId.slice(0, 8)} has ₹${pendingAmount.toLocaleString('en-IN')} pending`;
    const notification = this.repo.create({
      type: NOTIFICATION_TYPE_DUE_PAYMENT,
      productId: null,
      invoiceId,
      message: msg,
      read: false,
    });
    await this.repo.save(notification);
  }

  /** Ensure every invoice with due amount has a notification. */
  private async ensureDuePaymentNotifications(): Promise<void> {
    const invoices = await this.invoiceRepo.find({
      relations: ['salesOrder', 'salesOrder.items', 'salesOrder.items.product'],
      where: {},
    });
    for (const inv of invoices) {
      if (inv.status === InvoiceStatus.PAID) continue;
      const total = Number(inv.amount ?? 0);
      const paid = Number(inv.paidAmount ?? 0);
      const pending = total - paid;
      if (pending <= 0) continue;
      const existing = await this.repo.findOne({ where: { invoiceId: inv.id } });
      if (existing) continue;
      const productNames = (inv.salesOrder as { items?: { product?: { name?: string } }[] })?.items
        ?.map((i) => i.product?.name)
        .filter(Boolean) as string[] | undefined;
      await this.notifyDuePayment(inv.id, inv.invoiceNumber, pending, productNames);
    }
  }

  async findAll(unreadOnly = false): Promise<Notification[]> {
    await this.ensureLowStockNotifications();
    await this.ensureDuePaymentNotifications();
    const qb = this.repo.createQueryBuilder('n').orderBy('n.createdAt', 'DESC');
    if (unreadOnly) qb.andWhere('n.read = :read', { read: false });
    return qb.getMany();
  }

  async markAsRead(id: string): Promise<Notification> {
    const n = await this.repo.findOne({ where: { id } });
    if (n) {
      n.read = true;
      await this.repo.save(n);
    }
    return n!;
  }
}
