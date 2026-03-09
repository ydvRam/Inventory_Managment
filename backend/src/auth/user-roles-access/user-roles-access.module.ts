import { Module } from '@nestjs/common';
import { PermissionsModule } from '../permissions/permissions.module';
import { RolesModule } from '../roles/roles.module';
import { UsersModule } from '../../users/users.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    PermissionsModule,
    RolesModule,
    UsersModule,
    AuditModule,
  ],
  exports: [PermissionsModule, RolesModule, UsersModule, AuditModule],
})
export class UserRolesAccessModule { }
