import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const RecipientCTA = () => {
  return (
    <section className="px-4 sm:px-6 lg:px-12 py-16 sm:py-20 bg-gradient-to-r from-coral-600 to-dusty-600">
      <div className="max-w-4xl mx-auto text-center text-white">
        <h2 className="text-3xl sm:text-4xl font-light mb-6">
          Ready to Find Your Family?
        </h2>
        <p className="text-xl mb-8 opacity-90">
          Join our community today and start building meaningful connections with your genetic family.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" variant="secondary" className="bg-white text-coral-600 hover:bg-sage-50 px-8 py-6 text-lg">
            <Link to="/recipient-private-beta">
              Join the Private Beta
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </Button>
          <Button asChild variant="ghost" size="lg" className="border-white text-white hover:bg-white hover:text-coral-600 px-8 py-6 text-lg">
            <Link to="/contact">
              Contact Us
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default RecipientCTA; 