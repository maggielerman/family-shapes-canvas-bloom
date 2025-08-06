import { useState, useEffect } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  UserPlus, 
  Settings, 
  BarChart3, 
  TreePine,
  Mail,
  Shield,
  Calendar,
  MapPin,
  Globe,
  Heart,
  Image
} from "lucide-react";
import { Group, GroupUtils } from "@/types/group";
import GroupInviteDialog from "./GroupInviteDialog";
import GroupMembers from "./GroupMembers";
import GroupStats from "./GroupStats";
import GroupDonorDatabase from "./GroupDonorDatabase";
import GroupSiblingGroups from "./GroupSiblingGroups";
import GroupSettings from "./GroupSettings";
import GroupMedia from "./GroupMedia";

interface GroupMembership {
  id: string;
  role: string;
  created_at: string;
  user_id: string;
}

export function GroupDashboard() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  
  const [group, setGroup] = useState<Group | null>(null);
  const [membership, setMembership] = useState<GroupMembership | null>(null);
  const [loading, setLoading] = useState(true);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchGroupData();
  }, [id, user]);

  // Detect current route and set appropriate tab
  useEffect(() => {
    const path = location.pathname;
    const groupId = id;
    
    if (path === `/groups/${groupId}`) {
      setActiveTab("overview");
    } else if (path === `/groups/${groupId}/members`) {
      setActiveTab("members");
    } else if (path === `/groups/${groupId}/donors`) {
      setActiveTab("donors");
    } else if (path === `/groups/${groupId}/siblings`) {
      setActiveTab("siblings");
    } else if (path === `/groups/${groupId}/media`) {
      setActiveTab("media");
    } else if (path === `/groups/${groupId}/analytics`) {
      setActiveTab("analytics");
    } else if (path === `/groups/${groupId}/settings`) {
      setActiveTab("settings");
    }
  }, [location.pathname, id]);

  const fetchGroupData = async () => {
    if (!id || !user) return;

    try {
      setLoading(true);

      // Fetch group details
      const { data: groupData, error: groupError } = await supabase
        .from('groups')
        .select('*')
        .eq('id', id)
        .single();

      if (groupError) throw groupError;
      setGroup(groupData);

      // Fetch user's membership in this group
      const { data: membershipData, error: membershipError } = await supabase
        .from('group_memberships')
        .select('*')
        .eq('group_id', id)
        .eq('user_id', user.id)
        .single();

      if (membershipError && membershipError.code !== 'PGRST116') {
        // PGRST116 means no rows returned, which is fine if user is owner
        console.error('Membership error:', membershipError);
      } else if (membershipData) {
        setMembership(membershipData);
      }

    } catch (error) {
      console.error('Error fetching group:', error);
      toast({
        title: "Error",
        description: "Failed to load group details",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const isOwner = group?.owner_id === user?.id;
  const isAdmin = membership?.role === 'admin' || isOwner;
  const canManage = isAdmin;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Group Not Found</h1>
          <p className="text-muted-foreground mb-4">
            The group you're looking for doesn't exist or you don't have access to it.
          </p>
          <Link to="/dashboard">
            <Button>Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-lg">
            <Users className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">{group.label}</h1>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <Badge variant="secondary">{GroupUtils.getTypeLabel(group.type)}</Badge>
              <Badge variant={group.visibility === 'public' ? 'default' : 'outline'}>
                {group.visibility || 'private'}
              </Badge>
              {isOwner && (
                <Badge variant="destructive">Owner</Badge>
              )}
              {membership && !isOwner && (
                <Badge variant="secondary">{membership.role}</Badge>
              )}
              {group.plan && (
                <Badge variant="outline">{group.plan}</Badge>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          {canManage && (
            <>
              <Button
                variant="outline"
                onClick={() => setShowInviteDialog(true)}
                className="flex items-center gap-2 w-full sm:w-auto"
              >
                <UserPlus className="h-4 w-4" />
                Invite Members
              </Button>
              <Link to={`/groups/${group.id}/settings`}>
                <Button variant="outline" className="flex items-center gap-2 w-full sm:w-auto">
                  <Settings className="h-4 w-4" />
                  Settings
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Group Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Group Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-1">Description</h4>
              <p className="text-sm">{group.description || 'No description provided'}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-1">Created</h4>
              <div className="flex items-center gap-1 text-sm">
                <Calendar className="h-3 w-3" />
                {formatDate(group.created_at)}
              </div>
            </div>
            {group.subdomain && (
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Subdomain</h4>
                <div className="flex items-center gap-1 text-sm">
                  <Globe className="h-3 w-3" />
                  {group.subdomain}.familyshapes.com
                </div>
              </div>
            )}
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-1">Type</h4>
              <div className="flex items-center gap-1 text-sm">
                {GroupUtils.getTypeIcon(group.type)} {GroupUtils.getTypeLabel(group.type)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 lg:grid-cols-7 gap-1">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          {GroupUtils.hasDonorDatabase(group) && (
            <TabsTrigger value="donors">Donors</TabsTrigger>
          )}
          {GroupUtils.hasSiblingGroups(group) && (
            <TabsTrigger value="siblings">Siblings</TabsTrigger>
          )}
          <TabsTrigger value="media">Media</TabsTrigger>
          {canManage && (
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          )}
          {isOwner && (
            <TabsTrigger value="settings">Settings</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="overview">
          <GroupStats groupId={group.id} />
        </TabsContent>

        <TabsContent value="members">
          <GroupMembers 
            groupId={group.id} 
            canManage={canManage}
            currentUserId={user?.id}
          />
        </TabsContent>

        <TabsContent value="donors">
          <GroupDonorDatabase 
            groupId={group.id} 
            canManage={canManage}
          />
        </TabsContent>

        <TabsContent value="siblings">
          <GroupSiblingGroups 
            groupId={group.id} 
            canManage={canManage}
          />
        </TabsContent>

        <TabsContent value="media">
          <GroupMedia 
            groupId={group.id} 
            canManage={canManage}
          />
        </TabsContent>

        {canManage && (
          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Analytics
                </CardTitle>
                <CardDescription>
                  Group usage and engagement metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Analytics dashboard coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {isOwner && (
          <TabsContent value="settings">
            <GroupSettings 
              groupId={group.id}
              group={group}
              isOwner={isOwner}
              onUpdate={fetchGroupData}
            />
          </TabsContent>
        )}
      </Tabs>

      {/* Invite Dialog */}
      <GroupInviteDialog
        open={showInviteDialog}
        onOpenChange={setShowInviteDialog}
        groupId={group.id}
        groupName={group.label}
      />
    </>
  );
}

export default GroupDashboard;