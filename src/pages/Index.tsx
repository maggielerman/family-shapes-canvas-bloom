import Hero from "@/components/marketing/index/OrganizationHero";
import FeatureBullets from "@/components/marketing/index/FeatureBullets";
import Features from "@/components/marketing/index/OrganizationFeatures";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Hero />
      <FeatureBullets />
      <Features />
    </div>
  );
};

export default Index;