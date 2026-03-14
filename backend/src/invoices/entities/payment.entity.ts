import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Invoice } from './invoice.entity';

/** Method used for payment. FAKE = simulated payment (no real gateway). */

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  invoiceId: string;

  @ManyToOne(() => Invoice, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'invoiceId' })
  invoice: Invoice;

  @Column({ type: 'decimal', precision: 14, scale: 2 })
  amount: string;

  /** e.g. FAKE (simulated), or future: CARD, BANK, etc. */
  @Column({ type: 'varchar', length: 50 })
  method: string;

  @CreateDateColumn()
  paidAt: Date;
}
