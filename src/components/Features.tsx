
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

const Features = () => {
  return (
    <section id="features" className="w-full px-6 lg:px-12 py-24 lg:py-32 bg-warm-50/30">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-20">
          <span className="text-xxs uppercase tracking-widest text-sage-600 font-medium mb-4 block">
            Features
          </span>
          <h2 className="text-5xl lg:text-6xl font-extralight text-warm-800 mb-6 tracking-tighter">
            Thoughtfully
            <br />
            <span className="text-dusty-600">Designed</span>
          </h2>
          <p className="text-xxs uppercase tracking-wider text-sage-600 max-w-xl mx-auto">
            Every feature crafted with intention to strengthen family bonds
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={feature.title} 
              className="border-0 bg-white/60 backdrop-blur-sm hover:bg-white/80 transition-all duration-300 group"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-8">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-dusty-200 to-sage-200 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-5 h-5 text-warm-700" />
                </div>
                
                <h3 className="text-xl font-light text-warm-800 mb-3 tracking-tight">
                  {feature.title}
                </h3>
                
                <p className="text-sm text-warm-600 leading-relaxed font-light">
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
