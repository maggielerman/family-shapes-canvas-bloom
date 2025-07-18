import { useRef, useEffect, useState, useCallback } from 'react';
import * as d3 from 'd3';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Move, 
  Link, 
  Edit, 
  Trash2, 
  Save,
  Users,
  Target,
  MousePointer
} from 'lucide-react';
import { EnhancedPersonNode } from './EnhancedPersonNode';
import { ConnectionManager } from './ConnectionManager';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Person {
  id: string;
  name: string;
  date_of_birth?: string | null;
  gender?: string | null;
  profile_photo_url?: string | null;
  status: string;
  family_tree_id?: string | null;
  email?: string | null;
  phone?: string | null;
  notes?: string | null;
}

interface Connection {
  id: string;
  from_person_id: string;
  to_person_id: string;
  relationship_type: string;
  family_tree_id?: string | null;
}

interface NodeData extends Person {
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
  expanded?: boolean;
}

interface LinkData extends Connection {
  source: NodeData;
  target: NodeData;
}

type EditMode = 'view' | 'move' | 'connect' | 'edit' | 'delete';

interface InteractiveFamilyTreeProps {
  familyTreeId: string;
  persons: Person[];
  connections: Connection[];
  onPersonAdded: () => void;
  onConnectionAdded: () => void;
  onPersonUpdated: () => void;
  onPersonDeleted: () => void;
}

