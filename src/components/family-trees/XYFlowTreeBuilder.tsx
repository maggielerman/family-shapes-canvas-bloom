import { useCallback, useEffect, useState, useMemo, useRef } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
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
import { PersonNode } from './PersonNode';
import { Person } from '@/types/person';
import { ConnectionUtils, Connection as ConnectionType, RelationshipType } from '@/types/connection';
import { RelationshipTypeHelpers } from '@/types/relationshipTypes';
import { ConnectionService } from '@/services/connectionService';
import { 
  calculateGenerations, 
  getGenerationalConnections, 
  GenerationInfo 
} from '@/utils/generationUtils';
import { LayoutSwitcher } from './layouts/LayoutSwitcher';
import { RelationshipFilter } from './layouts/RelationshipFilter';
import { TreeToolbar } from './layouts/TreeToolbar';
import { RELATIONSHIP_CATEGORIES, RelationshipCategory } from './layouts/relationshipConstants';
import { XYFlowLayoutService, LayoutResult } from './layouts/XYFlowLayoutService';

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
  const [relationshipFilters, setRelationshipFilters] = useState({
    generational: true,
    lateral: true,
    donor: true
  });
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const reactFlowRef = useRef<ReactFlowInstance | null>(null);

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

    const personNodes: Node[] = persons.map((person, index) => {
      const generationInfo = generationMap.get(person.id);
      
      // Use fallback positioning if no layout has been applied yet
      const position = {
        x: 100 + (index * 200),
        y: 100 + (index * 100)
      };
      
      return {
        id: person.id,
        type: 'personNode',
        position,
        data: { 
          person,
          generationColor: generationInfo?.color,
          generation: generationInfo?.generation
        },
      };
    });
    
    console.log('Creating nodes:', personNodes.length, 'nodes');
    setNodes(personNodes);
  }, [persons, generationMap, setNodes]);

  // Convert connections to edges
  useEffect(() => {
    if (connections.length === 0) {
      setEdges([]);
      return;
    }

    // First deduplicate all connections
    const deduplicatedConnections = ConnectionUtils.deduplicate(connections);
    
    // Then filter connections based on relationship filters
    const filteredConnections = deduplicatedConnections.filter(connection => {
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
    
    // Then filter connections to only show generational connections (parent-child)
    const connectionsForGeneration = filteredConnections.map(conn => ({
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
          strokeWidth: 3, // Increased stroke width for better visibility
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
  }, [connections, relationshipTypes, setEdges, relationshipFilters]);

  // Apply layout when nodes or edges change
  useEffect(() => {
    if (nodes.length === 0) return;

    const applyLayout = async () => {
      try {
        console.log('Applying layout with', nodes.length, 'nodes and', edges.length, 'edges');
        
        const result = await XYFlowLayoutService.applyLayout(
          nodes,
          edges,
          'dagre',
          width,
          height
        );
        
        console.log('Layout applied successfully:', result.nodes.length, 'nodes positioned');
        setNodes(result.nodes);
        setEdges(result.edges);
        
        // Fit view after layout is applied with more padding
        setTimeout(() => {
          if (reactFlowRef.current) {
            reactFlowRef.current.fitView({ padding: 0.2, minZoom: 0.1, maxZoom: 2 });
          }
        }, 100);
        
      } catch (error) {
        console.error('Layout application error:', error);
      }
    };

    applyLayout();
  }, [nodes.length, edges.length, width, height]);

  const handleRelationshipFilterChange = (category: RelationshipCategory, enabled: boolean) => {
    setRelationshipFilters(prev => ({
      ...prev,
      [category]: enabled
    }));
  };

  const handleCenterSelf = () => {
    if (!reactFlowRef.current) return;
    
    const selfPerson = persons.find(p => p.is_self);
    if (!selfPerson) return;
    
    const selfNode = nodes.find(n => n.id === selfPerson.id);
    if (selfNode) {
      reactFlowRef.current.setCenter(selfNode.position.x, selfNode.position.y, { zoom: 1.2 });
    }
  };

  const handleZoomToFit = () => {
    if (!reactFlowRef.current) return;
    reactFlowRef.current.fitView({ padding: 0.2, minZoom: 0.1, maxZoom: 2 });
  };

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

      {/* Relationship Filter - top left below layout switcher */}
      <div className="absolute top-16 left-4 z-10">
        <RelationshipFilter
          relationshipFilters={relationshipFilters}
          onRelationshipFilterChange={handleRelationshipFilterChange}
        />
      </div>

      {/* Toolbar - top right */}
      <div className="absolute top-4 right-4 z-10">
        <TreeToolbar
          persons={persons}
          currentLayout={currentLayout as any}
          onCenterSelf={handleCenterSelf}
          onZoomToFit={handleZoomToFit}
          className="bg-background/80 backdrop-blur-sm rounded-lg p-3"
        />
      </div>

      {/* Debug Panel Toggle - bottom right */}
      <div className="absolute bottom-4 right-4 z-10">
        <button
          onClick={() => setShowDebugPanel(!showDebugPanel)}
          className="bg-background/80 backdrop-blur-sm rounded-lg p-2 text-xs border"
        >
          {showDebugPanel ? 'Hide' : 'Show'} Debug
        </button>
      </div>

      <ReactFlow
        ref={reactFlowRef as any}
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        onNodeClick={handleNodeClick}
        nodeTypes={nodeTypes as any}
        fitView
        minZoom={0.1}
        maxZoom={2}
        defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
        attributionPosition="bottom-left"
      >
        <Background />
        <Panel position="top-right" className="bg-background/80 backdrop-blur-sm rounded-lg p-2">
          <div className="text-xs text-muted-foreground">
            {persons.length} people • {edges.length} connections
          </div>
        </Panel>
      </ReactFlow>

      {/* Debug Panel */}
      {showDebugPanel && (
        <div className="absolute inset-0 z-20 bg-background/95 overflow-auto">
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">XYFlow Debug Panel</h3>
              <button
                onClick={() => setShowDebugPanel(false)}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Close
              </button>
            </div>
            
            <div className="space-y-4">
              {/* State Overview */}
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-medium mb-2">State Overview</h4>
                <div className="text-sm space-y-1">
                  <div>Persons: {persons.length}</div>
                  <div>Nodes: {nodes.length}</div>
                  <div>Edges: {edges.length}</div>
                  <div>Connections: {connections.length}</div>
                  <div>Generation Map Size: {generationMap.size}</div>
                  <div>Canvas Size: {width} x {height}</div>
                </div>
              </div>

              {/* Nodes Debug */}
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-medium mb-2">Nodes ({nodes.length})</h4>
                <div className="text-sm space-y-2 max-h-40 overflow-y-auto">
                  {nodes.map((node, index) => (
                    <div key={node.id} className="border-l-2 border-primary pl-2">
                      <div><strong>ID:</strong> {node.id}</div>
                      <div><strong>Position:</strong> ({node.position.x.toFixed(0)}, {node.position.y.toFixed(0)})</div>
                      <div><strong>Type:</strong> {node.type}</div>
                      <div><strong>Person:</strong> {node.data.person?.name}</div>
                      <div><strong>Generation:</strong> {node.data.generation}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Edges Debug */}
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-medium mb-2">Edges ({edges.length})</h4>
                <div className="text-sm space-y-2 max-h-40 overflow-y-auto">
                  {edges.map((edge, index) => (
                    <div key={edge.id} className="border-l-2 border-green-500 pl-2">
                      <div><strong>ID:</strong> {edge.id}</div>
                      <div><strong>Source:</strong> {edge.source}</div>
                      <div><strong>Target:</strong> {edge.target}</div>
                      <div><strong>Type:</strong> {edge.type}</div>
                      <div><strong>Label:</strong> {edge.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Generation Map Debug */}
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-medium mb-2">Generation Map</h4>
                <div className="text-sm space-y-2 max-h-40 overflow-y-auto">
                  {Array.from(generationMap.entries()).map(([personId, info]) => (
                    <div key={personId} className="border-l-2 border-blue-500 pl-2">
                      <div><strong>Person ID:</strong> {personId}</div>
                      <div><strong>Generation:</strong> {info.generation}</div>
                      <div><strong>Color:</strong> {info.color}</div>
                      <div><strong>Depth:</strong> {info.depth}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Relationship Filters Debug */}
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-medium mb-2">Relationship Filters</h4>
                <div className="text-sm space-y-1">
                  <div>Generational: {relationshipFilters.generational ? '✅' : '❌'}</div>
                  <div>Lateral: {relationshipFilters.lateral ? '✅' : '❌'}</div>
                  <div>Donor: {relationshipFilters.donor ? '✅' : '❌'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 