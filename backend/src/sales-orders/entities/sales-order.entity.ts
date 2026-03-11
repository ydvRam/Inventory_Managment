import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Customer } from '../../customers/entities/customer.entity';
import { SalesOrderItem } from './sales-order-item.entity';

export enum SalesOrderStatus {
  PENDING = 'Pending',
  CONFIRMED = 'Confirmed',
  SHIPPED = 'Shipped',
  DELIVERED = 'Delivered',
  CANCELLED = 'Cancelled',
}

@Entity('sales_orders')
export class SalesOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  customerId: string;

  @ManyToOne(() => Customer, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'customerId' })
  customer: Customer;

  @Column({
    type: 'enum',
    enum: SalesOrderStatus,
    default: SalesOrderStatus.PENDING,
  })
  status: SalesOrderStatus;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  totalAmount: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => SalesOrderItem, (item) => item.salesOrder, { cascade: true })
  items: SalesOrderItem[];
}
