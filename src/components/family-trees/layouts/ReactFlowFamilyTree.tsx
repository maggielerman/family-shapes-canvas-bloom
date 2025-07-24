import React, { useCallback, useMemo, forwardRef, useImperativeHandle, useRef } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
  ReactFlowProvider,
  ReactFlowInstance,
  Handle,
  Position,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { Person } from '../../../types/person';
import { Connection } from '../../../types/connection';

// Custom node components
const PersonNode = ({ data }: { data: any }) => {
  const { person, generation } = data;
  const generationColors = [
    '#e3f2fd', // Light blue for generation 0
    '#f3e5f5', // Light purple for generation 1
    '#e8f5e8', // Light green for generation 2
    '#fff3e0', // Light orange for generation 3
    '#fce4ec', // Light pink for generation 4
  ];

  const bgColor = generationColors[generation % generationColors.length] || '#f5f5f5';
  const borderColor = person.is_self ? '#ff5722' : '#3b82f6';

  return (
    <div
      className="person-node"
      style={{
        padding: '10px',
        borderRadius: '8px',
        border: `2px solid ${borderColor}`,
        backgroundColor: bgColor,
        minWidth: '120px',
        textAlign: 'center',
        fontSize: '12px',
        fontWeight: person.is_self ? 'bold' : 'normal',
        position: 'relative',
      }}
      onClick={() => data.onClick?.()}
    >
      {/* Top handle for incoming connections */}
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: '#555' }}
      />
      
      {/* Bottom handle for outgoing connections */}
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: '#555' }}
      />
      
      {/* Left handle for spouse/partner connections */}
      <Handle
        type="source"
        position={Position.Left}
        id="left"
        style={{ background: '#555' }}
      />
      
      {/* Right handle for spouse/partner connections */}
      <Handle
        type="target"
        position={Position.Right}
        id="right"
        style={{ background: '#555' }}
      />
      
      <div>{person.name}</div>
      {person.date_of_birth && (
        <div style={{ fontSize: '10px', color: '#666' }}>
          {new Date(person.date_of_birth).getFullYear()}
        </div>
      )}
    </div>
  );
};

const UnionNode = ({ data }: { data: any }) => {
  return (
    <div
      className="union-node"
      style={{
        width: '20px',
        height: '20px',
        borderRadius: '50%',
        backgroundColor: '#10b981',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: '12px',
        position: 'relative',
      }}
    >
      {/* Top handle for incoming parent connections */}
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: '#555' }}
      />
      
      {/* Bottom handle for outgoing child connections */}
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: '#555' }}
      />
      
      ♥
    </div>
  );
};

// Node types for ReactFlow
const nodeTypes = {
  person: PersonNode,
  union: UnionNode,
};

interface ReactFlowFamilyTreeProps {
  persons: Person[];
  connections: Connection[];
  width?: number;
  height?: number;
  onPersonClick?: (person: Person) => void;
}

export interface ReactFlowFamilyTreeHandle {
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  zoomFit: () => void;
  centerSelf: () => void;
}

