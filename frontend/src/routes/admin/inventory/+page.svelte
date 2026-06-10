<script lang="ts">
  import { apiAdminGetInventory, apiAdminUpdateStock } from '$lib/api/admin'
  import type { InventoryItem } from '$lib/api/admin'
  import StockEditor from '$lib/components/admin/StockEditor.svelte'

  let items: InventoryItem[] = []
  let loading = true
  let error = ''

  apiAdminGetInventory()
    .then(({ inventory }) => {
      items = inventory
    })
    .catch((err) => {
      error = err instanceof Error ? err.message : 'Failed to load inventory'
    })
    .finally(() => {
      loading = false
    })

  async function handleSave(e: CustomEvent<{ productId: number; stock: number }>) {
    try {
      await apiAdminUpdateStock(e.detail.productId, e.detail.stock)
      items = items.map((i) =>
        i.id === e.detail.productId ? { ...i, stock: e.detail.stock } : i
      )
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to update stock'
    }
  }

  function formatPrice(price: number) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price)
  }
</script>

<div class="px-8 py-8">
  <h1 class="text-2xl font-semibold mb-8">Inventory</h1>

  {#if error}
    <p class="text-red-500 text-sm mb-4">{error}</p>
  {/if}

  {#if loading}
    <p class="text-gray-400 text-sm">Loading...</p>
  {:else if items.length === 0}
    <p class="text-gray-400 text-sm">No products found.</p>
  {:else}
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-gray-100">
            <th class="text-left py-3 text-xs uppercase tracking-wider text-gray-400 font-normal">Product</th>
            <th class="text-left py-3 text-xs uppercase tracking-wider text-gray-400 font-normal">Category</th>
            <th class="text-right py-3 text-xs uppercase tracking-wider text-gray-400 font-normal">Price</th>
            <th class="text-left py-3 text-xs uppercase tracking-wider text-gray-400 font-normal">Stock</th>
            <th class="text-center py-3 text-xs uppercase tracking-wider text-gray-400 font-normal">Status</th>
          </tr>
        </thead>
        <tbody>
          {#each items as item}
            <tr class="border-b border-gray-50 hover:bg-gray-50/50 {item.stock < 5 ? 'bg-amber-50/50' : ''}">
              <td class="py-3 font-medium">{item.name}</td>
              <td class="py-3 text-gray-500">{item.category_name}</td>
              <td class="py-3 text-right">{formatPrice(item.price)}</td>
              <td class="py-3">
                <StockEditor productId={item.id} stock={item.stock} on:save={handleSave} />
                {#if item.stock < 5 && item.stock > 0}
                  <span class="text-xs text-amber-600 ml-2">Low stock</span>
                {:else if item.stock === 0}
                  <span class="text-xs text-red-500 ml-2">Out of stock</span>
                {/if}
              </td>
              <td class="py-3 text-center">
                <span class="text-xs px-2 py-0.5 {item.active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-400'}">
                  {item.active ? 'Active' : 'Inactive'}
                </span>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</div>
