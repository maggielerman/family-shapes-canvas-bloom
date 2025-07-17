
import { Button } from "@/components/ui/button";
import { Menu, Heart, User, Settings, LogOut } from "lucide-react";
import { useAuth } from "@/components/auth/AuthContext";
import { Link } from "react-router-dom";
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
