<script lang="ts">
  import { fade } from 'svelte/transition'
  import { createEventDispatcher } from 'svelte'

  export let open = false
  export let title = ''

  const dispatch = createEventDispatcher<{ close: void }>()

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') dispatch('close')
  }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if open}
  <!-- Backdrop -->
  <!-- svelte-ignore a11y_interactive_supports_focus a11y_click_events_have_key_events -->
  <div
    transition:fade={{ duration: 150 }}
    class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
    role="dialog"
    aria-modal="true"
    tabindex="-1"
    on:click|self={() => dispatch('close')}
  >
    <!-- Panel -->
    <div
      transition:fade={{ duration: 100 }}
      class="bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
      role="presentation"
      on:click|stopPropagation
    >
      <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <h2 class="font-semibold">{title}</h2>
        <button
          on:click={() => dispatch('close')}
          class="text-gray-400 hover:text-brand transition-colors"
          aria-label="Close"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
      <div class="px-6 py-6">
        <slot />
      </div>
    </div>
  </div>
{/if}
