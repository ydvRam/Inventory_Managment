import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice, InvoiceStatus } from './entities/invoice.entity';
import { SalesOrder } from '../sales-orders/entities/sales-order.entity';

@Injectable()
export class InvoicesService {
  constructor(
    @InjectRepository(Invoice)
    private readonly repo: Repository<Invoice>,
    @InjectRepository(SalesOrder)
    private readonly salesOrderRepo: Repository<SalesOrder>,
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
      status: InvoiceStatus.UNPAID,
      invoiceNumber,
    });
    return this.repo.save(invoice).then((saved) =>
      this.repo.findOne({
        where: { id: saved.id },
        relations: ['salesOrder', 'customer'],
      }) as Promise<Invoice>,
    );
  }

  async updateStatus(id: string, status: InvoiceStatus): Promise<Invoice> {
    const inv = await this.findOne(id);
    inv.status = status;
    await this.repo.save(inv);
    return this.findOne(id);
  }
}
