<script lang="ts">
  import { page } from '$app/stores'
  import { fly } from 'svelte/transition'
  import { goto } from '$app/navigation'
  import { authStore } from '$lib/stores/auth.store'
  import { apiGetOrderById } from '$lib/api/orders'
  import StatusTimeline from '$lib/components/orders/StatusTimeline.svelte'
  import Skeleton from '$lib/components/ui/Skeleton.svelte'

  if (typeof window !== 'undefined' && !$authStore.user) {
    goto('/auth/login')
  }

  const orderId = parseInt($page.params.id ?? '0')
  const isSuccess = $page.url.searchParams.get('success') === '1'
  const orderPromise = apiGetOrderById(orderId)

  function formatPrice(price: number) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price)
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }
</script>

<svelte:head>
  <title>Order detail — VELN</title>
</svelte:head>

{#await orderPromise}
  <div class="max-w-3xl mx-auto px-4 py-12">
    <Skeleton width="200px" height="28px" />
    <div class="mt-8"><Skeleton width="100%" height="60px" /></div>
    <div class="mt-8 flex flex-col gap-3">
      {#each Array(3) as _}
        <Skeleton width="100%" height="20px" />
      {/each}
    </div>
  </div>
{:then { order }}
  <div class="max-w-3xl mx-auto px-4 py-12">
    {#if isSuccess}
      <div in:fly={{ y: -20, duration: 400 }} class="mb-10 p-6 bg-green-50 border border-green-100">
        <div class="flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          <div>
            <p class="font-semibold text-green-800">Order placed successfully!</p>
            <p class="text-sm text-green-600">We'll start preparing your order right away.</p>
          </div>
        </div>
      </div>
    {/if}

    <div class="flex items-start justify-between mb-8">
      <div>
        <p class="text-sm text-gray-400 mb-1">Order</p>
        <h1 class="text-2xl font-semibold">#{String(order.id).padStart(5, '0')}</h1>
        <p class="text-sm text-gray-400 mt-1">{formatDate(order.created_at)}</p>
      </div>
      <a href="/orders" class="text-sm text-gray-500 hover:text-brand transition-colors underline">
        All orders
      </a>
    </div>

    <!-- Status timeline -->
    <div class="mb-10">
      <StatusTimeline status={order.status} />
    </div>

    <!-- Details grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10 text-sm">
      <div>
        <p class="text-gray-400 uppercase tracking-wider text-xs mb-2">Shipping to</p>
        <p class="font-medium">{order.shipping_name}</p>
        <p class="text-gray-500">{order.shipping_address}</p>
      </div>
      <div>
        <p class="text-gray-400 uppercase tracking-wider text-xs mb-2">Payment</p>
        <p class="font-medium capitalize">{order.payment_method.replace('_', ' ')}</p>
        <p class="text-gray-500 capitalize">{order.payment_status}</p>
      </div>
    </div>

    <!-- Items -->
    {#if order.items && order.items.length > 0}
      <div class="mb-6">
        <p class="text-gray-400 uppercase tracking-wider text-xs mb-4">Items</p>
        <div class="flex flex-col divide-y divide-gray-100">
          {#each order.items as item}
            <div class="flex justify-between py-3 text-sm">
              <span class="text-gray-700">{item.name} × {item.quantity}</span>
              <span class="font-medium">{formatPrice(item.unit_price * item.quantity)}</span>
            </div>
          {/each}
        </div>
      </div>

      <div class="flex justify-between pt-4 border-t border-gray-100 font-semibold">
        <span>Total</span>
        <span>{formatPrice(order.total)}</span>
      </div>
    {/if}
  </div>
{:catch error}
  <div class="max-w-3xl mx-auto px-4 py-12">
    <p class="text-red-500">Failed to load order: {error.message}</p>
    <a href="/orders" class="text-brand underline mt-4 block">Back to orders</a>
  </div>
{/await}
