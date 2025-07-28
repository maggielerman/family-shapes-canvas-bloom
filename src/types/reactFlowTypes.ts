import { Node, Edge } from '@xyflow/react';
import { Person } from './person';

export interface PersonNodeData {
  person: Person;
  generation: number;
  onClick?: () => void;
}

export interface UnionNodeData {
  childId?: string;
  parentIds?: string[];
  connectionTypes?: string[];
}

export type FamilyTreeNodeType = Node<PersonNodeData | UnionNodeData>;

export interface FamilyTreeEdgeData {
  relationshipType: string;
  isDonor: boolean;
}

export type FamilyTreeEdgeType = Edge<FamilyTreeEdgeData>; 