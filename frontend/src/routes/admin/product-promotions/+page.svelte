<script lang="ts">
  import {
    apiAdminGetPromotionProducts,
    apiAdminGetPromotions,
    apiAdminAddProductToPromotion,
    apiAdminRemoveProductFromPromotion,
  } from '$lib/api/admin'
  import { apiGetProducts } from '$lib/api/products'
  import Modal from '$lib/components/ui/Modal.svelte'
  import type { Promotion, PromotionProduct } from '$lib/types/promotion'
  import type { Product } from '$lib/types/product'

  let itemsPromise = apiAdminGetPromotionProducts()
  let error = ''
  let showModal = false

  let promotions: Promotion[] = []
  let products: Product[] = []
  let selectedPromotionId = ''
  let selectedProductId = ''

  async function openAddModal() {
    error = ''
    try {
      const [{ promotions: promos }, { products: prods }] = await Promise.all([
        apiAdminGetPromotions(),
        apiGetProducts(),
      ])
      promotions = promos.filter((p) => p.active)
      products = prods.filter((p) => p.active)
      selectedPromotionId = ''
      selectedProductId = ''
      showModal = true
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to load data'
    }
  }

  async function handleAdd() {
    error = ''
    const promoId = parseInt(selectedPromotionId)
    const prodId = parseInt(selectedProductId)
    if (!promoId || !prodId) { error = 'Select both a promotion and a product'; return }
    try {
      await apiAdminAddProductToPromotion(promoId, prodId)
      showModal = false
      itemsPromise = apiAdminGetPromotionProducts()
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to add product'
    }
  }

  async function handleRemove(item: PromotionProduct) {
    if (!confirm(`Remove "${item.product_name}" from "${item.promotion_name}"?`)) return
    try {
      await apiAdminRemoveProductFromPromotion(item.promotion_id, item.product_id)
      itemsPromise = apiAdminGetPromotionProducts()
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to remove product'
    }
  }

  function formatPrice(n: number) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
  }

  // Group items by promotion for a cleaner layout
  function groupByPromotion(items: PromotionProduct[]): Map<string, PromotionProduct[]> {
    const map = new Map<string, PromotionProduct[]>()
    for (const item of items) {
      const key = `${item.promotion_id}::${item.promotion_name}::${item.discount_pct}`
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(item)
    }
    return map
  }
</script>

<div class="px-8 py-8">
  <div class="flex items-center justify-between mb-8">
    <div>
      <h1 class="text-2xl font-semibold">Products on Promotion</h1>
      <p class="text-sm text-gray-400 mt-1">Associate products with active promotions to apply discounts.</p>
    </div>
    <button on:click={openAddModal} class="btn-primary text-sm px-5 py-2.5">+ Add product</button>
  </div>

  {#if error}
    <p class="text-red-500 text-sm mb-4">{error}</p>
  {/if}

  {#await itemsPromise}
    <p class="text-gray-400 text-sm">Loading...</p>
  {:then { items }}
    {#if items.length === 0}
      <div class="text-center py-16 text-gray-400">
        <p class="text-sm">No products assigned to any promotion yet.</p>
        <p class="text-xs mt-1">Create a promotion first, then associate products here.</p>
      </div>
    {:else}
      {@const groups = groupByPromotion(items)}
      <div class="flex flex-col gap-8">
        {#each [...groups.entries()] as [key, groupItems]}
          {@const [_, promoName, discountPct] = key.split('::')}
          <div>
            <div class="flex items-center gap-3 mb-3">
              <h2 class="font-medium">{promoName}</h2>
              <span class="text-xs bg-accent/10 text-accent px-2 py-0.5">{discountPct}% off</span>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="border-b border-gray-100">
                    <th class="text-left py-2.5 text-xs uppercase tracking-wider text-gray-400 font-normal">Product</th>
                    <th class="text-right py-2.5 text-xs uppercase tracking-wider text-gray-400 font-normal">Original</th>
                    <th class="text-right py-2.5 text-xs uppercase tracking-wider text-gray-400 font-normal">After discount</th>
                    <th class="py-2.5"></th>
                  </tr>
                </thead>
                <tbody>
                  {#each groupItems as item}
                    <tr class="border-b border-gray-50 hover:bg-gray-50/50">
                      <td class="py-2.5 font-medium">{item.product_name}</td>
                      <td class="py-2.5 text-right text-gray-400 line-through">{formatPrice(item.original_price)}</td>
                      <td class="py-2.5 text-right font-medium text-green-700">{formatPrice(item.discounted_price)}</td>
                      <td class="py-2.5 text-right">
                        <button
                          on:click={() => handleRemove(item)}
                          class="text-gray-400 hover:text-red-500 transition-colors text-xs"
                        >Remove</button>
                      </td>
                    </tr>
                  {/each}
                </tbody>
              </table>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  {:catch err}
    <p class="text-red-500 text-sm">Failed to load data: {err.message}</p>
  {/await}
</div>

<Modal open={showModal} title="Add product to promotion" on:close={() => (showModal = false)}>
  <form on:submit|preventDefault={handleAdd} class="flex flex-col gap-4">
    {#if error}
      <p class="text-red-500 text-sm">{error}</p>
    {/if}

    <div>
      <label for="pp-promotion" class="block text-xs text-gray-500 mb-1">Promotion</label>
      <select id="pp-promotion" bind:value={selectedPromotionId} required class="w-full border border-gray-200 px-3 py-2 text-sm bg-white focus:outline-none focus:border-brand">
        <option value="">Select a promotion...</option>
        {#each promotions as promo}
          <option value={String(promo.id)}>{promo.name} — {promo.discount_pct}% off</option>
        {/each}
      </select>
      {#if promotions.length === 0}
        <p class="text-xs text-gray-400 mt-1">No active promotions. Create one in the Promotions section first.</p>
      {/if}
    </div>

    <div>
      <label for="pp-product" class="block text-xs text-gray-500 mb-1">Product</label>
      <select id="pp-product" bind:value={selectedProductId} required class="w-full border border-gray-200 px-3 py-2 text-sm bg-white focus:outline-none focus:border-brand">
        <option value="">Select a product...</option>
        {#each products as product}
          <option value={String(product.id)}>{product.name} — {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(product.price)}</option>
        {/each}
      </select>
    </div>

    {#if selectedPromotionId && selectedProductId}
      {@const promo = promotions.find(p => String(p.id) === selectedPromotionId)}
      {@const prod = products.find(p => String(p.id) === selectedProductId)}
      {#if promo && prod}
        <div class="bg-gray-50 px-4 py-3 text-sm">
          <p class="text-gray-500 text-xs uppercase tracking-wider mb-1">Price preview</p>
          <p>
            <span class="line-through text-gray-400">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(prod.price)}</span>
            <span class="ml-2 font-medium text-green-700">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(parseFloat((prod.price * (1 - promo.discount_pct / 100)).toFixed(2)))}</span>
            <span class="ml-2 text-xs text-gray-400">({promo.discount_pct}% off)</span>
          </p>
        </div>
      {/if}
    {/if}

    <div class="flex justify-end gap-3 pt-2">
      <button type="button" on:click={() => (showModal = false)} class="btn-outline text-sm px-4 py-2">Cancel</button>
      <button type="submit" class="btn-primary text-sm px-5 py-2">Add to promotion</button>
    </div>
  </form>
</Modal>
