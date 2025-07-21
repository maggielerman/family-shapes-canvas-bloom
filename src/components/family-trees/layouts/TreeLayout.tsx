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
    const validConnections = connections.filter(c => 
      validPersonIds.has(c.from_person_id) && validPersonIds.has(c.to_person_id)
    );

    // Calculate generations for color coding
    const generationMap = calculateGenerations(persons, validConnections);

    // Use only generational connections for tree structure
    const generationalConnections = getGenerationalConnections(validConnections);

    // Create hierarchical data structure using only generational connections
    const hierarchyData = createHierarchy(persons, generationalConnections);
    if (!hierarchyData) return;

    // Create the tree layout
    const tree = d3.tree<Person>()
      .size([width - 100, height - 100]);

    const root = d3.hierarchy(hierarchyData);
    tree(root);

    const g = svg.append('g')
      .attr('transform', 'translate(50,50)');

    // Create links (only for generational connections)
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

    // Create nodes with generation-based coloring
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

    // Add circles for nodes with generation colors
    nodes.append('circle')
      .attr('r', 30)
      .attr('fill', d => {
        const generationInfo = generationMap.get(d.data.id);
        return generationInfo?.color || 'hsl(var(--chart-1))';
      })
      .attr('stroke', d => {
        const generationInfo = generationMap.get(d.data.id);
        return generationInfo?.color || 'hsl(var(--border))';
      })
      .attr('stroke-width', 3)
      .attr('opacity', 0.8);

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

    // Add generation labels
    nodes.append('text')
      .attr('dy', -40)
      .attr('text-anchor', 'middle')
      .attr('font-size', '10px')
      .attr('fill', d => {
        const generationInfo = generationMap.get(d.data.id);
        return generationInfo?.color || 'hsl(var(--muted-foreground))';
      })
      .attr('font-weight', 'bold')
      .text(d => {
        const generationInfo = generationMap.get(d.data.id);
        return generationInfo ? `Gen ${generationInfo.generation}` : '';
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

  // Connections are already filtered to generational connections
  const validConnections = connections;

  // Find root person (someone who is not a child in generational connections)
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