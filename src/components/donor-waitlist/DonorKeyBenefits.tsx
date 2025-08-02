import { CheckCircle } from "lucide-react";

export default function DonorKeyBenefits() {
  return (
    <div className="space-y-3">
      <h3 className="font-medium responsive-text-lg">Key Benefits:</h3>
      <div className="space-y-2">
        <div className="flex items-center gap-2 responsive-text-sm">
          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
          <span>Granular privacy controls and communication preferences</span>
        </div>
        <div className="flex items-center gap-2 responsive-text-sm">
          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
          <span>Track donation outcomes and offspring information</span>
        </div>
        <div className="flex items-center gap-2 responsive-text-sm">
          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
          <span>Monitor how your donations are being used</span>
        </div>
        <div className="flex items-center gap-2 responsive-text-sm">
          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
          <span>Secure platform for medical updates and health information</span>
        </div>
        <div className="flex items-center gap-2 responsive-text-sm">
          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
          <span>Prevent unauthorized use of your donations</span>
        </div>
      </div>
    </div>
  );
} 