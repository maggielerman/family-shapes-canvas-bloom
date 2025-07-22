
import { Button } from "@/components/ui/button";
import { Menu, Heart, User, Settings, LogOut, X } from "lucide-react";
import { useAuth } from "@/components/auth/AuthContext";
import { Link } from "react-router-dom";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Header = () => {
  const { user, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigationItems = [
    { href: "#features", label: "Features" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <>
      <header className="w-full px-4 sm:px-6 lg:px-12 py-4 sm:py-6 lg:py-8 flex items-center justify-between bg-white relative z-50">
        <Link to="/" className="flex items-center space-x-2 sm:space-x-3">
          <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-coral-400 to-dusty-500 flex items-center justify-center">
            <Heart className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
          </div>
          <span className="text-lg sm:text-xl lg:text-2xl font-light tracking-wide text-navy-800">Family Shapes</span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8 lg:space-x-12">
          {navigationItems.map((item) => (
            item.href.startsWith('#') ? (
              <a 
                key={item.href}
                href={item.href} 
                className="text-xxs uppercase tracking-wider text-navy-600 hover:text-coral-600 transition-colors"
              >
                {item.label}
              </a>
            ) : (
              <Link 
                key={item.href}
                to={item.href} 
                className="text-xxs uppercase tracking-wider text-navy-600 hover:text-coral-600 transition-colors"
              >
                {item.label}
              </Link>
            )
          ))}
        </nav>

        <div className="flex items-center space-x-2 sm:space-x-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.user_metadata?.avatar_url} alt={user.email} />
                    <AvatarFallback className="bg-coral-600 text-white">
                      {user.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.user_metadata?.full_name || 'User'}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/people" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>People</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/family-trees" className="cursor-pointer">
                    <Heart className="mr-2 h-4 w-4" />
                    <span>Family Trees</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/dashboard" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button asChild
                variant="ghost" 
                size="sm" 
                className="hidden sm:block text-xxs uppercase tracking-wider text-navy-700 hover:text-coral-600 hover:bg-coral-50 px-3 lg:px-4"
              >
                <Link to="/auth">Sign In</Link>
              </Button>
              <Button asChild
                size="sm" 
                className="bg-coral-600 hover:bg-coral-700 text-white text-xxs uppercase tracking-wider px-3 sm:px-4 lg:px-6"
              >
                <Link to="/auth">Get Started</Link>
              </Button>
            </>
          )}
          
          {/* Mobile Menu Button */}
          <Button 
            variant="ghost" 
            size="sm" 
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </Button>
        </div>
      </header>

      {/* Mobile Navigation Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          {/* Background overlay */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={() => setMobileMenuOpen(false)}
          />
          
          {/* Mobile menu */}
          <div className="fixed top-0 right-0 h-full w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-coral-400 to-dusty-500 flex items-center justify-center">
                    <Heart className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-lg font-light tracking-wide text-navy-800">Family Shapes</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Navigation Links */}
              <nav className="flex-1 p-4">
                <ul className="space-y-4">
                  {navigationItems.map((item) => (
                    <li key={item.href}>
                      {item.href.startsWith('#') ? (
                        <a
                          href={item.href}
                          className="block py-3 px-4 text-base text-navy-700 hover:text-coral-600 hover:bg-coral-50 rounded-lg transition-colors"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {item.label}
                        </a>
                      ) : (
                        <Link
                          to={item.href}
                          className="block py-3 px-4 text-base text-navy-700 hover:text-coral-600 hover:bg-coral-50 rounded-lg transition-colors"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {item.label}
                        </Link>
                      )}
                    </li>
                  ))}
                  
                  {!user && (
                    <li className="pt-4 border-t">
                      <Link
                        to="/auth"
                        className="block py-3 px-4 text-base text-navy-700 hover:text-coral-600 hover:bg-coral-50 rounded-lg transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Sign In
                      </Link>
                    </li>
                  )}
                </ul>
              </nav>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
