import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { processConnections } from '@/utils/connectionProcessing';
import { Person } from '@/types/person';
import { Connection } from '@/types/connection';
import { TreeToolbar } from './TreeToolbar';

interface RelationshipType {
  value: string;
  label: string;
  color: string;
}

interface ForceDirectedLayoutProps {
  persons: Person[];
  connections: Connection[];
  relationshipTypes: RelationshipType[];
  width: number;
  height: number;
  onPersonClick?: (person: Person) => void;
  currentLayout: 'force' | 'dagre';
  onLayoutToggle: () => void;
}

interface ForceNode extends d3.SimulationNodeDatum, Person {
  x?: number;
  y?: number;
  generation?: number;
  generationColor?: string;
}

interface ForceLink extends d3.SimulationLinkDatum<ForceNode> {
  source: string | ForceNode;
  target: string | ForceNode;
  relationship_type: string;
}

export function ForceDirectedLayout({ 
  persons, 
  connections, 
  relationshipTypes, 
  width, 
  height, 
  onPersonClick,
  currentLayout,
  onLayoutToggle
}: ForceDirectedLayoutProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [simulation, setSimulation] = useState<d3.Simulation<ForceNode, ForceLink> | null>(null);
  const [nodes, setNodes] = useState<ForceNode[]>([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    if (!svgRef.current || persons.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Use shared connection processing utility
    const processed = processConnections(persons, connections);
    const { generationalConnections, generationMap } = processed;

    // Prepare data for force simulation
    const nodeData: ForceNode[] = persons.map(p => {
      const generationInfo = generationMap.get(p.id);
      return { 
        ...p, 
        generation: generationInfo?.generation,
        generationColor: generationInfo?.color
      };
    });
    
    const links: ForceLink[] = generationalConnections.map(c => ({
      source: c.from_person_id,
      target: c.to_person_id,
      relationship_type: c.relationship_type
    }));

    setNodes(nodeData);

    // Create force simulation
    const sim = d3.forceSimulation(nodeData)
      .force('link', d3.forceLink<ForceNode, ForceLink>(links).id(d => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(40));

    setSimulation(sim);

    const g = svg.append('g');

    // Create links (only for generational connections)
    const link = g.selectAll('.link')
      .data(links)
      .enter()
      .append('line')
      .attr('class', 'link')
      .attr('stroke', 'hsl(var(--border))')
      .attr('stroke-width', 2)
      .attr('stroke-opacity', 0.6);

    // Create nodes with generation-based coloring
    const node = g.selectAll('.node')
      .data(nodeData)
      .enter()
      .append('g')
      .attr('class', 'node')
      .style('cursor', 'pointer')
      .call(d3.drag<SVGGElement, ForceNode>()
        .on('start', (event, d) => {
          if (!event.active) sim.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on('drag', (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on('end', (event, d) => {
          if (!event.active) sim.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        })
      )
      .on('click', (event, d) => {
        onPersonClick?.(d);
      });

    // Add circles for nodes with generation colors
    node.append('circle')
      .attr('r', 25)
      .attr('fill', d => d.generationColor || 'hsl(var(--chart-1))')
      .attr('stroke', d => d.generationColor || 'hsl(var(--border))')
      .attr('stroke-width', 3)
      .attr('opacity', 0.8);

    // Add profile images if available
    node.filter(d => d.profile_photo_url)
      .append('image')
      .attr('x', -20)
      .attr('y', -20)
      .attr('width', 40)
      .attr('height', 40)
      .attr('href', d => d.profile_photo_url!)
      .attr('clip-path', 'circle(20px)');

    // Add names
    node.append('text')
      .attr('dy', 35)
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('fill', 'hsl(var(--foreground))')
      .text(d => d.name);

    // Add generation labels
    node.append('text')
      .attr('dy', -30)
      .attr('text-anchor', 'middle')
      .attr('font-size', '10px')
      .attr('fill', d => d.generationColor || 'hsl(var(--muted-foreground))')
      .attr('font-weight', 'bold')
      .text(d => d.generation !== undefined ? `Gen ${d.generation}` : '');

    // Update positions on simulation tick
    sim.on('tick', () => {
      link
        .attr('x1', d => (d.source as ForceNode).x!)
        .attr('y1', d => (d.source as ForceNode).y!)
        .attr('x2', d => (d.target as ForceNode).x!)
        .attr('y2', d => (d.target as ForceNode).y!);

      node.attr('transform', d => `translate(${d.x},${d.y})`);
    });

    // Add zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
        setZoomLevel(event.transform.k);
      });

    svg.call(zoom);

    // Store zoom behavior for external access
    (svg.node() as any).__zoom__ = zoom;
    (svg.node() as any).__zoomGroup__ = g;

    // Auto-fit to all nodes after simulation stabilizes (for initial load)
    if (isInitialLoad && nodeData.length > 0) {
      sim.on('end', () => {
        setTimeout(() => {
          handleZoomToFit();
          setIsInitialLoad(false);
        }, 500); // Small delay to ensure positions are stable
      });
    }

    // Cleanup
    return () => {
      sim.stop();
    };
  }, [persons, connections, width, height, onPersonClick]);

  const handleCenterSelf = () => {
    if (!svgRef.current || !simulation || nodes.length === 0) return;

    const selfPerson = persons.find(person => person.is_self === true);
    if (!selfPerson) return;

    const selfNode = nodes.find(node => node.id === selfPerson.id);
    if (!selfNode || selfNode.x === undefined || selfNode.y === undefined) return;

    const svg = d3.select(svgRef.current);
    const zoom = (svg.node() as any).__zoom__;
    const g = (svg.node() as any).__zoomGroup__;

    if (zoom && g) {
      // Calculate transform to center the self node
      const centerX = width / 2;
      const centerY = height / 2;
      const transform = d3.zoomIdentity
        .translate(centerX - selfNode.x, centerY - selfNode.y);

      svg.transition().duration(750).call(zoom.transform, transform);
    }
  };

  const handleZoomToFit = () => {
    if (!svgRef.current || nodes.length === 0) return;

    const svg = d3.select(svgRef.current);
    const zoom = (svg.node() as any).__zoom__;
    const g = (svg.node() as any).__zoomGroup__;

    if (zoom && g) {
      // Calculate bounding box of all nodes
      const validNodes = nodes.filter(node => 
        node.x !== undefined && node.y !== undefined
      );

      if (validNodes.length === 0) return;

      const minX = Math.min(...validNodes.map(node => node.x!)) - 50;
      const maxX = Math.max(...validNodes.map(node => node.x!)) + 50;
      const minY = Math.min(...validNodes.map(node => node.y!)) - 50;
      const maxY = Math.max(...validNodes.map(node => node.y!)) + 50;

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

      // Calculate transform
      const transform = d3.zoomIdentity
        .translate(width / 2, height / 2)
        .scale(scale)
        .translate(-centerX, -centerY);

      svg.transition().duration(750).call(zoom.transform, transform);
    }
  };

  return (
    <div className="relative">
      {/* Vertical Toolbar - top right */}
      <div className="absolute top-4 right-4 z-10">
        <TreeToolbar
          persons={persons}
          currentLayout={currentLayout}
          onCenterSelf={handleCenterSelf}
          onZoomToFit={handleZoomToFit}
          onLayoutToggle={onLayoutToggle}
          className="bg-background/80 backdrop-blur-sm rounded-lg p-2"
        />
      </div>

      {/* Info Panel - top left */}
      <div className="absolute top-4 left-4 z-10">
        <div className="bg-background/80 backdrop-blur-sm rounded-lg px-3 py-1 text-sm">
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