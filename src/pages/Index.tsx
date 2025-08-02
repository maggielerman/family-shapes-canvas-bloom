import Hero from "@/components/index/OrganizationHero";
import FeatureBullets from "@/components/index/FeatureBullets";
import OrganizationFeatures from "@/components/index/OrganizationFeatures";
import FamilySolutionsCTA from "@/components/index/FamilySolutionsCTA";
import SayHello from "@/components/marketing/contact/SayHello";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Hero />
      <FeatureBullets />
      <OrganizationFeatures />
      <SayHello />
   

    </div>
  );
};

export default Index;