<script lang="ts">
  import { apiGetProducts, apiGetCategories } from '$lib/api/products'
  import { apiAdminCreateProduct, apiAdminUpdateProduct, apiAdminDeleteProduct } from '$lib/api/admin'
  import Modal from '$lib/components/ui/Modal.svelte'
  import ProductForm from '$lib/components/admin/ProductForm.svelte'
  import type { Product } from '$lib/types/product'
  import type { Category } from '$lib/types/product'

  let productsPromise = apiGetProducts()
  let categoriesPromise = apiGetCategories()

  let showModal = false
  let editProduct: Product | null = null
  let categories: Category[] = []
  let error = ''

  categoriesPromise.then(({ categories: cats }) => {
    categories = cats
  }).catch(() => {})

  function openCreate() {
    editProduct = null
    showModal = true
    error = ''
  }

  function openEdit(product: Product) {
    editProduct = product
    showModal = true
    error = ''
  }

  async function handleSubmit(e: CustomEvent<FormData>) {
    error = ''
    try {
      if (editProduct) {
        const data: Record<string, unknown> = {}
        const fd = e.detail
        for (const [key, value] of fd.entries()) {
          data[key] = value
        }
        await apiAdminUpdateProduct(editProduct.id, data)
      } else {
        await apiAdminCreateProduct(e.detail)
      }
      showModal = false
      productsPromise = apiGetProducts()
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to save product'
    }
  }

  async function handleDelete(product: Product) {
    if (!confirm(`Delete "${product.name}"? This cannot be undone.`)) return
    try {
      await apiAdminDeleteProduct(product.id)
      productsPromise = apiGetProducts()
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to delete product'
    }
  }

  function formatPrice(price: number) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price)
  }
</script>

<div class="px-8 py-8">
  <div class="flex items-center justify-between mb-8">
    <h1 class="text-2xl font-semibold">Products</h1>
    <button on:click={openCreate} class="btn-primary text-sm px-5 py-2.5">+ New product</button>
  </div>

  {#if error}
    <p class="text-red-500 text-sm mb-4">{error}</p>
  {/if}

  {#await productsPromise}
    <p class="text-gray-400 text-sm">Loading...</p>
  {:then { products }}
    {#if products.length === 0}
      <p class="text-gray-400 text-sm">No products yet.</p>
    {:else}
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-gray-100">
              <th class="text-left py-3 text-xs uppercase tracking-wider text-gray-400 font-normal">Name</th>
              <th class="text-left py-3 text-xs uppercase tracking-wider text-gray-400 font-normal">Category</th>
              <th class="text-right py-3 text-xs uppercase tracking-wider text-gray-400 font-normal">Price</th>
              <th class="text-right py-3 text-xs uppercase tracking-wider text-gray-400 font-normal">Stock</th>
              <th class="text-center py-3 text-xs uppercase tracking-wider text-gray-400 font-normal">Status</th>
              <th class="py-3"></th>
            </tr>
          </thead>
          <tbody>
            {#each products as product}
              <tr class="border-b border-gray-50 hover:bg-gray-50/50">
                <td class="py-3 font-medium">{product.name}</td>
                <td class="py-3 text-gray-500">{product.category_name}</td>
                <td class="py-3 text-right">{formatPrice(product.price)}</td>
                <td class="py-3 text-right">{product.stock}</td>
                <td class="py-3 text-center">
                  <span class="text-xs px-2 py-0.5 {product.active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-400'}">
                    {product.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td class="py-3 text-right">
                  <div class="flex items-center justify-end gap-3">
                    <button on:click={() => openEdit(product)} class="text-gray-400 hover:text-brand transition-colors text-xs">Edit</button>
                    <button on:click={() => handleDelete(product)} class="text-gray-400 hover:text-red-500 transition-colors text-xs">Delete</button>
                  </div>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  {:catch err}
    <p class="text-red-500 text-sm">Failed to load products: {err.message}</p>
  {/await}
</div>

<Modal open={showModal} title={editProduct ? 'Edit product' : 'New product'} on:close={() => (showModal = false)}>
  <ProductForm product={editProduct} {categories} on:submit={handleSubmit} />
</Modal>
