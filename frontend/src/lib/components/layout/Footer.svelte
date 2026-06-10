<!-- Reference: .footer — bg black, pt 6rem pb 3rem, grid 2fr 1fr 1fr 1fr -->
<footer class="bg-[#0A0A0A] text-white pt-24 pb-12">
  <div class="veln-container">

    <!-- Grid — reference: grid-template-columns 2fr 1fr 1fr 1fr, gap 3rem -->
    <div class="grid mb-12" style="grid-template-columns: 2fr 1fr 1fr 1fr; gap: 3rem;">

      <!-- Brand column — Playfair Display 1.5rem 700 letter-spacing 2px -->
      <div>
        <h3 class="font-heading text-[1.5rem] font-[700] tracking-logo mb-6">VELN</h3>
        <p class="text-[0.9375rem] leading-[1.7] text-[rgba(255,255,255,0.7)] max-w-[300px]">
          Premium minimal fashion for the modern individual. Timeless pieces, exceptional quality.
        </p>
      </div>

      <!-- Shop -->
      <div>
        <h4 class="text-[0.875rem] font-[600] tracking-tag uppercase mb-6">Shop</h4>
        <ul class="flex flex-col gap-4 list-none p-0 m-0">
          <li><a href="/#products" class="text-[0.9375rem] text-[rgba(255,255,255,0.7)] no-underline transition-colors duration-fast hover:text-white">New Arrivals</a></li>
          <li><a href="/#products" class="text-[0.9375rem] text-[rgba(255,255,255,0.7)] no-underline transition-colors duration-fast hover:text-white">Collections</a></li>
          <li><a href="/#products" class="text-[0.9375rem] text-[rgba(255,255,255,0.7)] no-underline transition-colors duration-fast hover:text-white">Sale</a></li>
          <li><a href="#" class="text-[0.9375rem] text-[rgba(255,255,255,0.7)] no-underline transition-colors duration-fast hover:text-white">Gift Cards</a></li>
        </ul>
      </div>

      <!-- Help -->
      <div>
        <h4 class="text-[0.875rem] font-[600] tracking-tag uppercase mb-6">Help</h4>
        <ul class="flex flex-col gap-4 list-none p-0 m-0">
          <li><a href="#" class="text-[0.9375rem] text-[rgba(255,255,255,0.7)] no-underline transition-colors duration-fast hover:text-white">Contact Us</a></li>
          <li><a href="#" class="text-[0.9375rem] text-[rgba(255,255,255,0.7)] no-underline transition-colors duration-fast hover:text-white">Shipping & Returns</a></li>
          <li><a href="#" class="text-[0.9375rem] text-[rgba(255,255,255,0.7)] no-underline transition-colors duration-fast hover:text-white">Size Guide</a></li>
          <li><a href="#" class="text-[0.9375rem] text-[rgba(255,255,255,0.7)] no-underline transition-colors duration-fast hover:text-white">FAQ</a></li>
        </ul>
      </div>

      <!-- Follow -->
      <div>
        <h4 class="text-[0.875rem] font-[600] tracking-tag uppercase mb-6">Follow Us</h4>
        <ul class="flex flex-col gap-4 list-none p-0 m-0">
          <li><a href="#" class="text-[0.9375rem] text-[rgba(255,255,255,0.7)] no-underline transition-colors duration-fast hover:text-white">Instagram</a></li>
          <li><a href="#" class="text-[0.9375rem] text-[rgba(255,255,255,0.7)] no-underline transition-colors duration-fast hover:text-white">Pinterest</a></li>
          <li><a href="#" class="text-[0.9375rem] text-[rgba(255,255,255,0.7)] no-underline transition-colors duration-fast hover:text-white">Twitter</a></li>
          <li><a href="#" class="text-[0.9375rem] text-[rgba(255,255,255,0.7)] no-underline transition-colors duration-fast hover:text-white">Facebook</a></li>
        </ul>
      </div>

    </div>

    <!-- Bottom — border-top rgba(255,255,255,0.1), text-center, 0.875rem, rgba(255,255,255,0.5) -->
    <div
      class="pt-12 text-center text-[0.875rem] text-[rgba(255,255,255,0.5)]"
      style="border-top: 1px solid rgba(255,255,255,0.1);"
    >
      <p>&copy; 2026 VELN. All rights reserved.</p>
    </div>

  </div>
</footer>

<style>
  @media (max-width: 968px) {
    div[style*="grid-template-columns"] {
      grid-template-columns: 1fr 1fr !important;
    }
  }
  @media (max-width: 640px) {
    div[style*="grid-template-columns"] {
      grid-template-columns: 1fr !important;
    }
  }
</style>
