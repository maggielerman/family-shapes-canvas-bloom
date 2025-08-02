import { Shield, Lock, Eye, Settings } from "lucide-react";
import ImagePlaceholder from "@/components/marketing/get-started/ImagePlaceholder";

export default function DonorPrivacySection() {
  return (
    <section className="w-full px-4 sm:px-6 lg:px-12 py-16 sm:py-20 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Text Content */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-coral-600" />
              <span className="text-xxs uppercase tracking-widest text-coral-600 font-medium">
                Privacy First
              </span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl font-light text-navy-800 mb-6">
              Granular Privacy Control
            </h2>
            
            <p className="text-lg text-navy-600 leading-relaxed mb-8">
              Our state-of-the-art donor portal puts you in complete control of your privacy. 
              Set precise boundaries for what information is shared, when, and with whom.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Lock className="w-5 h-5 text-coral-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-navy-800 mb-1">Secure by Design</h3>
                  <p className="text-sm text-navy-600">
                    Bank-level encryption and security protocols protect your sensitive information at every step.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Eye className="w-5 h-5 text-coral-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-navy-800 mb-1">Transparency Control</h3>
                  <p className="text-sm text-navy-600">
                    Choose exactly what information families can see about you and your donations.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Settings className="w-5 h-5 text-coral-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-navy-800 mb-1">Communication Preferences</h3>
                  <p className="text-sm text-navy-600">
                    Set your own rules for how and when families can contact you, with full control over boundaries.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Column - Placeholder Image */}
          <div className="flex justify-center lg:justify-end">
            <ImagePlaceholder 
              title="Privacy Dashboard"
              description="Advanced privacy controls and settings interface for donor management"
              icon={Shield}
            />
          </div>
        </div>
      </div>
    </section>
  );
} 