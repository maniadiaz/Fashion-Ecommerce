export interface Promotion {
  id: number
  name: string
  description: string | null
  discount_pct: number
  starts_at: string
  ends_at: string
  active: boolean
  created_at: string
}

export interface PromotionProduct {
  id: number
  promotion_id: number
  promotion_name: string
  discount_pct: number
  product_id: number
  product_name: string
  original_price: number
  discounted_price: number
}

export interface Coupon {
  id: number
  code: string
  discount_pct: number
  max_uses: number
  used_count: number
  expires_at: string
  active: boolean
  created_at: string
}
