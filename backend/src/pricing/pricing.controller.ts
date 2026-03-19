import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { PricingService } from './pricing.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DiscountTier } from './entities/discount-tier.entity';
import { Coupon } from './entities/coupon.entity';

@Controller('pricing')
@UseGuards(JwtAuthGuard)
export class PricingController {
  constructor(
    private readonly pricingService: PricingService,
    @InjectRepository(DiscountTier)
    private readonly tierRepo: Repository<DiscountTier>,
    @InjectRepository(Coupon)
    private readonly couponRepo: Repository<Coupon>,
  ) {}

  /** Anyone logged in: preview totals before placing order. */
  @Post('preview')
  preview(
    @Body()
    body: {
      items: { productId: string; quantity: number; unitPrice?: string }[];
      couponCode?: string;
    },
  ) {
    return this.pricingService.calculateOrder(body.items ?? [], body.couponCode);
  }

  // --- Admin: discount tiers ---

  @Get('discount-tiers')
  @UseGuards(AdminGuard)
  listTiers(@Query('productId') productId?: string) {
    const qb = this.tierRepo.createQueryBuilder('t').orderBy('t.productId', 'ASC').addOrderBy('t.minQuantity', 'ASC');
    if (productId) qb.andWhere('t.productId = :productId', { productId });
    return qb.getMany();
  }

  @Post('discount-tiers')
  @UseGuards(AdminGuard)
  createTier(@Body() body: { productId: string; minQuantity: number; discountPercent: number; label?: string }) {
    const t = this.tierRepo.create({
      productId: body.productId,
      minQuantity: body.minQuantity,
      discountPercent: body.discountPercent,
      label: body.label ?? null,
    });
    return this.tierRepo.save(t);
  }

  @Delete('discount-tiers/:id')
  @UseGuards(AdminGuard)
  removeTier(@Param('id', ParseUUIDPipe) id: string) {
    return this.tierRepo.delete(id);
  }

  // --- Admin: coupons ---

  @Get('coupons')
  @UseGuards(AdminGuard)
  listCoupons() {
    return this.couponRepo.find({ order: { createdAt: 'DESC' } });
  }

  @Post('coupons')
  @UseGuards(AdminGuard)
  createCoupon(
    @Body()
    body: {
      code: string;
      discountType: 'percent' | 'fixed';
      discountValue: number;
      label?: string;
      isActive?: boolean;
    },
  ) {
    const c = this.couponRepo.create({
      code: body.code.trim().toUpperCase(),
      discountType: body.discountType,
      discountValue: String(body.discountValue),
      label: body.label ?? null,
      isActive: body.isActive !== false,
    });
    return this.couponRepo.save(c);
  }

  @Put('coupons/:id')
  @UseGuards(AdminGuard)
  updateCoupon(
    @Param('id', ParseUUIDPipe) id: string,
    @Body()
    body: Partial<{
      discountType: 'percent' | 'fixed';
      discountValue: number;
      label: string;
      isActive: boolean;
    }>,
  ) {
    return this.couponRepo.findOne({ where: { id } }).then((c) => {
      if (!c) return null;
      if (body.discountType != null) c.discountType = body.discountType;
      if (body.discountValue != null) c.discountValue = String(body.discountValue);
      if (body.label !== undefined) c.label = body.label;
      if (body.isActive !== undefined) c.isActive = body.isActive;
      return this.couponRepo.save(c);
    });
  }

  @Delete('coupons/:id')
  @UseGuards(AdminGuard)
  removeCoupon(@Param('id', ParseUUIDPipe) id: string) {
    return this.couponRepo.delete(id);
  }
}
