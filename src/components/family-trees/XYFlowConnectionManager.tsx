import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, GitBranch } from 'lucide-react';
import { relationshipTypes } from './XYFlowLegend';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Person {
  id: string;
  name: string;
  date_of_birth?: string | null;
  birth_place?: string | null;
  gender?: string | null;
  profile_photo_url?: string | null;
  status: string;
  family_tree_id?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  notes?: string | null;
  donor?: boolean;
  used_ivf?: boolean;
  used_iui?: boolean;
  fertility_treatments?: any;
}

interface Connection {
  id: string;
  from_person_id: string;
  to_person_id: string;
  relationship_type: string;
  family_tree_id?: string | null;
}

interface XYFlowConnectionManagerProps {
  familyTreeId: string;
  persons: Person[];
  connections: Connection[];
  onConnectionUpdated: () => void;
}



export function XYFlowConnectionManager({ 
  familyTreeId, 
  persons, 
  connections, 
  onConnectionUpdated 
}: XYFlowConnectionManagerProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [fromPersonId, setFromPersonId] = useState<string>('');
  const [toPersonId, setToPersonId] = useState<string>('');
  const [relationshipType, setRelationshipType] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleCreateConnection = async () => {
    if (!fromPersonId || !toPersonId || !relationshipType) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    if (fromPersonId === toPersonId) {
      toast({
        title: "Error",
        description: "Cannot connect a person to themselves",
        variant: "destructive",
      });
      return;
    }

    // Check if connection already exists
    const existingConnection = connections.find(
      conn => 
        (conn.from_person_id === fromPersonId && conn.to_person_id === toPersonId) ||
        (conn.from_person_id === toPersonId && conn.to_person_id === fromPersonId)
    );

    if (existingConnection) {
      toast({
        title: "Error",
        description: "Connection already exists between these people",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('No user found');

      const { error } = await supabase
        .from('connections')
        .insert({
          from_person_id: fromPersonId,
          to_person_id: toPersonId,
          relationship_type: relationshipType,
          family_tree_id: familyTreeId,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Connection created successfully",
      });

      setDialogOpen(false);
      setFromPersonId('');
      setToPersonId('');
      setRelationshipType('');
      onConnectionUpdated();
    } catch (error) {
      console.error('Error creating connection:', error);
      toast({
        title: "Error",
        description: "Failed to create connection",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteConnection = async (connectionId: string) => {
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

  const getPersonName = (personId: string) => {
    const person = persons.find(p => p.id === personId);
    return person?.name || 'Unknown';
  };

  const getRelationshipLabel = (relationshipType: string) => {
    const relationship = relationshipTypes.find(rt => rt.value === relationshipType);
    return relationship?.label || relationshipType;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <GitBranch className="w-4 h-4" />
            Connections
          </CardTitle>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Connection
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Connection</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">From Person</label>
                  <Select value={fromPersonId} onValueChange={setFromPersonId}>
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
                  <Select value={toPersonId} onValueChange={setToPersonId}>
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
                  <Select value={relationshipType} onValueChange={setRelationshipType}>
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

                <div className="flex gap-2 pt-4">
                  <Button 
                    onClick={handleCreateConnection} 
                    disabled={isLoading || !fromPersonId || !toPersonId || !relationshipType}
                    className="flex-1"
                  >
                    {isLoading ? 'Creating...' : 'Create Connection'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setDialogOpen(false)}
                    disabled={isLoading}
                  >
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
            <GitBranch className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No connections yet</p>
            <p className="text-xs">Create connections between family members</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {connections.map(connection => {
              const relationship = relationshipTypes.find(rt => rt.value === connection.relationship_type);
              const Icon = relationship?.icon || GitBranch;
              
              return (
                <div 
                  key={connection.id} 
                  className="flex items-center justify-between p-3 rounded-lg border bg-card"
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: relationship?.color || '#6b7280' }}
                    ></div>
                    <Icon className="w-4 h-4 text-muted-foreground" />
                    <div className="text-sm">
                      <span className="font-medium">{getPersonName(connection.from_person_id)}</span>
                      <span className="text-muted-foreground mx-2">→</span>
                      <span className="font-medium">{getPersonName(connection.to_person_id)}</span>
                      <span className="text-muted-foreground ml-2">
                        ({getRelationshipLabel(connection.relationship_type)})
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteConnection(connection.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    Remove
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 