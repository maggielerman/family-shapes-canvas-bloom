import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { User, Crown } from 'lucide-react';
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

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleToggleSelf = async (isSelf: boolean) => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('persons')
        .update({ is_self: isSelf })
        .eq('id', person.id);

      if (error) throw error;

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
                disabled={isUpdating}
              />
            </div>

            {!person.is_self && (
              <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
                <div className="flex items-start gap-2">
                  <Crown className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                      What does "Self" mean?
                    </p>
                    <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
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