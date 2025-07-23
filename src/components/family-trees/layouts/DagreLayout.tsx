import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import * as dagre from 'dagre';
import { processConnections } from '@/utils/connectionProcessing';
import { Person } from '@/types/person';
import { Connection } from '@/types/connection';
import { GenerationInfo } from '@/utils/generationUtils';
import { LayoutRelationshipType } from '@/types/layoutTypes';
import { TreeToolbar } from './TreeToolbar';
import { RelationshipFilter, RELATIONSHIP_CATEGORIES, RelationshipCategory } from './RelationshipFilter';

interface DagreLayoutProps {
  persons: Person[];
  connections: Connection[];
  relationshipTypes: LayoutRelationshipType[];
  width: number;
  height: number;
  onPersonClick?: (person: Person) => void;
  currentLayout: 'force' | 'dagre';
  onLayoutToggle: () => void;
}

interface DagreNodeData {
  label: string;
  width: number;
  height: number;
  generation?: number;
  generationColor?: string;
  profile_photo_url?: string | null;
  gender?: string | null;
}

interface DagreEdge {
  source: string;
  target: string;
  relationship_type: string;
}

export function DagreLayout({ 
  persons, 
  connections, 
  relationshipTypes, 
  width, 
  height, 
  onPersonClick,
  currentLayout,
  onLayoutToggle
}: DagreLayoutProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [layoutDirection, setLayoutDirection] = useState<'TB' | 'LR' | 'BT' | 'RL'>('TB');
  const [dagreGraph, setDagreGraph] = useState<dagre.graphlib.Graph | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [relationshipFilters, setRelationshipFilters] = useState({
    generational: true,
    lateral: true,
    donor: true
  });

  // Filter connections based on relationship type filters
  const getFilteredConnections = (connections: Connection[]) => {
    return connections.filter(connection => {
      const relType = connection.relationship_type;
      
      // Check each category
      if (RELATIONSHIP_CATEGORIES.generational.includes(relType as any)) {
        return relationshipFilters.generational;
      }
      if (RELATIONSHIP_CATEGORIES.lateral.includes(relType as any)) {
        return relationshipFilters.lateral;
      }
      if (RELATIONSHIP_CATEGORIES.donor.includes(relType as any)) {
        return relationshipFilters.donor;
      }
      
      // Default to showing unknown relationship types
      return true;
    });
  };

  // Get persons who should be visible (have at least one connection or are marked as self)
  const getVisiblePersons = (persons: Person[], filteredConnections: Connection[]) => {
    const connectedPersonIds = new Set<string>();
    
    // Add all persons who have connections
    filteredConnections.forEach(connection => {
      connectedPersonIds.add(connection.from_person_id);
      connectedPersonIds.add(connection.to_person_id);
    });

    // Always include the "self" person even if they have no connections
    const selfPerson = persons.find(p => p.is_self === true);
    if (selfPerson) {
      connectedPersonIds.add(selfPerson.id);
    }

    // Return only persons who are connected or are self
    return persons.filter(person => connectedPersonIds.has(person.id));
  };

  // Handle relationship filter changes
  const handleRelationshipFilterChange = (category: RelationshipCategory, enabled: boolean) => {
    setRelationshipFilters(prev => ({
      ...prev,
      [category]: enabled
    }));
  };

  useEffect(() => {
    if (!svgRef.current || persons.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Use shared connection processing utility
    const processed = processConnections(persons, connections);
    const { generationalConnections, generationMap } = processed;

    // Filter connections based on relationship type filters
    const filteredConnections = getFilteredConnections(generationalConnections);
    
    // Get visible persons (those with connections or marked as self)
    const visiblePersons = getVisiblePersons(persons, filteredConnections);

    // Create Dagre graph
    const g = new dagre.graphlib.Graph();
    g.setGraph({
      rankdir: layoutDirection,
      nodesep: 80,
      edgesep: 40,
      ranksep: 100,
      marginx: 50,
      marginy: 50
    });
    g.setDefaultEdgeLabel(() => ({}));

    // Add only visible nodes to the graph
    visiblePersons.forEach(person => {
      const generationInfo = generationMap.get(person.id);
      g.setNode(person.id, {
        label: person.name,
        width: 120,
        height: 80,
        generation: generationInfo?.generation,
        generationColor: generationInfo?.color,
        profile_photo_url: person.profile_photo_url,
        gender: person.gender
      });
    });

    // Add edges to the graph (only filtered connections between visible persons)
    filteredConnections.forEach(connection => {
      // Only add edge if both persons are visible
      if (visiblePersons.some(p => p.id === connection.from_person_id) &&
          visiblePersons.some(p => p.id === connection.to_person_id)) {
        g.setEdge(connection.from_person_id, connection.to_person_id, {
          relationship_type: connection.relationship_type
        });
      }
    });

    // Calculate the layout
    dagre.layout(g);
    setDagreGraph(g);

    const g_svg = svg.append('g')
      .attr('transform', 'translate(50,50)');

    // Create edges with smooth transitions
    const edges = g_svg.selectAll('.edge')
      .data(g.edges(), (d: any) => `${d.v}-${d.w}`); // Use edge ID as key

    // Handle entering edges
    const edgeEnter = edges.enter()
      .append('g')
      .attr('class', 'edge')
      .style('opacity', 0); // Start invisible

    edgeEnter.append('path')
      .attr('d', (d) => {
        const edge = g.edge(d);
        return `M ${edge.points[0].x} ${edge.points[0].y} ${edge.points.map(p => `L ${p.x} ${p.y}`).join(' ')}`;
      })
      .attr('fill', 'none')
      .attr('stroke', 'hsl(var(--border))')
      .attr('stroke-width', 2);

    // Transition edges to visible
    edgeEnter.merge(edges as any)
      .transition()
      .duration(500)
      .style('opacity', 0.6);

    // Create nodes with smooth transitions
    const nodes = g_svg.selectAll('.node')
      .data(g.nodes(), (d: any) => d); // Use node ID as key for consistent transitions

    // Handle entering nodes (newly visible)
    const nodeEnter = nodes.enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', (d) => {
        const node = g.node(d);
        return `translate(${node.x - node.width / 2},${node.y - node.height / 2})`;
      })
      .style('cursor', 'pointer')
      .style('opacity', 0) // Start invisible for smooth fade-in
      .on('click', (event, d) => {
        const person = persons.find(p => p.id === d);
        if (person) {
          onPersonClick?.(person);
        }
      });

    // Handle updating nodes (position changes)
    const nodeUpdate = nodeEnter.merge(nodes as any)
      .transition()
      .duration(500)
      .attr('transform', (d) => {
        const node = g.node(d);
        return `translate(${node.x - node.width / 2},${node.y - node.height / 2})`;
      })
      .style('opacity', 1);

    // Use nodeEnter for adding elements, nodeUpdate for final merged selection
    const allNodes = nodeEnter;

    // Add node containers (cards)
    allNodes.append('rect')
      .attr('width', 140)
      .attr('height', 100)
      .attr('rx', 8)
      .attr('ry', 8)
      .attr('fill', (d) => {
        const node = g.node(d) as DagreNodeData;
        return node.generationColor || 'hsl(var(--chart-1))';
      })
      .attr('stroke', (d) => {
        const node = g.node(d) as DagreNodeData;
        return node.generationColor || 'hsl(var(--border))';
      })
      .attr('stroke-width', 2)
      .attr('opacity', 0.9);

    // Add profile images if available
    allNodes.filter((d) => {
      const node = g.node(d) as DagreNodeData;
      return node.profile_photo_url;
    })
      .append('image')
      .attr('x', 25)
      .attr('y', 25)
      .attr('width', 50)
      .attr('height', 50)
      .attr('href', (d) => {
        const node = g.node(d) as DagreNodeData;
        return node.profile_photo_url!;
      })
      .attr('clip-path', 'circle(25px)');

    // Add names
    allNodes.append('text')
      .attr('x', 70)
      .attr('y', 45)
      .attr('text-anchor', 'middle')
      .attr('font-size', '11px')
      .attr('font-weight', 'bold')
      .attr('fill', 'hsl(var(--foreground))')
      .text((d) => {
        const node = g.node(d) as DagreNodeData;
        const name = node.label;
        return name.length > 12 ? name.substring(0, 10) + '...' : name;
      });

    // Add generation labels
    allNodes.append('text')
      .attr('x', 70)
      .attr('y', 65)
      .attr('text-anchor', 'middle')
      .attr('font-size', '9px')
      .attr('fill', (d) => {
        const node = g.node(d) as DagreNodeData;
        return node.generationColor || 'hsl(var(--muted-foreground))';
      })
      .text((d) => {
        const node = g.node(d) as DagreNodeData;
        return node.generation ? `Gen ${node.generation}` : '';
      });

    // Add gender indicators
    allNodes.append('text')
      .attr('x', 15)
      .attr('y', 25)
      .attr('font-size', '12px')
      .attr('fill', 'hsl(var(--muted-foreground))')
      .text((d) => {
        const node = g.node(d) as DagreNodeData;
        return node.gender === 'male' ? '♂' : node.gender === 'female' ? '♀' : '';
      });

    // Add zoom and pan
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 3])
      .on('zoom', (event) => {
        setZoomLevel(event.transform.k);
        g_svg.attr('transform', event.transform);
      });

    svg.call(zoom);

    // Store zoom behavior for external access
    (svg.node() as any).__zoom__ = zoom;
    (svg.node() as any).__zoomGroup__ = g_svg;

    // Auto-fit to all nodes on initial load
    if (isInitialLoad && visiblePersons.length > 0) {
      setTimeout(() => {
        handleZoomToFit();
        setIsInitialLoad(false);
      }, 100); // Small delay to ensure layout is complete
    }

    // Store references for update function
    window.dagreData = { g, svg, g_svg, generationMap, persons: visiblePersons };

  }, [persons, connections, width, height, onPersonClick, layoutDirection, relationshipFilters]);

  const handleLayoutChange = () => {
    const directions: Array<'TB' | 'LR' | 'BT' | 'RL'> = ['TB', 'LR', 'BT', 'RL'];
    const currentIndex = directions.indexOf(layoutDirection);
    const nextIndex = (currentIndex + 1) % directions.length;
    setLayoutDirection(directions[nextIndex]);
  };

  const handleCenterSelf = () => {
    if (!svgRef.current || !dagreGraph) return;

    const selfPerson = persons.find(person => person.is_self === true);
    if (!selfPerson) return;

    const selfNode = dagreGraph.node(selfPerson.id);
    if (!selfNode) return;

    const svg = d3.select(svgRef.current);
    const zoom = (svg.node() as any).__zoom__;
    const g = (svg.node() as any).__zoomGroup__;

    if (zoom && g) {
      // Calculate transform to center the self node
      // Account for the initial translate(50,50) offset
      const nodeX = selfNode.x + 50;
      const nodeY = selfNode.y + 50;
      const centerX = width / 2;
      const centerY = height / 2;
      
      const transform = d3.zoomIdentity
        .translate(centerX - nodeX, centerY - nodeY);

      svg.transition().duration(750).call(zoom.transform, transform);
    }
  };

  const handleZoomToFit = () => {
    if (!svgRef.current || !dagreGraph) return;

    const svg = d3.select(svgRef.current);
    const zoom = (svg.node() as any).__zoom__;
    const g = (svg.node() as any).__zoomGroup__;

    if (zoom && g) {
      // Calculate bounding box of all visible nodes
      const nodes = dagreGraph.nodes().map(nodeId => dagreGraph.node(nodeId));
      
      if (nodes.length === 0) return;

      const minX = Math.min(...nodes.map(node => node.x - node.width / 2)) - 50;
      const maxX = Math.max(...nodes.map(node => node.x + node.width / 2)) + 50;
      const minY = Math.min(...nodes.map(node => node.y - node.height / 2)) - 50;
      const maxY = Math.max(...nodes.map(node => node.y + node.height / 2)) + 50;

      const nodeWidth = maxX - minX;
      const nodeHeight = maxY - minY;

      if (nodeWidth === 0 || nodeHeight === 0) return;

      // Calculate scale to fit all nodes with padding
      const scale = Math.min(
        width / nodeWidth,
        height / nodeHeight,
        2 // Max scale
      ) * 0.9; // Add some padding

      // Calculate center of nodes
      const centerX = (minX + maxX) / 2;
      const centerY = (minY + maxY) / 2;

      // Calculate transform - account for the initial translate(50,50) offset
      const transform = d3.zoomIdentity
        .translate(width / 2, height / 2)
        .scale(scale)
        .translate(-centerX - 50, -centerY - 50);

      svg.transition().duration(750).call(zoom.transform, transform);
    }
  };

  return (
    <div className="relative">
            {/* Simplified Toolbar - top right */}
      <div className="absolute top-4 right-4 z-10">
        <TreeToolbar
          persons={persons}
          currentLayout="dagre"
          layoutDirection={layoutDirection}
          onCenterSelf={handleCenterSelf}
          onZoomToFit={handleZoomToFit}
          onLayoutToggle={() => onLayoutToggle()}
          onLayoutDirectionChange={handleLayoutChange}
          className="bg-background/80 backdrop-blur-sm rounded-lg p-3"
        />
      </div>

      {/* Relationship Filter - bottom right */}
      <div className="absolute bottom-4 right-4 z-10">
        <RelationshipFilter
          relationshipFilters={relationshipFilters}
          onRelationshipFilterChange={handleRelationshipFilterChange}
          className="bg-background/80 backdrop-blur-sm rounded-lg p-3"
        />
      </div>

      {/* Info Panel - top left */}
      <div className="absolute top-4 left-4 z-10">
        <div className="bg-background/80 backdrop-blur-sm rounded-lg px-3 py-1 text-sm space-y-1">
          <div>Layout: {layoutDirection}</div>
          <div>{Math.round(zoomLevel * 100)}%</div>
          <div className="text-xs text-muted-foreground">
            Showing: {Object.entries(relationshipFilters).filter(([_, enabled]) => enabled).map(([category]) => 
              category === 'generational' ? 'Parent-Child' : 
              category === 'lateral' ? 'Siblings' : 
              'Donors'
            ).join(', ')}
          </div>
        </div>
      </div>

      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="border rounded-lg bg-background"
      />
    </div>
  );
}

// Extend Window interface for storing chart data
declare global {
  interface Window {
    dagreData?: {
      g: any;
      svg: any;
      g_svg: any;
      generationMap: Map<string, GenerationInfo>;
      persons: Person[];
    };
  }
} 