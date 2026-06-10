<script lang="ts">
  import {
    apiAdminGetCoupons,
    apiAdminCreateCoupon,
    apiAdminUpdateCoupon,
    apiAdminDeleteCoupon,
  } from '$lib/api/admin'
  import Modal from '$lib/components/ui/Modal.svelte'
  import type { Coupon } from '$lib/types/promotion'

  let couponsPromise = apiAdminGetCoupons()
  let showModal = false
  let editCoupon: Coupon | null = null
  let error = ''

  let form = {
    code: '',
    discount_pct: '',
    max_uses: '',
    expires_at: '',
    active: true,
  }

  function toLocalDatetimeInput(isoStr: string): string {
    if (!isoStr) return ''
    return isoStr.slice(0, 16)
  }

  function openCreate() {
    editCoupon = null
    form = { code: '', discount_pct: '', max_uses: '', expires_at: '', active: true }
    showModal = true
    error = ''
  }

  function openEdit(c: Coupon) {
    editCoupon = c
    form = {
      code: c.code,
      discount_pct: String(c.discount_pct),
      max_uses: String(c.max_uses),
      expires_at: toLocalDatetimeInput(c.expires_at),
      active: c.active,
    }
    showModal = true
    error = ''
  }

  async function handleSubmit() {
    error = ''
    try {
      if (editCoupon) {
        await apiAdminUpdateCoupon(editCoupon.id, {
          code: form.code.trim(),
          discount_pct: parseFloat(form.discount_pct),
          max_uses: parseInt(form.max_uses),
          expires_at: form.expires_at,
          active: form.active,
        })
      } else {
        await apiAdminCreateCoupon({
          code: form.code.trim(),
          discount_pct: parseFloat(form.discount_pct),
          max_uses: parseInt(form.max_uses),
          expires_at: form.expires_at,
        })
      }
      showModal = false
      couponsPromise = apiAdminGetCoupons()
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to save coupon'
    }
  }

  async function handleDelete(c: Coupon) {
    if (!confirm(`Delete coupon "${c.code}"?`)) return
    try {
      await apiAdminDeleteCoupon(c.id)
      couponsPromise = apiAdminGetCoupons()
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to delete coupon'
    }
  }

  function isExpired(c: Coupon): boolean {
    return new Date(c.expires_at).getTime() < Date.now()
  }

  function isExhausted(c: Coupon): boolean {
    return c.used_count >= c.max_uses
  }

  function formatDate(str: string) {
    return new Date(str).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  function couponStatus(c: Coupon): { label: string; classes: string } {
    if (!c.active) return { label: 'Inactive', classes: 'bg-gray-100 text-gray-400' }
    if (isExpired(c)) return { label: 'Expired', classes: 'bg-red-50 text-red-500' }
    if (isExhausted(c)) return { label: 'Exhausted', classes: 'bg-orange-50 text-orange-500' }
    return { label: 'Active', classes: 'bg-green-50 text-green-700' }
  }
</script>

<div class="px-8 py-8">
  <div class="flex items-center justify-between mb-8">
    <h1 class="text-2xl font-semibold">Coupons</h1>
    <button on:click={openCreate} class="btn-primary text-sm px-5 py-2.5">+ New coupon</button>
  </div>

  {#if error}
    <p class="text-red-500 text-sm mb-4">{error}</p>
  {/if}

  {#await couponsPromise}
    <p class="text-gray-400 text-sm">Loading...</p>
  {:then { coupons }}
    {#if coupons.length === 0}
      <p class="text-gray-400 text-sm">No coupons yet.</p>
    {:else}
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-gray-100">
              <th class="text-left py-3 text-xs uppercase tracking-wider text-gray-400 font-normal">Code</th>
              <th class="text-right py-3 text-xs uppercase tracking-wider text-gray-400 font-normal">Discount</th>
              <th class="text-right py-3 text-xs uppercase tracking-wider text-gray-400 font-normal">Uses</th>
              <th class="text-left py-3 text-xs uppercase tracking-wider text-gray-400 font-normal">Expires</th>
              <th class="text-center py-3 text-xs uppercase tracking-wider text-gray-400 font-normal">Status</th>
              <th class="py-3"></th>
            </tr>
          </thead>
          <tbody>
            {#each coupons as coupon}
              {@const status = couponStatus(coupon)}
              <tr class="border-b border-gray-50 hover:bg-gray-50/50">
                <td class="py-3 font-mono font-medium tracking-wider">{coupon.code}</td>
                <td class="py-3 text-right font-medium text-accent">{coupon.discount_pct}%</td>
                <td class="py-3 text-right text-gray-500">{coupon.used_count} / {coupon.max_uses}</td>
                <td class="py-3 text-gray-500">{formatDate(coupon.expires_at)}</td>
                <td class="py-3 text-center">
                  <span class="text-xs px-2 py-0.5 {status.classes}">{status.label}</span>
                </td>
                <td class="py-3 text-right">
                  <div class="flex items-center justify-end gap-3">
                    <button on:click={() => openEdit(coupon)} class="text-gray-400 hover:text-brand transition-colors text-xs">Edit</button>
                    <button on:click={() => handleDelete(coupon)} class="text-gray-400 hover:text-red-500 transition-colors text-xs">Delete</button>
                  </div>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  {:catch err}
    <p class="text-red-500 text-sm">Failed to load coupons: {err.message}</p>
  {/await}
</div>

<Modal open={showModal} title={editCoupon ? 'Edit coupon' : 'New coupon'} on:close={() => (showModal = false)}>
  <form on:submit|preventDefault={handleSubmit} class="flex flex-col gap-4">
    {#if error}
      <p class="text-red-500 text-sm">{error}</p>
    {/if}

    <div>
      <label for="coupon-code" class="block text-xs text-gray-500 mb-1">Code</label>
      <input
        id="coupon-code"
        bind:value={form.code}
        required
        class="w-full border border-gray-200 px-3 py-2 text-sm font-mono uppercase focus:outline-none focus:border-brand"
        placeholder="SUMMER20"
      />
      <p class="text-xs text-gray-400 mt-1">Alphanumeric only. Will be uppercased automatically.</p>
    </div>

    <div>
      <label for="coupon-disc" class="block text-xs text-gray-500 mb-1">Discount %</label>
      <input id="coupon-disc" bind:value={form.discount_pct} type="number" min="0.01" max="100" step="0.01" required class="w-full border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-brand" placeholder="15" />
    </div>

    <div>
      <label for="coupon-uses" class="block text-xs text-gray-500 mb-1">Max uses</label>
      <input id="coupon-uses" bind:value={form.max_uses} type="number" min="1" step="1" required class="w-full border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-brand" placeholder="100" />
    </div>

    <div>
      <label for="coupon-expires" class="block text-xs text-gray-500 mb-1">Expires at</label>
      <input id="coupon-expires" bind:value={form.expires_at} type="datetime-local" required class="w-full border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-brand" />
    </div>

    {#if editCoupon}
      <label class="flex items-center gap-2 text-sm cursor-pointer">
        <input bind:checked={form.active} type="checkbox" class="accent-brand" />
        Active
      </label>
    {/if}

    <div class="flex justify-end gap-3 pt-2">
      <button type="button" on:click={() => (showModal = false)} class="btn-outline text-sm px-4 py-2">Cancel</button>
      <button type="submit" class="btn-primary text-sm px-5 py-2">
        {editCoupon ? 'Save changes' : 'Create coupon'}
      </button>
    </div>
  </form>
</Modal>
