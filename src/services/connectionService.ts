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
   */
  static async createConnectionWithReciprocal(data: CreateConnectionData): Promise<{ main: Connection; reciprocal?: Connection }> {
    // Create the main connection
    const mainConnection = await this.createConnection(data);

    // Create reciprocal connection if applicable
    const reciprocalType = ConnectionUtils.getReciprocalType(data.relationship_type as RelationshipType);
    let reciprocalConnection: Connection | undefined;

    if (reciprocalType && reciprocalType !== data.relationship_type) {
      try {
        const reciprocalData: CreateConnectionData = {
          from_person_id: data.to_person_id,
          to_person_id: data.from_person_id,
          relationship_type: reciprocalType,
          family_tree_id: data.family_tree_id,
          group_id: data.group_id,
          organization_id: data.organization_id,
          notes: data.notes,
          metadata: data.metadata
        };

        reciprocalConnection = await this.createConnection(reciprocalData);
      } catch (error) {
        console.error('Failed to create reciprocal connection:', error);
        // Don't throw here - the main connection was created successfully
      }
    }

    return { main: mainConnection, reciprocal: reciprocalConnection };
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

    // Transform and deduplicate
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

    // Deduplicate reciprocal relationships
    const uniqueConnections: ConnectionWithDetails[] = [];
    
    for (const outConn of outgoing) {
      uniqueConnections.push(outConn);
    }
    
    for (const inConn of incoming) {
      // Only show incoming connections if there's no corresponding outgoing one
      const hasCorrespondingOutgoing = outgoing.some(outConn => 
        outConn.to_person_id === inConn.from_person_id &&
        ConnectionUtils.areEquivalent(outConn, inConn)
      );
      
      if (!hasCorrespondingOutgoing) {
        uniqueConnections.push(inConn);
      }
    }

    return uniqueConnections;
  }

  /**
   * Get connections for a family tree
   */
  static async getConnectionsForFamilyTree(familyTreeId: string): Promise<Connection[]> {
    // Fetch connections directly associated with this family tree
    const { data: treeConnections, error: treeError } = await supabase
      .from('connections')
      .select('*')
      .eq('family_tree_id', familyTreeId);

    if (treeError) throw treeError;

    // Get person IDs who are members of this family tree
    const { data: treeMembers, error: membersError } = await supabase
      .from('family_tree_members')
      .select('person_id')
      .eq('family_tree_id', familyTreeId);

    if (membersError) throw membersError;

    const personIds = (treeMembers || []).map(m => m.person_id);

    // Fetch connections between people who are members of this tree (but don't have family_tree_id set)
    const { data: memberConnections, error: memberError } = await supabase
      .from('connections')
      .select('*')
      .is('family_tree_id', null)
      .in('from_person_id', personIds)
      .in('to_person_id', personIds);

    if (memberError) throw memberError;

    // Combine and deduplicate connections
    const allConnections = [...(treeConnections || []), ...(memberConnections || [])];
    const uniqueConnections = allConnections.filter((conn, index, self) => 
      index === self.findIndex(c => c.id === conn.id)
    );

    return uniqueConnections as Connection[];
  }

  /**
   * Update a connection
   */
  static async updateConnection(data: UpdateConnectionData): Promise<Connection> {
    const { data: connection, error } = await supabase
      .from('connections')
      .update({
        relationship_type: data.relationship_type,
        family_tree_id: data.family_tree_id,
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
   */
  static async updateConnectionWithReciprocal(data: UpdateConnectionData): Promise<{ main: Connection; reciprocal?: Connection }> {
    // Update the main connection
    const mainConnection = await this.updateConnection(data);

    // Find and update the reciprocal connection
    const reciprocalType = ConnectionUtils.getReciprocalType(data.relationship_type as RelationshipType);
    let reciprocalConnection: Connection | undefined;

    if (reciprocalType && data.relationship_type) {
      try {
        // Find the reciprocal connection
        const { data: reciprocalConnections, error: findError } = await supabase
          .from('connections')
          .select('*')
          .eq('from_person_id', mainConnection.to_person_id)
          .eq('to_person_id', mainConnection.from_person_id)
          .eq('relationship_type', reciprocalType);

        if (!findError && reciprocalConnections && reciprocalConnections.length > 0) {
          const reciprocalData: UpdateConnectionData = {
            id: reciprocalConnections[0].id,
            relationship_type: reciprocalType,
            family_tree_id: data.family_tree_id,
            group_id: data.group_id,
            organization_id: data.organization_id,
            notes: data.notes,
            metadata: data.metadata
          };

          reciprocalConnection = await this.updateConnection(reciprocalData);
        }
      } catch (error) {
        console.error('Failed to update reciprocal connection:', error);
      }
    }

    return { main: mainConnection, reciprocal: reciprocalConnection };
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
   */
  static async deleteConnectionWithReciprocal(connectionId: string): Promise<void> {
    // Get the connection details first
    const { data: connection, error: fetchError } = await supabase
      .from('connections')
      .select('*')
      .eq('id', connectionId)
      .single();

    if (fetchError) throw fetchError;

    // Delete reciprocal connection first
    const reciprocalType = ConnectionUtils.getReciprocalType(connection.relationship_type as RelationshipType);
    if (reciprocalType) {
      try {
        await supabase
          .from('connections')
          .delete()
          .eq('from_person_id', connection.to_person_id)
          .eq('to_person_id', connection.from_person_id)
          .eq('relationship_type', reciprocalType);
      } catch (error) {
        console.error('Failed to delete reciprocal connection:', error);
      }
    }

    // Delete the main connection
    await this.deleteConnection(connectionId);
  }

  /**
   * Check if a connection exists
   */
  static async connectionExists(
    fromPersonId: string, 
    toPersonId: string, 
    relationshipType: RelationshipType,
    familyTreeId?: string
  ): Promise<boolean> {
    let query = supabase
      .from('connections')
      .select('id')
      .eq('from_person_id', fromPersonId)
      .eq('to_person_id', toPersonId)
      .eq('relationship_type', relationshipType);

    if (familyTreeId) {
      query = query.eq('family_tree_id', familyTreeId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return (data || []).length > 0;
  }
} 