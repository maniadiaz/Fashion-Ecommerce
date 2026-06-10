<script lang="ts">
  import { fly } from 'svelte/transition'
  import { reveal } from '$lib/actions/reveal'

  let visible = false
  let email = ''
  let submitted = false

  function handleSubmit() {
    if (email) {
      submitted = true
      email = ''
    }
  }
</script>

<!-- Reference: .newsletter-section — py 6rem px 2rem, bg white, text-center, scroll reveal -->
<section
  class="py-24 px-8 bg-white text-center"
  use:reveal
  on:reveal={() => (visible = true)}
>
  {#if visible}
    <div class="max-w-[600px] mx-auto" in:fly={{ y: 20, duration: 500 }}>
      <!-- Headline — Playfair Display clamp(2rem,5vw,3rem) 700 mb 1rem -->
      <h2 class="font-heading text-[clamp(2rem,5vw,3rem)] font-[700] mb-4">
        Stay in the Loop
      </h2>
      <!-- Subtitle — 1rem gray mb 3rem -->
      <p class="text-[1rem] text-[#6B6B6B] mb-12">
        Subscribe for exclusive access to new collections and special offers.
      </p>

      {#if submitted}
        <p class="text-[#0A0A0A] font-[500]">Thank you for subscribing!</p>
      {:else}
        <!-- Form — reference: flex row, gap 1rem, column on mobile -->
        <form
          on:submit|preventDefault={handleSubmit}
          class="flex gap-4 md:flex-col"
        >
          <!-- Input — flex-1, py 1rem px 1.5rem, border-2 black, focus border accent -->
          <input
            type="email"
            bind:value={email}
            placeholder="Enter your email"
            required
            class="veln-input"
          />
          <button type="submit" class="btn-primary whitespace-nowrap">Subscribe</button>
        </form>
      {/if}
    </div>
  {/if}
</section>