const ReactFlowFamilyTree = forwardRef<ReactFlowFamilyTreeHandle, ReactFlowFamilyTreeProps>(
  function ReactFlowFamilyTree({ persons, connections, width = 800, height = 600, onPersonClick }, ref) {
    const reactFlowInstance = useRef<ReactFlowInstance | null>(null);

    // Calculate generations based on connections
    const generations = useMemo(() => {
      const generationMap = new Map<string, number>();
      
      // Find root (person with no parents)
      const childIds = new Set(connections.filter(c => c.relationship_type === 'parent').map(c => c.to_person_id));
      const roots = persons.filter(p => !childIds.has(p.id));
      
      // BFS to assign generations
      const queue: { personId: string; generation: number }[] = [];
      roots.forEach(root => {
        generationMap.set(root.id, 0);
        queue.push({ personId: root.id, generation: 0 });
      });

      while (queue.length > 0) {
        const { personId, generation } = queue.shift()!;
        
        // Find children
        const childConnections = connections.filter(
          c => c.from_person_id === personId && c.relationship_type === 'parent'
        );
        
        childConnections.forEach(conn => {
          if (!generationMap.has(conn.to_person_id)) {
            generationMap.set(conn.to_person_id, generation + 1);
            queue.push({ personId: conn.to_person_id, generation: generation + 1 });
          }
        });
      }

      return generationMap;
    }, [persons, connections]);

    // Create ReactFlow nodes and edges
    const { nodes: flowNodes, edges: flowEdges } = useMemo(() => {
      const nodes: Node[] = [];
      const edges: Edge[] = [];

      // Group people by generation for positioning
      const generationGroups: { [key: number]: Person[] } = {};
      persons.forEach(person => {
        const generation = generations.get(person.id) || 0;
        if (!generationGroups[generation]) {
          generationGroups[generation] = [];
        }
        generationGroups[generation].push(person);
      });

      // Create person nodes with hierarchical positioning
      Object.entries(generationGroups).forEach(([gen, peopleInGen]) => {
        const generation = parseInt(gen);
        const y = generation * 150; // Vertical spacing between generations
        
        peopleInGen.forEach((person, index) => {
          const totalInGen = peopleInGen.length;
          const x = (index - (totalInGen - 1) / 2) * 200; // Horizontal spacing
          
          nodes.push({
            id: person.id,
            type: 'person',
            position: { x, y },
            data: { 
              person, 
              generation,
              onClick: () => onPersonClick?.(person)
            },
          });
        });
      });

      // Create edges for parent-child and donor relationships
      connections.forEach(connection => {
        if (connection.relationship_type === 'parent' || connection.relationship_type === 'donor') {
          edges.push({
            id: `${connection.from_person_id}-${connection.to_person_id}`,
            source: connection.from_person_id,
            target: connection.to_person_id,
            style: { 
              strokeWidth: 2, 
              stroke: connection.relationship_type === 'donor' ? '#8b5cf6' : '#3b82f6',
              strokeDasharray: connection.relationship_type === 'donor' ? '5,5' : undefined
            },
          });
        }
      });

      // Create marriage/partner edges (horizontal connections within same generation)
      const marriageConnections = connections.filter(c => 
        c.relationship_type === 'spouse' || c.relationship_type === 'partner'
      );
      
      marriageConnections.forEach(connection => {
        edges.push({
          id: `marriage-${connection.from_person_id}-${connection.to_person_id}`,
          source: connection.from_person_id,
          target: connection.to_person_id,
          style: { 
            strokeWidth: 3, 
            stroke: '#10b981',
            strokeDasharray: connection.relationship_type === 'partner' ? '5,5' : undefined
          },
        });
      });



      console.log('ReactFlow Debug:', { 
        personsCount: persons.length, 
        connectionsCount: connections.length,
        edgesCreated: edges.length,
        nodesCreated: nodes.length,
        connections: connections.map(c => ({ 
          from: c.from_person_id, 
          to: c.to_person_id, 
          type: c.relationship_type 
        }))
      });

      return { nodes, edges };
    }, [persons, connections, generations, onPersonClick]);

    const [nodes, setNodes, onNodesChange] = useNodesState(flowNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(flowEdges);

    // Update nodes when props change
    React.useEffect(() => {
      console.log('ReactFlow useEffect:', { 
        flowNodesCount: flowNodes.length, 
        flowEdgesCount: flowEdges.length,
        currentNodesCount: nodes.length,
        currentEdgesCount: edges.length
      });
      setNodes(flowNodes);
      setEdges(flowEdges);
    }, [flowNodes, flowEdges, setNodes, setEdges]);

    const onInit = useCallback((instance: ReactFlowInstance) => {
      reactFlowInstance.current = instance;
    }, []);

    // Expose control methods via ref
    useImperativeHandle(ref, () => ({
      zoomIn: () => {
        reactFlowInstance.current?.zoomIn();
      },
      zoomOut: () => {
        reactFlowInstance.current?.zoomOut();
      },
      resetZoom: () => {
        reactFlowInstance.current?.setViewport({ x: 0, y: 0, zoom: 1 });
      },
      zoomFit: () => {
        reactFlowInstance.current?.fitView({ padding: 0.1 });
      },
      centerSelf: () => {
        const selfPerson = persons.find(p => p.is_self);
        if (selfPerson) {
          const selfNode = nodes.find(n => n.id === selfPerson.id);
          if (selfNode) {
            reactFlowInstance.current?.setCenter(selfNode.position.x, selfNode.position.y, { zoom: 1.2 });
          }
        }
      },
    }));

    return (
      <div style={{ width, height }}>
        <ReactFlowProvider>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onInit={onInit}
            nodeTypes={nodeTypes}
            fitView
            proOptions={{ hideAttribution: true }}
          >
            <Controls />
            <MiniMap />
            <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
          </ReactFlow>
        </ReactFlowProvider>
      </div>
    );
  }
);

export default ReactFlowFamilyTree; 