<svelte:options customElement="rating-widget" />

<script>
  import { onMount } from 'svelte';
  import { fade, fly, scale } from 'svelte/transition';
  import { elasticOut, cubicOut } from 'svelte/easing';
  
  // State variables
  let rating = 0;
  let hoverRating = 0;
  let hasRated = false;
  let itemId = '';
  let userId = '';
  let isSubmitting = false;
  let submitSuccess = false;
  let submitError = false;
  let errorMessage = '';
  let testMode = false; // Test mode state variable
  let animationComplete = false; // Track animation completion
  let isMinimized = false; // Track if panel is minimized to star
  let resetSuccess = false; // Track reset success state
  
  // Export properties, allows setting test mode from outside
  export let test = '';
  
  // API endpoint - always use absolute URL for cross-origin compatibility
  const API_URL = 'https://nodejs-serverless-function-express-opal-omega.vercel.app/api';
  
  // Function to generate random user ID
  function generateRandomUserId() {
    return 'user-' + Math.random().toString(36).substring(2, 15);
  }
  
  // Handle animation completion
  function handleAnimationComplete() {
    animationComplete = true;
  }
  
  // Toggle between minimized and expanded states
  function toggleMinimized() {
    isMinimized = !isMinimized;
    
    // Reset animation state when expanding to ensure stars appear properly
    if (!isMinimized) {
      setTimeout(() => {
        animationComplete = true;
      }, 300);
    }
  }
  
  onMount(() => {
    try {
      // Check if test mode is set
      testMode = test === 'true';
      
      // Log test mode status
      if (testMode) {
        console.log('Rating Widget initialized in TEST MODE');
      }
      
      // Generate a random user ID
      userId = generateRandomUserId();
      
      // Get current URL hostname as itemId
      itemId = window.location.hostname;
      
      // Use test itemId for local development
      if (itemId === 'localhost') {
        itemId = 'localhost-test';
      }
      
      // Only check local storage rating in non-test mode
      if (!testMode) {
        checkLocalRating();
      }
      
      // Set animation complete after a small delay to ensure stars appear
      setTimeout(() => {
        animationComplete = true;
      }, 300);
      
      // Log successful initialization
      console.log('Rating Widget initialized for:', itemId);
    } catch (error) {
      console.error('Error initializing Rating Widget:', error);
    }
  });
  
  // Check if user has already rated this item (using localStorage)
  function checkLocalRating() {
    try {
      // Create unique key for this item and user
      const storageKey = `rating_${itemId}`;
      
      // Try to get rating from localStorage
      const storedRating = localStorage.getItem(storageKey);
      
      if (storedRating) {
        // Parse stored data
        const ratingData = JSON.parse(storedRating);
        rating = ratingData.rating;
        hasRated = true;
      }
    } catch (error) {
      console.error('Error checking local rating:', error);
      // Continue without showing error to user
    }
  }
  
  // Handle star hover
  function handleStarHover(value) {
    hoverRating = value;
  }
  
  // Handle star leave
  function handleStarLeave() {
    hoverRating = 0;
  }
  
  // Handle star click
  function handleStarClick(value) {
    rating = value;
    submitRating();
  }
  
  // Reset states if needed
  function resetState() {
    hoverRating = 0;
  }
  
  // Submit rating to API
  async function submitRating() {
    if (rating === 0) return;
    
    isSubmitting = true;
    submitSuccess = false;
    submitError = false;
    
    try {
      // Generate new userId for each rating in test mode
      if (testMode) {
        userId = generateRandomUserId();
        console.log('Test mode: Generated new userId:', userId);
      }
      
      // Only save to localStorage in non-test mode
      if (!testMode) {
        try {
          const storageKey = `rating_${itemId}`;
          const ratingData = {
            rating,
            userId,
            timestamp: new Date().toISOString()
          };
          localStorage.setItem(storageKey, JSON.stringify(ratingData));
        } catch (storageError) {
          console.warn('Could not save to localStorage:', storageError);
        }
      } else {
        console.log('Test mode: Skipping localStorage save');
      }
      
      // Then submit to API
      const response = await fetch(`${API_URL}/saveRating`, {
        method: 'POST',
        mode: 'cors',
        credentials: 'omit',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Origin': window.location.origin
        },
        body: JSON.stringify({
          itemId,
          rating,
          userId,
          testMode
        }),
      });
      
      if (response.ok) {
        hasRated = true;
        submitSuccess = true;
        setTimeout(() => {
          // Reset success message after showing it for a while
          submitSuccess = false;
        }, 3000);
      } else {
        // Try to parse error response
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = { message: 'Failed to parse error response' };
        }
        
        submitError = true;
        errorMessage = errorData.message || `Failed to submit rating (Status: ${response.status})`;
        console.error('API error:', errorMessage);
      }
    } catch (error) {
      // Even if API call fails, we try to save to localStorage
      // so we can still show success to user
      hasRated = true;
      submitSuccess = true;
      setTimeout(() => {
        // Reset success message after showing it for a while
        submitSuccess = false;
      }, 3000);
      
      // Log error but don't show to user
      console.error('Error submitting rating to API:', error);
    } finally {
      isSubmitting = false;
    }
  }
  
  // Function to reset rating state
  function resetRating() {
    // Clear localStorage rating
    try {
      const storageKey = `rating_${itemId}`;
      localStorage.removeItem(storageKey);
      
      // Show success message
      resetSuccess = true;
      setTimeout(() => {
        resetSuccess = false;
      }, 3000);
      
    } catch (error) {
      console.warn('Could not clear localStorage:', error);
    }
    
    // Generate new userId in test mode
    if (testMode) {
      userId = generateRandomUserId();
      console.log('Test mode: Generated new userId after reset:', userId);
    }
    
    // Reset all state variables
    rating = 0;
    hoverRating = 0;
    hasRated = false;
    isSubmitting = false;
    submitSuccess = false;
    submitError = false;
    errorMessage = '';
  }
