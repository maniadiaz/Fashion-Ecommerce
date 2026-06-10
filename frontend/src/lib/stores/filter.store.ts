import { writable } from 'svelte/store'

// Tracks the active category slug, or null for "All"
export const selectedCategory = writable<string | null>(null)
