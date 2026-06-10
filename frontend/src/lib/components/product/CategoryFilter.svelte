<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import type { Category } from '$lib/types/product'

  export let categories: Category[] = []
  export let selected: string | null = null

  const dispatch = createEventDispatcher<{ select: string | null }>()
</script>

<div class="flex flex-wrap gap-2">
  <button
    class="px-4 py-1.5 text-sm border transition-colors {selected === null
      ? 'bg-brand text-white border-brand'
      : 'border-gray-200 text-gray-600 hover:border-brand hover:text-brand'}"
    on:click={() => dispatch('select', null)}
  >
    All
  </button>

  {#each categories as category}
    <button
      class="px-4 py-1.5 text-sm border transition-colors {selected === category.slug
        ? 'bg-brand text-white border-brand'
        : 'border-gray-200 text-gray-600 hover:border-brand hover:text-brand'}"
      on:click={() => dispatch('select', category.slug)}
    >
      {category.name}
    </button>
  {/each}
</div>
