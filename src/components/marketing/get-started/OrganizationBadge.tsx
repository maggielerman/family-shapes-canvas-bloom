import { Badge } from "@/components/ui/badge";
import { Building2 } from "lucide-react";

export default function OrganizationBadge() {
  return (
    <Badge variant="outline" className="w-fit bg-coral-50 text-coral-700 border-coral-200">
      <Building2 className="w-3 h-3 mr-1" />
      For Organizations
    </Badge>
  );
} 