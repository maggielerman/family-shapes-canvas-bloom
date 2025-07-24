import { useEffect, useRef, useState } from 'react';
import { Person } from '@/types/person';
import { Connection } from '@/types/connection';
import { TreeToolbar } from './TreeToolbar';
import { LayoutSwitcher } from './LayoutSwitcher';
import { InfoPanel } from './InfoPanel';
import { transformToFamilyChartData, transformToSimpleFamilyData, findRootNode } from '@/utils/familyChartAdapter';

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
            console.log('FamilyChartLayout: useEffect early return - no persons');
            return;
        }

        // Check if container exists immediately
        if (!containerRef.current) {
            console.log('FamilyChartLayout: No container ref available');
            return;
        }

        let isMounted = true;

        const initChart = async () => {
            try {
                // Check container at the start of async function
                if (!containerRef.current) {
                    console.log('FamilyChartLayout: No container ref at start of initChart');
                    return;
                }

                setIsLoading(true);
                setError(null);

                console.log('FamilyChartLayout: Starting initChart...');

                // Import the family-chart library
                console.log('FamilyChartLayout: Importing family-chart...');
                const familyChartModule = await import('family-chart');
                console.log('FamilyChartLayout: Import successful');
                
                // Check if component is still mounted after async import
                if (!isMounted || !containerRef.current) {
                    console.log('FamilyChartLayout: Component unmounted or container lost after import');
                    return;
                }
                
                const familyChart = familyChartModule.default || familyChartModule;
                console.log('FamilyChartLayout: Got familyChart object');
                
                const { createChart, CardHtml } = familyChart;
                console.log('FamilyChartLayout: Destructured createChart and CardHtml');
                console.log('FamilyChartLayout: createChart type:', typeof createChart);
                console.log('FamilyChartLayout: CardHtml type:', typeof CardHtml);

                // Clear the container
                containerRef.current.innerHTML = '';
                console.log('FamilyChartLayout: Container cleared');

                // Transform our data to family-chart format
                console.log('FamilyChartLayout: Transforming data...');
                const familyData = transformToFamilyChartData(persons, connections);
                const simpleData = transformToSimpleFamilyData(persons, connections);
                console.log('FamilyChartLayout: Complex data transformation complete:', familyData);
                console.log('FamilyChartLayout: Simple data transformation complete:', simpleData);
                
                if (familyData.nodes.length === 0) {
                    console.log('FamilyChartLayout: No nodes found');
                    if (containerRef.current) {
                        containerRef.current.textContent = 'No family data available';
                        containerRef.current.className = 'flex items-center justify-center h-full text-muted-foreground';
                    }
                    return;
                }

                // Find the root node
                console.log('FamilyChartLayout: Finding root node...');
                const rootId = findRootNode(familyData.nodes, persons);
                const simpleRootId = findRootNode(simpleData, persons);
                console.log('FamilyChartLayout: Root ID found:', rootId);
                console.log('FamilyChartLayout: Simple Root ID found:', simpleRootId);
                
                if (!rootId) {
                    throw new Error('No root node found');
                }

                // Final container check before rendering
                if (!containerRef.current) {
                    console.log('FamilyChartLayout: Container lost before rendering');
                    return;
                }

                console.log('FamilyChartLayout: About to call createChart function');
                console.log('FamilyChartLayout: Container element:', containerRef.current);
                console.log('FamilyChartLayout: Root ID:', rootId);
                console.log('FamilyChartLayout: Width/Height:', width, height);
                console.log('FamilyChartLayout: Data nodes count:', familyData.nodes.length);
                console.log('FamilyChartLayout: First few nodes:', familyData.nodes.slice(0, 3));
                
                let familyTree;
                
                // Create a factory function to handle different possible API signatures
                const createFamilyChart = () => {
                    // First, let's check what we actually imported
                    console.log('FamilyChartLayout: familyChart module type:', typeof familyChart);
                    console.log('FamilyChartLayout: familyChart module keys:', Object.keys(familyChart));
                    
                    // If createChart is not a function, try to find the correct method
                    if (typeof createChart !== 'function') {
                        // Check if familyChart itself is the constructor
                        if (typeof familyChart === 'function') {
                            console.log('FamilyChartLayout: familyChart is a function, using it directly');
                            return new familyChart(containerRef.current, {
                                data: familyData.nodes,
                                rootId: rootId
                            });
                        }
                        
                        // Check for other possible entry points
                        const possibleMethods = ['FamilyChart', 'create', 'init', 'render'];
                        for (const method of possibleMethods) {
                            if (typeof familyChart[method] === 'function') {
                                console.log(`FamilyChartLayout: Found method ${method}, trying it`);
                                return familyChart[method](containerRef.current, {
                                    data: familyData.nodes,
                                    rootId: rootId
                                });
                            }
                        }
                        
                        throw new Error('Could not find a valid chart creation method');
                    }
                    
                    // If createChart exists, try different API signatures
                    const signatures = [
                        // Signature 1: Standard D3 pattern (container, config) with simple data
                        () => createChart(containerRef.current, {
                            data: simpleData,
                            rootId: simpleRootId || rootId,
                            width: width,
                            height: height
                        }),
                        
                        // Signature 2: Standard D3 pattern with complex data
                        () => createChart(containerRef.current, {
                            data: familyData.nodes,
                            rootId: rootId,
                            width: width,
                            height: height
                        }),
                        
                        // Signature 3: Data first, then container (simple data)
                        () => createChart(simpleData, containerRef.current),
                        
                        // Signature 4: Data first, then container (complex data)
                        () => createChart(familyData.nodes, containerRef.current),
                        
                        // Signature 5: Container only, with chained methods
                        () => {
                            const chart = createChart(containerRef.current);
                            if (chart && typeof chart.data === 'function') {
                                return chart.data(simpleData);
                            }
                            return chart;
                        },
                        
                        // Signature 6: Constructor pattern with simple data
                        () => new createChart(containerRef.current, simpleData),
                        
                        // Signature 7: jQuery-like pattern with simple data
                        () => createChart({
                            container: containerRef.current,
                            data: simpleData,
                            rootId: simpleRootId || rootId
                        }),
                        
                        // Signature 8: Direct instantiation with container and options
                        () => {
                            if (typeof familyChart === 'function') {
                                return new familyChart(containerRef.current, {
                                    data: simpleData,
                                    main_id: simpleRootId || rootId
                                });
                            }
                            throw new Error('familyChart is not a constructor');
                        }
                    ];
                    
                    // Try each signature until one works
                    for (let i = 0; i < signatures.length; i++) {
                        try {
                            console.log(`FamilyChartLayout: Trying signature ${i + 1}`);
                            const result = signatures[i]();
                            if (result) {
                                console.log(`FamilyChartLayout: Signature ${i + 1} succeeded`);
                                return result;
                            }
                        } catch (e) {
                            console.log(`FamilyChartLayout: Signature ${i + 1} failed:`, e.message);
                        }
                    }
                    
                    throw new Error('All chart creation methods failed');
                };
                
                try {
                    familyTree = createFamilyChart();
                    console.log('FamilyChartLayout: Family tree created successfully:', familyTree);
                } catch (error) {
                    console.error('FamilyChartLayout: Failed to create family tree:', error);
                    
                    // As a last resort, render a simple message
                    if (containerRef.current) {
                        containerRef.current.innerHTML = `
                            <div style="padding: 20px; text-align: center;">
                                <h3>Unable to render family chart</h3>
                                <p>The family-chart library failed to initialize properly.</p>
                                <p style="font-size: 0.9em; color: #666;">Error: ${error.message}</p>
                            </div>
                        `;
                    }
                    throw error;
                }
                
                console.log('FamilyChartLayout: Container after chart creation:', containerRef.current.innerHTML);

                // Add click handler if supported
                if (onPersonClick && familyTree && typeof familyTree.on === 'function') {
                    familyTree.on('click', (node: any) => {
                        if (node && node.id) {
                            const person = persons.find(p => p.id === node.id);
                            if (person) {
                                onPersonClick(person);
                            }
                        }
                    });
                }

                if (isMounted) {
                    setChart(familyTree);
                    setZoomLevel(1);
                }
            } catch (error) {
                console.error('FamilyChartLayout: Error in initChart:', error);
                if (isMounted) {
                    setError(`Failed to load family chart: ${error instanceof Error ? error.message : 'Unknown error'}`);
                    if (containerRef.current) {
                        containerRef.current.textContent = `Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
                        containerRef.current.className = 'flex items-center justify-center h-full text-red-500';
                    }
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        // Start the chart initialization immediately
        initChart();

        return () => {
            isMounted = false;
        };
    }, [persons, connections, width, height, onPersonClick]);

  const handleCenterSelf = () => {
    if (!chart) return;
    
    const selfPerson = persons.find(person => person.is_self === true);
    if (selfPerson) {
      // Try to center on the person if the chart has this method
      if (typeof chart.centerOn === 'function') {
        chart.centerOn(selfPerson.id);
      }
    }
  };

  const handleZoomToFit = () => {
    if (!chart) return;
    // Try to fit the chart if it has this method
    if (typeof chart.fit === 'function') {
      chart.fit();
      setZoomLevel(1);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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