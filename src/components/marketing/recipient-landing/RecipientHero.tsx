
import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import { Link } from "react-router-dom";

const RecipientHero = () => {
  return (
    <section className=" w-full px-4 sm:px-6 lg:px-12 py-16 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8 sm:mb-12 lg:mb-16 animate-gentle-fade">
          <div className="mb-4 sm:mb-6 lg:mb-8">
            <span className="text-xxs uppercase tracking-widest text-coral-600 font-medium">
              Connecting Families
            </span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl 2xl:text-9xl font-extralight text-navy-900 mb-4 sm:mb-6 lg:mb-8 leading-none tracking-tighter">
            Find Your
            <br />
            <span className="text-coral-600">Village</span>
          </h1>
          
          <div className="max-w-2xl mx-auto mb-8 sm:mb-10 lg:mb-12">
            <p className="text-xxs uppercase tracking-wider text-sage-600 mb-2 sm:mb-3 lg:mb-4 font-medium">
              Where love takes form
            </p>
            <p className="text-base sm:text-lg text-navy-700 leading-relaxed font-light px-4 sm:px-0">
            Build meaningful relationships with your genetic relatives in a safe, private environment.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 px-4 sm:px-0">
            <Button 
              asChild
              size="lg" 
              className="bg-coral-600 hover:bg-coral-700 text-white px-6 sm:px-8 py-4 sm:py-6 text-sm font-medium tracking-wide group w-full sm:w-auto min-h-[44px]"
            >
              <Link to="/recipient-private-beta">
                Join the Private Beta
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            
            {/* <Button 
              variant="ghost" 
              size="lg" 
              className="text-navy-700 hover:text-coral-600 hover:bg-coral-50 px-6 sm:px-8 py-4 sm:py-6 text-sm font-medium tracking-wide group w-full sm:w-auto min-h-[44px]"
            >
              <Play className="mr-2 w-4 h-4 group-hover:scale-110 transition-transform" />
              Watch Story
            </Button> */}
          </div>
        </div>

     
      </div>
    </section>
  );
};

export default RecipientHero;
