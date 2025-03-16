<script lang="ts">
  import Dashboard from './lib/components/Dashboard.svelte';
</script>

<Dashboard>
  <rating-widget 
    slot="rating-widget"
    item-id="test-item-123" 
    callback-url="https://nodejs-serverless-function-express-opal-omega.vercel.app/api/saveRating"
    user-id="test-user-456">
  </rating-widget>
</Dashboard>

<style>
  /* Add your global styles here if needed */
</style>
