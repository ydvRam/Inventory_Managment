import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { SalesOrdersService } from './sales-orders.service';
import { SalesOrderStatus } from './entities/sales-order.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('sales-orders')
@UseGuards(JwtAuthGuard)
export class SalesOrdersController {
  constructor(private readonly service: SalesOrdersService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  @Post()
  create(
    @Body()
    body: {
      customerId: string;
      items: { productId: string; quantity: number; unitPrice: string }[];
    },
  ) {
    return this.service.create(body);
  }

  @Put(':id/status')
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { status: SalesOrderStatus },
  ) {
    return this.service.updateStatus(id, body.status);
  }

  @Post(':id/fulfill')
  fulfill(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.fulfill(id);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }
}
