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

  useEffect(() => {
    if (user) {
      fetchOrganizations();
      detectCurrentContext();
    }
  }, [user, location.pathname]);

  const fetchOrganizations = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Fetch organizations owned by user
      const { data: ownedOrgs } = await supabase
        .from('organizations')
        .select('id, name, type')
        .eq('owner_id', user.id);

      // Fetch organizations where user is a member
      const { data: memberOrgs } = await supabase
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

      const owned = ownedOrgs?.map(org => ({
        ...org,
        role: 'owner'
      })) || [];

      const memberships = memberOrgs?.map(item => ({
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
    } finally {
      setLoading(false);
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
      return {
        name: "Personal Account",
        type: "individual",
        icon: <User className="w-4 h-4" />,
        initials: user?.email?.charAt(0).toUpperCase() || "U"
      };
    }

    const org = organizations.find(o => o.id === currentContext);
    if (org) {
      return {
        name: org.name,
        type: org.type,
        role: org.role,
        icon: <Building2 className="w-4 h-4" />,
        initials: org.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
      };
    }

    return {
      name: "Unknown Context",
      type: "unknown",
      icon: <User className="w-4 h-4" />,
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

  const contextDisplay = getCurrentContextDisplay();

  return (
    <div className={`relative ${className}`}>
      <Select value={currentContext} onValueChange={handleContextSwitch}>
        <SelectTrigger className="w-full min-w-[200px] h-auto p-3">
          <div className="flex items-center space-x-3 flex-1">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs bg-primary/10">
                {contextDisplay.initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 text-left">
              <div className="flex items-center space-x-2">
                {contextDisplay.icon}
                <span className="font-medium truncate">{contextDisplay.name}</span>
                {contextDisplay.role && (
                  <Badge variant="secondary" className="text-xs">
                    {contextDisplay.role}
                  </Badge>
                )}
              </div>
              <div className="text-xs text-muted-foreground capitalize">
                {contextDisplay.type === "individual" ? "Personal Account" : contextDisplay.type.replace('_', ' ')}
              </div>
            </div>
          </div>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </SelectTrigger>
        <SelectContent>
          {/* Personal Account Option */}
          <SelectItem value="personal">
            <div className="flex items-center space-x-3 py-1">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs bg-primary/10">
                  <User className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">Personal Account</div>
                <div className="text-xs text-muted-foreground">Your individual dashboard</div>
              </div>
            </div>
          </SelectItem>

          {/* Organizations */}
          {organizations.length > 0 && (
            <>
              <div className="px-2 py-1 text-xs font-semibold text-muted-foreground border-t">
                Organizations
              </div>
              {organizations.map((org) => (
                <SelectItem key={org.id} value={org.id}>
                  <div className="flex items-center space-x-3 py-1">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs bg-primary/10">
                        {org.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{org.name}</span>
                        <Badge variant="secondary" className="text-xs">
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