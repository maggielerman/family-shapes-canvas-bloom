import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

interface RecipientFeatureBulletsProps {
  variant?: 'default' | 'coral';
}

const RecipientFeatureBullets = ({ variant = 'default' }: RecipientFeatureBulletsProps) => {
  const features = [
    {
      title: "Connect with Diblings",
      description: "Find and connect with donor siblings through our secure network"
    },
    {
      title: "Track Family Networks",
      description: "Visualize your donor family tree and understand genetic connections"
    },
    {
      title: "Share Medical Updates",
      description: "Exchange critical health information with family members"
    },
    {
      title: "Build Community",
      description: "Join a supportive network of donor families"
    },
    {
      title: "Search & Discovery",
      description: "Advanced search tools to find family members"
    },
    {
      title: "Media & Document Storage",
      description: "Organize, store, and share photos and documents"
    }
  ];

  const isCoralVariant = variant === 'coral';

  return (
    <section className={`w-full px-4 sm:px-6 lg:px-12 py-12 sm:py-16 lg:py-24 ${
      isCoralVariant 
        ? 'bg-coral-600' 
        : 'bg-gradient-to-br from-sage-50 to-dusty-50'
    }`}>
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left side - Features */}
          <div>
            <div className="mb-6 lg:mb-8">
              <span className={`text-xxs uppercase tracking-widest font-medium ${
                isCoralVariant ? 'text-coral-100' : 'text-coral-600'
              }`}>
                Core Capabilities
              </span>
              <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-extralight mt-4 mb-6 leading-tight tracking-tight ${
                isCoralVariant ? 'text-white' : 'text-navy-900'
              }`}>
                Everything You Need to
                <br />
                <span className={isCoralVariant ? 'text-coral-100' : 'text-coral-600'}>Connect</span>
              </h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6 mb-8">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                    isCoralVariant ? 'bg-white' : 'bg-coral-600'
                  }`}></div>
                  <div>
                    <h3 className={`text-sm font-medium mb-1 ${
                      isCoralVariant ? 'text-white' : 'text-navy-900'
                    }`}>{feature.title}</h3>
                    <p className={`text-xs ${
                      isCoralVariant ? 'text-coral-100' : 'text-navy-600'
                    }`}>{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <Button asChild
              size="lg" 
              className={`px-6 py-4 text-sm font-medium tracking-wide group ${
                isCoralVariant 
                  ? 'bg-white text-coral-600 hover:bg-coral-50' 
                  : 'bg-coral-600 hover:bg-coral-700 text-white'
              }`}
            >
              <Link to="/recipient-private-beta">
                Join the Private Beta
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>

          {/* Right side - Image/Content */}
          <div className="relative">
            <div className={`aspect-square rounded-2xl shadow-2xl overflow-hidden border ${
              isCoralVariant 
                ? 'border-coral-500 bg-coral-500' 
                : 'border-warm-200 bg-gradient-to-br from-coral-100 to-dusty-100'
            } flex items-center justify-center`}>
              <div className="text-center p-8">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                  isCoralVariant ? 'bg-white text-coral-600' : 'bg-coral-600 text-white'
                }`}>
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h3 className={`text-xl font-medium mb-2 ${
                  isCoralVariant ? 'text-white' : 'text-navy-900'
                }`}>Family Connections</h3>
                <p className={`text-sm ${
                  isCoralVariant ? 'text-coral-100' : 'text-navy-600'
                }`}>Discover and build meaningful relationships with your genetic family</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RecipientFeatureBullets; 