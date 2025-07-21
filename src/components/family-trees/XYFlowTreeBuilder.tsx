import { useCallback, useEffect, useState } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  EdgeChange,
  NodeChange,
  applyNodeChanges,
  applyEdgeChanges,
  MarkerType,
  Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Button } from '@/components/ui/button';
import { Plus, Users, Network } from 'lucide-react';
import { AddPersonDialog } from './AddPersonDialog';
import { PersonCardDialog } from '@/components/people/PersonCard';
import { XYFlowConnectionManager } from './XYFlowConnectionManager';
import { XYFlowLegend, relationshipTypes } from './XYFlowLegend';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { PersonNode } from './PersonNode';
import { Person } from '@/types/person';

interface PersonConnection {
  id: string;
  from_person_id: string;
  to_person_id: string;
  relationship_type: string;
  family_tree_id?: string | null;
}

interface XYFlowTreeBuilderProps {
  familyTreeId: string;
  persons: Person[];
  onPersonAdded: () => void;
}



const nodeTypes = {
  personNode: PersonNode,
};

export function XYFlowTreeBuilder({ familyTreeId, persons, onPersonAdded }: XYFlowTreeBuilderProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [connections, setConnections] = useState<PersonConnection[]>([]);
  const [addPersonDialogOpen, setAddPersonDialogOpen] = useState(false);
  const [viewingPerson, setViewingPerson] = useState<Person | null>(null);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const { toast } = useToast();

  // Convert persons to nodes
  useEffect(() => {
    const personNodes: Node[] = persons.map((person, index) => ({
      id: person.id,
      type: 'personNode',
      position: { x: 100 + (index * 200), y: 100 + (index * 100) },
      data: { person },
    }));
    setNodes(personNodes);
  }, [persons, setNodes]);

  // Fetch connections and convert to edges
  useEffect(() => {
    fetchConnections();
  }, [familyTreeId]);

  useEffect(() => {
    const connectionEdges: Edge[] = connections.map((connection) => {
      const relationshipType = relationshipTypes.find(rt => rt.value === connection.relationship_type);
      return {
        id: connection.id,
        source: connection.from_person_id,
        target: connection.to_person_id,
        type: 'smoothstep',
        label: relationshipType?.label || connection.relationship_type,
        style: {
          stroke: relationshipType?.color || '#6b7280',
          strokeWidth: 2,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 20,
          height: 20,
          color: relationshipType?.color || '#6b7280',
        },
        data: { connection },
      };
    });
    setEdges(connectionEdges);
  }, [connections, setEdges]);

  const fetchConnections = async () => {
    try {
      // Fetch connections directly associated with this family tree
      const { data: treeConnections, error: treeError } = await supabase
        .from('connections')
        .select('*')
        .eq('family_tree_id', familyTreeId);

      if (treeError) throw treeError;

      // Get person IDs who are members of this family tree
      const { data: treeMembers, error: membersError } = await supabase
        .from('family_tree_members')
        .select('person_id')
        .eq('family_tree_id', familyTreeId);

      if (membersError) throw membersError;

      const personIds = (treeMembers || []).map(m => m.person_id);

      // Fetch connections between people who are members of this tree (but don't have family_tree_id set)
      const { data: memberConnections, error: memberError } = await supabase
        .from('connections')
        .select('*')
        .is('family_tree_id', null)
        .in('from_person_id', personIds)
        .in('to_person_id', personIds);

      if (memberError) throw memberError;

      // Combine and deduplicate connections
      const allConnections = [...(treeConnections || []), ...(memberConnections || [])];
      const uniqueConnections = allConnections.filter((conn, index, self) => 
        index === self.findIndex(c => c.id === conn.id)
      );

      setConnections(uniqueConnections);
    } catch (error) {
      console.error('Error fetching connections:', error);
    }
  };

  const handleAddPerson = async (personData: any) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('No user found');

      // Add person to persons table
      const { data: newPerson, error: personError } = await supabase
        .from('persons')
        .insert({
          ...personData,
          user_id: userData.user.id,
        })
        .select()
        .single();

      if (personError) throw personError;

      // Add person to family tree members
      const { error: memberError } = await supabase
        .from('family_tree_members')
        .insert({
          family_tree_id: familyTreeId,
          person_id: newPerson.id,
          added_by: userData.user.id,
        });

      if (memberError) throw memberError;

      toast({
        title: "Success",
        description: "Person added successfully",
      });

      setAddPersonDialogOpen(false);
      onPersonAdded();
    } catch (error) {
      console.error('Error adding person:', error);
      toast({
        title: "Error",
        description: "Failed to add person",
        variant: "destructive",
      });
    }
  };

  const handleNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    const person = node.data.person as Person;
    setViewingPerson(person);
    setSelectedNode(node);
  }, []);

  const handleNodeDoubleClick = useCallback((event: React.MouseEvent, node: Node) => {
    const person = node.data.person as Person;
    setViewingPerson(person);
  }, []);

  const onConnect = useCallback(
    (params: Connection) => {
      // This will be handled by the connection manager
      console.log('Connection attempt:', params);
    },
    []
  );

  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      setNodes((nds) => applyNodeChanges(changes, nds));
    },
    [setNodes]
  );

  const handleEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      setEdges((eds) => applyEdgeChanges(changes, eds));
    },
    [setEdges]
  );

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-2">
          <Button onClick={() => setAddPersonDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Person
          </Button>
        </div>
        
        <div className="text-sm text-muted-foreground">
          Interactive family tree builder - drag nodes to reposition, double-click to edit
        </div>
      </div>

      {/* Legend */}
      <XYFlowLegend />

      {/* Connection Manager */}
      <XYFlowConnectionManager
        familyTreeId={familyTreeId}
        persons={persons}
        connections={connections}
        onConnectionUpdated={fetchConnections}
      />

      {/* XYFlow Canvas */}
      {persons.length === 0 ? (
        <div className="border rounded-lg bg-card">
          <div className="flex flex-col items-center justify-center h-96 text-center">
            <Users className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No family members yet</h3>
            <p className="text-muted-foreground mb-4">
              Start building your family tree by adding family members.
            </p>
            <Button onClick={() => setAddPersonDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add First Person
            </Button>
          </div>
        </div>
      ) : (
        <div className="h-[600px] border rounded-lg">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={handleNodesChange}
            onEdgesChange={handleEdgesChange}
            onConnect={onConnect}
            onNodeClick={handleNodeClick}
            onNodeDoubleClick={handleNodeDoubleClick}
            nodeTypes={nodeTypes}
            fitView
            attributionPosition="bottom-left"
          >
            <Controls />
            <Background />
            <Panel position="top-right" className="bg-background/80 backdrop-blur-sm rounded-lg p-2">
              <div className="text-xs text-muted-foreground">
                {persons.length} people • {connections.length} connections
              </div>
            </Panel>
          </ReactFlow>
        </div>
      )}

      <AddPersonDialog
        open={addPersonDialogOpen}
        onOpenChange={setAddPersonDialogOpen}
        onSubmit={handleAddPerson}
      />

      <PersonCardDialog
        person={viewingPerson}
        open={!!viewingPerson}
        onOpenChange={(open) => !open && setViewingPerson(null)}
      />
    </div>
  );
} 