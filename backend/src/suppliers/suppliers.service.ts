import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Supplier } from './entities/supplier.entity';

@Injectable()
export class SuppliersService {
  constructor(
    @InjectRepository(Supplier)
    private readonly repo: Repository<Supplier>,
  ) {}

  async findAll(): Promise<Supplier[]> {
    return this.repo.find({ order: { name: 'ASC' } });
  }

  async findOne(id: string): Promise<Supplier> {
    const s = await this.repo.findOne({ where: { id } });
    if (!s) throw new NotFoundException('Supplier not found');
    return s;
  }

  async create(dto: Partial<Supplier>): Promise<Supplier> {
    const s = this.repo.create(dto);
    return this.repo.save(s);
  }

  async update(id: string, dto: Partial<Supplier>): Promise<Supplier> {
    const s = await this.findOne(id);
    Object.assign(s, dto);
    return this.repo.save(s);
  }

  async remove(id: string): Promise<void> {
    const s = await this.findOne(id);
    await this.repo.remove(s);
  }
}
