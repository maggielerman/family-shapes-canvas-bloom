import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Building2, Heart, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

const GetStarted = () => {
  const navigate = useNavigate();

  const handleWaitlistSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    toast({
      title: "Welcome to the waitlist! 🎉",
      description: "We'll reach out within 48 hours to discuss your needs and demo the platform.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-6 py-16 max-w-7xl">
        
        {/* Main Two-Column Section */}
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-24">
          
          {/* Left Column - Value Prop & Form */}
          <div className="space-y-8">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                <Building2 className="w-4 h-4" />
                For Fertility Organizations
              </div>
              
              <h1 className="text-4xl lg:text-5xl font-bold text-foreground leading-tight">
                Transform Your Practice with 
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/70 block mt-2">
                  Family Connection Solutions
                </span>
              </h1>
              
              <p className="text-xl text-muted-foreground leading-relaxed">
                Help your clients build lasting family relationships, manage comprehensive donor databases, 
                and provide enhanced support services that extend far beyond conception.
              </p>
            </div>

            {/* Waitlist Form */}
            <div className="bg-card border border-border rounded-xl p-8 shadow-sm">
              <h2 className="text-xl font-semibold text-foreground mb-6">Join the Enterprise Waitlist</h2>
              
              <form onSubmit={handleWaitlistSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium">Your Name</Label>
                    <Input 
                      id="name" 
                      name="name" 
                      placeholder="Full name"
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-sm font-medium">Title</Label>
                    <Input 
                      id="title" 
                      name="title" 
                      placeholder="e.g., Director"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="organization" className="text-sm font-medium">Organization</Label>
                  <Input 
                    id="organization" 
                    name="organization" 
                    placeholder="e.g., Pacific Fertility Center"
                    required 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">Work Email</Label>
                  <Input 
                    id="email" 
                    name="email" 
                    type="email" 
                    placeholder="you@organization.com"
                    required 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="needs" className="text-sm font-medium">Primary Challenge <span className="text-muted-foreground">(Optional)</span></Label>
                  <Textarea 
                    id="needs" 
                    name="needs" 
                    placeholder="e.g., Help families connect with siblings, improve donor matching..."
                    className="resize-none h-20"
                  />
                </div>
                
                <Button type="submit" className="w-full h-11 text-base font-medium">
                  Request Demo & Join Waitlist
                </Button>
              </form>
              
              <p className="text-xs text-muted-foreground text-center mt-4">
                We'll contact you within 48 hours to schedule a personalized demo
              </p>
              
              {/* Mini CTAs for other audiences */}
              <div className="mt-8 pt-6 border-t border-border">
                <p className="text-sm text-muted-foreground mb-3">Are you a family or donor?</p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => navigate("/signup?role=family")}
                    className="flex-1 text-sm"
                  >
                    <Heart className="w-4 h-4 mr-2" />
                    Family Beta Access
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => navigate("/contact")}
                    className="flex-1 text-sm"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Donor Updates
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Column - Image Placeholder */}
          <div className="relative">
            <div className="aspect-[4/3] bg-gradient-to-br from-muted/50 to-muted rounded-2xl border border-border shadow-sm flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
                  <Building2 className="w-8 h-8 text-primary" />
                </div>
                <div className="space-y-2">
                  <p className="text-lg font-medium text-foreground">Product Demo</p>
                  <p className="text-sm text-muted-foreground max-w-xs">
                    See how Family Shapes transforms family connection management for fertility organizations
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default GetStarted;