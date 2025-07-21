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

interface TreeLayoutProps {
  persons: Person[];
  connections: Connection[];
  relationshipTypes: RelationshipType[];
  width: number;
  height: number;
  onPersonClick?: (person: Person) => void;
}

interface TreeNode extends d3.HierarchyNode<Person> {
  x?: number;
  y?: number;
}

export function TreeLayout({ persons, connections, relationshipTypes, width, height, onPersonClick }: TreeLayoutProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || persons.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Filter connections to only include those between persons in this family tree
    const validPersonIds = new Set(persons.map(p => p.id));
    // Only use 'parent' relationships for hierarchy, filter out duplicates
    const validConnections = connections.filter(c => 
      validPersonIds.has(c.from_person_id) &&
      validPersonIds.has(c.to_person_id) &&
      c.relationship_type === 'parent'
    );

    // Create hierarchical data structure
    const hierarchyData = createHierarchy(persons, validConnections);
    if (!hierarchyData) return;

    // Create the tree layout
    const tree = d3.tree<Person>()
      .size([width - 100, height - 100]);

    const root = d3.hierarchy(hierarchyData);
    tree(root);

    const g = svg.append('g')
      .attr('transform', 'translate(50,50)');

    // Create links
    g.selectAll('.link')
      .data(root.links())
      .enter()
      .append('path')
      .attr('class', 'link')
      .attr('d', d3.linkVertical<d3.HierarchyLink<Person>, TreeNode>()
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
      .attr('r', 30)
      .attr('fill', d => getPersonColor(d.data, validConnections, relationshipTypes))
      .attr('stroke', 'hsl(var(--border))')
      .attr('stroke-width', 2);

    // Add profile images if available
    nodes.filter(d => d.data.profile_photo_url)
      .append('image')
      .attr('x', -25)
      .attr('y', -25)
      .attr('width', 50)
      .attr('height', 50)
      .attr('href', d => d.data.profile_photo_url!)
      .attr('clip-path', 'circle(25px)');

    // Add names
    nodes.append('text')
      .attr('dy', 45)
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('fill', 'hsl(var(--foreground))')
      .text(d => d.data.name);

    // Add zoom and pan
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
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

  // Connections are already filtered in the calling function
  const validConnections = connections;

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