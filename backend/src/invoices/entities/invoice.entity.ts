import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { SalesOrder } from '../../sales-orders/entities/sales-order.entity';
import { Customer } from '../../customers/entities/customer.entity';

export enum InvoiceStatus {
  UNPAID = 'Unpaid',
  PAID = 'Paid',
}

@Entity('invoices')
export class Invoice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  salesOrderId: string;

  @ManyToOne(() => SalesOrder, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'salesOrderId' })
  salesOrder: SalesOrder;

  @Column({ type: 'uuid' })
  customerId: string;

  @ManyToOne(() => Customer, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'customerId' })
  customer: Customer;

  @Column({ type: 'decimal', precision: 14, scale: 2 })
  amount: string;

  @Column({
    type: 'enum',
    enum: InvoiceStatus,
    default: InvoiceStatus.UNPAID,
  })
  status: InvoiceStatus;

  @Column({ type: 'varchar', length: 50, unique: true, nullable: true })
  invoiceNumber: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
