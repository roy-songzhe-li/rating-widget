// deploy.js - Ensure widget files are correctly deployed
import fs from 'fs';
import path from 'path';

// Ensure public directory exists
if (!fs.existsSync('public')) {
  fs.mkdirSync('public');
}

// Copy rating-widget.js to public directory
try {
  fs.copyFileSync(
    path.join('dist', 'rating-widget.js'),
    path.join('public', 'rating-widget.js')
  );
  console.log('✅ rating-widget.js copied to public directory');
} catch (error) {
  console.error('❌ Failed to copy rating-widget.js:', error);
}

// Copy sourcemap file (if exists)
try {
  if (fs.existsSync(path.join('dist', 'rating-widget.js.map'))) {
    fs.copyFileSync(
      path.join('dist', 'rating-widget.js.map'),
      path.join('public', 'rating-widget.js.map')
    );
    console.log('✅ rating-widget.js.map copied to public directory');
  }
} catch (error) {
  console.error('❌ Failed to copy rating-widget.js.map:', error);
}

console.log('🚀 Deployment preparation complete!'); 