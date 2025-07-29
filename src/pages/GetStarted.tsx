import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Heart, Building2, Users } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/navigation/Header";

const GetStarted = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-coral-50 to-dusty-50">
      <Header />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-light text-navy-800 mb-6">
            Choose Your Path
          </h1>
          <p className="text-xl text-navy-600 max-w-2xl mx-auto">
            Select the option that best describes you to get started with Family Shapes
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Recipient Family Card */}
          <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 hover:border-coral-300">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-coral-400 to-dusty-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl text-navy-800">Recipient Family</CardTitle>
              <CardDescription className="text-navy-600">
                Families who used donor conception, adoption, or ART to build their family
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <ul className="text-sm text-navy-600 mb-6 space-y-2">
                <li>• Create and share family trees</li>
                <li>• Connect with genetic siblings</li>
                <li>• Manage complex relationships</li>
                <li>• Join sibling groups</li>
              </ul>
              <Button 
                asChild 
                className="w-full bg-coral-600 hover:bg-coral-700 text-white"
              >
                <Link to="/signup?role=family">Start Beta</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Organization Card */}
          <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 hover:border-coral-300">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-navy-600 to-navy-700 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl text-navy-800">Cryobanks & Clinics</CardTitle>
              <CardDescription className="text-navy-600">
                Fertility clinics and sperm banks serving recipient families
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <ul className="text-sm text-navy-600 mb-6 space-y-2">
                <li>• Manage donor databases</li>
                <li>• Facilitate sibling connections</li>
                <li>• Enhanced family services</li>
                <li>• Professional tools</li>
              </ul>
              <Button 
                asChild 
                variant="outline" 
                className="w-full border-navy-600 text-navy-600 hover:bg-navy-600 hover:text-white"
              >
                <Link to="/waitlist/clinic">Join Waitlist</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Donor Card */}
          <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 hover:border-coral-300">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-dusty-400 to-dusty-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Users className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl text-navy-800">Donors</CardTitle>
              <CardDescription className="text-navy-600">
                Sperm, egg, and embryo donors wanting to connect with offspring
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <ul className="text-sm text-navy-600 mb-6 space-y-2">
                <li>• Connect with donor offspring</li>
                <li>• Share medical updates</li>
                <li>• Build extended families</li>
                <li>• Maintain privacy controls</li>
              </ul>
              <Button 
                asChild 
                variant="outline" 
                className="w-full border-dusty-600 text-dusty-600 hover:bg-dusty-600 hover:text-white"
              >
                <Link to="/waitlist/donor">Join Waitlist</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-12">
          <p className="text-navy-600 mb-4">
            Not sure which option fits you?
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