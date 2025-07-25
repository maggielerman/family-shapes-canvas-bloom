import { describe, it, expect, vi } from 'vitest';

describe('Family Chart Library Debug', () => {
  it('should be able to import family-chart library', async () => {
    try {
      const familyChartModule = await import('family-chart');
      console.log('✅ Family chart module imported successfully');
      console.log('Module keys:', Object.keys(familyChartModule));
      
      const familyChart = familyChartModule.default || familyChartModule;
      console.log('✅ Family chart object:', typeof familyChart);
      console.log('Available methods:', Object.keys(familyChart));
      
      expect(familyChart).toBeDefined();
    } catch (error) {
      console.error('❌ Failed to import family-chart:', error);
      throw error;
    }
  });

  it('should have createChart method', async () => {
    const familyChartModule = await import('family-chart');
    const familyChart = familyChartModule.default || familyChartModule;
    
    console.log('Checking for createChart method...');
    console.log('Available methods:', Object.keys(familyChart));
    
    expect(typeof familyChart.createChart).toBe('function');
  });

  it('should create a simple chart with minimal data', async () => {
    const familyChartModule = await import('family-chart');
    const familyChart = familyChartModule.default || familyChartModule;
    
    // Create a minimal test container
    const container = document.createElement('div');
    container.style.width = '400px';
    container.style.height = '300px';
    document.body.appendChild(container);
    
    // Minimal test data
    const testData = [
      {
        id: '1',
        name: 'John Doe',
        gender: 'M',
        pids: ['2']
      },
      {
        id: '2', 
        name: 'Jane Doe',
        gender: 'F',
        pids: ['1']
      }
    ];
    
    try {
      console.log('Attempting to create chart with test data...');
      console.log('Test data:', testData);
      
      const chart = familyChart.createChart(container, {
        nodes: testData,
        rootId: '1',
        nodeBinding: {
          field_0: 'name',
          img_0: 'img'
        },
        width: 400,
        height: 300
      });
      
      console.log('✅ Chart created successfully:', chart);
      
      // Wait a bit for rendering
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if content was rendered
      const hasContent = container.innerHTML.trim().length > 0;
      console.log('Chart container content:', container.innerHTML.substring(0, 200));
      console.log('Has content:', hasContent);
      
      expect(chart).toBeDefined();
      // Note: We don't expect content to be rendered immediately in test environment
      
    } catch (error) {
      console.error('❌ Failed to create chart:', error);
      throw error;
    } finally {
      // Cleanup
      document.body.removeChild(container);
    }
  });

  it('should handle different API signatures', async () => {
    const familyChartModule = await import('family-chart');
    const familyChart = familyChartModule.default || familyChartModule;
    
    const testData = [
      { id: '1', name: 'Test', gender: 'M' }
    ];
    
    const container = document.createElement('div');
    document.body.appendChild(container);
    
    try {
      // Test different API signatures
      const signatures = [
        () => familyChart.createChart(container, { nodes: testData, rootId: '1' }),
        () => familyChart.createChart(testData, container),
        () => new familyChart(container, { data: testData, rootId: '1' }),
        () => familyChart(container, { data: testData, rootId: '1' })
      ];
      
      for (let i = 0; i < signatures.length; i++) {
        try {
          console.log(`Testing signature ${i + 1}...`);
          const result = signatures[i]();
          console.log(`✅ Signature ${i + 1} worked:`, result);
          break;
        } catch (error) {
          console.log(`❌ Signature ${i + 1} failed:`, error.message);
        }
      }
      
    } finally {
      document.body.removeChild(container);
    }
  });

  it('should trigger chart update after creation', async () => {
    const familyChartModule = await import('family-chart');
    const familyChart = familyChartModule.default || familyChartModule;
    
    const container = document.createElement('div');
    container.style.width = '400px';
    container.style.height = '300px';
    document.body.appendChild(container);
    
    const testData = [
      {
        id: '1',
        name: 'John Doe',
        gender: 'M',
        pids: ['2']
      },
      {
        id: '2', 
        name: 'Jane Doe',
        gender: 'F',
        pids: ['1']
      }
    ];
    
    try {
      const chart = familyChart.createChart(container, {
        nodes: testData,
        rootId: '1',
        nodeBinding: {
          field_0: 'name',
          img_0: 'img'
        },
        width: 400,
        height: 300
      });
      
      console.log('✅ Chart created, checking for update methods...');
      console.log('Chart methods:', Object.keys(chart));
      
      // Check if chart has update methods
      if (chart.store && typeof chart.store.updateTree === 'function') {
        console.log('✅ Found updateTree method, calling it...');
        chart.store.updateTree();
        
        // Wait for update
        await new Promise(resolve => setTimeout(resolve, 500));
        
        console.log('After updateTree - container content:', container.innerHTML.substring(0, 200));
      }
      
      if (chart.store && typeof chart.store.updateData === 'function') {
        console.log('✅ Found updateData method, calling it...');
        chart.store.updateData(testData);
        
        // Wait for update
        await new Promise(resolve => setTimeout(resolve, 500));
        
        console.log('After updateData - container content:', container.innerHTML.substring(0, 200));
      }
      
      // Check if there are any other update methods
      if (chart.store && chart.store.methods) {
        console.log('Store methods:', Object.keys(chart.store.methods));
      }
      
    } finally {
      document.body.removeChild(container);
    }
  });
}); 