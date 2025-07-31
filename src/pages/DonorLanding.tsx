import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Settings, Eye, MessageSquare, Users, Lock, ArrowRight, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { DonorHero } from "@/components/marketing/donor-landing";

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
      
      <DonorHero />

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
              <Link to="/donor-waitlist">
                Join the Waitlist
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

    </div>
  );
};

export default DonorLanding;