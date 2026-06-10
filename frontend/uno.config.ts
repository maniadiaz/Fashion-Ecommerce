// Design tokens extracted 1:1 from .claude/reference/styles.css
// No invented values — every token maps to a CSS custom property in the reference.
import { defineConfig, presetWind, presetAttributify } from 'unocss'

export default defineConfig({
  presets: [presetWind(), presetAttributify()],

  theme: {
    // ── Breakpoints — explicit so responsive classes are predictable ───
    breakpoints: {
      sm:  '640px',
      md:  '768px',
      lg:  '1024px',
      xl:  '1280px',
      '2xl': '1536px',
    },

    // ── Colors — from :root { --color-* } ──────────────────────────────
    colors: {
      'off-white': '#F8F7F5',   // --color-off-white
      'veln-black': '#0A0A0A', // --color-black
      'veln-gray':  '#6B6B6B', // --color-gray
      'veln-accent':'#E63323', // --color-accent
      // Aliases for existing components
      brand:  '#0A0A0A',
      accent: '#E63323',
    },

    // ── Typography — from :root { --font-* } ───────────────────────────
    fontFamily: {
      heading: '"Playfair Display", Georgia, serif', // --font-heading
      body:    '"Inter", system-ui, sans-serif',     // --font-body
      sans:    '"Inter", system-ui, sans-serif',
    },

    // ── Shadows — from :root { --shadow-* } ────────────────────────────
    boxShadow: {
      'veln-sm': '0 2px 8px rgba(10, 10, 10, 0.08)',  // --shadow-sm
      'veln-md': '0 4px 16px rgba(10, 10, 10, 0.12)', // --shadow-md
      'veln-lg': '0 8px 32px rgba(10, 10, 10, 0.16)', // --shadow-lg
    },

    // ── Transitions — from :root { --transition-* } ────────────────────
    transitionDuration: {
      fast: '150ms', // --transition-fast
      base: '300ms', // --transition-base
      slow: '500ms', // --transition-slow
    },

    // ── Layout ─────────────────────────────────────────────────────────
    maxWidth: {
      container: '1400px', // --container-max
    },
    height: {
      navbar: '80px', // --navbar-height
    },

    // ── Letter spacing — named values from reference ───────────────────
    letterSpacing: {
      logo:   '2px',    // .navbar-logo
      normal: '0.5px',  // .btn, .navbar-menu, .category-pill
      tag:    '1px',    // .product-tag, .footer-heading
    },
  },

  shortcuts: {
    // ── Layout ──────────────────────────────────────────────────────────
    'veln-container': 'max-w-container mx-auto px-8 md:px-6 sm:px-4',

    // ── Buttons — reference .btn + .btn-primary / .btn-secondary ────────
    // padding: 1rem 2.5rem → py-4 px-10
    // font-size: 0.875rem, font-weight: 500, letter-spacing: 0.5px, uppercase
    // border: 2px solid transparent
    'btn': [
      'inline-block py-4 px-10',
      'text-[0.875rem] font-[500] tracking-[0.5px] uppercase',
      'border-2 border-transparent',
      'transition-all duration-base',
    ].join(' '),

    'btn-primary': [
      'inline-block py-4 px-10',
      'text-[0.875rem] font-[500] tracking-[0.5px] uppercase',
      'bg-[#0A0A0A] text-white border-2 border-[#0A0A0A]',
      'transition-all duration-base cursor-pointer',
      'hover:bg-white hover:text-[#0A0A0A] hover:opacity-100',
      'disabled:opacity-40 disabled:cursor-not-allowed',
    ].join(' '),

    'btn-secondary': [
      'inline-block py-4 px-10',
      'text-[0.875rem] font-[500] tracking-[0.5px] uppercase',
      'bg-white text-[#0A0A0A] border-2 border-white',
      'transition-all duration-base cursor-pointer',
      'hover:bg-transparent hover:text-white hover:opacity-100',
    ].join(' '),

    'btn-full': 'w-full text-center',

    // ── Icon buttons ─────────────────────────────────────────────────────
    'icon-btn': 'relative p-2 text-[#0A0A0A] transition-opacity duration-fast hover:opacity-60 cursor-pointer',

    // ── Category pills ───────────────────────────────────────────────────
    // padding: 0.75rem 1.5rem, border: 1px solid black
    'category-pill': [
      'py-3 px-6',
      'text-[0.875rem] font-[500] tracking-[0.5px]',
      'whitespace-nowrap border border-[#0A0A0A] bg-transparent text-[#0A0A0A]',
      'transition-all duration-base cursor-pointer',
      'hover:bg-[#F8F7F5]',
    ].join(' '),

    'category-pill-active': [
      'py-3 px-6',
      'text-[0.875rem] font-[500] tracking-[0.5px]',
      'whitespace-nowrap border border-[#0A0A0A] bg-[#0A0A0A] text-white',
      'transition-all duration-base cursor-pointer',
    ].join(' '),

    // ── Product tag ──────────────────────────────────────────────────────
    'product-tag': 'text-[0.625rem] font-[600] tracking-[1px] uppercase text-[#6B6B6B] mb-2 block',

    // ── Cards / surfaces ─────────────────────────────────────────────────
    'card': 'bg-white overflow-hidden',

    // ── Form inputs ──────────────────────────────────────────────────────
    'veln-input': [
      'flex-1 py-4 px-6',
      'font-body text-[0.9375rem]',
      'border-2 border-[#0A0A0A] bg-white',
      'transition-colors duration-fast',
      'focus:outline-none focus:border-[#E63323]',
    ].join(' '),

    // ── Dividers ─────────────────────────────────────────────────────────
    'divider': 'border-t border-[rgba(10,10,10,0.08)]',
  },
})
