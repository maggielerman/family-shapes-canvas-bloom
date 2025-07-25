import type { Node, Edge, BuiltInNode, BuiltInEdge } from '@xyflow/react';
import type { Person, Connection } from './person';

// Custom node data types
export type PersonNodeData = {
  person: Person;
  generation: number;
  onClick?: () => void;
};

export type UnionNodeData = {
  childId: string;
  parentIds: string[];
  connectionTypes: string[];
};

// Custom node types
export type PersonNode = Node<PersonNodeData, 'person'>;
export type UnionNode = Node<UnionNodeData, 'union'>;

// Union of all node types in our application
export type FamilyTreeNodeType = BuiltInNode | PersonNode | UnionNode;

// Custom edge data types
export type FamilyTreeEdgeData = {
  relationshipType?: string;
  isDonor?: boolean;
};

// Custom edge types
export type FamilyTreeEdge = Edge<FamilyTreeEdgeData>;

// Union of all edge types in our application
export type FamilyTreeEdgeType = BuiltInEdge | FamilyTreeEdge;

// Type guards for type safety
export function isPersonNode(node: FamilyTreeNodeType): node is PersonNode {
  return node.type === 'person';
}

export function isUnionNode(node: FamilyTreeNodeType): node is UnionNode {
  return node.type === 'union';
}

export function isFamilyTreeEdge(edge: FamilyTreeEdgeType): edge is FamilyTreeEdge {
  return edge.data !== undefined;
} 