import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Heart, Building2, Users, ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

const GetStarted = () => {
  const [selectedUserType, setSelectedUserType] = useState<string>("");
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();

  const handleUserTypeSelect = (userType: string) => {
    setSelectedUserType(userType);
    if (userType === "family") {
      // Direct to signup for families
      navigate("/signup?role=family");
    } else {
      setShowForm(true);
    }
  };

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    if (selectedUserType === "clinic") {
      toast({
        title: "Thank you for your interest!",
        description: "We'll be in touch soon to discuss how Family Shapes can transform your practice.",
      });
    } else if (selectedUserType === "donor") {
      toast({
        title: "Thanks for staying in the loop!",
        description: "We'll keep you updated on Family Shapes developments for donors.",
      });
    }
    
    setShowForm(false);
    setSelectedUserType("");
  };

  const renderForm = () => {
    if (selectedUserType === "clinic") {
      return (
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="orgName">Name of Organization *</Label>
            <Input id="orgName" name="orgName" placeholder="Your clinic or cryobank name" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contactName">Contact Name *</Label>
            <Input id="contactName" name="contactName" placeholder="Your full name" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input id="email" name="email" type="email" placeholder="your.email@clinic.com" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="needs">Tell us about your needs (Optional)</Label>
            <Textarea id="needs" name="needs" placeholder="What specific challenges are you hoping Family Shapes can help with?" />
          </div>
          <Button type="submit" className="w-full bg-navy-600 hover:bg-navy-700">
            Join Waitlist
          </Button>
        </form>
      );
    } else if (selectedUserType === "donor") {
      return (
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="donorName">Name *</Label>
            <Input id="donorName" name="donorName" placeholder="Your full name" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="donorEmail">Email *</Label>
            <Input id="donorEmail" name="donorEmail" type="email" placeholder="your.email@example.com" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="interests">What interests you most? (Optional)</Label>
            <Textarea id="interests" name="interests" placeholder="Tell us what aspects of family connection you're most interested in..." />
          </div>
          <Button type="submit" className="w-full bg-dusty-600 hover:bg-dusty-700">
            Stay in the Loop
          </Button>
        </form>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-coral-50 to-dusty-50 p-6 lg:p-12">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-light text-navy-800 mb-6">
            Welcome to Family Shapes
          </h1>
          <p className="text-xl text-navy-600 max-w-2xl mx-auto">
            Let's get you started with the right experience for your needs
          </p>
        </div>

        {/* Main Question */}
        <Card className="mb-8 border-2 border-navy-200 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl text-navy-800 mb-2">Who are you?</CardTitle>
            <CardDescription className="text-navy-600">
              Choose the option that best describes you to get personalized next steps
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup 
              value={selectedUserType} 
              onValueChange={setSelectedUserType}
              className="space-y-4"
            >
              {/* Family Option */}
              <div 
                className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer hover:border-coral-300 ${
                  selectedUserType === "family" ? "border-coral-500 bg-coral-50" : "border-border"
                }`}
                onClick={() => setSelectedUserType("family")}
              >
                <RadioGroupItem value="family" id="family" />
                <div className="flex items-center space-x-4 flex-1">
                  <div className="w-12 h-12 bg-gradient-to-br from-coral-400 to-dusty-500 rounded-full flex items-center justify-center">
                    <Heart className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="family" className="text-lg font-medium text-navy-800 cursor-pointer">
                      I'm a Family
                    </Label>
                    <p className="text-sm text-navy-600">
                      Built through donor conception, adoption, or ART
                    </p>
                  </div>
                  <div className="text-sm text-coral-600 font-medium">
                    Instant Access →
                  </div>
                </div>
              </div>

              {/* Clinic Option */}
              <div 
                className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer hover:border-navy-300 ${
                  selectedUserType === "clinic" ? "border-navy-500 bg-navy-50" : "border-border"
                }`}
                onClick={() => setSelectedUserType("clinic")}
              >
                <RadioGroupItem value="clinic" id="clinic" />
                <div className="flex items-center space-x-4 flex-1">
                  <div className="w-12 h-12 bg-gradient-to-br from-navy-600 to-navy-700 rounded-full flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="clinic" className="text-lg font-medium text-navy-800 cursor-pointer">
                      I'm a Cryobank or Clinic
                    </Label>
                    <p className="text-sm text-navy-600">
                      Professional organization serving families
                    </p>
                  </div>
                  <div className="text-sm text-navy-600 font-medium">
                    Join Waitlist →
                  </div>
                </div>
              </div>

              {/* Donor Option */}
              <div 
                className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer hover:border-dusty-300 ${
                  selectedUserType === "donor" ? "border-dusty-500 bg-dusty-50" : "border-border"
                }`}
                onClick={() => setSelectedUserType("donor")}
              >
                <RadioGroupItem value="donor" id="donor" />
                <div className="flex items-center space-x-4 flex-1">
                  <div className="w-12 h-12 bg-gradient-to-br from-dusty-400 to-dusty-600 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="donor" className="text-lg font-medium text-navy-800 cursor-pointer">
                      I'm a Donor
                    </Label>
                    <p className="text-sm text-navy-600">
                      Sperm, egg, or embryo donor
                    </p>
                  </div>
                  <div className="text-sm text-dusty-600 font-medium">
                    Stay Updated →
                  </div>
                </div>
              </div>
            </RadioGroup>

            {/* Next Button */}
            {selectedUserType && (
              <div className="text-center mt-8">
                <Button 
                  onClick={() => handleUserTypeSelect(selectedUserType)}
                  size="lg"
                  className={`px-8 py-3 ${
                    selectedUserType === "family" 
                      ? "bg-coral-600 hover:bg-coral-700" 
                      : selectedUserType === "clinic"
                      ? "bg-navy-600 hover:bg-navy-700"
                      : "bg-dusty-600 hover:bg-dusty-700"
                  }`}
                >
                  Continue <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Form Sheet */}
        <Sheet open={showForm} onOpenChange={setShowForm}>
          <SheetContent side="right" className="w-full sm:max-w-md">
            <SheetHeader>
              <SheetTitle>
                {selectedUserType === "clinic" ? "Join the Waitlist" : "Stay in the Loop"}
              </SheetTitle>
              <SheetDescription>
                {selectedUserType === "clinic" 
                  ? "Tell us about your organization and we'll be in touch about early access."
                  : "We'll keep you updated on Family Shapes developments for donors."
                }
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6">
              {renderForm()}
            </div>
          </SheetContent>
        </Sheet>

        <div className="text-center mt-12">
          <p className="text-navy-600 mb-4">
            Questions about which option is right for you?
          </p>
          <Button asChild variant="ghost" className="text-coral-600 hover:text-coral-700">
            <Link to="/contact">Contact us for guidance</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GetStarted;