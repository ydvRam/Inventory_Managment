import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { InventoryModule } from '../inventory/inventory.module';
import { SalesOrder } from './entities/sales-order.entity';
import { SalesOrderItem } from './entities/sales-order-item.entity';
import { SalesOrdersService } from './sales-orders.service';
import { SalesOrdersController } from './sales-orders.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([SalesOrder, SalesOrderItem]),
    AuthModule,
    InventoryModule,
  ],
  controllers: [SalesOrdersController],
  providers: [SalesOrdersService],
  exports: [SalesOrdersService],
})
export class SalesOrdersModule {}
