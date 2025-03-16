// deploy.js - 确保widget文件被正确部署
import fs from 'fs';
import path from 'path';

// 确保public目录存在
if (!fs.existsSync('public')) {
  fs.mkdirSync('public');
}

// 复制rating-widget.js到public目录
try {
  fs.copyFileSync(
    path.join('dist', 'rating-widget.js'),
    path.join('public', 'rating-widget.js')
  );
  console.log('✅ rating-widget.js 已复制到 public 目录');
} catch (error) {
  console.error('❌ 复制 rating-widget.js 失败:', error);
}

// 复制sourcemap文件（如果存在）
try {
  if (fs.existsSync(path.join('dist', 'rating-widget.js.map'))) {
    fs.copyFileSync(
      path.join('dist', 'rating-widget.js.map'),
      path.join('public', 'rating-widget.js.map')
    );
    console.log('✅ rating-widget.js.map 已复制到 public 目录');
  }
} catch (error) {
  console.error('❌ 复制 rating-widget.js.map 失败:', error);
}

console.log('🚀 部署准备完成！'); 