import { supabase } from '@/integrations/supabase/client';
import { deduplicateConnections, getCanonicalDirection } from './relationshipUtils';

export interface Connection {
  id: string;
  from_person_id: string;
  to_person_id: string;
  relationship_type: string;
  family_tree_id?: string | null;
}

/**
 * Clean up duplicate connections in the database
 * This should be run once to fix existing data
 */
export async function cleanupDuplicateConnections() {
  try {
    console.log('Starting duplicate connection cleanup...');

    // Fetch all connections
    const { data: connections, error: fetchError } = await supabase
      .from('connections')
      .select('*');

    if (fetchError) {
      console.error('Error fetching connections:', fetchError);
      return;
    }

    if (!connections || connections.length === 0) {
      console.log('No connections found to clean up');
      return;
    }

    console.log(`Found ${connections.length} total connections`);

    // Deduplicate connections
    const uniqueConnections = deduplicateConnections(connections);
    console.log(`After deduplication: ${uniqueConnections.length} connections`);

    // Find connections to delete (those that are duplicates)
    const connectionsToDelete = connections.filter(conn => 
      !uniqueConnections.some(uniqueConn => uniqueConn.id === conn.id)
    );

    console.log(`Found ${connectionsToDelete.length} duplicate connections to delete`);

    if (connectionsToDelete.length === 0) {
      console.log('No duplicates found');
      return;
    }

    // Delete duplicate connections
    const { error: deleteError } = await supabase
      .from('connections')
      .delete()
      .in('id', connectionsToDelete.map(conn => conn.id));

    if (deleteError) {
      console.error('Error deleting duplicate connections:', deleteError);
      return;
    }

    console.log(`Successfully deleted ${connectionsToDelete.length} duplicate connections`);

    // Update remaining connections to use canonical direction
    for (const connection of uniqueConnections) {
      const canonical = getCanonicalDirection(connection.from_person_id, connection.to_person_id, connection.relationship_type);
      
      const { error: updateError } = await supabase
        .from('connections')
        .update({
          from_person_id: canonical.from_person_id,
          to_person_id: canonical.to_person_id
        })
        .eq('id', connection.id);

      if (updateError) {
        console.error('Error updating connection direction:', updateError);
      }
    }

    console.log('Successfully updated connection directions to canonical form');
    console.log('Duplicate connection cleanup completed successfully');

  } catch (error) {
    console.error('Error during duplicate connection cleanup:', error);
  }
}

/**
 * Run the cleanup function
 * This can be called from the browser console or a development script
 */
export async function runCleanup() {
  console.log('Running duplicate connection cleanup...');
  await cleanupDuplicateConnections();
  console.log('Cleanup completed');
} 