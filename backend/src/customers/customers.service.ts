import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from './entities/customer.entity';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private readonly repo: Repository<Customer>,
  ) {}

  async findAll(): Promise<Customer[]> {
    return this.repo.find({ order: { name: 'ASC' } });
  }

  async findOne(id: string): Promise<Customer> {
    const c = await this.repo.findOne({ where: { id } });
    if (!c) throw new NotFoundException('Customer not found');
    return c;
  }

  async create(dto: Partial<Customer>): Promise<Customer> {
    const c = this.repo.create(dto);
    return this.repo.save(c);
  }

  async update(id: string, dto: Partial<Customer>): Promise<Customer> {
    const c = await this.findOne(id);
    Object.assign(c, dto);
    return this.repo.save(c);
  }

  async remove(id: string): Promise<void> {
    const c = await this.findOne(id);
    await this.repo.remove(c);
  }
}
