<script lang="ts">
  import { createEventDispatcher } from 'svelte'

  export let productId: number
  export let stock: number

  const dispatch = createEventDispatcher<{ save: { productId: number; stock: number } }>()

  let editing = false
  let value = stock

  function save() {
    dispatch('save', { productId, stock: value })
    stock = value
    editing = false
  }

  function cancel() {
    value = stock
    editing = false
  }
</script>

{#if editing}
  <div class="flex items-center gap-2">
    <input
      type="number"
      bind:value
      min="0"
      class="border border-gray-200 px-2 py-1 text-sm w-20 focus:outline-none focus:border-brand"
      on:keydown={(e) => { if (e.key === 'Enter') save(); if (e.key === 'Escape') cancel() }}
    />
    <button on:click={save} class="text-green-600 hover:text-green-800 text-sm font-medium">Save</button>
    <button on:click={cancel} class="text-gray-400 hover:text-gray-600 text-sm">Cancel</button>
  </div>
{:else}
  <button
    on:click={() => (editing = true)}
    class="flex items-center gap-2 hover:text-brand transition-colors group"
  >
    <span class="text-sm">{stock}</span>
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="opacity-0 group-hover:opacity-100 transition-opacity">
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  </button>
{/if}
