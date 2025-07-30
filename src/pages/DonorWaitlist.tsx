import {
  DonorWaitlistForm,
  DonorValueProposition,
  DonorKeyBenefits
} from "@/components/donor-waitlist";
import ImagePlaceholder from "@/components/marketing/get-started/ImagePlaceholder";
import { Heart } from "lucide-react";

const DonorWaitlist = () => {
  return (
    <div className="responsive-page-container">
      <div className="responsive-page">
        {/* Main Two-Column Section */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* Left Column - Image Placeholder & Value Prop */}
          <div className="space-y-6 order-2 lg:order-1">
            <ImagePlaceholder 
              title="Donor Platform"
              description="Connect with intended parents and manage your donation journey"
              icon={Heart}
            />
            <DonorValueProposition />
            <DonorKeyBenefits />
          </div>

          {/* Right Column - Waitlist Form */}
          <div className="order-1 lg:order-2">
            <DonorWaitlistForm />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonorWaitlist; 