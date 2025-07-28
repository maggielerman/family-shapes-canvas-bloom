import { supabase } from '@/integrations/supabase/client';
import { 
  Connection, 
  CreateConnectionData, 
  UpdateConnectionData, 
  ConnectionWithDetails,
  ConnectionUtils,
  RelationshipType
} from '@/types/connection';

export class ConnectionService {
  /**
   * Create a new connection
   */
  static async createConnection(data: CreateConnectionData): Promise<Connection> {
    // Validate input data
    const errors = ConnectionUtils.validate(data);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    // Get current user for authorization
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error('No user found');

    // Get canonical direction for bidirectional relationships
    const { from_person_id, to_person_id } = ConnectionUtils.getCanonicalDirection(
      data.from_person_id, 
      data.to_person_id, 
      data.relationship_type as RelationshipType
    );

    const { data: connection, error } = await supabase
      .from('connections')
      .insert({
        ...data,
        from_person_id,
        to_person_id,
      })
      .select()
      .single();

    if (error) {
      // Handle specific database constraint errors
      if (error.code === '23505') {
        throw new Error('This connection already exists');
      }
      throw error;
    }

    return connection as Connection;
  }

  /**
   * Create a connection with its reciprocal relationship
   * Note: We no longer create reciprocal database records since all relationships
   * are displayed as bidirectional in the UI
   */
  static async createConnectionWithReciprocal(data: CreateConnectionData): Promise<{ main: Connection; reciprocal?: Connection }> {
    // Create the main connection only
    // No longer create reciprocal database records since all relationships
    // are displayed as bidirectional in the UI
    const mainConnection = await this.createConnection(data);

    return { main: mainConnection, reciprocal: undefined };
  }

  /**
   * Get connections for a specific person (both incoming and outgoing)
   */
  static async getConnectionsForPerson(personId: string): Promise<ConnectionWithDetails[]> {
    // Get outgoing connections
    const { data: outgoingConnections, error: outgoingError } = await supabase
      .from('connections')
      .select(`
        *,
        to_person:persons(name)
      `)
      .eq('from_person_id', personId);

    if (outgoingError) throw outgoingError;

    // Get incoming connections
    const { data: incomingConnections, error: incomingError } = await supabase
      .from('connections')
      .select(`
        *,
        from_person:persons(name)
      `)
      .eq('to_person_id', personId);

    if (incomingError) throw incomingError;

    // Transform connections with details
    const outgoing = (outgoingConnections || []).map(conn => ({
      ...conn,
      direction: 'outgoing' as const,
      other_person_name: (conn as any).to_person?.name || 'Unknown',
      other_person_id: conn.to_person_id
    }));
    
    const incoming = (incomingConnections || []).map(conn => ({
      ...conn,
      direction: 'incoming' as const,
      other_person_name: (conn as any).from_person?.name || 'Unknown',
      other_person_id: conn.from_person_id
    }));

    // Combine all connections
    const allConnections = [...outgoing, ...incoming];

    // Use ConnectionUtils.deduplicate to properly handle bidirectional relationships
    return ConnectionUtils.deduplicate(allConnections) as ConnectionWithDetails[];
  }

  /**
   * Get connections for a family tree
   */
  static async getConnectionsForFamilyTree(familyTreeId: string): Promise<Connection[]> {
    // Get person IDs who are members of this family tree
    const { data: treeMembers, error: membersError } = await supabase
      .from('family_tree_members')
      .select('person_id')
      .eq('family_tree_id', familyTreeId);

    if (membersError) {
      console.error('Error fetching tree members:', membersError);
      throw membersError;
    }

    const personIds = (treeMembers || []).map(m => m.person_id);
    console.log('Family tree members found:', personIds.length, 'persons');

    if (personIds.length === 0) {
      return [];
    }

    // Fetch connections between people who are members of this tree
    const { data: connections, error: connectionsError } = await supabase
      .from('connections')
      .select('*')
      .in('from_person_id', personIds)
      .in('to_person_id', personIds);

    if (connectionsError) throw connectionsError;

    return connections as Connection[];
  }

  /**
   * Get all connections
   */
  static async getAllConnections(): Promise<Connection[]> {
    const { data, error } = await supabase
      .from('connections')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Connection[];
  }

  /**
   * Update a connection
   */
  static async updateConnection(data: UpdateConnectionData): Promise<Connection> {
    const { data: connection, error } = await supabase
      .from('connections')
      .update({
        relationship_type: data.relationship_type,
        group_id: data.group_id,
        organization_id: data.organization_id,
        notes: data.notes,
        metadata: data.metadata
      })
      .eq('id', data.id)
      .select()
      .single();

    if (error) throw error;
    return connection as Connection;
  }

  /**
   * Update a connection and its reciprocal relationship
   * Note: We no longer manage reciprocal database records since all relationships
   * are displayed as bidirectional in the UI
   */
  static async updateConnectionWithReciprocal(data: UpdateConnectionData): Promise<{ main: Connection; reciprocal?: Connection }> {
    // Update the main connection only
    // No longer manage reciprocal database records since all relationships
    // are displayed as bidirectional in the UI
    const mainConnection = await this.updateConnection(data);

    return { main: mainConnection, reciprocal: undefined };
  }

