import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserRolesAccessModule } from './auth/user-roles-access/user-roles-access.module';
import { AuthModule } from './auth/auth.module';
import { ProductManagementModule } from './product-management/product-management.module';
import { SuppliersModule } from './suppliers/suppliers.module';
import { PurchaseOrdersModule } from './purchase-orders/purchase-orders.module';
import { InventoryModule } from './inventory/inventory.module';
import { CustomersModule } from './customers/customers.module';
import { SalesOrdersModule } from './sales-orders/sales-orders.module';
import { InvoicesModule } from './invoices/invoices.module';
import { ReturnsModule } from './returns/returns.module';
import { NotificationsModule } from './notifications/notifications.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get<string>('DB_USERNAME', 'postgres'),
        password: configService.get<string>('DB_PASSWORD', 'Yadav@7457'),
        database: configService.get<string>('DB_NAME', 'inventory_db'),
        autoLoadEntities: true,
        // When SYNC_DB=true or not in production, TypeORM creates/updates tables. Set SYNC_DB=true once on fresh DB, then set SYNC_DB=false.
        synchronize:
          configService.get<string>('SYNC_DB') === 'true' ||
          configService.get<string>('NODE_ENV') !== 'production',
      }),
      inject: [ConfigService],
    }),
    UserRolesAccessModule,
    AuthModule,
    ProductManagementModule,
    SuppliersModule,
    PurchaseOrdersModule,
    InventoryModule,
    CustomersModule,
    SalesOrdersModule,
    InvoicesModule,
    ReturnsModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
