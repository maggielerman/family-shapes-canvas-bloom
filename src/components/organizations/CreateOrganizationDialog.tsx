import { useState } from "react";
import { useAuth } from "@/components/auth/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
import { Plus, Loader2 } from "lucide-react";

// Helper function to validate UUID format
const isValidUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

interface CreateOrganizationDialogProps {
  onOrganizationCreated: () => void;
}

const CreateOrganizationDialog = ({ onOrganizationCreated }: CreateOrganizationDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    description: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    
    try {
      // Use the new database function to create organization
      // @ts-ignore - Function exists in database
      const { data, error } = await supabase.rpc('create_organization_for_user', {
        org_name: formData.name,
        org_type: formData.type,
        org_description: formData.description || `${formData.type.replace('_', ' ')} organization`
      });

      if (error) throw error;

      // Validate that we received a valid organization ID
      if (!data || typeof data !== 'string') {
        throw new Error('Failed to create organization: Invalid response from server');
      }

      // Validate UUID format
      if (!isValidUUID(data)) {
        throw new Error('Failed to create organization: Invalid organization ID format');
      }

      toast({
        title: "Organization created",
        description: `${formData.name} has been created successfully. Complete the setup to get started.`,
      });

      setFormData({
        name: "",
        type: "",
        description: "",
      });
      setOpen(false);
      onOrganizationCreated();
      
      // Redirect to organization onboarding with validated ID
      navigate(`/organizations/${data}/onboarding`);
    } catch (error: any) {
      toast({
        title: "Error creating organization",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Create Organization
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Organization</DialogTitle>
          <DialogDescription>
            Create a new organization to manage family groups and connections. You'll be able to complete the setup after creation.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Organization Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., California Sperm Bank"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Organization Type *</Label>
            <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select organization type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sperm_bank">Sperm Bank</SelectItem>
                <SelectItem value="egg_bank">Egg Bank</SelectItem>
                <SelectItem value="fertility_clinic">Fertility Clinic</SelectItem>
                <SelectItem value="donor_community">Donor Community</SelectItem>
                <SelectItem value="support_group">Support Group</SelectItem>
                <SelectItem value="research_institution">Research Institution</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Brief description of your organization..."
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !formData.name || !formData.type}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Create & Setup
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateOrganizationDialog;