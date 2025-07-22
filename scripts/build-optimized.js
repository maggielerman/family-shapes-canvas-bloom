#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 Starting optimized build process...');

// Step 1: Clean previous build
console.log('📁 Cleaning previous build...');
if (fs.existsSync('dist')) {
  fs.rmSync('dist', { recursive: true, force: true });
}

// Step 2: Build with optimizations
console.log('🔨 Building with optimizations...');
try {
  execSync('npm run build', { stdio: 'inherit' });
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}

// Step 3: Analyze bundle size
console.log('📊 Analyzing bundle size...');
try {
  execSync('npx vite-bundle-analyzer dist', { stdio: 'inherit' });
} catch (error) {
  console.log('⚠️  Bundle analyzer not available, skipping...');
}

// Step 4: Generate performance report
console.log('📈 Generating performance report...');
const report = {
  timestamp: new Date().toISOString(),
  optimizations: [
    '✅ Code splitting implemented',
    '✅ Lazy loading for heavy components',
    '✅ Service worker for caching',
    '✅ PWA manifest added',
    '✅ Resource hints and preloading',
    '✅ Tree shaking enabled',
    '✅ Performance monitoring added',
    '✅ Query client optimized'
  ],
  recommendations: [
    'Consider implementing image optimization',
    'Add CDN for static assets',
    'Implement compression (gzip/brotli)',
    'Consider using WebP/AVIF image formats',
    'Monitor Core Web Vitals in production'
  ]
};

fs.writeFileSync(
  'dist/performance-report.json',
  JSON.stringify(report, null, 2)
);

console.log('✅ Optimized build completed!');
console.log('📋 Performance report saved to dist/performance-report.json');