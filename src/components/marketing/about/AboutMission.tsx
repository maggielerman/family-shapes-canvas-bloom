import { Heart, Quote } from "lucide-react";

interface AboutMissionProps {
  className?: string;
}

const AboutMission = ({ className = "" }: AboutMissionProps) => {
  return (
    <section className={`w-full px-6 lg:px-12 py-24 bg-gradient-to-br from-warm-50 to-sage-50 ${className}`}>
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
  );
};

export default AboutMission; 