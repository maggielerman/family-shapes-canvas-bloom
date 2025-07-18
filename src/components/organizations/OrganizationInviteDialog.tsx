import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Mail, UserPlus, Loader2 } from "lucide-react";

interface OrganizationInviteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId: string;
  organizationName: string;
}

export function OrganizationInviteDialog({
  open,
  onOpenChange,
  organizationId,
  organizationName
}: OrganizationInviteDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    emails: "",
    role: "viewer",
    message: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);

    try {
      // Parse emails (split by comma, semicolon, or newline)
      const emailList = formData.emails
        .split(/[,;\n]/)
        .map(email => email.trim())
        .filter(email => email && email.includes('@'));

      if (emailList.length === 0) {
        toast({
          title: "Error",
          description: "Please enter at least one valid email address",
          variant: "destructive"
        });
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const invalidEmails = emailList.filter(email => !emailRegex.test(email));
      
      if (invalidEmails.length > 0) {
        toast({
          title: "Error",
          description: `Invalid email format: ${invalidEmails.join(", ")}`,
          variant: "destructive"
        });
        return;
      }

      let successCount = 0;
      const errors: string[] = [];

      // Create invitations for each email
      for (const email of emailList) {
        try {
          // Check if user is already a member
          const { data: existingMembership } = await supabase
            .from('organization_memberships')
            .select('id')
            .eq('organization_id', organizationId)
            .eq('user_id', user.id)
            .single();

          if (existingMembership) {
            errors.push(`${email} is already a member`);
            continue;
          }

          // Check if there's already a pending invitation
          const { data: existingInvitation } = await supabase
            .from('organization_invitations')
            .select('id')
            .eq('organization_id', organizationId)
            .eq('invitee_email', email)
            .eq('status', 'pending')
            .single();

          if (existingInvitation) {
            errors.push(`${email} already has a pending invitation`);
            continue;
          }

          // Create the invitation
          const { data: invitation, error: invitationError } = await supabase
            .from('organization_invitations')
            .insert({
              organization_id: organizationId,
              invitee_email: email,
              inviter_id: user.id,
              role: formData.role,
              status: 'pending'
            })
            .select()
            .single();

          if (invitationError) {
            errors.push(`Failed to create invitation for ${email}: ${invitationError.message}`);
            continue;
          }

          // Send the invitation email
          const { error: emailError } = await supabase.functions.invoke('send-invitation', {
            body: {
              invitationId: invitation.id,
              fromName: user.email // You might want to get the user's full name instead
            }
          });

          if (emailError) {
            errors.push(`Failed to send email to ${email}: ${emailError.message}`);
            continue;
          }

          successCount++;
        } catch (error) {
          console.error(`Error processing invitation for ${email}:`, error);
          errors.push(`Error processing ${email}: ${error}`);
        }
      }

      // Show results
      if (successCount > 0) {
        toast({
          title: "Invitations Sent",
          description: `Successfully sent ${successCount} invitation${successCount > 1 ? 's' : ''}`
        });
      }

      if (errors.length > 0) {
        toast({
          title: "Some Invitations Failed",
          description: errors.slice(0, 3).join(". ") + (errors.length > 3 ? "..." : ""),
          variant: "destructive"
        });
      }

      // Reset form and close dialog if at least one invitation was successful
      if (successCount > 0) {
        setFormData({ emails: "", role: "viewer", message: "" });
        onOpenChange(false);
      }

    } catch (error) {
      console.error('Error sending invitations:', error);
      toast({
        title: "Error",
        description: "Failed to send invitations",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Invite Members
          </DialogTitle>
          <DialogDescription>
            Invite people to join {organizationName}. They'll receive an email with instructions to accept the invitation.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="emails">Email Addresses</Label>
            <Textarea
              id="emails"
              placeholder="Enter email addresses separated by commas, semicolons, or new lines"
              value={formData.emails}
              onChange={(e) => setFormData({ ...formData, emails: e.target.value })}
              className="min-h-[100px]"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="viewer">Viewer</SelectItem>
                <SelectItem value="editor">Editor</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Personal Message (Optional)</Label>
            <Textarea
              id="message"
              placeholder="Add a personal message to the invitation..."
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Send Invitations
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}