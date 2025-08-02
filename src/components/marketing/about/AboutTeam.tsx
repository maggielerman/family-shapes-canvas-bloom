import { Card, CardContent } from "@/components/ui/card";
import { Users } from "lucide-react";

interface TeamMember {
  name: string;
  role: string;
  bio: string;
  image: string;
}

interface AboutTeamProps {
  className?: string;
}

const AboutTeam = ({ className = "" }: AboutTeamProps) => {
  const team: TeamMember[] = [
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

  return (
    <section className={`w-full px-6 lg:px-12 py-24 bg-gradient-to-br from-sage-50 to-warm-50 ${className}`}>
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
  );
};

export default AboutTeam; 