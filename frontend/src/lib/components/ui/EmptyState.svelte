<script lang="ts">
  export let title: string
  export let description: string
  export let actionLabel: string | null = null
  export let actionHref: string | null = null
</script>

<div class="text-center py-20 flex flex-col items-center gap-4">
  <slot name="icon" />
  <h3 class="text-lg font-medium">{title}</h3>
  <p class="text-gray-400 text-sm max-w-xs">{description}</p>
  {#if actionLabel && actionHref}
    <a href={actionHref} class="btn-primary mt-2">{actionLabel}</a>
  {/if}
</div>
