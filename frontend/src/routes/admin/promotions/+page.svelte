<script lang="ts">
  import {
    apiAdminGetPromotions,
    apiAdminCreatePromotion,
    apiAdminUpdatePromotion,
    apiAdminDeletePromotion,
  } from '$lib/api/admin'
  import Modal from '$lib/components/ui/Modal.svelte'
  import type { Promotion } from '$lib/types/promotion'

  let promotionsPromise = apiAdminGetPromotions()
  let showModal = false
  let editPromotion: Promotion | null = null
  let error = ''

  // Form state
  let form = {
    name: '',
    description: '',
    discount_pct: '',
    starts_at: '',
    ends_at: '',
    active: true,
  }

  function toLocalDatetimeInput(isoStr: string): string {
    if (!isoStr) return ''
    return isoStr.slice(0, 16)
  }

  function openCreate() {
    editPromotion = null
    form = { name: '', description: '', discount_pct: '', starts_at: '', ends_at: '', active: true }
    showModal = true
    error = ''
  }

  function openEdit(p: Promotion) {
    editPromotion = p
    form = {
      name: p.name,
      description: p.description ?? '',
      discount_pct: String(p.discount_pct),
      starts_at: toLocalDatetimeInput(p.starts_at),
      ends_at: toLocalDatetimeInput(p.ends_at),
      active: p.active,
    }
    showModal = true
    error = ''
  }

  async function handleSubmit() {
    error = ''
    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      discount_pct: parseFloat(form.discount_pct),
      starts_at: form.starts_at,
      ends_at: form.ends_at,
    }
    try {
      if (editPromotion) {
        await apiAdminUpdatePromotion(editPromotion.id, { ...payload, active: form.active })
      } else {
        await apiAdminCreatePromotion(payload)
      }
      showModal = false
      promotionsPromise = apiAdminGetPromotions()
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to save promotion'
    }
  }

  async function handleDelete(p: Promotion) {
    if (!confirm(`Delete promotion "${p.name}"?`)) return
    try {
      await apiAdminDeletePromotion(p.id)
      promotionsPromise = apiAdminGetPromotions()
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to delete promotion'
    }
  }

  function isActive(p: Promotion): boolean {
    const now = Date.now()
    return p.active && new Date(p.starts_at).getTime() <= now && new Date(p.ends_at).getTime() >= now
  }

  function formatDate(str: string) {
    return new Date(str).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }
</script>

<div class="px-8 py-8">
  <div class="flex items-center justify-between mb-8">
    <h1 class="text-2xl font-semibold">Promotions</h1>
    <button on:click={openCreate} class="btn-primary text-sm px-5 py-2.5">+ New promotion</button>
  </div>

  {#if error}
    <p class="text-red-500 text-sm mb-4">{error}</p>
  {/if}

  {#await promotionsPromise}
    <p class="text-gray-400 text-sm">Loading...</p>
  {:then { promotions }}
    {#if promotions.length === 0}
      <p class="text-gray-400 text-sm">No promotions yet.</p>
    {:else}
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-gray-100">
              <th class="text-left py-3 text-xs uppercase tracking-wider text-gray-400 font-normal">Name</th>
              <th class="text-right py-3 text-xs uppercase tracking-wider text-gray-400 font-normal">Discount</th>
              <th class="text-left py-3 text-xs uppercase tracking-wider text-gray-400 font-normal">Starts</th>
              <th class="text-left py-3 text-xs uppercase tracking-wider text-gray-400 font-normal">Ends</th>
              <th class="text-center py-3 text-xs uppercase tracking-wider text-gray-400 font-normal">Status</th>
              <th class="py-3"></th>
            </tr>
          </thead>
          <tbody>
            {#each promotions as promotion}
              <tr class="border-b border-gray-50 hover:bg-gray-50/50">
                <td class="py-3">
                  <div class="font-medium">{promotion.name}</div>
                  {#if promotion.description}
                    <div class="text-xs text-gray-400 mt-0.5">{promotion.description}</div>
                  {/if}
                </td>
                <td class="py-3 text-right font-medium text-accent">{promotion.discount_pct}%</td>
                <td class="py-3 text-gray-500">{formatDate(promotion.starts_at)}</td>
                <td class="py-3 text-gray-500">{formatDate(promotion.ends_at)}</td>
                <td class="py-3 text-center">
                  <span class="text-xs px-2 py-0.5 {isActive(promotion) ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-400'}">
                    {isActive(promotion) ? 'Live' : promotion.active ? 'Scheduled' : 'Inactive'}
                  </span>
                </td>
                <td class="py-3 text-right">
                  <div class="flex items-center justify-end gap-3">
                    <button on:click={() => openEdit(promotion)} class="text-gray-400 hover:text-brand transition-colors text-xs">Edit</button>
                    <button on:click={() => handleDelete(promotion)} class="text-gray-400 hover:text-red-500 transition-colors text-xs">Delete</button>
                  </div>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  {:catch err}
    <p class="text-red-500 text-sm">Failed to load promotions: {err.message}</p>
  {/await}
</div>

<Modal open={showModal} title={editPromotion ? 'Edit promotion' : 'New promotion'} on:close={() => (showModal = false)}>
  <form on:submit|preventDefault={handleSubmit} class="flex flex-col gap-4">
    {#if error}
      <p class="text-red-500 text-sm">{error}</p>
    {/if}

    <div>
      <label for="promo-name" class="block text-xs text-gray-500 mb-1">Name</label>
      <input id="promo-name" bind:value={form.name} required class="w-full border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-brand" placeholder="Summer Sale" />
    </div>

    <div>
      <label for="promo-desc" class="block text-xs text-gray-500 mb-1">Description (optional)</label>
      <textarea id="promo-desc" bind:value={form.description} rows="2" class="w-full border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-brand resize-none" placeholder="Brief description..."></textarea>
    </div>

    <div>
      <label for="promo-disc" class="block text-xs text-gray-500 mb-1">Discount %</label>
      <input id="promo-disc" bind:value={form.discount_pct} type="number" min="0.01" max="100" step="0.01" required class="w-full border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-brand" placeholder="20" />
    </div>

    <div class="grid grid-cols-2 gap-3">
      <div>
        <label for="promo-starts" class="block text-xs text-gray-500 mb-1">Starts at</label>
        <input id="promo-starts" bind:value={form.starts_at} type="datetime-local" required class="w-full border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-brand" />
      </div>
      <div>
        <label for="promo-ends" class="block text-xs text-gray-500 mb-1">Ends at</label>
        <input id="promo-ends" bind:value={form.ends_at} type="datetime-local" required class="w-full border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-brand" />
      </div>
    </div>

    {#if editPromotion}
      <label class="flex items-center gap-2 text-sm cursor-pointer">
        <input bind:checked={form.active} type="checkbox" class="accent-brand" />
        Active
      </label>
    {/if}

    <div class="flex justify-end gap-3 pt-2">
      <button type="button" on:click={() => (showModal = false)} class="btn-outline text-sm px-4 py-2">Cancel</button>
      <button type="submit" class="btn-primary text-sm px-5 py-2">
        {editPromotion ? 'Save changes' : 'Create promotion'}
      </button>
    </div>
  </form>
</Modal>
