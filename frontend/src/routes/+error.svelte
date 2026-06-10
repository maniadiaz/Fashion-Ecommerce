<script lang="ts">
  import { page } from '$app/stores'
</script>

<svelte:head>
  <title>Error — VELN</title>
</svelte:head>

<div class="min-h-[60vh] flex items-center justify-center px-4">
  <div class="text-center">
    <p class="text-6xl font-semibold text-gray-100 mb-4">{$page.status}</p>
    <h1 class="text-xl font-medium mb-2">{$page.error?.message ?? 'Something went wrong'}</h1>
    <p class="text-gray-400 text-sm mb-8">The page you're looking for isn't available.</p>
    <a href="/" class="btn-primary">Go home</a>
  </div>
</div>
