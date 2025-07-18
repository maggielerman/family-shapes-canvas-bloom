import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TreePine, Plus, X, Users, Link } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PersonTreesManagerProps {
  personId: string;
}

interface FamilyTree {
  id: string;
  name: string;
  description?: string;
  visibility: string;
}

interface Connection {
  id: string;
  from_person_id: string;
  to_person_id: string;
  relationship_type: string;
  to_person: {
    name: string;
  };
}

export function PersonTreesManager({ personId }: PersonTreesManagerProps) {
  const [personTrees, setPersonTrees] = useState<FamilyTree[]>([]);
  const [availableTrees, setAvailableTrees] = useState<FamilyTree[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [addTreeDialogOpen, setAddTreeDialogOpen] = useState(false);
  const [selectedTreeId, setSelectedTreeId] = useState<string>('');

  useEffect(() => {
    fetchPersonTrees();
    fetchAvailableTrees();
    fetchConnections();
  }, [personId]);

  const fetchPersonTrees = async () => {
    try {
      const { data, error } = await supabase
        .from('family_trees')
        .select('*')
        .eq('id', personId);

      if (error) throw error;
      setPersonTrees(data || []);
    } catch (error) {
      console.error('Error fetching person trees:', error);
    }
  };

  const fetchAvailableTrees = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const { data, error } = await supabase
        .from('family_trees')
        .select('*')
        .eq('user_id', userData.user.id)
        .order('name');

      if (error) throw error;
      setAvailableTrees(data || []);
    } catch (error) {
      console.error('Error fetching available trees:', error);
    }
  };

  const fetchConnections = async () => {
    try {
      const { data, error } = await supabase
        .from('connections')
        .select(`
          id,
          from_person_id,
          to_person_id,
          relationship_type,
          to_person:persons!connections_to_person_id_fkey(name)
        `)
        .eq('from_person_id', personId);

      if (error) throw error;
      setConnections(data || []);
    } catch (error) {
      console.error('Error fetching connections:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToTree = async () => {
    if (!selectedTreeId) return;

    try {
      const { error } = await supabase
        .from('persons')
        .update({ family_tree_id: selectedTreeId })
        .eq('id', personId);

      if (error) throw error;

      toast.success('Person added to family tree');
      setAddTreeDialogOpen(false);
      setSelectedTreeId('');
      fetchPersonTrees();
    } catch (error) {
      console.error('Error adding person to tree:', error);
      toast.error('Failed to add person to tree');
    }
  };

  const removeFromTree = async (treeId: string) => {
    try {
      const { error } = await supabase
        .from('persons')
        .update({ family_tree_id: null })
        .eq('id', personId)
        .eq('family_tree_id', treeId);

      if (error) throw error;

      toast.success('Person removed from family tree');
      fetchPersonTrees();
    } catch (error) {
      console.error('Error removing person from tree:', error);
      toast.error('Failed to remove person from tree');
    }
  };

  const getVisibilityColor = (visibility: string) => {
    switch (visibility) {
      case 'public':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'shared':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return <div className="animate-pulse space-y-4">
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
    </div>;
  }

  return (
    <div className="space-y-6">
      {/* Family Trees Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <TreePine className="h-5 w-5 mr-2" />
              Family Trees
            </CardTitle>
            <Dialog open={addTreeDialogOpen} onOpenChange={setAddTreeDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add to Tree
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add to Family Tree</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Select value={selectedTreeId} onValueChange={setSelectedTreeId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a family tree" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTrees.map((tree) => (
                        <SelectItem key={tree.id} value={tree.id}>
                          {tree.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setAddTreeDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={addToTree} disabled={!selectedTreeId}>
                      Add to Tree
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {personTrees.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <TreePine className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Not added to any family trees</p>
            </div>
          ) : (
            <div className="space-y-3">
              {personTrees.map((tree) => (
                <div key={tree.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{tree.name}</h4>
                    {tree.description && (
                      <p className="text-sm text-muted-foreground">{tree.description}</p>
                    )}
                    <Badge className={getVisibilityColor(tree.visibility)} variant="outline">
                      {tree.visibility}
                    </Badge>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeFromTree(tree.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Connections Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Link className="h-5 w-5 mr-2" />
            Connections
          </CardTitle>
        </CardHeader>
        <CardContent>
          {connections.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No family connections</p>
              <p className="text-xs">Connections are created in the tree view</p>
            </div>
          ) : (
            <div className="space-y-3">
              {connections.map((connection) => (
                <div key={connection.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{connection.to_person.name}</h4>
                    <Badge variant="secondary">{connection.relationship_type}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}