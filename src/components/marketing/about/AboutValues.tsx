import { Card, CardContent } from "@/components/ui/card";
import { Heart, Shield, Users, Sparkles } from "lucide-react";

interface Value {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

interface AboutValuesProps {
  className?: string;
}

const AboutValues = ({ className = "" }: AboutValuesProps) => {
  const values: Value[] = [
    {
      icon: Heart,
      title: "Family First",
      description: "Every decision we make prioritizes the wellbeing and connection of families."
    },
    {
      icon: Shield,
      title: "Privacy Protected",
      description: "Your family's moments and memories deserve the highest level of security."
    },
    {
      icon: Users,
      title: "Inclusive Design",
      description: "We celebrate all family shapes and forms, creating space for everyone."
    },
    {
      icon: Sparkles,
      title: "Thoughtful Innovation",
      description: "Technology should enhance human connection, not replace it."
    }
  ];

  return (
    <section className={`w-full px-6 lg:px-12 py-24 bg-white ${className}`}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-20">
          <span className="text-xxs uppercase tracking-widest text-coral-600 font-medium mb-4 block">
            Our Values
          </span>
          <h2 className="text-5xl lg:text-6xl font-extralight text-navy-900 mb-6 tracking-tighter">
            What We
            <br />
            <span className="text-coral-600">Stand For</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {values.map((value, index) => (
            <Card 
              key={value.title} 
              className="border border-warm-200 bg-white hover:shadow-xl transition-all duration-300 group"
            >
              <CardContent className="p-8">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-coral-400 to-dusty-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <value.icon className="w-5 h-5 text-white" />
                </div>
                
                <h3 className="text-xl font-light text-navy-800 mb-3 tracking-tight">
                  {value.title}
                </h3>
                
                <p className="text-sm text-navy-600 leading-relaxed font-light">
                  {value.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutValues; 