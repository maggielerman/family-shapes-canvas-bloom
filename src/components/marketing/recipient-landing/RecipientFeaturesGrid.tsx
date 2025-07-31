import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Heart, Shield, MessageSquare, Search, Network } from "lucide-react";

const RecipientFeaturesGrid = () => {
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
      title: "Build Community",
      description: "Join a supportive network of donor families. Share experiences, advice, and resources with others who understand the unique journey of family-building via donor conception."
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

  return (
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
  );
};

export default RecipientFeaturesGrid; 