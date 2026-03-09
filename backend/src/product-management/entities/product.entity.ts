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

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => ProductVariant, (v) => v.product)
  variants: ProductVariant[];
}
