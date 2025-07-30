import { Button } from "@/components/ui/button";
import { ArrowRight, Mail } from "lucide-react";
import { Link } from "react-router-dom";

const ContactHero = () => {
  return (
    <section className=" w-full px-4 sm:px-6 lg:px-12 py-16 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8 sm:mb-12 lg:mb-16 animate-gentle-fade">
          <div className="mb-4 sm:mb-6 lg:mb-8">
            <span className="text-xxs uppercase tracking-widest text-coral-600 font-medium">
              Get in Touch
            </span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl 2xl:text-9xl font-extralight text-navy-900 mb-4 sm:mb-6 lg:mb-8 leading-none tracking-tighter">
            Get in
            <br />
            <span className="text-coral-600">Touch</span>
          </h1>
          
          <div className="max-w-2xl mx-auto mb-8 sm:mb-10 lg:mb-12">
            <p className="text-xxs uppercase tracking-wider text-sage-600 mb-2 sm:mb-3 lg:mb-4 font-medium">
              We'd love to hear from you
            </p>
            <p className="text-base sm:text-lg text-navy-700 leading-relaxed font-light px-4 sm:px-0">
              Send us a message and we'll respond as soon as possible. We're here to help 
              you connect with your family and answer any questions you might have.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 px-4 sm:px-0">
            <Button 
              asChild
              size="lg" 
              className="bg-coral-600 hover:bg-coral-700 text-white px-6 sm:px-8 py-4 sm:py-6 text-sm font-medium tracking-wide group w-full sm:w-auto min-h-[44px]"
            >
              <Link to="#contact-form">
                Send Message
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            
            <Button 
              variant="ghost" 
              size="lg" 
              className="text-navy-700 hover:text-coral-600 hover:bg-coral-50 px-6 sm:px-8 py-4 sm:py-6 text-sm font-medium tracking-wide group w-full sm:w-auto min-h-[44px]"
            >
              <Mail className="mr-2 w-4 h-4 group-hover:scale-110 transition-transform" />
              hello@familyshapes.com
            </Button>
          </div>
        </div>

     
      </div>
    </section>
  );
};

export default ContactHero; 