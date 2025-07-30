import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Settings, Eye, MessageSquare, Users, Lock, ArrowRight, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

const DonorLanding = () => {
  const features = [
    {
      icon: Shield,
      title: "Privacy Controls",
      description: "Set clear boundaries and control what information you share with recipient families and offspring."
    },
    {
      icon: Settings,
      title: "Donation Management",
      description: "Track your donation history, monitor offspring counts, and manage your donor profile across clinics."
    },
    {
      icon: Eye,
      title: "Transparency Tools",
      description: "Access clear reporting on how your donations are being used and by which clinics and families."
    },
    {
      icon: MessageSquare,
      title: "Communication Preferences",
      description: "Define how and when families can contact you, with full control over your communication boundaries."
    },
    {
      icon: Users,
      title: "Family Connections",
      description: "Choose whether and how to connect with families, with options ranging from no contact to full communication."
    },
    {
      icon: Lock,
      title: "Secure Data Sharing",
      description: "Share medical updates and important health information securely when you choose to do so."
    }
  ];

  const benefits = [
    "Full control over your privacy and communication preferences",
    "Clear visibility into donation outcomes and offspring counts",
    "Secure platform for medical information sharing",
    "Tools to prevent unauthorized use of your donations",
    "Support for setting and maintaining healthy boundaries"
  ];

  return (
    <div className="min-h-screen bg-background">
      
      {/* Hero Section */}
      <section className="px-4 sm:px-6 lg:px-12 py-16 sm:py-20 lg:py-28">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light text-navy-800 mb-6 lg:mb-8 leading-tight">
            Empower Your
            <span className="block text-coral-600 font-normal">Donor Journey</span>
          </h1>
          <p className="text-lg sm:text-xl lg:text-2xl text-navy-600 mb-8 lg:mb-12 max-w-4xl mx-auto leading-relaxed">
            Take control of your donation experience with tools designed for transparency, 
            privacy management, and healthy boundary setting with recipient families.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button asChild size="lg" className="bg-coral-600 hover:bg-coral-700 text-white px-8 py-6 text-lg">
              <Link to="/donor/auth">
                Access Donor Portal
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button asChild variant="ghost" size="lg" className="text-coral-600 hover:bg-navy-50 px-8 py-6 text-lg">
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
              <div className="text-4xl font-bold text-coral-600 mb-2">5,000+</div>
              <div className="text-navy-600">Active Donors</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-coral-600 mb-2">200+</div>
              <div className="text-navy-600">Partner Clinics</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-coral-600 mb-2">98%</div>
              <div className="text-navy-600">Privacy Satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-4 sm:px-6 lg:px-12 py-16 sm:py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-light text-navy-800 mb-4">
              Your Donation, Your Control
            </h2>
            <p className="text-lg text-navy-600 max-w-3xl mx-auto">
              Comprehensive tools designed specifically for donors to maintain transparency and set healthy boundaries.
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

      {/* Benefits Section */}
      <section className="px-4 sm:px-6 lg:px-12 py-16 sm:py-20 bg-sage-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-light text-navy-800 mb-4">
              Why Donors Choose Family Shapes
            </h2>
            <p className="text-lg text-navy-600 max-w-3xl mx-auto">
              Join thousands of donors who have taken control of their donation experience.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <ul className="space-y-4">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="w-6 h-6 text-coral-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-navy-700">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-sage-200">
              <h3 className="text-2xl font-semibold text-navy-800 mb-4">
                "Finally, transparency and control"
              </h3>
              <p className="text-navy-600 mb-6 italic">
                "Family Shapes gave me the tools I needed to set clear boundaries while still being able to help families. 
                I know exactly how my donations are being used and can control my privacy settings completely."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-coral-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-coral-600 font-semibold">M.K.</span>
                </div>
                <div>
                  <div className="font-semibold text-navy-800">Michael K.</div>
                  <div className="text-sm text-navy-600">Donor since 2019</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-4 sm:px-6 lg:px-12 py-16 sm:py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-light text-navy-800 mb-4">
              Getting Started is Simple
            </h2>
            <p className="text-lg text-navy-600 max-w-3xl mx-auto">
              Set up your donor profile and privacy preferences in minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-coral-600 text-white flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                1
              </div>
              <h3 className="text-xl font-semibold text-navy-800 mb-4">Create Your Profile</h3>
              <p className="text-navy-600">
                Set up your secure donor profile and connect it to your existing clinic relationships.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-coral-600 text-white flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                2
              </div>
              <h3 className="text-xl font-semibold text-navy-800 mb-4">Set Your Preferences</h3>
              <p className="text-navy-600">
                Define your privacy settings, communication boundaries, and sharing preferences.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-coral-600 text-white flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                3
              </div>
              <h3 className="text-xl font-semibold text-navy-800 mb-4">Stay in Control</h3>
              <p className="text-navy-600">
                Monitor your donations, update preferences, and maintain healthy boundaries.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 sm:px-6 lg:px-12 py-16 sm:py-20 bg-gradient-to-r from-coral-600 to-dusty-600">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-3xl sm:text-4xl font-light mb-6">
            Ready to Take Control?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join the growing community of donors who have taken control of their donation experience.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary" className="bg-white text-coral-600 hover:bg-sage-50 px-8 py-6 text-lg">
              <Link to="/donor/auth">
                Access Donor Portal
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button asChild variant="ghost" size="lg" className="border-white text-white hover:bg-white hover:text-coral-600 px-8 py-6 text-lg">
              <Link to="/contact">
                Contact Support
              </Link>
            </Button>
          </div>
        </div>
      </section>

    </div>
  );
};

export default DonorLanding;