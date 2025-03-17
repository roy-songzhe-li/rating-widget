<script>
  import { onMount } from 'svelte';
  
  // State variables
  let items = [];
  let isLoading = true;
  let error = null;
  let sortOption = 'updatedAt'; // Default sort by last updated
  let selectedItem = null;
  let isPopoverLoading = false;
  let popoverError = null;
  let detailedRating = null;
  
  // Sort options
  const sortOptions = [
    { value: 'updatedAt', label: 'Last Updated (Newest)' },
    { value: 'updatedAt_asc', label: 'Last Updated (Oldest)' },
    { value: 'createdAt', label: 'Created Date (Newest)' },
    { value: 'createdAt_asc', label: 'Created Date (Oldest)' },
    { value: 'averageRating', label: 'Highest Rating' },
    { value: 'averageRating_asc', label: 'Lowest Rating' },
    { value: 'totalRatings', label: 'Most Ratings' },
    { value: 'totalRatings_asc', label: 'Least Ratings' }
  ];
  
  // API endpoint - use relative path for development, absolute for production
  const BASE_URL = import.meta.env.DEV 
    ? '' 
    : 'https://nodejs-serverless-function-express-opal-omega.vercel.app';
  
  onMount(async () => {
    await fetchAllRatings();
  });
  
  // Fetch all ratings
  async function fetchAllRatings() {
    isLoading = true;
    error = null;
    
    try {
      const response = await fetch(`${BASE_URL}/api/getAllRatings`, {
        method: 'GET',
        mode: 'cors',
        credentials: 'omit',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch ratings (Status: ${response.status})`);
      }
      
      const data = await response.json();
      items = data.items || [];
      sortItems(); // Sort items after fetching
    } catch (err) {
      console.error('Error fetching ratings:', err);
      error = err.message;
    } finally {
      isLoading = false;
    }
  }
  
  // Fetch detailed rating for an item
  async function fetchDetailedRating(itemId) {
    isPopoverLoading = true;
    popoverError = null;
    
    try {
      const response = await fetch(`${BASE_URL}/api/getRating?itemId=${encodeURIComponent(itemId)}`, {
        method: 'GET',
        mode: 'cors',
        credentials: 'omit',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch rating details (Status: ${response.status})`);
      }
      
      detailedRating = await response.json();
    } catch (err) {
      console.error('Error fetching rating details:', err);
      popoverError = err.message;
    } finally {
      isPopoverLoading = false;
    }
  }
  
  // Handle card click
  function handleCardClick(item) {
    selectedItem = item;
    fetchDetailedRating(item.itemId);
  }
  
  // Close popover
  function closePopover() {
    selectedItem = null;
    detailedRating = null;
    popoverError = null;
  }
  
  // Handle click outside popover
  function handleClickOutside(event) {
    const popover = document.querySelector('.popover-content');
    if (popover && !popover.contains(event.target) && 
        !event.target.closest('.rating-card')) {
      closePopover();
    }
  }
  
  // Sort items based on selected option
  function sortItems() {
    const [field, direction] = sortOption.includes('_asc') 
      ? [sortOption.replace('_asc', ''), 'asc'] 
      : [sortOption, 'desc'];
    
    items = [...items].sort((a, b) => {
      let valueA, valueB;
      
      // Handle date fields
      if (field === 'updatedAt' || field === 'createdAt') {
        valueA = new Date(a[field]).getTime();
        valueB = new Date(b[field]).getTime();
      } else {
        valueA = a[field];
        valueB = b[field];
      }
      
      // Sort based on direction
      if (direction === 'asc') {
        return valueA - valueB;
      } else {
        return valueB - valueA;
      }
    });
  }
  
  // Handle sort change
  function handleSortChange(event) {
    sortOption = event.target.value;
    sortItems();
  }
  
  // Format date
  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  // Handle code copy
  async function handleCopyCode() {
    try {
      await navigator.clipboard.writeText('<script src="https://roy-li.space/rating-widget.js"><\/script>\n<rating-widget></rating-widget>');
      const tooltip = document.getElementById('copy-tooltip');
      tooltip.textContent = 'Copied!';
      tooltip.classList.remove('opacity-0');
      setTimeout(() => {
        tooltip.classList.add('opacity-0');
        setTimeout(() => {
          tooltip.textContent = 'Click to copy';
        }, 300);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }
</script>

<!-- Tailwind CSS CDN -->
<svelte:head>
  <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
  <!-- Add Inter font for Apple-like typography -->
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
</svelte:head>

<!-- Wrapper for event handling -->
<div role="presentation" 
     on:click={handleClickOutside}
     on:keydown={e => e.key === 'Escape' && closePopover()}>
  <!-- Main container with smooth appearance animation -->
  <main class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100/50 font-['Inter'] animate-fade-in p-6 md:p-8">
    <div class="max-w-7xl mx-auto space-y-6">
      <!-- Enhanced header with glassmorphism -->
      <header class="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-sm border border-white/20
                    transition duration-300 hover:shadow-md">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div class="space-y-1">
            <h1 class="text-2xl md:text-3xl font-semibold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Rating Dashboard
            </h1>
            <!-- Animated underline indicator -->
            <div class="h-0.5 w-12 bg-gradient-to-r from-blue-500 to-blue-400 rounded-full
                        transform origin-left transition duration-500 ease-out group-hover:scale-x-150"></div>
          </div>
          <div class="flex flex-wrap items-center gap-3">
            <!-- Enhanced sort control with fixed icon position -->
            <div class="flex items-center gap-2 min-w-[200px] group relative">
              <select id="sort-select" value={sortOption} on:change={handleSortChange} 
                      class="w-full bg-gray-50/80 backdrop-blur-sm border border-gray-200/80 rounded-xl px-4 py-2 
                             text-sm text-gray-600 appearance-none cursor-pointer
                             transition-all duration-300 ease-out
                             hover:border-gray-300/80 hover:bg-white/50 focus:outline-none focus:ring-1 focus:ring-gray-200/50
                             group-hover:shadow-sm pr-10">
          {#each sortOptions as option}
            <option value={option.value}>{option.label}</option>
          {/each}
        </select>
              <!-- Sort icon with animation (fixed position) -->
              <div class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                <svg class="w-4 h-4 text-gray-400 transform transition-transform duration-300 
                           group-hover:text-blue-400 group-hover:rotate-180" 
                     fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                </svg>
              </div>
      </div>
            <!-- Enhanced refresh button -->
            <button class="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm text-gray-600 
                         border border-gray-200/80 rounded-xl px-4 py-2 text-sm font-medium
                         transition-all duration-300 ease-out transform
                         hover:scale-[1.02] hover:shadow-sm hover:border-blue-200/50 hover:text-blue-500
                         active:scale-[0.98] focus:outline-none focus:ring-1 focus:ring-gray-200/50" 
                    on:click={fetchAllRatings}>
              <svg class="w-4 h-4 transition-transform duration-500 ease-out hover:rotate-180" 
                   fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
        </svg>
        Refresh
      </button>
          </div>
    </div>
  </header>
  
      <!-- Enhanced content container -->
      <div class="bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-white/20">
    {#if isLoading}
          <!-- Modern loading state with bouncing dots -->
          <div class="p-12 text-center">
            <div class="inline-flex flex-col items-center gap-4">
              <div class="flex items-center gap-2">
                <!-- Bouncing dots -->
                <div class="w-3 h-3 rounded-full bg-blue-500 animate-bounce-delay-1"></div>
                <div class="w-3 h-3 rounded-full bg-blue-400 animate-bounce-delay-2"></div>
                <div class="w-3 h-3 rounded-full bg-blue-300 animate-bounce-delay-3"></div>
              </div>
              <p class="text-gray-600">Loading ratings...</p>
            </div>
      </div>
    {:else if error}
          <!-- Enhanced error state -->
          <div class="p-12 text-center">
            <div class="inline-flex flex-col items-center gap-4">
              <div class="relative animate-shake">
                <svg class="w-12 h-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                </svg>
              </div>
              <p class="text-gray-600">{error}</p>
              <button class="bg-white/80 backdrop-blur-sm text-gray-600 border border-gray-200/80 
                           rounded-xl px-6 py-2 text-sm font-medium shadow-sm
                           transition-all duration-300 ease-out transform
                           hover:scale-105 hover:shadow-md hover:border-red-200 hover:text-red-500
                           active:scale-95"
                      on:click={fetchAllRatings}>
                Try Again
              </button>
            </div>
          </div>
        {:else if items.length === 0}
          <!-- Enhanced empty state -->
          <div class="p-12 text-center">
            <div class="inline-flex flex-col items-center gap-4">
              <div class="animate-float">
                <svg class="w-16 h-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
                </svg>
              </div>
              <p class="text-gray-600">No ratings found</p>
              <p class="text-sm text-gray-500">Install the Rating Widget to start collecting ratings</p>
            </div>
          </div>
        {:else}
          <!-- Enhanced grid with staggered animation -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {#each items as item, i}
              <button type="button"
                   class="group relative bg-white/60 backdrop-blur-sm rounded-xl p-5 border border-gray-100/20
                          transition-all duration-300 ease-out transform
                          hover:scale-[1.005] hover:-translate-y-0.5 hover:shadow-sm hover:bg-white/70
                          active:scale-[0.995] focus:outline-none focus:ring-1 focus:ring-gray-200/50"
                   style="animation: slide-up 0.5s ease-out forwards {i * 0.1}s"
                   on:click={() => handleCardClick(item)}
                   on:keydown={e => e.key === 'Enter' && handleCardClick(item)}
                   aria-label={`View details for ${item.itemId}`}>
                <div class="space-y-4">
                  <!-- ItemId at top left with original styling -->
                  <div class="flex items-start justify-between">
                    <h3 class="text-base font-medium text-gray-900 break-all group-hover:text-blue-600 
                               transition-colors duration-300">{item.itemId}</h3>
                  </div>
                  
                  <div class="flex items-center gap-3">
                    <span class="text-2xl font-semibold bg-gradient-to-r from-blue-600 to-blue-400 
                               bg-clip-text text-transparent transition-all duration-300
                               group-hover:from-blue-500 group-hover:to-blue-300">
                      {item.averageRating.toFixed(1)}
                    </span>
                    <div class="flex gap-0.5">
                      {#each Array(5) as _, i}
                        <svg class="w-5 h-5 text-yellow-400 transition-transform duration-300 ease-out
                                  hover:scale-110 hover:rotate-3"
                             fill={i < Math.round(item.averageRating) ? "currentColor" : "none"}
                             viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
                        </svg>
                      {/each}
                    </div>
                    <span class="text-sm text-gray-500">
                      ({item.totalRatings} {item.totalRatings === 1 ? 'rating' : 'ratings'})
                    </span>
                  </div>
                  
                  <div class="space-y-2">
                    {#each [5, 4, 3, 2, 1] as starValue}
                      <div class="flex items-center gap-2 group/bar">
                        <span class="w-4 text-right text-sm text-gray-500 transition-colors duration-300
                                   group-hover/bar:text-blue-500">{starValue}</span>
                        <div class="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden
                                  transition-all duration-300 group-hover/bar:h-2.5">
                          <div class="h-full bg-gradient-to-r from-yellow-400 to-yellow-300 rounded-full
                                    transition-all duration-500 ease-out transform origin-left
                                    group-hover/bar:scale-x-[1.01]"
                               style="width: {item.totalRatings > 0 ? (item.ratingCounts[starValue] / item.totalRatings) * 100 : 0}%">
                          </div>
                        </div>
                        <span class="w-8 text-sm text-gray-500 tabular-nums transition-colors duration-300
                                   group-hover/bar:text-blue-500">
                          {item.ratingCounts[starValue] || 0}
                        </span>
                      </div>
                    {/each}
                  </div>
                  
                  <div class="flex flex-col gap-1.5 text-xs text-gray-500 pt-2">
                    <div class="flex items-center gap-2">
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                      </svg>
                      <span>Created: {formatDate(item.createdAt)}</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
                      <span>Updated: {formatDate(item.updatedAt)}</span>
                    </div>
                  </div>
                </div>
              </button>
            {/each}
          </div>
        {/if}
      </div>

      <!-- Enhanced test section with Rating Widget reference -->
      <div class="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-sm border border-white/20 space-y-6">
        <!-- Introduction -->
        <div>
          <div class="flex items-center gap-3 mb-3">
            <svg class="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <h2 class="text-base font-medium text-gray-900">Introduction</h2>
          </div>
          <p class="text-sm text-gray-500 ml-8 leading-relaxed">
            This is the dashboard for visualizing and managing Rating Widget data. View all collected ratings, sort them by various metrics (rating, date, count), and analyze detailed statistics. Simply add the installation script to your HTML to start collecting ratings instantly.
          </p>
        </div>

        <!-- Source Code Links -->
        <div>
          <div class="flex items-center gap-3 mb-3">
            <svg class="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                    d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/>
            </svg>
            <h2 class="text-base font-medium text-gray-900">Source Code</h2>
          </div>
          <div class="ml-8 space-y-3">
            <a href="https://github.com/roy-songzhe-li/rating-widget"
               target="_blank"
               rel="noopener noreferrer"
               class="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-500 transition-colors duration-300">
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path fill-rule="evenodd" clip-rule="evenodd" 
                      d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z"/>
              </svg>
              Frontend Repository
            </a>
            <a href="https://github.com/roy-songzhe-li/nodejs-serverless-function-express"
               target="_blank"
               rel="noopener noreferrer"
               class="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-500 transition-colors duration-300">
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path fill-rule="evenodd" clip-rule="evenodd" 
                      d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z"/>
              </svg>
              Backend Repository
            </a>
          </div>
        </div>

        <div>
          <div class="flex items-center gap-3 mb-3">
            <svg class="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
            </svg>
            <h3 class="text-base font-medium text-gray-900">Installation</h3>
          </div>
          <p class="text-sm text-gray-500 mb-3 ml-8">Add this code to your website:</p>
          <div class="relative group">
            <button type="button"
                    class="block w-full text-left"
                    on:click={() => handleCopyCode()}
                    on:keydown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleCopyCode();
                      }
                    }}
                    aria-label="Click to copy installation code">
              <pre class="bg-gray-50/60 backdrop-blur-sm rounded-xl p-4 text-sm font-mono text-gray-600 
                       overflow-x-auto border border-gray-200/20
                       transition-all duration-300 hover:shadow-md hover:border-blue-200/30"><code>&lt;script src="https://roy-li.space/rating-widget.js"&gt;&lt;/script&gt;
&lt;rating-widget&gt;&lt;/rating-widget&gt;</code></pre>
            </button>
            
            <!-- Copy icon -->
            <div class="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <svg class="w-5 h-5 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
              </svg>
            </div>
            
            <!-- Copy tooltip -->
            <div id="copy-tooltip" 
                 class="absolute -top-10 left-1/2 transform -translate-x-1/2 px-3 py-1 
                        bg-gray-900 text-white text-sm rounded-lg opacity-0
                        transition-opacity duration-300">
              Click to copy
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>

  <!-- Fixed Rating Widget in bottom right corner -->
  <div class="fixed bottom-6 right-6 z-50">
    <!-- <rating-widget></rating-widget> -->
    <rating-widget test="true"></rating-widget>
  </div>
</div>

<!-- Enhanced modal with improved rating bars -->
{#if selectedItem}
  <div class="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 flex items-center justify-center p-4 animate-fade-in" 
       role="dialog"
       tabindex="-1"
       aria-modal="true"
       on:click|self={closePopover}
       on:keydown={e => e.key === 'Escape' && closePopover()}>
    <div class="bg-white/90 backdrop-blur-md rounded-2xl w-full max-w-2xl shadow-xl border border-white/20
                animate-scale-up focus:outline-none focus:ring-1 focus:ring-gray-200/50">
      {#if isPopoverLoading}
        <div class="p-12 text-center">
          <div class="inline-flex flex-col items-center gap-4">
            <div class="flex items-center gap-2">
              <!-- Bouncing dots -->
              <div class="w-3 h-3 rounded-full bg-blue-500 animate-bounce-delay-1"></div>
              <div class="w-3 h-3 rounded-full bg-blue-400 animate-bounce-delay-2"></div>
              <div class="w-3 h-3 rounded-full bg-blue-300 animate-bounce-delay-3"></div>
            </div>
            <p class="text-gray-600">Loading details...</p>
          </div>
        </div>
      {:else if popoverError}
        <div class="p-12 text-center">
          <div class="inline-flex flex-col items-center gap-4">
            <div class="relative animate-shake">
              <svg class="w-12 h-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
            </div>
            <p class="text-gray-600">{popoverError}</p>
            <button class="bg-white/80 backdrop-blur-sm text-gray-600 border border-gray-200/80 
                         rounded-xl px-6 py-2 text-sm font-medium shadow-sm
                         transition-all duration-300 ease-out transform
                         hover:scale-105 hover:shadow-md hover:border-red-200 hover:text-red-500
                         active:scale-95"
                    on:click={closePopover}>
              Close
            </button>
          </div>
        </div>
      {:else if detailedRating}
        <div class="p-6 space-y-6">
          <div class="flex items-start justify-between">
            <div>
              <h3 class="text-xl font-semibold bg-gradient-to-r from-gray-900 to-gray-700 
                         bg-clip-text text-transparent">{detailedRating.itemId}</h3>
              <div class="mt-3 flex items-center gap-3">
                <span class="text-3xl font-semibold bg-gradient-to-r from-blue-600 to-blue-400 
                           bg-clip-text text-transparent">
                  {detailedRating.averageRating.toFixed(1)}
                </span>
                <div class="flex gap-1">
                  {#each Array(5) as _, i}
                    <svg class="w-6 h-6 text-yellow-400 transition-transform duration-300 ease-out
                              hover:scale-125 hover:rotate-12"
                         fill={i < Math.round(detailedRating.averageRating) ? "currentColor" : "none"}
                         viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
                    </svg>
                  {/each}
                </div>
              </div>
            </div>
            <button class="text-gray-400 hover:text-gray-600 transition-colors duration-300
                         hover:rotate-90 transform focus:outline-none focus:ring-1 focus:ring-gray-200/50"
                    on:click={closePopover}
                    aria-label="Close details">
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" 
                      d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
            </div>
            
          <div class="space-y-2">
              {#each [5, 4, 3, 2, 1] as starValue}
              <div class="flex items-center gap-3 group">
                <span class="w-4 text-right font-medium text-gray-600 transition-colors duration-300
                           group-hover:text-blue-500">{starValue}</span>
                <div class="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden
                          transition-all duration-300 group-hover:h-4">
                  <div class="h-full bg-gradient-to-r from-yellow-400 to-yellow-300 rounded-full
                            transition-all duration-500 ease-out transform origin-left
                            group-hover:scale-x-[1.02]"
                       style="width: {detailedRating.totalRatings > 0 ? 
                              (detailedRating.ratingCounts[starValue] / detailedRating.totalRatings) * 100 : 0}%">
                  </div>
                </div>
                <span class="w-16 text-sm text-gray-500 tabular-nums transition-colors duration-300
                           group-hover:text-blue-500">
                  {detailedRating.ratingCounts[starValue] || 0} ratings
                </span>
                </div>
              {/each}
            </div>
            
          <div class="pt-4 border-t border-gray-200/50">
            <div class="flex flex-col gap-2 text-sm text-gray-500">
              <div class="flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
                <span>Created: {formatDate(detailedRating.createdAt)}</span>
                </div>
              <div class="flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span>Updated: {formatDate(detailedRating.updatedAt)}</span>
              </div>
            </div>
          </div>
      </div>
    {/if}
    </div>
  </div>
{/if}

<style>
  /* Animation keyframes */
  @keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes scale-up {
    from { 
      opacity: 0;
      transform: scale(0.95);
    }
    to { 
      opacity: 1;
      transform: scale(1);
    }
  }
  
  @keyframes slide-up {
    from { 
      opacity: 0;
      transform: translateY(20px);
    }
    to { 
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-4px); }
    75% { transform: translateX(4px); }
  }
  
  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }

  /* Bouncing dots animations */
  @keyframes bounce-delay {
    0%, 80%, 100% { 
      transform: scale(0.6);
      opacity: 0.6;
    }
    40% { 
      transform: scale(1);
      opacity: 1;
    }
  }
  
  /* Animation classes */
  .animate-fade-in {
    animation: fade-in 0.3s ease-out;
  }
  
  .animate-scale-up {
    animation: scale-up 0.3s ease-out;
  }
  
  .animate-shake {
    animation: shake 0.5s ease-in-out;
  }
  
  .animate-float {
    animation: float 3s ease-in-out infinite;
  }

  /* Bouncing dots classes */
  .animate-bounce-delay-1 {
    animation: bounce-delay 1.4s infinite ease-in-out;
  }
  
  .animate-bounce-delay-2 {
    animation: bounce-delay 1.4s infinite ease-in-out 0.2s;
  }
  
  .animate-bounce-delay-3 {
    animation: bounce-delay 1.4s infinite ease-in-out 0.4s;
  }
</style> 