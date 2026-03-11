import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { Invoice } from './entities/invoice.entity';
import { SalesOrder } from '../sales-orders/entities/sales-order.entity';
import { InvoicesService } from './invoices.service';
import { InvoicesController } from './invoices.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Invoice, SalesOrder]),
    AuthModule,
  ],
  controllers: [InvoicesController],
  providers: [InvoicesService],
  exports: [InvoicesService],
})
export class InvoicesModule {}
