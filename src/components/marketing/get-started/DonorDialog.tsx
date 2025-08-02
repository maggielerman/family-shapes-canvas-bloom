import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Heart, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

interface DonorDialogProps {
  children: React.ReactNode;
}

export default function DonorDialog({ children }: DonorDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="responsive-dialog max-w-md">
        <DialogHeader>
          <DialogTitle className="responsive-dialog-title flex items-center gap-2">
            <Heart className="w-5 h-5" />
            Join the Donor Waitlist
          </DialogTitle>
          <DialogDescription className="responsive-dialog-description">
            Access our comprehensive donor platform with detailed forms and features.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-navy-600">
            We've created a comprehensive donor waitlist page with detailed forms for collecting donor information, 
            including personal details, donor type preferences, health information, and more.
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button asChild className="responsive-button">
              <Link to="/donor-waitlist" onClick={handleClose}>
                Go to Donor Waitlist
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              className="responsive-button"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 