import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { AuditService } from './audit.service';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';

@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) { }

  @Post('log')
  create(
    @Body() dto: CreateAuditLogDto,
    @Req() req?: Request,
  ) {
    const ipAddress = req?.ip ?? req?.socket?.remoteAddress;
    const userAgent = req?.headers?.['user-agent'];
    return this.auditService.create({
      ...dto,
      ipAddress: dto.ipAddress ?? ipAddress,
      userAgent: dto.userAgent ?? userAgent,
    });
  }

  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('userId') userId?: string,
    @Query('resource') resource?: string,
    @Query('action') action?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.auditService.findAll(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 50,
      userId,
      resource,
      action,
      from,
      to,
    );
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.auditService.findById(id);
  }

  @Get('resource/:resource/:resourceId')
  findByResource(
    @Param('resource') resource: string,
    @Param('resourceId') resourceId: string,
    @Query('limit') limit?: string,
  ) {
    return this.auditService.findByResource(
      resource,
      resourceId,
      limit ? parseInt(limit, 10) : 50,
    );
  }
}
