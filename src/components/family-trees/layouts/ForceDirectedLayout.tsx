import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface Person {
  id: string;
  name: string;
  gender?: string | null;
  profile_photo_url?: string | null;
}

interface Connection {
  id: string;
  from_person_id: string;
  to_person_id: string;
  relationship_type: string;
}

interface ForceDirectedLayoutProps {
  persons: Person[];
  connections: Connection[];
  width: number;
  height: number;
  onPersonClick?: (person: Person) => void;
}

interface ForceNode extends d3.SimulationNodeDatum, Person {
  x?: number;
  y?: number;
}

interface ForceLink extends d3.SimulationLinkDatum<ForceNode> {
  source: string | ForceNode;
  target: string | ForceNode;
  relationship_type: string;
}

export function ForceDirectedLayout({ persons, connections, width, height, onPersonClick }: ForceDirectedLayoutProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || persons.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Prepare data for force simulation
    const nodes: ForceNode[] = persons.map(p => ({ ...p }));
    const links: ForceLink[] = connections.map(c => ({
      source: c.from_person_id,
      target: c.to_person_id,
      relationship_type: c.relationship_type
    }));

    // Create force simulation
    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink<ForceNode, ForceLink>(links).id(d => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(40));

    const g = svg.append('g');

    // Create links
    const link = g.selectAll('.link')
      .data(links)
      .enter()
      .append('line')
      .attr('class', 'link')
      .attr('stroke', d => getRelationshipColor(d.relationship_type))
      .attr('stroke-width', 3)
      .attr('stroke-opacity', 0.8);

    // Create link labels
    const linkLabels = g.selectAll('.link-label')
      .data(links)
      .enter()
      .append('text')
      .attr('class', 'link-label')
      .attr('text-anchor', 'middle')
      .attr('font-size', '10px')
      .attr('fill', 'hsl(var(--muted-foreground))')
      .text(d => d.relationship_type);

    // Create nodes
    const node = g.selectAll('.node')
      .data(nodes)
      .enter()
      .append('g')
      .attr('class', 'node')
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        onPersonClick?.(d);
      })
      .call(d3.drag<SVGGElement, ForceNode>()
        .on('start', (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on('drag', (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on('end', (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        }));

    // Add circles for nodes
    node.append('circle')
      .attr('r', 30)
      .attr('fill', d => getGenderColor(d.gender))
      .attr('stroke', 'hsl(var(--border))')
      .attr('stroke-width', 2);

    // Add profile images if available
    node.filter(d => d.profile_photo_url)
      .append('image')
      .attr('x', -25)
      .attr('y', -25)
      .attr('width', 50)
      .attr('height', 50)
      .attr('href', d => d.profile_photo_url!)
      .attr('clip-path', 'circle(25px)');

    // Add names
    node.append('text')
      .attr('dy', 45)
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('fill', 'hsl(var(--foreground))')
      .text(d => d.name);

    // Update positions on simulation tick
    simulation.on('tick', () => {
      link
        .attr('x1', d => (d.source as ForceNode).x!)
        .attr('y1', d => (d.source as ForceNode).y!)
        .attr('x2', d => (d.target as ForceNode).x!)
        .attr('y2', d => (d.target as ForceNode).y!);

      linkLabels
        .attr('x', d => ((d.source as ForceNode).x! + (d.target as ForceNode).x!) / 2)
        .attr('y', d => ((d.source as ForceNode).y! + (d.target as ForceNode).y!) / 2);

      node.attr('transform', d => `translate(${d.x},${d.y})`);
    });

    // Add zoom and pan
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    return () => {
      simulation.stop();
    };

  }, [persons, connections, width, height, onPersonClick]);

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      className="border rounded-lg bg-background"
    />
  );
}

function getGenderColor(gender?: string | null): string {
  switch (gender?.toLowerCase()) {
    case 'male': return 'hsl(var(--chart-1))';
    case 'female': return 'hsl(var(--chart-2))';
    default: return 'hsl(var(--chart-3))';
  }
}

function getRelationshipColor(relationship: string): string {
  switch (relationship) {
    case 'parent': return 'hsl(var(--chart-1))';
    case 'child': return 'hsl(var(--chart-2))';
    case 'partner': return 'hsl(var(--chart-3))';
    case 'sibling': return 'hsl(var(--chart-4))';
    case 'donor': return 'hsl(var(--chart-5))';
    default: return 'hsl(var(--border))';
  }
}