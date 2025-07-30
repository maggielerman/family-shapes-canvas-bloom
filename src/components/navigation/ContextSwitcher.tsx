import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Building2, User, ChevronDown } from "lucide-react";

interface Organization {
  id: string;
  name: string;
  type: string;
  role: string;
}

interface UserProfile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
}

interface ContextSwitcherProps {
  className?: string;
}

const ContextSwitcher = ({ className }: ContextSwitcherProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [currentContext, setCurrentContext] = useState<string>("personal");
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (user) {
      fetchOrganizations();
      fetchUserProfile();
      detectCurrentContext();
    } else {
      // Clear state when user is not authenticated
      setOrganizations([]);
      setCurrentContext("personal");
      setProfile(null);
      setLoading(false);
    }
  }, [user, location.pathname]);

  // Refresh profile data when location changes to catch avatar updates
  useEffect(() => {
    if (user && location.pathname === '/profile') {
      // Refresh profile data when user visits profile page
      fetchUserProfile();
    }
  }, [location.pathname, user]);

  const fetchOrganizations = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Fetch organizations owned by user
      const { data: ownedOrgs, error: ownedError } = await supabase
        .from('organizations')
        .select('id, name, type')
        .eq('owner_id', user.id);

      if (ownedError) {
        console.error('Error fetching owned organizations:', ownedError);
      }

      // Fetch organizations where user is a member
      const { data: memberOrgs, error: memberError } = await supabase
        .from('organization_memberships')
        .select(`
          role,
          organizations (
            id,
            name,
            type
          )
        `)
        .eq('user_id', user.id);

      if (memberError) {
        console.error('Error fetching member organizations:', memberError);
      }

      const owned = ownedOrgs?.map(org => ({
        ...org,
        role: 'owner'
      })) || [];

      const memberships = memberOrgs?.filter(item => item && item.organizations).map(item => ({
        id: item.organizations.id,
        name: item.organizations.name,
        type: item.organizations.type,
        role: item.role
      })) || [];

      // Combine and deduplicate
      const allOrgs = [...owned, ...memberships];
      const uniqueOrgs = allOrgs.filter((org, index, self) => 
        index === self.findIndex(o => o.id === org.id)
      );

      setOrganizations(uniqueOrgs);
    } catch (error) {
      console.error('Error fetching organizations:', error);
      // Don't throw the error, just log it and continue
    } finally {
      setLoading(false);
    }
  };

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

  const detectCurrentContext = () => {
    const path = location.pathname;
    
    // Check if we're in an organization context
    const orgMatch = path.match(/\/organizations\/([^\/]+)/);
    if (orgMatch) {
      setCurrentContext(orgMatch[1]);
    } else {
      setCurrentContext("personal");
    }
  };

  const handleContextSwitch = (value: string) => {
    setCurrentContext(value);
    
    if (value === "personal") {
      // Mark that user explicitly navigated to personal dashboard
      sessionStorage.setItem('explicit-personal-dashboard', 'true');
      navigate("/dashboard");
    } else {
      // Clear any explicit personal navigation flag when switching to organization
      sessionStorage.removeItem('explicit-personal-dashboard');
      // Navigate to organization dashboard
      navigate(`/organizations/${value}`);
    }
  };

  const getCurrentContextDisplay = () => {
    if (currentContext === "personal") {
      const fullName = profile?.full_name;
      const email = user?.email;
      const displayName = fullName || (email ? email.split('@')[0] : "User");
      const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
      
      return {
        name: displayName,
        type: "individual",
        icon: null, // Remove icon since we have avatar
        initials: initials
      };
    }

    const org = organizations.find(o => o.id === currentContext);
    if (org) {
      return {
        name: org.name,
        type: org.type,
        role: org.role,
        icon: null, // Remove icon since we have avatar
        initials: org.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || "ORG"
      };
    }

    return {
      name: "Unknown Context",
      type: "unknown",
      icon: null, // Remove icon since we have avatar
      initials: "?"
    };
  };

  if (loading) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="animate-pulse bg-muted rounded-md h-8 w-48"></div>
      </div>
    );
  }

  // Don't render if user is not available
  if (!user) {
    return null;
  }

  const contextDisplay = getCurrentContextDisplay();

  return (
    <div className={`relative ${className}`}>
      <Select value={currentContext} onValueChange={handleContextSwitch}>
        <SelectTrigger className="w-full min-w-[180px] h-9 px-3 py-1.5 bg-background/50 backdrop-blur-sm border-border/50 hover:bg-background/80 transition-colors shadow-sm">
          <div className="flex items-center space-x-2 flex-1 min-w-0">
            <Avatar className="h-6 w-6 flex-shrink-0">
              <AvatarImage src={profile?.avatar_url || undefined} alt={contextDisplay.name} />
              <AvatarFallback className="text-xs bg-primary/10 text-primary">
                {contextDisplay.initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 text-left min-w-0 overflow-hidden">
              <div className="flex items-center space-x-1.5 min-w-0">
                <span className="font-medium text-sm truncate">{contextDisplay.name}</span>
                {contextDisplay.role && (
                  <Badge variant="secondary" className="text-xs px-1.5 py-0.5 flex-shrink-0">
                    {contextDisplay.role}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          {/* <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0 ml-2" /> */}
        </SelectTrigger>
        <SelectContent className="w-[280px]">
          {/* Personal Account Option */}
          <SelectItem value="personal" className="py-2 px-2">
            <div className="flex items-center space-x-2">
              <Avatar className="h-6 w-6 flex-shrink-0">
                <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.full_name || "User"} />
                <AvatarFallback className="text-xs bg-primary/10 text-primary">
                  <User className="w-3 h-3" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0 overflow-hidden">
                <div className="font-medium text-sm truncate">
                  {profile?.full_name || (user?.email ? user.email.split('@')[0] : "User")}
                </div>
                <div className="text-xs text-muted-foreground">Personal Account</div>
              </div>
            </div>
          </SelectItem>

          {/* Organizations */}
          {organizations.length > 0 && (
            <>
              <div className="px-3 py-1.5 text-xs font-medium text-muted-foreground border-t border-border/50">
                Organizations
              </div>
              {organizations.map((org) => (
                <SelectItem key={org.id} value={org.id} className="py-2 px-2">
                  <div className="flex items-center space-x-2">
                    <Avatar className="h-6 w-6 flex-shrink-0">
                      <AvatarFallback className="text-xs bg-primary/10 text-primary">
                        {org.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0 overflow-hidden">
                      <div className="flex items-center space-x-1.5 min-w-0">
                        <span className="font-medium text-sm truncate">{org.name}</span>
                        <Badge variant="secondary" className="text-xs px-1.5 py-0.5 flex-shrink-0">
                          {org.role}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground capitalize">
                        {org.type.replace('_', ' ')}
                      </div>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </>
          )}
        </SelectContent>
      </Select>
    </div>
  );
};

export default ContextSwitcher;