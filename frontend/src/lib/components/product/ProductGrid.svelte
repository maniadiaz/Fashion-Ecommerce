<script lang="ts">
  import { fly, fade } from 'svelte/transition'
  import { flip } from 'svelte/animate'
  import { reveal } from '$lib/actions/reveal'
  import ProductCard from './ProductCard.svelte'
  import type { Product } from '$lib/types/product'

  export let products: Product[] = []

  let sectionVisible = false
</script>

<!--
  Reference: .products-section — py 6rem, bg white
  Product cards: opacity-0 translateY(20px) → visible, stagger 80ms each
-->
<section
  id="products"
  class="py-24 bg-white"
  use:reveal
  on:reveal={() => (sectionVisible = true)}
>
  <div class="veln-container">
    {#if products.length === 0}
      <div class="text-center py-20 text-[#6B6B6B]">
        <p>No products found in this category.</p>
      </div>
    {:else}
      <!--
        Reference grid: 4 cols gap 3rem → 3 cols @ 1024 → 2 cols @ 768
        Stagger: nth-child delays 0,80,160,240,320,400,480,560ms
      -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-12">
        {#each products as product, i (product.id)}
          <div
            animate:flip={{ duration: 300 }}
            in:fly={{ y: 20, duration: 500, delay: i * 80 }}
            out:fade={{ duration: 150 }}
          >
            <ProductCard {product} />
          </div>
        {/each}
      </div>
    {/if}
  </div>
</section>
