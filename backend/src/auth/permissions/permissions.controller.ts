import { Controller, Get, Post, Body, Param, ParseUUIDPipe } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { CreatePermissionDto } from './dto/create-permission.dto';

@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Get()
  findAll() {
    return this.permissionsService.findAll();
  }

  @Get('module/:module')
  findByModule(@Param('module') module: string) {
    return this.permissionsService.findByModule(module);
  }

  @Get('seed')
  seedDefaults() {
    return this.permissionsService.seedDefaultPermissions();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.permissionsService.findById(id);
  }

  @Post()
  create(@Body() createPermissionDto: CreatePermissionDto) {
    return this.permissionsService.create(createPermissionDto);
  }
}
