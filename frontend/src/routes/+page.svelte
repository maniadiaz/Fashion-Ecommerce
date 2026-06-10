<script lang="ts">
  import { apiGetProducts, apiGetCategories } from '$lib/api/products'
  import { selectedCategory } from '$lib/stores/filter.store'
  import Hero from '$lib/components/layout/Hero.svelte'
  import CategoryBar from '$lib/components/product/CategoryBar.svelte'
  import ProductGrid from '$lib/components/product/ProductGrid.svelte'
  import FeaturedBanner from '$lib/components/layout/FeaturedBanner.svelte'
  import Testimonials from '$lib/components/layout/Testimonials.svelte'
  import Newsletter from '$lib/components/layout/Newsletter.svelte'
  import type { Product, Category } from '$lib/types/product'

  // Fetch all products + categories once; filter client-side
  let allProducts: Product[] = []
  let categories: Category[] = []
  let loading = true
  let error = ''

  async function loadData() {
    try {
      const [pRes, cRes] = await Promise.all([apiGetProducts(), apiGetCategories()])
      allProducts = pRes.products
      categories = cRes.categories
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to load'
    } finally {
      loading = false
    }
  }

  loadData()

  // Client-side filter — same logic as reference app.js filterProducts()
  $: filteredProducts = $selectedCategory
    ? allProducts.filter(p => p.category_slug === $selectedCategory)
    : allProducts
</script>

<svelte:head>
  <title>VELN — Premium Minimal Fashion</title>
</svelte:head>

<!-- Hero -->
<Hero />

<!-- Category filter bar -->
<CategoryBar {categories} />

<!-- Product grid -->
{#if loading}
  <section class="py-24 bg-white">
    <div class="veln-container">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-12">
        {#each Array(8) as _}
          <div>
            <div class="w-full aspect-[3/4] bg-[#F8F7F5] animate-pulse mb-6"></div>
            <div class="h-3 bg-[#F8F7F5] animate-pulse mb-2 w-2/3"></div>
            <div class="h-4 bg-[#F8F7F5] animate-pulse mb-2 w-4/5"></div>
            <div class="h-4 bg-[#F8F7F5] animate-pulse w-1/3"></div>
          </div>
        {/each}
      </div>
    </div>
  </section>
{:else if error}
  <section class="py-24 bg-white text-center">
    <p class="text-[#6B6B6B]">Failed to load products: {error}</p>
  </section>
{:else}
  <ProductGrid products={filteredProducts} />
{/if}

<!-- Featured banner -->
<FeaturedBanner />

<!-- Testimonials -->
<Testimonials />

<!-- Newsletter -->
<Newsletter />
