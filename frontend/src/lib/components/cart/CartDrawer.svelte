<script lang="ts">
  import { fly, fade } from 'svelte/transition'
  import { createEventDispatcher } from 'svelte'
  import { cartStore, cartTotal, removeFromCart, updateQuantity } from '$lib/stores/cart.store'
  import { addToast } from '$lib/stores/toast.store'

  export let open = false
  const dispatch = createEventDispatcher<{ close: void }>()

  const API_URL = import.meta.env.PUBLIC_API_URL ?? 'http://localhost:3001'

  function formatPrice(price: number) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price)
  }

  function handleRemove(productId: number, name: string) {
    removeFromCart(productId)
    addToast(`${name} removed`, 'info')
  }

  function handleQty(productId: number, change: number) {
    const item = $cartStore.find(i => i.productId === productId)
    if (!item) return
    const newQty = item.quantity + change
    updateQuantity(productId, newQty)
  }
</script>

{#if open}
  <!-- Overlay — reference: .cart-overlay, rgba(10,10,10,0.5), z-2000, 300ms transition -->
  <div
    class="fixed inset-0 z-[2000]"
    style="background-color: rgba(10,10,10,0.5);"
    transition:fade={{ duration: 300 }}
    on:click={() => dispatch('close')}
    role="presentation"
  ></div>

  <!--
    Drawer — reference: .cart-drawer, fixed right-0, max-w 450px, bg white,
    translateX(100%)→translateX(0) via 300ms ease, z-2001, shadow-lg
  -->
  <aside
    class="fixed top-0 right-0 bottom-0 w-full max-w-[450px] bg-white z-[2001] flex flex-col shadow-veln-lg"
    transition:fly={{ x: 450, duration: 300 }}
  >
    <!-- Header — reference: .cart-header, py 2rem px 2rem, border-bottom -->
    <div
      class="flex items-center justify-between px-8 py-8"
      style="border-bottom: 1px solid rgba(10,10,10,0.08);"
    >
      <!-- Title — Playfair Display 1.5rem 600 -->
      <h2 class="font-heading text-[1.5rem] font-[600]">Shopping Cart</h2>
      <button
        class="p-2 text-[#0A0A0A] transition-opacity duration-fast hover:opacity-60 cursor-pointer"
        on:click={() => dispatch('close')}
        aria-label="Close cart"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>

    <!-- Items — reference: .cart-items, flex-1, overflow-y-auto, p 2rem -->
    <div class="flex-1 overflow-y-auto px-8 py-8">
      {#if $cartStore.length === 0}
        <!-- Empty state — reference: .cart-empty, text-center, gray -->
        <p class="text-center text-[#6B6B6B] py-12">Your cart is empty</p>
      {:else}
        {#each $cartStore as item (item.productId)}
          <!-- Cart item — reference: .cart-item, flex gap 1.5rem, pb+mb 1.5rem, border-bottom -->
          <div
            class="flex gap-6 pb-6 mb-6"
            style="border-bottom: 1px solid rgba(10,10,10,0.08);"
          >
            <!-- Image — reference: 80x100, bg #E8E8E8, object-cover, flex-shrink-0 -->
            {#if item.image_url}
              <img
                src="{API_URL}/uploads/{item.image_url}"
                alt={item.name}
                class="w-20 h-[100px] object-cover flex-shrink-0 bg-[#E8E8E8]"
              />
            {:else}
              <div class="w-20 h-[100px] bg-[#E8E8E8] flex-shrink-0"></div>
            {/if}

            <!-- Details -->
            <div class="flex-1 flex flex-col">
              <!-- Name — 0.9375rem 500 mb 0.5rem -->
              <h3 class="text-[0.9375rem] font-[500] mb-2">{item.name}</h3>
              <!-- Price — 0.875rem 600 -->
              <p class="text-[0.875rem] font-[600] mb-auto">{formatPrice(item.price)}</p>

              <!-- Controls — reference: .cart-item-controls, flex gap 1rem, mt 1rem -->
              <div class="flex items-center gap-4 mt-4">
                <!-- Qty btns — reference: 28x28, border black, hover bg-black text-white -->
                <button
                  class="w-7 h-7 border border-[#0A0A0A] bg-white text-[0.875rem] flex items-center justify-center transition-all duration-fast hover:bg-[#0A0A0A] hover:text-white cursor-pointer"
                  on:click={() => handleQty(item.productId, -1)}
                >−</button>
                <span class="text-[0.875rem] font-[500] min-w-[30px] text-center">{item.quantity}</span>
                <button
                  class="w-7 h-7 border border-[#0A0A0A] bg-white text-[0.875rem] flex items-center justify-center transition-all duration-fast hover:bg-[#0A0A0A] hover:text-white cursor-pointer"
                  on:click={() => handleQty(item.productId, 1)}
                >+</button>

                <!-- Remove — reference: .remove-btn, 0.75rem gray underline, hover text-accent -->
                <button
                  class="ml-auto text-[0.75rem] text-[#6B6B6B] underline cursor-pointer transition-colors duration-fast hover:text-[#E63323]"
                  on:click={() => handleRemove(item.productId, item.name)}
                >Remove</button>
              </div>
            </div>
          </div>
        {/each}
      {/if}
    </div>

    <!-- Footer — reference: .cart-footer, p 2rem, border-top -->
    {#if $cartStore.length > 0}
      <div
        class="px-8 py-8"
        style="border-top: 1px solid rgba(10,10,10,0.08);"
      >
        <!-- Subtotal — reference: flex justify-between, 1.125rem 600 mb 1.5rem -->
        <div class="flex justify-between items-center text-[1.125rem] font-[600] mb-6">
          <span>Subtotal</span>
          <span>{formatPrice($cartTotal)}</span>
        </div>
        <a
          href="/checkout"
          on:click={() => dispatch('close')}
          class="btn-primary btn-full block text-center"
        >
          Checkout
        </a>
      </div>
    {/if}
  </aside>
{/if}
