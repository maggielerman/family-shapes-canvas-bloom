import {
  ImagePlaceholder,
  ValueProposition,
  KeyBenefits,
  WaitlistForm,
  SecondaryCTAs
} from "@/components/marketing/get-started";

export default function GetStarted() {
  return (
    <div className="responsive-page-container">
      <div className="responsive-page">
        {/* Main Two-Column Section */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* Left Column - Image Placeholder & Value Prop */}
          <div className="space-y-6">
            <ImagePlaceholder />
            <ValueProposition />
            <KeyBenefits />
          </div>

          {/* Right Column - Waitlist Form */}
          <div>
            <WaitlistForm />
          </div>
        </div>

        {/* Bottom Section - Minimal CTAs for Other Audiences */}
        <SecondaryCTAs />
      </div>
    </div>
  );
} 