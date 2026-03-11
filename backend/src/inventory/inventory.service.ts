import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inventory } from './entities/inventory.entity';
import { InventoryMovement, MovementType } from './entities/inventory-movement.entity';
import { Product } from '../product-management/entities/product.entity';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Inventory)
    private readonly repo: Repository<Inventory>,
    @InjectRepository(InventoryMovement)
    private readonly movementRepo: Repository<InventoryMovement>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  async findAll(): Promise<Inventory[]> {
    return this.repo.find({
      relations: ['product'],
      order: { productId: 'ASC' },
    });
  }

  async findByProductId(productId: string): Promise<Inventory | null> {
    return this.repo.findOne({
      where: { productId },
      relations: ['product'],
    });
  }

  /** Add quantity to inventory for a product (creates row if not exists). Also updates product.stockLevel. */
  async addQuantity(
    productId: string,
    quantity: number,
    movementRef?: { type: MovementType; referenceType: string; referenceId: string },
  ): Promise<Inventory> {
    let inv = await this.repo.findOne({ where: { productId } });
    if (!inv) {
      inv = this.repo.create({ productId, quantity: 0 });
      inv = await this.repo.save(inv);
    }
    inv.quantity = Number(inv.quantity) + quantity;
    inv = await this.repo.save(inv);

    const product = await this.productRepo.findOne({ where: { id: productId } });
    if (product) {
      product.stockLevel = (product.stockLevel ?? 0) + quantity;
      await this.productRepo.save(product);
    }
    if (movementRef) {
      await this.logMovement(
        productId,
        quantity,
        movementRef.type,
        movementRef.referenceType,
        movementRef.referenceId,
      );
    }
    return inv;
  }

  /** Deduct quantity (e.g. on sale). Throws if insufficient stock. */
  async reduceQuantity(
    productId: string,
    quantity: number,
    movementRef?: { type: MovementType; referenceType: string; referenceId: string },
  ): Promise<Inventory> {
    let inv = await this.repo.findOne({ where: { productId } });
    const current = inv ? Number(inv.quantity) : 0;
    if (current < quantity)
      throw new BadRequestException(`Insufficient stock for product. Available: ${current}`);
    if (!inv) {
      inv = this.repo.create({ productId, quantity: 0 });
      inv = await this.repo.save(inv);
    }
    inv.quantity = current - quantity;
    await this.repo.save(inv);
    const product = await this.productRepo.findOne({ where: { id: productId } });
    if (product) {
      product.stockLevel = Math.max(0, (product.stockLevel ?? 0) - quantity);
      await this.productRepo.save(product);
    }
    if (movementRef) {
      await this.logMovement(
        productId,
        -quantity,
        movementRef.type,
        movementRef.referenceType,
        movementRef.referenceId,
      );
    }
    return inv;
  }

  async logMovement(
    productId: string,
    quantityDelta: number,
    type: MovementType,
    referenceType: string | null,
    referenceId: string | null,
  ): Promise<InventoryMovement> {
    const m = this.movementRepo.create({
      productId,
      quantityDelta,
      type,
      referenceType,
      referenceId,
    });
    return this.movementRepo.save(m);
  }

  async findMovements(productId?: string, limit = 100): Promise<InventoryMovement[]> {
    const qb = this.movementRepo
      .createQueryBuilder('m')
      .leftJoinAndSelect('m.product', 'p')
      .orderBy('m.createdAt', 'DESC')
      .take(limit);
    if (productId) qb.andWhere('m.productId = :productId', { productId });
    return qb.getMany();
  }

  /** Set quantity (for adjustments). Updates product.stockLevel to match. */
  async setQuantity(productId: string, quantity: number): Promise<Inventory> {
    let inv = await this.repo.findOne({ where: { productId } });
    if (!inv) {
      inv = this.repo.create({ productId, quantity });
      return this.repo.save(inv);
    }
    inv.quantity = quantity;
    inv = await this.repo.save(inv);
    const product = await this.productRepo.findOne({ where: { id: productId } });
    if (product) {
      product.stockLevel = quantity;
      await this.productRepo.save(product);
    }
    return inv;
  }

  async findOne(id: string): Promise<Inventory> {
    const inv = await this.repo.findOne({
      where: { id },
      relations: ['product'],
    });
    if (!inv) throw new NotFoundException('Inventory record not found');
    return inv;
  }

  async updateExpiry(productId: string, expiryDate: Date | null): Promise<Inventory> {
    let inv = await this.repo.findOne({ where: { productId } });
    if (!inv) {
      inv = this.repo.create({ productId, quantity: 0, expiryDate });
      return this.repo.save(inv);
    }
    inv.expiryDate = expiryDate;
    return this.repo.save(inv);
  }
}
