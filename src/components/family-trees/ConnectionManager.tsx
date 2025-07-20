import { useState } from 'react';
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

interface ConnectionManagerProps {
  familyTreeId: string;
  connections: Connection[];
  persons: Person[];
  onConnectionUpdated: () => void;
}

export function ConnectionManager({
  familyTreeId,
  connections,
  persons,
  onConnectionUpdated
}: ConnectionManagerProps) {
  const { toast } = useToast();
  const [isAddingConnection, setIsAddingConnection] = useState(false);
  const [editingConnection, setEditingConnection] = useState<Connection | null>(null);
  const [newConnection, setNewConnection] = useState({
    from_person_id: '',
    to_person_id: '',
    relationship_type: ''
  });

  const relationshipTypes = [
    { value: "parent", label: "Parent", icon: Users, color: "hsl(var(--chart-1))" },
    { value: "child", label: "Child", icon: Baby, color: "hsl(var(--chart-2))" },
    { value: "partner", label: "Partner", icon: Heart, color: "hsl(var(--chart-3))" },
    { value: "sibling", label: "Sibling", icon: Users, color: "hsl(var(--chart-4))" },
    { value: "donor", label: "Donor", icon: Dna, color: "hsl(var(--chart-5))" },
    { value: "gestational_carrier", label: "Gestational Carrier", icon: Baby, color: "hsl(var(--chart-1))" },
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

  const handleCreateConnection = async () => {
    if (!newConnection.from_person_id || !newConnection.to_person_id || !newConnection.relationship_type) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    if (newConnection.from_person_id === newConnection.to_person_id) {
      toast({
        title: "Error",
        description: "A person cannot have a relationship with themselves",
        variant: "destructive",
      });
      return;
    }

    // Check if this exact connection already exists
    const existingConnection = connections.find(conn => 
      conn.from_person_id === newConnection.from_person_id &&
      conn.to_person_id === newConnection.to_person_id &&
      conn.relationship_type === newConnection.relationship_type
    );

    if (existingConnection) {
      toast({
        title: "Connection Already Exists",
        description: `${getPersonName(newConnection.from_person_id)} is already connected to ${getPersonName(newConnection.to_person_id)} as ${relationshipTypes.find(r => r.value === newConnection.relationship_type)?.label}`,
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('connections')
        .insert({
          from_person_id: newConnection.from_person_id,
          to_person_id: newConnection.to_person_id,
          relationship_type: newConnection.relationship_type,
          family_tree_id: familyTreeId
        });

      if (error) {
        // Handle specific database constraint errors
        if (error.code === '23505') {
          toast({
            title: "Duplicate Connection",
            description: "This connection already exists. You cannot create the same relationship twice.",
            variant: "destructive",
          });
          return;
        }
        throw error;
      }

      toast({
        title: "Success",
        description: "Connection created successfully",
      });

      setNewConnection({ from_person_id: '', to_person_id: '', relationship_type: '' });
      setIsAddingConnection(false);
      onConnectionUpdated();
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

    console.log('Updating connection:', editingConnection);
    console.log('New relationship type:', editingConnection.relationship_type);

    try {
      const { error } = await supabase
        .from('connections')
        .update({
          relationship_type: editingConnection.relationship_type
        })
        .eq('id', editingConnection.id);

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Connection updated successfully');

      toast({
        title: "Success",
        description: "Connection updated successfully",
      });

      setEditingConnection(null);
      onConnectionUpdated();
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
    if (!window.confirm("Are you sure you want to delete this connection?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from('connections')
        .delete()
        .eq('id', connectionId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Connection deleted successfully",
      });

      onConnectionUpdated();
    } catch (error) {
      console.error('Error deleting connection:', error);
      toast({
        title: "Error",
        description: "Failed to delete connection",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Link2 className="w-4 h-4" />
            Connection Management
          </CardTitle>
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
                  Define a relationship between two family members.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">From Person</label>
                  <Select
                    value={newConnection.from_person_id}
                    onValueChange={(value) => setNewConnection(prev => ({ ...prev, from_person_id: value }))}
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
                  <label className="text-sm font-medium">To Person</label>
                  <Select
                    value={newConnection.to_person_id}
                    onValueChange={(value) => setNewConnection(prev => ({ ...prev, to_person_id: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select person" />
                    </SelectTrigger>
                    <SelectContent>
                      {persons
                        .filter(person => person.id !== newConnection.from_person_id)
                        .map(person => (
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
                  <Button onClick={handleCreateConnection}>Create Connection</Button>
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
        {connections.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Link2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No connections yet. Add people to start creating relationships.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>From</TableHead>
                <TableHead>Relationship</TableHead>
                <TableHead>To</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {connections.map(connection => {
                const Icon = getRelationshipIcon(connection.relationship_type);
                return (
                  <TableRow key={connection.id}>
                    <TableCell className="font-medium">
                      {getPersonName(connection.from_person_id)}
                    </TableCell>
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
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {getPersonName(connection.to_person_id)}
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
                                Change the relationship type between {getPersonName(connection.from_person_id)} and {getPersonName(connection.to_person_id)}.
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
        )}
      </CardContent>
    </Card>
  );
}