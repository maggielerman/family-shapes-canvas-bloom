import {
  ImagePlaceholder,
  ValueProposition,
  KeyBenefits,
  WaitlistForm
} from "@/components/marketing/get-started";

export default function GetStarted() {
  return (
    <div className="responsive-page-container">
      <div className="responsive-page">
        {/* Main Two-Column Section */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* Left Column - Image Placeholder & Value Prop */}
          <div className="space-y-6 order-2 lg:order-1">
            <ImagePlaceholder />
            <ValueProposition />
            <KeyBenefits />
          </div>

          {/* Right Column - Waitlist Form */}
          <div className="order-1 lg:order-2">
            <WaitlistForm />
          </div>
        </div>
      </div>
    </div>
  );
} 