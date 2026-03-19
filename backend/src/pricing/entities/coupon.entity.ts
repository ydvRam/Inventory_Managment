import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export type CouponDiscountType = 'percent' | 'fixed';

/** Promotional coupon applied to whole order subtotal (after tier prices). */
@Entity('coupons')
export class Coupon {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  code: string;

  @Column({ type: 'varchar', length: 20 })
  discountType: CouponDiscountType;

  /** If percent: 0–100. If fixed: rupee amount off subtotal. */
  @Column({ type: 'decimal', precision: 14, scale: 2 })
  discountValue: string;

  @Column({ default: true })
  isActive: boolean;

  /** e.g. "Summer Sale" */
  @Column({ type: 'varchar', length: 120, nullable: true })
  label: string | null;

  @CreateDateColumn()
  createdAt: Date;
}
