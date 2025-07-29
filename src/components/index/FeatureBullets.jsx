import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

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
    <section className="w-full px-4 sm:px-6 lg:px-12 py-12 sm:py-16 lg:py-24 bg-gradient-to-br from-accent/20 to-accent/10">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left side - Features */}
          <div>
            <div className="mb-6 lg:mb-8">
              <span className="text-xxs uppercase tracking-widest text-primary font-medium">
                Core Capabilities
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extralight text-foreground mt-4 mb-6 leading-tight tracking-tight">
                Everything You Need for
                <br />
                <span className="text-primary">Responsible Oversight</span>
              </h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6 mb-8">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                  <div>
                    <h3 className="text-sm font-medium text-foreground mb-1">{feature.title}</h3>
                    <p className="text-xs text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <Button asChild
              size="lg" 
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-4 text-sm font-medium tracking-wide group"
            >
              <Link to="/auth">
                Learn More
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>

          {/* Right side - Image */}
          <div className="relative">
            <div className="aspect-square rounded-2xl shadow-2xl overflow-hidden border border-border">
              <img 
                src="https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
                alt="Colorful software code on computer monitor"
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Floating elements */}
            <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 opacity-60 blur-sm"></div>
            <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-gradient-to-br from-accent/30 to-primary/20 opacity-40 blur-sm"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeatureBullets;