<script lang="ts">
  export let badge: 'new' | 'sale' | 'limited' | null

  const labels = { new: 'New Arrival', sale: 'Sale', limited: 'Limited' }
  const colors = {
    new: 'bg-accent text-white',
    sale: 'bg-red-500 text-white',
    limited: 'bg-gray-700 text-white',
  }
</script>

{#if badge}
  <span class="text-xs font-semibold uppercase tracking-wider px-2 py-1 {colors[badge]}">
    {labels[badge]}
  </span>
{/if}
