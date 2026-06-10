<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import type { CartItem } from '$lib/types/cart'

  export let item: CartItem

  const dispatch = createEventDispatcher<{
    updateQty: { productId: number; quantity: number }
    remove: number
  }>()

  function formatPrice(price: number) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price)
  }
</script>

<div class="flex gap-4 py-4 border-b border-gray-100 last:border-0">
  <!-- Image -->
  <div class="w-20 h-24 bg-gray-50 flex-shrink-0 overflow-hidden">
    {#if item.image_url}
      <img
        src={`${import.meta.env.PUBLIC_API_URL ?? 'http://localhost:3001'}/uploads/${item.image_url}`}
        alt={item.name}
        class="w-full h-full object-cover"
      />
    {:else}
      <div class="w-full h-full bg-gray-100"></div>
    {/if}
  </div>

  <!-- Details -->
  <div class="flex-1 flex flex-col gap-2 min-w-0">
    <div class="flex justify-between items-start gap-2">
      <h4 class="text-sm font-medium truncate">{item.name}</h4>
      <button
        on:click={() => dispatch('remove', item.productId)}
        class="text-gray-300 hover:text-brand transition-colors flex-shrink-0"
        aria-label="Remove"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>

    <p class="text-sm text-gray-500">{formatPrice(item.price)}</p>

    <div class="flex items-center gap-1 border border-gray-200 w-fit">
      <button
        on:click={() => dispatch('updateQty', { productId: item.productId, quantity: item.quantity - 1 })}
        class="px-2 py-1 text-sm hover:bg-gray-50 transition-colors"
      >−</button>
      <span class="px-2 py-1 text-sm min-w-[2rem] text-center">{item.quantity}</span>
      <button
        on:click={() => dispatch('updateQty', { productId: item.productId, quantity: item.quantity + 1 })}
        class="px-2 py-1 text-sm hover:bg-gray-50 transition-colors"
      >+</button>
    </div>
  </div>
</div>
