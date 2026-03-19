import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export const NOTIFICATION_TYPE_LOW_STOCK = 'low_stock';
export const NOTIFICATION_TYPE_DUE_PAYMENT = 'due_payment';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  type: string;

  @Column({ type: 'uuid', nullable: true })
  productId: string | null;

  @Column({ type: 'uuid', nullable: true })
  invoiceId: string | null;

  @Column({ type: 'text' })
  message: string;

  @Column({ default: false })
  read: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
