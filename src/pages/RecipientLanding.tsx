import React from 'react';
import { 
  RecipientHero, 
  RecipientFeatureBullets,
  CTA 
} from "@/components/marketing/recipient-landing";

const RecipientLanding = () => {
  return (
    <div className="min-h-screen bg-background">
      <RecipientHero />
      <RecipientFeatureBullets variant="coral" />
      <CTA />
    </div>
  );
};

export default RecipientLanding;