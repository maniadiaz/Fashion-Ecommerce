<script lang="ts">
  import { cartStore, cartTotal, removeFromCart, updateQuantity } from '$lib/stores/cart.store'
  import EmptyState from '$lib/components/ui/EmptyState.svelte'

  function formatPrice(price: number) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price)
  }
</script>

<svelte:head>
  <title>Cart — VELN</title>
</svelte:head>

<main class="max-w-6xl mx-auto px-4 py-12">
  <h1 class="text-3xl font-semibold tracking-tight mb-10">Your cart</h1>

  {#if $cartStore.length === 0}
    <EmptyState
      title="Your cart is empty"
      description="Browse the collection and add some pieces."
      actionLabel="Shop now"
      actionHref="/"
    >
      <svelte:fragment slot="icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" stroke-width="1">
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
          <line x1="3" y1="6" x2="21" y2="6"/>
          <path d="M16 10a4 4 0 01-8 0"/>
        </svg>
      </svelte:fragment>
    </EmptyState>
  {:else}
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-12">
      <!-- Cart items -->
      <div class="lg:col-span-2">
        {#each $cartStore as item (item.productId)}
          <div class="flex gap-6 py-6 border-b border-gray-100">
            <div class="w-24 h-32 bg-gray-50 flex-shrink-0">
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

            <div class="flex-1 flex flex-col gap-3">
              <div class="flex justify-between items-start">
                <div>
                  <h3 class="font-medium">{item.name}</h3>
                  <p class="text-sm text-gray-500 mt-1">{formatPrice(item.price)}</p>
                </div>
                <button
                  on:click={() => removeFromCart(item.productId)}
                  class="text-gray-300 hover:text-brand transition-colors"
                  aria-label="Remove"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>

              <div class="flex items-center border border-gray-200 w-fit">
                <button
                  on:click={() => updateQuantity(item.productId, item.quantity - 1)}
                  class="px-3 py-2 hover:bg-gray-50 transition-colors"
                >−</button>
                <span class="px-4 py-2 text-sm border-x border-gray-200">{item.quantity}</span>
                <button
                  on:click={() => updateQuantity(item.productId, item.quantity + 1)}
                  class="px-3 py-2 hover:bg-gray-50 transition-colors"
                >+</button>
              </div>

              <p class="text-sm font-medium">{formatPrice(item.price * item.quantity)}</p>
            </div>
          </div>
        {/each}
      </div>

      <!-- Summary -->
      <div class="lg:col-span-1">
        <div class="border border-gray-100 p-6 sticky top-24">
          <h2 class="font-semibold mb-6">Order summary</h2>

          <div class="flex flex-col gap-3 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-500">Subtotal</span>
              <span>{formatPrice($cartTotal)}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">Shipping</span>
              <span class="text-gray-400">Calculated at checkout</span>
            </div>
            <div class="border-t border-gray-100 pt-3 flex justify-between font-semibold text-base">
              <span>Total</span>
              <span>{formatPrice($cartTotal)}</span>
            </div>
          </div>

          <a href="/checkout" class="btn-primary block text-center mt-6 py-4">
            Proceed to checkout
          </a>
        </div>
      </div>
    </div>
  {/if}
</main>
