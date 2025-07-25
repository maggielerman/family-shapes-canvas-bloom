import { useEffect, useRef, useState } from 'react';
import { Person } from '@/types/person';
import { Connection } from '@/types/connection';
import { TreeToolbar } from './TreeToolbar';
import { LayoutSwitcher } from './LayoutSwitcher';
import { InfoPanel } from './InfoPanel';

interface RelationshipType {
  value: string;
  label: string;
  color: string;
}

interface FamilyChartLayoutProps {
  persons: Person[];
  connections: Connection[];
  relationshipTypes: RelationshipType[];
  width: number;
  height: number;
  onPersonClick?: (person: Person) => void;
  currentLayout: 'force' | 'radial' | 'dagre' | 'family-chart';
  onLayoutChange: (layout: 'force' | 'radial' | 'dagre' | 'family-chart') => void;
}

// Fixed data transformation function with correct gender format
const transformToFamilyChartFormat = (persons: Person[], connections: Connection[]) => {
  const nodes = persons.map(person => {
    const node: any = {
      id: person.id,
      name: person.name || 'Unknown',
      // Convert gender to M/F format as expected by the library
      gender: person.gender === 'male' ? 'M' : person.gender === 'female' ? 'F' : undefined,
      img: person.profile_photo_url || undefined,
      pids: [], // Initialize partner IDs
      _data: person // Store original data for reference
    };

    // Find parent connections
    const parentConnections = connections.filter(conn => {
      if (conn.relationship_type === 'parent' && conn.to_person_id === person.id) {
        return true;
      }
      if (conn.relationship_type === 'child' && conn.from_person_id === person.id) {
        return true;
      }
      return false;
    });

    // Set parent IDs
    parentConnections.forEach(conn => {
      let parentId: string;
      
      if (conn.relationship_type === 'parent' && conn.to_person_id === person.id) {
        parentId = conn.from_person_id;
      } else if (conn.relationship_type === 'child' && conn.from_person_id === person.id) {
        parentId = conn.to_person_id;
      } else {
        return;
      }
      
      const parent = persons.find(p => p.id === parentId);
      if (parent) {
        if (parent.gender === 'male') {
          if (!node.fid) {
            node.fid = parent.id;
          }
        } else if (parent.gender === 'female') {
          if (!node.mid) {
            node.mid = parent.id;
          }
        } else {
          // Unknown gender - assign to available slot
          if (!node.fid) {
            node.fid = parent.id;
          } else if (!node.mid) {
            node.mid = parent.id;
          }
        }
      }
    });

    // Find spouse connections
    const spouseConnections = connections.filter(
      conn => (conn.from_person_id === person.id || conn.to_person_id === person.id) &&
      (conn.relationship_type === 'spouse' || conn.relationship_type === 'partner')
    );

    // Set partner IDs
    spouseConnections.forEach(conn => {
      const partnerId = conn.from_person_id === person.id ? conn.to_person_id : conn.from_person_id;
      if (!node.pids.includes(partnerId)) {
        node.pids.push(partnerId);
      }
    });

    return node;
  });

  return nodes;
};

// Find root node function
const findRootNode = (nodes: any[], persons: Person[]): string | undefined => {
  // First, try to find a person marked as self
  const selfPerson = persons.find(p => p.is_self === true);
  if (selfPerson) {
    return selfPerson.id;
  }
  
  // If no self person, find someone without parents
  const rootNode = nodes.find(node => !node.mid && !node.fid);
  if (rootNode) {
    return rootNode.id;
  }
  
  // Fallback to first node
  return nodes.length > 0 ? nodes[0].id : undefined;
};

// Comprehensive error logging
const logChartError = (error: any, context: string, persons: Person[], connections: Connection[]) => {
  console.error(`FamilyChartLayout ${context}:`, error);
  console.error('Library info:', {
    persons: persons.length,
    connections: connections.length,
    error: error.message,
    stack: error.stack
  });
};

