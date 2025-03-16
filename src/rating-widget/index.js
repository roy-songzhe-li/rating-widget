import './RatingWidget.svelte';

// 安全地添加外部CSS
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

// 添加必要的CSS
addExternalCSS('https://cdn.jsdelivr.net/npm/skeleton-elements@4.0.1/css/skeleton-elements.css');

// 初始化完成
console.log('Rating Widget loaded successfully! v1.0.0'); 