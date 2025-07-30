import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function FamilySolutionsSecondaryCTA() {
  return (
    <div className="text-center">
      <p className="text-sm text-navy-600 mb-4">
        Looking for family solutions? 
        <Button asChild variant="link" className="text-coral-600 hover:text-coral-700 p-0 h-auto font-normal ml-1">
          <Link to="/for-recipient-families">
            Explore our family platform
            <ArrowRight className="ml-1 w-3 h-3" />
          </Link>
        </Button>
      </p>
    </div>
  );
} 