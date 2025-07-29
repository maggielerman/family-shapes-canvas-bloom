import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Heart, Building2, Users, ArrowRight, Check, Star, Users2, TreePine } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

const GetStarted = () => {
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState<'clinic' | 'donor'>('clinic');
  const navigate = useNavigate();

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    if (formType === "clinic") {
      toast({
        title: "Welcome to the waitlist! 🎉",
        description: "We'll reach out within 48 hours to discuss your needs and demo the platform.",
      });
    } else {
      toast({
        title: "Thanks for joining! 📬",
        description: "You'll be the first to know when donor features launch.",
      });
    }
    
    setShowForm(false);
  };

  const openForm = (type: 'clinic' | 'donor') => {
    setFormType(type);
    setShowForm(true);
  };

  const renderForm = () => {
    if (formType === "clinic") {
      return (
        <form onSubmit={handleFormSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="orgName" className="text-sm font-medium">Organization Name</Label>
            <Input 
              id="orgName" 
              name="orgName" 
              placeholder="e.g., Pacific Fertility Center"
              className="h-11"
              required 
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="contactName" className="text-sm font-medium">Your Name</Label>
              <Input 
                id="contactName" 
                name="contactName" 
                placeholder="First Last"
                className="h-11"
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium">Title</Label>
              <Input 
                id="title" 
                name="title" 
                placeholder="e.g., Director"
                className="h-11"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">Work Email</Label>
            <Input 
              id="email" 
              name="email" 
              type="email" 
              placeholder="you@clinic.com"
              className="h-11"
              required 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="needs" className="text-sm font-medium">What challenges are you hoping to solve? <span className="text-muted-foreground">(Optional)</span></Label>
            <Textarea 
              id="needs" 
              name="needs" 
              placeholder="e.g., Help families connect with siblings, improve donor matching, streamline family tree management..."
              className="resize-none h-20"
            />
          </div>
          <Button type="submit" className="w-full h-11 bg-navy-600 hover:bg-navy-700 text-base font-medium">
            Request Demo & Join Waitlist
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            We'll contact you within 48 hours to schedule a personalized demo
          </p>
        </form>
      );
    } else {
      return (
        <form onSubmit={handleFormSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="donorName" className="text-sm font-medium">Name</Label>
            <Input 
              id="donorName" 
              name="donorName" 
              placeholder="First Last"
              className="h-11"
              required 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="donorEmail" className="text-sm font-medium">Email</Label>
            <Input 
              id="donorEmail" 
              name="donorEmail" 
              type="email" 
              placeholder="your.email@example.com"
              className="h-11"
              required 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="interests" className="text-sm font-medium">What interests you most? <span className="text-muted-foreground">(Optional)</span></Label>
            <Textarea 
              id="interests" 
              name="interests" 
              placeholder="e.g., Connecting with offspring, sharing medical updates, staying informed about family growth..."
              className="resize-none h-20"
            />
          </div>
          <Button type="submit" className="w-full h-11 bg-dusty-600 hover:bg-dusty-700 text-base font-medium">
            Stay in the Loop
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            We'll keep you updated on Family Shapes developments for donors
          </p>
        </form>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-6 py-16 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <Badge className="mb-6 bg-coral-100 text-coral-800 hover:bg-coral-100 border-coral-200">
            <Star className="w-3 h-3 mr-1 fill-current" />
            Trusted by leading fertility organizations
          </Badge>
          <h1 className="text-5xl lg:text-6xl font-bold text-foreground mb-6 tracking-tight">
            Choose Your
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-coral-600 to-dusty-600 block">
              Family Shapes
            </span>
            Experience
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Get started with the right tools for your needs. Whether you're building families, 
            supporting them professionally, or exploring connections.
          </p>
        </div>

        {/* User Type Selection */}
        <Tabs defaultValue="families" className="w-full max-w-4xl mx-auto">
          <TabsList className="grid w-full grid-cols-3 h-14 p-1 bg-muted">
            <TabsTrigger value="families" className="text-sm font-medium h-full">
              <Heart className="w-4 h-4 mr-2" />
              Families
            </TabsTrigger>
            <TabsTrigger value="organizations" className="text-sm font-medium h-full">
              <Building2 className="w-4 h-4 mr-2" />
              Organizations
            </TabsTrigger>
            <TabsTrigger value="donors" className="text-sm font-medium h-full">
              <Users className="w-4 h-4 mr-2" />
              Donors
            </TabsTrigger>
          </TabsList>

          {/* Families Tab */}
          <TabsContent value="families" className="mt-8">
            <Card className="border-2 border-coral-200 bg-gradient-to-br from-coral-50/50 to-background">
              <CardContent className="p-8">
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-coral-500 to-coral-600 flex items-center justify-center shadow-lg">
                      <TreePine className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-2xl font-bold text-foreground">
                        For Families Built Through ART
                      </h3>
                      <Badge className="bg-coral-600 text-white hover:bg-coral-600">
                        Beta Access
                      </Badge>
                    </div>
                    <p className="text-muted-foreground mb-6 text-lg leading-relaxed">
                      Create beautiful family trees, connect with genetic siblings, and manage complex 
                      relationships with privacy and ease. Perfect for families built through donor 
                      conception, adoption, or surrogacy.
                    </p>
                    
                    <div className="grid md:grid-cols-2 gap-6 mb-8">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-foreground">
                          <Check className="w-4 h-4 text-coral-600 flex-shrink-0" />
                          <span className="text-sm">Instant family tree creation</span>
                        </div>
                        <div className="flex items-center gap-2 text-foreground">
                          <Check className="w-4 h-4 text-coral-600 flex-shrink-0" />
                          <span className="text-sm">Sibling group discovery</span>
                        </div>
                        <div className="flex items-center gap-2 text-foreground">
                          <Check className="w-4 h-4 text-coral-600 flex-shrink-0" />
                          <span className="text-sm">Privacy-first sharing</span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-foreground">
                          <Check className="w-4 h-4 text-coral-600 flex-shrink-0" />
                          <span className="text-sm">Donor connection tools</span>
                        </div>
                        <div className="flex items-center gap-2 text-foreground">
                          <Check className="w-4 h-4 text-coral-600 flex-shrink-0" />
                          <span className="text-sm">Multi-generation tracking</span>
                        </div>
                        <div className="flex items-center gap-2 text-foreground">
                          <Check className="w-4 h-4 text-coral-600 flex-shrink-0" />
                          <span className="text-sm">Secure document sharing</span>
                        </div>
                      </div>
                    </div>

                    <Button 
                      onClick={() => navigate("/signup?role=family")}
                      size="lg" 
                      className="bg-coral-600 hover:bg-coral-700 text-white h-12 px-8 text-base font-medium"
                    >
                      Start Building Your Tree
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Organizations Tab */}
          <TabsContent value="organizations" className="mt-8">
            <Card className="border-2 border-navy-200 bg-gradient-to-br from-navy-50/50 to-background">
              <CardContent className="p-8">
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-navy-600 to-navy-700 flex items-center justify-center shadow-lg">
                      <Building2 className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-2xl font-bold text-foreground">
                        For Fertility Clinics & Cryobanks
                      </h3>
                      <Badge className="bg-navy-100 text-navy-800 border-navy-200">
                        Enterprise
                      </Badge>
                    </div>
                    <p className="text-muted-foreground mb-6 text-lg leading-relaxed">
                      Transform your practice with comprehensive family connection solutions. 
                      Help clients build lasting relationships, manage donor databases, and 
                      provide enhanced family support services.
                    </p>
                    
                    <div className="grid md:grid-cols-2 gap-6 mb-8">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-foreground">
                          <Check className="w-4 h-4 text-navy-600 flex-shrink-0" />
                          <span className="text-sm">Comprehensive donor databases</span>
                        </div>
                        <div className="flex items-center gap-2 text-foreground">
                          <Check className="w-4 h-4 text-navy-600 flex-shrink-0" />
                          <span className="text-sm">Sibling group management</span>
                        </div>
                        <div className="flex items-center gap-2 text-foreground">
                          <Check className="w-4 h-4 text-navy-600 flex-shrink-0" />
                          <span className="text-sm">Client family tree collaboration</span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-foreground">
                          <Check className="w-4 h-4 text-navy-600 flex-shrink-0" />
                          <span className="text-sm">Advanced matching capabilities</span>
                        </div>
                        <div className="flex items-center gap-2 text-foreground">
                          <Check className="w-4 h-4 text-navy-600 flex-shrink-0" />
                          <span className="text-sm">Enterprise security & compliance</span>
                        </div>
                        <div className="flex items-center gap-2 text-foreground">
                          <Check className="w-4 h-4 text-navy-600 flex-shrink-0" />
                          <span className="text-sm">White-label integration options</span>
                        </div>
                      </div>
                    </div>

                    <Button 
                      onClick={() => openForm('clinic')}
                      size="lg" 
                      className="bg-navy-600 hover:bg-navy-700 text-white h-12 px-8 text-base font-medium"
                    >
                      Request Enterprise Demo
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Donors Tab */}
          <TabsContent value="donors" className="mt-8">
            <Card className="border-2 border-dusty-200 bg-gradient-to-br from-dusty-50/50 to-background">
              <CardContent className="p-8">
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-dusty-500 to-dusty-600 flex items-center justify-center shadow-lg">
                      <Users2 className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-2xl font-bold text-foreground">
                        For Sperm, Egg & Embryo Donors
                      </h3>
                      <Badge className="bg-dusty-100 text-dusty-800 border-dusty-200">
                        Coming Soon
                      </Badge>
                    </div>
                    <p className="text-muted-foreground mb-6 text-lg leading-relaxed">
                      Connect meaningfully with donor offspring, share important medical updates, 
                      and build extended family relationships while maintaining the privacy and 
                      boundaries that work for you.
                    </p>
                    
                    <div className="grid md:grid-cols-2 gap-6 mb-8">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-foreground">
                          <Check className="w-4 h-4 text-dusty-600 flex-shrink-0" />
                          <span className="text-sm">Connect with donor offspring</span>
                        </div>
                        <div className="flex items-center gap-2 text-foreground">
                          <Check className="w-4 h-4 text-dusty-600 flex-shrink-0" />
                          <span className="text-sm">Share medical updates securely</span>
                        </div>
                        <div className="flex items-center gap-2 text-foreground">
                          <Check className="w-4 h-4 text-dusty-600 flex-shrink-0" />
                          <span className="text-sm">Granular privacy controls</span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-foreground">
                          <Check className="w-4 h-4 text-dusty-600 flex-shrink-0" />
                          <span className="text-sm">Extended family building</span>
                        </div>
                        <div className="flex items-center gap-2 text-foreground">
                          <Check className="w-4 h-4 text-dusty-600 flex-shrink-0" />
                          <span className="text-sm">Communication preferences</span>
                        </div>
                        <div className="flex items-center gap-2 text-foreground">
                          <Check className="w-4 h-4 text-dusty-600 flex-shrink-0" />
                          <span className="text-sm">Anonymous or open connections</span>
                        </div>
                      </div>
                    </div>

                    <Button 
                      onClick={() => openForm('donor')}
                      size="lg" 
                      className="bg-dusty-600 hover:bg-dusty-700 text-white h-12 px-8 text-base font-medium"
                    >
                      Join Early Access List
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Trust Indicators */}
        <div className="text-center mt-16 pt-12 border-t border-border">
          <p className="text-sm text-muted-foreground mb-4">
            Questions about which option is right for you?
          </p>
          <Button variant="ghost" className="text-coral-600 hover:text-coral-700 hover:bg-coral-50">
            Get personalized guidance →
          </Button>
        </div>
      </div>

      {/* Form Sheet */}
      <Sheet open={showForm} onOpenChange={setShowForm}>
        <SheetContent side="right" className="w-full sm:max-w-lg">
          <SheetHeader className="pb-6">
            <SheetTitle className="text-xl">
              {formType === "clinic" ? "Request Enterprise Demo" : "Join Early Access"}
            </SheetTitle>
            <SheetDescription className="text-base">
              {formType === "clinic" 
                ? "Let's discuss how Family Shapes can transform your practice and better serve your clients."
                : "Be the first to know when donor features launch and help shape the experience."
              }
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-6">
            {renderForm()}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default GetStarted;