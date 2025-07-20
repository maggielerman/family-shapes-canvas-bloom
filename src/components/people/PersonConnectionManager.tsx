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

interface Person {
  id: string;
  name: string;
  gender?: string | null;
  profile_photo_url?: string | null;
}

interface Connection {
  id: string;
  from_person_id: string;
  to_person_id: string;
  relationship_type: string;
  family_tree_id?: string | null;
  direction?: 'incoming' | 'outgoing';
  other_person_name?: string;
  other_person_id?: string;
  metadata?: any; // Database JSONB field
}

interface PersonConnectionManagerProps {
  person: Person;
  onConnectionUpdated?: () => void;
}

export function PersonConnectionManager({ person, onConnectionUpdated }: PersonConnectionManagerProps) {
  const { toast } = useToast();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [availablePersons, setAvailablePersons] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingConnection, setIsAddingConnection] = useState(false);
  const [editingConnection, setEditingConnection] = useState<Connection | null>(null);
  const [newConnection, setNewConnection] = useState({
    to_person_id: '',
    relationship_type: '',
    attributes: [] as string[]
  });

  const relationshipTypes = [
    { value: "parent", label: "Parent", icon: Users, color: "hsl(var(--chart-1))" },
    { value: "child", label: "Child", icon: Baby, color: "hsl(var(--chart-2))" },
    { value: "partner", label: "Partner", icon: Heart, color: "hsl(var(--chart-3))" },
    { value: "sibling", label: "Sibling", icon: Users, color: "hsl(var(--chart-4))" },
    { value: "donor", label: "Donor", icon: Dna, color: "hsl(var(--chart-5))" },
    { value: "gestational_carrier", label: "Gestational Carrier", icon: Baby, color: "hsl(var(--chart-1))" },
  ];

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
    return availablePersons.find(p => p.id === personId)?.name || 'Unknown';
  };

  const getConnectionDisplayText = (connection: Connection) => {
    if (connection.direction === 'incoming') {
      // Someone else has a relationship TO this person
      const relationshipType = relationshipTypes.find(rt => rt.value === connection.relationship_type);
      return {
        description: `${connection.other_person_name} is ${person.name}'s ${relationshipType?.label?.toLowerCase() || connection.relationship_type}`,
        otherPersonName: connection.other_person_name || 'Unknown',
        canEdit: true // Allow editing incoming connections
      };
    } else {
      // This person has a relationship TO someone else
      return {
        description: `${person.name} is ${connection.other_person_name}'s ${relationshipTypes.find(rt => rt.value === connection.relationship_type)?.label?.toLowerCase() || connection.relationship_type}`,
        otherPersonName: connection.other_person_name || 'Unknown',
        canEdit: true // Allow editing outgoing connections
      };
    }
  };

  const getRelationshipIcon = (type: string) => {
    const relationship = relationshipTypes.find(r => r.value === type);
    return relationship?.icon || Link2;
  };

  const getRelationshipColor = (type: string) => {
    return relationshipTypes.find(r => r.value === type)?.color || "hsl(var(--muted-foreground))";
  };

  const getReciprocalRelationship = (relationshipType: string) => {
    const reciprocals: Record<string, string> = {
      'parent': 'child',
      'child': 'parent',
      'partner': 'partner',
      'sibling': 'sibling',
      'donor': 'child', // donor -> child, but child -> donor is handled separately
      'gestational_carrier': 'child' // gestational carrier -> child
    };
    return reciprocals[relationshipType];
  };
  
  // Helper function to determine reciprocal attributes
  const getReciprocalAttributes = (relationshipType: string, attributes: string[]) => {
    // Some attributes should be preserved in reciprocal relationships
    const preservedAttributes = attributes.filter(attr => {
      // Preserve biological/legal context and ART context
      return ['biological', 'adopted', 'step', 'foster', 'legal', 'intended', 'ivf', 'iui', 'donor_conceived'].includes(attr);
    });
    
    // For siblings, preserve specific sibling attributes
    if (relationshipType === 'sibling') {
      const siblingAttributes = attributes.filter(attr => 
        ['full', 'half', 'donor_sibling', 'step_sibling'].includes(attr)
      );
      return [...preservedAttributes, ...siblingAttributes];
    }
    
    return preservedAttributes;
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

      // Create the main connection
      const { error: mainError } = await supabase
        .from('connections')
        .insert({
          from_person_id: person.id,
          to_person_id: newConnection.to_person_id,
          relationship_type: newConnection.relationship_type,
          metadata: {
            attributes: newConnection.attributes
          }
        });

      if (mainError) throw mainError;

      // Create the reciprocal connection with appropriate attributes
      const reciprocalType = getReciprocalRelationship(newConnection.relationship_type);
      if (reciprocalType) {
        // For reciprocal relationships, we need to determine appropriate attributes
        const reciprocalAttributes = getReciprocalAttributes(newConnection.relationship_type, newConnection.attributes);
        
        const { error: reciprocalError } = await supabase
          .from('connections')
          .insert({
            from_person_id: newConnection.to_person_id,
            to_person_id: person.id,
          relationship_type: reciprocalType,
          metadata: {
              attributes: reciprocalAttributes
            }
          });

        if (reciprocalError) {
          console.error('Error creating reciprocal connection:', reciprocalError);
        }
      }

      // Get all family trees where this person is a member
      const { data: treeMembers, error: treeError } = await supabase
        .from('family_tree_members')
        .select('family_tree_id')
        .eq('person_id', person.id);

      if (!treeError && treeMembers && treeMembers.length > 0) {
        // Update both connections with the family tree ID from the first tree
        const familyTreeId = treeMembers[0].family_tree_id;
        
        // Update main connection
        await supabase
          .from('connections')
          .update({ family_tree_id: familyTreeId })
          .eq('from_person_id', person.id)
          .eq('to_person_id', newConnection.to_person_id)
          .eq('relationship_type', newConnection.relationship_type);

        // Update reciprocal connection
        if (reciprocalType) {
          await supabase
            .from('connections')
            .update({ family_tree_id: familyTreeId })
            .eq('from_person_id', newConnection.to_person_id)
            .eq('to_person_id', person.id)
            .eq('relationship_type', reciprocalType);
        }
      }

      toast({
        title: "Success",
        description: "Connection and reciprocal relationship created successfully",
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
      // Update the main connection
      const { error: mainError } = await supabase
        .from('connections')
        .update({
          relationship_type: editingConnection.relationship_type,
          metadata: {
            attributes: (editingConnection.metadata as any)?.attributes || []
          }
        })
        .eq('id', editingConnection.id);

      if (mainError) throw mainError;

      // Find and update the reciprocal connection
      const reciprocalType = getReciprocalRelationship(editingConnection.relationship_type);
      if (reciprocalType) {
        // Find the reciprocal connection
        const { data: reciprocalConnections, error: findError } = await supabase
          .from('connections')
          .select('id')
          .eq('from_person_id', editingConnection.direction === 'outgoing' ? editingConnection.to_person_id : editingConnection.from_person_id)
          .eq('to_person_id', editingConnection.direction === 'outgoing' ? editingConnection.from_person_id : editingConnection.to_person_id);

        if (!findError && reciprocalConnections && reciprocalConnections.length > 0) {
          // Update reciprocal connection with appropriate attributes
          const reciprocalAttributes = getReciprocalAttributes(
            editingConnection.relationship_type, 
            (editingConnection.metadata as any)?.attributes || []
          );
          
          const { error: reciprocalError } = await supabase
            .from('connections')
            .update({
              relationship_type: reciprocalType,
              metadata: {
                attributes: reciprocalAttributes
              }
            })
            .eq('id', reciprocalConnections[0].id);

          if (reciprocalError) {
            console.error('Error updating reciprocal connection:', reciprocalError);
          }
        }
      }

      toast({
        title: "Success",
        description: "Connection and reciprocal relationship updated successfully",
      });

      setEditingConnection(null);
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
      // Find the connection to get details for reciprocal deletion
      const connectionToDelete = connections.find(c => c.id === connectionId);
      
      if (connectionToDelete) {
        // Delete reciprocal connection first
        const { error: reciprocalError } = await supabase
          .from('connections')
          .delete()
          .eq('from_person_id', connectionToDelete.direction === 'outgoing' ? connectionToDelete.to_person_id : connectionToDelete.from_person_id)
          .eq('to_person_id', connectionToDelete.direction === 'outgoing' ? connectionToDelete.from_person_id : connectionToDelete.to_person_id);

        if (reciprocalError) {
          console.error('Error deleting reciprocal connection:', reciprocalError);
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
        description: "Connection and reciprocal relationship deleted successfully",
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
                      const Icon = type.icon;
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

      {connections.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Link2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No connections for {person.name} yet.</p>
          <p className="text-sm">Add connections to define relationships.</p>
        </div>
      ) : (
        <div className="space-y-4">
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
              {connections.map(connection => {
                const Icon = getRelationshipIcon(connection.relationship_type);
                const displayInfo = getConnectionDisplayText(connection);
                return (
                  <TableRow key={connection.id}>
                    <TableCell>
                      <Badge 
                        variant="secondary" 
                        className="flex items-center gap-1 w-fit"
                        style={{ 
                          backgroundColor: `${getRelationshipColor(connection.relationship_type)}20`,
                          color: getRelationshipColor(connection.relationship_type)
                        }}
                      >
                        <Icon className="w-3 h-3" />
                        {relationshipTypes.find(r => r.value === connection.relationship_type)?.label || connection.relationship_type}
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
                              onClick={() => setEditingConnection(connection)}
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
                                      const Icon = type.icon;
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
                              <div className="flex gap-2">
                                <Button onClick={handleUpdateConnection}>Update</Button>
                                <Button variant="outline" onClick={() => setEditingConnection(null)}>
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
        </div>
      )}
    </div>
  );
}