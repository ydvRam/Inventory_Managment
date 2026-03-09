import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { Category } from './entities/category.entity';
import { Product } from './entities/product.entity';
import { ProductVariant } from './entities/product-variant.entity';
import { CategoriesService } from './categories/categories.service';
import { CategoriesController } from './categories/categories.controller';
import { ProductsService } from './products/products.service';
import { ProductsController } from './products/products.controller';
import { VariantsService } from './variants/variants.service';
import { VariantsController } from './variants/variants.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Category, Product, ProductVariant]),
    AuthModule,
  ],
  controllers: [CategoriesController, ProductsController, VariantsController],
  providers: [CategoriesService, ProductsService, VariantsService],
  exports: [CategoriesService, ProductsService, VariantsService],
})
export class ProductManagementModule {}
