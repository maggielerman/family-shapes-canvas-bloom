import { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { PersonNode } from './PersonNode';
import { useConnectionCreator } from '@/hooks/use-connection-creator';

interface Person {
  id: string;
  name: string;
  date_of_birth?: string | null;
  gender?: string | null;
  profile_photo_url?: string | null;
  status: string;
  family_tree_id?: string | null;
}

interface Connection {
  id: string;
  from_person_id: string;
  to_person_id: string;
  relationship_type: string;
  family_tree_id?: string | null;
}

interface ConnectionCreatorProps {
  familyTreeId: string;
  persons: Person[];
  connections: Connection[];
  onConnectionAdded: () => void;
}

export function ConnectionCreator({ 
  familyTreeId, 
  persons, 
  connections, 
  onConnectionAdded 
}: ConnectionCreatorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [nodePositions, setNodePositions] = useState<Map<string, { x: number; y: number }>>(new Map());
  
  const {
    draggedPersonId,
    hoveredPersonId,
    isCreatingConnection,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragLeave,
    handleDrop,
  } = useConnectionCreator({ familyTreeId, onConnectionAdded });

  // Initialize node positions using D3 force simulation
  useEffect(() => {
    if (persons.length === 0 || !containerRef.current) return;

    const width = 800;
    const height = 600;

    // Create nodes data
    const nodes = persons.map(person => ({
      id: person.id,
      name: person.name,
      gender: person.gender,
    }));

    // Create links data
    const links = connections.map(connection => ({
      source: connection.from_person_id,
      target: connection.to_person_id,
      relationship_type: connection.relationship_type,
    }));

    // Create force simulation
    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id((d: any) => d.id).distance(120))
      .force("charge", d3.forceManyBody().strength(-400))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(50))
      .force("boundary", d3.forceX().x(width / 2).strength(0.1))
      .force("boundaryY", d3.forceY().y(height / 2).strength(0.1));

    simulation.on("tick", () => {
      const newPositions = new Map();
      nodes.forEach((node: any) => {
        // Keep nodes within bounds
        const x = Math.max(60, Math.min(width - 60, node.x || width / 2));
        const y = Math.max(60, Math.min(height - 80, node.y || height / 2));
        newPositions.set(node.id, { x, y });
      });
      setNodePositions(newPositions);
    });

    // Stop simulation after it settles
    simulation.on("end", () => {
      simulation.stop();
    });

    return () => {
      simulation.stop();
    };
  }, [persons, connections]);

  // Render connection lines
  useEffect(() => {
    if (!svgRef.current || nodePositions.size === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 800;
    const height = 600;

    // Create links
    const linksData = connections.map(connection => {
      const sourcePos = nodePositions.get(connection.from_person_id);
      const targetPos = nodePositions.get(connection.to_person_id);
      
      if (!sourcePos || !targetPos) return null;
      
      return {
        ...connection,
        source: sourcePos,
        target: targetPos,
      };
    }).filter(Boolean);

    // Draw connection lines
    svg.selectAll("path")
      .data(linksData)
      .enter()
      .append("path")
      .attr("d", (d: any) => {
        const dx = d.target.x - d.source.x;
        const dy = d.target.y - d.source.y;
        const dr = Math.sqrt(dx * dx + dy * dy) * 0.3;
        return `M${d.source.x},${d.source.y}A${dr},${dr} 0 0,1 ${d.target.x},${d.target.y}`;
      })
      .style("stroke", "#6b7280")
      .style("stroke-width", 2)
      .style("fill", "none")
      .style("stroke-linecap", "round");

    // Add relationship labels
    svg.selectAll("text")
      .data(linksData)
      .enter()
      .append("text")
      .attr("x", (d: any) => (d.source.x + d.target.x) / 2)
      .attr("y", (d: any) => (d.source.y + d.target.y) / 2 - 5)
      .style("font-size", "10px")
      .style("fill", "hsl(var(--muted-foreground))")
      .style("text-anchor", "middle")
      .style("pointer-events", "none")
      .text((d: any) => d.relationship_type);
  }, [connections, nodePositions]);

  return (
    <div className="relative w-full h-[600px] border rounded-lg overflow-hidden bg-card">
      {/* SVG for connection lines */}
      <svg
        ref={svgRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        width="800"
        height="600"
      />
      
      {/* Container for person nodes */}
      <div ref={containerRef} className="relative w-full h-full">
        {persons.map(person => {
          const position = nodePositions.get(person.id) || { x: 400, y: 300 };
          return (
            <PersonNode
              key={person.id}
              person={person}
              position={position}
              isDragged={draggedPersonId === person.id}
              isHovered={hoveredPersonId === person.id}
              isConnecting={isCreatingConnection}
              onDragStart={() => handleDragStart(person.id)}
              onDragEnd={handleDragEnd}
              onDragOver={() => handleDragOver(person.id)}
              onDragLeave={handleDragLeave}
              onDrop={(relationshipType) => handleDrop(person.id, relationshipType)}
            />
          );
        })}
        
        {/* Instruction overlay when no people */}
        {persons.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <p className="text-lg font-medium mb-2">No family members yet</p>
              <p className="text-sm">Add people to start building your family tree</p>
            </div>
          </div>
        )}
        
        {/* Instruction overlay when dragging */}
        {isCreatingConnection && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-40">
            <div className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium animate-fade-in">
              Drag to another person to create a connection
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
