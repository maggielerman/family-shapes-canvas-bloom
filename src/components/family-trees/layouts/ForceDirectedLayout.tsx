import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { processConnections } from '@/utils/connectionProcessing';
import { Person } from '@/types/person';
import { Connection } from '@/types/connection';
import { TreeToolbar } from './TreeToolbar';
import { LayoutSwitcher } from './LayoutSwitcher';
import { InfoPanel } from './InfoPanel';
import { RelationshipFilter } from './RelationshipFilter';
import { RELATIONSHIP_CATEGORIES, RelationshipCategory } from './relationshipConstants';

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
  currentLayout: 'force' | 'radial' | 'dagre';
  onLayoutChange: (layout: 'force' | 'radial' | 'dagre') => void;
}

export function ForceDirectedLayout({ 
  persons, 
  connections, 
  relationshipTypes, 
  width, 
  height, 
  onPersonClick,
  currentLayout,
  onLayoutChange
}: ForceDirectedLayoutProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
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
    const { validConnections, generationMap } = processed;

    // Filter connections based on relationship type filters
    const filteredConnections = getFilteredConnections(validConnections);
    
    // Get visible persons (those with connections or marked as self)
    const visiblePersons = getVisiblePersons(persons, filteredConnections);

    // Create nodes data from visible persons only
    const nodes = visiblePersons.map(person => {
      const generationInfo = generationMap.get(person.id);
      return {
        id: person.id,
        name: person.name,
        person,
        generation: generationInfo?.generation,
        generationColor: generationInfo?.color,
        profile_photo_url: person.profile_photo_url,
        gender: person.gender,
        x: width / 2 + (Math.random() - 0.5) * 200,
        y: height / 2 + (Math.random() - 0.5) * 200,
        fx: null as number | null,
        fy: null as number | null
      };
    });

    // Create links data from filtered connections (only between visible persons)
    const links = filteredConnections
      .filter(connection => 
        visiblePersons.some(p => p.id === connection.from_person_id) &&
        visiblePersons.some(p => p.id === connection.to_person_id)
      )
      .map(connection => ({
        source: connection.from_person_id,
        target: connection.to_person_id,
        type: connection.relationship_type,
        connection
      }));

    // Create simulation
    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id((d: any) => d.id).distance(120))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(50));

    const g = svg.append('g');

    // Create links
    const link = g.append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(links)
      .enter()
      .append('line')
      .attr('stroke', 'hsl(var(--border))')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', 2);

    // Create nodes
    const node = g.append('g')
      .attr('class', 'nodes')
      .selectAll('g')
      .data(nodes)
      .enter()
      .append('g')
      .attr('class', 'node')
      .style('cursor', 'pointer')
      .call(d3.drag<any, any>()
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
        if (onPersonClick) {
          onPersonClick(d.person);
        }
      });

    // Add node containers
    node.append('rect')
      .attr('width', 120)
      .attr('height', 80)
      .attr('x', -60)
      .attr('y', -40)
      .attr('rx', 8)
      .attr('ry', 8)
      .attr('fill', d => d.generationColor || 'hsl(var(--chart-1))')
      .attr('stroke', d => d.generationColor || 'hsl(var(--border))')
      .attr('stroke-width', 2)
      .attr('opacity', 0.9);

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
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('font-size', '11px')
      .attr('font-weight', 'bold')
      .attr('fill', 'hsl(var(--foreground))')
      .text(d => d.name.length > 12 ? d.name.substring(0, 10) + '...' : d.name);

    // Add generation labels
    node.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '20px')
      .attr('font-size', '9px')
      .attr('fill', d => d.generationColor || 'hsl(var(--muted-foreground))')
      .text(d => d.generation ? `Gen ${d.generation}` : '');

    // Add gender indicators
    node.append('text')
      .attr('x', -45)
      .attr('y', -25)
      .attr('font-size', '12px')
      .attr('fill', 'hsl(var(--muted-foreground))')
      .text(d => d.gender === 'male' ? '♂' : d.gender === 'female' ? '♀' : '');

    // Add zoom and pan
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 3])
      .on('zoom', (event) => {
        setZoomLevel(event.transform.k);
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    // Store zoom behavior and simulation for external access
    (svg.node() as any).__zoom__ = zoom;
    (svg.node() as any).__zoomGroup__ = g;
    (svg.node() as any).__simulation__ = simulation;

    // Update positions on simulation tick
    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    });

    // Auto-fit to all nodes on initial load
    if (isInitialLoad && visiblePersons.length > 0) {
      setTimeout(() => {
        handleZoomToFit();
        setIsInitialLoad(false);
      }, 500); // Wait for simulation to stabilize
    }

  }, [persons, connections, width, height, onPersonClick, relationshipFilters]);

  const handleCenterSelf = () => {
    if (!svgRef.current) return;

    const selfPerson = persons.find(person => person.is_self === true);
    if (!selfPerson) return;

    const svg = d3.select(svgRef.current);
    const zoom = (svg.node() as any).__zoom__;
    const g = (svg.node() as any).__zoomGroup__;
    const simulation = (svg.node() as any).__simulation__;

    if (zoom && g && simulation) {
      // Find the node in the simulation
      const selfNode = simulation.nodes().find((node: any) => node.id === selfPerson.id);
      if (!selfNode) return;

      // Calculate transform to center the self node
      const centerX = width / 2;
      const centerY = height / 2;
      
      const transform = d3.zoomIdentity
        .translate(centerX - selfNode.x, centerY - selfNode.y);

      svg.transition().duration(750).call(zoom.transform, transform);
    }
  };

  const handleZoomToFit = () => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const zoom = (svg.node() as any).__zoom__;
    const g = (svg.node() as any).__zoomGroup__;
    const simulation = (svg.node() as any).__simulation__;

    if (zoom && g && simulation) {
      const nodes = simulation.nodes();
      
      if (nodes.length === 0) return;

      // Calculate bounding box of all nodes
      const minX = Math.min(...nodes.map((node: any) => node.x)) - 60;
      const maxX = Math.max(...nodes.map((node: any) => node.x)) + 60;
      const minY = Math.min(...nodes.map((node: any) => node.y)) - 40;
      const maxY = Math.max(...nodes.map((node: any) => node.y)) + 40;

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
      {/* Simplified Toolbar - top right */}
      <div className="absolute top-4 right-4 z-10">
        <TreeToolbar
          persons={persons}
          currentLayout={currentLayout}
          onCenterSelf={handleCenterSelf}
          onZoomToFit={handleZoomToFit}
          className="bg-background/80 backdrop-blur-sm rounded-lg p-3"
        />
      </div>

      {/* Layout Switcher - top left */}
      <div className="absolute top-4 left-4 z-10">
        <LayoutSwitcher
          currentLayout={currentLayout}
          onLayoutChange={onLayoutChange}
        />
      </div>

      {/* Relationship Filter - top left below layout switcher */}
      <div className="absolute top-16 left-4 z-10">
        <RelationshipFilter
          relationshipFilters={relationshipFilters}
          onRelationshipFilterChange={handleRelationshipFilterChange}
        />
      </div>

      {/* Info Panel - bottom left */}
      <div className="absolute bottom-4 left-4 z-10">
        <InfoPanel
          layout="Force"
          zoomLevel={zoomLevel}
          relationshipFilters={relationshipFilters}
        />
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