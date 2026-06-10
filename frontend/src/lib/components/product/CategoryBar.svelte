<script lang="ts">
  import { selectedCategory } from '$lib/stores/filter.store'
  import type { Category } from '$lib/types/product'

  export let categories: Category[] = []
</script>

<!-- Reference: .categories-section — py 3rem, bg white, border-bottom rgba(10,10,10,0.08) -->
<section
  class="py-12 bg-white"
  style="border-bottom: 1px solid rgba(10,10,10,0.08);"
>
  <div class="veln-container">
    <!-- Reference: .categories-bar — flex, gap 1rem, overflow-x auto, no scrollbar -->
    <div
      class="flex gap-4 overflow-x-auto"
      style="-webkit-overflow-scrolling: touch; scrollbar-width: none;"
    >

      <!-- "All" pill -->
      <button
        class={$selectedCategory === null ? 'category-pill-active' : 'category-pill'}
        on:click={() => selectedCategory.set(null)}
      >
        All
      </button>

      {#each categories as category}
        <button
          class={$selectedCategory === category.slug ? 'category-pill-active' : 'category-pill'}
          on:click={() => selectedCategory.set(category.slug)}
        >
          {category.name}
        </button>
      {/each}

    </div>
  </div>
</section>
