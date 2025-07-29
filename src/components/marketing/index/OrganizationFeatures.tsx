
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Database, Users, AlertTriangle, Network, FileText, BarChart3, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const features = [
  {
    icon: Database,
    title: "Multi-Clinic Data Hub",
    description: "Centralized platform enabling secure data sharing between cryobanks and fertility clinics for comprehensive donor oversight."
  },
  {
    icon: AlertTriangle,
    title: "Automated Donor Monitoring",
    description: "Real-time tracking and alerts to prevent super-donor incidents across multiple facilities and geographic regions."
  },
  {
    icon: Network,
    title: "Secure Clinic Network",
    description: "HIPAA-compliant communication infrastructure enabling coordinated oversight and standardized protocols."
  },
  {
    icon: FileText,
    title: "Regulatory Compliance",
    description: "Automated reporting and documentation tools ensuring adherence to FDA guidelines and industry standards."
  },
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    description: "Real-time dashboards and predictive insights for informed decision-making and proactive risk management."
  },
  {
    icon: Users,
    title: "Risk Assessment Engine",
    description: "AI-powered system to identify concerning patterns in donor behavior, medical history, and usage across clinics."
  }
];

const OrganizationFeatures = () => {
  return (
    <section id="features" className="w-full px-4 sm:px-6 lg:px-12 py-16 sm:py-20 lg:py-24 xl:py-32 bg-gradient-to-br from-warm-50 to-coral-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12 sm:mb-16 lg:mb-20">
          <span className="text-xxs uppercase tracking-widest text-coral-600 font-medium mb-3 sm:mb-4 block">
            Enterprise Platform Features
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extralight text-navy-900 mb-4 sm:mb-6 tracking-tighter">
            SaaS
            <br />
            <span className="text-coral-600">Solutions</span>
          </h2>
          <p className="text-xxs uppercase tracking-wider text-sage-600 max-w-2xl mx-auto px-4 sm:px-0">
            Comprehensive platform addressing systemic failures in reproductive healthcare transparency
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-12 sm:mb-16 lg:mb-20">
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

        {/* Family Solutions CTA */}
        <div className="bg-white rounded-3xl border border-warm-200 p-8 sm:p-12 text-center shadow-xl">
          <span className="text-xxs uppercase tracking-widest text-coral-600 font-medium mb-3 sm:mb-4 block">
            Looking for Family Solutions?
          </span>
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-extralight text-navy-900 mb-4 sm:mb-6 tracking-tighter">
            Connect Your
            <br />
            <span className="text-coral-600">Donor Family</span>
          </h3>
          <p className="text-sm text-navy-600 leading-relaxed font-light mb-6 sm:mb-8 max-w-2xl mx-auto">
            If you're a donor family looking to connect with siblings and share medical updates, 
            we have a dedicated platform designed specifically for your journey.
          </p>
          <Button asChild size="lg" className="bg-coral-600 hover:bg-coral-700 text-white px-6 sm:px-8 py-4 sm:py-6 text-sm font-medium tracking-wide group">
            <Link to="/family-community">
              Explore Family Platform
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default OrganizationFeatures;