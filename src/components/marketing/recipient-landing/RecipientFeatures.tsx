
import { Card, CardContent } from "@/components/ui/card";
import { Users, Camera, Calendar, MessageCircle, Shield, Heart } from "lucide-react";

const features = [
  {
    icon: Users,
    title: "Family Circles",
    description: "Create intimate spaces for your immediate and extended family members to connect and share."
  },
  {
    icon: Camera,
    title: "Memory Vault",
    description: "Preserve precious moments with our sophisticated photo and video sharing platform."
  },
  {
    icon: Calendar,
    title: "Family Events",
    description: "Coordinate gatherings, celebrations, and milestones with elegant planning tools."
  },
  {
    icon: MessageCircle,
    title: "Thoughtful Messaging",
    description: "Engage in meaningful conversations with beautifully designed communication features."
  },
  {
    icon: Shield,
    title: "Privacy First",
    description: "Your family's data remains secure with our industry-leading privacy protections."
  },
  {
    icon: Heart,
    title: "Connection Insights",
    description: "Discover patterns in how your family connects and grows closer together."
  }
];

const RecipientFeatures = () => {
  return (
    <section id="features" className="w-full px-4 sm:px-6 lg:px-12 py-16 sm:py-20 lg:py-24 xl:py-32 bg-gradient-to-br from-warm-50 to-coral-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12 sm:mb-16 lg:mb-20">
          <span className="text-xxs uppercase tracking-widest text-coral-600 font-medium mb-3 sm:mb-4 block">
            Features
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extralight text-navy-900 mb-4 sm:mb-6 tracking-tighter">
            Thoughtfully
            <br />
            <span className="text-coral-600">Designed</span>
          </h2>
          <p className="text-xxs uppercase tracking-wider text-sage-600 max-w-xl mx-auto px-4 sm:px-0">
            Every feature crafted with intention to strengthen family bonds
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

export default RecipientFeatures;
