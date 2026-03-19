import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { DiscountTier } from './entities/discount-tier.entity';
import { Coupon } from './entities/coupon.entity';
import { Product } from '../product-management/entities/product.entity';

export type LineInput = { productId: string; quantity: number; unitPrice?: string };

@Injectable()
export class PricingService {
  constructor(
    @InjectRepository(DiscountTier)
    private readonly tierRepo: Repository<DiscountTier>,
    @InjectRepository(Coupon)
    private readonly couponRepo: Repository<Coupon>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  /** Pick the best bulk tier: highest minQuantity that still applies to this qty. */
  async getTierDiscountPercent(productId: string, quantity: number): Promise<number> {
    const tiers = await this.tierRepo.find({
      where: { productId, minQuantity: LessThanOrEqual(quantity) },
      order: { minQuantity: 'DESC' },
      take: 1,
    });
    return tiers[0]?.discountPercent ?? 0;
  }

  /** Returns coupon if code exists and is active. */
  async findValidCoupon(code: string | undefined | null): Promise<Coupon | null> {
    if (!code?.trim()) return null;
    const c = await this.couponRepo.findOne({
      where: { code: code.trim().toUpperCase(), isActive: true },
    });
    return c;
  }

  /** How much to subtract from subtotal (never more than subtotal). */
  couponDiscountAmount(coupon: Coupon, subtotal: number): number {
    const v = Number(coupon.discountValue ?? 0);
    if (coupon.discountType === 'percent') {
      return Math.min(subtotal, (subtotal * v) / 100);
    }
    return Math.min(subtotal, v);
  }

  /**
   * Full pricing breakdown for cart lines + optional coupon.
   * 1) Base price from product sellingPrice (or fallback unitPrice from client).
   * 2) Tier discount on each line.
   * 3) Coupon on whole subtotal.
   */
  async calculateOrder(lines: LineInput[], couponCode?: string | null) {
    if (!lines?.length) throw new BadRequestException('No line items');

    const outLines: {
      productId: string;
      productName: string;
      quantity: number;
      baseUnitPrice: string;
      tierDiscountPercent: number;
      unitPriceAfterTier: string;
      lineSubtotal: string;
    }[] = [];

    let subtotal = 0;

    for (const line of lines) {
      const product = await this.productRepo.findOne({ where: { id: line.productId } });
      if (!product) throw new BadRequestException(`Product not found: ${line.productId}`);

      const base = Number(product.sellingPrice ?? line.unitPrice ?? 0);
      const qty = Math.max(0, Math.floor(Number(line.quantity) || 0));
      if (qty <= 0) continue;

      const tierPct = await this.getTierDiscountPercent(product.id, qty);
      const unitAfterTier = base * (1 - tierPct / 100);
      const lineSum = unitAfterTier * qty;
      subtotal += lineSum;

      outLines.push({
        productId: product.id,
        productName: product.name,
        quantity: qty,
        baseUnitPrice: base.toFixed(2),
        tierDiscountPercent: tierPct,
        unitPriceAfterTier: unitAfterTier.toFixed(2),
        lineSubtotal: lineSum.toFixed(2),
      });
    }

    if (outLines.length === 0) throw new BadRequestException('No valid line items');

    const coupon = await this.findValidCoupon(couponCode);
    let couponDiscount = 0;
    let appliedCouponCode: string | null = null;
    if (coupon) {
      couponDiscount = this.couponDiscountAmount(coupon, subtotal);
      appliedCouponCode = coupon.code;
    }

    const total = Math.max(0, subtotal - couponDiscount);

    return {
      lines: outLines,
      subtotalBeforeCoupon: subtotal.toFixed(2),
      couponDiscountAmount: couponDiscount.toFixed(2),
      appliedCouponCode,
      totalAmount: total.toFixed(2),
    };
  }
}
