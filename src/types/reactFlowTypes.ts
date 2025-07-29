import { Node, Edge } from '@xyflow/react';
import { Person } from './person';

export interface PersonNodeData extends Record<string, unknown> {
  person: Person;
  generation: number;
  generationColor?: string;
  onClick?: () => void;
}

export interface UnionNodeData extends Record<string, unknown> {
  childId?: string;
  parentIds?: string[];
  connectionTypes?: string[];
}

export type FamilyTreeNodeType = Node<PersonNodeData | UnionNodeData>;

export interface FamilyTreeEdgeData extends Record<string, unknown> {
  relationshipType: string;
  isDonor: boolean;
}

export type FamilyTreeEdgeType = Edge<FamilyTreeEdgeData>; 