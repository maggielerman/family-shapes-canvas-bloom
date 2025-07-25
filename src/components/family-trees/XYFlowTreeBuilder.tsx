import { useCallback, useEffect, useState, useRef, useMemo } from 'react';
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
  ReactFlowInstance,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Button } from '@/components/ui/button';
import { Plus, Users, Network, RotateCcw } from 'lucide-react';
import { AddPersonDialog } from './AddPersonDialog';
import { PersonCardDialog } from '@/components/people/PersonCard';
import { XYFlowLegend } from './XYFlowLegend';
import { XYFlowLayoutSelector, LayoutType } from './XYFlowLayoutSelector';
import { XYFlowLayoutService, LayoutResult } from './layouts/XYFlowLayoutService';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { PersonNode } from './PersonNode';
import { Person, CreatePersonData } from '@/types/person';
import { ConnectionUtils, Connection as ConnectionType, RelationshipType } from '@/types/connection';
import { RelationshipTypeHelpers } from '@/types/relationshipTypes';
import { ConnectionService } from '@/services/connectionService';
import { PersonService } from '@/services/personService';
import { 
  calculateGenerations, 
  getGenerationalConnections, 
  isGenerationalConnection,
  GenerationInfo 
} from '@/utils/generationUtils';
import { usePersonManagement } from '@/hooks/use-person-management';
import { EditPersonDialog } from '@/components/people/EditPersonDialog';

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
  const [connections, setConnections] = useState<ConnectionType[]>([]);
  const [generationMap, setGenerationMap] = useState<Map<string, GenerationInfo>>(new Map());
  const [addPersonDialogOpen, setAddPersonDialogOpen] = useState(false);
  const [viewingPerson, setViewingPerson] = useState<Person | null>(null);
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [currentLayout, setCurrentLayout] = useState<LayoutType>('dagre');
  const [isLayoutLoading, setIsLayoutLoading] = useState(false);
  const [hasAppliedInitialLayout, setHasAppliedInitialLayout] = useState(false);
  const reactFlowRef = useRef<ReactFlowInstance | null>(null);
  const { toast } = useToast();

  // Use centralized relationship types - memoized to prevent unnecessary re-renders
  const relationshipTypes = useMemo(() => RelationshipTypeHelpers.getForSelection(), []);

  // Calculate generations whenever persons or connections change
  useEffect(() => {
    if (persons.length > 0 && connections.length > 0) {
      const generations = calculateGenerations(persons, connections);
      setGenerationMap(generations);
    } else {
      setGenerationMap(new Map());
    }
  }, [persons, connections]);

  // Convert persons to nodes with generation coloring
  useEffect(() => {
    const personNodes: Node[] = persons.map((person, index) => {
      const generationInfo = generationMap.get(person.id);
      
      return {
        id: person.id,
        type: 'personNode',
        position: { x: 100 + (index * 200), y: 100 + (index * 100) },
        data: { 
          person,
          generationColor: generationInfo?.color,
          generation: generationInfo?.generation
        },
      };
    });
    setNodes(personNodes);
  }, [persons, generationMap, setNodes]);

  // Fetch connections and convert to edges
  useEffect(() => {
    fetchConnections();
  }, [familyTreeId]);

  useEffect(() => {
    // Filter connections to only show generational connections (parent-child)
    // Sibling connections are hidden from the visual tree but remain in connection manager
    const generationalConnections = getGenerationalConnections(connections);
    const deduplicatedConnections = ConnectionUtils.deduplicate(generationalConnections);
    
    const connectionEdges: Edge[] = deduplicatedConnections.map((connection) => {
      const relationshipType = relationshipTypes.find(rt => rt.value === connection.relationship_type);
      const isBidirectional = ConnectionUtils.isBidirectional(connection.relationship_type as RelationshipType);
      
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
        markerEnd: isBidirectional ? undefined : {
          type: MarkerType.ArrowClosed,
          width: 20,
          height: 20,
          color: relationshipType?.color || '#6b7280',
        },
        data: { connection },
      };
    });
    setEdges(connectionEdges);
  }, [connections, relationshipTypes, setEdges]);

  // Apply layout when layout type changes or when nodes are first loaded
  useEffect(() => {
    if (nodes.length === 0) return;

    let isCancelled = false;

    const applyLayout = async () => {
      setIsLayoutLoading(true);
      try {
        const containerWidth = 800;
        const containerHeight = 600;
        
        // Add timeout to prevent blocking
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Layout timeout')), 5000);
        });
        
        const layoutPromise = XYFlowLayoutService.applyLayout(
          nodes,
          edges,
          currentLayout,
          containerWidth,
          containerHeight
        );
        
        const result = await Promise.race([layoutPromise, timeoutPromise]) as LayoutResult;
        
        if (!isCancelled) {
          setNodes(result.nodes);
          setEdges(result.edges);
          setHasAppliedInitialLayout(true);
          
          // Fit view after layout is applied
          setTimeout(() => {
            if (reactFlowRef.current && !isCancelled) {
              reactFlowRef.current.fitView({ padding: 0.1 });
            }
          }, 100);
        }
        
      } catch (error) {
        if (!isCancelled) {
          console.error('Layout application error:', error);
          toast({
            title: "Layout Error",
            description: (error instanceof Error && error.message === 'Layout timeout') 
              ? "Layout took too long. Try a different layout or fewer nodes."
              : "Failed to apply layout. Please try again.",
            variant: "destructive",
          });
          // Fallback to dagre layout on error
          setCurrentLayout('dagre');
        }
      } finally {
        if (!isCancelled) {
          setIsLayoutLoading(false);
        }
      }
    };

    applyLayout();

    return () => {
      isCancelled = true;
    };
  }, [currentLayout]); // Only depend on currentLayout

  // Apply initial layout when nodes are first loaded
  useEffect(() => {
    if (nodes.length > 0 && edges.length > 0 && !hasAppliedInitialLayout && !isLayoutLoading) {
      // Force trigger the layout by temporarily changing the layout
      const tempLayout = currentLayout === 'dagre' ? 'elk' : 'dagre';
      setCurrentLayout(tempLayout);
      // Change back immediately to trigger the layout effect
      setTimeout(() => setCurrentLayout(currentLayout), 10);
    }
  }, [nodes.length, edges.length, hasAppliedInitialLayout, isLayoutLoading, currentLayout]);

  const fetchConnections = async () => {
    try {
      const connectionsData = await ConnectionService.getConnectionsForFamilyTree(familyTreeId);
      setConnections(connectionsData);
    } catch (error) {
      console.error('Error fetching connections:', error);
      toast({
        title: "Error",
        description: "Failed to load connections",
        variant: "destructive",
      });
    }
  };

  const { handleAddPerson, handleAddDonor } = usePersonManagement({
    familyTreeId,
    onPersonAdded: () => {
      setAddPersonDialogOpen(false);
      // Refresh the tree data
      if (onNodesChange) {
        // Trigger a refresh of the tree
        onNodesChange([]);
      }
    },
    onDonorAdded: () => {
      setAddPersonDialogOpen(false);
      // Refresh the tree data
      if (onNodesChange) {
        // Trigger a refresh of the tree
        onNodesChange([]);
      }
    },
  });

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

  // Count visible connections (generational only)
  const visibleConnections = getGenerationalConnections(connections);
  const totalConnections = connections.length;
  const hiddenSiblingConnections = totalConnections - visibleConnections.length;

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
          Generation-based coloring • Lines show parent-child relationships
        </div>
      </div>

      {/* Layout Selector */}
      <XYFlowLayoutSelector
        currentLayout={currentLayout}
        onLayoutChange={setCurrentLayout}
        disabled={isLayoutLoading}
      />

      {/* Legend */}
      <XYFlowLegend />


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
            ref={reactFlowRef}
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
                {persons.length} people • {visibleConnections.length} generational connections
                {hiddenSiblingConnections > 0 && (
                  <span className="block">{hiddenSiblingConnections} sibling connections (color-coded)</span>
                )}
                {isLayoutLoading && (
                  <span className="ml-2 text-blue-500">• Applying layout...</span>
                )}
              </div>
            </Panel>
          </ReactFlow>
        </div>
      )}

      <AddPersonDialog
        open={addPersonDialogOpen}
        onOpenChange={setAddPersonDialogOpen}
        onSubmit={handleAddPerson}
        onDonorSubmit={handleAddDonor}
      />

      <PersonCardDialog
        person={viewingPerson}
        open={!!viewingPerson}
        onOpenChange={(open) => !open && setViewingPerson(null)}
        onEdit={() => {
          setEditingPerson(viewingPerson);
          setViewingPerson(null);
        }}
      />

      {editingPerson && (
        <EditPersonDialog
          person={editingPerson}
          open={!!editingPerson}
          onOpenChange={(open) => !open && setEditingPerson(null)}
          onPersonUpdated={() => {
            onPersonAdded();
            setEditingPerson(null);
          }}
        />
      )}
    </div>
  );
} 