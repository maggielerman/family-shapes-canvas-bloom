import { Person } from '@/types/person';
import { Connection } from '@/types/connection';
import {
  UnionNode,
  EnhancedConnection,
  FamilyUnit,
  UnionProcessedData,
  UnionProcessingConfig,
  UnionAnalysis
} from '@/types/unionTypes';

/**
 * Default configuration for union processing
 */
const DEFAULT_CONFIG: UnionProcessingConfig = {
  minSharedChildren: 1,
  includeSingleParents: false,
  groupSiblings: true
};

/**
 * Service for processing family data to create union nodes
 */
export class UnionProcessingService {
  private config: UnionProcessingConfig;

  constructor(config: Partial<UnionProcessingConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Main processing function that transforms regular connections into union-based structure
   */
  processConnections(persons: Person[], connections: Connection[]): UnionProcessedData {
    // Step 1: Analyze the data to find potential unions
    const analysis = this.analyzeConnections(persons, connections);
    
    // Step 2: Create union nodes
    const unions = this.createUnionNodes(analysis);
    
    // Step 3: Create enhanced connections
    const enhancedConnections = this.createEnhancedConnections(persons, connections, unions);
    
    // Step 4: Create family units
    const familyUnits = this.createFamilyUnits(unions, persons, enhancedConnections);

    return {
      persons,
      unions,
      enhancedConnections,
      familyUnits,
      originalConnections: connections
    };
  }

  /**
   * Analyze connections to identify potential unions
   */
  private analyzeConnections(persons: Person[], connections: Connection[]): UnionAnalysis {
    const parentChildMap = new Map<string, string[]>();
    const childParentMap = new Map<string, string[]>();
    
    // Build parent-child mappings
    connections.forEach(connection => {
      if (connection.relationship_type === 'parent') {
        const parentId = connection.from_person_id;
        const childId = connection.to_person_id;
        
        if (parentId && childId) {
          // Add to parent->children map
          if (!parentChildMap.has(parentId)) {
            parentChildMap.set(parentId, []);
          }
          parentChildMap.get(parentId)!.push(childId);
          
          // Add to child->parents map
          if (!childParentMap.has(childId)) {
            childParentMap.set(childId, []);
          }
          childParentMap.get(childId)!.push(parentId);
        }
      }
    });

    const potentialUnions: UnionAnalysis['potentialUnions'] = [];
    const singleParents: UnionAnalysis['singleParents'] = [];
    const siblingGroups: UnionAnalysis['siblingGroups'] = [];

    // Find potential unions (parents with shared children)
    const processedParents = new Set<string>();
    
    childParentMap.forEach((parentIds, childId) => {
      if (parentIds.length >= 2) {
        // This child has multiple parents - potential union
        const parents = persons.filter(p => parentIds.includes(p.id));
        const sharedChildren = this.findSharedChildren(parentIds, parentChildMap);
        
        if (sharedChildren.length >= this.config.minSharedChildren) {
          const confidence = this.calculateUnionConfidence(parents, sharedChildren, connections);
          const suggestedType = this.suggestUnionType(parents, connections);
          
          potentialUnions.push({
            parents,
            sharedChildren,
            confidence,
            suggestedType
          });
        }
        
        // Mark these parents as processed
        parentIds.forEach(id => processedParents.add(id));
      }
    });

    // Find single parents (not part of unions)
    parentChildMap.forEach((childIds, parentId) => {
      if (!processedParents.has(parentId)) {
        const parent = persons.find(p => p.id === parentId);
        const children = persons.filter(p => childIds.includes(p.id));
        
        if (parent && children.length > 0) {
          singleParents.push({ parent, children });
        }
      }
    });

    // Find sibling groups
    const processedChildren = new Set<string>();
    childParentMap.forEach((parentIds, childId) => {
      if (!processedChildren.has(childId)) {
        const siblings = this.findSharedChildren(parentIds, parentChildMap);
        if (siblings.length > 1) {
          const commonParents = persons.filter(p => parentIds.includes(p.id));
          siblingGroups.push({
            siblings: persons.filter(p => siblings.includes(p.id)),
            commonParents
          });
          siblings.forEach(id => processedChildren.add(id));
        }
      }
    });

    return {
      potentialUnions,
      singleParents,
      siblingGroups
    };
  }

  /**
   * Find children shared between multiple parents
   */
  private findSharedChildren(parentIds: string[], parentChildMap: Map<string, string[]>): string[] {
    if (parentIds.length === 0) return [];
    
    let sharedChildren = parentChildMap.get(parentIds[0]) || [];
    
    for (let i = 1; i < parentIds.length; i++) {
      const parentChildren = parentChildMap.get(parentIds[i]) || [];
      sharedChildren = sharedChildren.filter(childId => parentChildren.includes(childId));
    }
    
    return sharedChildren;
  }

  /**
   * Calculate confidence score for a potential union
   */
  private calculateUnionConfidence(parents: Person[], children: Person[], connections: Connection[]): number {
    let confidence = 0.5; // Base confidence
    
    // Higher confidence if parents have spouse relationship
    const hasSpouseRelation = connections.some(conn => 
      ['spouse', 'partner', 'married'].includes(conn.relationship_type) &&
      ((parents.some(p => p.id === conn.from_person_id) && parents.some(p => p.id === conn.to_person_id)) ||
       (parents.some(p => p.id === conn.to_person_id) && parents.some(p => p.id === conn.from_person_id)))
    );
    
    if (hasSpouseRelation) confidence += 0.3;
    
    // Higher confidence with more shared children
    confidence += Math.min(children.length * 0.1, 0.2);
    
    return Math.min(confidence, 1.0);
  }

  /**
   * Suggest union type based on relationship data
   */
  private suggestUnionType(parents: Person[], connections: Connection[]): UnionNode['unionType'] {
    // Check for explicit relationship types
    const relationshipTypes = connections
      .filter(conn => 
        parents.some(p => p.id === conn.from_person_id || p.id === conn.to_person_id)
      )
      .map(conn => conn.relationship_type);
    
    if (relationshipTypes.some(type => ['spouse', 'married', 'husband', 'wife'].includes(type))) {
      return 'marriage';
    }
    
    if (relationshipTypes.some(type => ['partner', 'girlfriend', 'boyfriend'].includes(type))) {
      return 'partnership';
    }
    
    if (parents.some(p => p.donor) || relationshipTypes.some(type => type.includes('donor'))) {
      return 'donor_relationship';
    }
    
    return 'other';
  }

  /**
   * Create union nodes from analysis results
   */
  private createUnionNodes(analysis: UnionAnalysis): UnionNode[] {
    const unions: UnionNode[] = [];
    
    // Create unions for potential unions
    analysis.potentialUnions.forEach((potential, index) => {
      unions.push({
        id: `union_${index}_${potential.parents.map(p => p.id).join('_')}`,
        parents: potential.parents,
        unionType: potential.suggestedType
      });
    });
    
    // Create unions for single parents (if configured)
    if (this.config.includeSingleParents) {
      analysis.singleParents.forEach((single, index) => {
        unions.push({
          id: `single_union_${index}_${single.parent.id}`,
          parents: [single.parent],
          unionType: 'other'
        });
      });
    }
    
    return unions;
  }

  /**
   * Create enhanced connections that route through unions
   */
  private createEnhancedConnections(persons: Person[], connections: Connection[], unions: UnionNode[]): EnhancedConnection[] {
    const enhancedConnections: EnhancedConnection[] = [];
    const processedConnections = new Set<string>();
    
    // Create union lookup maps
    const personToUnionMap = new Map<string, string>(); // person ID -> union ID
    unions.forEach(union => {
      union.parents.forEach(parent => {
        personToUnionMap.set(parent.id, union.id);
      });
    });
    
    connections.forEach(conn => {
      const isParentChild = ['parent', 'father', 'mother', 'biological_parent', 'adoptive_parent'].includes(conn.relationship_type);
      
      if (isParentChild) {
        const parentId = conn.from_person_id;
        const childId = conn.to_person_id;
        const parentUnionId = personToUnionMap.get(parentId);
        
        if (parentUnionId) {
          // Route through union instead of direct parent-child connection
          const unionConnectionId = `${parentUnionId}_to_${childId}`;
          
          if (!processedConnections.has(unionConnectionId)) {
            enhancedConnections.push({
              id: unionConnectionId,
              fromUnionId: parentUnionId,
              toPersonId: childId,
              relationshipType: 'child',
              originalConnectionId: conn.id
            });
            processedConnections.add(unionConnectionId);
          }
        } else {
          // Keep original connection if no union exists
          enhancedConnections.push({
            id: conn.id,
            fromPersonId: conn.from_person_id,
            toPersonId: conn.to_person_id,
            relationshipType: conn.relationship_type,
            originalConnectionId: conn.id,
            attributes: conn.attributes
          });
        }
      } else {
        // Keep non-parent-child relationships as-is
        enhancedConnections.push({
          id: conn.id,
          fromPersonId: conn.from_person_id,
          toPersonId: conn.to_person_id,
          relationshipType: conn.relationship_type,
          originalConnectionId: conn.id,
          attributes: conn.attributes
        });
      }
    });
    
    return enhancedConnections;
  }

  /**
   * Create family units grouping unions with their children
   */
  private createFamilyUnits(unions: UnionNode[], persons: Person[], enhancedConnections: EnhancedConnection[]): FamilyUnit[] {
    return unions.map((union, index) => {
      // Find children of this union
      const children = enhancedConnections
        .filter(conn => conn.fromUnionId === union.id && conn.relationshipType === 'child')
        .map(conn => persons.find(p => p.id === conn.toPersonId))
        .filter(Boolean) as Person[];
      
      return {
        id: `family_unit_${index}_${union.id}`,
        union,
        children,
        familyName: union.parents[0]?.name.split(' ').pop() // Use last name of first parent
      };
    });
  }
}

/**
 * Convenience function to process connections with default configuration
 */
export function processConnectionsWithUnions(
  persons: Person[], 
  connections: Connection[], 
  config?: Partial<UnionProcessingConfig>
): UnionProcessedData {
  const service = new UnionProcessingService(config);
  return service.processConnections(persons, connections);
} 