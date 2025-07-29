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
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Column - Image Placeholder & Value Prop */}
          <div className="space-y-6">
            <ValueProposition />
            <KeyBenefits />
          </div>

          {/* Right Column - Waitlist Form */}
          <div>
            <WaitlistForm />
          </div>
        </div>
      </div>
    </div>
  );
} 