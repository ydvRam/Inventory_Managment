import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Category } from '../entities/category.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly repo: Repository<Category>,
  ) {}

  /** Returns all categories (for dropdowns, e.g. product form). */
  async findAll(): Promise<Category[]> {
    return this.repo.find({
      order: { name: 'ASC' },
    });
  }

  /** Returns only root categories (parentId null) for tree views. */
  async findRoots(): Promise<Category[]> {
    return this.repo.find({
      relations: ['children'],
      where: { parentId: IsNull() },
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Category> {
    const c = await this.repo.findOne({
      where: { id },
      relations: ['parent', 'children'],
    });
    if (!c) throw new NotFoundException('Category not found');
    return c;
  }

  async create(dto: { name: string; parentId?: string | null }): Promise<Category> {
    const c = this.repo.create(dto);
    return this.repo.save(c);
  }

  async update(id: string, dto: { name?: string; parentId?: string | null }): Promise<Category> {
    const c = await this.findOne(id);
    if (dto.name != null) c.name = dto.name;
    if (dto.parentId !== undefined) c.parentId = dto.parentId;
    return this.repo.save(c);
  }

  async remove(id: string): Promise<void> {
    const c = await this.findOne(id);
    await this.repo.remove(c);
  }
}
