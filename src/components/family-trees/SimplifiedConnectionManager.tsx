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

interface Person {
  id: string;
  name: string;
  date_of_birth?: string | null;
  gender?: string | null;
  profile_photo_url?: string | null;
  status: string;
  family_tree_id?: string | null;
}

interface Connection {
  id: string;
  from_person_id: string;
  to_person_id: string;
  relationship_type: string;
  family_tree_id?: string | null;
}

interface UniqueRelationship {
  id: string;
  person1_id: string;
  person1_name: string;
  person2_id: string;
  person2_name: string;
  relationship_type: string;
  description: string;
}

interface SimplifiedConnectionManagerProps {
  familyTreeId: string;
  connections: Connection[];
  persons: Person[];
  onConnectionUpdated: () => void;
}

export function SimplifiedConnectionManager({
  familyTreeId,
  connections,
  persons,
  onConnectionUpdated
}: SimplifiedConnectionManagerProps) {
  const { toast } = useToast();
  const [isAddingConnection, setIsAddingConnection] = useState(false);
  const [editingRelationship, setEditingRelationship] = useState<UniqueRelationship | null>(null);
  const [newConnection, setNewConnection] = useState({
    person1_id: '',
    person2_id: '',
    relationship_type: ''
  });

  const relationshipTypes = [
    { value: "parent", label: "Parent", icon: Users, color: "hsl(var(--chart-1))", 
      description: (p1: string, p2: string) => `${p1} is ${p2}'s parent` },
    { value: "partner", label: "Partner", icon: Heart, color: "hsl(var(--chart-3))", 
      description: (p1: string, p2: string) => `${p1} and ${p2} are partners` },
    { value: "sibling", label: "Sibling", icon: Users, color: "hsl(var(--chart-4))", 
      description: (p1: string, p2: string) => `${p1} and ${p2} are siblings` },
    { value: "donor", label: "Donor", icon: Dna, color: "hsl(var(--chart-5))", 
      description: (p1: string, p2: string) => `${p1} is ${p2}'s donor` },
    { value: "gestational_carrier", label: "Gestational Carrier", icon: Baby, color: "hsl(var(--chart-1))", 
      description: (p1: string, p2: string) => `${p1} is ${p2}'s gestational carrier` },
  ];

  const getPersonName = (personId: string) => {
    return persons.find(p => p.id === personId)?.name || 'Unknown';
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
      'donor': 'child',
      'gestational_carrier': 'child'
    };
    return reciprocals[relationshipType];
  };

  // Convert raw connections into unique relationships (deduplicating reciprocals)
  const getUniqueRelationships = (): UniqueRelationship[] => {
    const uniqueRelationships: UniqueRelationship[] = [];
    const processedPairs = new Set<string>();

    connections.forEach(connection => {
      const person1Name = getPersonName(connection.from_person_id);
      const person2Name = getPersonName(connection.to_person_id);
      
      // Create a consistent pair key (smaller ID first to avoid duplicates)
      const pairKey = [connection.from_person_id, connection.to_person_id].sort().join('-');
      
      if (!processedPairs.has(pairKey)) {
        processedPairs.add(pairKey);
        
        const relationshipType = relationshipTypes.find(rt => rt.value === connection.relationship_type);
        const description = relationshipType?.description(person1Name, person2Name) || 
          `${person1Name} is ${person2Name}'s ${connection.relationship_type}`;

        uniqueRelationships.push({
          id: connection.id,
          person1_id: connection.from_person_id,
          person1_name: person1Name,
          person2_id: connection.to_person_id,
          person2_name: person2Name,
          relationship_type: connection.relationship_type,
          description
        });
      }
    });

    return uniqueRelationships;
  };

  const handleCreateConnection = async () => {
    if (!newConnection.person1_id || !newConnection.person2_id || !newConnection.relationship_type) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    if (newConnection.person1_id === newConnection.person2_id) {
      toast({
        title: "Error",
        description: "A person cannot have a relationship with themselves",
        variant: "destructive",
      });
      return;
    }

    try {
      // Create the primary connection
      const { error: primaryError } = await supabase
        .from('connections')
        .insert({
          from_person_id: newConnection.person1_id,
          to_person_id: newConnection.person2_id,
          relationship_type: newConnection.relationship_type,
          family_tree_id: familyTreeId
        });

      if (primaryError) throw primaryError;

      // Create the reciprocal connection
      const reciprocalType = getReciprocalRelationship(newConnection.relationship_type);
      if (reciprocalType) {
        const { error: reciprocalError } = await supabase
          .from('connections')
          .insert({
            from_person_id: newConnection.person2_id,
            to_person_id: newConnection.person1_id,
            relationship_type: reciprocalType,
            family_tree_id: familyTreeId
          });

        if (reciprocalError) {
          console.error('Error creating reciprocal connection:', reciprocalError);
        }
      }

      toast({
        title: "Success",
        description: "Relationship created successfully",
      });

      setNewConnection({ person1_id: '', person2_id: '', relationship_type: '' });
      setIsAddingConnection(false);
      onConnectionUpdated();
    } catch (error) {
      console.error('Error creating connection:', error);
      toast({
        title: "Error",
        description: "Failed to create relationship",
        variant: "destructive",
      });
    }
  };

  const handleUpdateRelationship = async () => {
    if (!editingRelationship) return;

    try {
      // Update the primary connection
      const { error: primaryError } = await supabase
        .from('connections')
        .update({
          relationship_type: editingRelationship.relationship_type
        })
        .eq('from_person_id', editingRelationship.person1_id)
        .eq('to_person_id', editingRelationship.person2_id);

      if (primaryError) throw primaryError;

      // Update the reciprocal connection
      const reciprocalType = getReciprocalRelationship(editingRelationship.relationship_type);
      if (reciprocalType) {
        const { error: reciprocalError } = await supabase
          .from('connections')
          .update({
            relationship_type: reciprocalType
          })
          .eq('from_person_id', editingRelationship.person2_id)
          .eq('to_person_id', editingRelationship.person1_id);

        if (reciprocalError) {
          console.error('Error updating reciprocal connection:', reciprocalError);
        }
      }

      toast({
        title: "Success",
        description: "Relationship updated successfully",
      });

      setEditingRelationship(null);
      onConnectionUpdated();
    } catch (error) {
      console.error('Error updating relationship:', error);
      toast({
        title: "Error",
        description: "Failed to update relationship",
        variant: "destructive",
      });
    }
  };

  const handleDeleteRelationship = async (relationship: UniqueRelationship) => {
    if (!window.confirm("Are you sure you want to delete this relationship?")) {
      return;
    }

    try {
      // Delete both directions of the relationship
      const { error: primaryError } = await supabase
        .from('connections')
        .delete()
        .eq('from_person_id', relationship.person1_id)
        .eq('to_person_id', relationship.person2_id);

      if (primaryError) throw primaryError;

      const { error: reciprocalError } = await supabase
        .from('connections')
        .delete()
        .eq('from_person_id', relationship.person2_id)
        .eq('to_person_id', relationship.person1_id);

      if (reciprocalError) {
        console.error('Error deleting reciprocal connection:', reciprocalError);
      }

      toast({
        title: "Success",
        description: "Relationship deleted successfully",
      });

      onConnectionUpdated();
    } catch (error) {
      console.error('Error deleting relationship:', error);
      toast({
        title: "Error",
        description: "Failed to delete relationship",
        variant: "destructive",
      });
    }
  };

  const uniqueRelationships = getUniqueRelationships();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Link2 className="w-4 h-4" />
            Family Relationships
          </CardTitle>
          <Dialog open={isAddingConnection} onOpenChange={setIsAddingConnection}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Relationship
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Relationship</DialogTitle>
                <DialogDescription>
                  Define a relationship between two family members. The reciprocal relationship will be created automatically.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">First Person</label>
                  <Select
                    value={newConnection.person1_id}
                    onValueChange={(value) => setNewConnection(prev => ({ ...prev, person1_id: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select person" />
                    </SelectTrigger>
                    <SelectContent>
                      {persons.map(person => (
                        <SelectItem key={person.id} value={person.id}>
                          {person.name}
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
                      <SelectValue placeholder="is..." />
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
                <div>
                  <label className="text-sm font-medium">Second Person</label>
                  <Select
                    value={newConnection.person2_id}
                    onValueChange={(value) => setNewConnection(prev => ({ ...prev, person2_id: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select person" />
                    </SelectTrigger>
                    <SelectContent>
                      {persons
                        .filter(person => person.id !== newConnection.person1_id)
                        .map(person => (
                          <SelectItem key={person.id} value={person.id}>
                            {person.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Preview of the relationship */}
                {newConnection.person1_id && newConnection.person2_id && newConnection.relationship_type && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm font-medium">Relationship Preview:</p>
                    <p className="text-sm text-muted-foreground">
                      {relationshipTypes.find(rt => rt.value === newConnection.relationship_type)?.description(
                        getPersonName(newConnection.person1_id),
                        getPersonName(newConnection.person2_id)
                      )}
                    </p>
                  </div>
                )}
                
                <div className="flex gap-2">
                  <Button onClick={handleCreateConnection}>Create Relationship</Button>
                  <Button variant="outline" onClick={() => setIsAddingConnection(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {uniqueRelationships.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Link2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No relationships yet. Add people to start creating family connections.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Relationship</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {uniqueRelationships.map(relationship => {
                const Icon = getRelationshipIcon(relationship.relationship_type);
                return (
                  <TableRow key={`${relationship.person1_id}-${relationship.person2_id}`}>
                    <TableCell className="font-medium">
                      {relationship.description}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="secondary" 
                        className="flex items-center gap-1 w-fit"
                        style={{ 
                          backgroundColor: `${getRelationshipColor(relationship.relationship_type)}20`,
                          color: getRelationshipColor(relationship.relationship_type)
                        }}
                      >
                        <Icon className="w-3 h-3" />
                        {relationshipTypes.find(r => r.value === relationship.relationship_type)?.label || relationship.relationship_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Dialog 
                          open={editingRelationship?.id === relationship.id} 
                          onOpenChange={(open) => !open && setEditingRelationship(null)}
                        >
                          <DialogTrigger asChild>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => setEditingRelationship(relationship)}
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit Relationship</DialogTitle>
                              <DialogDescription>
                                Change the relationship type between {relationship.person1_name} and {relationship.person2_name}.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <label className="text-sm font-medium">Relationship Type</label>
                                <Select
                                  value={editingRelationship?.relationship_type || ''}
                                  onValueChange={(value) => setEditingRelationship(prev => 
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
                                <Button onClick={handleUpdateRelationship}>Update</Button>
                                <Button variant="outline" onClick={() => setEditingRelationship(null)}>
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDeleteRelationship(relationship)}
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
        )}
      </CardContent>
    </Card>
  );
}