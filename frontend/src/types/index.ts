export interface User {
  id: number
  name: string
  email: string
  role: 'customer' | 'admin'
}

export interface Category {
  id: number
  name: string
  slug: string
}

export interface Product {
  id: number
  name: string
  description: string
  price: number
  stock: number
  image_url: string
  badge: string | null
  category_id: number
  category_name?: string
  category_slug?: string
  active: boolean
  created_at: string
}

export interface CartItem {
  id: number
  product_id: number
  product_name: string
  price: number
  quantity: number
  image_url: string
}

export interface Order {
  id: number
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  total: number
  shipping_name: string
  shipping_address: string
  payment_method: 'card' | 'transfer' | 'cash'
  payment_status: 'pending' | 'paid' | 'failed'
  created_at: string
  items?: OrderItem[]
}

export interface OrderItem {
  id: number
  product_id: number
  product_name: string
  quantity: number
  unit_price: number
  image_url: string
}

export interface Promotion {
  id: number
  name: string
  description: string
  discount_pct: number
  starts_at: string
  ends_at: string
  active: boolean
}

export interface Coupon {
  id: number
  code: string
  discount_pct: number
  max_uses: number
  used_count: number
  expires_at: string
  active: boolean
}
