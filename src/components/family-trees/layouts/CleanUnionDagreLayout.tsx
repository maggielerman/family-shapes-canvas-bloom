import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import * as d3 from 'd3';
import * as dagre from 'dagre';
import { Person } from '@/types/person';
import { Connection } from '@/types/connection';
import { processConnectionsWithUnions } from '@/services/unionProcessingService';
import { UnionProcessedData, UnionNode } from '@/types/unionTypes';

export interface CleanUnionDagreLayoutProps {
  persons: Person[];
  connections: Connection[];
  width: number;
  height: number;
  enableUnions?: boolean;
  minSharedChildren?: number;
  onPersonClick?: (person: Person) => void;
  onUnionClick?: (union: UnionNode) => void;
  relationshipFilters?: { generational: boolean; lateral: boolean; donor: boolean };
}

export type UnionDagreHandle = {
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  zoomFit: () => void;
  centerSelf: () => void;
};

const CleanUnionDagreLayout = forwardRef<UnionDagreHandle, CleanUnionDagreLayoutProps>(function CleanUnionDagreLayout({
  persons,
  connections,
  width,
  height,
  enableUnions = true,
  minSharedChildren = 1,
  onPersonClick,
  onUnionClick,
  relationshipFilters
}, ref) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const gRef = useRef<SVGGElement | null>(null);

  // Build union-processed data once per render
  const data: UnionProcessedData = enableUnions
    ? processConnectionsWithUnions(persons, connections, {
        minSharedChildren,
        includeSingleParents: true,
        groupSiblings: true
      })
    : {
        persons,
        unions: [],
        enhancedConnections: connections.map((c) => ({
          id: c.id,
          fromPersonId: c.from_person_id,
          toPersonId: c.to_person_id,
          relationshipType: c.relationship_type,
          originalConnectionId: c.id
        })),
        familyUnits: [],
        originalConnections: connections
      };

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Build Dagre graph
    const graph = new dagre.graphlib.Graph();
    graph.setGraph({
      rankdir: 'TB',
      nodesep: 80,
      ranksep: 120,
      marginx: 40,
      marginy: 40
    });
    graph.setDefaultEdgeLabel(() => ({}));

    // Add person nodes
    data.persons.forEach((p) => {
      graph.setNode(p.id, { width: 120, height: 60, person: p });
    });

    // Add union nodes
    data.unions.forEach((u) => {
      graph.setNode(`union_${u.id}`, { width: 40, height: 40, union: u });
    });

    // Add edges
    data.enhancedConnections.forEach((e) => {
      const from = e.fromPersonId ? e.fromPersonId : `union_${e.fromUnionId}`;
      const to = e.toPersonId ? e.toPersonId : `union_${e.toUnionId}`;
      if (from && to) graph.setEdge(from, to);
    });

    // Parent → union edges (for visual clarity)
    data.unions.forEach((u) => {
      u.parents.forEach((p) => {
        graph.setEdge(p.id, `union_${u.id}`);
      });
    });

    dagre.layout(graph);

    // Set up SVG group for zoom/pan
    const g = svg.append('g');
    gRef.current = g.node() as SVGGElement;

    // Render edges first so they’re behind nodes
    g.selectAll('path.edge')
      .data(graph.edges())
      .enter()
      .append('path')
      .attr('class', 'edge')
      .attr('d', (edge) => {
        const points = (graph as any).edge(edge).points as { x: number; y: number }[];
        return d3
          .line<{ x: number; y: number }>()
          .x((d) => d.x)
          .y((d) => d.y)(points) as string;
      })
      .attr('fill', 'none')
      .attr('stroke', '#6b7280')
      .attr('stroke-width', 2);

    // Render nodes
    const nodes = g
      .selectAll('g.node')
      .data(graph.nodes().map((id) => ({ id, ...graph.node(id) })))
      .enter()
      .append('g');

    // add data-id to nodes selection
    nodes.attr('data-id', (d: any) => d.id);

    // Person rectangles
    const personNodes = nodes.filter((d: any) => !!d.person);
    personNodes
      .append('rect')
      .attr('width', 120)
      .attr('height', 60)
      .attr('rx', 8)
      .attr('fill', '#fff')
      .attr('stroke', '#3b82f6')
      .attr('stroke-width', 2);
    personNodes
      .append('text')
      .attr('x', 60)
      .attr('y', 30)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('font-size', 12)
      .attr('font-weight', 'bold')
      .text((d: any) => d.person.name);
    personNodes.style('cursor', 'pointer').on('click', (_, d: any) => onPersonClick?.(d.person));

    // Union circles
    const unionNodes = nodes.filter((d: any) => !!d.union);
    unionNodes
      .append('circle')
      .attr('cx', 20)
      .attr('cy', 20)
      .attr('r', 20)
      .attr('fill', '#10b981');
    unionNodes
      .append('text')
      .attr('x', 20)
      .attr('y', 20)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('font-size', 16)
      .attr('fill', 'white')
      .text('♥');
    unionNodes.style('cursor', 'pointer').on('click', (_, d: any) => onUnionClick?.(d.union));

    // Zoom / pan
    const zoomBehavior = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 2])
      .on('zoom', (e) => g.attr('transform', e.transform));

    zoomBehaviorRef.current = zoomBehavior;

    svg.call(zoomBehavior as any);
  }, [persons, connections, enableUnions, minSharedChildren, relationshipFilters]);

  // expose imperative zoom handlers
  useImperativeHandle(ref, () => ({
    zoomIn: () => {
      if (svgRef.current && zoomBehaviorRef.current) {
        d3.select(svgRef.current).transition().call(zoomBehaviorRef.current.scaleBy as any, 1.2);
      }
    },
    zoomOut: () => {
      if (svgRef.current && zoomBehaviorRef.current) {
        d3.select(svgRef.current).transition().call(zoomBehaviorRef.current.scaleBy as any, 0.8);
      }
    },
    resetZoom: () => {
      if (svgRef.current && zoomBehaviorRef.current) {
        d3.select(svgRef.current).transition().call(zoomBehaviorRef.current.transform as any, d3.zoomIdentity);
      }
    },
    zoomFit: () => {
      if (!svgRef.current || !gRef.current || !zoomBehaviorRef.current) return;
      const svg = d3.select(svgRef.current);
      const bbox = gRef.current.getBBox();
      const widthScale = (width - 80) / bbox.width;
      const heightScale = (height - 80) / bbox.height;
      const scale = Math.min(widthScale, heightScale, 1);
      const tx = width / 2 - (bbox.x + bbox.width / 2) * scale;
      const ty = height / 2 - (bbox.y + bbox.height / 2) * scale;
      svg.transition().call(zoomBehaviorRef.current.transform as any, d3.zoomIdentity.translate(tx, ty).scale(scale));
    },
    centerSelf: () => {
      const self = persons.find(p => p.is_self);
      if (!self || !svgRef.current || !zoomBehaviorRef.current) return;
      const node = gRef.current?.querySelector<SVGGElement>(`[data-id='${self.id}']`);
      if (!node) return;
      const bbox = node.getBBox();
      const scale = 1;
      const tx = width / 2 - (bbox.x + bbox.width / 2) * scale;
      const ty = height / 2 - (bbox.y + bbox.height / 2) * scale;
      d3.select(svgRef.current).transition().call(zoomBehaviorRef.current.transform as any, d3.zoomIdentity.translate(tx, ty).scale(scale));
    }
  }));

  return <svg ref={svgRef} width={width} height={height} />;
});

export default CleanUnionDagreLayout; 