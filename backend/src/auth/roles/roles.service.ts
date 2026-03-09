import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { Permission } from '../permissions/entities/permission.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) { }

  async findAll(): Promise<Role[]> {
    return this.roleRepository.find({
      relations: ['permissions'],
      order: { name: 'ASC' },
    });
  }

  async findById(id: string): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { id },
      relations: ['permissions'],
    });
    if (!role) throw new NotFoundException(`Role with id ${id} not found`);
    return role;
  }

  async findByName(name: string): Promise<Role | null> {
    return this.roleRepository.findOne({
      where: { name },
      relations: ['permissions'],
    });
  }

  async create(dto: CreateRoleDto): Promise<Role> {
    const existing = await this.findByName(dto.name);
    if (existing) {
      throw new ConflictException(`Role with name "${dto.name}" already exists`);
    }
    const role = this.roleRepository.create({
      name: dto.name,
      description: dto.description,
    });
    const permissionIds = Array.isArray(dto.permissionIds)
      ? dto.permissionIds
      : [];
    if (permissionIds.length > 0) {
      role.permissions = await this.permissionRepository.findBy({
        id: In(permissionIds),
      });
    } else {
      role.permissions = [];
    }
    return this.roleRepository.save(role);
  }

  async update(id: string, dto: UpdateRoleDto): Promise<Role> {
    const role = await this.findById(id);
    if (dto.name !== undefined) role.name = dto.name;
    if (dto.description !== undefined) role.description = dto.description;
    if (dto.permissionIds !== undefined) {
      role.permissions = dto.permissionIds.length
        ? await this.permissionRepository.findBy({ id: In(dto.permissionIds) })
        : [];
    }
    return this.roleRepository.save(role);
  }

  async remove(id: string): Promise<void> {
    const role = await this.findById(id);
    await this.roleRepository.remove(role);
  }

  async assignPermissions(roleId: string, permissionIds: string[]): Promise<Role> {
    const role = await this.findById(roleId);
    role.permissions = permissionIds.length
      ? await this.permissionRepository.findBy({ id: In(permissionIds) })
      : [];
    return this.roleRepository.save(role);
  }
}
