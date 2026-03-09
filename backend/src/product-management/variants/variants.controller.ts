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
import { VariantsService } from './variants.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../../auth/guards/admin.guard';

@Controller('products/:productId/variants')
@UseGuards(JwtAuthGuard, AdminGuard)
export class VariantsController {
  constructor(private readonly service: VariantsService) {}

  @Get()
  findByProduct(@Param('productId', ParseUUIDPipe) productId: string) {
    return this.service.findByProduct(productId);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  @Post()
  create(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Body() body: Partial<{ sku: string; attributes: Record<string, string>; stockLevel: number; reorderPoint: number }>,
  ) {
    return this.service.create({ ...body, productId });
  }

  @Put(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: Partial<{ sku: string; attributes: Record<string, string>; stockLevel: number; reorderPoint: number }>,
  ) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }
}
