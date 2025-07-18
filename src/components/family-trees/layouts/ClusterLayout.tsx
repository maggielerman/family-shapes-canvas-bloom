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

interface RelationshipType {
  value: string;
  label: string;
  color: string;
}

interface ClusterLayoutProps {
  persons: Person[];
  connections: Connection[];
  relationshipTypes: RelationshipType[];
  width: number;
  height: number;
  onPersonClick?: (person: Person) => void;
}

interface ClusterNode extends d3.HierarchyNode<Person> {
  x?: number;
  y?: number;
}

export function ClusterLayout({ persons, connections, relationshipTypes, width, height, onPersonClick }: ClusterLayoutProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || persons.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Create hierarchical data structure
    const hierarchyData = createHierarchy(persons, connections);
    if (!hierarchyData) return;

    // Create the cluster layout
    const cluster = d3.cluster<Person>()
      .size([width - 100, height - 100]);

    const root = d3.hierarchy(hierarchyData);
    cluster(root);

    const g = svg.append('g')
      .attr('transform', 'translate(50,50)');

    // Create links
    g.selectAll('.link')
      .data(root.links())
      .enter()
      .append('path')
      .attr('class', 'link')
      .attr('d', d3.linkVertical<d3.HierarchyLink<Person>, ClusterNode>()
        .x(d => d.x!)
        .y(d => d.y!))
      .attr('fill', 'none')
      .attr('stroke', 'hsl(var(--border))')
      .attr('stroke-width', 2);

    // Create nodes
    const nodes = g.selectAll('.node')
      .data(root.descendants())
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', d => `translate(${d.x},${d.y})`)
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        onPersonClick?.(d.data);
      });

    // Add circles for nodes
    nodes.append('circle')
      .attr('r', d => d.children ? 25 : 20)
      .attr('fill', d => getPersonColor(d.data, connections, relationshipTypes))
      .attr('stroke', 'hsl(var(--border))')
      .attr('stroke-width', 2);

    // Add profile images if available
    nodes.filter(d => d.data.profile_photo_url)
      .append('image')
      .attr('x', d => d.children ? -20 : -15)
      .attr('y', d => d.children ? -20 : -15)
      .attr('width', d => d.children ? 40 : 30)
      .attr('height', d => d.children ? 40 : 30)
      .attr('href', d => d.data.profile_photo_url!)
      .attr('clip-path', d => d.children ? 'circle(20px)' : 'circle(15px)');

    // Add names
    nodes.append('text')
      .attr('dy', d => d.children ? 40 : 35)
      .attr('text-anchor', 'middle')
      .attr('font-size', '11px')
      .attr('fill', 'hsl(var(--foreground))')
      .text(d => d.data.name);

    // Add generation labels
    const generations = new Map<number, ClusterNode[]>();
    root.descendants().forEach(node => {
      const depth = node.depth;
      if (!generations.has(depth)) {
        generations.set(depth, []);
      }
      generations.get(depth)!.push(node);
    });

    generations.forEach((nodes, depth) => {
      if (nodes.length > 0) {
        const avgY = d3.mean(nodes, d => d.y!) || 0;
        g.append('text')
          .attr('x', -30)
          .attr('y', avgY)
          .attr('text-anchor', 'end')
          .attr('font-size', '10px')
          .attr('fill', 'hsl(var(--muted-foreground))')
          .text(`Gen ${depth}`);
      }
    });

    // Add zoom and pan
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        g.attr('transform', `translate(50,50) ${event.transform}`);
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

  // Create a set of valid person IDs for connection filtering
  const validPersonIds = new Set(persons.map(p => p.id));
  
  // Filter out connections that reference non-existent persons
  const validConnections = connections.filter(c => 
    validPersonIds.has(c.from_person_id) && validPersonIds.has(c.to_person_id)
  );

  // Find root person (someone who is not a child)
  const childIds = new Set(validConnections.map(c => c.to_person_id));
  const rootPersons = persons.filter(p => !childIds.has(p.id));
  
  // If we have a root person, use it; otherwise use the first person
  const root = rootPersons[0] || persons[0];
  
  // Build the tree and add unconnected persons as children of root
  const tree = buildTree(root, persons, validConnections, new Set());
  
  // Find persons not connected to the main tree
  const connectedIds = new Set<string>();
  collectConnectedIds(tree, connectedIds);
  
  const unconnectedPersons = persons.filter(p => p.id !== root.id && !connectedIds.has(p.id));
  
  // Add unconnected persons as direct children of root if they exist
  if (unconnectedPersons.length > 0) {
    const existingChildren = tree.children || [];
    tree.children = [
      ...existingChildren,
      ...unconnectedPersons.map(p => ({ ...p, children: undefined }))
    ];
  }
  
  return tree;
}

function collectConnectedIds(node: Person & { children?: any[] }, connectedIds: Set<string>) {
  connectedIds.add(node.id);
  if (node.children) {
    node.children.forEach((child: any) => collectConnectedIds(child, connectedIds));
  }
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

function getPersonColor(person: Person, connections: Connection[], relationshipTypes: RelationshipType[]): string {
  // Find the primary relationship for this person (first connection as "to_person")
  const primaryConnection = connections.find(c => c.to_person_id === person.id);
  
  if (primaryConnection) {
    const relationshipType = relationshipTypes.find(rt => rt.value === primaryConnection.relationship_type);
    if (relationshipType) {
      return relationshipType.color;
    }
  }
  
  // Default to first relationship type color if no specific relationship found
  return relationshipTypes[0]?.color || 'hsl(var(--chart-1))';
}