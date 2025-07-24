import React, { useRef, useState } from 'react';
import CleanUnionDagreLayout, { UnionDagreHandle } from './CleanUnionDagreLayout';
import { Person } from '@/types/person';
import { Connection } from '@/types/connection';
import { TreeToolbar } from './TreeToolbar';
import { LayoutSwitcher } from './LayoutSwitcher';
import { RelationshipFilter } from './RelationshipFilter';
import { GenerationLegend } from './GenerationLegend';
import { InfoPanel } from './InfoPanel';
import { processConnections } from '@/utils/connectionProcessing';
import { RELATIONSHIP_CATEGORIES } from './relationshipConstants';

interface UnionDagreCanvasProps {
  persons: Person[];
  connections: Connection[];
  width: number;
  height: number;
  onPersonClick?: (p: Person) => void;
  currentLayout: 'force' | 'radial' | 'dagre' | 'family-chart';
  onLayoutChange: (l: 'force' | 'radial' | 'dagre' | 'family-chart') => void;
}

export default function UnionDagreCanvas({ persons, connections, width, height, onPersonClick, currentLayout, onLayoutChange }: UnionDagreCanvasProps) {
  const [relationshipFilters, setRelationshipFilters] = useState({ generational: true, lateral: true, donor: true });
  const unionRef = useRef<UnionDagreHandle>(null);

  // generation map for legend
  const { generationMap } = processConnections(persons, connections);

  return (
    <div className="relative w-full h-full">
      {/* toolbar */}
      <TreeToolbar
        persons={persons}
        currentLayout="dagre"
        onCenterSelf={() => {}}
        onZoomToFit={() => unionRef.current?.resetZoom()}
        onLayoutDirectionChange={undefined}
        className="absolute right-2 top-2 z-20"
      />

      {/* layout switcher */}
      <LayoutSwitcher
        currentLayout={currentLayout}
        onLayoutChange={onLayoutChange}
        className="absolute left-2 top-2 z-20"
      />

      {/* relationship filter */}
      <RelationshipFilter
        relationshipFilters={relationshipFilters}
        onRelationshipFilterChange={(cat, val) =>
          setRelationshipFilters((prev) => ({ ...prev, [cat]: val }))
        }
        className="absolute left-2 top-14 z-20"
      />

      {/* legend */}
      <GenerationLegend generationMap={generationMap} className="absolute left-2 top-40 z-20" />

      {/* info */}
      <InfoPanel layout="Tree" zoomLevel={100} relationshipFilters={relationshipFilters} className="absolute left-2 bottom-2 z-20" />

      {/* canvas */}
      <CleanUnionDagreLayout
        ref={unionRef}
        persons={persons}
        connections={connections}
        width={width}
        height={height}
        enableUnions={true}
        onPersonClick={onPersonClick}
        minSharedChildren={1}
      />
    </div>
  );
} 