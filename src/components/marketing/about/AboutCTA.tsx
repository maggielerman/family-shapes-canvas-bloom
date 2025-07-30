import { Button } from "@/components/ui/button";
import { ArrowRight, Mail } from "lucide-react";
import { Link } from "react-router-dom";

interface AboutCTAProps {
  className?: string;
}

const AboutCTA = ({ className = "" }: AboutCTAProps) => {
  return (
    <section className={`w-full px-6 lg:px-12 py-24 bg-white ${className}`}>
      <div className="max-w-4xl mx-auto text-center">
        <div className="relative">
          <div className="absolute inset-0 -m-8">
            <div className="w-full h-full bg-gradient-to-br from-coral-100/60 via-dusty-100/60 to-sage-100/60 rounded-3xl blur-3xl"></div>
          </div>
          
          <div className="relative z-10 p-12 bg-white/80 backdrop-blur-sm rounded-3xl border border-warm-200">
            <h2 className="text-5xl lg:text-7xl font-extralight text-navy-900 mb-8 tracking-tighter leading-none">
              Join Our
              <br />
              <span className="text-coral-600">Journey</span>
            </h2>
            
            <p className="text-lg text-navy-700 mb-12 leading-relaxed font-light max-w-2xl mx-auto">
              Ready to be part of something meaningful? We're always looking for 
              passionate people who share our vision of bringing families closer together.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Button 
                asChild
                size="lg" 
                className="bg-coral-600 hover:bg-coral-700 text-white px-10 py-6 text-base font-medium tracking-wide group"
              >
                <Link to="/get-started">
                  Get Early Access
                  <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              
              <Button 
                asChild
                variant="ghost" 
                size="lg" 
                className="text-navy-700 hover:text-coral-600 hover:bg-coral-50 px-10 py-6 text-base font-medium tracking-wide"
              >
                <Link to="/contact">
                  Contact Us
                  <Mail className="ml-3 w-5 h-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutCTA; 