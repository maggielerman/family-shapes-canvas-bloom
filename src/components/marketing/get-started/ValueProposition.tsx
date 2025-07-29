import { Badge } from "@/components/ui/badge";
import { Building2 } from "lucide-react";

export default function ValueProposition() {
  return (
    <div className="space-y-4">
      <Badge variant="outline" className="w-fit bg-coral-50 text-coral-700 border-coral-200">
        <Building2 className="w-3 h-3 mr-1" />
        For Organizations
      </Badge>
      <h1 className="responsive-title">
        Streamline Your <span className="text-coral-600">Donor Management</span>
      </h1>
      <p className="responsive-description">
        Join the waitlist for our comprehensive platform designed specifically for fertility clinics, 
        cryobanks, and reproductive health organizations. Manage donor databases, track family connections, 
        and provide better care with our specialized tools.
      </p>
    </div>
  );
} 