</script>

<div class="rating-widget-container">
  <!-- Minimized star button shown when the main panel is closed -->
  {#if isMinimized}
    <div 
      class="minimized-star-wrapper"
      transition:scale={{ duration: 300, start: 0.5, opacity: 0.5, easing: elasticOut }}
    >
      <button 
        class="minimized-star-button" 
        on:click={toggleMinimized}
        aria-label="Open rating panel"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="pulse-star">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
        </svg>
      </button>
    </div>
  {:else}
    <!-- Rating widget with animations - shown by default until minimized -->
    <div 
      class="rating-panel glassmorphism rating-panel-open" 
      transition:fly={{ y: 20, duration: 400, easing: cubicOut }}
    >
      <div class="rating-header">
        <h3>How was your experience?</h3>
        <div class="header-actions">
          {#if testMode}
            <button 
              class="reset-button" 
              on:click={resetRating} 
              aria-label="Reset rating"
              data-tooltip="Clear Local Storage"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.3"/>
              </svg>
            </button>
          {/if}
          <button class="close-button" on:click={toggleMinimized} aria-label="Minimize rating panel">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>
      
      <div class="rating-content">
        {#if !hasRated || submitSuccess || testMode}
          <div class="stars-container">
            {#each Array(5) as _, i}
              <button 
                class="star-button"
                class:active={i < (hoverRating || rating)}
                on:mouseenter={() => handleStarHover(i + 1)}
                on:mouseleave={handleStarLeave}
                on:click={() => handleStarClick(i + 1)}
                disabled={isSubmitting}
                aria-label={`Rate ${i + 1} star${i !== 0 ? 's' : ''}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill={i < (hoverRating || rating) ? "currentColor" : "none"} stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="star-svg">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
              </button>
            {/each}
          </div>
          
          {#if isSubmitting}
            <div class="loading-indicator" in:fade={{ duration: 300 }}>
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <circle cx="4" cy="12" r="3">
                  <animate id="spinner_qFRN" begin="0;spinner_OcgL.end+0.25s" attributeName="cy" calcMode="spline" dur="0.6s" values="12;6;12" keySplines=".33,.66,.66,1;.33,0,.66,.33"/>
                </circle>
                <circle cx="12" cy="12" r="3">
                  <animate begin="spinner_qFRN.begin+0.1s" attributeName="cy" calcMode="spline" dur="0.6s" values="12;6;12" keySplines=".33,.66,.66,1;.33,0,.66,.33"/>
                </circle>
                <circle cx="20" cy="12" r="3">
                  <animate id="spinner_OcgL" begin="spinner_qFRN.begin+0.2s" attributeName="cy" calcMode="spline" dur="0.6s" values="12;6;12" keySplines=".33,.66,.66,1;.33,0,.66,.33"/>
                </circle>
              </svg>
              <span>Submitting...</span>
            </div>
          {/if}
          
          {#if submitSuccess}
            <div class="success-message" in:fade={{ duration: 300 }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              <span>Thank you for your rating!</span>
            </div>
          {/if}
          
          {#if resetSuccess}
            <div class="success-message reset-success" in:fade={{ duration: 300 }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.3"/>
              </svg>
              <span>Rating has been reset</span>
            </div>
          {/if}
          
          {#if submitError}
            <div class="error-message" in:scale={{ duration: 400, start: 0.8, easing: elasticOut }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <span>{errorMessage}</span>
            </div>
          {/if}
        {:else}
          <div class="already-rated" in:fade={{ duration: 400 }}>
            <div class="rating-value">
              <span class="rating-number">{rating}.0</span>
              <span class="rating-max">/5</span>
            </div>
            <div class="stars-display">
              {#each Array(5) as _, i}
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="20" 
                  height="20" 
                  viewBox="0 0 24 24" 
                  fill={i < rating ? "currentColor" : "none"} 
                  stroke="currentColor" 
                  stroke-width="2" 
                  stroke-linecap="round" 
                  stroke-linejoin="round"
                  class="rated-star"
                >
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
              {/each}
            </div>
            <p class="rated-message">Thanks for rating!</p>
          </div>
        {/if}
      </div>
    </div>
  {/if}
</div>

<style>
  /* Ensure all styles are contained within the component to avoid conflicts with host page */
  :host {
    display: block;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  }
  
  .rating-widget-container {
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 9999;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  }
  
  /* Glassmorphism panel */
  .glassmorphism {
    background: rgba(255, 255, 255, 0.55);
    backdrop-filter: blur(24px) saturate(200%);
    -webkit-backdrop-filter: blur(24px) saturate(200%);
    border: 1px solid rgba(255, 255, 255, 0.3);
  }
  
  .rating-panel {
    width: 280px;
    border-radius: 14px;
    box-shadow: 
      0 8px 32px rgba(0, 0, 0, 0.08), 
      0 2px 16px rgba(0, 0, 0, 0.04),
      0 0 1px rgba(0, 0, 0, 0.02);
    overflow: hidden;
    opacity: 0;
    pointer-events: none;
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  }
  
  .rating-panel-open {
    opacity: 1;
    pointer-events: all;
  }
  
  .rating-header {
    padding: 16px 16px 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: transparent;
  }
  
  .rating-header h3 {
    margin: 0;
    font-size: 14px;
    font-weight: 500;
    color: #333;
    flex: 1;
    letter-spacing: -0.01em;
  }
  
  .header-actions {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-left: 8px;
  }
  
  /* Close button in the top right corner */
  .close-button {
    background: transparent;
    border: none;
    color: #999;
    cursor: pointer;
    padding: 6px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
  }
  
  .close-button:hover {
    background-color: rgba(245, 245, 245, 0.8);
    color: #666;
    transform: rotate(90deg);
  }

  .reset-button {
    background: transparent;
    border: none;
    color: #999;
    cursor: pointer;
    padding: 6px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    position: relative;
  }
  
  .reset-button:hover {
    background-color: rgba(245, 245, 245, 0.8);
    color: #666;
  }

  .reset-button svg {
    transition: all 0.2s ease;
  }

  .reset-button:hover svg {
    transform: rotate(180deg);
  }

  /* Tooltip styles */
  [data-tooltip] {
    position: relative;
  }

  [data-tooltip]:before {
    content: attr(data-tooltip);
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    padding: 6px 10px;
    border-radius: 6px;
    background: rgba(0, 0, 0, 0.8);
    color: white;
    font-size: 12px;
    white-space: nowrap;
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.2s ease, visibility 0.2s ease;
    pointer-events: none;
    margin-top: 5px;
    z-index: 1000;
  }

  [data-tooltip]:hover:before {
    opacity: 1;
    visibility: visible;
  }

  .rating-content {
    padding: 0 20px 20px;
  }

  /* Remove the border from rating-header */
  .rating-header {
    border-bottom: none;
  }

  /* Ensure tooltip container doesn't clip */
  .rating-panel {
    overflow: visible;
  }

  /* Adjust stars container spacing */
  .stars-container {
    margin-top: 8px;
    margin-bottom: 12px;
  }

  /* Adjust star button size */
  .star-button svg {
    width: 28px;
    height: 28px;
  }

  /* Mobile adjustments */
  @media (max-width: 480px) {
    .rating-header {
      padding: 14px 14px 10px;
    }

    .rating-content {
      padding: 0 16px 16px;
    }

    .star-button svg {
      width: 24px;
      height: 24px;
    }
  }
  
  /* Minimized star button with reduced glow */
  .minimized-star-button {
    background: transparent;
    border: none;
    color: #FFCC00;
    cursor: pointer;
    padding: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    filter: drop-shadow(0 0 6px rgba(255, 204, 0, 0.3));
  }
  
  .minimized-star-button:hover {
    transform: scale(1.1);
    filter: drop-shadow(0 0 8px rgba(255, 204, 0, 0.4));
  }
  
  /* Softer animation for the minimized star */
  .pulse-star {
    animation: pulse-minimized 3s infinite;
  }
  
  @keyframes pulse-minimized {
    0% {
      transform: scale(1);
      filter: drop-shadow(0 0 4px rgba(255, 204, 0, 0.2));
    }
    50% {
      transform: scale(1.08);
      filter: drop-shadow(0 0 6px rgba(255, 204, 0, 0.3));
    }
    100% {
      transform: scale(1);
      filter: drop-shadow(0 0 4px rgba(255, 204, 0, 0.2));
    }
  }
  
  .rating-content {
    padding: 20px;
  }
  
  /* Stars container with improved spacing */
  .stars-container {
    display: flex;
    justify-content: center;
    gap: 8px;
    margin-bottom: 16px;
  }
  
  /* Enhanced star buttons with better animations */
  .star-button {
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 6px;
    color: #FFCC00;
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    position: relative;
    overflow: visible;
  }
  
  .star-button:nth-child(1) svg { animation: star-bounce 2s infinite; animation-delay: 0s; }
  .star-button:nth-child(2) svg { animation: star-bounce 2s infinite; animation-delay: 0.2s; }
  .star-button:nth-child(3) svg { animation: star-bounce 2s infinite; animation-delay: 0.4s; }
  .star-button:nth-child(4) svg { animation: star-bounce 2s infinite; animation-delay: 0.6s; }
  .star-button:nth-child(5) svg { animation: star-bounce 2s infinite; animation-delay: 0.8s; }

  .star-button.active svg,
  .star-button:hover svg {
    animation: none;
  }
  
  @keyframes star-bounce {
    0%, 20%, 100% {
      transform: scale(1);
    }
    10% {
      transform: scale(1.15);
    }
  }

  .star-button:hover, .star-button.active {
    transform: scale(1.15);
    filter: drop-shadow(0 0 8px rgba(255, 204, 0, 0.5));
  }
  
  .star-button:hover::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 40px;
    height: 40px;
    background: radial-gradient(circle, rgba(255, 204, 0, 0.2) 0%, rgba(255, 204, 0, 0) 70%);
    border-radius: 50%;
    transform: translate(-50%, -50%);
    z-index: -1;
    animation: pulse-star 1s infinite;
  }
  
  @keyframes pulse-star {
    0% {
      transform: translate(-50%, -50%) scale(0.8);
      opacity: 0.8;
    }
    100% {
      transform: translate(-50%, -50%) scale(1.5);
      opacity: 0;
    }
  }
  
  /* Star SVG animation */
  .star-svg {
    transition: all 0.3s ease;
    transform-origin: center;
  }
  
  .star-button.active .star-svg {
    animation: star-fill 0.5s forwards;
  }
  
  @keyframes star-fill {
    0% {
      transform: scale(0.8);
    }
    50% {
      transform: scale(1.2);
    }
    100% {
      transform: scale(1);
    }
  }
  
  /* Loading indicator with new animation */
  .loading-indicator {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    margin-top: 12px;
    padding: 10px;
    color: #333;
    font-size: 14px;
    font-weight: 500;
    letter-spacing: -0.01em;
  }
  
  .loading-indicator svg {
    width: 20px;
    height: 20px;
  }
  
  .loading-indicator circle {
    fill: #333;
    opacity: 0.8;
  }

  /* Enhanced message styles without borders */
  .success-message, .error-message {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin-top: 12px;
    padding: 10px 12px;
    border-radius: 10px;
    font-size: 13px;
    font-weight: 500;
    background: rgba(52, 199, 89, 0.08);
    border: none;
  }
  
  .success-message {
    color: #34C759;
  }
  
  .success-message svg {
    opacity: 0.9;
  }

  /* Reset success message specific styles */
  .reset-success {
    color: #34C759;
    background: rgba(52, 199, 89, 0.08);
  }

  .reset-success svg {
    opacity: 0.9;
    width: 16px;
    height: 16px;
  }
  
  .error-message {
    background: rgba(255, 59, 48, 0.08);
    color: #FF3B30;
    border: none;
  }
  
  /* Modern already rated display with updated styles */
  .already-rated {
    text-align: center;
    color: #333;
    padding: 12px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }
  
  .rating-value {
    display: flex;
    align-items: baseline;
    gap: 2px;
  }
  
  .rating-number {
    font-size: 24px;
    font-weight: 600;
    color: #FFCC00;
    line-height: 1;
  }
  
  .rating-max {
    font-size: 14px;
    color: #999;
    font-weight: 500;
  }
  
  .stars-display {
    display: flex;
    justify-content: center;
    gap: 4px;
    color: #FFCC00;
    margin-top: -2px;
  }
  
  .rated-star {
    filter: drop-shadow(0 0 4px rgba(255, 204, 0, 0.2));
    width: 18px;
    height: 18px;
  }
  
  .rated-message {
    margin: 0;
    font-size: 13px;
    font-weight: 500;
    color: #666;
    opacity: 0.9;
  }
  
  /* Fix for minimized star position */
  .minimized-star-wrapper {
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 9999;
  }
  
  /* Responsive adjustments for mobile */
  @media (max-width: 480px) {
    .rating-panel {
      width: 260px;
    }
    
    .stars-container {
      gap: 6px;
    }
    
    .star-button svg {
      width: 24px;
      height: 24px;
    }
  }
</style>