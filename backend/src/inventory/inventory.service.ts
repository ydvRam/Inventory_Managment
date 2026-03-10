import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inventory } from './entities/inventory.entity';
import { Product } from '../product-management/entities/product.entity';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Inventory)
    private readonly repo: Repository<Inventory>,
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
  async addQuantity(productId: string, quantity: number): Promise<Inventory> {
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
    return inv;
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
}
