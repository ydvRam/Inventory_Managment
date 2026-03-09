import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from './entities/permission.entity';
import { CreatePermissionDto } from './dto/create-permission.dto';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}

  async findAll(): Promise<Permission[]> {
    return this.permissionRepository.find({
      order: { module: 'ASC', code: 'ASC' },
    });
  }

  async findByModule(module: string): Promise<Permission[]> {
    return this.permissionRepository.find({
      where: { module },
      order: { code: 'ASC' },
    });
  }

  async findById(id: string): Promise<Permission | null> {
    return this.permissionRepository.findOne({ where: { id } });
  }

  async findByCode(code: string): Promise<Permission | null> {
    return this.permissionRepository.findOne({ where: { code } });
  }

  async create(dto: CreatePermissionDto): Promise<Permission> {
    const permission = this.permissionRepository.create(dto);
    return this.permissionRepository.save(permission);
  }

  async seedDefaultPermissions(): Promise<Permission[]> {
    const defaults = [
      { code: 'users:read', module: 'users', description: 'View users' },
      { code: 'users:write', module: 'users', description: 'Create/update users' },
      { code: 'users:delete', module: 'users', description: 'Delete users' },
      { code: 'roles:read', module: 'roles', description: 'View roles' },
      { code: 'roles:write', module: 'roles', description: 'Create/update roles' },
      { code: 'roles:delete', module: 'roles', description: 'Delete roles' },
      { code: 'permissions:read', module: 'permissions', description: 'View permissions' },
      { code: 'permissions:write', module: 'permissions', description: 'Manage permissions' },
      { code: 'audit:read', module: 'audit', description: 'View audit logs' },
      { code: 'products:read', module: 'products', description: 'View products' },
      { code: 'products:write', module: 'products', description: 'Create/update products' },
      { code: 'inventory:read', module: 'inventory', description: 'View inventory' },
      { code: 'inventory:write', module: 'inventory', description: 'Update inventory' },
      { code: 'orders:read', module: 'orders', description: 'View orders' },
      { code: 'orders:write', module: 'orders', description: 'Create/update orders' },
      { code: 'reports:read', module: 'reports', description: 'View reports' },
    ];
    const created: Permission[] = [];
    for (const dto of defaults) {
      const existing = await this.findByCode(dto.code);
      if (!existing) {
        const permission = await this.create(dto);
        created.push(permission);
      }
    }
    return created;
  }
}
