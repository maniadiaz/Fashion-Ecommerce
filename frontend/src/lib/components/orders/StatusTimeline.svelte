<script lang="ts">
  import type { OrderStatus } from '$lib/types/order'

  export let status: OrderStatus

  const steps: OrderStatus[] = ['pending', 'processing', 'shipped', 'delivered']
  const labels: Record<OrderStatus, string> = {
    pending: 'Pending',
    processing: 'Processing',
    shipped: 'Shipped',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
  }

  const currentIndex = status === 'cancelled' ? -1 : steps.indexOf(status)
</script>

{#if status === 'cancelled'}
  <div class="inline-flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-600 text-sm font-medium">
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="10"/>
      <line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
    </svg>
    Order cancelled
  </div>
{:else}
  <div class="flex items-center gap-0 w-full overflow-x-auto">
    {#each steps as step, i}
      <div class="flex items-center {i < steps.length - 1 ? 'flex-1' : ''}">
        <!-- Step dot -->
        <div class="flex flex-col items-center gap-1.5 flex-shrink-0">
          <div
            class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors {i <= currentIndex
              ? 'bg-brand border-brand text-white'
              : 'bg-white border-gray-200 text-gray-300'}"
          >
            {#if i < currentIndex}
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            {:else}
              {i + 1}
            {/if}
          </div>
          <span class="text-xs {i <= currentIndex ? 'text-brand font-medium' : 'text-gray-400'} whitespace-nowrap">
            {labels[step]}
          </span>
        </div>

        <!-- Connector line -->
        {#if i < steps.length - 1}
          <div class="h-0.5 flex-1 mx-2 mt-[-18px] {i < currentIndex ? 'bg-brand' : 'bg-gray-200'} transition-colors"></div>
        {/if}
      </div>
    {/each}
  </div>
{/if}
