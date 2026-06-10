<script lang="ts">
  import 'virtual:uno.css'
  import { page } from '$app/stores'
  import { fade } from 'svelte/transition'
  import Navbar from '$lib/components/layout/Navbar.svelte'
  import Footer from '$lib/components/layout/Footer.svelte'
  import CartDrawer from '$lib/components/cart/CartDrawer.svelte'
  import AuthDrawer from '$lib/components/auth/AuthDrawer.svelte'
  import ToastContainer from '$lib/components/ui/ToastContainer.svelte'

  let cartOpen = false

  // Show footer everywhere except admin routes
  $: showFooter = !$page.url.pathname.startsWith('/admin')
</script>

<!--
  Reference body: font-family Inter, font-size 16px, line-height 1.6, color #0A0A0A,
  bg white, -webkit-font-smoothing antialiased
-->
<div
  class="min-h-screen font-body text-[#0A0A0A] bg-white antialiased"
  style="font-size: 16px; line-height: 1.6;"
>
  <Navbar on:openCart={() => (cartOpen = true)} />

  <!-- Page transitions — fade 200ms (from existing design) -->
  {#key $page.url.pathname}
    <main in:fade={{ duration: 200 }} out:fade={{ duration: 100 }}>
      <slot />
    </main>
  {/key}

  {#if showFooter}
    <Footer />
  {/if}

  <CartDrawer open={cartOpen} on:close={() => (cartOpen = false)} />
  <AuthDrawer />
  <ToastContainer />
</div>
