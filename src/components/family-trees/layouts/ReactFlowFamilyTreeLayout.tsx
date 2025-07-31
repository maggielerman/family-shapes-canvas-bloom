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

interface RadialLayoutProps {
  persons: Person[];
  connections: Connection[];
  relationshipTypes: RelationshipType[];
  width: number;
  height: number;
  onPersonClick?: (person: Person) => void;
  currentLayout: 'force' | 'radial' | 'dagre' | 'xyflow';
  onLayoutChange: (layout: 'force' | 'radial' | 'dagre' | 'xyflow') => void;
}

// Radial layout configuration
interface RadialConfig {
  centerRadius: number;
  generationSpacing: number;
  maxRadius: number;
  linkDistance: number;
  chargeStrength: number;
  collisionRadius: number;
}

const RADIAL_CONFIG: RadialConfig = {
  centerRadius: 140,
  generationSpacing: 280,
  maxRadius: 800,
  linkDistance: 200,
  chargeStrength: -500,
  collisionRadius: 45
};

export function RadialLayout({ 
  persons, 
  connections, 
  relationshipTypes, 
  width, 
  height, 
  onPersonClick,
  currentLayout,
  onLayoutChange
}: RadialLayoutProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [relationshipFilters, setRelationshipFilters] = useState({
    generational: true,
    lateral: true,
    donor: true
  });
  const [generationMap, setGenerationMap] = useState<Map<string, { generation: number; color: string; depth: number }>>(new Map());

  // Helper function to get connection line color based on relationship type
  const getConnectionColor = (relationshipType: string): string => {
    if (RELATIONSHIP_CATEGORIES.generational.includes(relationshipType as any)) {
      return '#3b82f6'; // Blue for parent-child relationships
    } else if (RELATIONSHIP_CATEGORIES.lateral.includes(relationshipType as any)) {
      return '#10b981'; // Green for sibling relationships
    } else if (RELATIONSHIP_CATEGORIES.donor.includes(relationshipType as any)) {
      return '#f59e0b'; // Orange for donor relationships
    }
    return '#6b7280'; // Gray for other relationships
  };

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

  // Create radial force for generation-based circular arrangement
  const createRadialForce = (currentGenerationMapParam: Map<string, any>) => {
    return (alpha: number) => {
      const centerX = width / 2;
      const centerY = height / 2;

      return (node: any) => {
        const generation = currentGenerationMapParam.get(node.id)?.generation;
        
        if (generation !== undefined) {
          // Calculate target radius based on generation
          let targetRadius = RADIAL_CONFIG.centerRadius + (Math.abs(generation) * RADIAL_CONFIG.generationSpacing);
          
          // Cap the radius to prevent nodes from going off-screen
          targetRadius = Math.min(targetRadius, RADIAL_CONFIG.maxRadius);
          
          // If this is generation 0 (self), keep closer to center
          if (generation === 0) {
            targetRadius = RADIAL_CONFIG.centerRadius / 2;
          }

          // Calculate current distance from center
          const dx = node.x - centerX;
          const dy = node.y - centerY;
          const currentRadius = Math.sqrt(dx * dx + dy * dy);

          if (currentRadius > 0) {
            // Apply radial force toward target radius
            const targetX = centerX + (dx / currentRadius) * targetRadius;
            const targetY = centerY + (dy / currentRadius) * targetRadius;
            
            const forceStrength = alpha * 0.1;
            node.vx += (targetX - node.x) * forceStrength;
            node.vy += (targetY - node.y) * forceStrength;
          }
        }
      };
    };
  };

  useEffect(() => {
    if (!svgRef.current || persons.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Use shared connection processing utility
    const processed = processConnections(persons, connections);
    const { validConnections, generationMap: currentGenerationMap } = processed;
    
    // Update generation map state for legend
    setGenerationMap(currentGenerationMap);

    // Filter connections based on relationship type filters
    const filteredConnections = getFilteredConnections(validConnections);
    
    // Get visible persons (those with connections or marked as self)
    const visiblePersons = getVisiblePersons(persons, filteredConnections);

    // Create nodes data from visible persons only
    const nodes = visiblePersons.map(person => {
      const generationInfo = currentGenerationMap.get(person.id);
      
      // For radial layout, start nodes at their target positions
      let initialX = width / 2;
      let initialY = height / 2;
      
      if (generationInfo?.generation !== undefined) {
        const generation = generationInfo.generation;
        const radius = RADIAL_CONFIG.centerRadius + (Math.abs(generation) * RADIAL_CONFIG.generationSpacing);
        const angle = Math.random() * 2 * Math.PI;
        
        initialX = width / 2 + Math.cos(angle) * radius;
        initialY = height / 2 + Math.sin(angle) * radius;
      }

      return {
        id: person.id,
        name: person.name,
        person,
        generation: generationInfo?.generation,
        generationColor: generationInfo?.color,
        profile_photo_url: person.profile_photo_url,
        gender: person.gender,
        x: initialX,
        y: initialY,
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

    // Create simulation with radial-specific forces
    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id((d: any) => d.id).distance(RADIAL_CONFIG.linkDistance))
      .force('charge', d3.forceManyBody().strength(RADIAL_CONFIG.chargeStrength))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(RADIAL_CONFIG.collisionRadius))
      .force('radial', createRadialForce(currentGenerationMap));

    const g = svg.append('g');

    // Add generation circles for radial layout
    const generations = Array.from(new Set(nodes.map(n => n.generation).filter(g => g !== undefined)));
    
    g.append('g')
      .attr('class', 'generation-circles')
      .selectAll('circle')
      .data(generations)
      .enter()
      .append('circle')
      .attr('cx', width / 2)
      .attr('cy', height / 2)
      .attr('r', generation => {
        const absGen = Math.abs(generation!);
        return RADIAL_CONFIG.centerRadius + (absGen * RADIAL_CONFIG.generationSpacing);
      })
      .attr('fill', 'none')
      .attr('stroke', 'hsl(var(--border))')
      .attr('stroke-opacity', 0.2)
      .attr('stroke-dasharray', '2,2');

    // Create links with enhanced styling for radial layout
    const link = g.append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(links)
      .enter()
      .append('line')
      .attr('stroke', d => getConnectionColor(d.type))
      .attr('stroke-opacity', 0.4)
      .attr('stroke-width', 1.5);

    // Create nodes with new PersonNodeSVG component
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

    // Add circular nodes
    node.each(function(d) {
      const nodeElement = d3.select(this);
      const person = d.person;
      const generationInfo = currentGenerationMap.get(person.id);
      const generationColor = generationInfo?.color || '#e5e7eb';
      const nodeRadius = 30;
      
      // Main circle with generation color
      const circle = nodeElement.append('circle')
        .attr('r', nodeRadius)
        .attr('fill', 'white')
        .attr('stroke', generationColor)
        .attr('stroke-width', 4);

      // Special styling for self
      if (person.is_self) {
        circle.attr('stroke', '#dc2626')
          .attr('stroke-width', 6);
      }

      // Profile image or initials
      if (person.profile_photo_url) {
        // Create a clipPath for the profile image
        const clipId = `clip-${person.id}`;
        const defs = nodeElement.append('defs');
        defs.append('clipPath')
          .attr('id', clipId)
          .append('circle')
          .attr('r', nodeRadius - 4)
          .attr('cx', 0)
          .attr('cy', 0);

        nodeElement.append('image')
          .attr('x', -(nodeRadius - 4))
          .attr('y', -(nodeRadius - 4))
          .attr('width', (nodeRadius - 4) * 2)
          .attr('height', (nodeRadius - 4) * 2)
          .attr('href', person.profile_photo_url)
          .attr('clip-path', `url(#${clipId})`)
          .attr('preserveAspectRatio', 'xMidYMid slice');
      } else {
        // Show initials
        const initials = person.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
        nodeElement.append('text')
          .attr('text-anchor', 'middle')
          .attr('dy', '0.35em')
          .attr('fill', '#374151')
          .attr('font-size', '14px')
          .attr('font-weight', '600')
          .text(initials);
      }

      // Add status indicators as small circles
      if (person.donor) {
        nodeElement.append('circle')
          .attr('cx', 20)
          .attr('cy', -20)
          .attr('r', 6)
          .attr('fill', '#f59e0b')
          .attr('stroke', 'white')
          .attr('stroke-width', 2);
        
        nodeElement.append('text')
          .attr('x', 20)
          .attr('y', -17)
          .attr('text-anchor', 'middle')
          .attr('fill', 'white')
          .attr('font-size', '8px')
          .attr('font-weight', 'bold')
          .text('D');
      }

      // Name label below the circle
      nodeElement.append('text')
        .attr('x', 0)
        .attr('y', nodeRadius + 15)
        .attr('text-anchor', 'middle')
        .attr('fill', '#374151')
        .attr('font-size', '12px')
        .attr('font-weight', '500')
        .text(person.name.length > 15 ? person.name.substring(0, 15) + '...' : person.name);
    });

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
      const minX = Math.min(...nodes.map((node: any) => node.x)) - 50;
      const maxX = Math.max(...nodes.map((node: any) => node.x)) + 50;
      const minY = Math.min(...nodes.map((node: any) => node.y)) - 35;
      const maxY = Math.max(...nodes.map((node: any) => node.y)) + 35;

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
          layout="Radial"
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