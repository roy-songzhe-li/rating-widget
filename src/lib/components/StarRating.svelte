<script lang="ts">
  import { createToggleGroup } from '@melt-ui/svelte';
  import { writable } from 'svelte/store';
  
  // Props
  export let rating = 0;
  export let maxRating = 5;
  export let size: 'sm' | 'md' | 'lg' = 'md';
  export let readOnly = true;
  
  // Size classes
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };
  
  // Get the appropriate size class
  const starSize = sizeClasses[size];
  
  // Create a writable store for the rating value
  const ratingValue = writable(Math.round(rating));
  
  // Create toggle group component
  const {
    elements: { root, item },
    states: { value }
  } = createToggleGroup({
    type: 'single',
    disabled: readOnly
  });

  // Update rating value when rating prop changes
  $: {
    const roundedRating = Math.round(rating);
    $ratingValue = roundedRating;
  }
</script>

<div use:root class="flex">
  {#each Array(maxRating) as _, i}
    {@const starValue = i + 1}
    <button 
      use:item={{ value: String(starValue) }}
      class="focus:outline-none"
      aria-label={`Rate ${starValue} out of ${maxRating}`}
      tabindex={readOnly ? -1 : 0}
    >
      <span 
        class="{starSize} {starValue <= $ratingValue ? 'text-yellow-400' : 'text-gray-300'}"
        aria-hidden="true"
      >
        ★
      </span>
    </button>
  {/each}
</div> 