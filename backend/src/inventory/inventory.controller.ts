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
@UseGuards(JwtAuthGuard)
export class InventoryController {
  constructor(private readonly service: InventoryService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get('movements')
  findMovements(@Query('productId') productId?: string, @Query('limit') limit?: string) {
    return this.service.findMovements(productId || undefined, limit ? parseInt(limit, 10) : 100);
  }

  @Get('expiring')
  findExpiring(@Query('withinDays') withinDays?: string) {
    const days = withinDays != null ? parseInt(withinDays, 10) : 7;
    return this.service.findExpiring(Number.isNaN(days) ? 7 : days);
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
  @UseGuards(AdminGuard)
  async setQuantity(
    @Query('productId', ParseUUIDPipe) productId: string,
    @Body() body: { quantity: number },
  ) {
    return this.service.setQuantity(productId, body.quantity);
  }

  @Put('expiry')
  @UseGuards(AdminGuard)
  async updateExpiry(
    @Query('productId', ParseUUIDPipe) productId: string,
    @Body() body: { expiryDate: string | null },
  ) {
    const date = body.expiryDate ? new Date(body.expiryDate) : null;
    return this.service.updateExpiry(productId, date);
  }
}
