<script lang="ts">
  import { fly, fade } from 'svelte/transition'
  import { createEventDispatcher } from 'svelte'
  import type { ToastMessage } from '$lib/stores/toast.store'

  export let toast: ToastMessage

  const dispatch = createEventDispatcher<{ dismiss: string }>()

  const typeStyles = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    info: 'bg-white border-gray-200 text-brand',
  }

  const icons = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
  }
</script>

<div
  in:fly={{ y: -16, duration: 200 }}
  out:fade={{ duration: 150 }}
  class="flex items-center gap-3 px-4 py-3 border shadow-sm text-sm max-w-sm {typeStyles[toast.type]}"
>
  <span class="font-bold flex-shrink-0">{icons[toast.type]}</span>
  <span class="flex-1">{toast.message}</span>
  <button
    on:click={() => dispatch('dismiss', toast.id)}
    class="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
    aria-label="Dismiss"
  >
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  </button>
</div>
