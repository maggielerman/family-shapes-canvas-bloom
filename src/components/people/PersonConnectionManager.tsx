import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Link2, 
  Edit, 
  Trash2, 
  Plus,
  Users,
  Heart,
  Baby,
  Dna
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { RelationshipAttributeSelector } from '@/components/family-trees/RelationshipAttributeSelector';
import { 
  getConnectionDisplayText, 
  getDisplayLabel, 
  getRelationshipIcon, 
  getRelationshipColor, 
  getReciprocalRelationship, 
  getReciprocalAttributes,
  relationshipTypes,
  type Connection,
  type RelationshipDisplayInfo
} from '@/lib/relationship-utils';

interface Person {
  id: string;
  name: string;
  gender?: string | null;
  profile_photo_url?: string | null;
}

interface PersonConnectionManagerProps {
  person: Person;
  onConnectionUpdated?: () => void;
}

export function PersonConnectionManager({ person, onConnectionUpdated }: PersonConnectionManagerProps) {
  const { toast } = useToast();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [availablePersons, setAvailablePersons] = useState<Person[]>([]);
  const [externalPersonNames, setExternalPersonNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [isAddingConnection, setIsAddingConnection] = useState(false);
  const [editingConnection, setEditingConnection] = useState<Connection | null>(null);
  const [editingAttributes, setEditingAttributes] = useState<string[]>([]);
  const [newConnection, setNewConnection] = useState({
    to_person_id: '',
    relationship_type: '',
    attributes: [] as string[]
  });
  const [showExternalConnections, setShowExternalConnections] = useState(false);



  useEffect(() => {
    fetchConnections();
    fetchAvailablePersons();
  }, [person.id]);

  const fetchConnections = async () => {
    try {
      // Get connections where this person is the 'from' person (outgoing connections)
      const { data: outgoingConnections, error: outgoingError } = await supabase
        .from('connections')
        .select(`
          *,
          to_person:persons!connections_to_person_id_fkey(name)
        `)
        .eq('from_person_id', person.id);

      if (outgoingError) throw outgoingError;

      // Get connections where this person is the 'to' person (incoming connections)
      const { data: incomingConnections, error: incomingError } = await supabase
        .from('connections')
        .select(`
          *,
          from_person:persons!connections_from_person_id_fkey(name)
        `)
        .eq('to_person_id', person.id);

      if (incomingError) throw incomingError;

      // Combine both types of connections and deduplicate reciprocal relationships
      const outgoing = (outgoingConnections || []).map(conn => ({
        ...conn,
        direction: 'outgoing' as const,
        other_person_name: conn.to_person?.name || 'Unknown',
        other_person_id: conn.to_person_id
      }));
      
      const incoming = (incomingConnections || []).map(conn => ({
        ...conn,
        direction: 'incoming' as const,
        other_person_name: conn.from_person?.name || 'Unknown',
        other_person_id: conn.from_person_id
      }));

      // For each outgoing connection, check if there's a corresponding incoming one
      // If so, only show the outgoing one to avoid duplicates
      const uniqueConnections = [];
      
      for (const outConn of outgoing) {
        // Always show outgoing connections (they represent the primary relationship)
        uniqueConnections.push(outConn);
      }
      
      for (const inConn of incoming) {
        // Only show incoming connections if there's no corresponding outgoing one
        const hasCorrespondingOutgoing = outgoing.some(outConn => 
          outConn.to_person_id === inConn.from_person_id &&
          ((outConn.relationship_type === 'sibling' && inConn.relationship_type === 'sibling') ||
           (outConn.relationship_type === 'partner' && inConn.relationship_type === 'partner') ||
           (outConn.relationship_type === 'parent' && inConn.relationship_type === 'child') ||
           (outConn.relationship_type === 'child' && inConn.relationship_type === 'parent'))
        );
        
        if (!hasCorrespondingOutgoing) {
          uniqueConnections.push(inConn);
        }
      }

      const allConnections = uniqueConnections;

      setConnections(allConnections);
      fetchExternalPersonNames(allConnections.map(c => c.id));
    } catch (error) {
      console.error('Error fetching connections:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailablePersons = async () => {
    try {
      const { data, error } = await supabase
        .from('persons')
        .select('id, name, gender, profile_photo_url')
        .neq('id', person.id);

      if (error) throw error;
      setAvailablePersons(data || []);
    } catch (error) {
      console.error('Error fetching available persons:', error);
    }
  };

  const getPersonName = (personId: string) => {
    // First check if we have the person in availablePersons
    const availablePerson = availablePersons.find(p => p.id === personId);
    if (availablePerson) {
      return availablePerson.name;
    }
    
    // Check if we have the name in externalPersonNames
    return externalPersonNames[personId] || 'Unknown';
  };

  const fetchExternalPersonNames = async (connectionIds: string[]) => {
    const externalPersonIds = new Set<string>();
    
    // Collect all external person IDs
    connections.forEach(conn => {
      if (!availablePersons.find(p => p.id === conn.from_person_id)) {
        externalPersonIds.add(conn.from_person_id);
      }
      if (!availablePersons.find(p => p.id === conn.to_person_id)) {
        externalPersonIds.add(conn.to_person_id);
      }
    });

    if (externalPersonIds.size === 0) return;

    try {
      const { data, error } = await supabase
        .from('persons')
        .select('id, name')
        .in('id', Array.from(externalPersonIds));

      if (error) throw error;

      const namesMap: Record<string, string> = {};
      (data || []).forEach(p => {
        namesMap[p.id] = p.name;
      });

      setExternalPersonNames(namesMap);
    } catch (error) {
      console.error('Error fetching external person names:', error);
    }
  };

  const getConnectionDisplayTextLocal = (connection: Connection): RelationshipDisplayInfo => {
    return getConnectionDisplayText(connection, person.name);
  };

  const getRelationshipIconLocal = (type: string) => {
    const iconName = getRelationshipIcon(type);
    switch (iconName) {
      case 'Users': return Users;
      case 'Baby': return Baby;
      case 'Heart': return Heart;
      case 'Dna': return Dna;
      default: return Link2;
    }
  };

  const getRelationshipColorLocal = (type: string) => {
    return getRelationshipColor(type);
  };

  const getDisplayLabelLocal = (connection: Connection) => {
    return getDisplayLabel(connection);
  };

  const handleCreateConnection = async () => {
    if (!newConnection.to_person_id || !newConnection.relationship_type) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    try {
      // Get current user
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('No user found');

      let fromId = person.id;
      let toId = newConnection.to_person_id;
      let relType = newConnection.relationship_type;
      let attributes = newConnection.attributes;

      // Normalize parent-child: always store as 'parent' from parent -> child
      if (relType === 'child') {
        // Swap direction and store as 'parent'
        fromId = newConnection.to_person_id;
        toId = person.id;
        relType = 'parent';
      }

      // Only create one direction for symmetric relationships
      const symmetricTypes = ['partner', 'sibling'];
      const isSymmetric = symmetricTypes.includes(relType);

      // Check for existing connection to avoid duplicates
      const { data: existing, error: existingError } = await supabase
        .from('connections')
        .select('id')
        .eq('from_person_id', fromId)
        .eq('to_person_id', toId)
        .eq('relationship_type', relType);
      if (existingError) throw existingError;
      if (existing && existing.length > 0) {
        toast({
          title: "Duplicate Connection",
          description: "This connection already exists.",
          variant: "destructive",
        });
        return;
      }

      // Create the main connection
      const { error: mainError } = await supabase
        .from('connections')
        .insert({
          from_person_id: fromId,
          to_person_id: toId,
          relationship_type: relType,
          metadata: { attributes }
        });
      if (mainError) throw mainError;

      // Only create reciprocal for symmetric relationships
      if (isSymmetric) {
        // Check for existing reciprocal
        const { data: reciprocalExisting, error: reciprocalExistingError } = await supabase
          .from('connections')
          .select('id')
          .eq('from_person_id', toId)
          .eq('to_person_id', fromId)
          .eq('relationship_type', relType);
        if (reciprocalExistingError) throw reciprocalExistingError;
        if (!reciprocalExisting || reciprocalExisting.length === 0) {
          await supabase
            .from('connections')
            .insert({
              from_person_id: toId,
              to_person_id: fromId,
              relationship_type: relType,
              metadata: { attributes }
            });
        }
      }

      // Get all family trees where this person is a member
      const { data: treeMembers, error: treeError } = await supabase
        .from('family_tree_members')
        .select('family_tree_id')
        .eq('person_id', person.id);
      if (!treeError && treeMembers && treeMembers.length > 0) {
        const familyTreeId = treeMembers[0].family_tree_id;
        // Update main connection
        await supabase
          .from('connections')
          .update({ family_tree_id: familyTreeId })
          .eq('from_person_id', fromId)
          .eq('to_person_id', toId)
          .eq('relationship_type', relType);
        // Update reciprocal if symmetric
        if (isSymmetric) {
          await supabase
            .from('connections')
            .update({ family_tree_id: familyTreeId })
            .eq('from_person_id', toId)
            .eq('to_person_id', fromId)
            .eq('relationship_type', relType);
        }
      }

      toast({
        title: "Success",
        description: "Connection created successfully",
      });

      setNewConnection({ to_person_id: '', relationship_type: '', attributes: [] });
      setIsAddingConnection(false);
      fetchConnections();
      onConnectionUpdated?.();
    } catch (error) {
      console.error('Error creating connection:', error);
      toast({
        title: "Error",
        description: "Failed to create connection",
        variant: "destructive",
      });
    }
  };

  const handleUpdateConnection = async () => {
    if (!editingConnection) return;
    try {
      let fromId = editingConnection.from_person_id;
      let toId = editingConnection.to_person_id;
      let relType = editingConnection.relationship_type;
      let attributes = editingAttributes; // Use the editingAttributes state
      // Normalize parent-child: always store as 'parent' from parent -> child
      if (relType === 'child') {
        fromId = editingConnection.to_person_id;
        toId = editingConnection.from_person_id;
        relType = 'parent';
      }
      const symmetricTypes = ['partner', 'sibling'];
      const isSymmetric = symmetricTypes.includes(relType);
      // Update the main connection
      const { error: mainError } = await supabase
        .from('connections')
        .update({
          relationship_type: relType,
          metadata: { attributes }
        })
        .eq('id', editingConnection.id);
      if (mainError) throw mainError;
      // Update reciprocal if symmetric
      if (isSymmetric) {
        const { data: reciprocalConnections, error: findError } = await supabase
          .from('connections')
          .select('id')
          .eq('from_person_id', toId)
          .eq('to_person_id', fromId)
          .eq('relationship_type', relType);
        if (!findError && reciprocalConnections && reciprocalConnections.length > 0) {
          await supabase
            .from('connections')
            .update({
              relationship_type: relType,
              metadata: { attributes }
            })
            .eq('id', reciprocalConnections[0].id);
        }
      }
      toast({
        title: "Success",
        description: "Connection updated successfully",
      });
      setEditingConnection(null);
      setEditingAttributes([]);
      fetchConnections();
      onConnectionUpdated?.();
    } catch (error) {
      console.error('Error updating connection:', error);
      toast({
        title: "Error",
        description: "Failed to update connection",
        variant: "destructive",
      });
    }
  };

  const handleDeleteConnection = async (connectionId: string) => {
    if (!window.confirm("Are you sure you want to delete this connection? This will also remove the reciprocal relationship.")) {
      return;
    }
    try {
      const connectionToDelete = connections.find(c => c.id === connectionId);
      if (connectionToDelete) {
        let fromId = connectionToDelete.from_person_id;
        let toId = connectionToDelete.to_person_id;
        let relType = connectionToDelete.relationship_type;
        // Normalize parent-child: always store as 'parent' from parent -> child
        if (relType === 'child') {
          fromId = connectionToDelete.to_person_id;
          toId = connectionToDelete.from_person_id;
          relType = 'parent';
        }
        const symmetricTypes = ['partner', 'sibling'];
        const isSymmetric = symmetricTypes.includes(relType);
        // Delete reciprocal if symmetric
        if (isSymmetric) {
          const { error: reciprocalError } = await supabase
            .from('connections')
            .delete()
            .eq('from_person_id', toId)
            .eq('to_person_id', fromId)
            .eq('relationship_type', relType);
          if (reciprocalError) {
            console.error('Error deleting reciprocal connection:', reciprocalError);
          }
        }
      }
      // Delete the main connection
      const { error } = await supabase
        .from('connections')
        .delete()
        .eq('id', connectionId);
      if (error) throw error;
      toast({
        title: "Success",
        description: "Connection deleted successfully",
      });
      fetchConnections();
      onConnectionUpdated?.();
    } catch (error) {
      console.error('Error deleting connection:', error);
      toast({
        title: "Error",
        description: "Failed to delete connection",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading connections...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium flex items-center gap-2">
          <Link2 className="w-4 h-4" />
          Relationships from {person.name}
        </h4>
        <Dialog open={isAddingConnection} onOpenChange={setIsAddingConnection}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Connection
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Connection</DialogTitle>
              <DialogDescription>
                Define a relationship from {person.name} to another person.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">To Person</label>
                <Select
                  value={newConnection.to_person_id}
                  onValueChange={(value) => setNewConnection(prev => ({ ...prev, to_person_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select person" />
                  </SelectTrigger>
                  <SelectContent>
                    {availablePersons.map(availablePerson => (
                      <SelectItem key={availablePerson.id} value={availablePerson.id}>
                        {availablePerson.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Relationship Type</label>
                <Select
                  value={newConnection.relationship_type}
                  onValueChange={(value) => setNewConnection(prev => ({ ...prev, relationship_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select relationship" />
                  </SelectTrigger>
                  <SelectContent>
                    {relationshipTypes.map(type => {
                      const Icon = getRelationshipIconLocal(type.value);
                      return (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4" />
                            {type.label}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Attribute Selector */}
              {newConnection.relationship_type && (
                <RelationshipAttributeSelector
                  relationshipType={newConnection.relationship_type}
                  selectedAttributes={newConnection.attributes}
                  onAttributesChange={(attributes) => setNewConnection(prev => ({ ...prev, attributes }))}
                />
              )}
              
              <div className="flex gap-2">
                <Button onClick={handleCreateConnection}>Create Connection</Button>
                <Button variant="outline" onClick={() => setIsAddingConnection(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      {/* Prepare for external connections pattern */}
      {(() => {
        const allPersonIds = new Set([person.id, ...availablePersons.map(p => p.id)]);
        const inTreeConnections = connections.filter(c => allPersonIds.has(c.from_person_id) && allPersonIds.has(c.to_person_id));
        const externalConnections = connections.filter(c => !allPersonIds.has(c.from_person_id) || !allPersonIds.has(c.to_person_id));
        if (connections.length === 0) {
          return (
            <div className="text-center py-8 text-muted-foreground">
              <Link2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No connections for {person.name} yet.</p>
              <p className="text-sm">Add connections to define relationships.</p>
            </div>
          );
        }
        return (
          <>
            <div className="text-sm text-muted-foreground mb-4">
              Showing both outgoing connections (relationships {person.name} has to others) and incoming connections (relationships others have to {person.name}).
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Relationship</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inTreeConnections.map(connection => {
                  const Icon = getRelationshipIconLocal(connection.relationship_type);
                  const displayInfo = getConnectionDisplayTextLocal(connection);
                  return (
                    <TableRow key={connection.id}>
                      <TableCell>
                        <Badge 
                          variant="secondary" 
                          className="flex items-center gap-1 w-fit"
                          style={{ 
                            backgroundColor: `${getRelationshipColorLocal(connection.relationship_type)}20`,
                            color: getRelationshipColorLocal(connection.relationship_type)
                          }}
                        >
                          <Icon className="w-3 h-3" />
                          {getDisplayLabelLocal(connection)}
                          {connection.direction === 'incoming' && (
                            <span className="text-xs opacity-70">(incoming)</span>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {displayInfo.description}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Dialog 
                            open={editingConnection?.id === connection.id} 
                            onOpenChange={(open) => !open && setEditingConnection(null)}
                          >
                            <DialogTrigger asChild>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => {
                                  setEditingConnection(connection);
                                  setEditingAttributes((connection.metadata as any)?.attributes || []);
                                }}
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Edit Connection</DialogTitle>
                                <DialogDescription>
                                  Change the relationship type between {person.name} and {displayInfo.otherPersonName}.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <label className="text-sm font-medium">Relationship Type</label>
                                  <Select
                                    value={editingConnection?.relationship_type || ''}
                                    onValueChange={(value) => setEditingConnection(prev => 
                                      prev ? { ...prev, relationship_type: value } : null
                                    )}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select relationship" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {relationshipTypes.map(type => {
                                        const Icon = getRelationshipIconLocal(type.value);
                                        return (
                                          <SelectItem key={type.value} value={type.value}>
                                            <div className="flex items-center gap-2">
                                              <Icon className="w-4 h-4" />
                                              {type.label}
                                            </div>
                                          </SelectItem>
                                        );
                                      })}
                                    </SelectContent>
                                  </Select>
                                </div>
                                
                                {/* Attribute Selector for editing */}
                                {editingConnection?.relationship_type && (
                                  <RelationshipAttributeSelector
                                    relationshipType={editingConnection.relationship_type}
                                    selectedAttributes={editingAttributes}
                                    onAttributesChange={setEditingAttributes}
                                  />
                                )}
                                
                                <div className="flex gap-2">
                                  <Button onClick={handleUpdateConnection}>Update</Button>
                                  <Button variant="outline" onClick={() => {
                                    setEditingConnection(null);
                                    setEditingAttributes([]);
                                  }}>
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleDeleteConnection(connection.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            {externalConnections.length > 0 && (
              <div className="mt-4">
                <button className="text-sm text-blue-600 underline" onClick={() => setShowExternalConnections(true)}>
                  +{externalConnections.length} connection{externalConnections.length > 1 ? 's' : ''} to people outside this tree
                </button>
                {showExternalConnections && (
                  <div className="mt-2 p-2 border rounded bg-muted">
                    <h4 className="font-medium mb-2">External Connections</h4>
                    <ul className="space-y-1">
                      {externalConnections.map(conn => {
                        return (
                          <li key={conn.id} className="text-sm">
                            {getPersonName(conn.from_person_id)} → {getPersonName(conn.to_person_id)} ({conn.relationship_type})
                          </li>
                        );
                      })}
                    </ul>
                    <button className="mt-2 text-xs text-blue-600 underline" onClick={() => setShowExternalConnections(false)}>
                      Hide
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        );
      })()}
    </div>
  );
}