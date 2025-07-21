import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { 
  calculateGenerations, 
  getGenerationalConnections, 
  GenerationInfo 
} from '@/utils/generationUtils';

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

export function ForceDirectedLayout({ persons, connections, relationshipTypes, width, height, onPersonClick }: ForceDirectedLayoutProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || persons.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Create a set of valid person IDs for quick lookup
    const validPersonIds = new Set(persons.map(p => p.id));
    
    // Filter out connections that reference non-existent persons
    const validConnections = connections.filter(c => 
      validPersonIds.has(c.from_person_id) && validPersonIds.has(c.to_person_id)
    );

    // Calculate generations for color coding
    const generationMap = calculateGenerations(persons, validConnections);

    // Use only generational connections for visible links
    const generationalConnections = getGenerationalConnections(validConnections);

    // Prepare data for force simulation
    const nodes: ForceNode[] = persons.map(p => {
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

    // Create force simulation
    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink<ForceNode, ForceLink>(links).id(d => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(40));

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
      .data(nodes)
      .enter()
      .append('g')
      .attr('class', 'node')
      .style('cursor', 'pointer')
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
    simulation.on('tick', () => {
      link
        .attr('x1', d => (d.source as ForceNode).x!)
        .attr('y1', d => (d.source as ForceNode).y!)
        .attr('x2', d => (d.target as ForceNode).x!)
        .attr('y2', d => (d.target as ForceNode).y!);

      node
        .attr('transform', d => `translate(${d.x},${d.y})`);
    });

    // Add zoom and pan
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    // Add legend for generation colors
    const legend = svg.append('g')
      .attr('class', 'legend')
      .attr('transform', 'translate(20, 20)');

    const uniqueGenerations = Array.from(generationMap.values())
      .sort((a, b) => a.generation - b.generation)
      .filter((gen, index, arr) => 
        index === arr.findIndex(g => g.generation === gen.generation)
      );

    legend.selectAll('.legend-item')
      .data(uniqueGenerations.slice(0, 6)) // Show first 6 generations
      .enter()
      .append('g')
      .attr('class', 'legend-item')
      .attr('transform', (d, i) => `translate(0, ${i * 20})`)
      .each(function(d) {
        const item = d3.select(this);
        
        item.append('circle')
          .attr('r', 8)
          .attr('fill', d.color)
          .attr('stroke', d.color)
          .attr('stroke-width', 2)
          .attr('opacity', 0.8);
        
        item.append('text')
          .attr('x', 15)
          .attr('y', 4)
          .attr('font-size', '12px')
          .attr('fill', 'hsl(var(--foreground))')
          .text(`Generation ${d.generation}`);
      });

    // Stop simulation after some time to improve performance
    setTimeout(() => {
      simulation.stop();
    }, 5000);

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