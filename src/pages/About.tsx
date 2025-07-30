
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import MainLayout from "@/components/layouts/MainLayout";
import { AboutHero } from "@/components/marketing/about";
import { 
  Heart, 
  ArrowRight, 
  Users, 
  Shield, 
  Sparkles,
  Quote,
  Mail,
  Linkedin,
  Twitter
} from "lucide-react";

const About = () => {
  const team = [
    {
      name: "Sarah Chen",
      role: "Founder & CEO",
      bio: "Former family therapist passionate about strengthening family bonds through technology.",
      image: "/placeholder.svg"
    },
    {
      name: "Michael Rodriguez",
      role: "Head of Product",
      bio: "Design leader with 10+ years creating meaningful digital experiences for families.",
      image: "/placeholder.svg"
    },
    {
      name: "Emily Park",
      role: "Chief Technology Officer",
      bio: "Privacy-first engineer ensuring your family's data remains safe and secure.",
      image: "/placeholder.svg"
    }
  ];

  const values = [
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
<div>

      <AboutHero />

      {/* Mission */}
      <section className="w-full px-6 lg:px-12 py-24 bg-gradient-to-br from-warm-50 to-sage-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-xxs uppercase tracking-widest text-coral-600 font-medium mb-6 block">
                Our Mission
              </span>
              
              <h2 className="text-5xl lg:text-6xl font-extralight text-navy-900 mb-8 tracking-tighter">
                Nurturing
                <br />
                <span className="text-coral-600">Connection</span>
              </h2>
              
              <p className="text-lg text-navy-700 leading-relaxed font-light mb-8">
                In a world that often feels disconnected, we believe families are the 
                foundation of everything meaningful. Our platform is designed to honor 
                the unique bonds that make each family special.
              </p>
              
              <blockquote className="border-l-4 border-coral-400 pl-6 mb-8">
                <Quote className="w-6 h-6 text-coral-400 mb-4" />
                <p className="text-lg text-navy-800 font-light italic leading-relaxed">
                  "Every family has its own shape, its own rhythm, its own way of loving. 
                  We're here to celebrate and strengthen those connections."
                </p>
                <cite className="text-sm text-navy-600 uppercase tracking-wider mt-4 block">
                  Sarah Chen, Founder
                </cite>
              </blockquote>
            </div>
            
            <div className="aspect-square bg-gradient-to-br from-coral-100 via-dusty-100 to-sage-100 rounded-3xl shadow-xl overflow-hidden border border-warm-200">
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <Heart className="w-16 h-16 text-coral-500 mx-auto mb-4" />
                  <p className="text-xxs uppercase tracking-wider text-navy-600">
                    Mission Illustration
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="w-full px-6 lg:px-12 py-24 bg-white">
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

      {/* Team */}
      <section className="w-full px-6 lg:px-12 py-24 bg-gradient-to-br from-sage-50 to-warm-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <span className="text-xxs uppercase tracking-widest text-coral-600 font-medium mb-4 block">
              Our Team
            </span>
            <h2 className="text-5xl lg:text-6xl font-extralight text-navy-900 mb-6 tracking-tighter">
              The People
              <br />
              <span className="text-coral-600">Behind It</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <Card 
                key={member.name} 
                className="border border-warm-200 bg-white hover:shadow-xl transition-all duration-300 text-center group"
              >
                <CardContent className="p-8">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-coral-200 to-dusty-200 mx-auto mb-6 overflow-hidden">
                    <div className="w-full h-full flex items-center justify-center">
                      <Users className="w-8 h-8 text-coral-600" />
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-light text-navy-800 mb-2 tracking-tight">
                    {member.name}
                  </h3>
                  
                  <p className="text-xxs uppercase tracking-wider text-coral-600 mb-4">
                    {member.role}
                  </p>
                  
                  <p className="text-sm text-navy-600 leading-relaxed font-light">
                    {member.bio}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="w-full px-6 lg:px-12 py-24 bg-white">
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
                  size="lg" 
                  className="bg-coral-600 hover:bg-coral-700 text-white px-10 py-6 text-base font-medium tracking-wide group"
                >
                  Get Early Access
                  <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="lg" 
                  className="text-navy-700 hover:text-coral-600 hover:bg-coral-50 px-10 py-6 text-base font-medium tracking-wide"
                >
                  Contact Us
                  <Mail className="ml-3 w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

</div>
  );
};

export default About;
