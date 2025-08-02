import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface RecipientFormData {
  fullName: string;
  email: string;
  relationshipType: string;
  otherRelationshipType: string;
  donorInfo: string;
  location: string;
  interests: string;
  story: string;
}

interface RecipientDialogProps {
  children: React.ReactNode;
}

const relationshipTypes = [
  "Donor Conceived Adult",
  "Parent via Donor Conception",
  "Single Mother by Choice",
  "Same-Sex Couple",
  "Fertility Clinic Patient",
  "Other"
];

export default function RecipientDialog({ children }: RecipientDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<RecipientFormData>({
    fullName: "",
    email: "",
    relationshipType: "",
    otherRelationshipType: "",
    donorInfo: "",
    location: "",
    interests: "",
    story: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const relationshipTypeDisplay = formData.relationshipType === "Other" 
        ? formData.otherRelationshipType 
        : formData.relationshipType;

      const { error } = await supabase.functions.invoke('send-contact-form', {
        body: {
          name: formData.fullName,
          email: formData.email,
          subject: "Recipient Private Beta Request",
          message: `Name: ${formData.fullName}\nEmail: ${formData.email}\nRelationship Type: ${relationshipTypeDisplay}\nLocation: ${formData.location}\n\nDonor Information: ${formData.donorInfo || 'Not provided'}\n\nInterests: ${formData.interests || 'Not specified'}\n\nStory: ${formData.story || 'Not provided'}`
        }
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Thank you!",
        description: "We've received your private beta request and will contact you when access is available.",
      });

      // Reset form and close dialog
      setFormData({
        fullName: "",
        email: "",
        relationshipType: "",
        otherRelationshipType: "",
        donorInfo: "",
        location: "",
        interests: "",
        story: ""
      });
      setIsOpen(false);
    } catch (error) {
      console.error('Error submitting recipient form:', error);
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
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="responsive-dialog max-w-2xl">
        <DialogHeader>
          <DialogTitle className="responsive-dialog-title flex items-center gap-2">
            <Users className="w-5 h-5" />
            Join the Private Beta
          </DialogTitle>
          <DialogDescription className="responsive-dialog-description">
            Be among the first to access our recipient features when they launch.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Line 1: Full Name and Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                required
                placeholder="Enter your full name"
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

          {/* Line 2: Relationship Type and Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="relationshipType">Relationship Type *</Label>
              <Select 
                value={formData.relationshipType} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, relationshipType: value }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your relationship type" />
                </SelectTrigger>
                <SelectContent>
                  {relationshipTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="location">Location (Optional)</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="City, State/Province, Country"
              />
            </div>
          </div>

          {/* Conditional field for "Other" relationship type */}
          {formData.relationshipType === "Other" && (
            <div>
              <Label htmlFor="otherRelationshipType">Please specify your relationship type *</Label>
              <Input
                id="otherRelationshipType"
                value={formData.otherRelationshipType}
                onChange={(e) => setFormData(prev => ({ ...prev, otherRelationshipType: e.target.value }))}
                required
                placeholder="Enter your relationship type"
              />
            </div>
          )}

          {/* Line 3: Donor Information */}
          <div>
            <Label htmlFor="donorInfo">Donor Information (Optional)</Label>
            <Textarea
              id="donorInfo"
              value={formData.donorInfo}
              onChange={(e) => setFormData(prev => ({ ...prev, donorInfo: e.target.value }))}
              placeholder="Any donor information you're comfortable sharing (donor number, clinic, etc.)"
              rows={2}
            />
          </div>

          {/* Line 4: Interests */}
          <div>
            <Label htmlFor="interests">What interests you most? (Optional)</Label>
            <Textarea
              id="interests"
              value={formData.interests}
              onChange={(e) => setFormData(prev => ({ ...prev, interests: e.target.value }))}
              placeholder="What features are you most interested in? (connecting with siblings, medical updates, privacy controls, etc.)"
              rows={2}
            />
          </div>

          {/* Line 5: Story */}
          <div>
            <Label htmlFor="story">Your Story (Optional)</Label>
            <Textarea
              id="story"
              value={formData.story}
              onChange={(e) => setFormData(prev => ({ ...prev, story: e.target.value }))}
              placeholder="Tell us a bit about your journey and what you hope to find..."
              rows={3}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button type="submit" disabled={isSubmitting} className="responsive-button">
              {isSubmitting ? "Submitting..." : "Request Private Beta Access"}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsOpen(false)}
              className="responsive-button"
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 