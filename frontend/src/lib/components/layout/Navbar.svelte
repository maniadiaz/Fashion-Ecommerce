<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import { authStore, logout, isAdmin } from '$lib/stores/auth.store'
  import { cartCount } from '$lib/stores/cart.store'
  import { addToast } from '$lib/stores/toast.store'
  import { openAuthDrawer } from '$lib/stores/auth-drawer.store'
  import { goto } from '$app/navigation'
  import { slide } from 'svelte/transition'

  const dispatch = createEventDispatcher<{ openCart: void }>()

  let mobileOpen = false

  function handleLogout() {
    addToast('Signed out', 'info')
    logout()
    goto('/')
    mobileOpen = false
  }
</script>

<!-- Reference: .navbar — fixed top, h-navbar 80px, bg-white, border-bottom rgba(10,10,10,0.08), z-1000 -->
<nav
  class="fixed top-0 left-0 right-0 h-navbar bg-white z-[1000]"
  style="border-bottom: 1px solid rgba(10,10,10,0.08);"
>
  <div class="veln-container h-full flex items-center justify-between">

    <!-- Logo — Playfair Display 1.5rem 700 letter-spacing 2px -->
    <a href="/" class="font-heading text-[1.5rem] font-[700] tracking-logo text-[#0A0A0A] no-underline">
      VELN
    </a>

    <!-- Desktop nav links — 0.875rem 500 letter-spacing 0.5px -->
    <ul class="hidden md:flex gap-12 list-none p-0 m-0">
      <li><a href="/#products" class="text-[0.875rem] font-[500] tracking-normal text-[#0A0A0A] no-underline transition-opacity duration-fast hover:opacity-70">New Arrivals</a></li>
      <li><a href="/#products" class="text-[0.875rem] font-[500] tracking-normal text-[#0A0A0A] no-underline transition-opacity duration-fast hover:opacity-70">Collections</a></li>
      {#if $authStore.user}
        <li><a href="/orders" class="text-[0.875rem] font-[500] tracking-normal text-[#0A0A0A] no-underline transition-opacity duration-fast hover:opacity-70">Orders</a></li>
        {#if $isAdmin}
          <li><a href="/admin" class="text-[0.875rem] font-[500] tracking-normal text-[#0A0A0A] no-underline transition-opacity duration-fast hover:opacity-70">Admin</a></li>
        {/if}
      {/if}
    </ul>

    <!-- Actions -->
    <div class="flex items-center gap-4">
      {#if $authStore.user}
        <button
          on:click={handleLogout}
          class="hidden md:block text-[0.875rem] font-[500] tracking-normal text-[#0A0A0A] cursor-pointer transition-opacity duration-fast hover:opacity-70"
        >Sign out</button>
      {:else}
        <button
          on:click={() => openAuthDrawer('login')}
          class="hidden md:block text-[0.875rem] font-[500] tracking-normal text-[#0A0A0A] cursor-pointer transition-opacity duration-fast hover:opacity-70"
        >Sign in</button>
      {/if}

      <!-- Cart button -->
      <button class="icon-btn" on:click={() => dispatch('openCart')} aria-label="Shopping cart">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
          <line x1="3" y1="6" x2="21" y2="6"/>
          <path d="M16 10a4 4 0 0 1-8 0"/>
        </svg>
        <span
          class="absolute top-0 right-0 bg-[#E63323] text-white text-[0.625rem] font-[600] w-[18px] h-[18px] rounded-full flex items-center justify-center transition-all duration-base"
          style:opacity={$cartCount > 0 ? 1 : 0}
          style:transform={$cartCount > 0 ? 'scale(1)' : 'scale(0)'}
        >
          {$cartCount > 9 ? '9+' : $cartCount}
        </span>
      </button>

      <!-- Hamburger — mobile only -->
      <button
        class="md:hidden p-2 cursor-pointer transition-opacity duration-fast hover:opacity-70"
        on:click={() => (mobileOpen = !mobileOpen)}
        aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={mobileOpen}
      >
        {#if mobileOpen}
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        {:else}
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        {/if}
      </button>
    </div>

  </div>
</nav>

<!-- Mobile menu — slides down from navbar -->
{#if mobileOpen}
  <div
    class="md:hidden fixed left-0 right-0 bg-white z-[999] py-6 px-6"
    style="top: 80px; border-bottom: 1px solid rgba(10,10,10,0.08);"
    transition:slide={{ duration: 200 }}
  >
    <ul class="flex flex-col gap-6 list-none p-0 m-0">
      <li>
        <a href="/#products" on:click={() => (mobileOpen = false)} class="text-[0.9375rem] font-[500] text-[#0A0A0A] no-underline transition-opacity duration-fast hover:opacity-70">
          New Arrivals
        </a>
      </li>
      <li>
        <a href="/#products" on:click={() => (mobileOpen = false)} class="text-[0.9375rem] font-[500] text-[#0A0A0A] no-underline transition-opacity duration-fast hover:opacity-70">
          Collections
        </a>
      </li>
      {#if $authStore.user}
        <li>
          <a href="/orders" on:click={() => (mobileOpen = false)} class="text-[0.9375rem] font-[500] text-[#0A0A0A] no-underline transition-opacity duration-fast hover:opacity-70">
            Orders
          </a>
        </li>
        {#if $isAdmin}
          <li>
            <a href="/admin" on:click={() => (mobileOpen = false)} class="text-[0.9375rem] font-[500] text-[#0A0A0A] no-underline transition-opacity duration-fast hover:opacity-70">
              Admin
            </a>
          </li>
        {/if}
        <li>
          <button on:click={handleLogout} class="text-[0.9375rem] font-[500] text-[#0A0A0A] cursor-pointer transition-opacity duration-fast hover:opacity-70">
            Sign out
          </button>
        </li>
      {:else}
        <li>
          <button
            on:click={() => { mobileOpen = false; openAuthDrawer('login') }}
            class="text-[0.9375rem] font-[500] text-[#0A0A0A] cursor-pointer transition-opacity duration-fast hover:opacity-70"
          >Sign in</button>
        </li>
      {/if}
    </ul>
  </div>
{/if}
