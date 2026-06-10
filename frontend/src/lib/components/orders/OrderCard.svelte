<script lang="ts">
  import type { Order, OrderStatus } from '$lib/types/order'

  export let order: Order

  function formatPrice(price: number) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price)
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const statusColors: Record<OrderStatus, string> = {
    pending: 'bg-yellow-50 text-yellow-700',
    processing: 'bg-blue-50 text-blue-700',
    shipped: 'bg-purple-50 text-purple-700',
    delivered: 'bg-green-50 text-green-700',
    cancelled: 'bg-red-50 text-red-600',
  }
</script>

<a
  href="/orders/{order.id}"
  class="block border border-gray-100 p-6 hover:border-gray-300 transition-colors"
>
  <div class="flex items-start justify-between gap-4 mb-3">
    <div>
      <p class="text-sm text-gray-400">Order</p>
      <p class="font-semibold">#{String(order.id).padStart(5, '0')}</p>
    </div>
    <span class="text-xs font-medium px-2 py-1 {statusColors[order.status]} capitalize">
      {order.status}
    </span>
  </div>

  <div class="flex items-center justify-between text-sm text-gray-500">
    <span>{formatDate(order.created_at)}</span>
    <span class="font-medium text-brand">{formatPrice(order.total)}</span>
  </div>
</a>
