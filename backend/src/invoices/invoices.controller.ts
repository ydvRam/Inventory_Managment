import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { InvoiceStatus } from './entities/invoice.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('invoices')
@UseGuards(JwtAuthGuard)
export class InvoicesController {
  constructor(private readonly service: InvoicesService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get('by-sales-order/:salesOrderId')
  findBySalesOrder(@Param('salesOrderId', ParseUUIDPipe) salesOrderId: string) {
    return this.service.findBySalesOrderId(salesOrderId);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  @Post('generate')
  generateFromSalesOrder(@Body() body: { salesOrderId: string }) {
    return this.service.generateFromSalesOrder(body.salesOrderId);
  }

  @Put(':id/status')
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { status: InvoiceStatus },
  ) {
    return this.service.updateStatus(id, body.status);
  }
}
