import React from 'react';
import { 
  RecipientHero, 
  RecipientFeatures, 
  RecipientStats, 
  RecipientFeaturesGrid, 
  RecipientHowItWorks, 
  RecipientTestimonials, 
  RecipientCTA 
} from "@/components/marketing/recipient-landing";

const RecipientLanding = () => {
  return (
    <div className="min-h-screen bg-background">
      <RecipientHero />
      
      <RecipientFeaturesGrid />
      <RecipientHowItWorks />
      <RecipientTestimonials />
      <RecipientCTA />
    </div>
  );
};

export default RecipientLanding;