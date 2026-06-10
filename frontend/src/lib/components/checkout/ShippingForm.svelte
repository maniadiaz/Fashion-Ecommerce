<script lang="ts">
  import { createEventDispatcher } from 'svelte'

  export let shippingName = ''
  export let shippingAddress = ''
  export let shippingCity = ''

  const dispatch = createEventDispatcher<{
    submit: { shipping_name: string; shipping_address: string }
  }>()

  function handleSubmit() {
    dispatch('submit', {
      shipping_name: shippingName,
      shipping_address: `${shippingAddress}, ${shippingCity}`,
    })
  }
</script>

<div class="flex flex-col gap-4">
  <h2 class="font-semibold text-lg">Shipping information</h2>

  <div class="flex flex-col gap-1">
    <label for="name" class="text-sm font-medium">Full name</label>
    <input
      id="name"
      type="text"
      bind:value={shippingName}
      required
      class="border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-brand"
      placeholder="Your name"
    />
  </div>

  <div class="flex flex-col gap-1">
    <label for="address" class="text-sm font-medium">Address</label>
    <input
      id="address"
      type="text"
      bind:value={shippingAddress}
      required
      class="border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-brand"
      placeholder="Street address"
    />
  </div>

  <div class="flex flex-col gap-1">
    <label for="city" class="text-sm font-medium">City</label>
    <input
      id="city"
      type="text"
      bind:value={shippingCity}
      required
      class="border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-brand"
      placeholder="City"
    />
  </div>
</div>
