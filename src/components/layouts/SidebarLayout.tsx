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
  Dna,
  HeartHandshake,
  Lock
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
import { supabase } from "@/integrations/supabase/client";

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

// Donor navigation items
const DonorNav = [
  { icon: Home, label: "Dashboard", path: "/donor/dashboard" },
  { icon: User, label: "Profile", path: "/donor/profile" },
  { icon: Heart, label: "Health Updates", path: "/donor/health" },
  { icon: HeartHandshake, label: "Communication", path: "/donor/communication" },
  { icon: Lock, label: "Privacy Settings", path: "/donor/privacy" },
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
  const [isDonor, setIsDonor] = useState(false);

  // Check if user is a donor
  useEffect(() => {
    const checkUserType = async () => {
      if (!user) return;
      
      try {
        const { data: personData } = await supabase
          .from('persons')
          .select('person_type')
          .eq('user_id', user.id)
          .single();
          
        if (personData?.person_type === 'donor') {
          setIsDonor(true);
          setSidebarItems(DonorNav);
          setCurrentContext("donor");
        }
      } catch (error) {
        console.error('Error checking user type:', error);
      }
    };
    
    checkUserType();
  }, [user]);

  // Detect current context and update sidebar items accordingly
  useEffect(() => {
    const path = location.pathname;
    const orgMatch = path.match(/\/organizations\/([^\/]+)/);
    const donorMatch = path.startsWith('/donor/');
    
    if (donorMatch && isDonor) {
      setCurrentContext("donor");
      setSidebarItems(DonorNav);
    } else if (orgMatch) {
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
  }, [location.pathname, isDonor]);

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