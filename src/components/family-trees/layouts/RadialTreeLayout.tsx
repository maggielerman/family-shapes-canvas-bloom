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

interface RadialTreeLayoutProps {
  persons: Person[];
  connections: Connection[];
  width: number;
  height: number;
  onPersonClick?: (person: Person) => void;
}

interface RadialNode extends d3.HierarchyNode<Person> {
  x?: number;
  y?: number;
}

export function RadialTreeLayout({ persons, connections, width, height, onPersonClick }: RadialTreeLayoutProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || persons.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Create hierarchical data structure
    const hierarchyData = createHierarchy(persons, connections);
    if (!hierarchyData) return;

    const radius = Math.min(width, height) / 2 - 50;

    // Create the radial tree layout
    const tree = d3.tree<Person>()
      .size([2 * Math.PI, radius])
      .separation((a, b) => (a.parent === b.parent ? 1 : 2) / a.depth);

    const root = d3.hierarchy(hierarchyData);
    tree(root);

    const g = svg.append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`);

    // Create radial links
    g.selectAll('.link')
      .data(root.links())
      .enter()
      .append('path')
      .attr('class', 'link')
      .attr('d', d3.linkRadial<d3.HierarchyLink<Person>, RadialNode>()
        .angle(d => d.x!)
        .radius(d => d.y!))
      .attr('fill', 'none')
      .attr('stroke', 'hsl(var(--border))')
      .attr('stroke-width', 2);

    // Create nodes
    const nodes = g.selectAll('.node')
      .data(root.descendants())
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', d => `
        rotate(${d.x! * 180 / Math.PI - 90})
        translate(${d.y!},0)
      `)
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        onPersonClick?.(d.data);
      });

    // Add circles for nodes
    nodes.append('circle')
      .attr('r', 20)
      .attr('fill', d => getGenderColor(d.data.gender))
      .attr('stroke', 'hsl(var(--border))')
      .attr('stroke-width', 2);

    // Add profile images if available
    nodes.filter(d => d.data.profile_photo_url)
      .append('image')
      .attr('x', -15)
      .attr('y', -15)
      .attr('width', 30)
      .attr('height', 30)
      .attr('href', d => d.data.profile_photo_url!)
      .attr('clip-path', 'circle(15px)');

    // Add names
    nodes.append('text')
      .attr('dy', '.31em')
      .attr('x', d => d.x! < Math.PI === !d.children ? 6 : -6)
      .attr('text-anchor', d => d.x! < Math.PI === !d.children ? 'start' : 'end')
      .attr('transform', d => d.x! >= Math.PI ? 'rotate(180)' : null)
      .attr('font-size', '10px')
      .attr('fill', 'hsl(var(--foreground))')
      .text(d => d.data.name);

    // Add zoom and pan
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        g.attr('transform', `translate(${width / 2},${height / 2}) ${event.transform}`);
      });

    svg.call(zoom);

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

function createHierarchy(persons: Person[], connections: Connection[]): Person | null {
  if (persons.length === 0) return null;

  // Find root person (someone who is not a child)
  const childIds = new Set(connections.map(c => c.to_person_id));
  const rootPersons = persons.filter(p => !childIds.has(p.id));
  
  const root = rootPersons[0] || persons[0];
  return buildTree(root, persons, connections, new Set());
}

function buildTree(person: Person, allPersons: Person[], connections: Connection[], visited: Set<string>): Person & { children?: (Person & { children?: any[] })[] } {
  if (visited.has(person.id)) return person;
  visited.add(person.id);

  const children = connections
    .filter(c => c.from_person_id === person.id)
    .map(c => allPersons.find(p => p.id === c.to_person_id))
    .filter(p => p && !visited.has(p.id))
    .map(p => buildTree(p!, allPersons, connections, visited));

  return {
    ...person,
    children: children.length > 0 ? children : undefined
  };
}

function getGenderColor(gender?: string | null): string {
  switch (gender?.toLowerCase()) {
    case 'male': return 'hsl(var(--chart-1))';
    case 'female': return 'hsl(var(--chart-2))';
    default: return 'hsl(var(--chart-3))';
  }
}