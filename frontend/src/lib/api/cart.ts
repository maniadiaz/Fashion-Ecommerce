import { apiFetch } from './client'
import type { CartItem } from '../types/cart'

export function apiGetCart() {
  return apiFetch<{ items: CartItem[] }>('/api/cart')
}

export function apiAddToCart(productId: number, quantity: number) {
  return apiFetch<{ items: CartItem[] }>('/api/cart', {
    method: 'POST',
    body: JSON.stringify({ productId, quantity }),
  })
}

export function apiUpdateCartItem(productId: number, quantity: number) {
  return apiFetch<{ items: CartItem[] }>(`/api/cart/${productId}`, {
    method: 'PUT',
    body: JSON.stringify({ quantity }),
  })
}

export function apiRemoveCartItem(productId: number) {
  return apiFetch<void>(`/api/cart/${productId}`, { method: 'DELETE' })
}

export function apiClearCart() {
  return apiFetch<void>('/api/cart', { method: 'DELETE' })
}
