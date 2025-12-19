export type PromoCodeType = "PERCENT" | "AMOUNT";

export interface PromoCode {
  id: string;
  code: string;
  type: PromoCodeType;
  value: number;
  description?: string | null;
  imageId?: string | null;
  image?: {
    id: string;
    url: string;
    publicId: string;
  } | null;
  usageLimit?: number | null;
  usageCount: number;
  minPurchase?: number | null;
  maxDiscount?: number | null;
  startsAt?: Date | null;
  expiresAt?: Date | null;
  enabled: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PromoCodeValidationResult {
  valid: boolean;
  promoCode?: PromoCode;
  discountAmount?: number;
  finalPrice?: number;
  error?: string;
}

