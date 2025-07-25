import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import * as dagre from 'dagre';
import { Person } from '@/types/person';
import { Connection } from '@/types/connection';
// Removed RelationshipType import - using any[] for demo
import { UnionNodeGroup, UnionConnectionLine, ParentUnionConnection } from './UnionNodeSVG';
import { processConnectionsWithUnions } from '@/services/unionProcessingService';
import { UnionProcessedData, UnionNode, EnhancedConnection } from '@/types/unionTypes';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface UnionDagreLayoutProps {
  persons: Person[];
  connections: Connection[];
  relationshipTypes: any[]; // Simplified type for demo
  width: number;
  height: number;
  onPersonClick?: (person: Person) => void;
  onUnionClick?: (union: UnionNode) => void;
  currentLayout?: 'TB' | 'LR' | 'BT' | 'RL';
  onLayoutChange?: (layout: 'TB' | 'LR' | 'BT' | 'RL') => void;
  enableUnions?: boolean;
  minSharedChildren?: number;
}

export function UnionDagreLayout({
  persons,
  connections,
  relationshipTypes,
  width,
  height,
  onPersonClick,
  onUnionClick,
  currentLayout = 'TB',
  onLayoutChange,
  enableUnions = true,
  minSharedChildren = 1
}: UnionDagreLayoutProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [processedData, setProcessedData] = useState<UnionProcessedData | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Process data with unions if enabled
  useEffect(() => {
    if (enableUnions) {
      const processed = processConnectionsWithUnions(persons, connections, {
        minSharedChildren,
        includeSingleParents: true,
        groupSiblings: true
      });
      setProcessedData(processed);
    } else {
      // Use original data without unions
      setProcessedData({
        persons,
        unions: [],
        enhancedConnections: connections.map(conn => ({
          id: conn.id,
          fromPersonId: conn.from_person_id,
          toPersonId: conn.to_person_id,
          relationshipType: conn.relationship_type,
          originalConnectionId: conn.id
        })),
        familyUnits: [],
        originalConnections: connections
      });
    }
  }, [persons, connections, enableUnions, minSharedChildren]);

  // D3 rendering
  useEffect(() => {
    if (!svgRef.current || !processedData) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const g = svg.append('g');

    // Simple generation assignment based on family structure
    const generationMap = new Map<string, number>();
    
    // Find root nodes (people with no parents)
    const hasParents = new Set<string>();
    processedData.enhancedConnections.forEach(conn => {
      if (conn.toPersonId) {
        hasParents.add(conn.toPersonId);
      }
    });
    
    // Assign generations
    const assignGenerations = (personId: string, generation: number, visited = new Set<string>()) => {
      if (visited.has(personId)) return;
      visited.add(personId);
      
      generationMap.set(personId, generation);
      
      // Find children of this person
      processedData.enhancedConnections.forEach(conn => {
        if (conn.fromPersonId === personId && conn.toPersonId) {
          assignGenerations(conn.toPersonId, generation + 1, new Set(visited));
        }
      });
    };
    
    // Start with root nodes (generation 0)
    processedData.persons.forEach(person => {
      if (!hasParents.has(person.id)) {
        assignGenerations(person.id, 0);
      }
    });
    
    // Ensure all persons have a generation
    processedData.persons.forEach(person => {
      if (!generationMap.has(person.id)) {
        generationMap.set(person.id, 0);
      }
    });

    // Group nodes by generation
    const generations = new Map<number, any[]>();
    
    // Add persons to generations
    processedData.persons.forEach(person => {
      const generation = generationMap.get(person.id) || 0;
      if (!generations.has(generation)) {
        generations.set(generation, []);
      }
      generations.get(generation)!.push({
        id: person.id,
        type: 'person',
        data: person,
        width: 120,
        height: 60
      });
    });

    // Add unions to generations (between their parents and children)
    if (enableUnions) {
      processedData.unions.forEach(union => {
        // Find the generation of the union's parents
        const parentGenerations = union.parents.map(p => generationMap.get(p.id) || 0);
        const maxParentGen = Math.max(...parentGenerations);
        const unionGeneration = maxParentGen + 0.5; // Place unions between generations
        
        if (!generations.has(unionGeneration)) {
          generations.set(unionGeneration, []);
        }
        generations.get(unionGeneration)!.push({
          id: `union_${union.id}`,
          type: 'union',
          data: union,
          width: 40,
          height: 40
        });
      });
    }

    // Sort generations and calculate positions
    const sortedGenerations = Array.from(generations.keys()).sort((a, b) => a - b);
    const nodePositions = new Map<string, { x: number; y: number }>();
    const centerX = width / 2;
    const startY = 80;
    const generationHeight = 120;
    
    sortedGenerations.forEach((generation, genIndex) => {
      const nodesInGeneration = generations.get(generation)!;
      const totalWidth = nodesInGeneration.length * 140;
      const startX = centerX - totalWidth / 2;
      
      nodesInGeneration.forEach((node, nodeIndex) => {
        const x = startX + nodeIndex * 140 + 60;
        const y = startY + genIndex * generationHeight;
        nodePositions.set(node.id, { x, y });
      });
    });

    // Render person nodes
    const personNodes = g.selectAll('.person-node')
      .data(processedData.persons)
      .enter()
      .append('g')
      .attr('class', 'person-node')
      .attr('transform', d => {
        const pos = nodePositions.get(d.id);
        return pos ? `translate(${pos.x - 60}, ${pos.y - 30})` : 'translate(0,0)';
      });

    // Background rectangle
    personNodes.append('rect')
      .attr('width', 120)
      .attr('height', 60)
      .attr('rx', 8)
      .attr('fill', '#ffffff')
      .attr('stroke', '#3b82f6')
      .attr('stroke-width', 2);

    // Name text
    personNodes.append('text')
      .attr('x', 60)
      .attr('y', 30)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .text(d => d.name);

    // Click handler
    personNodes.on('click', (event, d) => onPersonClick?.(d));

    // Render union nodes
    if (enableUnions) {
      const unionNodes = g.selectAll('.union-node')
        .data(processedData.unions)
        .enter()
        .append('g')
        .attr('class', 'union-node')
        .attr('transform', d => {
          const pos = nodePositions.get(`union_${d.id}`);
          return pos ? `translate(${pos.x - 20}, ${pos.y - 20})` : 'translate(0,0)';
        });

      // Union circle
      unionNodes.append('circle')
        .attr('cx', 20)
        .attr('cy', 20)
        .attr('r', 15)
        .attr('fill', '#10b981')
        .attr('stroke', '#059669')
        .attr('stroke-width', 2);

      // Heart symbol
      unionNodes.append('text')
        .attr('x', 20)
        .attr('y', 20)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('font-size', '16px')
        .attr('fill', 'white')
        .text('♥');

      // Click handler
      unionNodes.on('click', (event, d) => onUnionClick?.(d));
    }

    // Render direct connections (only when unions are disabled)
    if (!enableUnions) {
      const directEdges = g.selectAll('.direct-edge')
        .data(processedData.enhancedConnections)
        .enter()
        .append('g')
        .attr('class', 'direct-edge');

      directEdges.append('line')
        .attr('x1', d => {
          const pos = nodePositions.get(d.fromPersonId || '');
          return pos ? pos.x : 0;
        })
        .attr('y1', d => {
          const pos = nodePositions.get(d.fromPersonId || '');
          return pos ? pos.y : 0;
        })
        .attr('x2', d => {
          const pos = nodePositions.get(d.toPersonId || '');
          return pos ? pos.x : 0;
        })
        .attr('y2', d => {
          const pos = nodePositions.get(d.toPersonId || '');
          return pos ? pos.y : 0;
        })
        .attr('stroke', '#6b7280')
        .attr('stroke-width', 2);
    }

    // Render union-based connections (when unions are enabled)
    if (enableUnions) {
      // Connections from unions to children
      const unionChildEdges = g.selectAll('.union-child-edge')
        .data(processedData.enhancedConnections.filter(conn => conn.fromUnionId))
        .enter()
        .append('g')
        .attr('class', 'union-child-edge');

      unionChildEdges.append('line')
        .attr('x1', d => {
          const pos = nodePositions.get(d.fromUnionId || '');
          return pos ? pos.x : 0;
        })
        .attr('y1', d => {
          const pos = nodePositions.get(d.fromUnionId || '');
          return pos ? pos.y : 0;
        })
        .attr('x2', d => {
          const pos = nodePositions.get(d.toPersonId || '');
          return pos ? pos.x : 0;
        })
        .attr('y2', d => {
          const pos = nodePositions.get(d.toPersonId || '');
          return pos ? pos.y : 0;
        })
        .attr('stroke', '#6b7280')
        .attr('stroke-width', 2);

      // Connections from parents to unions
      const parentUnionEdges = g.selectAll('.parent-union-edge')
        .data(processedData.unions.flatMap(union => 
          union.parents.map(parent => ({ union, parent }))
        ))
        .enter()
        .append('g')
        .attr('class', 'parent-union-edge');

      parentUnionEdges.append('line')
        .attr('x1', d => {
          const pos = nodePositions.get(d.parent.id);
          return pos ? pos.x : 0;
        })
        .attr('y1', d => {
          const pos = nodePositions.get(d.parent.id);
          return pos ? pos.y : 0;
        })
        .attr('x2', d => {
          const pos = nodePositions.get(`union_${d.union.id}`);
          return pos ? pos.x : 0;
        })
        .attr('y2', d => {
          const pos = nodePositions.get(`union_${d.union.id}`);
          return pos ? pos.y : 0;
        })
        .attr('stroke', '#10b981')
        .attr('stroke-width', 1.5)
        .attr('stroke-dasharray', '5,5');
    }

    // Zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 3])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
        setZoomLevel(event.transform.k);
      });

    svg.call(zoom);

  }, [processedData, currentLayout, enableUnions, onPersonClick, onUnionClick, width, height]);

  const handleZoomToFit = () => {
    if (svgRef.current) {
      const svg = d3.select(svgRef.current);
      const zoom = d3.zoom<SVGSVGElement, unknown>();
      svg.transition().duration(750).call(
        zoom.transform,
        d3.zoomIdentity
      );
    }
  };

  const handleCenterSelf = () => {
    // Find person marked as self and center on them
    const selfPerson = persons.find(p => p.is_self);
    if (selfPerson && svgRef.current) {
      // This would require more complex logic to find the node position
      console.log('Centering on self:', selfPerson.name);
    }
  };

  return (
    <div className="relative w-full h-full">
      {/* Simple Controls */}
      <div className="absolute top-4 right-4 z-20 space-y-2">
        <Card className="bg-white/95 backdrop-blur-sm shadow-lg">
          <CardContent className="p-3 space-y-2">
            <div className="text-sm font-medium">Controls</div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCenterSelf}
                className="text-xs"
              >
                Center Self
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomToFit}
                className="text-xs"
              >
                Zoom Fit
              </Button>
            </div>
            <div className="text-xs text-muted-foreground">
              Zoom: {Math.round(zoomLevel * 100)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats Panel */}
      <div className="absolute bottom-4 left-4 z-20">
        <Card className="bg-white/95 backdrop-blur-sm shadow-lg">
          <CardContent className="p-3">
            <div className="text-sm font-medium mb-2">Stats</div>
            <div className="text-xs space-y-1">
              <div>Persons: {processedData?.persons.length || 0}</div>
              <div>Connections: {processedData?.enhancedConnections.length || 0}</div>
              {enableUnions && (
                <>
                  <div>Unions: {processedData?.unions.length || 0}</div>
                  <div>Family Units: {processedData?.familyUnits.length || 0}</div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SVG Container */}
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="w-full h-full border border-gray-200 rounded-lg"
      />
    </div>
  );
} 