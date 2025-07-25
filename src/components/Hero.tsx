
import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section className="w-full px-4 sm:px-6 lg:px-12 py-12 sm:py-16 lg:py-24 xl:py-32 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8 sm:mb-12 lg:mb-16 animate-gentle-fade">
          <div className="mb-4 sm:mb-6 lg:mb-8">
            <span className="text-xxs uppercase tracking-widest text-coral-600 font-medium">
              Enterprise SaaS Platform
            </span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl 2xl:text-9xl font-extralight text-navy-900 mb-4 sm:mb-6 lg:mb-8 leading-none tracking-tighter">
            Industry-Leading
            <br />
            <span className="text-coral-600">Donor Oversight</span>
          </h1>
          
          <div className="max-w-3xl mx-auto mb-8 sm:mb-10 lg:mb-12">
            <p className="text-xxs uppercase tracking-wider text-sage-600 mb-2 sm:mb-3 lg:mb-4 font-medium">
              The Complete Solution for Modern Reproductive Healthcare
            </p>
            <p className="text-base sm:text-lg text-navy-700 leading-relaxed font-light px-4 sm:px-0">
              Comprehensive platform empowering cryobanks and fertility clinics with the tools, 
              transparency, and oversight needed for responsible donor management.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 px-4 sm:px-0">
            <Button asChild
              size="lg" 
              className="bg-coral-600 hover:bg-coral-700 text-white px-6 sm:px-8 py-4 sm:py-6 text-sm font-medium tracking-wide group w-full sm:w-auto min-h-[44px]"
            >
              <Link to="/auth">
                Request Demo
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            
            <Button asChild
              variant="ghost" 
              size="lg" 
              className="text-navy-700 hover:text-coral-600 hover:bg-coral-50 px-6 sm:px-8 py-4 sm:py-6 text-sm font-medium tracking-wide group w-full sm:w-auto min-h-[44px]"
            >
              <Link to="/family-community">
                For Families
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
        </div>

        <div className="relative mt-12 sm:mt-16 lg:mt-24">
          <div className="aspect-video bg-gradient-to-br from-coral-100 via-dusty-100 to-sage-100 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden border border-warm-200">
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center mb-3 sm:mb-4 mx-auto shadow-lg">
                  <Play className="w-4 h-4 sm:w-6 sm:h-6 text-coral-600" />
                </div>
                <p className="text-xxs uppercase tracking-wider text-navy-600">
                  Product Preview
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
