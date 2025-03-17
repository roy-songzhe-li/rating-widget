<svelte:options customElement="rating-widget" />

<script>
  import { onMount } from 'svelte';
  
  // State variables
  let rating = 0;
  let hoverRating = 0;
  let isOpen = false;
  let hasRated = false;
  let itemId = '';
  let userId = '';
  let isSubmitting = false;
  let submitSuccess = false;
  let submitError = false;
  let errorMessage = '';
  let testMode = false; // 添加测试模式状态变量
  
  // 导出属性，允许从外部设置测试模式
  export let test = '';
  
  // API endpoint - always use absolute URL for cross-origin compatibility
  const API_URL = 'https://nodejs-serverless-function-express-opal-omega.vercel.app/api';
  
  // 生成随机用户ID的函数
  function generateRandomUserId() {
    return 'user-' + Math.random().toString(36).substring(2, 15);
  }
  
  onMount(() => {
    try {
      // 检查是否设置了测试模式
      testMode = test === 'true';
      
      // 记录测试模式状态
      if (testMode) {
        console.log('Rating Widget initialized in TEST MODE');
      }
      
      // 生成一个随机用户ID
      userId = generateRandomUserId();
      
      // 获取当前URL的主机名作为itemId
      itemId = window.location.hostname;
      
      // 本地开发时使用测试itemId
      if (itemId === 'localhost') {
        itemId = 'localhost-test';
      }
      
      // 只有在非测试模式下才检查本地存储的评分
      if (!testMode) {
        checkLocalRating();
      }
      
      // 记录初始化成功
      console.log('Rating Widget initialized for:', itemId);
    } catch (error) {
      console.error('Error initializing Rating Widget:', error);
    }
  });
  
  // 检查用户是否已经对此项目进行了评分（使用localStorage）
  function checkLocalRating() {
    try {
      // 为此项目和用户创建唯一键
      const storageKey = `rating_${itemId}`;
      
      // 尝试从localStorage获取评分
      const storedRating = localStorage.getItem(storageKey);
      
      if (storedRating) {
        // 解析存储的数据
        const ratingData = JSON.parse(storedRating);
        rating = ratingData.rating;
        hasRated = true;
      }
    } catch (error) {
      console.error('Error checking local rating:', error);
      // 继续而不向用户显示错误
    }
  }
  
  // 处理星星悬停
  function handleStarHover(value) {
    hoverRating = value;
  }
  
  // 处理星星离开
  function handleStarLeave() {
    hoverRating = 0;
  }
  
  // 处理星星点击
  function handleStarClick(value) {
    rating = value;
    submitRating();
  }
  
  // 切换小部件可见性
  function toggleWidget() {
    isOpen = !isOpen;
    
    // 在测试模式下，每次打开小部件时生成新的随机用户ID
    if (testMode && isOpen) {
      userId = generateRandomUserId();
      hasRated = false; // 重置已评分状态
      console.log('Test mode: Generated new userId:', userId);
    }
  }
  
  // 提交评分到API
  async function submitRating() {
    if (rating === 0) return;
    
    isSubmitting = true;
    submitSuccess = false;
    submitError = false;
    
    try {
      // 只有在非测试模式下才保存到localStorage
      if (!testMode) {
        try {
          const storageKey = `rating_${itemId}`;
          const ratingData = {
            rating,
            userId,
            timestamp: new Date().toISOString()
          };
          localStorage.setItem(storageKey, JSON.stringify(ratingData));
        } catch (storageError) {
          console.warn('Could not save to localStorage:', storageError);
        }
      } else {
        console.log('Test mode: Skipping localStorage save');
      }
      
      // 然后提交到API
      const response = await fetch(`${API_URL}/saveRating`, {
        method: 'POST',
        mode: 'cors',
        credentials: 'omit',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Origin': window.location.origin
        },
        body: JSON.stringify({
          itemId,
          rating,
          userId,
          testMode // 将测试模式状态传递给API
        }),
      });
      
      if (response.ok) {
        hasRated = true;
        submitSuccess = true;
        setTimeout(() => {
          isOpen = false;
        }, 2000);
      } else {
        // 尝试解析错误响应
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = { message: 'Failed to parse error response' };
        }
        
        submitError = true;
        errorMessage = errorData.message || `Failed to submit rating (Status: ${response.status})`;
        console.error('API error:', errorMessage);
      }
    } catch (error) {
      // 即使API调用失败，我们也尝试保存到localStorage
      // 所以我们仍然可以向用户显示成功
      hasRated = true;
      submitSuccess = true;
      setTimeout(() => {
        isOpen = false;
      }, 2000);
      
      // 记录错误但不向用户显示
      console.error('Error submitting rating to API:', error);
    } finally {
      isSubmitting = false;
    }
  }
</script>

