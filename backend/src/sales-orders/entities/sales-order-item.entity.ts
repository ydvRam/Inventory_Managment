import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { SalesOrder } from './sales-order.entity';
import { Product } from '../../product-management/entities/product.entity';

@Entity('sales_order_items')
export class SalesOrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  salesOrderId: string;

  @ManyToOne(() => SalesOrder, (so) => so.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'salesOrderId' })
  salesOrder: SalesOrder;

  @Column({ type: 'uuid' })
  productId: string;

  @ManyToOne(() => Product, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column({ type: 'int' })
  quantity: number;

  /** List / base price before bulk tier. */
  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  baseUnitPrice: string;

  /** Bulk tier discount 0–100. */
  @Column({ type: 'int', default: 0 })
  tierDiscountPercent: number;

  /** Final unit price after tier (before order-level coupon). */
  @Column({ type: 'decimal', precision: 14, scale: 2 })
  unitPrice: string;
}
