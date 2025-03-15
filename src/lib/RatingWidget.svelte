<svelte:options customElement="rating-widget" />

<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { onMount } from 'svelte';

  // Component properties
  export let itemId = '';
  export let callbackUrl = 'https://nodejs-serverless-function-express-opal-omega.vercel.app/api/saveRating';
  export let userId = 'anonymous';

  // Create event dispatcher
  const dispatch = createEventDispatcher<{
    'rating-submitted': { itemId: string, rating: number, userId: string }
  }>();

  // Component state
  let selectedRating = 0;
  let hoverRating = 0;
  let submitted = false;
  let submitting = false;
  let error = '';
  let loaded = false;

  // Fixed number of stars: 5
  const maxRating = 5;

  // Generate or retrieve userId
  function getOrCreateUserId() {
    // If userId is already provided and not the default, use it
    if (userId !== 'anonymous') return;
    
    try {
      // Try to get existing userId from localStorage
      const storedUserId = localStorage.getItem('rating_widget_user_id');
      
      if (storedUserId) {
        userId = storedUserId;
      } else {
        // Generate a new userId
        const randomPart = Math.random().toString(36).substring(2, 10);
        const timestamp = Date.now();
        userId = `user-${randomPart}-${timestamp}`;
        
        // Save to localStorage
        localStorage.setItem('rating_widget_user_id', userId);
      }
      
      console.log('User ID:', userId);
    } catch (e) {
      // If localStorage is not available (e.g., in private mode), continue with default
      console.warn('Could not access localStorage, using default userId');
    }
  }

  // Generate itemId if not provided - simplified to use main URL
  function generateItemId() {
    // If itemId is already provided, use it
    if (itemId) return;
    
    try {
      // Get the current URL
      const url = new URL(window.location.href);
      
      // Extract the hostname and pathname (without query parameters or hash)
      const hostname = url.hostname;
      const pathname = url.pathname;
      
      // Clean the pathname (remove trailing slash if present)
      const cleanPathname = pathname.endsWith('/') && pathname.length > 1 
        ? pathname.slice(0, -1) 
        : pathname;
      
      // Create a clean URL as the base for itemId
      let urlBase = hostname + cleanPathname;
      
      // Remove any special characters that might cause issues
      urlBase = urlBase.replace(/[^a-zA-Z0-9-_.]/g, '-');
      
      // Generate the final itemId
      itemId = `url-${urlBase}`;
      
      console.log('Auto-generated itemId:', itemId);
    } catch (e) {
      // Fallback in case of any errors
      console.warn('Error generating itemId from URL, using fallback method');
      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 10000);
      itemId = `page-${random}-${timestamp}`;
    }
  }

  // Load Skeleton Elements library and generate itemId
  onMount(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdn.jsdelivr.net/npm/skeleton-elements@4.0.1/css/skeleton-elements.css';
    document.head.appendChild(link);
    
    // Generate itemId
    generateItemId();
    
    // Get or create userId
    getOrCreateUserId();
    
    // Mark as loaded
    loaded = true;
  });

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
    
    // Ensure we have an itemId
    if (!itemId) {
      generateItemId();
    }
    
    submitting = true;
    error = '';
    
    try {
      // Send rating data to server
      const response = await fetch(callbackUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          itemId, 
          rating: selectedRating,
          userId
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit rating');
      }
      
      submitted = true;
      
      // Trigger custom event
      dispatch('rating-submitted', { 
        itemId,
        rating: selectedRating,
        userId
      });
      
    } catch (err) {
      error = err instanceof Error ? err.message : 'An error occurred';
    } finally {
      submitting = false;
    }
  }
</script>

<div class="rating-widget">
  <div class="stars-container">
    <div class="stars">
      {#each Array(maxRating) as _, i}
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
          aria-label={`Rate ${rating} out of ${maxRating}`}
        >
          <span class="star-icon">★</span>
        </button>
      {/each}
    </div>
  </div>
  
  {#if !submitted}
    <button 
      class="submit-button skeleton-button skeleton-button-rounded" 
      disabled={!selectedRating || submitting} 
      on:click={submitRating}
    >
      {#if submitting}
        <div class="skeleton-effect-blink">
          <span class="skeleton-text">Submitting...</span>
        </div>
      {:else}
        Submit Rating
      {/if}
    </button>
  {:else}
    <div class="thank-you">
      <svg class="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
        <circle class="checkmark-circle" cx="26" cy="26" r="25" fill="none"/>
        <path class="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
      </svg>
      <span>Thank you for your feedback!</span>
    </div>
  {/if}
  
  {#if error}
    <div class="error">{error}</div>
  {/if}
</div>

<style>
  .rating-widget {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 1.5rem;
    border-radius: 12px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
    max-width: 320px;
    background-color: #ffffff;
    transition: all 0.3s ease;
    
    /* Position the widget in the bottom right corner */
    position: fixed;
    bottom: 20px;
    right: 20px;
    margin: 0;
    z-index: 1000;
  }
  
  .stars-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 1.5rem;
    position: relative;
  }
  
  .stars {
    display: flex;
    justify-content: center;
    gap: 0.5rem;
  }
  
  .star {
    background: none;
    border: none;
    font-size: 0;
    cursor: pointer;
    padding: 0;
    transition: transform 0.2s ease;
    position: relative;
  }
  
  .star:focus {
    outline: none;
  }
  
  .star:hover {
    transform: scale(1.1);
  }
  
  .star-icon {
    font-size: 2.2rem;
    color: #e0e0e0;
    display: block;
    line-height: 1;
  }
  
  .star.active .star-icon {
    color: #ff9500;
  }
  
  .star.selected .star-icon {
    color: #ff9500;
  }
  
  .submit-button {
    width: 100%;
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
    font-weight: 500;
    border: none;
    background-color: #007aff;
    color: white;
    border-radius: 10px;
    cursor: pointer;
    transition: background-color 0.2s, transform 0.1s;
    -webkit-appearance: none;
    appearance: none;
  }
  
  .submit-button:hover:not(:disabled) {
    background-color: #0071e3;
  }
  
  .submit-button:active:not(:disabled) {
    transform: scale(0.98);
  }
  
  .submit-button:disabled {
    background-color: #d1d1d6;
    cursor: not-allowed;
    opacity: 0.8;
  }
  
  .thank-you {
    display: flex;
    flex-direction: column;
    align-items: center;
    color: #34c759;
    font-weight: 500;
    margin: 0.5rem 0;
    animation: fadeIn 0.5s ease-out;
  }
  
  .error {
    color: #ff3b30;
    margin-top: 0.75rem;
    font-size: 0.85rem;
    text-align: center;
    animation: fadeIn 0.3s ease-out;
  }
  
  /* Animations */
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  /* Success checkmark animation */
  .checkmark {
    width: 36px;
    height: 36px;
    margin-bottom: 0.5rem;
  }
  
  .checkmark-circle {
    stroke-dasharray: 166;
    stroke-dashoffset: 166;
    stroke-width: 2;
    stroke: #34c759;
    fill: none;
    animation: stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
  }
  
  .checkmark-check {
    transform-origin: 50% 50%;
    stroke-dasharray: 48;
    stroke-dashoffset: 48;
    stroke-width: 3;
    stroke: #34c759;
    animation: stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.6s forwards;
  }
  
  @keyframes stroke {
    100% {
      stroke-dashoffset: 0;
    }
  }
</style> 