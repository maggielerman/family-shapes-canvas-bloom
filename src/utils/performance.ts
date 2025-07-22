// Performance monitoring utilities
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number> = new Map();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  // Track component load time
  trackComponentLoad(componentName: string, startTime: number) {
    const loadTime = performance.now() - startTime;
    this.metrics.set(`${componentName}_load_time`, loadTime);
    
    if (loadTime > 1000) {
      console.warn(`Slow component load: ${componentName} took ${loadTime.toFixed(2)}ms`);
    }
    
    return loadTime;
  }

  // Track API call performance
  trackApiCall(endpoint: string, startTime: number) {
    const duration = performance.now() - startTime;
    this.metrics.set(`${endpoint}_api_time`, duration);
    
    if (duration > 2000) {
      console.warn(`Slow API call: ${endpoint} took ${duration.toFixed(2)}ms`);
    }
    
    return duration;
  }

  // Track bundle size
  trackBundleSize(bundleName: string, size: number) {
    this.metrics.set(`${bundleName}_size`, size);
    
    if (size > 500 * 1024) { // 500KB
      console.warn(`Large bundle: ${bundleName} is ${(size / 1024).toFixed(2)}KB`);
    }
  }

  // Get performance report
  getReport() {
    const report = {
      componentLoadTimes: {} as Record<string, number>,
      apiCallTimes: {} as Record<string, number>,
      bundleSizes: {} as Record<string, number>,
      recommendations: [] as string[]
    };

    for (const [key, value] of this.metrics) {
      if (key.includes('_load_time')) {
        const componentName = key.replace('_load_time', '');
        report.componentLoadTimes[componentName] = value;
        if (value > 1000) {
          report.recommendations.push(`Consider lazy loading ${componentName}`);
        }
      } else if (key.includes('_api_time')) {
        const endpoint = key.replace('_api_time', '');
        report.apiCallTimes[endpoint] = value;
        if (value > 2000) {
          report.recommendations.push(`Optimize API call to ${endpoint}`);
        }
      } else if (key.includes('_size')) {
        const bundleName = key.replace('_size', '');
        report.bundleSizes[bundleName] = value;
        if (value > 500 * 1024) {
          report.recommendations.push(`Split bundle ${bundleName}`);
        }
      }
    }

    return report;
  }

  // Clear metrics
  clear() {
    this.metrics.clear();
  }
}

// Web Vitals monitoring
export const trackWebVitals = () => {
  if ('PerformanceObserver' in window) {
    // Track Largest Contentful Paint (LCP)
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      const lcp = lastEntry.startTime;
      
      if (lcp > 2500) {
        console.warn(`Poor LCP: ${lcp.toFixed(2)}ms`);
      }
    });
    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

    // Track First Input Delay (FID)
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        const fid = entry.processingStart - entry.startTime;
        if (fid > 100) {
          console.warn(`Poor FID: ${fid.toFixed(2)}ms`);
        }
      });
    });
    fidObserver.observe({ entryTypes: ['first-input'] });

    // Track Cumulative Layout Shift (CLS)
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) {
          clsValue += (entry as any).value;
        }
      }
      if (clsValue > 0.1) {
        console.warn(`Poor CLS: ${clsValue.toFixed(3)}`);
      }
    });
    clsObserver.observe({ entryTypes: ['layout-shift'] });
  }
};

// Resource timing
export const trackResourceTiming = () => {
  if ('PerformanceObserver' in window) {
    const resourceObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        const resource = entry as PerformanceResourceTiming;
        const duration = resource.responseEnd - resource.requestStart;
        
        if (duration > 3000) {
          console.warn(`Slow resource: ${resource.name} took ${duration.toFixed(2)}ms`);
        }
      });
    });
    resourceObserver.observe({ entryTypes: ['resource'] });
  }
};

// Memory usage monitoring
export const trackMemoryUsage = () => {
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    const usedMB = memory.usedJSHeapSize / 1024 / 1024;
    const totalMB = memory.totalJSHeapSize / 1024 / 1024;
    
    if (usedMB > 50) {
      console.warn(`High memory usage: ${usedMB.toFixed(2)}MB / ${totalMB.toFixed(2)}MB`);
    }
  }
};

// Initialize performance monitoring
export const initPerformanceMonitoring = () => {
  trackWebVitals();
  trackResourceTiming();
  
  // Monitor memory usage periodically
  setInterval(trackMemoryUsage, 30000); // Every 30 seconds
};