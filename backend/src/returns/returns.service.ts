import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReturnRequest, ReturnStatus } from './entities/return-request.entity';
import { SalesOrder } from '../sales-orders/entities/sales-order.entity';
import { InventoryService } from '../inventory/inventory.service';
import { MovementType } from '../inventory/entities/inventory-movement.entity';
import { InvoicesService } from '../invoices/invoices.service';
import { InvoiceStatus } from '../invoices/entities/invoice.entity';

export interface CreateReturnDto {
  salesOrderId: string;
  productId: string;
  quantity: number;
  reason?: string;
}

@Injectable()
export class ReturnsService {
  constructor(
    @InjectRepository(ReturnRequest)
    private readonly repo: Repository<ReturnRequest>,
    @InjectRepository(SalesOrder)
    private readonly salesOrderRepo: Repository<SalesOrder>,
    private readonly inventoryService: InventoryService,
    private readonly invoicesService: InvoicesService,
  ) {}

  async findAll(status?: ReturnStatus): Promise<ReturnRequest[]> {
    const where = status ? { status } : {};
    return this.repo.find({
      where,
      relations: ['salesOrder', 'salesOrder.customer', 'product'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<ReturnRequest> {
    const r = await this.repo.findOne({
      where: { id },
      relations: ['salesOrder', 'salesOrder.customer', 'salesOrder.items', 'product'],
    });
    if (!r) throw new NotFoundException('Return request not found');
    return r;
  }

  async findBySalesOrderId(salesOrderId: string): Promise<ReturnRequest[]> {
    return this.repo.find({
      where: { salesOrderId },
      relations: ['product'],
      order: { createdAt: 'DESC' },
    });
  }

  async create(dto: CreateReturnDto): Promise<ReturnRequest> {
    const so = await this.salesOrderRepo.findOne({
      where: { id: dto.salesOrderId },
      relations: ['items', 'items.product'],
    });
    if (!so) throw new NotFoundException('Sales order not found');

    const item = so.items?.find((i) => i.productId === dto.productId);
    if (!item) throw new BadRequestException('Product not in this order');

    const qty = Number(dto.quantity) || 0;
    if (qty < 1) throw new BadRequestException('Quantity must be at least 1');
    if (qty > item.quantity)
      throw new BadRequestException(`Cannot return more than ordered (max ${item.quantity})`);

    const alreadyReturned = await this.repo
      .createQueryBuilder('r')
      .where('r.salesOrderId = :salesOrderId', { salesOrderId: dto.salesOrderId })
      .andWhere('r.productId = :productId', { productId: dto.productId })
      .andWhere('r.status = :status', { status: ReturnStatus.APPROVED })
      .select('COALESCE(SUM(r.quantity), 0)', 'sum')
      .getRawOne<{ sum: string }>();
    const returnedSoFar = Number(alreadyReturned?.sum ?? 0);
    if (returnedSoFar + qty > item.quantity)
      throw new BadRequestException(
        `Already returned ${returnedSoFar} of this product. Max return for this item: ${item.quantity - returnedSoFar}`,
      );

    const req = this.repo.create({
      salesOrderId: dto.salesOrderId,
      productId: dto.productId,
      quantity: qty,
      reason: dto.reason?.trim() || null,
      status: ReturnStatus.PENDING,
    });
    return this.repo.save(req).then((saved) => this.findOne(saved.id));
  }

  async approve(id: string): Promise<ReturnRequest> {
    const req = await this.findOne(id);
    if (req.status !== ReturnStatus.PENDING)
      throw new BadRequestException('Only PENDING returns can be approved');

    req.status = ReturnStatus.APPROVED;
    await this.repo.save(req);

    const invoice = await this.invoicesService.findBySalesOrderId(req.salesOrderId);
    if (invoice && invoice.status === InvoiceStatus.PAID) {
      await this.invoicesService.updateStatus(invoice.id, InvoiceStatus.REFUNDED);
    }

    await this.inventoryService.addQuantity(
      req.productId,
      req.quantity,
      { type: MovementType.RETURN, referenceType: 'RETURN_REQUEST', referenceId: req.id },
    );

    return this.findOne(id);
  }

  async reject(id: string): Promise<ReturnRequest> {
    const req = await this.findOne(id);
    if (req.status !== ReturnStatus.PENDING)
      throw new BadRequestException('Only PENDING returns can be rejected');

    req.status = ReturnStatus.REJECTED;
    await this.repo.save(req);
    return this.findOne(id);
  }
}
