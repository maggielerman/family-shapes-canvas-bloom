import { CheckCircle } from "lucide-react";

export default function DonorKeyBenefits() {
  return (
    <div className="space-y-3">
      <h3 className="font-medium responsive-text-lg">Key Benefits:</h3>
      <div className="space-y-2">
        <div className="flex items-center gap-2 responsive-text-sm">
          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
          <span>Connect with intended parents safely and privately</span>
        </div>
        <div className="flex items-center gap-2 responsive-text-sm">
          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
          <span>Manage your donation journey and preferences</span>
        </div>
        <div className="flex items-center gap-2 responsive-text-sm">
          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
          <span>Access to comprehensive health and genetic information</span>
        </div>
        <div className="flex items-center gap-2 responsive-text-sm">
          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
          <span>Support throughout the donation process</span>
        </div>
      </div>
    </div>
  );
} 