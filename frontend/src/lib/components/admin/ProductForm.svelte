<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import type { Product } from '$lib/types/product'
  import type { Category } from '$lib/types/product'

  export let product: Product | null = null
  export let categories: Category[] = []

  const dispatch = createEventDispatcher<{ submit: FormData }>()

  let name = product?.name ?? ''
  let description = product?.description ?? ''
  let price = product?.price?.toString() ?? ''
  let stock = product?.stock?.toString() ?? ''
  let badge = product?.badge ?? ''
  let categoryId = product?.category_id?.toString() ?? ''
  let imageFile: FileList | null = null
  let loading = false

  function handleSubmit() {
    const fd = new FormData()
    fd.append('name', name)
    fd.append('description', description)
    fd.append('price', price)
    fd.append('stock', stock)
    if (badge) fd.append('badge', badge)
    fd.append('category_id', categoryId)
    if (imageFile?.[0]) fd.append('image', imageFile[0])
    loading = true
    dispatch('submit', fd)
  }
</script>

<form on:submit|preventDefault={handleSubmit} class="flex flex-col gap-4">
  <div class="flex flex-col gap-1">
    <label for="pf-name" class="text-sm font-medium">Name</label>
    <input id="pf-name" type="text" bind:value={name} required minlength="2"
      class="border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-brand" />
  </div>

  <div class="flex flex-col gap-1">
    <label for="pf-desc" class="text-sm font-medium">Description</label>
    <textarea id="pf-desc" bind:value={description} rows="3"
      class="border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-brand resize-none"></textarea>
  </div>

  <div class="grid grid-cols-2 gap-3">
    <div class="flex flex-col gap-1">
      <label for="pf-price" class="text-sm font-medium">Price ($)</label>
      <input id="pf-price" type="number" bind:value={price} required min="0.01" step="0.01"
        class="border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-brand" />
    </div>
    <div class="flex flex-col gap-1">
      <label for="pf-stock" class="text-sm font-medium">Stock</label>
      <input id="pf-stock" type="number" bind:value={stock} required min="0"
        class="border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-brand" />
    </div>
  </div>

  <div class="grid grid-cols-2 gap-3">
    <div class="flex flex-col gap-1">
      <label for="pf-cat" class="text-sm font-medium">Category</label>
      <select id="pf-cat" bind:value={categoryId} required
        class="border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-brand bg-white">
        <option value="">Select category</option>
        {#each categories as cat}
          <option value={cat.id.toString()}>{cat.name}</option>
        {/each}
      </select>
    </div>
    <div class="flex flex-col gap-1">
      <label for="pf-badge" class="text-sm font-medium">Badge</label>
      <select id="pf-badge" bind:value={badge}
        class="border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-brand bg-white">
        <option value="">None</option>
        <option value="new">New Arrival</option>
        <option value="sale">Sale</option>
        <option value="limited">Limited</option>
      </select>
    </div>
  </div>

  <div class="flex flex-col gap-1">
    <label for="pf-image" class="text-sm font-medium">Image</label>
    <input id="pf-image" type="file" accept="image/*" bind:files={imageFile}
      class="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:border file:border-gray-200 file:text-sm file:font-medium file:bg-white hover:file:bg-gray-50" />
  </div>

  <button type="submit" disabled={loading} class="btn-primary mt-2">
    {product ? 'Save changes' : 'Create product'}
  </button>
</form>
