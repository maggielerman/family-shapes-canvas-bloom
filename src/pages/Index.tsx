import Hero from "@/components/index/OrganizationHero";
import FeatureBullets from "@/components/index/FeatureBullets";
import Features from "@/components/index/OrganizationFeatures";

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