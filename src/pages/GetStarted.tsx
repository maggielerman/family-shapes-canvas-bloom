import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Heart, Building2, Users } from "lucide-react";
import { Link } from "react-router-dom";

const GetStarted = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-coral-50 to-dusty-50 p-6 lg:p-12">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-light text-navy-800 mb-6">
            Partner with Family Shapes
          </h1>
          <p className="text-xl text-navy-600 max-w-3xl mx-auto">
            Join leading organizations in revolutionizing how families connect and grow
          </p>
        </div>

        {/* Featured Cryobanks & Clinics Card */}
        <Card className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-2 border-navy-300 bg-gradient-to-br from-navy-50 to-white mb-12 max-w-4xl mx-auto">
          <CardHeader className="text-center pb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-navy-600 to-navy-700 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <Building2 className="w-10 h-10 text-white" />
            </div>
            <CardTitle className="text-3xl lg:text-4xl text-navy-800 mb-4">Cryobanks & Fertility Clinics</CardTitle>
            <CardDescription className="text-lg text-navy-600 max-w-2xl mx-auto">
              Transform your practice with comprehensive family connection solutions. Help your clients build lasting relationships and manage complex family structures.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div>
                <h4 className="font-semibold text-navy-800 mb-3">Professional Tools</h4>
                <ul className="text-sm text-navy-600 space-y-2">
                  <li>• Comprehensive donor databases</li>
                  <li>• Sibling group management</li>
                  <li>• Family tree collaboration</li>
                  <li>• Privacy and security controls</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-navy-800 mb-3">Enhanced Services</h4>
                <ul className="text-sm text-navy-600 space-y-2">
                  <li>• Client family support</li>
                  <li>• Advanced matching capabilities</li>
                  <li>• Multi-generational tracking</li>
                  <li>• Professional integrations</li>
                </ul>
              </div>
            </div>
            <Button 
              asChild 
              size="lg"
              className="bg-navy-600 hover:bg-navy-700 text-white px-8 py-3 text-lg"
            >
              <Link to="/waitlist/clinic">Request Demo & Join Waitlist</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Secondary Options */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-light text-navy-800 mb-4">Individual Users</h2>
          <p className="text-navy-600">Family Shapes is also available for families and donors</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Recipient Family Card */}
          <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 hover:border-coral-300">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-coral-400 to-dusty-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl text-navy-800">Recipient Families</CardTitle>
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