<div class="rating-widget-container">
  <!-- Toggle button -->
  <button 
    class="rating-toggle-button" 
    on:click={toggleWidget}
    aria-label="Rate this website"
    class:test-mode={testMode}
  >
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
    </svg>
    <span>Rate{testMode ? ' (Test)' : ''}</span>
  </button>
  
  <!-- Rating widget -->
  {#if isOpen}
    <div class="rating-panel" class:rating-panel-open={isOpen} class:test-mode={testMode}>
      <div class="rating-header">
        <h3>Rate this website{testMode ? ' (Test Mode)' : ''}</h3>
        <button class="close-button" on:click={toggleWidget} aria-label="Close rating panel">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      
      <div class="rating-content">
        {#if !hasRated || submitSuccess || testMode}
          <div class="stars-container">
            {#each Array(5) as _, i}
              <button 
                class="star-button"
                class:active={i < (hoverRating || rating)}
                on:mouseenter={() => handleStarHover(i + 1)}
                on:mouseleave={handleStarLeave}
                on:click={() => handleStarClick(i + 1)}
                disabled={isSubmitting}
                aria-label={`Rate ${i + 1} star${i !== 0 ? 's' : ''}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill={i < (hoverRating || rating) ? "currentColor" : "none"} stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
              </button>
            {/each}
          </div>
          
          {#if isSubmitting}
            <div class="loading-indicator">
              <div class="spinner"></div>
              <span>Submitting...</span>
            </div>
          {/if}
          
          {#if submitSuccess}
            <div class="success-message">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              <span>Thank you for your rating!</span>
            </div>
          {/if}
          
          {#if submitError}
            <div class="error-message">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <span>{errorMessage}</span>
            </div>
          {/if}
          
          {#if testMode}
            <div class="test-mode-indicator">
              <p>Test Mode Active - UserID: {userId.substring(0, 8)}...</p>
            </div>
          {/if}
        {:else}
          <div class="already-rated">
            <p>You've already rated this website</p>
            <div class="stars-display">
              {#each Array(5) as _, i}
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={i < rating ? "currentColor" : "none"} stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
              {/each}
            </div>
          </div>
        {/if}
      </div>
    </div>
  {/if}
</div>

<style>
  /* Ensure all styles are contained within the component to avoid conflicts with host page */
  :host {
    display: block;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  }
  
  .rating-widget-container {
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 9999;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  }
  
  .rating-toggle-button {
    display: flex;
    align-items: center;
    gap: 8px;
    background-color: #007AFF;
    color: white;
    border: none;
    border-radius: 30px;
    padding: 10px 16px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    transition: all 0.2s ease;
  }
  
  .rating-toggle-button:hover {
    background-color: #0066CC;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  
  /* 测试模式按钮样式 */
  .rating-toggle-button.test-mode {
    background-color: #FF9500;
  }
  
  .rating-toggle-button.test-mode:hover {
    background-color: #F08300;
  }
  
  .rating-panel {
    position: absolute;
    bottom: 60px;
    right: 0;
    width: 300px;
    background-color: white;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    overflow: hidden;
    transform: translateY(20px);
    opacity: 0;
    pointer-events: none;
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  }
  
  /* 测试模式面板样式 */
  .rating-panel.test-mode {
    border: 2px solid #FF9500;
  }
  
  .rating-panel-open {
    transform: translateY(0);
    opacity: 1;
    pointer-events: all;
  }
  
  .rating-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    border-bottom: 1px solid #f0f0f0;
  }
  
  .rating-header h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: #333;
  }
  
  .close-button {
    background: transparent;
    border: none;
    color: #999;
    cursor: pointer;
    padding: 4px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.2s;
  }
  
  .close-button:hover {
    background-color: #f5f5f5;
    color: #666;
  }
  
  .rating-content {
    padding: 20px;
  }
  
  .stars-container {
    display: flex;
    justify-content: center;
    gap: 8px;
    margin-bottom: 16px;
  }
  
  .star-button {
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 4px;
    color: #FFCC00;
    transition: transform 0.2s, color 0.2s;
  }
  
  .star-button:hover, .star-button.active {
    transform: scale(1.1);
  }
  
  .loading-indicator {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin-top: 16px;
    color: #666;
  }
  
  .spinner {
    width: 20px;
    height: 20px;
    border: 2px solid rgba(0, 122, 255, 0.3);
    border-radius: 50%;
    border-top-color: #007AFF;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
  
  .success-message, .error-message {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin-top: 16px;
    padding: 10px;
    border-radius: 8px;
  }
  
  .success-message {
    background-color: rgba(52, 199, 89, 0.1);
    color: #34C759;
  }
  
  .error-message {
    background-color: rgba(255, 59, 48, 0.1);
    color: #FF3B30;
  }
  
  .already-rated {
    text-align: center;
    color: #666;
  }
  
  .stars-display {
    display: flex;
    justify-content: center;
    gap: 4px;
    margin-top: 8px;
    color: #FFCC00;
  }
  
  /* 测试模式指示器样式 */
  .test-mode-indicator {
    margin-top: 16px;
    padding: 8px;
    background-color: rgba(255, 149, 0, 0.1);
    border-radius: 8px;
    text-align: center;
    font-size: 12px;
    color: #FF9500;
  }
</style> 