import React, { useRef, useState, useMemo } from 'react';
import ReactFlowFamilyTree, { ReactFlowFamilyTreeHandle } from './ReactFlowFamilyTree';
import { TreeToolbar } from './TreeToolbar';
import { LayoutSwitcher } from './LayoutSwitcher';
import { RelationshipFilter } from './RelationshipFilter';

import { InfoPanel } from './InfoPanel';
import { Person } from '../../../types/person';
import { Connection } from '../../../types/connection';
import { calculateGenerations } from '../../../utils/generationUtils';

interface ReactFlowFamilyTreeCanvasProps {
  persons: Person[];
  connections: Connection[];
  width: number;
  height: number;
  onPersonClick?: (person: Person) => void;
  currentLayout: 'radial' | 'dagre' | 'reactflow' | 'xyflow';
  onLayoutChange: (layout: 'radial' | 'dagre' | 'reactflow' | 'xyflow') => void;
}

export default function ReactFlowFamilyTreeCanvas({
  persons,
  connections,
  width,
  height,
  onPersonClick,
  currentLayout,
  onLayoutChange,
}: ReactFlowFamilyTreeCanvasProps) {
  const [relationshipFilters, setRelationshipFilters] = useState({
    generational: true,
    lateral: true,
    donor: true,
  });

  const treeRef = useRef<ReactFlowFamilyTreeHandle>(null);

  // Filter connections based on relationship filters
  const filteredConnections = useMemo(() => {
    return connections.filter(connection => {
      switch (connection.relationship_type) {
        case 'parent':
          return relationshipFilters.generational;
        case 'spouse':
        case 'partner':
          return relationshipFilters.lateral;
        case 'donor':
          return relationshipFilters.donor;
        default:
          return true;
      }
    });
  }, [connections, relationshipFilters]);

  // Calculate generation map for legend
  const generationMap = useMemo(() => {
    return calculateGenerations(persons, connections);
  }, [persons, connections]);

  const handleRelationshipFilterChange = (category: string, enabled: boolean) => {
    setRelationshipFilters(prev => ({
      ...prev,
      [category]: enabled
    }));
  };

  const toolbar = useMemo(() => {
    return (
      <TreeToolbar
        persons={persons}
        currentLayout={currentLayout}
        onZoomToFit={() => treeRef.current?.zoomFit()}
        onCenterSelf={() => treeRef.current?.centerSelf()}
      />
    );
  }, [persons, currentLayout]);

  return (
    <div className="relative w-full h-full">
      {/* Toolbar */}
      <div className="absolute top-4 left-4 z-10">
        {toolbar}
      </div>

      {/* Layout Switcher */}
      <div className="absolute top-4 right-4 z-10">
        <LayoutSwitcher
          currentLayout={currentLayout}
          onLayoutChange={onLayoutChange}
        />
      </div>

      {/* Relationship Filter */}
      <div className="absolute top-16 right-4 z-10">
        <RelationshipFilter
          relationshipFilters={relationshipFilters}
          onRelationshipFilterChange={handleRelationshipFilterChange}
        />
      </div>

      {/* Generation Legend */}
      <div className="absolute bottom-4 left-4 z-10">

      </div>

      {/* Info Panel */}
      <div className="absolute bottom-4 right-4 z-10">
        <InfoPanel
          layout={currentLayout}
          zoomLevel={1}
          relationshipFilters={relationshipFilters}
        />
      </div>

      {/* Main ReactFlow Family Tree */}
      <ReactFlowFamilyTree
        ref={treeRef}
        persons={persons}
        connections={filteredConnections}
        width={width}
        height={height}
        onPersonClick={onPersonClick}
      />
    </div>
  );
} 