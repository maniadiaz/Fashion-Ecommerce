<script lang="ts">
  import { flip } from 'svelte/animate'
  import { toastStore, removeToast } from '$lib/stores/toast.store'
  import Toast from './Toast.svelte'
</script>

<div class="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
  {#each $toastStore as toast (toast.id)}
    <div animate:flip={{ duration: 200 }} class="pointer-events-auto">
      <Toast {toast} on:dismiss={(e) => removeToast(e.detail)} />
    </div>
  {/each}
</div>
