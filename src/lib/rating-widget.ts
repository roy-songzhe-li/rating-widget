import RatingWidget from './RatingWidget.svelte';

// Ensure the component is correctly registered as a Web Component
customElements.define('rating-widget', RatingWidget as any);

// Export the component
export default RatingWidget; 