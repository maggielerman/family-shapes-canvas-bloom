import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Search, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AddExistingPersonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  familyTreeId: string;
  onPersonAdded: () => void;
}

interface Person {
  id: string;
  name: string;
  date_of_birth?: string;
  gender?: string;
  profile_photo_url?: string;
  status: string;
  email?: string;
}

export function AddExistingPersonDialog({
  open,
  onOpenChange,
  familyTreeId,
  onPersonAdded,
}: AddExistingPersonDialogProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [persons, setPersons] = useState<Person[]>([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      searchPersons();
    }
  }, [open, searchTerm]);

  const searchPersons = async () => {
    setLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      let query = supabase
        .from('persons')
        .select('id, name, date_of_birth, gender, profile_photo_url, status, email')
        .eq('user_id', userData.user.id)
        .order('name');

      // Exclude persons already in this family tree
      const { data: existingMembers } = await supabase
        .from('family_tree_members')
        .select('person_id')
        .eq('family_tree_id', familyTreeId);

      const existingPersonIds = existingMembers?.map(m => m.person_id) || [];

      if (existingPersonIds.length > 0) {
        query = query.not('id', 'in', `(${existingPersonIds.join(',')})`);
      }

      if (searchTerm.trim()) {
        query = query.ilike('name', `%${searchTerm.trim()}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      setPersons(data || []);
    } catch (error) {
      console.error('Error searching persons:', error);
    } finally {
      setLoading(false);
    }
  };

  const addPersonToTree = async (personId: string) => {
    setAdding(personId);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const { error } = await supabase
        .from('family_tree_members')
        .insert({
          family_tree_id: familyTreeId,
          person_id: personId,
          added_by: userData.user.id,
          role: 'member'
        });

      if (error) throw error;

      toast.success('Person added to family tree');
      onPersonAdded();
      searchPersons(); // Refresh the list
    } catch (error) {
      console.error('Error adding person to tree:', error);
      toast.error('Failed to add person to tree');
    } finally {
      setAdding(null);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Add Existing Person</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 flex-1 overflow-hidden">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="overflow-y-auto flex-1 max-h-96">
            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse flex items-center space-x-3 p-3 border rounded-lg">
                    <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : persons.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Search className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No available persons found</p>
                {searchTerm && (
                  <p className="text-xs">Try adjusting your search terms</p>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {persons.map((person) => (
                  <div key={person.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={person.profile_photo_url || undefined} />
                        <AvatarFallback>
                          {getInitials(person.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium">{person.name}</h4>
                        <div className="flex items-center gap-2">
                          {person.gender && (
                            <Badge variant="secondary" className="text-xs">
                              {person.gender}
                            </Badge>
                          )}
                          <Badge variant={person.status === 'living' ? 'default' : 'secondary'} className="text-xs">
                            {person.status}
                          </Badge>
                          {person.date_of_birth && (
                            <span className="text-xs text-muted-foreground">
                              Born {formatDate(person.date_of_birth)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addPersonToTree(person.id)}
                      disabled={adding === person.id}
                    >
                      {adding === person.id ? (
                        "Adding..."
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-2" />
                          Add
                        </>
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}