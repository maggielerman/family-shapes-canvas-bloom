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
  Network
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
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

interface SidebarLayoutProps {
  children: React.ReactNode;
}

const SidebarLayout = ({ children }: SidebarLayoutProps) => {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const location = useLocation();

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
    { icon: Network, label: "Connections", path: "/connections" },
    { icon: Image, label: "Media", path: "/media" },
    { icon: Share2, label: "Share", path: "/share" },
    { icon: Building2, label: "Organizations", path: "/organizations" },
  ];

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
    <SidebarProvider>
      <Sidebar variant="inset">
        <SidebarHeader className="border-b px-2 py-4">
          {/* App Logo */}
          <div className="flex items-center gap-2 px-4 py-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-coral-400 to-dusty-500 flex items-center justify-center">
              <Heart className="w-4 h-4 text-white" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">Family Shapes</span>
              <span className="truncate text-xs">Family Tree Management</span>
            </div>
          </div>
          
          {/* Context Switcher */}
          <div className="px-4">
            <ContextSwitcher />
          </div>
        </SidebarHeader>
        <SidebarContent className="px-2 py-2">
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
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
                        <Link to={item.path}>
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
        </SidebarContent>
        <SidebarFooter className="border-t px-2 py-2">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => navigate("/settings")}
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
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default SidebarLayout;