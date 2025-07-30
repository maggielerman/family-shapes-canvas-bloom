import { CheckCircle } from "lucide-react";

export default function RecipientKeyBenefits() {
  return (
    <div className="space-y-3">
      <h3 className="font-medium responsive-text-lg">Key Benefits:</h3>
      <div className="space-y-2">
        <div className="flex items-center gap-2 responsive-text-sm">
          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
          <span>Find and connect with donor siblings</span>
        </div>
        <div className="flex items-center gap-2 responsive-text-sm">
          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
          <span>Share medical updates with family members</span>
        </div>
        <div className="flex items-center gap-2 responsive-text-sm">
          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
          <span>Private, secure communication channels</span>
        </div>
        <div className="flex items-center gap-2 responsive-text-sm">
          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
          <span>Visualize your donor family tree</span>
        </div>
      </div>
    </div>
  );
} 