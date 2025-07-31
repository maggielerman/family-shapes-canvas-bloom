
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { 
  Heart, 
  Menu, 
  ArrowRight, 
  Play, 
  Sparkles,
  Users, 
  Camera, 
  Calendar, 
  MessageCircle, 
  Shield,
  Mail, 
  Twitter, 
  Instagram 
} from "lucide-react";

const FamilyShapesLanding = () => {
  const features = [
    {
      icon: Users,
      title: "Family Circles",
      description: "Create intimate spaces for your immediate and extended family members to connect and share."
    },
    {
      icon: Camera,
      title: "Memory Vault",
      description: "Preserve precious moments with our sophisticated photo and video sharing platform."
    },
    {
      icon: Calendar,
      title: "Family Events",
      description: "Coordinate gatherings, celebrations, and milestones with elegant planning tools."
    },
    {
      icon: MessageCircle,
      title: "Thoughtful Messaging",
      description: "Engage in meaningful conversations with beautifully designed communication features."
    },
    {
      icon: Shield,
      title: "Privacy First",
      description: "Your family's data remains secure with our industry-leading privacy protections."
    },
    {
      icon: Heart,
      title: "Connection Insights",
      description: "Discover patterns in how your family connects and grows closer together."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="w-full px-6 lg:px-12 py-8 flex items-center justify-between bg-white">
        <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center">
            <Heart className="w-4 h-4 text-white" />
          </div>
          <span className="text-2xl font-light tracking-wide text-slate-800">Family Shapes</span>
        </Link>
        
        <nav className="hidden md:flex items-center space-x-12">
          <a href="#features" className="text-xs uppercase tracking-wider text-slate-600 hover:text-orange-600 transition-colors">
            Features
          </a>
          <a href="#contact" className="text-xs uppercase tracking-wider text-slate-600 hover:text-orange-600 transition-colors">
            Contact
          </a>
        </nav>

        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="sm" 
            className="hidden md:block text-xs uppercase tracking-wider text-slate-700 hover:text-orange-600 hover:bg-orange-50"
          >
            Sign In
          </Button>
          <Button 
            size="sm" 
            className="bg-orange-600 hover:bg-orange-700 text-white text-xs uppercase tracking-wider px-6"
          >
            Get Started
          </Button>
          <Button variant="ghost" size="sm" className="md:hidden">
            <Menu className="w-4 h-4" />
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="w-full px-6 lg:px-12 py-24 lg:py-32 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 animate-fade-in">
            <div className="mb-8">
              <span className="text-xs uppercase tracking-widest text-orange-600 font-medium">
                Connecting Families
              </span>
            </div>
            
            <h1 className="text-6xl lg:text-8xl xl:text-9xl font-extralight text-slate-900 mb-8 leading-none tracking-tighter">
              Family
              <br />
              <span className="text-orange-600">Shapes</span>
            </h1>
            
            <div className="max-w-2xl mx-auto mb-12">
              <p className="text-xs uppercase tracking-wider text-slate-600 mb-4 font-medium">
                Where love takes form
              </p>
              <p className="text-lg text-slate-700 leading-relaxed font-light">
                A sophisticated space designed to nurture family connections, 
                share memories, and celebrate the unique shapes that love creates 
                within every family.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Button 
                size="lg" 
                className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-6 text-sm font-medium tracking-wide group"
              >
                Start Your Journey
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <Button 
                variant="ghost" 
                size="lg" 
                className="text-slate-700 hover:text-orange-600 hover:bg-orange-50 px-8 py-6 text-sm font-medium tracking-wide group"
              >
                <Play className="mr-2 w-4 h-4 group-hover:scale-110 transition-transform" />
                Watch Story
              </Button>
            </div>
          </div>

          <div className="relative mt-24">
            <div className="aspect-video bg-gradient-to-br from-orange-100 via-pink-100 to-slate-100 rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center mb-4 mx-auto shadow-lg">
                    <Play className="w-6 h-6 text-orange-600" />
                  </div>
                  <p className="text-xs uppercase tracking-wider text-slate-600">
                    Product Preview
                  </p>
                </div>
              </div>
            </div>
            
            {/* Floating elements */}
            <div className="absolute -top-4 -left-4 w-24 h-24 rounded-full bg-gradient-to-br from-orange-300 to-pink-300 opacity-60 blur-sm"></div>
            <div className="absolute -bottom-6 -right-6 w-32 h-32 rounded-full bg-gradient-to-br from-slate-300 to-orange-200 opacity-40 blur-sm"></div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="w-full px-6 lg:px-12 py-24 lg:py-32 bg-gradient-to-br from-slate-50 to-orange-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <span className="text-xs uppercase tracking-widest text-orange-600 font-medium mb-4 block">
              Features
            </span>
            <h2 className="text-5xl lg:text-6xl font-extralight text-slate-900 mb-6 tracking-tighter">
              Thoughtfully
              <br />
              <span className="text-orange-600">Designed</span>
            </h2>
            <p className="text-xs uppercase tracking-wider text-slate-600 max-w-xl mx-auto">
              Every feature crafted with intention to strengthen family bonds
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card 
                key={feature.title} 
                className="border border-slate-200 bg-white hover:bg-white hover:shadow-xl transition-all duration-300 group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-8">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="w-5 h-5 text-white" />
                  </div>
                  
                  <h3 className="text-xl font-light text-slate-800 mb-3 tracking-tight">
                    {feature.title}
                  </h3>
                  
                  <p className="text-sm text-slate-600 leading-relaxed font-light">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="w-full px-6 lg:px-12 py-24 lg:py-32 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="relative">
            {/* Background decoration */}
            <div className="absolute inset-0 -m-8">
              <div className="w-full h-full bg-gradient-to-br from-orange-100/60 via-pink-100/60 to-slate-100/60 rounded-3xl blur-3xl"></div>
            </div>
            
            <div className="relative z-10 p-12 bg-white/80 backdrop-blur-sm rounded-3xl border border-slate-200">
              <div className="flex items-center justify-center mb-6">
                <Sparkles className="w-6 h-6 text-orange-500 mr-3" />
                <span className="text-xs uppercase tracking-widest text-slate-600 font-medium">
                  Join the Beta
                </span>
                <Sparkles className="w-6 h-6 text-orange-500 ml-3" />
              </div>
              
              <h2 className="text-5xl lg:text-7xl font-extralight text-slate-900 mb-8 tracking-tighter leading-none">
                Ready to Begin
                <br />
                <span className="text-orange-600">Your Story?</span>
              </h2>
              
              <p className="text-lg text-slate-700 mb-12 leading-relaxed font-light max-w-2xl mx-auto">
                Join families around the world who are already creating deeper 
                connections through Family Shapes. Your journey starts with a 
                single invitation.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <Button 
                  size="lg" 
                  className="bg-orange-600 hover:bg-orange-700 text-white px-10 py-6 text-base font-medium tracking-wide group"
                >
                  Request Early Access
                  <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                
                <div className="text-center">
                  <p className="text-xs uppercase tracking-wider text-slate-600 mb-1">
                    Limited Beta Spots
                  </p>
                
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full px-6 lg:px-12 py-16 bg-slate-900 text-slate-100">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div className="md:col-span-2">
              <Link to="/" className="flex items-center space-x-3 mb-6 hover:opacity-80 transition-opacity">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center">
                  <Heart className="w-4 h-4 text-white" />
                </div>
                <span className="text-2xl font-light tracking-wide text-white">Family Shapes</span>
              </Link>
              <p className="text-sm text-slate-300 leading-relaxed font-light max-w-md">
                Thoughtfully designed to nurture family connections and celebrate 
                the unique shapes that love creates within every family.
              </p>
            </div>

            {/* Links */}
            <div>
              <h3 className="text-sm font-medium mb-4 tracking-wide text-white">Product</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-xs uppercase tracking-wider text-slate-400 hover:text-orange-400 transition-colors">Features</a></li>
                <li><a href="#" className="text-xs uppercase tracking-wider text-slate-400 hover:text-orange-400 transition-colors">Privacy</a></li>
                <li><a href="#" className="text-xs uppercase tracking-wider text-slate-400 hover:text-orange-400 transition-colors">Security</a></li>
                <li><a href="#" className="text-xs uppercase tracking-wider text-slate-400 hover:text-orange-400 transition-colors">Support</a></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-sm font-medium mb-4 tracking-wide text-white">Connect</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-xs uppercase tracking-wider text-slate-400 hover:text-orange-400 transition-colors">Blog</a></li>
                <li><a href="#" className="text-xs uppercase tracking-wider text-slate-400 hover:text-orange-400 transition-colors">Contact</a></li>
                <li><a href="#" className="text-xs uppercase tracking-wider text-slate-400 hover:text-orange-400 transition-colors">Careers</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom */}
          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between">
            <p className="text-xs uppercase tracking-wider text-slate-500 mb-4 md:mb-0">
              © 2024 Family Shapes. Crafted with care.
            </p>
            
            <div className="flex items-center space-x-6">
              <a href="#" className="text-slate-500 hover:text-orange-400 transition-colors">
                <Mail className="w-4 h-4" />
              </a>
              <a href="#" className="text-slate-500 hover:text-orange-400 transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="text-slate-500 hover:text-orange-400 transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default FamilyShapesLanding;
