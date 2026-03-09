import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../entities/product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly repo: Repository<Product>,
  ) {}

  async findAll(categoryId?: string): Promise<Product[]> {
    const qb = this.repo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.category', 'c')
      .orderBy('p.name', 'ASC');
    if (categoryId) qb.andWhere('p.categoryId = :categoryId', { categoryId });
    return qb.getMany();
  }

  async findOne(id: string): Promise<Product> {
    const p = await this.repo.findOne({
      where: { id },
      relations: ['category', 'variants'],
    });
    if (!p) throw new NotFoundException('Product not found');
    return p;
  }

  async create(dto: Partial<Product>): Promise<Product> {
    const p = this.repo.create(dto);
    return this.repo.save(p);
  }

  async update(id: string, dto: Partial<Product>): Promise<Product> {
    const p = await this.findOne(id);
    Object.assign(p, dto);
    return this.repo.save(p);
  }

  async remove(id: string): Promise<void> {
    const p = await this.findOne(id);
    await this.repo.remove(p);
  }
}
