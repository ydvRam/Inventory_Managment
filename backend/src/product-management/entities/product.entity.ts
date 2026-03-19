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
import { Category } from './category.entity';
import { ProductVariant } from './product-variant.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ unique: true })
  sku: string;

  @Column({ type: 'uuid' })
  categoryId: string;

  @ManyToOne(() => Category, (c) => c.products)
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @Column({ type: 'int', default: 0 })
  stockLevel: number;

  @Column({ type: 'int', default: 0 })
  reorderPoint: number;

  /** Threshold for low-stock alert; if not set, reorderPoint is used. */
  @Column({ type: 'int', nullable: true })
  minStockLevel: number | null;

  /** True after we sent a low-stock alert; cleared when stock goes above threshold (avoid spam). */
  @Column({ type: 'boolean', default: false })
  lowStockAlertSent: boolean;

  /** Default price when selling (used to pre-fill sales order lines). */
  @Column({ type: 'decimal', precision: 14, scale: 2, nullable: true })
  sellingPrice: string | null;

  /** Default cost when buying (used to pre-fill purchase order lines). */
  @Column({ type: 'decimal', precision: 14, scale: 2, nullable: true })
  costPrice: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => ProductVariant, (v) => v.product)
  variants: ProductVariant[];
}
