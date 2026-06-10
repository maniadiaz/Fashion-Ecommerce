<script lang="ts">
  import { page } from '$app/stores'
  import { derived } from 'svelte/store'
  import { apiGetProductById } from '$lib/api/products'
  import { addToCart } from '$lib/stores/cart.store'
  import { toggleWishlist, wishlistStore } from '$lib/stores/wishlist.store'
  import { addToast } from '$lib/stores/toast.store'
  import ProductBadge from '$lib/components/product/ProductBadge.svelte'
  import Skeleton from '$lib/components/ui/Skeleton.svelte'
  import type { Product } from '$lib/types/product'

  const productId = parseInt($page.params.id ?? '0')
  let productPromise = apiGetProductById(productId)

  let quantity = 1
  let imgError = false
  let addedToCart = false

  // Create derived store at top level so Svelte can track the subscription
  let currentProductId = productId
  const inWishlist = derived(wishlistStore, ($w) => $w.has(currentProductId))

  function formatPrice(price: number) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price)
  }

  function handleAddToCart(product: Product) {
    addToCart(product, quantity)
    addedToCart = true
    addToast(`${product.name} added to cart`, 'success')
    setTimeout(() => (addedToCart = false), 2000)
  }

  productPromise.then(({ product }) => {
    currentProductId = product.id
  }).catch(() => {})
</script>

<svelte:head>
  <title>Product — VELN</title>
</svelte:head>

{#await productPromise}
  <div class="max-w-6xl mx-auto px-4 py-12">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-12">
      <Skeleton width="100%" height="600px" />
      <div class="flex flex-col gap-4 pt-4">
        <Skeleton width="40%" height="12px" />
        <Skeleton width="80%" height="28px" />
        <Skeleton width="30%" height="20px" />
        <Skeleton width="100%" height="80px" />
      </div>
    </div>
  </div>
{:then { product }}
  <div class="max-w-6xl mx-auto px-4 py-12">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-12">
      <!-- Image -->
      <div class="relative aspect-[3/4] bg-gray-50">
        {#if product.image_url && !imgError}
          <img
            src={`${import.meta.env.PUBLIC_API_URL ?? 'http://localhost:3001'}/uploads/${product.image_url}`}
            alt={product.name}
            class="w-full h-full object-cover"
            on:error={() => (imgError = true)}
          />
        {:else}
          <div class="w-full h-full flex items-center justify-center text-gray-300">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
          </div>
        {/if}
        {#if product.badge}
          <div class="absolute top-4 left-4">
            <ProductBadge badge={product.badge} />
          </div>
        {/if}
      </div>

      <!-- Info -->
      <div class="flex flex-col gap-6 py-4">
        <div>
          <p class="text-xs text-gray-400 uppercase tracking-wider mb-2">{product.category_name}</p>
          <h1 class="text-3xl font-semibold tracking-tight">{product.name}</h1>
          <p class="text-2xl mt-3">{formatPrice(product.price)}</p>
        </div>

        {#if product.description}
          <p class="text-gray-600 leading-relaxed">{product.description}</p>
        {/if}

        <!-- Stock indicator -->
        {#if product.stock === 0}
          <p class="text-red-500 text-sm font-medium">Out of stock</p>
        {:else if product.stock < 5}
          <p class="text-amber-500 text-sm font-medium">Low stock — {product.stock} left</p>
        {:else}
          <p class="text-green-600 text-sm font-medium">In stock</p>
        {/if}

        <!-- Quantity + Add to cart -->
        <div class="flex flex-col gap-3">
          <div class="flex items-center gap-3">
            <label for="qty" class="text-sm font-medium">Quantity</label>
            <div class="flex items-center border border-gray-200">
              <button
                class="px-3 py-2 text-lg hover:bg-gray-50 transition-colors"
                on:click={() => (quantity = Math.max(1, quantity - 1))}
                disabled={product.stock === 0}
              >−</button>
              <input
                id="qty"
                type="number"
                min="1"
                max={product.stock}
                bind:value={quantity}
                class="w-12 text-center border-x border-gray-200 py-2 text-sm focus:outline-none"
                disabled={product.stock === 0}
              />
              <button
                class="px-3 py-2 text-lg hover:bg-gray-50 transition-colors"
                on:click={() => (quantity = Math.min(product.stock, quantity + 1))}
                disabled={product.stock === 0}
              >+</button>
            </div>
          </div>

          <button
            class="btn-primary w-full py-4 text-base"
            disabled={product.stock === 0}
            on:click={() => handleAddToCart(product)}
          >
            {#if addedToCart}
              Added to cart ✓
            {:else if product.stock === 0}
              Out of stock
            {:else}
              Add to cart
            {/if}
          </button>

          <button
            class="btn-outline w-full py-4 text-base flex items-center justify-center gap-2"
            on:click={() => toggleWishlist(product.id)}
          >
            {#if $inWishlist}
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              Saved
            {:else}
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              Save to wishlist
            {/if}
          </button>
        </div>
      </div>
    </div>
  </div>
{:catch error}
  <div class="max-w-6xl mx-auto px-4 py-12">
    <p class="text-red-500">Failed to load product: {error.message}</p>
    <a href="/" class="text-brand underline mt-4 block">Back to home</a>
  </div>
{/await}
