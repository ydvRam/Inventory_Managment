import {
  Controller,
  Get,
  Put,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@Controller('inventory')
@UseGuards(JwtAuthGuard, AdminGuard)
export class InventoryController {
  constructor(private readonly service: InventoryService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get('by-product/:productId')
  findByProduct(@Param('productId', ParseUUIDPipe) productId: string) {
    return this.service.findByProductId(productId);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  @Put('adjust')
  async setQuantity(
    @Query('productId', ParseUUIDPipe) productId: string,
    @Body() body: { quantity: number },
  ) {
    return this.service.setQuantity(productId, body.quantity);
  }
}
