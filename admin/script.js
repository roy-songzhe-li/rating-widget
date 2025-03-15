// API URL
const API_BASE_URL = 'https://nodejs-serverless-function-express-opal-omega.vercel.app/api';

// Correct API endpoint paths
const GET_ALL_RATINGS_ENDPOINT = '/getAllRatings'; // Endpoint to get all ratings
const GET_RATING_ENDPOINT = '/getRating'; // Endpoint to get a specific rating

// DOM Elements
const loadingSpinner = document.getElementById('loadingSpinner');
const errorMessage = document.getElementById('errorMessage');
const noDataMessage = document.getElementById('noDataMessage');
const ratingTableContainer = document.getElementById('ratingTableContainer');
const ratingTableBody = document.getElementById('ratingTableBody');
const refreshBtn = document.getElementById('refreshBtn');

// Modal Elements
const ratingDetailsModal = document.getElementById('ratingDetailsModal');
const modalLoadingSpinner = document.getElementById('modalLoadingSpinner');
const modalErrorMessage = document.getElementById('modalErrorMessage');
const ratingDetailsContent = document.getElementById('ratingDetailsContent');
const detailsAverageRating = document.getElementById('detailsAverageRating');
const detailsStarsDisplay = document.getElementById('detailsStarsDisplay');
const detailsTotalRatings = document.getElementById('detailsTotalRatings');
const detailsItemId = document.getElementById('detailsItemId');
const detailsRatingBars = document.getElementById('detailsRatingBars');
const detailsCreatedAt = document.getElementById('detailsCreatedAt');
const detailsUpdatedAt = document.getElementById('detailsUpdatedAt');

// Bootstrap Modal Instance
let modal;

// Initialize the admin panel
document.addEventListener('DOMContentLoaded', () => {
  // Initialize Bootstrap modal
  modal = new bootstrap.Modal(ratingDetailsModal);
  
  // Load initial data
  loadRatingData();
  
  // Set up event listeners
  refreshBtn.addEventListener('click', loadRatingData);
});

// Format date for display
function formatDate(dateString) {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleString();
  } catch (e) {
    console.error('Error formatting date:', e);
    return dateString;
  }
}

// Load rating data from API
async function loadRatingData() {
  showLoading();
  
  try {
    // Use the correct API endpoint to get all ratings
    const response = await fetch(`${API_BASE_URL}${GET_ALL_RATINGS_ENDPOINT}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch rating data');
    }
    
    const responseData = await response.json();
    
    // Extract items array from the response
    let data = responseData.items || [];
    
    if (data && data.length > 0) {
      // Sort data by updatedAt time (most recent first)
      data = data.sort((a, b) => {
        const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
        const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
        return dateB - dateA; // Descending order (newest first)
      });
      
      displayRatingData(data);
    } else {
      showNoData();
    }
  } catch (error) {
    console.error('Error loading rating data:', error);
    showError();
  }
}

// Display rating data in the table
function displayRatingData(data) {
  // Clear existing table rows
  ratingTableBody.innerHTML = '';
  
  // Add rows for each rating item
  data.forEach(item => {
    const row = document.createElement('tr');
    
    // Calculate average rating if not provided
    const avgRating = item.averageRating || calculateAverageRating(item.ratingCounts);
    
    // Format dates
    const createdAt = formatDate(item.createdAt);
    const updatedAt = formatDate(item.updatedAt);
    
    row.innerHTML = `
      <td>${item.itemId}</td>
      <td>
        <div class="d-flex align-items-center">
          <span class="fw-bold me-2">${avgRating.toFixed(1)}</span>
          <div class="stars-display">
            ${generateStarsHTML(avgRating)}
          </div>
        </div>
      </td>
      <td>${item.totalRatings}</td>
      <td>
        <div class="table-rating-bars">
          ${generateTableRatingBarsHTML(item.ratingCounts)}
        </div>
      </td>
      <td>
        <div class="small text-muted">
          <div>Created: ${createdAt}</div>
          <div>Updated: ${updatedAt}</div>
        </div>
      </td>
      <td>
        <div class="action-buttons">
          <button class="btn btn-sm btn-outline-primary view-details-btn" data-item-id="${item.itemId}">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-eye" viewBox="0 0 16 16">
              <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"/>
              <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z"/>
            </svg>
          </button>
        </div>
      </td>
    `;
    
    ratingTableBody.appendChild(row);
  });
  
  // Add event listeners to view details buttons
  document.querySelectorAll('.view-details-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const itemId = btn.getAttribute('data-item-id');
      openRatingDetails(itemId);
    });
  });
  
  // Show the table
  hideLoading();
  ratingTableContainer.classList.remove('d-none');
}

// Open rating details modal
async function openRatingDetails(itemId) {
  // Show modal
  modal.show();
  
  // Show loading spinner
  modalLoadingSpinner.classList.remove('d-none');
  modalErrorMessage.classList.add('d-none');
  ratingDetailsContent.classList.add('d-none');
  
  try {
    // Fetch rating details for the specific item
    const response = await fetch(`${API_BASE_URL}${GET_RATING_ENDPOINT}?itemId=${encodeURIComponent(itemId)}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch rating details');
    }
    
    const data = await response.json();
    
    // Display rating details
    displayRatingDetails(data);
  } catch (error) {
    console.error('Error loading rating details:', error);
    modalLoadingSpinner.classList.add('d-none');
    modalErrorMessage.classList.remove('d-none');
  }
}

