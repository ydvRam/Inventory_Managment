import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  UseGuards,
  StreamableFile,
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

  @Get('recent-payments')
  findRecentPayments(@Query('limit') limit?: string) {
    const n = limit ? parseInt(limit, 10) : 10;
    return this.service.findRecentPayments(Number.isNaN(n) ? 10 : n);
  }

  @Get('due-summary')
  getDueSummary() {
    return this.service.getDueSummary();
  }

  @Get(':id/pdf')
  async getPdf(@Param('id', ParseUUIDPipe) id: string) {
    const buffer = await this.service.generatePdf(id);
    const inv = await this.service.findOne(id);
    const filename = `invoice-${inv.invoiceNumber ?? id}.pdf`;
    return new StreamableFile(buffer, {
      type: 'application/pdf',
      disposition: `attachment; filename="${filename}"`,
    });
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

  /** Record payment (full or partial). Body: { method?: string, amount?: number }. */
  @Post(':id/pay')
  pay(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { method?: string; amount?: number },
  ) {
    return this.service.pay(id, body?.method, body?.amount);
  }

}
