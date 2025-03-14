<svelte:options customElement="rating-widget" />

<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  // Define component properties
  export let maxRating = 5;
  export let theme = 'light';
  export let callbackUrl = '';

  // Create event dispatcher
  const dispatch = createEventDispatcher<{
    'rating-submitted': { rating: number }
  }>();

  // Component state
  let selectedRating = 0;
  let hoverRating = 0;
  let submitted = false;
  let submitting = false;
  let error = '';

  // Handle star hover
  function handleMouseEnter(rating: number) {
    if (!submitted) {
      hoverRating = rating;
    }
  }

  // Handle mouse leave
  function handleMouseLeave() {
    if (!submitted) {
      hoverRating = 0;
    }
  }

  // Handle star click
  function handleClick(rating: number) {
    if (!submitted) {
      selectedRating = rating;
    }
  }

  // Submit rating
  async function submitRating() {
    if (!selectedRating || submitted || submitting) return;
    
    submitting = true;
    error = '';
    
    try {
      if (callbackUrl) {
        const response = await fetch(callbackUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ rating: selectedRating }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to submit rating');
        }
      }
      
      submitted = true;
      
      // Trigger custom event
      dispatch('rating-submitted', { rating: selectedRating });
      
    } catch (err) {
      error = err instanceof Error ? err.message : 'An error occurred';
    } finally {
      submitting = false;
    }
  }
</script>

<div class="rating-widget" data-theme={theme}>
  <div class="stars">
    {#each Array(Number(maxRating)) as _, i}
      {@const rating = i + 1}
      <button
        type="button"
        class="star"
        class:active={rating <= (hoverRating || selectedRating)}
        class:selected={!hoverRating && rating <= selectedRating}
        disabled={submitted}
        on:mouseenter={() => handleMouseEnter(rating)}
        on:mouseleave={handleMouseLeave}
        on:click={() => handleClick(rating)}
      >
        ★
      </button>
    {/each}
  </div>
  
  {#if !submitted}
    <button 
      class="submit-button" 
      disabled={!selectedRating || submitting} 
      on:click={submitRating}
    >
      {submitting ? 'Submitting...' : 'Submit Rating'}
    </button>
  {:else}
    <div class="thank-you">Thank you for your rating!</div>
  {/if}
  
  {#if error}
    <div class="error">{error}</div>
  {/if}
</div>

<style>
  .rating-widget {
    font-family: Arial, sans-serif;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 1rem;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    max-width: 300px;
    margin: 0 auto;
    background-color: #fff;
  }
  
  .stars {
    display: flex;
    margin-bottom: 1rem;
  }
  
  .star {
    background: none;
    border: none;
    font-size: 2rem;
    cursor: pointer;
    color: #ccc;
    transition: color 0.2s;
    padding: 0 0.25rem;
  }
  
  .star.active, .star.selected {
    color: #ffb400;
  }
  
  .submit-button {
    padding: 0.5rem 1rem;
    background-color: #4a90e2;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9rem;
    transition: background-color 0.2s;
  }
  
  .submit-button:hover:not(:disabled) {
    background-color: #3a80d2;
  }
  
  .submit-button:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
  
  .thank-you {
    color: #4a90e2;
    font-weight: bold;
    margin: 0.5rem 0;
  }
  
  .error {
    color: #e74c3c;
    margin-top: 0.5rem;
    font-size: 0.8rem;
  }
  
  /* Ensure styles are encapsulated within the component */
  :global([data-theme="light"]) {
    --star-color: #ffb400;
    --bg-color: #ffffff;
    --text-color: #333333;
  }
</style> 