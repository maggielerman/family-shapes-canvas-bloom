import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import * as dagre from 'dagre';
import { processConnections } from '@/utils/connectionProcessing';
import { Person } from '@/types/person';
import { Connection } from '@/types/connection';
import { GenerationInfo } from '@/utils/generationUtils';
import { LayoutRelationshipType } from '@/types/layoutTypes';
import { TreeToolbar } from './TreeToolbar';
import { LayoutSwitcher } from './LayoutSwitcher';
import { InfoPanel } from './InfoPanel';
import { RelationshipFilter } from './RelationshipFilter';
import { FamilyTreePersonCardSVG } from './FamilyTreePersonCard';
import { GenerationLegend } from './GenerationLegend';
import { RELATIONSHIP_CATEGORIES, RelationshipCategory } from './relationshipConstants';

interface DagreLayoutProps {
  persons: Person[];
  connections: Connection[];
  relationshipTypes: LayoutRelationshipType[];
  width: number;
  height: number;
  onPersonClick?: (person: Person) => void;
  currentLayout: 'force' | 'radial' | 'dagre' | 'family-chart' | 'xyflow';
  onLayoutChange: (layout: 'force' | 'radial' | 'dagre' | 'family-chart' | 'xyflow') => void;
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
  onLayoutChange
}: DagreLayoutProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [layoutDirection, setLayoutDirection] = useState<'TB' | 'LR' | 'BT' | 'RL'>('TB');
  const [dagreGraph, setDagreGraph] = useState<dagre.graphlib.Graph | null>(null);
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

  useEffect(() => {
    if (!svgRef.current || persons.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Use shared connection processing utility
    const processed = processConnections(persons, connections);
    const { generationalConnections, generationMap: currentGenerationMap } = processed;
    
    // Update generation map state for legend
    setGenerationMap(currentGenerationMap);

    // Filter connections based on relationship type filters
    const filteredConnections = getFilteredConnections(generationalConnections);
    
    // Get visible persons (those with connections or marked as self)
    const visiblePersons = getVisiblePersons(persons, filteredConnections);

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

    // Add only visible nodes to the graph (adjusted for vertical cards)
    visiblePersons.forEach(person => {
      const generationInfo = currentGenerationMap.get(person.id);
      g.setNode(person.id, {
        label: person.name,
        width: 192,
        height: 256,
        generation: generationInfo?.generation,
        generationColor: generationInfo?.color,
        profile_photo_url: person.profile_photo_url,
        gender: person.gender
      });
    });

    // Add edges to the graph (only filtered connections between visible persons)
    filteredConnections.forEach(connection => {
      // Only add edge if both persons are visible
      if (visiblePersons.some(p => p.id === connection.from_person_id) &&
          visiblePersons.some(p => p.id === connection.to_person_id)) {
        g.setEdge(connection.from_person_id, connection.to_person_id, {
          relationship_type: connection.relationship_type
        });
      }
    });

    // Calculate the layout
    dagre.layout(g);
    setDagreGraph(g);

    const g_svg = svg.append('g')
      .attr('transform', 'translate(50,50)');

    // Create edges with smooth transitions
    const edges = g_svg.selectAll('.edge')
      .data(g.edges(), (d: any) => `${d.v}-${d.w}`); // Use edge ID as key

    // Handle entering edges
    const edgeEnter = edges.enter()
      .append('g')
      .attr('class', 'edge')
      .style('opacity', 0); // Start invisible

    edgeEnter.append('path')
      .attr('d', (d) => {
        const edge = g.edge(d);
        return `M ${edge.points[0].x} ${edge.points[0].y} ${edge.points.map(p => `L ${p.x} ${p.y}`).join(' ')}`;
      })
      .attr('fill', 'none')
      .attr('stroke', (d) => {
        const edge = g.edge(d);
        return getConnectionColor(edge.relationship_type);
      })
      .attr('stroke-width', 2);

    // Transition edges to visible
    edgeEnter.merge(edges as any)
      .transition()
      .duration(500)
      .style('opacity', 0.6);

    // Create nodes with smooth transitions
    const nodes = g_svg.selectAll('.node')
      .data(g.nodes(), (d: any) => d); // Use node ID as key for consistent transitions

    // Handle entering nodes (newly visible)
    const nodeEnter = nodes.enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', (d) => {
        const node = g.node(d);
        return `translate(${node.x - node.width / 2},${node.y - node.height / 2})`;
      })
      .style('cursor', 'pointer')
      .style('opacity', 0) // Start invisible for smooth fade-in
      .on('click', (event, d) => {
        const person = persons.find(p => p.id === d);
        if (person) {
          onPersonClick?.(person);
        }
      });

    // Handle updating nodes (position changes)
    const nodeUpdate = nodeEnter.merge(nodes as any)
      .transition()
      .duration(500)
      .attr('transform', (d) => {
        const node = g.node(d);
        return `translate(${node.x - node.width / 2},${node.y - node.height / 2})`;
      })
      .style('opacity', 1);

    // Use nodeEnter for adding elements, nodeUpdate for final merged selection
    const allNodes = nodeEnter;

    // Add vertical FamilyTreePersonCard components
    allNodes.each(function(d) {
      const nodeElement = d3.select(this);
      const person = persons.find(p => p.id === d);
      
      if (!person) return;
      
      const generationInfo = currentGenerationMap.get(person.id);
      const generationColor = generationInfo?.color || '#e5e7eb';
      
      // Create FamilyTreePersonCardSVG component
      const cardGroup = nodeElement.append('g');
      
      // Card shadow
      cardGroup.append('rect')
        .attr('width', 192)
        .attr('height', 256)
        .attr('x', 0)
        .attr('y', 0)
        .attr('rx', 8)
        .attr('ry', 8)
        .attr('fill', '#00000010')
        .attr('transform', 'translate(2, 2)');
      
      // Card background with generation color border
      cardGroup.append('rect')
        .attr('width', 192)
        .attr('height', 256)
        .attr('x', 0)
        .attr('y', 0)
        .attr('rx', 8)
        .attr('ry', 8)
        .attr('fill', 'white')
        .attr('stroke', generationColor)
        .attr('stroke-width', 3);

      // Avatar circle background
      cardGroup.append('circle')
        .attr('cx', 96)
        .attr('cy', 48)
        .attr('r', 32)
        .attr('fill', '#f3f4f6')
        .attr('stroke', '#e5e7eb')
        .attr('stroke-width', 1);

      // Avatar image or initials
      if (person.profile_photo_url) {
        cardGroup.append('image')
          .attr('x', 64)
          .attr('y', 16)
          .attr('width', 64)
          .attr('height', 64)
          .attr('href', person.profile_photo_url)
          .attr('clip-path', 'circle(32px at 32px 32px)')
          .attr('preserveAspectRatio', 'xMidYMid slice');
      } else {
        const initials = person.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
        cardGroup.append('text')
          .attr('x', 96)
          .attr('y', 56)
          .attr('text-anchor', 'middle')
          .attr('fill', '#6b7280')
          .attr('font-size', '16px')
          .attr('font-weight', '600')
          .text(initials);
      }

      // Name
      cardGroup.append('text')
        .attr('x', 96)
        .attr('y', 108)
        .attr('text-anchor', 'middle')
        .attr('fill', '#111827')
        .attr('font-size', '14px')
        .attr('font-weight', '600')
        .text(person.name.length > 18 ? person.name.substring(0, 18) + '...' : person.name);

      // Age (if available)
      let yOffset = 128;
      if (person.date_of_birth) {
        const birthDate = new Date(person.date_of_birth);
        if (!isNaN(birthDate.getTime())) {
          const age = new Date().getFullYear() - birthDate.getFullYear();
          cardGroup.append('text')
            .attr('x', 96)
            .attr('y', yOffset)
            .attr('text-anchor', 'middle')
            .attr('fill', '#6b7280')
            .attr('font-size', '12px')
            .text(`Age ${age}`);
          yOffset += 20;
        }
      }

      // Contact info (email, phone, or address)
      if (person.email) {
        cardGroup.append('text')
          .attr('x', 96)
          .attr('y', yOffset)
          .attr('text-anchor', 'middle')
          .attr('fill', '#9ca3af')
          .attr('font-size', '10px')
          .text(person.email.length > 20 ? person.email.substring(0, 20) + '...' : person.email);
        yOffset += 20;
      } else if (person.phone) {
        cardGroup.append('text')
          .attr('x', 96)
          .attr('y', yOffset)
          .attr('text-anchor', 'middle')
          .attr('fill', '#9ca3af')
          .attr('font-size', '10px')
          .text(person.phone);
        yOffset += 20;
      } else if (person.address) {
        cardGroup.append('text')
          .attr('x', 96)
          .attr('y', yOffset)
          .attr('text-anchor', 'middle')
          .attr('fill', '#9ca3af')
          .attr('font-size', '10px')
          .text(person.address.length > 20 ? person.address.substring(0, 20) + '...' : person.address);
        yOffset += 20;
      }

      // Notes
      if (person.notes) {
        cardGroup.append('text')
          .attr('x', 96)
          .attr('y', yOffset)
          .attr('text-anchor', 'middle')
          .attr('fill', '#d1d5db')
          .attr('font-size', '9px')
          .text(person.notes.length > 25 ? person.notes.substring(0, 25) + '...' : person.notes);
      }

      // Badges at bottom
      let badgeY = 200;
      let badgeX = 30;

      // Status badge
      const statusColor = person.status === 'living' ? '#047857' : '#374151';
      const statusBg = person.status === 'living' ? '#ecfdf5' : '#f9fafb';
      const statusStroke = person.status === 'living' ? '#10b981' : '#6b7280';
      
      cardGroup.append('rect')
        .attr('x', badgeX)
        .attr('y', badgeY)
        .attr('width', 50)
        .attr('height', 18)
        .attr('rx', 9)
        .attr('fill', statusBg)
        .attr('stroke', statusStroke)
        .attr('stroke-width', 1);
        
      cardGroup.append('text')
        .attr('x', badgeX + 25)
        .attr('y', badgeY + 11)
        .attr('text-anchor', 'middle')
        .attr('fill', statusColor)
        .attr('font-size', '9px')
        .attr('font-weight', '500')
        .text(person.status);
      
      badgeX += 55;

      // Self badge
      if (person.is_self) {
        cardGroup.append('rect')
          .attr('x', badgeX)
          .attr('y', badgeY)
          .attr('width', 30)
          .attr('height', 18)
          .attr('rx', 9)
          .attr('fill', '#dc2626')
          .attr('stroke', '#dc2626')
          .attr('stroke-width', 1);
          
        cardGroup.append('text')
          .attr('x', badgeX + 15)
          .attr('y', badgeY + 11)
          .attr('text-anchor', 'middle')
          .attr('fill', 'white')
          .attr('font-size', '9px')
          .attr('font-weight', '500')
          .text('Self');
        
        badgeX += 35;
      }

      // Donor badge
      if (person.donor) {
        cardGroup.append('rect')
          .attr('x', badgeX)
          .attr('y', badgeY)
          .attr('width', 35)
          .attr('height', 18)
          .attr('rx', 9)
          .attr('fill', '#fed7aa')
          .attr('stroke', '#ea580c')
          .attr('stroke-width', 1);
          
        cardGroup.append('text')
          .attr('x', badgeX + 17.5)
          .attr('y', badgeY + 11)
          .attr('text-anchor', 'middle')
          .attr('fill', '#ea580c')
          .attr('font-size', '9px')
          .attr('font-weight', '500')
          .text('Donor');
      }

      // Gender badge (second row if needed)
      if (person.gender) {
        cardGroup.append('rect')
          .attr('x', 30)
          .attr('y', badgeY + 25)
          .attr('width', 40)
          .attr('height', 18)
          .attr('rx', 9)
          .attr('fill', '#dbeafe')
          .attr('stroke', '#3b82f6')
          .attr('stroke-width', 1);
          
        cardGroup.append('text')
          .attr('x', 50)
          .attr('y', badgeY + 36)
          .attr('text-anchor', 'middle')
          .attr('fill', '#1d4ed8')
          .attr('font-size', '9px')
          .attr('font-weight', '500')
          .text(person.gender.charAt(0).toUpperCase() + person.gender.slice(1));
      }
    });

    // Add zoom and pan
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 3])
      .on('zoom', (event) => {
        setZoomLevel(event.transform.k);
        g_svg.attr('transform', event.transform);
      });

    svg.call(zoom);

    // Store zoom behavior for external access
    (svg.node() as any).__zoom__ = zoom;
    (svg.node() as any).__zoomGroup__ = g_svg;

    // Auto-fit to all nodes on initial load
    if (isInitialLoad && visiblePersons.length > 0) {
      setTimeout(() => {
        handleZoomToFit();
        setIsInitialLoad(false);
      }, 100); // Small delay to ensure layout is complete
    }

    // Store references for update function
    window.dagreData = { g, svg, g_svg, generationMap: currentGenerationMap, persons: visiblePersons };

  }, [persons, connections, width, height, onPersonClick, layoutDirection, relationshipFilters]);

  const handleLayoutChange = () => {
    const directions: Array<'TB' | 'LR' | 'BT' | 'RL'> = ['TB', 'LR', 'BT', 'RL'];
    const currentIndex = directions.indexOf(layoutDirection);
    const nextIndex = (currentIndex + 1) % directions.length;
    setLayoutDirection(directions[nextIndex]);
  };

  const handleCenterSelf = () => {
    if (!svgRef.current || !dagreGraph) return;

    const selfPerson = persons.find(person => person.is_self === true);
    if (!selfPerson) return;

    const selfNode = dagreGraph.node(selfPerson.id);
    if (!selfNode) return;

    const svg = d3.select(svgRef.current);
    const zoom = (svg.node() as any).__zoom__;
    const g = (svg.node() as any).__zoomGroup__;

    if (zoom && g) {
      // Calculate transform to center the self node
      // Account for the initial translate(50,50) offset
      const nodeX = selfNode.x + 50;
      const nodeY = selfNode.y + 50;
      const centerX = width / 2;
      const centerY = height / 2;
      
      const transform = d3.zoomIdentity
        .translate(centerX - nodeX, centerY - nodeY);

      svg.transition().duration(750).call(zoom.transform, transform);
    }
  };

  const handleZoomToFit = () => {
    if (!svgRef.current || !dagreGraph) return;

    const svg = d3.select(svgRef.current);
    const zoom = (svg.node() as any).__zoom__;
    const g = (svg.node() as any).__zoomGroup__;

    if (zoom && g) {
      // Calculate bounding box of all visible nodes
      const nodes = dagreGraph.nodes().map(nodeId => dagreGraph.node(nodeId));
      
      if (nodes.length === 0) return;

      const minX = Math.min(...nodes.map(node => node.x - node.width / 2)) - 50;
      const maxX = Math.max(...nodes.map(node => node.x + node.width / 2)) + 50;
      const minY = Math.min(...nodes.map(node => node.y - node.height / 2)) - 50;
      const maxY = Math.max(...nodes.map(node => node.y + node.height / 2)) + 50;

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

      // Calculate transform - account for the initial translate(50,50) offset
      const transform = d3.zoomIdentity
        .translate(width / 2, height / 2)
        .scale(scale)
        .translate(-centerX - 50, -centerY - 50);

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
          layoutDirection={layoutDirection}
          onCenterSelf={handleCenterSelf}
          onZoomToFit={handleZoomToFit}
          onLayoutDirectionChange={handleLayoutChange}
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

      {/* Generation Legend - top left below relationship filter */}
      <div className="absolute top-36 left-4 z-10">
        <GenerationLegend
          generationMap={generationMap}
        />
      </div>

      {/* Info Panel - bottom left */}
      <div className="absolute bottom-4 left-4 z-10">
        <InfoPanel
          layout={`Tree (${layoutDirection})`}
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