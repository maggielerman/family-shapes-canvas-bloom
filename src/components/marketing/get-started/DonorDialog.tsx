import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface DonorFormData {
  name: string;
  email: string;
  interests: string;
}

interface DonorDialogProps {
  children: React.ReactNode;
}

export default function DonorDialog({ children }: DonorDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<DonorFormData>({
    name: "",
    email: "",
    interests: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase.functions.invoke('send-contact-form', {
        body: {
          name: formData.name,
          email: formData.email,
          subject: "Donor Interest Request",
          message: `Name: ${formData.name}\nEmail: ${formData.email}\n\nInterests: ${formData.interests || "Not specified"}`
        }
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Thank you!",
        description: "We'll keep you updated on donor features and developments.",
      });

      // Reset form and close dialog
      setFormData({
        name: "",
        email: "",
        interests: ""
      });
      setIsOpen(false);
    } catch (error) {
      console.error('Error submitting donor form:', error);
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
      <DialogContent className="responsive-dialog">
        <DialogHeader>
          <DialogTitle className="responsive-dialog-title flex items-center gap-2">
            <Heart className="w-5 h-5" />
            Stay in the Loop
          </DialogTitle>
          <DialogDescription className="responsive-dialog-description">
            Get notified when donor features launch and stay updated on developments.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="donorName">Name *</Label>
            <Input
              id="donorName"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
              placeholder="Enter your name"
            />
          </div>
          <div>
            <Label htmlFor="donorEmail">Email *</Label>
            <Input
              id="donorEmail"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              required
              placeholder="Enter your email"
            />
          </div>
          <div>
            <Label htmlFor="interests">What interests you most? (Optional)</Label>
            <Textarea
              id="interests"
              value={formData.interests}
              onChange={(e) => setFormData(prev => ({ ...prev, interests: e.target.value }))}
              placeholder="What donor features are you most interested in?"
              rows={3}
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button type="submit" disabled={isSubmitting} className="responsive-button">
              {isSubmitting ? "Submitting..." : "Stay Updated"}
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