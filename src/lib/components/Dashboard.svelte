<script lang="ts">
  import { onMount } from 'svelte';
  import RatingDialog from './RatingDialog.svelte';
  import Spinner from './Spinner.svelte';
  import RatingBars from './RatingBars.svelte';
  import StarRating from './StarRating.svelte';
  
  // API URLs
  const API_BASE_URL = 'https://nodejs-serverless-function-express-opal-omega.vercel.app/api';
  const GET_ALL_RATINGS_ENDPOINT = '/getAllRatings';
  const GET_RATING_ENDPOINT = '/getRating';
  
  // Component state
  let isLoading = true;
  let hasError = false;
  let errorMessage = '';
  let noData = false;
  let ratingItems: any[] = [];
  
  // Dialog state
  let detailsDialog: RatingDialog;
  let detailsLoading = false;
  let detailsError = false;
  let currentItem: any = null;
  
  // Load data on mount
  onMount(() => {
    loadRatingData();
    
    // Add event listener for rating submission
    const ratingWidget = document.querySelector('rating-widget');
    if (ratingWidget) {
      ratingWidget.addEventListener('rating-submitted', (event: any) => {
        console.log('Rating submitted event:', event.detail);
        // Refresh rating data after submission
        setTimeout(() => {
          loadRatingData();
        }, 1000);
      });
    }
  });
  
  // Format date for display
  function formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch (e) {
      console.error('Error formatting date:', e);
      return dateString;
    }
  }
  
  // Load rating data from API
  async function loadRatingData() {
    isLoading = true;
    hasError = false;
    noData = false;
    
    try {
      const response = await fetch(`${API_BASE_URL}${GET_ALL_RATINGS_ENDPOINT}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch rating data: ${response.status} ${response.statusText}`);
      }
      
      const responseData = await response.json();
      
      // Extract items array from the response
      let data = responseData.items || [];
      
      if (data && data.length > 0) {
        // Sort data by updatedAt time (most recent first)
        data = data.sort((a: any, b: any) => {
          const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
          const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
          return dateB - dateA; // Descending order (newest first)
        });
        
        ratingItems = data;
      } else {
        noData = true;
      }
    } catch (error) {
      console.error('Error loading rating data:', error);
      hasError = true;
      errorMessage = error instanceof Error ? error.message : 'An error occurred';
    } finally {
      isLoading = false;
    }
  }
  
  // Open rating details
  async function openRatingDetails(itemId: string) {
    detailsLoading = true;
    detailsError = false;
    currentItem = null;
    
    // Open dialog
    detailsDialog.openDialog();
    
    try {
      // Fetch rating details for the specific item
      const response = await fetch(`${API_BASE_URL}${GET_RATING_ENDPOINT}?itemId=${encodeURIComponent(itemId)}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch rating details');
      }
      
      const data = await response.json();
      currentItem = data;
    } catch (error) {
      console.error('Error loading rating details:', error);
      detailsError = true;
    } finally {
      detailsLoading = false;
    }
  }
  
  // Calculate average rating from rating counts
  function calculateAverageRating(ratingCounts: Record<string, number>): number {
    let totalScore = 0;
    let totalCount = 0;
    
    for (let i = 1; i <= 5; i++) {
      const count = ratingCounts[i] || 0;
      totalScore += i * count;
      totalCount += count;
    }
    
    return totalCount > 0 ? totalScore / totalCount : 0;
  }
</script>

<div class="container mx-auto px-4 py-8 max-w-6xl">
  <header class="mb-8">
    <h1 class="text-3xl font-bold text-center text-gray-800">Rating Widget Dashboard</h1>
    <p class="text-center text-gray-600 mt-2">View and manage all rating records</p>
  </header>

  <!-- Test Rating Widget -->
  <div class="bg-white rounded-lg shadow-md mb-8 overflow-hidden">
    <div class="bg-gray-100 px-4 py-3 border-b">
      <h2 class="text-lg font-medium text-gray-800">Test Rating Widget</h2>
    </div>
    <div class="p-4">
      <p class="text-gray-700 mb-4">Below is a test instance of the rating widget component. You can use it to test the functionality.</p>
      <div class="flex justify-center my-6">
        <slot name="rating-widget"></slot>
      </div>
      <div class="bg-blue-50 border-l-4 border-blue-400 p-4 text-sm text-blue-700">
        <strong>Note:</strong> Open the browser console (F12) to see debug information when submitting a rating.
      </div>
    </div>
  </div>

  <!-- Rating Records -->
  <div class="bg-white rounded-lg shadow-md mb-8 overflow-hidden">
    <div class="bg-gray-100 px-4 py-3 border-b flex justify-between items-center">
      <h2 class="text-lg font-medium text-gray-800">Rating Records</h2>
      <button 
        on:click={loadRatingData}
        class="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Refresh
      </button>
    </div>
    <div class="p-4">
      <!-- Loading Spinner -->
      {#if isLoading}
        <div class="py-12">
          <Spinner size="lg" text="Loading rating data..." />
        </div>
      {/if}
      
      <!-- Error Message -->
      {#if hasError}
        <div class="bg-red-50 border-l-4 border-red-400 p-4 text-red-700 mb-4">
          Error loading rating data: {errorMessage}
        </div>
      {/if}
      
      <!-- No Data Message -->
      {#if noData && !isLoading}
        <div class="bg-blue-50 border-l-4 border-blue-400 p-4 text-blue-700 mb-4">
          No rating data available.
        </div>
      {/if}
      
      <!-- Rating Table -->
      {#if ratingItems.length > 0 && !isLoading}
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item ID</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Average Rating</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Ratings</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating Distribution</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamps</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              {#each ratingItems as item}
                {@const avgRating = item.averageRating || calculateAverageRating(item.ratingCounts)}
                <tr>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.itemId}</td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <span class="font-medium mr-2">{avgRating.toFixed(1)}</span>
                      <StarRating rating={avgRating} size="sm" />
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.totalRatings}</td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="w-32">
                      <RatingBars ratingCounts={item.ratingCounts} compact={true} />
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>
                      <div class="text-xs text-gray-500">Created: {formatDate(item.createdAt)}</div>
                      <div class="text-xs text-gray-500">Updated: {formatDate(item.updatedAt)}</div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button 
                      on:click={() => openRatingDetails(item.itemId)}
                      class="text-indigo-600 hover:text-indigo-900"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      {/if}
    </div>
  </div>
</div>

<!-- Rating Details Dialog -->
<RatingDialog bind:this={detailsDialog} title="Rating Details">
  {#if detailsLoading}
    <div class="py-8">
      <Spinner text="Loading details..." />
    </div>
  {:else if detailsError}
    <div class="bg-red-50 border-l-4 border-red-400 p-4 text-red-700 my-4">
      Error loading rating details. Please try again.
    </div>
  {:else if currentItem}
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <h4 class="font-medium text-gray-800 mb-3">Rating Summary</h4>
        <div class="flex items-center mb-3">
          <div class="text-4xl font-bold text-indigo-600 mr-3">{currentItem.averageRating.toFixed(1)}</div>
          <StarRating rating={currentItem.averageRating} size="lg" readOnly={true} />
        </div>
        <p class="text-gray-700 mb-1">Total ratings: <span class="font-medium">{currentItem.totalRatings}</span></p>
        <p class="text-gray-700 mb-0">Item ID: <span class="font-medium text-gray-500 text-sm">{currentItem.itemId}</span></p>
      </div>
      <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <h4 class="font-medium text-gray-800 mb-3">Rating Distribution</h4>
        <RatingBars ratingCounts={currentItem.ratingCounts} totalRatings={currentItem.totalRatings} />
      </div>
    </div>
    
    <!-- Timestamps Section -->
    <div class="bg-gray-50 rounded-lg p-4 border border-gray-200 mb-4">
      <h4 class="font-medium text-gray-800 mb-3">Timestamps</h4>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p class="text-gray-700"><strong>Created:</strong> <span class="text-gray-600">{formatDate(currentItem.createdAt)}</span></p>
        </div>
        <div>
          <p class="text-gray-700"><strong>Last Updated:</strong> <span class="text-gray-600">{formatDate(currentItem.updatedAt)}</span></p>
        </div>
      </div>
    </div>
  {/if}
</RatingDialog> 