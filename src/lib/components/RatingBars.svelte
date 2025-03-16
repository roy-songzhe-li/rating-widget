<script lang="ts">
  // Props
  export let ratingCounts: Record<string, number> = {};
  export let totalRatings = 0;
  export let compact = false;
  
  // Generate array of ratings from 5 to 1
  const ratings = [5, 4, 3, 2, 1];
  
  // Calculate percentage for a rating
  function getPercentage(rating: number): number {
    if (compact) {
      const maxCount = Math.max(...Object.values(ratingCounts).map(v => Number(v)), 0);
      const count = ratingCounts[rating] || 0;
      return maxCount > 0 ? (count / maxCount) * 100 : 0;
    } else {
      const count = ratingCounts[rating] || 0;
      return totalRatings > 0 ? (count / totalRatings) * 100 : 0;
    }
  }
</script>

{#if compact}
  <!-- Compact rating bars (for table view) -->
  <div class="space-y-1">
    {#each ratings as rating}
      {@const count = ratingCounts[rating] || 0}
      {@const percentage = getPercentage(rating)}
      
      <div class="flex items-center text-xs">
        <span class="w-4 text-gray-600">{rating}</span>
        <div class="flex-grow bg-gray-200 rounded-full h-1 mx-1" role="progressbar" aria-valuenow={percentage} aria-valuemin="0" aria-valuemax="100">
          <div class="bg-yellow-400 h-1 rounded-full" style="width: {percentage}%"></div>
        </div>
      </div>
    {/each}
  </div>
{:else}
  <!-- Full rating bars (for details view) -->
  <div class="space-y-2">
    {#each ratings as rating}
      {@const count = ratingCounts[rating] || 0}
      {@const percentage = getPercentage(rating)}
      
      <div class="flex items-center">
        <span class="w-8 text-right mr-2 text-gray-700">{rating}★</span>
        <div class="flex-grow bg-gray-200 rounded-full h-2" role="progressbar" aria-valuenow={percentage} aria-valuemin="0" aria-valuemax="100">
          <div class="bg-yellow-400 h-2 rounded-full" style="width: {percentage}%"></div>
        </div>
        <span class="w-8 text-right ml-2 text-gray-500 text-sm">{count}</span>
      </div>
    {/each}
  </div>
{/if} 