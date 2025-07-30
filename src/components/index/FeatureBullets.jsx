import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import ImagePlaceholder from "@/components/marketing/get-started/ImagePlaceholder";

const FeatureBullets = () => {
  const features = [
    {
      title: "Regulatory Compliance",
      description: "Stay ahead of evolving regulations"
    },
    {
      title: "Data Security & Privacy", 
      description: "Enterprise-grade protection"
    },
    {
      title: "Super-Donor Prevention",
      description: "Automated monitoring & alerts"
    },
    {
      title: "Operational Efficiency",
      description: "Streamlined workflows"
    },
    {
      title: "Industry Collaboration",
      description: "Cross-clinic data sharing"
    },
    {
      title: "Full Transparency",
      description: "Comprehensive audit trails"
    }
  ];

  return (
    <section className="w-full px-4 sm:px-6 lg:px-12 py-12 sm:py-16 lg:py-24 bg-gradient-to-br from-sage-50 to-dusty-50">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left side - Features */}
          <div>
            <div className="mb-6 lg:mb-8">
              <span className="text-xxs uppercase tracking-widest text-coral-600 font-medium">
                Core Capabilities
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extralight text-navy-900 mt-4 mb-6 leading-tight tracking-tight">
                Everything You Need for
                <br />
                <span className="text-coral-600">Responsible Oversight</span>
              </h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6 mb-8">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-2 h-2 rounded-full bg-coral-600 mt-2 flex-shrink-0"></div>
                  <div>
                    <h3 className="text-sm font-medium text-navy-900 mb-1">{feature.title}</h3>
                    <p className="text-xs text-navy-600">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <Button asChild
              size="lg" 
              className="bg-coral-600 hover:bg-coral-700 text-white px-6 py-4 text-sm font-medium tracking-wide group"
            >
              <Link to="/auth">
                Learn More
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>

          {/* Right side - Image */}
          <div className="relative">
                        <div className="aspect-square rounded-2xl shadow-2xl overflow-hidden border border-warm-200">
              <ImagePlaceholder variant="square" />
             
            </div>
            

          </div>
        </div>
      </div>
    </section>
  );
};

export default FeatureBullets;