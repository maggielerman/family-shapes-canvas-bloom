import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Heart, Shield, MessageSquare, Search, Network, ArrowRight, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import CTA from "@/components/marketing/recipient-landing/CTA";
import RecipientFeatures from "@/components/marketing/recipient-landing/RecipientFeatures";
import RecipientHero from "@/components/marketing/recipient-landing/RecipientHero";
import RecipientHero2 from "@/components/marketing/recipient-landing/RecipientHero2";
import { useProductContext } from "@/lib/productContext";
import { useEffect } from "react";

const RecipientLanding = () => {
  const { setProductGroup } = useProductContext();

  // Set family theme for this landing page
  useEffect(() => {
    setProductGroup('family');
  }, [setProductGroup]);
  const features = [
    {
      icon: Users,
      title: "Connect with Diblings",
      description: "Find and connect with donor siblings through our secure network. Build meaningful relationships with your biological family."
    },
    {
      icon: Network,
      title: "Track Family Networks",
      description: "Visualize your donor family tree and understand the full scope of your genetic family connections."
    },
    {
      icon: Heart,
      title: "Share Medical Updates",
      description: "Exchange critical health information with family members to support everyone's wellbeing."
    },
    {
      icon: MessageSquare,
      title: "Private Community",
      description: "Join private groups and forums to share experiences, advice, and support with other donor families."
    },
    {
      icon: Shield,
      title: "Privacy First",
      description: "Your data is secure. Share only what you're comfortable with, with full control over your privacy."
    },
    {
      icon: Search,
      title: "Search & Discovery",
      description: "Use advanced search tools to find family members based on donor information, location, and other criteria."
    }
  ];

  const testimonials = [
    {
      quote: "Family Shapes helped me find 12 half-siblings I never knew existed. It's changed my life.",
      author: "Sarah M.",
      role: "Donor Conceived Adult"
    },
    {
      quote: "As a parent, I feel so much more confident knowing we can share medical updates with our child's genetic family.",
      author: "David & Lisa K.",
      role: "Parents via Donor Conception"
    },
    {
      quote: "The community aspect is incredible. It's so helpful to connect with other families who understand our journey.",
      author: "Maria R.",
      role: "Single Mother by Choice"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
     
     <RecipientHero />

     <RecipientHero2 />

      {/* Stats Section */}
      <section className="px-4 sm:px-6 lg:px-12 py-16 bg-accent/20">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">15,000+</div>
              <div className="text-muted-foreground">Families Connected</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">50,000+</div>
              <div className="text-muted-foreground">Relationships Mapped</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">500+</div>
              <div className="text-muted-foreground">Donor Groups</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-4 sm:px-6 lg:px-12 py-16 sm:py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-light text-foreground mb-4">
              Everything You Need to Connect
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Comprehensive tools designed specifically for donor families to build connections and share important information.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-accent/30 hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl text-foreground">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-4 sm:px-6 lg:px-12 py-16 sm:py-20 bg-accent/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-light text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Getting started is simple and secure. Here's how you can begin connecting with your donor family.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                1
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-4">Create Your Profile</h3>
              <p className="text-muted-foreground">
                Sign up and add your donor information. Share only what you're comfortable with.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                2
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-4">Find Your Matches</h3>
              <p className="text-muted-foreground">
                Our system will help identify potential family connections based on your donor information.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                3
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-4">Start Connecting</h3>
              <p className="text-muted-foreground">
                Reach out to family members, join groups, and build meaningful relationships.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-4 sm:px-6 lg:px-12 py-16 sm:py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-light text-foreground mb-4">
              Stories from Our Community
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Real families sharing their experiences with Family Shapes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-accent/30">
                <CardContent className="pt-6">
                  <blockquote className="text-muted-foreground mb-4 italic">
                    "{testimonial.quote}"
                  </blockquote>
                  <div className="font-semibold text-foreground">{testimonial.author}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 sm:px-6 lg:px-12 py-16 sm:py-20 bg-gradient-to-r from-primary to-accent">
        <div className="max-w-4xl mx-auto text-center text-primary-foreground">
          <h2 className="text-3xl sm:text-4xl font-light mb-6">
            Ready to Find Your Family?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join our community today and start building meaningful connections with your genetic family.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary" className="bg-background text-foreground hover:bg-background/90 px-8 py-6 text-lg">
              <Link to="/auth">
                Get Started Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button asChild variant="ghost" size="lg" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary px-8 py-6 text-lg">
              <Link to="/contact">
                Contact Us
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <CTA />

    </div>
  );
};

export default RecipientLanding;