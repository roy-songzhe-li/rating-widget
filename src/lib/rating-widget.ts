import RatingWidget from './RatingWidget.svelte';

// 确保组件被正确注册为Web Component
customElements.define('rating-widget', RatingWidget as any);

// 导出组件
export default RatingWidget; 