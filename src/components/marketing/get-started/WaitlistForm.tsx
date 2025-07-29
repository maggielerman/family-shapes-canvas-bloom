import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { organizationFeatures } from "./OrganizationFeatures";
import SecondaryCTAs from "./SecondaryCTAs";

interface WaitlistFormData {
  organizationName: string;
  contactName: string;
  email: string;
  organizationType: string;
  otherOrganizationType: string;
  needs: string;
  features: string[];
}

interface WaitlistFormProps {
  onSuccess?: () => void;
}

const organizationTypes = [
  "Traditional Cryobank",
  "Cryostorage Startup", 
  "Donor-Matching Startup",
  "Other"
];

export default function WaitlistForm({ 
  onSuccess
}: WaitlistFormProps) {
  const [formData, setFormData] = useState<WaitlistFormData>({
    organizationName: "",
    contactName: "",
    email: "",
    organizationType: "",
    otherOrganizationType: "",
    needs: "",
    features: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const selectedFeatures = organizationFeatures
        .filter(feature => formData.features.includes(feature.id))
        .map(feature => feature.label)
        .join(', ');

      const organizationTypeDisplay = formData.organizationType === "Other" 
        ? formData.otherOrganizationType 
        : formData.organizationType;

      const { error } = await supabase.functions.invoke('send-contact-form', {
        body: {
          name: formData.contactName,
          email: formData.email,
          subject: "Cryobank/Clinic Waitlist Request",
          message: `Organization: ${formData.organizationName}\nOrganization Type: ${organizationTypeDisplay}\nContact: ${formData.contactName}\nEmail: ${formData.email}\n\nFeatures of Interest: ${selectedFeatures || 'None specified'}\n\nAdditional Needs: ${formData.needs || "Not specified"}`
        }
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Thank you!",
        description: "We've received your waitlist request and will contact you when organization features are available.",
      });

      // Reset form
      setFormData({
        organizationName: "",
        contactName: "",
        email: "",
        organizationType: "",
        otherOrganizationType: "",
        needs: "",
        features: []
      });

      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error submitting waitlist form:', error);
      toast({
        title: "Error",
        description: "Failed to submit your request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="responsive-text-lg flex items-center gap-2">
          <Clock className="w-5 h-5 text-coral-600" />
          Join the Waitlist
        </CardTitle>
        <CardDescription className="responsive-text-sm">
          Be among the first to access our organization features when they launch.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="organizationName">Organization Name *</Label>
              <Input
                id="organizationName"
                value={formData.organizationName}
                onChange={(e) => setFormData(prev => ({ ...prev, organizationName: e.target.value }))}
                required
                placeholder="Enter your organization name"
              />
            </div>
            <div>
              <Label htmlFor="organizationType">Organization Type *</Label>
              <Select 
                value={formData.organizationType} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, organizationType: value }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your organization type" />
                </SelectTrigger>
                <SelectContent>
                  {organizationTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {formData.organizationType === "Other" && (
              <div>
                <Label htmlFor="otherOrganizationType">Please specify your organization type *</Label>
                <Input
                  id="otherOrganizationType"
                  value={formData.otherOrganizationType}
                  onChange={(e) => setFormData(prev => ({ ...prev, otherOrganizationType: e.target.value }))}
                  required
                  placeholder="Enter your organization type"
                />
              </div>
            )}
            <div>
              <Label htmlFor="contactName">Contact Name *</Label>
              <Input
                id="contactName"
                value={formData.contactName}
                onChange={(e) => setFormData(prev => ({ ...prev, contactName: e.target.value }))}
                required
                placeholder="Enter your name"
              />
            </div>
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                required
                placeholder="Enter your email"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="needs">Additional needs or requirements (Optional)</Label>
            <Textarea
              id="needs"
              value={formData.needs}
              onChange={(e) => setFormData(prev => ({ ...prev, needs: e.target.value }))}
              placeholder="Tell us about any specific requirements or questions you have..."
              rows={3}
            />
          </div>
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Submitting..." : "Join Waitlist"}
          </Button>
        </form>
        
        <SecondaryCTAs />
      </CardContent>
    </Card>
  );
} 