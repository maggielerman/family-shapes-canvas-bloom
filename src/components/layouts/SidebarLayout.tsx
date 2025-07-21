import { useState } from "react";
import { useAuth } from "@/components/auth/AuthContext";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { 
  Heart, 
  User, 
  Settings, 
  LogOut, 
  Home,
  Building2,
  TreePine,
  Users,
  Share2,
  Menu,
  X,
  Image
} from "lucide-react";

interface SidebarLayoutProps {
  children: React.ReactNode;
}

const SidebarLayout = ({ children }: SidebarLayoutProps) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
    } else {
      navigate("/");
    }
  };

  const sidebarItems = [
    { icon: Home, label: "Dashboard", path: "/dashboard" },
    { icon: User, label: "Profile", path: "/profile" },
    { icon: Users, label: "People", path: "/people" },
    { icon: TreePine, label: "Family Trees", path: "/family-trees" },
    { icon: Image, label: "Media", path: "/media" },
    { icon: Share2, label: "Share", path: "/share" },
    { icon: Building2, label: "Organizations", path: "/organizations" },
  ];

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 sm:w-72 bg-card border-r transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-coral-400 to-dusty-500 flex items-center justify-center">
                <Heart className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
              </div>
              <span className="text-lg sm:text-xl font-light tracking-wide">Family Shapes</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden p-2"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* User Info */}
          <div className="p-4 sm:p-6 border-b">
            <div className="flex items-center space-x-3">
              <Avatar className="w-8 h-8 sm:w-10 sm:h-10">
                <AvatarImage src={user?.user_metadata?.avatar_url} alt={user?.email} />
                <AvatarFallback className="bg-coral-600 text-white text-sm">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{displayName}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 sm:p-4">
            <ul className="space-y-1 sm:space-y-2">
              {sidebarItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={`
                        flex items-center space-x-3 px-3 py-3 sm:py-2 rounded-lg transition-colors min-h-[44px] sm:min-h-[auto]
                        ${isActive 
                          ? 'bg-coral-100 text-coral-700 font-medium' 
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        }
                      `}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      <span className="text-sm sm:text-base">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer */}
          <div className="p-3 sm:p-4 border-t">
            <div className="space-y-1 sm:space-y-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start py-3 sm:py-2 min-h-[44px] sm:min-h-[auto]"
                onClick={() => navigate("/settings")}
              >
                <Settings className="w-4 h-4 mr-3 flex-shrink-0" />
                <span className="text-sm sm:text-base">Settings</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start py-3 sm:py-2 min-h-[44px] sm:min-h-[auto]"
                onClick={handleSignOut}
              >
                <LogOut className="w-4 h-4 mr-3 flex-shrink-0" />
                <span className="text-sm sm:text-base">Sign Out</span>
              </Button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:ml-0">
        {/* Mobile header */}
        <header className="lg:hidden bg-card border-b p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              className="p-2 min-h-[44px] min-w-[44px]"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-br from-coral-400 to-dusty-500 flex items-center justify-center">
                <Heart className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
              </div>
              <span className="text-base sm:text-lg font-light">Family Shapes</span>
            </div>
            <div className="w-11" /> {/* Spacer for balance */}
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 overflow-auto">
          <div className="p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default SidebarLayout;
