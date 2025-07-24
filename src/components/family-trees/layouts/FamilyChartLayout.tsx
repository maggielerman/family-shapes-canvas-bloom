import { useEffect, useRef, useState } from 'react';
import { Person } from '@/types/person';
import { Connection } from '@/types/connection';
import { TreeToolbar } from './TreeToolbar';
import { LayoutSwitcher } from './LayoutSwitcher';
import { InfoPanel } from './InfoPanel';
import { transformToFamilyChartData, findRootNode } from '@/utils/familyChartAdapter';

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
        let cleanupClickHandler: (() => void) | null = null;

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
                console.log('FamilyChartLayout: Data transformation complete');
                
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
                console.log('FamilyChartLayout: Root ID found:', rootId);
                
                if (!rootId) {
                    throw new Error('No root node found');
                }

                // Final container check before rendering
                if (!containerRef.current) {
                    console.log('FamilyChartLayout: Container lost before rendering');
                    return;
                }

                // Render the family chart using the correct API
                console.log('FamilyChartLayout: About to call createChart function');
                console.log('FamilyChartLayout: Container element:', containerRef.current);
                console.log('FamilyChartLayout: Root ID:', rootId);
                console.log('FamilyChartLayout: Width/Height:', width, height);
                console.log('FamilyChartLayout: Data nodes count:', familyData.nodes.length);
                console.log('FamilyChartLayout: First few nodes:', familyData.nodes.slice(0, 3));
                
                let familyTree;
                try {
                    // Try the simpler createChart API first with main_id
                    familyTree = createChart(containerRef.current, {
                        data: familyData.nodes,
                        main_id: rootId
                    });
                    console.log('FamilyChartLayout: createChart function completed successfully');
                } catch (viewError) {
                    console.error('FamilyChartLayout: createChart function failed:', viewError);
                    // Try with the original parameters if the simple call fails
                    try {
                        familyTree = createChart(
                          familyData.nodes,
                          containerRef.current,
                          CardHtml,
                          {
                            rootId,
                            width,
                            height,
                            nodeBinding: {
                              field_0: 'name',
                              field_1: 'birthday',
                            },
                            enableSearch: false,
                            enableMenu: false,
                            enableDragDrop: false,
                          }
                        );
                        console.log('FamilyChartLayout: createChart with full config completed successfully');
                    } catch (secondError) {
                        console.error('FamilyChartLayout: Both createChart attempts failed:', secondError);
                        throw new Error(`createChart function failed: ${secondError instanceof Error ? secondError.message : 'Unknown view error'}`);
                    }
                }
                
                console.log('FamilyChartLayout: Family tree object:', familyTree);
                console.log('FamilyChartLayout: Container after view:', containerRef.current.innerHTML);

                // Log the DOM structure to understand what the library creates
                if (containerRef.current) {
                    const firstNode = containerRef.current.querySelector('[data-id], [data-person-id], [data-node-id], .node, .family-chart-node, .card');
                    if (firstNode) {
                        console.log('FamilyChartLayout: Found node element:', firstNode);
                        console.log('FamilyChartLayout: Node attributes:', Array.from(firstNode.attributes).map(attr => `${attr.name}="${attr.value}"`).join(' '));
                    } else {
                        console.log('FamilyChartLayout: No node elements found with expected selectors');
                    }
                }

                // Add click handler using DOM event delegation instead of library API
                if (onPersonClick && containerRef.current) {
                    // Use event delegation to handle clicks on nodes
                    const clickHandler = (event: MouseEvent) => {
                        // Find the clicked element or its parent that represents a node
                        let target = event.target as HTMLElement;
                        
                        // Traverse up the DOM tree to find a node element
                        while (target && target !== containerRef.current) {
                            // Check for various possible node identifiers
                            // Try data attributes first
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
                            
                            // Check if this element or its parents contain text that matches a person name
                            // This is a fallback if IDs are not properly set in the DOM
                            const textContent = target.textContent || '';
                            
                            // Define node classes that indicate person elements
                            const nodeClasses = ['node', 'family-chart-node', 'card', 'person', 'member'];
                            
                            // Find all persons whose names appear in the text content
                            const matchingPersons = persons.filter(p => 
                                p.name && textContent.includes(p.name)
                            );
                            
                            // If we have matches, select the most specific one (longest name)
                            // This prevents "John" from matching when "Johnson" is the actual target
                            let matchingPerson = null;
                            if (matchingPersons.length > 0) {
                                // Sort by name length descending to get the most specific match first
                                matchingPersons.sort((a, b) => (b.name?.length || 0) - (a.name?.length || 0));
                                
                                // Additional check: try to find exact word boundary matches
                                for (const person of matchingPersons) {
                                    if (!person.name) continue;
                                    
                                    // Create a regex to match the name as a whole word
                                    const wordBoundaryRegex = new RegExp(`\\b${person.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`);
                                    if (wordBoundaryRegex.test(textContent)) {
                                        matchingPerson = person;
                                        break;
                                    }
                                }
                                
                                // If no exact word boundary match, use the longest name match
                                if (!matchingPerson) {
                                    matchingPerson = matchingPersons[0];
                                }
                            }
                            
                            if (matchingPerson) {
                                // Check if this element is likely a person node
                                // Allow clicks on elements that contain person names even if they have child elements
                                const isLikelyPersonNode = 
                                    // Element has person-related classes
                                    nodeClasses.some(cls => target.classList.contains(cls)) ||
                                    // Element has person-related data attributes
                                    target.hasAttribute('data-person-id') ||
                                    target.hasAttribute('data-id') ||
                                    target.hasAttribute('data-node-id') ||
                                    // Element is within the chart container and not in unrelated UI
                                    ((function() {
                                        // Check if we're within the chart container
                                        const chartContainer = target.closest('[data-id], [data-person-id], [data-node-id], .node, .family-chart-node, .card');
                                        const isInChartContainer = chartContainer !== null || target === containerRef.current || containerRef.current?.contains(target);
                                        
                                        // Exclude common navigation/UI elements
                                        const isExcludedElement = target.closest('nav, header, footer, aside, .sidebar, .navigation, .menu, .toolbar') !== null;
                                        
                                        return isInChartContainer && !isExcludedElement;
                                    })() &&
                                     // And the element seems to be a clickable person node
                                     ((target.hasAttribute('role') && ['button', 'link', 'treeitem'].includes(target.getAttribute('role') || '')) ||
                                      target.tagName === 'BUTTON' || target.tagName === 'A' ||
                                      // Or the element's primary content is the person's name
                                      (target.textContent?.trim() === matchingPerson.name && target.children.length <= 2) || 
                                      // Or has a direct text node with the exact name
                                      Array.from(target.childNodes).some(node => 
                                         node.nodeType === Node.TEXT_NODE && 
                                         node.textContent?.trim() === matchingPerson.name
                                      )));
                                
                                if (isLikelyPersonNode) {
                                    console.log('FamilyChartLayout: Click detected on person by name match:', matchingPerson.name);
                                    onPersonClick(matchingPerson);
                                    return;
                                }
                            }
                            
                            // Check parent classes for node indicators
                            const isNodeElement = nodeClasses.some(cls => target.classList.contains(cls));
                            
                            if (isNodeElement) {
                                // Try to extract ID from the element or its children
                                const idElement = target.querySelector('[data-person-id], [data-id], [data-node-id], [id]');
                                if (idElement) {
                                    const personId = idElement.getAttribute('data-person-id') || 
                                                   idElement.getAttribute('data-id') ||
                                                   idElement.getAttribute('data-node-id') ||
                                                   idElement.getAttribute('id');
                                    if (personId) {
                                        const person = persons.find(p => p.id === personId);
                                        if (person) {
                                            console.log('FamilyChartLayout: Click detected on person from child element:', person.name);
                                            onPersonClick(person);
                                            return;
                                        }
                                    }
                                }
                                
                                // Also try to find ID in the text content using regex
                                const idMatch = target.innerHTML.match(/data-id="([^"]+)"|id="([^"]+)"/);
                                if (idMatch) {
                                    const extractedId = idMatch[1] || idMatch[2];
                                    const person = persons.find(p => p.id === extractedId);
                                    if (person) {
                                        console.log('FamilyChartLayout: Click detected on person from HTML match:', person.name);
                                        onPersonClick(person);
                                        return;
                                    }
                                }
                            }
                            
                            target = target.parentElement as HTMLElement;
                        }
                        
                        console.log('FamilyChartLayout: Click event did not match any person');
                    };
                    
                    containerRef.current.addEventListener('click', clickHandler);
                    
                    // Store the cleanup function
                    const currentContainer = containerRef.current;
                    cleanupClickHandler = () => {
                        currentContainer.removeEventListener('click', clickHandler);
                    };
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
            if (cleanupClickHandler) {
                cleanupClickHandler();
            }
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