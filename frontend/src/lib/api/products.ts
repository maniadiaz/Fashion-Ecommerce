import { apiFetch } from './client'
import type { Product, Category } from '../types/product'

export function apiGetProducts(categorySlug?: string) {
  const params = categorySlug ? `?category=${encodeURIComponent(categorySlug)}` : ''
  return apiFetch<{ products: Product[] }>(`/api/products${params}`)
}

export function apiGetProductById(id: number | string) {
  return apiFetch<{ product: Product }>(`/api/products/${id}`)
}

export function apiGetCategories() {
  return apiFetch<{ categories: Category[] }>('/api/categories')
}
