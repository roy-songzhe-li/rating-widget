import './RatingWidget.svelte';

// Safely add external CSS
function addExternalCSS(href) {
  try {
    const linkElement = document.createElement('link');
    linkElement.rel = 'stylesheet';
    linkElement.href = href;
    document.head.appendChild(linkElement);
    return true;
  } catch (error) {
    console.warn('Failed to add external CSS:', error);
    return false;
  }
}

// Add necessary CSS
addExternalCSS('https://cdn.jsdelivr.net/npm/skeleton-elements@4.0.1/css/skeleton-elements.css');

// Note: When updating the version number, make sure to update the vercel.json cache settings
// and consider adding a query parameter to the script URL to avoid browser caching issues
// Example: <script src="https://roy-li.space/rating-widget.js?v=1.0.1"></script>
console.log('Rating Widget loaded successfully! v1.0.1'); 