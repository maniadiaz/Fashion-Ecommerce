<script lang="ts">
  import { fly } from 'svelte/transition'
  // Reference hero animations: fadeInUp 0.8s ease forwards
  // line-1: delay 0, line-2: delay 0.2s, subtitle: delay 0.4s, btn: delay 0.6s
  // Translated as: fly y:20, duration:800, delays in ms
</script>

<!-- Reference: .hero — mt navbar, min-h 100vh, bg off-white, grid 2-col, gap 6rem, py 6rem -->
<section
  class="mt-navbar min-h-screen bg-[#F8F7F5] grid grid-cols-1 items-center gap-12 px-6 py-16 md:grid-cols-2 md:gap-24 md:px-8 md:py-24"
>
  <!-- Content — text top on mobile, left on desktop -->
  <div class="text-center md:text-left md:max-w-[600px] md:ml-auto md:pr-12">
    <h1
      class="font-heading text-[clamp(3rem,8vw,5rem)] font-[700] leading-[1.1] mb-6"
    >
      <span in:fly={{ y: 20, duration: 800, delay: 0 }}>Timeless Elegance</span>
      <span class="block" in:fly={{ y: 20, duration: 800, delay: 200 }}>Redefined</span>
    </h1>

    <p
      class="text-[1.125rem] text-[#6B6B6B] mb-12"
      in:fly={{ y: 20, duration: 800, delay: 400 }}
    >
      Discover our curated collection of premium essentials
    </p>

    <div in:fly={{ y: 20, duration: 800, delay: 600 }}>
      <a href="/#products" class="btn-primary">Explore Collection</a>
    </div>
  </div>

  <!-- Image — centered on mobile, right column on desktop -->
  <div class="max-w-[400px] mx-auto w-full md:max-w-none md:mx-0 md:pr-8">
    <img
      src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1280&q=80"
      alt="Fashion model"
      class="w-full h-full object-cover rounded-[2px]"
    />
  </div>
</section>
