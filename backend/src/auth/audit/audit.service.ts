import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  async create(dto: CreateAuditLogDto): Promise<AuditLog> {
    const log = this.auditLogRepository.create(dto);
    return this.auditLogRepository.save(log);
  }

  async log(
    action: string,
    resource: string,
    resourceId: string | null,
    oldData: Record<string, unknown> | null,
    newData: Record<string, unknown> | null,
    userId?: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<AuditLog> {
    return this.create({
      userId,
      action,
      resource,
      resourceId: resourceId ?? undefined,
      oldData: oldData ?? undefined,
      newData: newData ?? undefined,
      ipAddress,
      userAgent,
    });
  }

  async findAll(
    page = 1,
    limit = 50,
    userId?: string,
    resource?: string,
    action?: string,
    from?: string,
    to?: string,
  ): Promise<{ data: AuditLog[]; total: number; page: number; totalPages: number }> {
    const skip = (page - 1) * limit;
    const qb = this.auditLogRepository
      .createQueryBuilder('audit')
      .leftJoinAndSelect('audit.user', 'user')
      .orderBy('audit.createdAt', 'DESC');

    if (userId) qb.andWhere('audit.userId = :userId', { userId });
    if (resource) qb.andWhere('audit.resource = :resource', { resource });
    if (action) qb.andWhere('audit.action = :action', { action });
    if (from) qb.andWhere('audit.createdAt >= :from', { from });
    if (to) qb.andWhere('audit.createdAt <= :to', { to });

    const [data, total] = await qb.skip(skip).take(limit).getManyAndCount();
    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: string): Promise<AuditLog> {
    const log = await this.auditLogRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!log) throw new NotFoundException(`Audit log with id ${id} not found`);
    return log;
  }

  async findByResource(
    resource: string,
    resourceId: string,
    limit = 50,
  ): Promise<AuditLog[]> {
    return this.auditLogRepository.find({
      where: { resource, resourceId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }
}
