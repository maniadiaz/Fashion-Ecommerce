export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
export type PaymentStatus = 'pending' | 'paid' | 'failed'
export type PaymentMethod = 'card' | 'transfer' | 'cash'

export interface OrderItem {
  id: number
  product_id: number
  name: string
  quantity: number
  unit_price: number
}

export interface Order {
  id: number
  user_id: number
  status: OrderStatus
  total: number
  shipping_name: string
  shipping_address: string
  payment_method: PaymentMethod
  payment_status: PaymentStatus
  created_at: string
  items?: OrderItem[]
}
