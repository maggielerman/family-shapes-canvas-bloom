import {
  RecipientWaitlistForm,
  RecipientValueProposition,
  RecipientKeyBenefits
} from "@/components/recipient-private-beta";
import ImagePlaceholder from "@/components/marketing/get-started/ImagePlaceholder";
import { Network } from "lucide-react";

const RecipientPrivateBeta = () => {
  return (
    <div className="responsive-page-container container mx-auto">
      <div className="responsive-page">
        {/* Main Two-Column Section */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* Left Column - Image Placeholder & Value Prop */}
          <div className="space-y-6 order-2 lg:order-1">
            <ImagePlaceholder 
              title="Family Tree Builder"
              description="Visualize your donor family tree and discover connections with siblings and relatives"
              icon={Network}
            />
            <RecipientValueProposition />
            <RecipientKeyBenefits />
          </div>

          {/* Right Column - Waitlist Form */}
          <div className="order-1 lg:order-2">
            <RecipientWaitlistForm />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipientPrivateBeta; 