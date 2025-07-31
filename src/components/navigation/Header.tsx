
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, User, Settings, LogOut, X, TreePine } from "lucide-react";
import { useAuth } from "@/components/auth/AuthContext";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Logo } from "@/components/logo";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserProfile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
}

const Header = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  // Fetch user profile when user changes
  useEffect(() => {
    if (user) {
      fetchUserProfile();
    } else {
      setProfile(null);
    }
  }, [user]);

  const fetchUserProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, full_name, avatar_url, bio')
        .eq('id', user.id)
        .order('updated_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Error fetching user profile:', error);
      } else if (data && data.length > 0) {
        setProfile(data[0]);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  // Refresh profile data when location changes to catch avatar updates
  useEffect(() => {
    if (user && location.pathname !== '/profile') {
      // Refresh profile data when user navigates away from profile page
      fetchUserProfile();
    }
  }, [location.pathname, user]);

  const handleSignOut = async () => {
    console.log('Header sign out clicked');
    try {
      const { error } = await signOut();
      console.log('Header sign out result:', { error });
      
      // Treat session_not_found as success
      const isSuccess = !error || (error && error.message && error.message.includes('session_not_found'));
      
      if (!isSuccess) {
        toast({
          title: "Error signing out",
          description: error.message,
          variant: "destructive",
        });
      } else {
        console.log('Header sign out successful, navigating to home');
        navigate("/");
        // Force a page reload to ensure clean state
        setTimeout(() => {
          window.location.reload();
        }, 100);
      }
    } catch (err) {
      console.error('Header sign out error:', err);
      toast({
        title: "Error signing out",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const handleFeaturesClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (location.pathname === '/') {
      // If on home page, scroll to features section
      const featuresSection = document.getElementById('features');
      if (featuresSection) {
        featuresSection.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // If on different page, navigate to home page with features anchor
      navigate('/#features');
    }
  };

  const navigationItems = [
    { href: "#features", label: "Features", isFeatures: true },
    { href: "/for-recipient-families", label: "For Families" },
    { href: "/for-donors", label: "For Donors" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <>
      <header className="w-full px-4 sm:px-6 lg:px-12 py-4 sm:py-6 lg:py-8 flex items-center justify-between relative z-40">
        <Logo size="xl" className="text-navy-800" linkTo="/" showIcon={false} />
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8 lg:space-x-12">
          {navigationItems.map((item) => (
            item.isFeatures ? (
              <button
                key={item.href}
                onClick={handleFeaturesClick}
                className="text-xxs uppercase tracking-wider text-navy-600 hover:text-coral-600 transition-colors"
              >
                {item.label}
              </button>
            ) : item.href.startsWith('#') ? (
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
                    <AvatarImage src={profile?.avatar_url || undefined} alt={user.email} />
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
                    <TreePine className="mr-2 h-4 w-4" />
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
                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
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
                className="hidden sm:inline-flex text-sm font-small tracking-wider text-navy-700 hover:text-coral-600 hover:bg-coral-50 px-3 lg:px-4"
              >
                <Link to="/auth">Sign In</Link>
              </Button>
           

              <Button asChild
                size="sm" 
                className="bg-coral-600 hover:bg-coral-700 text-white text-sm font-small tracking-wider px-3 sm:px-4 lg:px-6"
              >
               <Link to="/get-started">Get Started</Link>
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
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Background overlay */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          
          {/* Mobile menu */}
          <div className="fixed top-0 right-0 h-full w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <Logo size="lg" className="text-navy-800" linkTo="/" showIcon={true} />
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
                      {item.isFeatures ? (
                        <button
                          onClick={(e) => {
                            handleFeaturesClick(e);
                            setMobileMenuOpen(false);
                          }}
                          className="block w-full text-left py-3 px-4 text-base text-navy-700 hover:text-coral-600 hover:bg-coral-50 rounded-lg transition-colors"
                        >
                          {item.label}
                        </button>
                      ) : item.href.startsWith('#') ? (
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