// Display rating details in the modal
function displayRatingDetails(data) {
  // Set item ID
  detailsItemId.textContent = data.itemId;
  
  // Set average rating
  detailsAverageRating.textContent = data.averageRating.toFixed(1);
  
  // Set total ratings
  detailsTotalRatings.textContent = data.totalRatings;
  
  // Set dates if available
  if (detailsCreatedAt) {
    detailsCreatedAt.textContent = formatDate(data.createdAt);
  }
  
  if (detailsUpdatedAt) {
    detailsUpdatedAt.textContent = formatDate(data.updatedAt);
  }
  
  // Generate stars display
  detailsStarsDisplay.innerHTML = generateStarsHTML(data.averageRating);
  
  // Generate rating bars
  detailsRatingBars.innerHTML = generateRatingBarsHTML(data.ratingCounts, data.totalRatings);
  
  // Hide loading spinner and show content
  modalLoadingSpinner.classList.add('d-none');
  ratingDetailsContent.classList.remove('d-none');
}

// Generate HTML for star rating display
function generateStarsHTML(rating) {
  let starsHTML = '';
  
  for (let i = 1; i <= 5; i++) {
    const starClass = i <= Math.round(rating) ? 'filled' : '';
    starsHTML += `<span class="star ${starClass}">★</span>`;
  }
  
  return starsHTML;
}

// Generate HTML for rating distribution bars in table
function generateTableRatingBarsHTML(ratingCounts) {
  let barsHTML = '';
  const maxCount = Math.max(...Object.values(ratingCounts));
  
  for (let i = 5; i >= 1; i--) {
    const count = ratingCounts[i] || 0;
    const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;
    
    barsHTML += `
      <div class="table-rating-bar-container">
        <span class="table-rating-label">${i}</span>
        <div class="table-rating-bar-wrapper">
          <div class="table-rating-bar" style="width: ${percentage}%"></div>
        </div>
      </div>
    `;
  }
  
  return barsHTML;
}

// Generate HTML for rating distribution bars in modal
function generateRatingBarsHTML(ratingCounts, totalRatings) {
  let barsHTML = '';
  
  for (let i = 5; i >= 1; i--) {
    const count = ratingCounts[i] || 0;
    const percentage = totalRatings > 0 ? (count / totalRatings) * 100 : 0;
    
    barsHTML += `
      <div class="rating-bar-container">
        <span class="rating-label">${i}★</span>
        <div class="rating-bar-wrapper">
          <div class="rating-bar" style="width: ${percentage}%"></div>
        </div>
        <span class="rating-count">${count}</span>
      </div>
    `;
  }
  
  return barsHTML;
}

// Calculate average rating from rating counts
function calculateAverageRating(ratingCounts) {
  let totalScore = 0;
  let totalCount = 0;
  
  for (let i = 1; i <= 5; i++) {
    const count = ratingCounts[i] || 0;
    totalScore += i * count;
    totalCount += count;
  }
  
  return totalCount > 0 ? totalScore / totalCount : 0;
}

// Show loading state
function showLoading() {
  loadingSpinner.classList.remove('d-none');
  errorMessage.classList.add('d-none');
  noDataMessage.classList.add('d-none');
  ratingTableContainer.classList.add('d-none');
}

// Hide loading state
function hideLoading() {
  loadingSpinner.classList.add('d-none');
}

// Show error message
function showError() {
  hideLoading();
  errorMessage.classList.remove('d-none');
}

// Show no data message
function showNoData() {
  hideLoading();
  noDataMessage.classList.remove('d-none');
} 