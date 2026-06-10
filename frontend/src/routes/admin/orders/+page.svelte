<script lang="ts">
  import { apiAdminGetOrders, apiAdminUpdateOrderStatus } from '$lib/api/admin'
  import type { AdminOrder } from '$lib/api/admin'
  import type { OrderStatus } from '$lib/types/order'

  let ordersPromise = apiAdminGetOrders()
  let error = ''

  const statusOptions: OrderStatus[] = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']

  async function handleStatusChange(order: AdminOrder, status: OrderStatus) {
    try {
      await apiAdminUpdateOrderStatus(order.id, status)
      order.status = status
      ordersPromise = ordersPromise
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to update status'
    }
  }

  function formatPrice(price: number) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price)
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }
</script>

<div class="px-8 py-8">
  <h1 class="text-2xl font-semibold mb-8">Orders</h1>

  {#if error}
    <p class="text-red-500 text-sm mb-4">{error}</p>
  {/if}

  {#await ordersPromise}
    <p class="text-gray-400 text-sm">Loading...</p>
  {:then { orders }}
    {#if orders.length === 0}
      <p class="text-gray-400 text-sm">No orders yet.</p>
    {:else}
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-gray-100">
              <th class="text-left py-3 text-xs uppercase tracking-wider text-gray-400 font-normal">#</th>
              <th class="text-left py-3 text-xs uppercase tracking-wider text-gray-400 font-normal">Customer</th>
              <th class="text-right py-3 text-xs uppercase tracking-wider text-gray-400 font-normal">Total</th>
              <th class="text-left py-3 text-xs uppercase tracking-wider text-gray-400 font-normal">Date</th>
              <th class="text-left py-3 text-xs uppercase tracking-wider text-gray-400 font-normal">Status</th>
            </tr>
          </thead>
          <tbody>
            {#each orders as order}
              <tr class="border-b border-gray-50 hover:bg-gray-50/50">
                <td class="py-3 font-medium">#{String(order.id).padStart(5, '0')}</td>
                <td class="py-3 text-gray-500">{order.user_email}</td>
                <td class="py-3 text-right">{formatPrice(order.total)}</td>
                <td class="py-3 text-gray-500">{formatDate(order.created_at)}</td>
                <td class="py-3">
                  <select
                    value={order.status}
                    on:change={(e) => handleStatusChange(order, e.currentTarget.value as OrderStatus)}
                    class="border border-gray-200 px-2 py-1 text-xs bg-white focus:outline-none focus:border-brand"
                  >
                    {#each statusOptions as option}
                      <option value={option}>{option.charAt(0).toUpperCase() + option.slice(1)}</option>
                    {/each}
                  </select>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  {:catch err}
    <p class="text-red-500 text-sm">Failed to load orders: {err.message}</p>
  {/await}
</div>
