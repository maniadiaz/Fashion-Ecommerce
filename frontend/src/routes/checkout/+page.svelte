<script lang="ts">
  import { goto } from '$app/navigation'
  import { authStore } from '$lib/stores/auth.store'
  import { cartStore, cartTotal, clearCart } from '$lib/stores/cart.store'
  import { apiCreateOrder } from '$lib/api/orders'
  import { ApiError } from '$lib/api/client'
  import { addToast } from '$lib/stores/toast.store'
  import ShippingForm from '$lib/components/checkout/ShippingForm.svelte'
  import PaymentSelector from '$lib/components/checkout/PaymentSelector.svelte'
  import type { PaymentMethod } from '$lib/types/order'

  // Guards
  if (typeof window !== 'undefined') {
    if (!$authStore.user) goto('/auth/login')
    else if ($cartStore.length === 0) goto('/cart')
  }

  let shippingName = $authStore.user?.name ?? ''
  let shippingAddress = ''
  let shippingCity = ''
  let paymentMethod: PaymentMethod = 'card'
  let error = ''
  let loading = false

  function formatPrice(price: number) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price)
  }

  async function placeOrder() {
    if (!shippingName || !shippingAddress || !shippingCity) {
      error = 'Please fill in all shipping fields'
      return
    }
    error = ''
    loading = true
    try {
      const { order } = await apiCreateOrder({
        shipping_name: shippingName,
        shipping_address: `${shippingAddress}, ${shippingCity}`,
        payment_method: paymentMethod,
      })
      clearCart()
      addToast('Order placed successfully!', 'success')
      goto(`/orders/${order.id}?success=1`)
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to place order'
      error = msg
      addToast(msg, 'error')
    } finally {
      loading = false
    }
  }
</script>

<svelte:head>
  <title>Checkout — VELN</title>
</svelte:head>

<main class="max-w-6xl mx-auto px-4 py-12">
  <h1 class="text-3xl font-semibold tracking-tight mb-10">Checkout</h1>

  {#if error}
    <p class="text-red-500 text-sm mb-6">{error}</p>
  {/if}

  <div class="grid grid-cols-1 lg:grid-cols-3 gap-12">
    <!-- Form -->
    <div class="lg:col-span-2 flex flex-col gap-10">
      <ShippingForm bind:shippingName bind:shippingAddress bind:shippingCity />
      <PaymentSelector bind:selected={paymentMethod} />

      <button
        class="btn-primary py-4 text-base w-full lg:w-auto lg:self-start lg:px-12"
        disabled={loading}
        on:click={placeOrder}
      >
        {loading ? 'Placing order...' : 'Place order'}
      </button>
    </div>

    <!-- Summary -->
    <div class="lg:col-span-1">
      <div class="border border-gray-100 p-6 sticky top-24">
        <h2 class="font-semibold mb-6">Order summary</h2>

        <div class="flex flex-col gap-3 mb-4 max-h-64 overflow-y-auto">
          {#each $cartStore as item}
            <div class="flex justify-between text-sm">
              <span class="text-gray-600 truncate flex-1 mr-2">{item.name} × {item.quantity}</span>
              <span class="flex-shrink-0">{formatPrice(item.price * item.quantity)}</span>
            </div>
          {/each}
        </div>

        <div class="border-t border-gray-100 pt-4 flex flex-col gap-2 text-sm">
          <div class="flex justify-between">
            <span class="text-gray-500">Subtotal</span>
            <span>{formatPrice($cartTotal)}</span>
          </div>
          <div class="flex justify-between font-semibold text-base mt-2">
            <span>Total</span>
            <span>{formatPrice($cartTotal)}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</main>
