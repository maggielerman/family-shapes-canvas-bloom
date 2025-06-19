
import { Button } from "@/components/ui/button";
import { Menu, Heart } from "lucide-react";

const Header = () => {
  return (
    <header className="w-full px-6 lg:px-12 py-8 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-dusty-300 to-sage-400 flex items-center justify-center">
          <Heart className="w-4 h-4 text-warm-800" />
        </div>
        <span className="text-2xl font-light tracking-wide text-warm-800">Family Shapes</span>
      </div>
      
      <nav className="hidden md:flex items-center space-x-12">
        <a href="#features" className="text-xxs uppercase tracking-wider text-warm-600 hover:text-warm-800 transition-colors">
          Features
        </a>
        <a href="#about" className="text-xxs uppercase tracking-wider text-warm-600 hover:text-warm-800 transition-colors">
          About
        </a>
        <a href="#contact" className="text-xxs uppercase tracking-wider text-warm-600 hover:text-warm-800 transition-colors">
          Contact
        </a>
      </nav>

      <div className="flex items-center space-x-4">
        <Button 
          variant="ghost" 
          size="sm" 
          className="hidden md:block text-xxs uppercase tracking-wider text-warm-700 hover:text-warm-800 hover:bg-warm-100"
        >
          Sign In
        </Button>
        <Button 
          size="sm" 
          className="bg-warm-700 hover:bg-warm-800 text-warm-50 text-xxs uppercase tracking-wider px-6"
        >
          Get Started
        </Button>
        <Button variant="ghost" size="sm" className="md:hidden">
          <Menu className="w-4 h-4" />
        </Button>
      </div>
    </header>
  );
};

export default Header;
