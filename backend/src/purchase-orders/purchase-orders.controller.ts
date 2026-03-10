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
import { PurchaseOrdersService } from './purchase-orders.service';
import { PurchaseOrderStatus, PaymentStatus } from './entities/purchase-order.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@Controller('purchase-orders')
@UseGuards(JwtAuthGuard, AdminGuard)
export class PurchaseOrdersController {
  constructor(private readonly service: PurchaseOrdersService) {}

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
      supplierId: string;
      items: { productId: string; quantity: number; unitPrice: string }[];
    },
  ) {
    return this.service.create(body);
  }

  @Put(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body()
    body: Partial<{
      status: PurchaseOrderStatus;
      paymentStatus: PaymentStatus;
    }>,
  ) {
    return this.service.update(id, body);
  }

  @Post(':id/receive')
  receiveOrder(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.receiveOrder(id);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }
}
