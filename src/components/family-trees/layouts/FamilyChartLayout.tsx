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
        console.log('FamilyChartLayout: Testing import...');
        let familyChartModule;
        try {
          familyChartModule = await import('family-chart');
          console.log('FamilyChartLayout: Module imported:', familyChartModule);
        } catch (importError) {
          console.error('FamilyChartLayout: Import failed:', importError);
          throw new Error(`Import failed: ${importError instanceof Error ? importError.message : 'Unknown import error'}`);
        }
        
        // Test 2: Check available exports
        console.log('FamilyChartLayout: Available exports:', Object.keys(familyChartModule));
        
        // The module exports a default object with all functions
        const familyChart = familyChartModule.default || familyChartModule;
        console.log('FamilyChartLayout: Family chart object:', familyChart);
        console.log('FamilyChartLayout: Available functions:', Object.keys(familyChart));
        
        // Use view function from the family chart object
        const { view, CardHtml } = familyChart;
        if (typeof view !== 'function') {
          console.error('FamilyChartLayout: view is not a function:', typeof view);
          console.error('FamilyChartLayout: Available functions:', Object.keys(familyChart));
          throw new Error('view is not a function');
        }
        
        if (typeof CardHtml !== 'function') {
          console.error('FamilyChartLayout: CardHtml is not a function:', typeof CardHtml);
          throw new Error('CardHtml is not a function');
        }
        
        // Clear the container
        if (containerRef.current) {
          containerRef.current.innerHTML = '';
        }
        
        // Transform our data to family-chart format
        console.log('FamilyChartLayout: Transforming data...');
        const familyData = transformToFamilyChartData(persons, connections);
        console.log('FamilyChartLayout: Transformed data:', familyData);
        
        if (familyData.nodes.length === 0) {
          console.log('FamilyChartLayout: No nodes found, showing empty state');
          if (containerRef.current) {
            containerRef.current.textContent = 'No family data available';
            containerRef.current.className = 'flex items-center justify-center h-full text-muted-foreground';
          }
          return;
        }

        // Find the root node
        console.log('FamilyChartLayout: Finding root node...');
        const rootId = findRootNode(familyData.nodes, persons);
        console.log('FamilyChartLayout: Root ID:', rootId);
        
        // Test 3: Create a minimal configuration first
        console.log('FamilyChartLayout: Creating family tree with minimal config...');
        const minimalConfig = {
          rootId: rootId,
          width: width,
          height: height
        };
        
        console.log('FamilyChartLayout: Minimal config:', minimalConfig);
        
        // Check if container still exists before proceeding
        if (!containerRef.current) {
          console.log('FamilyChartLayout: Container no longer exists, aborting');
          return;
        }
        
        console.log('FamilyChartLayout: Container element:', containerRef.current);
        
        // Create an SVG element for the family chart
        const svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svgElement.setAttribute('width', width.toString());
        svgElement.setAttribute('height', height.toString());
        containerRef.current.appendChild(svgElement);
        
        // Create the family tree with beautiful styling
        // Call the view function with correct parameters
        const familyTree = view(familyData.nodes, svgElement, CardHtml, minimalConfig);
        console.log('FamilyChartLayout: Family tree instance created successfully');

        // Test 4: Set the data
        console.log('FamilyChartLayout: Setting data...');
        familyTree.setData(familyData.nodes);
        console.log('FamilyChartLayout: Data set successfully');
        
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
        setError(`Failed to load family chart: ${error instanceof Error ? error.message : 'Unknown error'}`);
        if (containerRef.current) {
          containerRef.current.textContent = `Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
          containerRef.current.className = 'flex items-center justify-center h-full text-red-500';
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
    </div>
  );
} 