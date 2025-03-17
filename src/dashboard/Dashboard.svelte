<script>
  import { onMount } from 'svelte';
  
  // State variables
  let items = [];
  let isLoading = true;
  let error = null;
  let sortOption = 'updatedAt'; // Default sort by last updated
  
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
</script>

<!-- Tailwind CSS CDN -->
<svelte:head>
  <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
</svelte:head>

<div class="max-w-7xl mx-auto p-8 font-sans">
  <header class="flex justify-between items-center mb-8">
    <h1 class="text-3xl font-bold text-gray-800">Rating Dashboard</h1>
    <div class="flex items-center gap-4">
      <div class="flex items-center gap-2">
        <label for="sort-select" class="text-sm text-gray-600">Sort by:</label>
        <select id="sort-select" value={sortOption} on:change={handleSortChange} 
                class="bg-gray-100 border-none rounded-lg py-3 px-4 text-sm text-gray-800 cursor-pointer appearance-none pr-10 
                       bg-no-repeat bg-right-4 bg-contain">
          {#each sortOptions as option}
            <option value={option.value}>{option.label}</option>
          {/each}
        </select>
      </div>
      <button class="flex items-center gap-2 bg-gray-100 text-gray-800 border-none rounded-lg py-3 px-4 text-sm font-medium 
                     cursor-pointer transition duration-200 hover:bg-gray-200" on:click={fetchAllRatings}>
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
        </svg>
        Refresh
      </button>
    </div>
  </header>
  
  <div class="mb-12">
    {#if isLoading}
      <div class="flex flex-col items-center justify-center p-16 bg-gray-50 rounded-xl text-center">
        <div class="w-10 h-10 border-3 border-blue-300 border-t-blue-500 rounded-full animate-spin mb-4"></div>
        <p class="text-lg font-medium">Loading ratings...</p>
      </div>
    {:else if error}
      <div class="flex flex-col items-center justify-center p-16 bg-gray-50 rounded-xl text-center">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-red-500 mb-4">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <p class="text-lg font-medium mb-4">Error: {error}</p>
        <button on:click={fetchAllRatings} class="bg-blue-500 text-white border-none rounded-lg py-3 px-6 text-sm font-medium 
                                                 cursor-pointer transition-colors hover:bg-blue-600">
          Try Again
        </button>
      </div>
    {:else if items.length === 0}
      <div class="flex flex-col items-center justify-center p-16 bg-gray-50 rounded-xl text-center">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-yellow-400 mb-6">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
        </svg>
        <p class="text-lg font-medium mb-2">No ratings found</p>
        <p class="text-sm text-gray-600">Install the Rating Widget on your website to start collecting ratings.</p>
      </div>
    {:else}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {#each items as item}
          <div class="bg-white rounded-xl shadow-sm p-6 transition duration-200 hover:transform hover:-translate-y-1 hover:shadow-md">
            <div class="mb-6">
              <h3 class="text-xl font-semibold text-gray-800 mb-2 break-all">{item.itemId}</h3>
              <div class="flex items-center gap-3">
                <span class="text-2xl font-bold text-gray-800">{item.averageRating.toFixed(1)}</span>
                <div class="flex gap-0.5 text-yellow-400">
                  {#each Array(5) as _, i}
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill={i < Math.round(item.averageRating) ? "currentColor" : "none"} stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                    </svg>
                  {/each}
                </div>
                <span class="text-sm text-gray-600">({item.totalRatings} {item.totalRatings === 1 ? 'rating' : 'ratings'})</span>
              </div>
            </div>
            
            <div class="mb-6">
              {#each [5, 4, 3, 2, 1] as starValue}
                <div class="flex items-center gap-2 mb-2">
                  <span class="w-4 text-right text-sm text-gray-600">{starValue}</span>
                  <div class="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div class="h-full bg-yellow-400 rounded-full" style="width: {item.totalRatings > 0 ? (item.ratingCounts[starValue] / item.totalRatings) * 100 : 0}%"></div>
                  </div>
                  <span class="w-8 text-sm text-gray-600">{item.ratingCounts[starValue] || 0}</span>
                </div>
              {/each}
            </div>
            
            <div class="flex justify-between items-start text-xs text-gray-500">
              <div class="flex flex-col gap-2">
                <div class="flex gap-1">
                  <span class="font-medium">Created:</span>
                  <span>{formatDate(item.createdAt)}</span>
                </div>
                <div class="flex gap-1">
                  <span class="font-medium">Last updated:</span>
                  <span>{formatDate(item.updatedAt)}</span>
                </div>
              </div>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
  
  <div class="bg-gray-50 rounded-xl p-8 mt-12">
    <h2 class="text-2xl font-semibold text-gray-800 mb-4">Test Rating Widget</h2>
    <p>This is how the Rating Widget will appear on your website:</p>
    <div class="bg-white rounded-lg p-8 my-6 relative h-48 border border-dashed border-gray-300">
      <rating-widget></rating-widget>
    </div>
    
    <div class="bg-white rounded-lg p-6 mt-6">
      <h3 class="text-lg font-semibold text-gray-800 mb-4">Installation Guide</h3>
      <p>Add the following code to your website to install the Rating Widget:</p>
      <pre class="bg-gray-100 rounded-md p-4 overflow-x-auto font-mono text-sm mt-4"><code>&lt;script src="https://roy-li.space/rating-widget.js"&gt;&lt;/script&gt;
&lt;rating-widget&gt;&lt;/rating-widget&gt;</code></pre>
    </div>
  </div>
</div> 