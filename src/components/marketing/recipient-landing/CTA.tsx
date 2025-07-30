
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const CTA = () => {
  return (
    <section className="w-full px-4 sm:px-6 lg:px-12 py-16 sm:py-20 lg:py-24 xl:py-32 bg-white">
      <div className="max-w-4xl mx-auto text-center">
        <div className="relative">
          {/* Background decoration */}
          <div className="absolute inset-0 -m-4 sm:-m-6 lg:-m-8">
            <div className="w-full h-full bg-gradient-to-br from-coral-100/60 via-dusty-100/60 to-sage-100/60 rounded-2xl sm:rounded-3xl blur-2xl sm:blur-3xl"></div>
          </div>
          
          <div className="relative z-10 p-6 sm:p-8 lg:p-12 bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl border border-warm-200">
            <div className="flex items-center justify-center mb-4 sm:mb-6">
              <Sparkles className="w-4 h-4 sm:w-6 sm:h-6 text-coral-500 mr-2 sm:mr-3" />
              <span className="text-xxs uppercase tracking-widest text-sage-600 font-medium">
                Join the Beta
              </span>
              <Sparkles className="w-4 h-4 sm:w-6 sm:h-6 text-coral-500 ml-2 sm:ml-3" />
            </div>
            
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extralight text-navy-900 mb-6 sm:mb-8 tracking-tighter leading-none">
              Ready to Begin
              <br />
              <span className="text-coral-600">Your Story?</span>
            </h2>
            
            <p className="text-base sm:text-lg text-navy-700 mb-8 sm:mb-10 lg:mb-12 leading-relaxed font-light max-w-2xl mx-auto px-4 sm:px-0">
              Join families around the world who are already creating deeper 
              connections through Family Shapes. Your journey starts with a 
              single invitation.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
              <Button 
                asChild
                size="lg" 
                className="bg-coral-600 hover:bg-coral-700 text-white px-8 sm:px-10 py-4 sm:py-6 text-sm sm:text-base font-medium tracking-wide group w-full sm:w-auto min-h-[44px]"
              >
                <Link to="/recipient-private-beta">
                  Request Early Access
                  <ArrowRight className="ml-2 sm:ml-3 w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              
              <div className="text-center">
                <p className="text-xxs uppercase tracking-wider text-sage-600 mb-1">
                  Limited Beta Spots
                </p>
                <p className="text-xs text-navy-600 font-light">
                  Launching Spring 2024
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
