import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SalesOrder, SalesOrderStatus } from './entities/sales-order.entity';
import { SalesOrderItem } from './entities/sales-order-item.entity';
import { InventoryService } from '../inventory/inventory.service';
import { MovementType } from '../inventory/entities/inventory-movement.entity';

export interface CreateSalesOrderDto {
  customerId: string;
  items: { productId: string; quantity: number; unitPrice: string }[];
}

@Injectable()
export class SalesOrdersService {
  constructor(
    @InjectRepository(SalesOrder)
    private readonly repo: Repository<SalesOrder>,
    @InjectRepository(SalesOrderItem)
    private readonly itemRepo: Repository<SalesOrderItem>,
    private readonly inventoryService: InventoryService,
  ) {}

  async findAll(): Promise<SalesOrder[]> {
    return this.repo.find({
      relations: ['customer', 'items', 'items.product'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<SalesOrder> {
    const so = await this.repo.findOne({
      where: { id },
      relations: ['customer', 'items', 'items.product'],
    });
    if (!so) throw new NotFoundException('Sales order not found');
    return so;
  }

  async create(dto: CreateSalesOrderDto): Promise<SalesOrder> {
    if (!dto.items?.length)
      throw new BadRequestException('At least one item is required');
    const total = dto.items.reduce(
      (sum, i) => sum + Number(i.unitPrice) * i.quantity,
      0,
    );
    const so = this.repo.create({
      customerId: dto.customerId,
      totalAmount: String(total.toFixed(2)),
      status: SalesOrderStatus.PENDING,
    });
    const saved = await this.repo.save(so);
    const items = dto.items.map((i) =>
      this.itemRepo.create({
        salesOrderId: saved.id,
        productId: i.productId,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
      }),
    );
    await this.itemRepo.save(items);
    return this.findOne(saved.id);
  }

  async updateStatus(id: string, status: SalesOrderStatus): Promise<SalesOrder> {
    const so = await this.findOne(id);
    so.status = status;
    await this.repo.save(so);
    return this.findOne(id);
  }

  /** Fulfill order: deduct inventory for each item and log movements. Sets status to Confirmed. */
  async fulfill(id: string): Promise<SalesOrder> {
    const so = await this.findOne(id);
    if (so.status !== SalesOrderStatus.PENDING)
      throw new BadRequestException('Only pending orders can be fulfilled');
    for (const item of so.items) {
      await this.inventoryService.reduceQuantity(
        item.productId,
        item.quantity,
        {
          type: MovementType.SALE,
          referenceType: 'sales_order',
          referenceId: so.id,
        },
      );
    }
    so.status = SalesOrderStatus.CONFIRMED;
    await this.repo.save(so);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const so = await this.findOne(id);
    if (so.status !== SalesOrderStatus.PENDING && so.status !== SalesOrderStatus.CANCELLED)
      throw new BadRequestException('Cannot delete order that has been fulfilled');
    await this.repo.remove(so);
  }
}
