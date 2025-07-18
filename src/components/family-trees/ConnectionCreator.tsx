import { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { PersonNode } from './PersonNode';
import { RelationshipDialog } from './RelationshipDialog';
import { useConnectionCreator } from '@/hooks/use-connection-creator';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RotateCcw, ZoomIn, ZoomOut, Grid3X3, Shuffle } from 'lucide-react';

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
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [showRelationshipDialog, setShowRelationshipDialog] = useState(false);
  const [pendingConnection, setPendingConnection] = useState<{
    fromPersonId: string;
    toPersonId: string;
    fromPersonName: string;
    toPersonName: string;
  } | null>(null);
  
  const {
    draggedPersonId,
    hoveredPersonId,
    isCreatingConnection,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragLeave,
    createConnection,
  } = useConnectionCreator({ 
    familyTreeId, 
    onConnectionAdded: () => {
      onConnectionAdded();
      setShowRelationshipDialog(false);
      setPendingConnection(null);
    }
  });

  const handleDrop = (targetPersonId: string) => {
    if (draggedPersonId && draggedPersonId !== targetPersonId) {
      const fromPerson = persons.find(p => p.id === draggedPersonId);
      const toPerson = persons.find(p => p.id === targetPersonId);
      
      if (fromPerson && toPerson) {
        setPendingConnection({
          fromPersonId: draggedPersonId,
          toPersonId: targetPersonId,
          fromPersonName: fromPerson.name,
          toPersonName: toPerson.name,
        });
        setShowRelationshipDialog(true);
      }
    }
    handleDragEnd();
  };

  const handleRelationshipConfirm = async (relationshipType: string, attributes: string[]) => {
    if (pendingConnection) {
      await createConnection(
        pendingConnection.fromPersonId,
        pendingConnection.toPersonId,
        relationshipType,
        attributes
      );
    }
  };

  const autoLayout = () => {
    if (persons.length === 0) return;

    const width = containerRef.current?.clientWidth || 800;
    const height = containerRef.current?.clientHeight || 600;

    // Simple tree layout
    const levels = new Map<string, number>();
    const visited = new Set<string>();
    
    // Find root nodes (no incoming parent connections)
    const children = new Set(connections.filter(c => c.relationship_type === 'child').map(c => c.to_person_id));
    const roots = persons.filter(p => !children.has(p.id));
    
    let currentLevel = 0;
    let queue = roots.map(p => ({ id: p.id, level: 0 }));
    
    while (queue.length > 0) {
      const { id, level } = queue.shift()!;
      if (visited.has(id)) continue;
      
      visited.add(id);
      levels.set(id, level);
      
      // Add children to next level
      const childConnections = connections.filter(c => c.from_person_id === id && c.relationship_type === 'parent');
      childConnections.forEach(conn => {
        if (conn.to_person_id && !visited.has(conn.to_person_id)) {
          queue.push({ id: conn.to_person_id, level: level + 1 });
        }
      });
    }

    // Position nodes
    const newPositions = new Map<string, { x: number; y: number }>();
    const levelCounts = new Map<number, number>();
    
    // Count nodes per level
    levels.forEach(level => {
      levelCounts.set(level, (levelCounts.get(level) || 0) + 1);
    });
    
    const levelCurrentIndex = new Map<number, number>();
    
    persons.forEach(person => {
      const level = levels.get(person.id) || 0;
      const totalInLevel = levelCounts.get(level) || 1;
      const indexInLevel = levelCurrentIndex.get(level) || 0;
      
      const x = (width / (totalInLevel + 1)) * (indexInLevel + 1);
      const y = 100 + level * 120;
      
      newPositions.set(person.id, { x, y });
      levelCurrentIndex.set(level, indexInLevel + 1);
    });
    
    setNodePositions(newPositions);
  };

  // Initialize node positions using D3 force simulation
  useEffect(() => {
    if (persons.length === 0 || !containerRef.current) return;
    if (nodePositions.size > 0) return; // Don't reinitialize if positions exist

    const width = containerRef.current.clientWidth || 800;
    const height = containerRef.current.clientHeight || 600;

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
  }, [persons.length]); // Only reinitialize when person count changes

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
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={autoLayout}
            className="flex items-center gap-2"
          >
            <Grid3X3 className="w-4 h-4" />
            Auto Layout
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setZoom(1);
              setPan({ x: 0, y: 0 });
            }}
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          <Badge variant="secondary" className="px-2 py-1">
            {Math.round(zoom * 100)}%
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setZoom(Math.min(2, zoom + 0.1))}
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="relative w-full h-[600px] border rounded-lg overflow-hidden bg-card">
        {/* SVG for connection lines */}
        <svg
          ref={svgRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{
            transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
            transformOrigin: 'center center',
          }}
        />
        
        {/* Container for person nodes */}
        <div 
          ref={containerRef} 
          className="relative w-full h-full"
          style={{
            transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
            transformOrigin: 'center center',
          }}
        >
          {persons.map(person => {
            const position = nodePositions.get(person.id) || { x: 400, y: 300 };
            return (
              <div key={person.id} className="group">
                <PersonNode
                  person={person}
                  position={position}
                  isDragged={draggedPersonId === person.id}
                  isHovered={hoveredPersonId === person.id}
                  isConnecting={isCreatingConnection}
                  onDragStart={() => handleDragStart(person.id)}
                  onDragEnd={handleDragEnd}
                  onDragOver={() => handleDragOver(person.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={() => handleDrop(person.id)}
                  onPositionChange={(newPosition) => {
                    setNodePositions(prev => new Map(prev.set(person.id, newPosition)));
                  }}
                />
              </div>
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
      
      <RelationshipDialog
        open={showRelationshipDialog}
        onOpenChange={setShowRelationshipDialog}
        fromPersonName={pendingConnection?.fromPersonName || ''}
        toPersonName={pendingConnection?.toPersonName || ''}
        onConfirm={handleRelationshipConfirm}
      />
    </div>
  );
}
