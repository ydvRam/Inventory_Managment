import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ReturnsService } from './returns.service';
import { ReturnStatus } from './entities/return-request.entity';
import { AdminGuard } from '../auth/guards/admin.guard';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('returns')
export class ReturnsController {
  constructor(private readonly returnsService: ReturnsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Body() body: { salesOrderId: string; productId: string; quantity: number; reason?: string },
  ) {
    return this.returnsService.create({
      salesOrderId: body.salesOrderId,
      productId: body.productId,
      quantity: body.quantity,
      reason: body.reason,
    });
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@Query('status') status?: string, @Query('salesOrderId') salesOrderId?: string) {
    if (salesOrderId) {
      return this.returnsService.findBySalesOrderId(salesOrderId);
    }
    const s = status === 'PENDING' || status === 'APPROVED' || status === 'REJECTED'
      ? (status as ReturnStatus)
      : undefined;
    return this.returnsService.findAll(s);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.returnsService.findOne(id);
  }

  @Post(':id/approve')
  @UseGuards(JwtAuthGuard, AdminGuard)
  approve(@Param('id', ParseUUIDPipe) id: string) {
    return this.returnsService.approve(id);
  }

  @Post(':id/reject')
  @UseGuards(JwtAuthGuard, AdminGuard)
  reject(@Param('id', ParseUUIDPipe) id: string) {
    return this.returnsService.reject(id);
  }
}