export function InteractiveFamilyTree({
  familyTreeId,
  persons,
  connections,
  onPersonAdded,
  onConnectionAdded,
  onPersonUpdated,
  onPersonDeleted
}: InteractiveFamilyTreeProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const [editMode, setEditMode] = useState<EditMode>('view');
  const [zoom, setZoom] = useState(1);
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);
  const [expandedPersonId, setExpandedPersonId] = useState<string | null>(null);
  const [pendingConnection, setPendingConnection] = useState<{
    fromPersonId: string;
    toPersonId: string | null;
  } | null>(null);

  // D3 simulation state
  const [simulation, setSimulation] = useState<d3.Simulation<NodeData, LinkData> | null>(null);
  const [nodes, setNodes] = useState<NodeData[]>([]);
  const [links, setLinks] = useState<LinkData[]>([]);

  // Initialize D3 force simulation with family tree specific forces
  useEffect(() => {
    if (!svgRef.current || persons.length === 0) return;

    const width = 800;
    const height = 600;

    // Transform persons to nodes with generation-based positioning
    const nodeData: NodeData[] = persons.map(person => {
      // Calculate generation based on birth year or relationships
      const birthYear = person.date_of_birth ? new Date(person.date_of_birth).getFullYear() : null;
      const generation = birthYear ? Math.floor((2024 - birthYear) / 25) : 0;
      
      return {
        ...person,
        expanded: person.id === expandedPersonId,
        generation
      };
    });

    // Transform connections to links
    const linkData: LinkData[] = connections.map(connection => {
      const source = nodeData.find(n => n.id === connection.from_person_id);
      const target = nodeData.find(n => n.id === connection.to_person_id);
      return {
        ...connection,
        source: source!,
        target: target!
      };
    }).filter(link => link.source && link.target);

    // Create force simulation optimized for family trees
    const sim = d3.forceSimulation(nodeData)
      .force("link", d3.forceLink<NodeData, LinkData>(linkData)
        .id(d => d.id)
        .distance(d => {
          // Adjust distance based on relationship type
          const link = d as LinkData;
          switch (link.relationship_type) {
            case 'parent':
            case 'child':
              return 150; // Longer distance for parent-child
            case 'partner':
              return 80;  // Shorter for partners
            case 'sibling':
            case 'half_sibling':
              return 120; // Medium for siblings
            default:
              return 100;
          }
        })
        .strength(0.9))
      .force("charge", d3.forceManyBody()
        .strength(d => {
          // Stronger repulsion for nodes with more connections
          const connections = linkData.filter(l => 
            l.source === d || l.target === d
          ).length;
          return -300 - (connections * 50);
        }))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(70))
      // Add generational forces to separate by age/generation
      .force("generational", d3.forceY()
        .y(d => {
          const node = d as NodeData & { generation: number };
          return height * 0.2 + (node.generation * 80);
        })
        .strength(0.3))
      // Keep nodes within bounds
      .force("boundary", () => {
        nodeData.forEach(node => {
          if (node.x && node.y) {
            node.x = Math.max(50, Math.min(width - 50, node.x));
            node.y = Math.max(50, Math.min(height - 50, node.y));
          }
        });
      });

    setSimulation(sim);
    setNodes(nodeData);
    setLinks(linkData);

    return () => {
      sim.stop();
    };
  }, [persons, connections, expandedPersonId]);

  // Handle simulation tick updates
  useEffect(() => {
    if (!simulation) return;

    const handleTick = () => {
      setNodes([...simulation.nodes()]);
    };

    simulation.on('tick', handleTick);

    return () => {
      simulation.on('tick', null);
    };
  }, [simulation]);

  const handlePersonClick = useCallback((person: NodeData) => {
    switch (editMode) {
      case 'view':
        setExpandedPersonId(expandedPersonId === person.id ? null : person.id);
        break;
      case 'connect':
        if (pendingConnection?.fromPersonId) {
          if (pendingConnection.fromPersonId !== person.id) {
            setPendingConnection({
              ...pendingConnection,
              toPersonId: person.id
            });
          }
        } else {
          setPendingConnection({
            fromPersonId: person.id,
            toPersonId: null
          });
        }
        break;
      case 'edit':
        setSelectedPersonId(person.id);
        break;
      case 'delete':
        handleDeletePerson(person.id);
        break;
    }
  }, [editMode, pendingConnection, expandedPersonId]);

  const handleDeletePerson = async (personId: string) => {
    if (!window.confirm("Are you sure you want to delete this person? This will also remove all their connections.")) {
      return;
    }

    try {
      // First delete all connections involving this person
      await supabase
        .from('connections')
        .delete()
        .or(`from_person_id.eq.${personId},to_person_id.eq.${personId}`);

      // Then delete the person
      const { error } = await supabase
        .from('persons')
        .delete()
        .eq('id', personId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Person deleted successfully",
      });

      onPersonDeleted();
    } catch (error) {
      console.error('Error deleting person:', error);
      toast({
        title: "Error",
        description: "Failed to delete person",
        variant: "destructive",
      });
    }
  };

  const handleCreateConnection = async (relationshipType: string) => {
    if (!pendingConnection?.fromPersonId || !pendingConnection?.toPersonId) return;

    try {
      const { error } = await supabase
        .from('connections')
        .insert({
          from_person_id: pendingConnection.fromPersonId,
          to_person_id: pendingConnection.toPersonId,
          relationship_type: relationshipType,
          family_tree_id: familyTreeId
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Connection created successfully",
      });

      setPendingConnection(null);
      onConnectionAdded();
    } catch (error) {
      console.error('Error creating connection:', error);
      toast({
        title: "Error",
        description: "Failed to create connection",
        variant: "destructive",
      });
    }
  };

  const resetView = () => {
    setZoom(1);
    setEditMode('view');
    setSelectedPersonId(null);
    setExpandedPersonId(null);
    setPendingConnection(null);
    
    if (simulation) {
      simulation.alpha(0.3).restart();
    }
  };

  const relationshipTypes = [
    { value: "parent", label: "Parent", color: "hsl(var(--chart-1))" },
    { value: "child", label: "Child", color: "hsl(var(--chart-2))" },
    { value: "partner", label: "Partner", color: "hsl(var(--chart-3))" },
    { value: "sibling", label: "Sibling", color: "hsl(var(--chart-4))" },
    { value: "donor", label: "Donor", color: "hsl(var(--chart-5))" },
    { value: "half_sibling", label: "Half Sibling", color: "hsl(var(--chart-1))" },
  ];

  const getRelationshipColor = (type: string) => {
    return relationshipTypes.find(r => r.value === type)?.color || "hsl(var(--muted-foreground))";
  };

  return (
    <div className="space-y-4">
      {/* Mode Selection Toolbar */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="w-4 h-4" />
            Interactive Controls
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 items-center justify-between">
            <div className="flex gap-2">
              <Button
                variant={editMode === 'view' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setEditMode('view')}
              >
                <MousePointer className="w-4 h-4 mr-2" />
                View
              </Button>
              <Button
                variant={editMode === 'move' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setEditMode('move')}
              >
                <Move className="w-4 h-4 mr-2" />
                Move
              </Button>
              <Button
                variant={editMode === 'connect' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setEditMode('connect')}
              >
                <Link className="w-4 h-4 mr-2" />
                Connect
              </Button>
              <Button
                variant={editMode === 'edit' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setEditMode('edit')}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button
                variant={editMode === 'delete' ? 'destructive' : 'outline'}
                size="sm"
                onClick={() => setEditMode('delete')}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={resetView}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
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

          {/* Mode Instructions */}
          <Separator className="my-3" />
          <div className="text-sm text-muted-foreground">
            {editMode === 'view' && "Click on a person to view their details"}
            {editMode === 'move' && "Drag people to rearrange the tree layout"}
            {editMode === 'connect' && "Click two people to create a connection between them"}
            {editMode === 'edit' && "Click on a person to edit their information"}
            {editMode === 'delete' && "Click on a person to delete them from the tree"}
          </div>

          {/* Connection Creation */}
          {pendingConnection && pendingConnection.toPersonId && (
            <div className="mt-3 p-3 bg-primary/10 rounded-lg">
              <p className="text-sm font-medium mb-2">Create Connection</p>
              <div className="flex gap-2 flex-wrap">
                {relationshipTypes.map(type => (
                  <Button
                    key={type.value}
                    size="sm"
                    variant="outline"
                    onClick={() => handleCreateConnection(type.value)}
                  >
                    {type.label}
                  </Button>
                ))}
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setPendingConnection(null)}
                className="mt-2"
              >
                Cancel
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Family Tree Visualization */}
      <div className="relative w-full h-[600px] border rounded-lg overflow-hidden bg-card">
        <svg
          ref={svgRef}
          className="absolute inset-0 w-full h-full"
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'center center',
          }}
        >
          {/* Connection Lines */}
          {links.map(link => (
            <line
              key={`${link.from_person_id}-${link.to_person_id}`}
              x1={link.source.x || 0}
              y1={link.source.y || 0}
              x2={link.target.x || 0}
              y2={link.target.y || 0}
              stroke={getRelationshipColor(link.relationship_type)}
              strokeWidth={2}
              strokeLinecap="round"
              opacity={0.8}
            />
          ))}
          
          {/* Relationship Labels */}
          {links.map(link => (
            <text
              key={`label-${link.from_person_id}-${link.to_person_id}`}
              x={((link.source.x || 0) + (link.target.x || 0)) / 2}
              y={((link.source.y || 0) + (link.target.y || 0)) / 2 - 5}
              textAnchor="middle"
              fontSize="10"
              fill="hsl(var(--muted-foreground))"
              pointerEvents="none"
            >
              {link.relationship_type}
            </text>
          ))}
        </svg>

        {/* Person Nodes */}
        <div 
          ref={containerRef}
          className="absolute inset-0 w-full h-full"
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'center center',
          }}
        >
          {nodes.map(person => (
            <EnhancedPersonNode
              key={person.id}
              person={person}
              position={{ x: person.x || 400, y: person.y || 300 }}
              editMode={editMode}
              isSelected={selectedPersonId === person.id}
              isExpanded={expandedPersonId === person.id}
              isPendingConnection={
                pendingConnection?.fromPersonId === person.id ||
                pendingConnection?.toPersonId === person.id
              }
              onClick={() => handlePersonClick(person)}
              onPositionChange={(newPosition) => {
                if (simulation && editMode === 'move') {
                  const node = simulation.nodes().find(n => n.id === person.id);
                  if (node) {
                    node.fx = newPosition.x;
                    node.fy = newPosition.y;
                    simulation.alpha(0.3).restart();
                  }
                }
              }}
              onUpdate={onPersonUpdated}
            />
          ))}
        </div>

        {/* Empty State */}
        {persons.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <Users className="w-16 h-16 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No family members yet</h3>
              <p className="text-sm">Add people to start building your family tree</p>
            </div>
          </div>
        )}
      </div>

      {/* Connection Manager for advanced features */}
      <ConnectionManager
        familyTreeId={familyTreeId}
        connections={connections}
        persons={persons}
        onConnectionUpdated={onConnectionAdded}
      />
    </div>
  );
}