<script>
  import Dashboard from './dashboard/Dashboard.svelte';
  import './rating-widget/index.js';
</script>

<main>
  <Dashboard />
</main>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    background-color: #f5f5f7;
    color: #333;
  }
  
  main {
    width: 100%;
    min-height: 100vh;
  }
</style>
