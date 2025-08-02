import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function FamilySolutionsCTA() {
  return (
    <section className="w-full px-4 sm:px-6 lg:px-12 py-16 sm:py-20 lg:py-24 xl:py-32 bg-gradient-to-br from-warm-50 to-coral-50">
      <div className="max-w-6xl mx-auto">
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
            <Link to="/for-recipient-families">
              Explore Family Platform
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
} 