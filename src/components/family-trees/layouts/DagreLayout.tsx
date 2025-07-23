import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import * as dagre from 'dagre';
import { processConnections } from '@/utils/connectionProcessing';
import { Person } from '@/types/person';
import { Connection } from '@/types/connection';
import { GenerationInfo } from '@/utils/generationUtils';
import { LayoutRelationshipType } from '@/types/layoutTypes';
import { Button } from '@/components/ui/button';
import { Grid3X3, Network } from 'lucide-react';

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

  useEffect(() => {
    if (!svgRef.current || persons.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Use shared connection processing utility
    const processed = processConnections(persons, connections);
    const { generationalConnections, generationMap } = processed;

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

    // Add nodes to the graph
    persons.forEach(person => {
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

    // Add edges to the graph (only generational connections)
    generationalConnections.forEach(connection => {
      g.setEdge(connection.from_person_id, connection.to_person_id, {
        relationship_type: connection.relationship_type
      });
    });

    // Calculate the layout
    dagre.layout(g);

    const g_svg = svg.append('g')
      .attr('transform', 'translate(50,50)');

    // Create edges
    const edges = g_svg.selectAll('.edge')
      .data(g.edges())
      .enter()
      .append('g')
      .attr('class', 'edge');

    edges.append('path')
      .attr('d', (d) => {
        const edge = g.edge(d);
        return `M ${edge.points[0].x} ${edge.points[0].y} ${edge.points.map(p => `L ${p.x} ${p.y}`).join(' ')}`;
      })
      .attr('fill', 'none')
      .attr('stroke', 'hsl(var(--border))')
      .attr('stroke-width', 2)
      .attr('opacity', 0.6);

    // Create nodes
    const nodes = g_svg.selectAll('.node')
      .data(g.nodes())
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', (d) => {
        const node = g.node(d);
        return `translate(${node.x - node.width / 2},${node.y - node.height / 2})`;
      })
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        const person = persons.find(p => p.id === d);
        if (person) {
          onPersonClick?.(person);
        }
      });

    // Add node containers (cards)
    nodes.append('rect')
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
    nodes.filter((d) => {
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
    nodes.append('text')
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
    nodes.append('text')
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
    nodes.append('text')
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

    // Store references for update function
    window.dagreData = { g, svg, g_svg, generationMap, persons };

  }, [persons, connections, width, height, onPersonClick, layoutDirection]);

  const handleLayoutChange = () => {
    const directions: Array<'TB' | 'LR' | 'BT' | 'RL'> = ['TB', 'LR', 'BT', 'RL'];
    const currentIndex = directions.indexOf(layoutDirection);
    const nextIndex = (currentIndex + 1) % directions.length;
    setLayoutDirection(directions[nextIndex]);
  };

  return (
    <div className="relative">
      {/* Layout Direction Toggle - top right */}
      <div className="absolute top-4 right-4 z-10">
        <Button
          variant="outline"
          size="sm"
          onClick={handleLayoutChange}
          className="h-8 w-8 p-0"
          title={`Current: ${layoutDirection}. Click to cycle through layouts.`}
        >
          <Grid3X3 className="h-4 w-4" />
        </Button>
      </div>

      {/* Layout Toggle - bottom left */}
      <div className="absolute bottom-4 left-4 z-10">
        <Button
          variant="outline"
          size="sm"
          onClick={onLayoutToggle}
          className="h-8 px-3"
          title="Switch to Force view"
        >
          <Network className="h-4 w-4 mr-2" />
          Force
        </Button>
      </div>

      {/* Layout and zoom indicators - top left */}
      <div className="absolute top-4 left-4 z-10">
        <div className="bg-background/80 backdrop-blur-sm rounded-lg px-3 py-1 text-sm space-y-1">
          <div>Layout: {layoutDirection}</div>
          <div>{Math.round(zoomLevel * 100)}%</div>
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