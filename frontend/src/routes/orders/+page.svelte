<script lang="ts">
  import { goto } from '$app/navigation'
  import { authStore } from '$lib/stores/auth.store'
  import { apiGetOrders } from '$lib/api/orders'
  import OrderCard from '$lib/components/orders/OrderCard.svelte'
  import EmptyState from '$lib/components/ui/EmptyState.svelte'
  import Skeleton from '$lib/components/ui/Skeleton.svelte'

  if (typeof window !== 'undefined' && !$authStore.user) {
    goto('/auth/login')
  }

  const ordersPromise = apiGetOrders()
</script>

<svelte:head>
  <title>Your orders — VELN</title>
</svelte:head>

<main class="max-w-4xl mx-auto px-4 py-12">
  <h1 class="text-3xl font-semibold tracking-tight mb-10">Your orders</h1>

  {#await ordersPromise}
    <div class="flex flex-col gap-4">
      {#each Array(3) as _}
        <Skeleton width="100%" height="88px" />
      {/each}
    </div>
  {:then { orders }}
    {#if orders.length === 0}
      <EmptyState
        title="No orders yet"
        description="Once you place an order, it will appear here."
        actionLabel="Browse collection"
        actionHref="/"
      />
    {:else}
      <div class="flex flex-col gap-3">
        {#each orders as order}
          <OrderCard {order} />
        {/each}
      </div>
    {/if}
  {:catch error}
    <p class="text-red-500">Failed to load orders: {error.message}</p>
  {/await}
</main>
