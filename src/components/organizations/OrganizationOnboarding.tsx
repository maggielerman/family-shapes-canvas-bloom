import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Progress } from "@/components/ui/progress";
import { Building2, CheckCircle, ArrowRight, Loader2 } from "lucide-react";

interface Organization {
  id: string;
  name: string;
  type: string;
  description: string | null;
  subdomain: string;
  slug: string;
}

interface OrganizationOnboardingProps {
  organizationId: string;
}

const OrganizationOnboarding = ({ organizationId }: OrganizationOnboardingProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  const [formData, setFormData] = useState({
    type: "",
    description: "",
    website: "",
    location: "",
    contactEmail: "",
    phone: "",
  });

  useEffect(() => {
    fetchOrganization();
  }, [organizationId]);

  const fetchOrganization = async () => {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', organizationId)
        .single();

      if (error) throw error;
      
      setOrganization(data);
      setFormData(prev => ({
        ...prev,
        type: data.type || "",
        description: data.description || "",
      }));
    } catch (error) {
      console.error('Error fetching organization:', error);
      toast({
        title: "Error",
        description: "Failed to load organization details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateOrganization = async () => {
    if (!organization) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('organizations')
        .update({
          type: formData.type,
          description: formData.description,
          settings: {
            website: formData.website,
            location: formData.location,
            contact_email: formData.contactEmail,
            phone: formData.phone,
          }
        })
        .eq('id', organization.id);

      if (error) throw error;

      toast({
        title: "Organization updated",
        description: "Your organization details have been saved successfully.",
      });

      return true;
    } catch (error) {
      console.error('Error updating organization:', error);
      toast({
        title: "Error",
        description: "Failed to update organization details",
        variant: "destructive",
      });
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleNext = async () => {
    if (currentStep === 2) {
      const success = await updateOrganization();
      if (!success) return;
    }

    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete onboarding
      navigate(`/organizations/${organizationId}`);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const progressPercentage = (currentStep / totalSteps) * 100;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Building2 className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-light">Welcome to Family Shapes</h1>
            <p className="text-muted-foreground">Let's set up your organization</p>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Step {currentStep} of {totalSteps}</span>
            <span>{Math.round(progressPercentage)}% Complete</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {currentStep === 1 && "Organization Type"}
            {currentStep === 2 && "Organization Details"}
            {currentStep === 3 && "Setup Complete"}
          </CardTitle>
          <CardDescription>
            {currentStep === 1 && "Choose the type that best describes your organization"}
            {currentStep === 2 && "Provide additional information about your organization"}
            {currentStep === 3 && "Your organization is ready to use"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {currentStep === 1 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="type">Organization Type *</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select organization type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fertility_clinic">Fertility Clinic</SelectItem>
                    <SelectItem value="sperm_bank">Sperm Bank</SelectItem>
                    <SelectItem value="egg_bank">Egg Bank</SelectItem>
                    <SelectItem value="donor_community">Donor Community</SelectItem>
                    <SelectItem value="support_group">Support Group</SelectItem>
                    <SelectItem value="research_institution">Research Institution</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of your organization..."
                  rows={3}
                />
              </div>
            </>
          )}

          {currentStep === 2 && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                    placeholder="https://example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="City, State"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Contact Email</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
                    placeholder="contact@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>
            </>
          )}

          {currentStep === 3 && (
            <div className="text-center space-y-4">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
              <div>
                <h3 className="text-xl font-semibold mb-2">
                  🎉 Your organization is ready!
                </h3>
                <p className="text-muted-foreground mb-4">
                  <strong>{organization?.name}</strong> has been set up successfully.
                </p>
              </div>
              
              <div className="bg-muted p-4 rounded-lg text-left space-y-2">
                <h4 className="font-medium">Next steps:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Invite team members to your organization</li>
                  <li>• Set up your donor database</li>
                  <li>• Configure privacy and security settings</li>
                  <li>• Create sibling groups for donor families</li>
                </ul>
              </div>
            </div>
          )}

          <div className="flex justify-between pt-6">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
            >
              Previous
            </Button>
            
            <Button
              onClick={handleNext}
              disabled={saving || (currentStep === 1 && !formData.type)}
            >
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {currentStep === totalSteps ? 'Go to Dashboard' : 'Next'}
              {currentStep < totalSteps && <ArrowRight className="w-4 h-4 ml-2" />}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrganizationOnboarding;