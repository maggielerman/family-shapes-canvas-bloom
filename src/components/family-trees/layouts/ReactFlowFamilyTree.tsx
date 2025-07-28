import React, { useCallback, useMemo, forwardRef, useImperativeHandle, useRef } from 'react';
import {
  ReactFlow,
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
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
  type OnNodeDrag,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import type { 
  FamilyTreeNodeType, 
  FamilyTreeEdgeType, 
  PersonNodeData, 
  UnionNodeData 
} from '@/types/reactFlowTypes';

import { Person } from '../../../types/person';
import { Connection } from '../../../types/connection';

// Custom node components
const PersonNode = ({ data }: { data: PersonNodeData }) => {
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

const UnionNode = ({ data }: { data: UnionNodeData }) => {
  return (
    <div
      className="union-node"
      style={{
        width: '16px',
        height: '16px',
        backgroundColor: 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        border: '2px solid #6b7280',
        borderRadius: '2px',
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
      
      <div style={{ 
        width: '8px', 
        height: '2px', 
        backgroundColor: '#6b7280',
        position: 'absolute'
      }} />
      <div style={{ 
        width: '2px', 
        height: '8px', 
        backgroundColor: '#6b7280',
        position: 'absolute'
      }} />
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
      const childIds = new Set(connections.filter(c => c.relationship_type === 'parent' || c.relationship_type === 'donor').map(c => c.to_person_id));
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
          c => c.from_person_id === personId && (c.relationship_type === 'parent' || c.relationship_type === 'donor')
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

    // Create ReactFlow nodes and edges with union nodes
    const { nodes: flowNodes, edges: flowEdges } = useMemo(() => {
      const nodes: FamilyTreeNodeType[] = [];
      const edges: FamilyTreeEdgeType[] = [];

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
        const y = generation * 200; // Increased vertical spacing between generations
        
        peopleInGen.forEach((person, index) => {
          const totalInGen = peopleInGen.length;
          const x = (index - (totalInGen - 1) / 2) * 250; // Increased horizontal spacing
          
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

      // Create union nodes to handle multiple parents
      const parentChildConnections = connections.filter(c => 
        c.relationship_type === 'parent' || c.relationship_type === 'donor'
      );

      // Group children by their parent sets (not individual children)
      const parentSets = new Map<string, { parents: string[], children: string[], connectionTypes: Map<string, string> }>();
      
      // First, group all connections by child to find complete parent sets
      const childrenWithParents = new Map<string, { parents: string[], connectionTypes: Map<string, string> }>();
      
      parentChildConnections.forEach(connection => {
        const childId = connection.to_person_id;
        const parentId = connection.from_person_id;
        const connectionType = connection.relationship_type;
        
        if (!childrenWithParents.has(childId)) {
          childrenWithParents.set(childId, { 
            parents: [], 
            connectionTypes: new Map() 
          });
        }
        
        const childData = childrenWithParents.get(childId)!;
        childData.parents.push(parentId);
        childData.connectionTypes.set(parentId, connectionType);
      });
      
      // Now group children by their parent sets
      childrenWithParents.forEach((childData, childId) => {
        const sortedParents = childData.parents.sort();
        const parentSetKey = sortedParents.join('|');
        
        if (!parentSets.has(parentSetKey)) {
          parentSets.set(parentSetKey, { 
            parents: sortedParents, 
            children: [], 
            connectionTypes: new Map() 
          });
        }
        
        const parentSet = parentSets.get(parentSetKey)!;
        parentSet.children.push(childId);
        
        // Merge connection types
        childData.connectionTypes.forEach((type, parentId) => {
          parentSet.connectionTypes.set(parentId, type);
        });
      });

      // Create union nodes for parent sets with multiple parents
      parentSets.forEach((parentSet, parentSetKey) => {
        if (parentSet.parents.length > 1) {
          // Create union node for this parent set
          const unionId = `union-${parentSetKey}`;
          
          // Calculate union position between parents
          const parentNodes = parentSet.parents.map(parentId => {
            const parentPerson = persons.find(p => p.id === parentId);
            const parentGeneration = generations.get(parentId) || 0;
            const parentIndex = generationGroups[parentGeneration]?.findIndex(p => p.id === parentId) || 0;
            const totalInParentGen = generationGroups[parentGeneration]?.length || 1;
            const parentX = (parentIndex - (totalInParentGen - 1) / 2) * 250;
            return { id: parentId, x: parentX, y: parentGeneration * 200 };
          });
          
          const unionX = parentNodes.reduce((sum, parent) => sum + parent.x, 0) / parentNodes.length;
          
          // Calculate union Y position based on the parents' generation
          const parentGenerations = parentSet.parents.map(parentId => generations.get(parentId) || 0);
          const maxParentGeneration = Math.max(...parentGenerations);
          const unionY = maxParentGeneration * 200 + 100; // Position below the parent generation
          
          nodes.push({
            id: unionId,
            type: 'union',
            position: { x: unionX, y: unionY },
            data: { 
              childId: parentSet.children[0], // Keep for compatibility
              parentIds: parentSet.parents,
              connectionTypes: Array.from(parentSet.connectionTypes.values())
            },
          });

          // Create edges from parents to union
          parentSet.parents.forEach(parentId => {
            const connectionType = parentSet.connectionTypes.get(parentId) || 'parent';
            edges.push({
              id: `${parentId}-${unionId}`,
              source: parentId,
              target: unionId,
              type: 'straight',
              data: {
                relationshipType: connectionType,
                isDonor: connectionType === 'donor'
              },
              style: { 
                strokeWidth: 2, 
                stroke: connectionType === 'donor' ? '#8b5cf6' : '#3b82f6',
                strokeDasharray: connectionType === 'donor' ? '5,5' : undefined
              },
            });
          });

          // Create edges from union to all children
          parentSet.children.forEach(childId => {
            edges.push({
              id: `${unionId}-${childId}`,
              source: unionId,
              target: childId,
              type: 'straight',
              data: {
                relationshipType: 'parent',
                isDonor: false
              },
              style: { 
                strokeWidth: 2, 
                stroke: '#3b82f6'
              },
            });
          });
        } else {
          // Single parent - create direct edges to all children
          const parentId = parentSet.parents[0];
          parentSet.children.forEach(childId => {
            const connectionType = parentSet.connectionTypes.get(parentId) || 'parent';
            edges.push({
              id: `${parentId}-${childId}`,
              source: parentId,
              target: childId,
              type: 'straight',
              data: {
                relationshipType: connectionType,
                isDonor: connectionType === 'donor'
              },
              style: { 
                strokeWidth: 2, 
                stroke: connectionType === 'donor' ? '#8b5cf6' : '#3b82f6',
                strokeDasharray: connectionType === 'donor' ? '5,5' : undefined
              },
            });
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
          type: 'straight',
          data: {
            relationshipType: connection.relationship_type,
            isDonor: false
          },
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
        parentSets: Array.from(parentSets.entries()).map(([key, set]) => ({
          key,
          parents: set.parents,
          children: set.children,
          connectionTypes: Array.from(set.connectionTypes.entries())
        })),
        childrenWithParents: Array.from(childrenWithParents.entries()).map(([childId, data]) => ({
          childId,
          parents: data.parents,
          connectionTypes: Array.from(data.connectionTypes.entries())
        })),
        connections: connections.map(c => ({ 
          from: c.from_person_id, 
          to: c.to_person_id, 
          type: c.relationship_type 
        }))
      });

      return { nodes, edges };
    }, [persons, connections, generations, onPersonClick]);

    const [nodes, setNodes, onNodesChange] = useNodesState<FamilyTreeNodeType>(flowNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState<FamilyTreeEdgeType>(flowEdges);

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