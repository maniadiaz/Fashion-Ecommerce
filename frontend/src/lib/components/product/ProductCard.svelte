<script lang="ts">
  import { addToCart } from '$lib/stores/cart.store'
  import { toggleWishlist, wishlistStore } from '$lib/stores/wishlist.store'
  import { addToast } from '$lib/stores/toast.store'
  import { derived } from 'svelte/store'
  import type { Product } from '$lib/types/product'

  export let product: Product

  const inWishlist = derived(wishlistStore, ($w) => $w.has(product.id))

  let imgError = false

  const API_URL = import.meta.env.PUBLIC_API_URL ?? 'http://localhost:3001'

  function formatPrice(price: number) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price)
  }

  function handleAddToCart() {
    addToCart(product, 1)
    addToast(`${product.name} added to cart`, 'success')
  }

  function handleWishlist() {
    toggleWishlist(product.id)
  }

  // Reference badge labels
  const badgeLabels = { new: 'NEW ARRIVAL', sale: 'SALE', limited: 'LIMITED' }
</script>

<!--
  Reference: .product-card — group hover effects via CSS
  Translated to UnoCSS group + group-hover: utilities
-->
<article class="group opacity-100 transform-none">

  <!-- Image wrapper — reference: relative, overflow hidden, mb 1.5rem -->
  <div class="relative mb-6 overflow-hidden">

    <!-- Image — aspect 3/4, object-cover, scale 1→1.05 on group-hover, 500ms -->
    {#if product.image_url && !imgError}
      <img
        src="{API_URL}/uploads/{product.image_url}"
        alt={product.name}
        class="w-full aspect-[3/4] object-cover block transition-transform duration-slow group-hover:scale-105"
        on:error={() => (imgError = true)}
      />
    {:else}
      <div class="w-full aspect-[3/4] bg-[#E8E8E8] flex items-center justify-center">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#aaa" stroke-width="1">
          <rect x="3" y="3" width="18" height="18" rx="2"/>
          <circle cx="8.5" cy="8.5" r="1.5"/>
          <polyline points="21 15 16 10 5 21"/>
        </svg>
      </div>
    {/if}

    <!-- Wishlist btn — reference: absolute top-sm right-sm, 40x40, white circle, opacity-0 scale-0.8 → hover opacity-1 scale-1, 300ms -->
    <button
      class="absolute top-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-veln-sm opacity-0 scale-[0.8] group-hover:opacity-100 group-hover:scale-100 transition-all duration-base hover:bg-[#E63323] hover:text-white"
      class:text-[#E63323]={$inWishlist}
      on:click|stopPropagation={handleWishlist}
      aria-label="Toggle wishlist"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill={$inWishlist ? 'currentColor' : 'none'} stroke="currentColor" stroke-width="2">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
    </button>

    <!-- Quick add btn — reference: absolute bottom-0 full-width, translateY(100%)→0 on hover, 300ms, bg black text white UPPERCASE -->
    <button
      class="absolute bottom-0 left-0 right-0 py-4 bg-[#0A0A0A] text-white text-[0.875rem] font-[500] tracking-[0.5px] uppercase translate-y-full group-hover:translate-y-0 transition-transform duration-base cursor-pointer md:translate-y-0 md:static md:mt-4"
      on:click={handleAddToCart}
    >
      Quick Add
    </button>

  </div>

  <!-- Product info -->
  <div>
    <!-- Tag — reference: 0.625rem 600 1px tracking uppercase gray mb 0.5rem -->
    {#if product.badge}
      <span class="product-tag">{badgeLabels[product.badge]}</span>
    {:else}
      <span class="product-tag">{product.category_name.toUpperCase()}</span>
    {/if}

    <!-- Name — 1rem 500 mb 0.5rem -->
    <h3 class="text-[1rem] font-[500] mb-2 text-[#0A0A0A]">
      <a href="/product/{product.id}" class="hover:opacity-70 transition-opacity duration-fast">
        {product.name}
      </a>
    </h3>

    <!-- Price — 1rem 600 black -->
    <p class="text-[1rem] font-[600] text-[#0A0A0A]">{formatPrice(product.price)}</p>
  </div>

</article>

<style>
  /* Mobile: always show quick-add, wishlist visible */
  @media (max-width: 768px) {
    .group:hover .group-hover\:scale-100 {
      opacity: 1;
      transform: scale(1);
    }
  }
</style>
