import { CheckCircle } from "lucide-react";

export default function KeyBenefits() {
  return (
    <div className="space-y-3">
      <h3 className="font-medium responsive-text-lg">Key Benefits:</h3>
      <div className="space-y-2">
        <div className="flex items-center gap-2 responsive-text-sm">
          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
          <span>Comprehensive donor database management</span>
        </div>
        <div className="flex items-center gap-2 responsive-text-sm">
          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
          <span>Family connection tracking and privacy controls</span>
        </div>
        <div className="flex items-center gap-2 responsive-text-sm">
          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
          <span>Advanced reporting and analytics tools</span>
        </div>
        <div className="flex items-center gap-2 responsive-text-sm">
          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
          <span>Multi-tenant organization support</span>
        </div>
      </div>
    </div>
  );
} 