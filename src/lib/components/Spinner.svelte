<script lang="ts">
  import { onMount } from 'svelte';
  import { writable } from 'svelte/store';

  export let size: 'sm' | 'md' | 'lg' | 'xl' = 'md';
  export let text = 'Loading...';
  export let showText = true;
  
  // Size classes
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-10 w-10'
  };
  
  // Get the appropriate size class
  const spinnerSize = sizeClasses[size];

  // Simulate progress for visual effect
  const progress = writable(0);
  
  onMount(() => {
    const interval = setInterval(() => {
      progress.update(value => (value + 5) % 100);
    }, 200);
    
    return () => clearInterval(interval);
  });
</script>

<div class="flex flex-col items-center justify-center">
  <div class="relative {spinnerSize}">
    <svg 
      class="animate-spin text-indigo-500" 
      viewBox="0 0 24 24"
      aria-valuetext={`Loading ${$progress}%`}
      aria-valuenow={$progress}
      role="progressbar"
      aria-valuemin="0"
      aria-valuemax="100"
    >
      <circle 
        class="opacity-25" 
        cx="12" 
        cy="12" 
        r="10" 
        stroke="currentColor" 
        stroke-width="4"
        fill="none"
      ></circle>
      <path 
        class="opacity-75" 
        fill="currentColor" 
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
    <span class="sr-only">{$progress}%</span>
  </div>
  
  {#if showText && text}
    <p class="mt-2 text-sm text-gray-500">{text}</p>
  {/if}
</div>

<style>
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  
  .animate-spin {
    animation: spin 1s linear infinite;
  }
</style> 