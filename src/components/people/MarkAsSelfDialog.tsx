import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { User, Crown, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface MarkAsSelfDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  person: {
    id: string;
    name: string;
    profile_photo_url?: string;
    is_self?: boolean;
  };
  onPersonUpdated: () => void;
}

export function MarkAsSelfDialog({
  open,
  onOpenChange,
  person,
  onPersonUpdated,
}: MarkAsSelfDialogProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentSelfPerson, setCurrentSelfPerson] = useState<{id: string; name: string} | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && !person.is_self) {
      checkForExistingSelfPerson();
    }
  }, [open, person.is_self]);

  const checkForExistingSelfPerson = async () => {
    setLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const { data, error } = await supabase
        .from('persons')
        .select('id, name')
        .eq('user_id', userData.user.id)
        .eq('is_self', true)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        throw error;
      }

      setCurrentSelfPerson(data || null);
    } catch (error) {
      console.error('Error checking for existing self person:', error);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleToggleSelf = async (isSelf: boolean) => {
    // If trying to mark as self but someone else is already marked as self
    if (isSelf && currentSelfPerson && currentSelfPerson.id !== person.id) {
      toast.error(`Cannot mark as self. ${currentSelfPerson.name} is already marked as self. Please unmark them first.`);
      return;
    }

    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('persons')
        .update({ is_self: isSelf })
        .eq('id', person.id);

      if (error) {
        // Handle the unique constraint error specifically
        if (error.code === '23505') {
          toast.error('Another person is already marked as self. Please unmark them first.');
          return;
        }
        throw error;
      }

      toast.success(isSelf ? 'Person marked as self' : 'Person unmarked as self');
      onPersonUpdated();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating person:', error);
      toast.error('Failed to update person');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUnmarkCurrentSelf = async () => {
    if (!currentSelfPerson) return;

    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('persons')
        .update({ is_self: false })
        .eq('id', currentSelfPerson.id);

      if (error) throw error;

      toast.success(`${currentSelfPerson.name} is no longer marked as self`);
      setCurrentSelfPerson(null);
      
      // Now mark the current person as self
      await handleToggleSelf(true);
    } catch (error) {
      console.error('Error unmarking current self person:', error);
      toast.error('Failed to unmark current self person');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Mark as Self</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={person.profile_photo_url || undefined} />
              <AvatarFallback className="text-lg">
                {getInitials(person.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-semibold">{person.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                {person.is_self && (
                  <Badge variant="outline" className="text-blue-600 border-blue-600">
                    <User className="h-3 w-3 mr-1" />
                    Self
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="mark-self">Mark as Self</Label>
                <p className="text-sm text-muted-foreground">
                  This will indicate that this person represents you in the family tree.
                  {person.is_self ? ' Currently marked as self.' : ' Not currently marked as self.'}
                </p>
              </div>
              <Switch
                id="mark-self"
                checked={person.is_self || false}
                onCheckedChange={handleToggleSelf}
                disabled={isUpdating || loading || (currentSelfPerson && currentSelfPerson.id !== person.id && !person.is_self)}
              />
            </div>

            {/* Show warning if another person is already marked as self */}
            {!person.is_self && currentSelfPerson && currentSelfPerson.id !== person.id && (
              <Alert className="border-amber-200 bg-amber-50">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800">
                  <div className="space-y-3">
                    <p className="text-sm">
                      <strong>{currentSelfPerson.name}</strong> is currently marked as self. 
                      Only one person can be marked as self at a time.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleUnmarkCurrentSelf}
                      disabled={isUpdating}
                      className="border-amber-300 text-amber-800 hover:bg-amber-100"
                    >
                      {isUpdating ? 'Updating...' : `Unmark ${currentSelfPerson.name} and mark ${person.name} as self`}
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {!person.is_self && !currentSelfPerson && (
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="flex items-start gap-2">
                  <Crown className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-800">
                      What does "Self" mean?
                    </p>
                    <p className="text-xs text-blue-700 mt-1">
                      Marking a person as "Self" links them to your user account and identifies 
                      them as representing you in family trees. Only one person per user can be marked as self.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}