  /**
   * Delete a connection
   */
  static async deleteConnection(connectionId: string): Promise<void> {
    const { error } = await supabase
      .from('connections')
      .delete()
      .eq('id', connectionId);

    if (error) throw error;
  }

  /**
   * Delete a connection and its reciprocal relationship
   * Note: We no longer manage reciprocal database records since all relationships
   * are displayed as bidirectional in the UI
   */
  static async deleteConnectionWithReciprocal(connectionId: string): Promise<void> {
    // Delete the main connection only
    // No longer manage reciprocal database records since all relationships
    // are displayed as bidirectional in the UI
    await this.deleteConnection(connectionId);
  }

  /**
   * Check if a connection exists
   * Note: We now check both directions for ALL relationship types since all relationships
   * are displayed as bidirectional in the UI
   */
  static async connectionExists(
    fromPersonId: string, 
    toPersonId: string, 
    relationshipType: RelationshipType
  ): Promise<boolean> {
    // Check both directions for ALL relationship types since all relationships
    // are displayed as bidirectional in the UI
    const { data, error } = await supabase
      .from('connections')
      .select('id')
      .or(`and(from_person_id.eq.${fromPersonId},to_person_id.eq.${toPersonId},relationship_type.eq.${relationshipType}),and(from_person_id.eq.${toPersonId},to_person_id.eq.${fromPersonId},relationship_type.eq.${relationshipType})`);

    if (error) throw error;
    return (data || []).length > 0;
  }

  /**
   * Clean up duplicate connections for ALL relationship types
   * This method removes duplicate records for any relationship type
   */
  static async cleanupDuplicateConnections(): Promise<{ removed: number; errors: string[] }> {
    const errors: string[] = [];
    let removed = 0;

    try {
      // Get all relationship types
      const allRelationshipTypes = ['parent', 'child', 'sibling', 'half_sibling', 'step_sibling', 'partner', 'spouse', 'donor', 'biological_parent', 'social_parent', 'other'];
      
      for (const relationshipType of allRelationshipTypes) {
        const { data: connections, error } = await supabase
          .from('connections')
          .select('*')
          .eq('relationship_type', relationshipType);

        if (error) {
          errors.push(`Error fetching ${relationshipType} connections: ${error.message}`);
          continue;
        }

        if (!connections || connections.length === 0) continue;

        // Group connections by the people involved (regardless of direction)
        const connectionGroups = new Map<string, any[]>();
        
        for (const connection of connections) {
          // Create a key that's the same regardless of direction
          const key = `${connection.relationship_type}:${[connection.from_person_id, connection.to_person_id].sort().join('-')}`;
          
          if (!connectionGroups.has(key)) {
            connectionGroups.set(key, []);
          }
          connectionGroups.get(key)!.push(connection);
        }

        // Remove duplicates, keeping only the first one
        for (const [key, groupConnections] of connectionGroups) {
          if (groupConnections.length > 1) {
            // Keep the first connection, delete the rest
            const toDelete = groupConnections.slice(1);
            
            for (const connection of toDelete) {
              const { error: deleteError } = await supabase
                .from('connections')
                .delete()
                .eq('id', connection.id);

              if (deleteError) {
                errors.push(`Error deleting duplicate connection ${connection.id}: ${deleteError.message}`);
              } else {
                removed++;
              }
            }
          }
        }
      }

      return { removed, errors };
    } catch (error) {
      errors.push(`Unexpected error during cleanup: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return { removed, errors };
    }
  }

  /**
   * Debug method to check current connections for ALL relationship types
   */
  static async debugConnections(): Promise<{
    total: number;
    byType: Record<string, number>;
    duplicates: Array<{
      type: string;
      personA: string;
      personB: string;
      count: number;
      connectionIds: string[];
    }>;
  }> {
    const allRelationshipTypes = ['parent', 'child', 'sibling', 'half_sibling', 'step_sibling', 'partner', 'spouse', 'donor', 'biological_parent', 'social_parent', 'other'];
    const result = {
      total: 0,
      byType: {} as Record<string, number>,
      duplicates: [] as Array<{
        type: string;
        personA: string;
        personB: string;
        count: number;
        connectionIds: string[];
      }>
    };

    for (const relationshipType of allRelationshipTypes) {
      const { data: connections, error } = await supabase
        .from('connections')
        .select('*')
        .eq('relationship_type', relationshipType);

      if (error) {
        console.error(`Error fetching ${relationshipType} connections:`, error);
        continue;
      }

      const connectionsList = connections || [];
      result.byType[relationshipType] = connectionsList.length;
      result.total += connectionsList.length;

      // Check for duplicates
      const connectionGroups = new Map<string, any[]>();
      
      for (const connection of connectionsList) {
        // Create a key that's the same regardless of direction
        const key = `${connection.relationship_type}:${[connection.from_person_id, connection.to_person_id].sort().join('-')}`;
        if (!connectionGroups.has(key)) {
          connectionGroups.set(key, []);
        }
        connectionGroups.get(key)!.push(connection);
      }

      // Find duplicates
      for (const [key, groupConnections] of connectionGroups) {
        if (groupConnections.length > 1) {
          const [personA, personB] = key.split(':')[1].split('-');
          result.duplicates.push({
            type: relationshipType,
            personA,
            personB,
            count: groupConnections.length,
            connectionIds: groupConnections.map(c => c.id)
          });
        }
      }
    }

    return result;
  }
} 