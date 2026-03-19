import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Product } from '../../product-management/entities/product.entity';

/** Bulk discount: when quantity >= minQuantity, apply discountPercent off base price. */
@Entity('discount_tiers')
export class DiscountTier {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  productId: string;

  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'productId' })
  product: Product;

  /** Minimum line quantity to get this discount (e.g. 10 = buy 10+). */
  @Column({ type: 'int' })
  minQuantity: number;

  /** 0–100 = percent off base unit price. */
  @Column({ type: 'int' })
  discountPercent: number;

  @Column({ type: 'varchar', length: 120, nullable: true })
  label: string | null;
}
