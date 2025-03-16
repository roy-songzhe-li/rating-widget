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

// Initialization complete
console.log('Rating Widget loaded successfully! v1.0.0'); 