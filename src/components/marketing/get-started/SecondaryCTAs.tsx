import { Button } from "@/components/ui/button";
import { Users, Heart, ArrowRight } from "lucide-react";
import DonorDialog from "./DonorDialog";

export default function SecondaryCTAs() {
  return (
    <div className="border-t pt-8 mt-8">
      <div className="text-center space-y-4">
        <h2 className="responsive-text-lg font-medium text-muted-foreground">
          Looking for something else?
        </h2>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button 
            variant="outline" 
            onClick={() => window.location.href = "/auth?redirect=/dashboard"}
            className="responsive-button"
          >
            <Users className="w-4 h-4 mr-2" />
            I'm a Family
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          <DonorDialog>
            <Button variant="outline" className="responsive-button">
              <Heart className="w-4 h-4 mr-2" />
              I'm a Donor
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </DonorDialog>
        </div>
      </div>
    </div>
  );
} 