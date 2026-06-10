import { apiFetch } from './client'

export function apiGetWishlist() {
  return apiFetch<{ productIds: number[] }>('/api/wishlist')
}

export function apiToggleWishlist(productId: number) {
  return apiFetch<{ added: boolean }>(`/api/wishlist/${productId}`, { method: 'POST' })
}
