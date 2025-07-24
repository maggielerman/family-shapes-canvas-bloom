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
    if (!containerRef.current || persons.length === 0) return;

    const initChart = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Import the family-chart library
        const FamilyTree = (await import('family-chart')).default;
        
        // Clear the container
        containerRef.current!.innerHTML = '';
        
        // Transform our data to family-chart format
        const familyData = transformToFamilyChartData(persons, connections);
        
        if (familyData.nodes.length === 0) {
          containerRef.current!.innerHTML = '<div class="flex items-center justify-center h-full text-muted-foreground">No family data available</div>';
          return;
        }

        // Find the root node
        const rootId = findRootNode(familyData.nodes, persons);
        
        // Create the family tree with beautiful styling
        const familyTree = new FamilyTree(containerRef.current!, {
          // Tree configuration
          rootId: rootId,
          width: width,
          height: height,
          
          // Node styling - inspired by the beautiful examples
          nodeWidth: 180,
          nodeHeight: 200,
          nodePadding: 20,
          
          // Layout configuration
          levelHeight: 200,
          siblingSeparation: 100,
          subtreeSeparation: 150,
          
          // Enable interactions
          zoom: true,
          fit: true,
          
          // Custom node template with beautiful design
          template: (node: any) => {
            const person = node.person || {};
            const avatar = person.profile_photo_url || '/placeholder.svg';
            const name = node.name || 'Unknown';
            const birthday = node.birthday ? new Date(node.birthday).getFullYear() : '';
            
            return `
              <div class="family-chart-node" data-person-id="${node.id}" style="
                width: 180px;
                height: 200px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 16px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
                border: 3px solid rgba(255, 255, 255, 0.2);
                color: white;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 16px;
                text-align: center;
                position: relative;
                overflow: hidden;
              ">
                <!-- Background pattern -->
                <div style="
                  position: absolute;
                  top: 0;
                  left: 0;
                  right: 0;
                  bottom: 0;
                  background: url('data:image/svg+xml,<svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd"><g fill="%23ffffff" fill-opacity="0.05"><path d="m36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/></g></g></svg>') repeat;
                  opacity: 0.1;
                "></div>
                
                <!-- Content -->
                <div style="position: relative; z-index: 1;">
                  <!-- Avatar -->
                  <div style="
                    width: 80px;
                    height: 80px;
                    border-radius: 50%;
                    background: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 12px;
                    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
                    overflow: hidden;
                  ">
                    <img src="${avatar}" alt="${name}" style="
                      width: 100%;
                      height: 100%;
                      object-fit: cover;
                      border-radius: 50%;
                    " onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                    <div style="
                      display: none;
                      width: 100%;
                      height: 100%;
                      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
                      align-items: center;
                      justify-content: center;
                      color: white;
                      font-weight: bold;
                      font-size: 24px;
                    ">${name.charAt(0).toUpperCase()}</div>
                  </div>
                  
                  <!-- Name -->
                  <div style="
                    font-weight: 600;
                    font-size: 16px;
                    margin-bottom: 4px;
                    line-height: 1.2;
                    max-width: 140px;
                    word-wrap: break-word;
                  ">${name}</div>
                  
                  <!-- Birth year -->
                  ${birthday ? `<div style="
                    font-size: 12px;
                    opacity: 0.8;
                    font-weight: 400;
                  ">Born ${birthday}</div>` : ''}
                  
                  <!-- Gender indicator -->
                  <div style="
                    position: absolute;
                    top: 12px;
                    right: 12px;
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.2);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 12px;
                    font-weight: bold;
                  ">${node.gender === 'M' ? '♂' : node.gender === 'F' ? '♀' : '●'}</div>
                </div>
              </div>
            `;
          },
          
          // Custom connector styling
          connectorStyle: {
            stroke: 'rgba(102, 126, 234, 0.6)',
            strokeWidth: 2,
            strokeDasharray: 'none'
          }
        });

        // Set the data
        familyTree.setData(familyData.nodes);
        
        // Add click handlers
        containerRef.current!.addEventListener('click', (event) => {
          const nodeElement = (event.target as Element).closest('.family-chart-node');
          if (nodeElement && onPersonClick) {
            const personId = nodeElement.getAttribute('data-person-id');
            const person = persons.find(p => p.id === personId);
            if (person) {
              onPersonClick(person);
            }
          }
        });

        // Store chart reference
        setChart(familyTree);
        
        // Set initial zoom level
        setZoomLevel(1);
        
      } catch (error) {
        console.error('Error initializing family chart:', error);
        setError('Failed to load family chart');
        if (containerRef.current) {
          containerRef.current.innerHTML = '<div class="flex items-center justify-center h-full text-red-500">Error loading family tree</div>';
        }
      } finally {
        setIsLoading(false);
      }
    };

    initChart();
  }, [persons, connections, width, height, onPersonClick]);

  const handleCenterSelf = () => {
    if (!chart) return;
    
    const selfPerson = persons.find(person => person.is_self === true);
    if (selfPerson) {
      chart.centerOn(selfPerson.id);
    }
  };

  const handleZoomToFit = () => {
    if (!chart) return;
    chart.fit();
    setZoomLevel(1);
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
        className="w-full h-full bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg overflow-hidden"
        style={{ width, height }}
      />
      
      {/* Custom styles for hover effects */}
      <style jsx>{`
        .family-chart-node:hover {
          transform: translateY(-4px) scale(1.02);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
        }
      `}</style>
    </div>
  );
} 