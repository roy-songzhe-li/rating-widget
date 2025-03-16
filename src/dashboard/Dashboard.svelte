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

<div class="dashboard-container">
  <header class="dashboard-header">
    <h1>Rating Dashboard</h1>
    <div class="dashboard-controls">
      <div class="sort-control">
        <label for="sort-select">Sort by:</label>
        <select id="sort-select" value={sortOption} on:change={handleSortChange}>
          {#each sortOptions as option}
            <option value={option.value}>{option.label}</option>
          {/each}
        </select>
      </div>
      <button class="refresh-button" on:click={fetchAllRatings}>
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
        </svg>
        Refresh
      </button>
    </div>
  </header>
  
  <div class="dashboard-content">
    {#if isLoading}
      <div class="loading-state">
        <div class="spinner"></div>
        <p>Loading ratings...</p>
      </div>
    {:else if error}
      <div class="error-state">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <p>Error: {error}</p>
        <button on:click={fetchAllRatings}>Try Again</button>
      </div>
    {:else if items.length === 0}
      <div class="empty-state">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
        </svg>
        <p>No ratings found</p>
        <p class="empty-description">Install the Rating Widget on your website to start collecting ratings.</p>
      </div>
    {:else}
      <div class="ratings-grid">
        {#each items as item}
          <div class="rating-card">
            <div class="rating-card-header">
              <h3 class="item-id">{item.itemId}</h3>
              <div class="rating-summary">
                <span class="average-rating">{item.averageRating.toFixed(1)}</span>
                <div class="stars-display">
                  {#each Array(5) as _, i}
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill={i < Math.round(item.averageRating) ? "currentColor" : "none"} stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                    </svg>
                  {/each}
                </div>
                <span class="total-ratings">({item.totalRatings} {item.totalRatings === 1 ? 'rating' : 'ratings'})</span>
              </div>
            </div>
            
            <div class="rating-distribution">
              {#each [5, 4, 3, 2, 1] as starValue}
                <div class="rating-bar">
                  <span class="star-label">{starValue}</span>
                  <div class="bar-container">
                    <div class="bar-fill" style="width: {item.totalRatings > 0 ? (item.ratingCounts[starValue] / item.totalRatings) * 100 : 0}%"></div>
                  </div>
                  <span class="count-label">{item.ratingCounts[starValue] || 0}</span>
                </div>
              {/each}
            </div>
            
            <div class="rating-footer">
              <div class="timestamps">
                <div class="timestamp">
                  <span class="timestamp-label">Created:</span>
                  <span class="timestamp-value">{formatDate(item.createdAt)}</span>
                </div>
                <div class="timestamp">
                  <span class="timestamp-label">Last updated:</span>
                  <span class="timestamp-value">{formatDate(item.updatedAt)}</span>
                </div>
              </div>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
  
  <div class="widget-test-section">
    <h2>Test Rating Widget</h2>
    <p>This is how the Rating Widget will appear on your website:</p>
    <div class="widget-preview">
      <rating-widget></rating-widget>
    </div>
    
    <div class="installation-guide">
      <h3>Installation Guide</h3>
      <p>Add the following code to your website to install the Rating Widget:</p>
      <pre><code>&lt;script src="https://roy-li.space/rating-widget.js"&gt;&lt;/script&gt;
&lt;rating-widget&gt;&lt;/rating-widget&gt;</code></pre>
    </div>
  </div>
</div>

<style>
  .dashboard-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  }
  
  .dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
  }
  
  .dashboard-header h1 {
    font-size: 2rem;
    font-weight: 700;
    color: #333;
    margin: 0;
  }
  
  .dashboard-controls {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  
  .sort-control {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .sort-control label {
    font-size: 0.875rem;
    color: #666;
  }
  
  .sort-control select {
    background-color: #f5f5f7;
    border: none;
    border-radius: 8px;
    padding: 0.75rem 1rem;
    font-size: 0.875rem;
    color: #333;
    cursor: pointer;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23333' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 0.75rem center;
    padding-right: 2.5rem;
  }
  
  .refresh-button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background-color: #f5f5f7;
    color: #333;
    border: none;
    border-radius: 8px;
    padding: 0.75rem 1rem;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .refresh-button:hover {
    background-color: #e5e5e7;
  }
  
  .dashboard-content {
    margin-bottom: 3rem;
  }
  
  .loading-state, .error-state, .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem 2rem;
    background-color: #f9f9fb;
    border-radius: 12px;
    text-align: center;
  }
  
  .spinner {
    width: 40px;
    height: 40px;
    border: 3px solid rgba(0, 122, 255, 0.3);
    border-radius: 50%;
    border-top-color: #007AFF;
    animation: spin 1s linear infinite;
    margin-bottom: 1rem;
  }
  
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
  
  .error-state svg, .empty-state svg {
    margin-bottom: 1rem;
    color: #FF3B30;
  }
  
  .empty-state svg {
    color: #FFCC00;
    margin-bottom: 1.5rem;
  }
  
  .error-state p, .empty-state p {
    margin: 0 0 1rem;
    font-size: 1.125rem;
    font-weight: 500;
  }
  
  .empty-description {
    color: #666;
    font-size: 0.875rem !important;
    font-weight: 400 !important;
  }
  
  .error-state button {
    background-color: #007AFF;
    color: white;
    border: none;
    border-radius: 8px;
    padding: 0.75rem 1.5rem;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .error-state button:hover {
    background-color: #0066CC;
  }
  
  .ratings-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 1.5rem;
  }
  
  .rating-card {
    background-color: white;
    border-radius: 12px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    padding: 1.5rem;
    transition: transform 0.2s, box-shadow 0.2s;
  }
  
  .rating-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  }
  
  .rating-card-header {
    margin-bottom: 1.5rem;
  }
  
  .item-id {
    font-size: 1.25rem;
    font-weight: 600;
    color: #333;
    margin: 0 0 0.5rem;
    word-break: break-all;
  }
  
  .rating-summary {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }
  
  .average-rating {
    font-size: 1.5rem;
    font-weight: 700;
    color: #333;
  }
  
  .stars-display {
    display: flex;
    gap: 2px;
    color: #FFCC00;
  }
  
  .total-ratings {
    font-size: 0.875rem;
    color: #666;
  }
  
  .rating-distribution {
    margin-bottom: 1.5rem;
  }
  
  .rating-bar {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
  }
  
  .star-label {
    width: 1rem;
    text-align: right;
    font-size: 0.875rem;
    color: #666;
  }
  
  .bar-container {
    flex: 1;
    height: 8px;
    background-color: #f0f0f0;
    border-radius: 4px;
    overflow: hidden;
  }
  
  .bar-fill {
    height: 100%;
    background-color: #FFCC00;
    border-radius: 4px;
  }
  
  .count-label {
    width: 2rem;
    font-size: 0.875rem;
    color: #666;
  }
  
  .rating-footer {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    font-size: 0.75rem;
    color: #999;
  }
  
  .timestamps {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .timestamp {
    display: flex;
    gap: 0.25rem;
  }
  
  .timestamp-label {
    font-weight: 500;
  }
  
  .widget-test-section {
    background-color: #f9f9fb;
    border-radius: 12px;
    padding: 2rem;
    margin-top: 3rem;
  }
  
  .widget-test-section h2 {
    font-size: 1.5rem;
    font-weight: 600;
    color: #333;
    margin: 0 0 1rem;
  }
  
  .widget-preview {
    background-color: white;
    border-radius: 8px;
    padding: 2rem;
    margin: 1.5rem 0;
    position: relative;
    height: 200px;
    border: 1px dashed #ddd;
  }
  
  .installation-guide {
    background-color: white;
    border-radius: 8px;
    padding: 1.5rem;
    margin-top: 1.5rem;
  }
  
  .installation-guide h3 {
    font-size: 1.125rem;
    font-weight: 600;
    color: #333;
    margin: 0 0 1rem;
  }
  
  .installation-guide pre {
    background-color: #f5f5f7;
    border-radius: 6px;
    padding: 1rem;
    overflow-x: auto;
    font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
    font-size: 0.875rem;
  }
</style> 