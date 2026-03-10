import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PurchaseOrder, PurchaseOrderStatus, PaymentStatus } from './entities/purchase-order.entity';
import { PurchaseOrderItem } from './entities/purchase-order-item.entity';
import { InventoryService } from '../inventory/inventory.service';

export interface CreatePurchaseOrderDto {
  supplierId: string;
  items: { productId: string; quantity: number; unitPrice: string }[];
}

export interface UpdatePurchaseOrderDto {
  status?: PurchaseOrderStatus;
  paymentStatus?: PaymentStatus;
}

@Injectable()
export class PurchaseOrdersService {
  constructor(
    @InjectRepository(PurchaseOrder)
    private readonly poRepo: Repository<PurchaseOrder>,
    @InjectRepository(PurchaseOrderItem)
    private readonly itemRepo: Repository<PurchaseOrderItem>,
    private readonly inventoryService: InventoryService,
  ) {}

  async findAll(): Promise<PurchaseOrder[]> {
    return this.poRepo.find({
      relations: ['supplier', 'items', 'items.product'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<PurchaseOrder> {
    const po = await this.poRepo.findOne({
      where: { id },
      relations: ['supplier', 'items', 'items.product'],
    });
    if (!po) throw new NotFoundException('Purchase order not found');
    return po;
  }

  async create(dto: CreatePurchaseOrderDto): Promise<PurchaseOrder> {
    if (!dto.items?.length)
      throw new BadRequestException('At least one item is required');
    const total = dto.items.reduce(
      (sum, i) => sum + Number(i.unitPrice) * i.quantity,
      0,
    );
    const po = this.poRepo.create({
      supplierId: dto.supplierId,
      totalPrice: String(total.toFixed(2)),
      status: PurchaseOrderStatus.PENDING,
    });
    const saved = await this.poRepo.save(po);
    const items = dto.items.map((i) =>
      this.itemRepo.create({
        purchaseOrderId: saved.id,
        productId: i.productId,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
      }),
    );
    await this.itemRepo.save(items);
    return this.findOne(saved.id);
  }

  async update(id: string, dto: UpdatePurchaseOrderDto): Promise<PurchaseOrder> {
    const po = await this.findOne(id);
    if (dto.status != null) po.status = dto.status;
    if (dto.paymentStatus != null) po.paymentStatus = dto.paymentStatus;
    await this.poRepo.save(po);
    return this.findOne(id);
  }

  /** Receive order: set status to Received and add each item's quantity to inventory. */
  async receiveOrder(id: string): Promise<PurchaseOrder> {
    const po = await this.findOne(id);
    if (po.status === PurchaseOrderStatus.RECEIVED)
      throw new BadRequestException('Order already received');
    if (po.status === PurchaseOrderStatus.CANCELLED)
      throw new BadRequestException('Cannot receive a cancelled order');
    for (const item of po.items) {
      await this.inventoryService.addQuantity(
        item.productId,
        item.quantity,
      );
    }
    po.status = PurchaseOrderStatus.RECEIVED;
    await this.poRepo.save(po);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const po = await this.findOne(id);
    if (po.status === PurchaseOrderStatus.RECEIVED)
      throw new BadRequestException('Cannot delete a received order');
    await this.poRepo.remove(po);
  }
}
