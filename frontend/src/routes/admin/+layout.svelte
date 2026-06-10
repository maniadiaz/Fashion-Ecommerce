<script lang="ts">
  import { goto } from '$app/navigation'
  import { page } from '$app/stores'
  import { authStore } from '$lib/stores/auth.store'

  if (typeof window !== 'undefined' && $authStore.user?.role !== 'admin') {
    goto('/')
  }

  const navItems = [
    { href: '/admin/products', label: 'Products' },
    { href: '/admin/orders', label: 'Orders' },
    { href: '/admin/promotions', label: 'Promotions' },
    { href: '/admin/coupons', label: 'Coupons' },
    { href: '/admin/product-promotions', label: 'On Promotion' },
  ]
</script>

<div class="min-h-screen flex">
  <!-- Sidebar -->
  <aside class="w-56 border-r border-gray-100 flex flex-col pt-8 px-4 flex-shrink-0">
    <a href="/" class="text-lg font-semibold tracking-widest mb-8 block">VELN</a>
    <p class="text-xs text-gray-400 uppercase tracking-wider mb-3">Admin</p>
    <nav class="flex flex-col gap-1">
      {#each navItems as item}
        <a
          href={item.href}
          class="px-3 py-2 text-sm rounded transition-colors {$page.url.pathname.startsWith(item.href)
            ? 'bg-brand text-white'
            : 'text-gray-600 hover:bg-gray-50'}"
        >
          {item.label}
        </a>
      {/each}
    </nav>
    <div class="mt-auto pb-6">
      <a href="/" class="text-xs text-gray-400 hover:text-brand transition-colors">← Back to shop</a>
    </div>
  </aside>

  <!-- Content -->
  <main class="flex-1 overflow-auto">
    <slot />
  </main>
</div>
