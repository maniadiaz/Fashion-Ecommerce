<script lang="ts">
  import { fly } from 'svelte/transition'
  import { reveal } from '$lib/actions/reveal'

  let visible = false
</script>

<!-- Reference: .featured-banner — bg black, py 6rem px 2rem, text-center, scroll reveal -->
<section
  class="bg-[#0A0A0A] py-24 px-8 text-center"
  use:reveal
  on:reveal={() => (visible = true)}
>
  {#if visible}
    <div class="max-w-[800px] mx-auto" in:fly={{ y: 20, duration: 500 }}>
      <h2
        class="font-heading text-[clamp(2.5rem,6vw,4rem)] font-[700] text-white leading-[1.2] mb-6"
      >
        Winter Collection 2026
      </h2>
      <p class="text-[1.125rem] text-[rgba(255,255,255,0.8)] mb-12">
        Crafted for the modern minimalist. Explore our latest seasonal essentials.
      </p>
      <a href="/#products" class="btn-secondary">Shop Now</a>
    </div>
  {/if}
</section>
