import { useAuth } from "@/components/auth/AuthContext";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import ContextSwitcher from "@/components/navigation/ContextSwitcher";
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
  Image,
  Search,
  Network,
  BarChart3,
  Calendar,
  FileText,
  Shield,
  Database,
  UserPlus,
  GitBranch,
  Moon,
  Sun
} from "lucide-react";
import {
  Sidebar,
  SidebarContent as SidebarContentComponent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar
} from "@/components/ui/sidebar";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";

interface SidebarLayoutProps {
  children: React.ReactNode;
}

// Individual user navigation items
const IndividualUserNav = [
  { icon: Home, label: "Dashboard", path: "/dashboard" },
  { icon: User, label: "Profile", path: "/profile" },
  { icon: Users, label: "People", path: "/people" },
  { icon: TreePine, label: "Family Trees", path: "/family-trees" },
  { icon: Network, label: "Connections", path: "/connections" },
  { icon: Image, label: "Media", path: "/media" },
  { icon: Share2, label: "Share", path: "/share" },
  { icon: Building2, label: "Organizations", path: "/organizations" },
];

// Organization navigation items
const OrganizationNav = [
  { icon: Home, label: "Overview", path: "/organizations/:orgId" },
  { icon: Users, label: "Members", path: "/organizations/:orgId/members" },
  { icon: Database, label: "Donor Database", path: "/organizations/:orgId/donors" },
  { icon: GitBranch, label: "Sibling Groups", path: "/organizations/:orgId/siblings" },
  { icon: Building2, label: "Groups", path: "/organizations/:orgId/groups" },
  { icon: TreePine, label: "Family Trees", path: "/organizations/:orgId/trees" },
  { icon: BarChart3, label: "Analytics", path: "/organizations/:orgId/analytics" },
  { icon: Shield, label: "Settings", path: "/organizations/:orgId/settings" },
];

// Theme toggle component for sidebar
const ThemeToggleButton = () => {
  const { theme, setTheme } = useTheme();
  const { isMobile, setOpenMobile } = useSidebar();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <SidebarMenuButton onClick={toggleTheme} tooltip="Toggle theme">
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span>{theme === "dark" ? "Light mode" : "Dark mode"}</span>
    </SidebarMenuButton>
  );
};

const SidebarLayout = ({ children }: SidebarLayoutProps) => {
  return (
    <SidebarProvider>
      <SidebarInner>{children}</SidebarInner>
    </SidebarProvider>
  );
};

// Inner component that can use the useSidebar hook
const SidebarInner = ({ children }: { children: React.ReactNode }) => {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const location = useLocation();
  const { setOpen, setOpenMobile, isMobile } = useSidebar();
  const [currentContext, setCurrentContext] = useState<string>("personal");
  const [sidebarItems, setSidebarItems] = useState(IndividualUserNav);

  // Detect current context and update sidebar items accordingly
  useEffect(() => {
    const path = location.pathname;
    const orgMatch = path.match(/\/organizations\/([^\/]+)/);
    
    if (orgMatch) {
      const orgId = orgMatch[1];
      setCurrentContext(orgId);
      // Update navigation items for organization context
      const orgNav = OrganizationNav.map(item => ({
        ...item,
        path: item.path.replace(':orgId', orgId)
      }));
      setSidebarItems(orgNav);
    } else {
      setCurrentContext("personal");
      setSidebarItems(IndividualUserNav);
    }
  }, [location.pathname]);

  const handleSignOut = async () => {
    console.log('Sidebar sign out clicked');
    try {
      const { error } = await signOut();
      console.log('Sidebar sign out result:', { error });
      
      // Treat session_not_found as success
      const isSuccess = !error || (error && error.message && error.message.includes('session_not_found'));
      
      if (!isSuccess) {
        toast({
          title: "Error signing out",
          description: error.message,
          variant: "destructive",
        });
      } else {
        console.log('Sidebar sign out successful, navigating to home');
        navigate("/");
        // Force a page reload to ensure clean state
        setTimeout(() => {
          window.location.reload();
        }, 100);
      }
    } catch (err) {
      console.error('Sidebar sign out error:', err);
      toast({
        title: "Error signing out",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  // Show loading while auth is still loading
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <>
      <Sidebar variant="inset">
        <SidebarHeader className="border-b px-2 py-4">
          {/* App Logo */}
          <Link to="/" className="flex items-center gap-2 px-4 py-2 mb-3 hover:bg-sidebar-accent rounded-md transition-colors">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-coral-400 to-dusty-500 flex items-center justify-center">
              <Heart className="w-4 h-4 text-white" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">Family Shapes</span>
              <span className="truncate text-xs">Family Tree Management</span>
            </div>
          </Link>
          
          {/* Context Switcher */}
          <div className="px-4">
            <ContextSwitcher />
          </div>
        </SidebarHeader>
        <SidebarContentComponent className="px-2 py-2">
          <SidebarGroup>
            <SidebarGroupLabel>
              {currentContext === "personal" ? "Navigation" : "Organization"}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {sidebarItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <SidebarMenuItem key={item.path}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        tooltip={item.label}
                      >
                        <Link 
                          to={item.path} 
                          onClick={() => {
                            if (isMobile) {
                              setOpenMobile(false);
                            }
                          }}
                        >
                          <item.icon />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContentComponent>
        <SidebarFooter className="border-t px-2 py-2">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <ThemeToggleButton />
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => {
                      navigate("/settings");
                      if (isMobile) {
                        setOpenMobile(false);
                      }
                    }}
                    tooltip="Settings"
                  >
                    <Settings />
                    <span>Settings</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={handleSignOut}
                    tooltip="Sign out"
                  >
                    <LogOut />
                    <span>Sign out</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0 max-w-none">
          <div className="space-y-4 sm:space-y-6">
            {children}
          </div>
        </div>
      </SidebarInset>
    </>
  );
};

export default SidebarLayout;