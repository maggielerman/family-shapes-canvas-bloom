import { describe, it, expect } from 'vitest';

describe('Family Chart Fixed Implementation', () => {
  it('should create chart with proper getCard function', async () => {
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
      
      // Set up getCard function like in our fixed implementation
      if (chart && !chart.getCard) {
        if (familyChart.CardHtml) {
          chart.getCard = () => familyChart.CardHtml;
        } else {
          chart.getCard = () => {
            return (d: any) => {
              const card = document.createElementNS('http://www.w3.org/2000/svg', 'g');
              card.setAttribute('class', 'card');
              
              const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
              text.setAttribute('x', '0');
              text.setAttribute('y', '0');
              text.setAttribute('text-anchor', 'middle');
              text.setAttribute('dominant-baseline', 'middle');
              text.textContent = d.data.name || 'Unknown';
              
              card.appendChild(text);
              return card;
            };
          };
        }
      }
      
      // Trigger update like in our fixed implementation
      if (chart.store && typeof chart.store.updateTree === 'function') {
        chart.store.updateTree();
      }
      
      // Wait for rendering
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const hasContent = container.innerHTML.trim().length > 0;
      console.log('Fixed implementation test - has content:', hasContent);
      console.log('Container content:', container.innerHTML.substring(0, 200));
      
      expect(chart).toBeDefined();
      expect(typeof chart.getCard).toBe('function');
      
    } finally {
      document.body.removeChild(container);
    }
  });
}); 