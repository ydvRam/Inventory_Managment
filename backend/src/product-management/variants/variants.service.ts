import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductVariant } from '../entities/product-variant.entity';

@Injectable()
export class VariantsService {
  constructor(
    @InjectRepository(ProductVariant)
    private readonly repo: Repository<ProductVariant>,
  ) {}

  async findByProduct(productId: string): Promise<ProductVariant[]> {
    return this.repo.find({
      where: { productId },
      order: { sku: 'ASC' },
    });
  }

  async findOne(id: string): Promise<ProductVariant> {
    const v = await this.repo.findOne({ where: { id }, relations: ['product'] });
    if (!v) throw new NotFoundException('Variant not found');
    return v;
  }

  async create(dto: Partial<ProductVariant>): Promise<ProductVariant> {
    const v = this.repo.create(dto);
    return this.repo.save(v);
  }

  async update(id: string, dto: Partial<ProductVariant>): Promise<ProductVariant> {
    const v = await this.findOne(id);
    Object.assign(v, dto);
    return this.repo.save(v);
  }

  async remove(id: string): Promise<void> {
    const v = await this.findOne(id);
    await this.repo.remove(v);
  }
}
