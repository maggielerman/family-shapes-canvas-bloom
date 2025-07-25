import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Heart, Shield, MessageSquare, Search, Network, ArrowRight, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CTA from "@/components/CTA";

const FamilyCommunity = () => {
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
      <Header />
      
      {/* Hero Section */}
      <section className="px-4 sm:px-6 lg:px-12 py-16 sm:py-20 lg:py-28">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light text-navy-800 mb-6 lg:mb-8 leading-tight">
            Connect Your
            <span className="block text-coral-600 font-normal">Donor Family</span>
          </h1>
          <p className="text-lg sm:text-xl lg:text-2xl text-navy-600 mb-8 lg:mb-12 max-w-4xl mx-auto leading-relaxed">
            Join thousands of donor families connecting, sharing, and supporting each other. 
            Build meaningful relationships with your genetic family in a safe, private environment.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button asChild size="lg" className="bg-coral-600 hover:bg-coral-700 text-white px-8 py-6 text-lg">
              <Link to="/auth">
                Join the Community
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button asChild variant="text" size="lg" className="text-coral-600 hover:bg-navy-50 px-8 py-6 text-lg">
              <Link to="/about">
                Learn More
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-4 sm:px-6 lg:px-12 py-16 bg-sage-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-coral-600 mb-2">15,000+</div>
              <div className="text-navy-600">Families Connected</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-coral-600 mb-2">50,000+</div>
              <div className="text-navy-600">Relationships Mapped</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-coral-600 mb-2">500+</div>
              <div className="text-navy-600">Donor Groups</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-4 sm:px-6 lg:px-12 py-16 sm:py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-light text-navy-800 mb-4">
              Everything You Need to Connect
            </h2>
            <p className="text-lg text-navy-600 max-w-3xl mx-auto">
              Comprehensive tools designed specifically for donor families to build connections and share important information.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-sage-200 hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-coral-100 flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-coral-600" />
                  </div>
                  <CardTitle className="text-xl text-navy-800">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-navy-600 leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-4 sm:px-6 lg:px-12 py-16 sm:py-20 bg-sage-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-light text-navy-800 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-navy-600 max-w-3xl mx-auto">
              Getting started is simple and secure. Here's how you can begin connecting with your donor family.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-coral-600 text-white flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                1
              </div>
              <h3 className="text-xl font-semibold text-navy-800 mb-4">Create Your Profile</h3>
              <p className="text-navy-600">
                Sign up and add your donor information. Share only what you're comfortable with.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-coral-600 text-white flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                2
              </div>
              <h3 className="text-xl font-semibold text-navy-800 mb-4">Find Your Matches</h3>
              <p className="text-navy-600">
                Our system will help identify potential family connections based on your donor information.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-coral-600 text-white flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                3
              </div>
              <h3 className="text-xl font-semibold text-navy-800 mb-4">Start Connecting</h3>
              <p className="text-navy-600">
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
            <h2 className="text-3xl sm:text-4xl font-light text-navy-800 mb-4">
              Stories from Our Community
            </h2>
            <p className="text-lg text-navy-600 max-w-3xl mx-auto">
              Real families sharing their experiences with Family Shapes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-sage-200">
                <CardContent className="pt-6">
                  <blockquote className="text-navy-700 mb-4 italic">
                    "{testimonial.quote}"
                  </blockquote>
                  <div className="font-semibold text-navy-800">{testimonial.author}</div>
                  <div className="text-sm text-navy-600">{testimonial.role}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
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
              <Link to="/auth">
                Get Started Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button asChild variant="text" size="lg" className="border-white text-white hover:bg-white hover:text-coral-600 px-8 py-6 text-lg">
              <Link to="/contact">
                Contact Us
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <CTA />

      <Footer />
    </div>
  );
};

export default FamilyCommunity;