<script lang="ts">
  import { fly } from 'svelte/transition'
  import { reveal } from '$lib/actions/reveal'

  let visible = false

  const testimonials = [
    {
      quote: '"The quality is unmatched. Every piece feels like it was made just for me. VELN has become my go-to for timeless wardrobe staples."',
      author: 'Sarah Chen',
    },
    {
      quote: '"Finally, a brand that understands minimalism without compromising on elegance. The attention to detail is exceptional."',
      author: 'Marcus Rodriguez',
    },
    {
      quote: '"I\'ve never felt more confident in my wardrobe choices. VELN pieces are investment pieces that last season after season."',
      author: 'Emma Thompson',
    },
  ]
</script>

<!-- Reference: .testimonials-section — py 6rem, bg off-white, scroll reveal -->
<section
  class="py-24 bg-[#F8F7F5]"
  use:reveal
  on:reveal={() => (visible = true)}
>
  {#if visible}
    <div class="veln-container" in:fly={{ y: 20, duration: 500 }}>
      <!-- Grid — reference: 3 cols, gap 3rem -->
      <div class="grid grid-cols-3 gap-12 md:grid-cols-1 md:gap-8">
        {#each testimonials as t}
          <!-- Card — reference: bg white, padding 3rem, border-radius 2px -->
          <article class="bg-white p-12 rounded-[2px]">
            <!-- Stars — reference: black, 1rem, mb 1.5rem -->
            <div class="text-[#0A0A0A] text-[1rem] mb-6">
              <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
            </div>
            <!-- Quote — 0.9375rem lh 1.7 mb 1.5rem -->
            <blockquote class="text-[0.9375rem] leading-[1.7] text-[#0A0A0A] mb-6">
              {t.quote}
            </blockquote>
            <!-- Author — 0.875rem 600 gray -->
            <p class="text-[0.875rem] font-[600] text-[#6B6B6B]">{t.author}</p>
          </article>
        {/each}
      </div>
    </div>
  {/if}
</section>
