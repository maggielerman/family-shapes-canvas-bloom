
import { Button } from "@/components/ui/button";
import { Menu, Heart } from "lucide-react";
import { useAuth } from "@/components/auth/AuthContext";
import { Link } from "react-router-dom";

const Header = () => {
  const { user } = useAuth();

  return (
    <header className="w-full px-6 lg:px-12 py-8 flex items-center justify-between bg-white">
      <Link to="/" className="flex items-center space-x-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-coral-400 to-dusty-500 flex items-center justify-center">
          <Heart className="w-4 h-4 text-white" />
        </div>
        <span className="text-2xl font-light tracking-wide text-navy-800">Family Shapes</span>
      </Link>
      
      <nav className="hidden md:flex items-center space-x-12">
        <a href="#features" className="text-xxs uppercase tracking-wider text-navy-600 hover:text-coral-600 transition-colors">
          Features
        </a>
        <Link to="/about" className="text-xxs uppercase tracking-wider text-navy-600 hover:text-coral-600 transition-colors">
          About
        </Link>
        <Link to="/contact" className="text-xxs uppercase tracking-wider text-navy-600 hover:text-coral-600 transition-colors">
          Contact
        </Link>
      </nav>

      <div className="flex items-center space-x-4">
        {user ? (
          <Button asChild
            size="sm" 
            className="bg-coral-600 hover:bg-coral-700 text-white text-xxs uppercase tracking-wider px-6"
          >
            <Link to="/dashboard">Dashboard</Link>
          </Button>
        ) : (
          <>
            <Button asChild
              variant="ghost" 
              size="sm" 
              className="hidden md:block text-xxs uppercase tracking-wider text-navy-700 hover:text-coral-600 hover:bg-coral-50"
            >
              <Link to="/auth">Sign In</Link>
            </Button>
            <Button asChild
              size="sm" 
              className="bg-coral-600 hover:bg-coral-700 text-white text-xxs uppercase tracking-wider px-6"
            >
              <Link to="/auth">Get Started</Link>
            </Button>
          </>
        )}
        <Button variant="ghost" size="sm" className="md:hidden">
          <Menu className="w-4 h-4" />
        </Button>
      </div>
    </header>
  );
};

export default Header;
