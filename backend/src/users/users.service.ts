import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { Role } from '../auth/roles/entities/role.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

const SALT_ROUNDS = 10;

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) { }

  async findAll(): Promise<User[]> {
    return this.userRepository.find({
      relations: ['roles', 'roles.permissions'],
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['roles', 'roles.permissions'],
    });
    if (!user) throw new NotFoundException(`User with id ${id} not found`);
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email: email.toLowerCase() },
      relations: ['roles', 'roles.permissions'],
    });
  }

  /** For auth: validate credentials and return user with roles (no password). */
  async validateUser(
    email: string,
    password: string,
  ): Promise<{ id: string; email: string; name: string; roles: Role[] } | null> {
    const userWithPassword = await this.userRepository
      .createQueryBuilder('user')
      .where('user.email = :email', { email: email.toLowerCase() })
      .addSelect('user.passwordHash')
      .getOne();
    if (!userWithPassword || !userWithPassword.isActive) return null;
    const hash = (userWithPassword as User & { passwordHash?: string }).passwordHash;
    if (!hash) return null;
    const ok = await bcrypt.compare(password, hash);
    if (!ok) return null;
    const user = await this.findById(userWithPassword.id);
    return { id: user.id, email: user.email, name: user.name, roles: user.roles };
  }

  async create(dto: CreateUserDto): Promise<User> {
    const existing = await this.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException(`User with email ${dto.email} already exists`);
    }
    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);
    const user = this.userRepository.create({
      email: dto.email.toLowerCase(),
      passwordHash,
      name: dto.name,
      isActive: dto.isActive ?? true,
    });
    if (dto.roleIds?.length) {
      user.roles = await this.roleRepository.findBy({
        id: In(dto.roleIds),
      });
    } else if (dto.roleNames?.length) {
      const roles: Role[] = [];
      for (const name of dto.roleNames) {
        const n = String(name).trim().toLowerCase();
        if (!n) continue;
        let role = await this.roleRepository.findOne({ where: { name: n } });
        if (!role) {
          role = this.roleRepository.create({ name: n });
          role = await this.roleRepository.save(role);
        }
        roles.push(role);
      }
      user.roles = roles;
    } else {
      user.roles = [];
    }
    const saved = await this.userRepository.save(user);
    return this.findById(saved.id);
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);
    if (dto.email !== undefined) {
      const existing = await this.findByEmail(dto.email);
      if (existing && existing.id !== id) {
        throw new ConflictException(`User with email ${dto.email} already exists`);
      }
      user.email = dto.email.toLowerCase();
    }
    if (dto.password !== undefined && dto.password.length > 0) {
      user.passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);
    }
    if (dto.name !== undefined) user.name = dto.name;
    if (dto.isActive !== undefined) user.isActive = dto.isActive;
    if (dto.roleIds !== undefined) {
      user.roles = dto.roleIds.length
        ? await this.roleRepository.findBy({ id: In(dto.roleIds) })
        : [];
    }
    await this.userRepository.save(user);
    return this.findById(id);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findById(id);
    await this.userRepository.remove(user);
  }

  async assignRoles(userId: string, roleIds: string[]): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['roles'],
    });
    if (!user) throw new NotFoundException(`User with id ${userId} not found`);
    user.roles = roleIds.length
      ? await this.roleRepository.findBy({ id: In(roleIds) })
      : [];
    await this.userRepository.save(user);
    return this.findById(userId);
  }
}
