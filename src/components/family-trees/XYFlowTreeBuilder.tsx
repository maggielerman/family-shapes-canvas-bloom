import { useCallback, useEffect, useState, useMemo } from 'react';
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
import { PersonNode } from './PersonNode';
import { Person } from '@/types/person';
import { ConnectionUtils, Connection as ConnectionType, RelationshipType } from '@/types/connection';
import { RelationshipTypeHelpers } from '@/types/relationshipTypes';
import { 
  calculateGenerations, 
  getGenerationalConnections, 
  GenerationInfo 
} from '@/utils/generationUtils';
import { LayoutSwitcher } from './layouts/LayoutSwitcher';

interface XYFlowTreeBuilderProps {
  familyTreeId: string;
  persons: Person[];
  connections: ConnectionType[];
  width: number;
  height: number;
  onPersonClick?: (person: Person) => void;
  currentLayout: string;
  onLayoutChange: (layout: string) => void;
}

const nodeTypes = {
  personNode: PersonNode,
};

export function XYFlowTreeBuilder({ 
  familyTreeId, 
  persons, 
  connections, 
  width, 
  height, 
  onPersonClick,
  currentLayout,
  onLayoutChange
}: XYFlowTreeBuilderProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [generationMap, setGenerationMap] = useState<Map<string, GenerationInfo>>(new Map());

  // Use centralized relationship types
  const relationshipTypes = useMemo(() => RelationshipTypeHelpers.getForSelection(), []);

  // Calculate generations whenever persons or connections change
  useEffect(() => {
    if (persons.length > 0 && connections.length > 0) {
      // Convert connections to the expected type for generation calculations
      const connectionsForGeneration = connections.map(conn => ({
        id: conn.id,
        from_person_id: conn.from_person_id,
        to_person_id: conn.to_person_id,
        relationship_type: conn.relationship_type
      }));
      const generations = calculateGenerations(persons, connectionsForGeneration);
      setGenerationMap(generations);
    } else {
      setGenerationMap(new Map());
    }
  }, [persons, connections]);

  // Convert persons to nodes with generation coloring
  useEffect(() => {
    if (persons.length === 0) {
      setNodes([]);
      return;
    }

    // Calculate positions based on generation for better layout
    const generationGroups = new Map<number, Person[]>();
    persons.forEach(person => {
      const generationInfo = generationMap.get(person.id);
      const generation = generationInfo?.generation || 0;
      if (!generationGroups.has(generation)) {
        generationGroups.set(generation, []);
      }
      generationGroups.get(generation)!.push(person);
    });

    const personNodes: Node[] = [];
    let nodeIndex = 0;

    // Position nodes by generation (top to bottom)
    Array.from(generationGroups.entries()).sort(([a], [b]) => a - b).forEach(([generation, peopleInGen]) => {
      const y = generation * 150 + 50; // Vertical spacing between generations
      
      peopleInGen.forEach((person, index) => {
        const totalInGen = peopleInGen.length;
        const x = (index - (totalInGen - 1) / 2) * 200 + width / 2; // Center horizontally
        
        const generationInfo = generationMap.get(person.id);
        
        personNodes.push({
          id: person.id,
          type: 'personNode',
          position: { x, y },
          data: { 
            person,
            generationColor: generationInfo?.color,
            generation: generationInfo?.generation
          },
        });
        nodeIndex++;
      });
    });

    console.log('Creating nodes:', personNodes.length, 'nodes');
    setNodes(personNodes);
  }, [persons, generationMap, setNodes, width]);

  // Convert connections to edges
  useEffect(() => {
    if (connections.length === 0) {
      setEdges([]);
      return;
    }

    // First deduplicate all connections
    const deduplicatedConnections = ConnectionUtils.deduplicate(connections);
    
    // Then filter connections to only show generational connections (parent-child)
    const connectionsForGeneration = deduplicatedConnections.map(conn => ({
      id: conn.id,
      from_person_id: conn.from_person_id,
      to_person_id: conn.to_person_id,
      relationship_type: conn.relationship_type
    }));
    const generationalConnections = getGenerationalConnections(connectionsForGeneration);
    
    const connectionEdges: Edge[] = generationalConnections.map((connection) => {
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
    
    console.log('Creating edges:', connectionEdges.length, 'edges');
    setEdges(connectionEdges);
  }, [connections, relationshipTypes, setEdges]);

  const handleNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    const person = node.data.person as Person;
    onPersonClick?.(person);
  }, [onPersonClick]);

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

  console.log('XYFlowTreeBuilder render:', {
    personsCount: persons.length,
    nodesCount: nodes.length,
    edgesCount: edges.length,
    connectionsCount: connections.length,
    width,
    height
  });

  return (
    <div className="relative" style={{ width, height }}>
      {/* Layout Switcher - top left */}
      <div className="absolute top-4 left-4 z-10">
        <LayoutSwitcher
          currentLayout={currentLayout as any}
          onLayoutChange={onLayoutChange as any}
        />
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        onNodeClick={handleNodeClick}
        nodeTypes={nodeTypes as any}
        fitView
        attributionPosition="bottom-left"
      >
        <Controls />
        <Background />
        <Panel position="top-right" className="bg-background/80 backdrop-blur-sm rounded-lg p-2">
          <div className="text-xs text-muted-foreground">
            {persons.length} people • {edges.length} connections
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
} 