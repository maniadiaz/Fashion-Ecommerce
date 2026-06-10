import { apiFetch } from './client'
import type { Order, OrderStatus } from '../types/order'
import type { Product } from '../types/product'
import type { Promotion, PromotionProduct, Coupon } from '../types/promotion'

export interface InventoryItem {
  id: number
  name: string
  price: number
  stock: number
  active: boolean
  category_name: string
}

export interface AdminOrder {
  id: number
  user_email: string
  status: OrderStatus
  total: number
  payment_method: string
  payment_status: string
  created_at: string
}

export function apiAdminGetOrders() {
  return apiFetch<{ orders: AdminOrder[] }>('/api/admin/orders')
}

export function apiAdminUpdateOrderStatus(id: number, status: OrderStatus) {
  return apiFetch<{ success: boolean }>(`/api/admin/orders/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  })
}

export function apiAdminGetInventory() {
  return apiFetch<{ inventory: InventoryItem[] }>('/api/admin/inventory')
}

export function apiAdminUpdateStock(id: number, stock: number) {
  return apiFetch<{ success: boolean }>(`/api/admin/inventory/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ stock }),
  })
}

export function apiAdminCreateProduct(formData: FormData) {
  return apiFetch<{ product: Product }>('/api/products', {
    method: 'POST',
    body: formData,
  })
}

export function apiAdminUpdateProduct(id: number, data: Record<string, unknown>) {
  return apiFetch<{ product: Product }>(`/api/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export function apiAdminDeleteProduct(id: number) {
  return apiFetch<void>(`/api/products/${id}`, { method: 'DELETE' })
}

// Promotions
export function apiAdminGetPromotions() {
  return apiFetch<{ promotions: Promotion[] }>('/api/admin/promotions')
}

export function apiAdminCreatePromotion(data: Omit<Promotion, 'id' | 'active' | 'created_at'>) {
  return apiFetch<{ promotion: Promotion }>('/api/admin/promotions', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function apiAdminUpdatePromotion(id: number, data: Partial<Omit<Promotion, 'id' | 'created_at'>>) {
  return apiFetch<{ success: boolean }>(`/api/admin/promotions/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export function apiAdminDeletePromotion(id: number) {
  return apiFetch<{ success: boolean }>(`/api/admin/promotions/${id}`, { method: 'DELETE' })
}

// Promotion products
export function apiAdminGetPromotionProducts() {
  return apiFetch<{ items: PromotionProduct[] }>('/api/admin/promotion-products')
}

export function apiAdminAddProductToPromotion(promotionId: number, productId: number) {
  return apiFetch<{ success: boolean }>(`/api/admin/promotions/${promotionId}/products`, {
    method: 'POST',
    body: JSON.stringify({ product_id: productId }),
  })
}

export function apiAdminRemoveProductFromPromotion(promotionId: number, productId: number) {
  return apiFetch<{ success: boolean }>(`/api/admin/promotions/${promotionId}/products/${productId}`, {
    method: 'DELETE',
  })
}

// Coupons
export function apiAdminGetCoupons() {
  return apiFetch<{ coupons: Coupon[] }>('/api/admin/coupons')
}

export function apiAdminCreateCoupon(data: Omit<Coupon, 'id' | 'used_count' | 'active' | 'created_at'>) {
  return apiFetch<{ coupon: Coupon }>('/api/admin/coupons', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function apiAdminUpdateCoupon(id: number, data: Partial<Omit<Coupon, 'id' | 'used_count' | 'created_at'>>) {
  return apiFetch<{ success: boolean }>(`/api/admin/coupons/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export function apiAdminDeleteCoupon(id: number) {
  return apiFetch<{ success: boolean }>(`/api/admin/coupons/${id}`, { method: 'DELETE' })
}
