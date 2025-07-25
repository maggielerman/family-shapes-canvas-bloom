
import { Card, CardContent } from "@/components/ui/card";
import { Database, Users, AlertTriangle, MessageCircle, Shield, Heart } from "lucide-react";

const features = [
  {
    icon: Database,
    title: "Secure Data Sharing",
    description: "Advanced infrastructure for cryobanks and clinics to securely share donor data and maintain transparency."
  },
  {
    icon: AlertTriangle,
    title: "Super-Donor Prevention",
    description: "Automated monitoring and flagging systems to prevent excessive donations and identify concerning patterns."
  },
  {
    icon: Shield,
    title: "Industry Oversight",
    description: "Comprehensive tools to flag bad actors and maintain accountability across the donor conception ecosystem."
  },
  {
    icon: Users,
    title: "Family Connections",
    description: "Safe spaces for donor-conceived families to connect, discover relationships, and build community."
  },
  {
    icon: MessageCircle,
    title: "Medical Updates",
    description: "Critical medical information sharing between donors, families, and healthcare providers when needed."
  },
  {
    icon: Heart,
    title: "Relationship Tracking",
    description: "Powerful visualization tools to map and understand complex family relationships and donor connections."
  }
];

const Features = () => {
  return (
    <section id="features" className="w-full px-4 sm:px-6 lg:px-12 py-16 sm:py-20 lg:py-24 xl:py-32 bg-gradient-to-br from-warm-50 to-coral-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12 sm:mb-16 lg:mb-20">
          <span className="text-xxs uppercase tracking-widest text-coral-600 font-medium mb-3 sm:mb-4 block">
            Platform Capabilities
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extralight text-navy-900 mb-4 sm:mb-6 tracking-tighter">
            Industry
            <br />
            <span className="text-coral-600">Solutions</span>
          </h2>
          <p className="text-xxs uppercase tracking-wider text-sage-600 max-w-2xl mx-auto px-4 sm:px-0">
            Comprehensive tools for transparency, oversight, and family empowerment
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <Card 
              key={feature.title} 
              className="border border-warm-200 bg-white hover:bg-white hover:shadow-xl transition-all duration-300 group"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-6 sm:p-8">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-coral-400 to-dusty-500 flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                
                <h3 className="text-lg sm:text-xl font-light text-navy-800 mb-2 sm:mb-3 tracking-tight">
                  {feature.title}
                </h3>
                
                <p className="text-sm text-navy-600 leading-relaxed font-light">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
