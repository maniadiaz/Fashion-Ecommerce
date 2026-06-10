<script lang="ts">
  export let width = '100%'
  export let height = '1rem'
  export let rounded = false
</script>

<div
  class="animate-pulse bg-gray-200"
  class:rounded-full={rounded}
  style="width: {width}; height: {height};"
></div>