export function FamilyChartLayout({ 
  persons, 
  connections, 
  relationshipTypes, 
  width, 
  height, 
  onPersonClick,
  currentLayout,
  onLayoutChange
}: FamilyChartLayoutProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [chart, setChart] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (persons.length === 0) {
      console.log('FamilyChartLayout: No persons available');
            return;
        }

        if (!containerRef.current) {
      console.log('FamilyChartLayout: Container not available');
            return;
        }

        let isMounted = true;
        let chartInstance: any = null;

        const initChart = async () => {
            try {
        console.log('FamilyChartLayout: Starting chart initialization...');

                setIsLoading(true);
                setError(null);

                // Import the family-chart library
                const familyChartModule = await import('family-chart');
        const familyChart = familyChartModule.default || familyChartModule;
        
        console.log('FamilyChartLayout: Library imported successfully');
        console.log('FamilyChartLayout: Available methods:', Object.keys(familyChart));
                
        // Check if component is still mounted
                if (!isMounted || !containerRef.current) {
          console.log('FamilyChartLayout: Component unmounted during initialization');
                    return;
                }
                
        // Add a small delay to ensure DOM is ready
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Check again after delay
        if (!isMounted || !containerRef.current) {
          console.log('FamilyChartLayout: Component unmounted after delay');
          return;
        }

        // Transform data with correct format
        const nodes = transformToFamilyChartFormat(persons, connections);
        const rootId = findRootNode(nodes, persons);

        console.log('FamilyChartLayout: Data transformed:', {
          nodesCount: nodes.length,
          rootId,
          sampleNode: nodes[0]
        });

        if (!rootId) {
          throw new Error('No root node found');
        }

        // Clear container
        containerRef.current.innerHTML = '';

        // Try the most likely API signature first
        let chartInstance = null;

        if (typeof familyChart.createChart === 'function') {
          console.log('FamilyChartLayout: Using createChart method');
          chartInstance = familyChart.createChart(containerRef.current, {
            nodes: nodes,
            rootId: rootId,
            nodeBinding: {
              field_0: 'name',
              img_0: 'img',
              field_1: 'birthday'
            },
            width: width,
            height: height
          });
          
          // Set up the getCard function if it's missing
          if (chartInstance && !chartInstance.getCard) {
            console.log('FamilyChartLayout: Setting up getCard function');
            // Use the library's CardHtml function if available
            if (familyChart.CardHtml) {
              chartInstance.getCard = () => familyChart.CardHtml;
            } else {
              // Fallback to a simple card function
              chartInstance.getCard = () => {
                return (d: any) => {
                  const card = document.createElementNS('http://www.w3.org/2000/svg', 'g');
                  card.setAttribute('class', 'card');
                  
                  // Create text element for name
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
        } else if (typeof familyChart === 'function') {
          console.log('FamilyChartLayout: Using constructor approach');
          chartInstance = new familyChart(containerRef.current, {
            data: nodes,
            rootId: rootId,
            nodeBinding: {
              field_0: 'name',
              img_0: 'img',
              field_1: 'birthday'
            }
          });
        } else if (familyChart.FamilyChart && typeof familyChart.FamilyChart === 'function') {
          console.log('FamilyChartLayout: Using FamilyChart constructor');
          chartInstance = new familyChart.FamilyChart(containerRef.current, {
            data: nodes,
            rootId: rootId
          });
        } else {
          throw new Error('No compatible chart creation method found');
        }

        // Trigger chart update if needed
        if (chartInstance && chartInstance.store && typeof chartInstance.store.updateTree === 'function') {
          console.log('FamilyChartLayout: Triggering chart update...');
          chartInstance.store.updateTree();
        }

        // Wait a bit for rendering
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Check if content was rendered
        const hasContent = containerRef.current.innerHTML.trim().length > 0;
        console.log('FamilyChartLayout: Chart rendering check:', {
          hasContent,
          innerHTML: containerRef.current.innerHTML.substring(0, 200),
          elementCount: containerRef.current.children.length
        });

        if (!hasContent) {
          console.warn('FamilyChartLayout: No content rendered, but chart was created');
        }

        if (isMounted) {
          setChart(chartInstance);
          setZoomLevel(1);
        }

      } catch (error) {
        logChartError(error, 'Chart Creation', persons, connections);
        if (isMounted) {
          setError(`Failed to create chart: ${error instanceof Error ? error.message : 'Unknown error'}`);
          if (containerRef.current) {
            containerRef.current.textContent = '';
            const errorDiv = document.createElement('div');
            errorDiv.style.padding = '20px';
            errorDiv.style.textAlign = 'center';
            errorDiv.style.color = '#666';
            
            const title = document.createElement('h3');
            title.textContent = 'Unable to render family chart';
            errorDiv.appendChild(title);
            
            const errorText = document.createElement('p');
            errorText.textContent = `Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
            errorDiv.appendChild(errorText);
            
            const helpText = document.createElement('p');
            helpText.style.fontSize = '0.9em';
            helpText.textContent = 'Check browser console for details';
            errorDiv.appendChild(helpText);
            
            containerRef.current.appendChild(errorDiv);
          }
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initChart();

    return () => {
      isMounted = false;
    };
  }, [persons, connections, width, height]);

  // Add click handler using DOM event delegation
  useEffect(() => {
    if (!onPersonClick || !containerRef.current) return;

    const clickHandler = (event: MouseEvent) => {
      let target = event.target as HTMLElement;
      
      while (target && target !== containerRef.current) {
        // Check for person ID in data attributes
        const personId = target.getAttribute('data-person-id') || 
                         target.getAttribute('data-id') ||
                         target.getAttribute('data-node-id') ||
                         target.getAttribute('id');
        
        if (personId) {
          const person = persons.find(p => p.id === personId);
          if (person) {
            console.log('FamilyChartLayout: Click detected on person:', person.name);
            onPersonClick(person);
            return;
          }
        }
        
        // Check for person name in text content
        const textContent = target.textContent || '';
        const nodeClasses = ['node', 'family-chart-node', 'card', 'person', 'member'];
        
        const matchingPersons = persons.filter(p => 
          p.name && textContent.includes(p.name)
        );
        
        if (matchingPersons.length > 0) {
          const isLikelyPersonNode = 
            nodeClasses.some(cls => target.classList.contains(cls)) ||
            target.hasAttribute('data-person-id') ||
            target.hasAttribute('data-id') ||
            target.hasAttribute('data-node-id');
          
          if (isLikelyPersonNode) {
            const matchingPerson = matchingPersons[0];
            console.log('FamilyChartLayout: Click detected on person by name:', matchingPerson.name);
            onPersonClick(matchingPerson);
            return;
          }
        }
        
        target = target.parentElement as HTMLElement;
      }
    };
    
    containerRef.current.addEventListener('click', clickHandler);
    
    return () => {
      if (containerRef.current) {
        containerRef.current.removeEventListener('click', clickHandler);
      }
    };
  }, [persons, onPersonClick]);

  const handleCenterSelf = () => {
    if (!chart) return;
    
    const selfPerson = persons.find(person => person.is_self === true);
    if (selfPerson) {
      if (typeof chart.centerOn === 'function') {
        chart.centerOn(selfPerson.id);
      }
    }
  };

  const handleZoomToFit = () => {
    if (!chart) return;
    if (typeof chart.fit === 'function') {
      chart.fit();
      setZoomLevel(1);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div data-testid="loading-spinner" className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="text-red-500 mb-2">Error</div>
          <div className="text-sm text-muted-foreground">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Toolbar - top right */}
      <div className="absolute top-4 right-4 z-10">
        <TreeToolbar
          persons={persons}
          currentLayout={currentLayout}
          onCenterSelf={handleCenterSelf}
          onZoomToFit={handleZoomToFit}
          className="bg-background/80 backdrop-blur-sm rounded-lg p-3"
        />
      </div>

      {/* Layout Switcher - top left */}
      <div className="absolute top-4 left-4 z-10">
        <LayoutSwitcher
          currentLayout={currentLayout}
          onLayoutChange={onLayoutChange}
        />
      </div>

      {/* Info Panel - bottom left */}
      <div className="absolute bottom-4 left-4 z-10">
        <InfoPanel
          layout="Family Chart"
          zoomLevel={zoomLevel}
          relationshipFilters={{
            generational: true,
            lateral: true,
            donor: true
          }}
        />
      </div>

      {/* Chart Container */}
      <div 
        ref={containerRef}
        className="border rounded-lg bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden"
        style={{ width, height }}
      />
    </div>
  );
} 