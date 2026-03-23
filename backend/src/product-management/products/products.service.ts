import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../entities/product.entity';
import { NotificationsService } from '../../notifications/notifications.service';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly repo: Repository<Product>,
    private readonly notificationsService: NotificationsService,
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
    const saved = await this.repo.save(p);
    try {
      await this.notificationsService.notifyIfLowStock(saved);
    } catch (err) {
      console.error('notifyIfLowStock failed:', err);
    }
    return saved;
  }

  async update(id: string, dto: Partial<Product>): Promise<Product> {
    const p = await this.findOne(id);
    Object.assign(p, dto);
    const saved = await this.repo.save(p);
    try {
      await this.notificationsService.notifyIfLowStock(saved);
    } catch (err) {
      console.error('notifyIfLowStock failed:', err);
    }
    return saved;
  }

  async remove(id: string): Promise<void> {
    const p = await this.findOne(id);
    await this.repo.softRemove(p);
  }
}
