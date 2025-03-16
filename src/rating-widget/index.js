import './RatingWidget.svelte';

// Add Skeleton Elements CSS
const skeletonCss = document.createElement('link');
skeletonCss.rel = 'stylesheet';
skeletonCss.href = 'https://cdn.jsdelivr.net/npm/skeleton-elements@4.0.1/css/skeleton-elements.css';
document.head.appendChild(skeletonCss);

console.log('Rating Widget loaded successfully!'); 