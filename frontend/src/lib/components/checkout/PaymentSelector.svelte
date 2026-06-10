<script lang="ts">
  import type { PaymentMethod } from '$lib/types/order'

  export let selected: PaymentMethod = 'card'
</script>

<div class="flex flex-col gap-4">
  <h2 class="font-semibold text-lg">Payment method</h2>

  <div class="flex flex-col gap-3">
    {#each [
      { value: 'card', label: 'Credit card' },
      { value: 'transfer', label: 'Bank transfer' },
      { value: 'cash', label: 'Cash on delivery' },
    ] as option}
      <label class="flex items-center gap-3 cursor-pointer">
        <input
          type="radio"
          bind:group={selected}
          value={option.value}
          class="accent-brand"
        />
        <span class="text-sm">{option.label}</span>
      </label>
    {/each}
  </div>

  {#if selected === 'card'}
    <div class="border border-gray-100 p-4 flex flex-col gap-3 bg-gray-50">
      <p class="text-xs text-gray-400 uppercase tracking-wider">Card details (demo only)</p>
      <input
        type="text"
        placeholder="4242 4242 4242 4242"
        class="border border-gray-200 px-3 py-2 text-sm focus:outline-none bg-white"
        maxlength="19"
      />
      <div class="grid grid-cols-2 gap-3">
        <input
          type="text"
          placeholder="MM / YY"
          class="border border-gray-200 px-3 py-2 text-sm focus:outline-none bg-white"
          maxlength="7"
        />
        <input
          type="text"
          placeholder="CVV"
          class="border border-gray-200 px-3 py-2 text-sm focus:outline-none bg-white"
          maxlength="4"
        />
      </div>
      <p class="text-xs text-gray-400">These fields are decorative — no real payment is processed.</p>
    </div>
  {/if}
</div>
