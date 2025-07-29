import Hero from "@/components/index/OrganizationHero";
import FeatureBullets from "@/components/index/FeatureBullets";
import Features from "@/components/index/OrganizationFeatures";
import { useProductContext } from "@/lib/productContext";
import { useEffect } from "react";

const Index = () => {
  const { setProductGroup } = useProductContext();

  // Set organization theme for this landing page
  useEffect(() => {
    setProductGroup('organization');
  }, [setProductGroup]);

  return (
    <div className="min-h-screen bg-background">
      <Hero />
      <FeatureBullets />
      <Features />
    </div>
  );
};

export default Index;