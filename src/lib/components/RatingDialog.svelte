<script lang="ts">
  import { createDialog } from '@melt-ui/svelte';
  import { fade } from 'svelte/transition';

  // Props
  export let title = 'Rating Details';
  
  // Dialog state
  const {
    elements: { trigger, overlay, content, title: dialogTitle, description, close },
    states: { open },
  } = createDialog({
    forceVisible: true,
  });

  // Methods
  export function openDialog() {
    $open = true;
  }

  export function closeDialog() {
    $open = false;
  }
</script>

<!-- Dialog Trigger (hidden, controlled programmatically) -->
<button use:trigger style="display: none;" aria-label="Open dialog"></button>

{#if $open}
  <!-- Overlay -->
  <div 
    use:overlay 
    class="fixed inset-0 bg-black/50 z-50" 
    transition:fade={{ duration: 150 }}
  ></div>

  <!-- Dialog Content -->
  <div
    use:content
    class="fixed left-[50%] top-[50%] z-50 max-h-[85vh] w-[90vw] max-w-3xl translate-x-[-50%] translate-y-[-50%] overflow-auto rounded-lg bg-white p-6 shadow-lg"
    transition:fade={{ duration: 150 }}
  >
    <!-- Dialog Header -->
    <div class="mb-4 flex items-center justify-between">
      <h2 use:dialogTitle class="text-xl font-semibold text-gray-900">{title}</h2>
      <button 
        use:close
        class="inline-flex h-8 w-8 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300"
        aria-label="Close dialog"
      >
        <span class="sr-only">Close</span>
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
        </svg>
      </button>
    </div>

    <!-- Dialog Content -->
    <div use:description>
      <slot></slot>
    </div>
  </div>
{/if} 