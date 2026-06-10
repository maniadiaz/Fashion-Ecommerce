import { apiFetch } from './client'
import type { Order } from '../types/order'
import type { PaymentMethod } from '../types/order'

export function apiCreateOrder(data: {
  shipping_name: string
  shipping_address: string
  payment_method: PaymentMethod
}) {
  return apiFetch<{ order: Order }>('/api/orders', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function apiGetOrders() {
  return apiFetch<{ orders: Order[] }>('/api/orders')
}

export function apiGetOrderById(id: number | string) {
  return apiFetch<{ order: Order }>(`/api/orders/${id}`)
}
