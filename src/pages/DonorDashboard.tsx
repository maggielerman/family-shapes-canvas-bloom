import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/components/auth/AuthContext";
import { useNavigate } from "react-router-dom";
import { 
  Heart, 
  Users, 
  Calendar, 
  Bell, 
  Lock, 
  MessageSquare,
  AlertCircle,
  CheckCircle,
  Clock,
  User,
  Activity,
  Shield
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format, differenceInDays, differenceInMonths } from "date-fns";
import { getPersonIdFromUserId } from "@/utils/donorUtils";

interface DonorStats {
  connectedFamilies: number;
  lastHealthUpdate: Date | null;
  profileCompleteness: number;
  unreadMessages: number;
  privacyLevel: 'anonymous' | 'semi-open' | 'open';
}

interface HealthReminder {
  type: 'overdue' | 'upcoming' | 'current';
  message: string;
  daysSinceUpdate: number;
}

const DonorDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DonorStats>({
    connectedFamilies: 0,
    lastHealthUpdate: null,
    profileCompleteness: 0,
    unreadMessages: 0,
    privacyLevel: 'anonymous'
  });
  const [healthReminder, setHealthReminder] = useState<HealthReminder | null>(null);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // First get the person ID from the user ID
      const personId = await getPersonIdFromUserId(user.id);
      if (!personId) {
        throw new Error('Person record not found');
      }
      
      // Load donor profile
      const { data: donorData } = await supabase
        .from('donors')
        .select(`
          *,
          person:person_id (
            id,
            first_name,
            last_name,
            date_of_birth
          )
        `)
        .eq('person_id', personId)
        .single();

      // Calculate profile completeness
      const profileFields = [
        donorData?.donor_number,
        donorData?.sperm_bank,
        donorData?.height,
        donorData?.weight,
        donorData?.eye_color,
        donorData?.hair_color,
        donorData?.ethnicity,
        donorData?.blood_type,
        donorData?.education_level,
        donorData?.medical_history
      ];
      const completedFields = profileFields.filter(field => field !== null && field !== '').length;
      const profileCompleteness = Math.round((completedFields / profileFields.length) * 100);

      // Get connected families count - placeholder for now
      // TODO: Implement when donor_family_connections table is created
      const familiesCount = 0;

      // Get unread messages - placeholder for now
      // TODO: Implement when messaging system is set up
      const unreadCount = 0;

      // Calculate health update reminder
      const lastUpdate = donorData?.medical_history?.last_updated 
        ? new Date(donorData.medical_history.last_updated)
        : null;
      
      let reminder: HealthReminder | null = null;
      if (lastUpdate) {
        const daysSince = differenceInDays(new Date(), lastUpdate);
        const monthsSince = differenceInMonths(new Date(), lastUpdate);
        
        if (monthsSince >= 12) {
          reminder = {
            type: 'overdue',
            message: `Your health information is ${monthsSince} months out of date. Please update it.`,
            daysSinceUpdate: daysSince
          };
        } else if (monthsSince >= 11) {
          reminder = {
            type: 'upcoming',
            message: 'Your annual health update is due soon.',
            daysSinceUpdate: daysSince
          };
        } else {
          reminder = {
            type: 'current',
            message: 'Your health information is up to date.',
            daysSinceUpdate: daysSince
          };
        }
      } else {
        reminder = {
          type: 'overdue',
          message: 'Please complete your initial health information.',
          daysSinceUpdate: 0
        };
      }

      setStats({
        connectedFamilies: familiesCount || 0,
        lastHealthUpdate: lastUpdate,
        profileCompleteness,
        unreadMessages: unreadCount || 0,
        privacyLevel: donorData?.is_anonymous ? 'anonymous' : 'semi-open'
      });
      setHealthReminder(reminder);

      // Load recent activity - placeholder for now
      // TODO: Implement when donor_activity_log table is created
      const activities: any[] = [];
      
      setRecentActivity(activities);
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPrivacyBadgeVariant = (level: string) => {
    switch (level) {
      case 'anonymous':
        return 'secondary';
      case 'semi-open':
        return 'default';
      case 'open':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getPrivacyIcon = (level: string) => {
    switch (level) {
      case 'anonymous':
        return <Lock className="w-4 h-4" />;
      case 'semi-open':
        return <Shield className="w-4 h-4" />;
      case 'open':
        return <User className="w-4 h-4" />;
      default:
        return <Lock className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-coral-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Donor Dashboard</h1>
        <p className="text-muted-foreground">
          Manage your donor profile and connect with families
        </p>
      </div>

      {/* Health Update Alert */}
      {healthReminder && healthReminder.type !== 'current' && (
        <Alert variant={healthReminder.type === 'overdue' ? 'destructive' : 'default'}>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Health Update {healthReminder.type === 'overdue' ? 'Required' : 'Reminder'}</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>{healthReminder.message}</span>
            <Button 
              size="sm" 
              onClick={() => navigate('/donor/health')}
              variant={healthReminder.type === 'overdue' ? 'default' : 'outline'}
            >
              Update Now
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Connected Families</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.connectedFamilies}</div>
            <p className="text-xs text-muted-foreground">
              Families with access to your information
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profile Completeness</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className="text-2xl font-bold">{stats.profileCompleteness}%</div>
              <Progress value={stats.profileCompleteness} className="w-20" />
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.profileCompleteness < 100 ? 'Complete your profile' : 'Profile complete'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Privacy Level</CardTitle>
            {getPrivacyIcon(stats.privacyLevel)}
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Badge variant={getPrivacyBadgeVariant(stats.privacyLevel)}>
                {stats.privacyLevel.charAt(0).toUpperCase() + stats.privacyLevel.slice(1).replace('-', ' ')}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Control your information visibility
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unread Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.unreadMessages}</div>
            <p className="text-xs text-muted-foreground">
              {stats.unreadMessages > 0 ? 'New messages waiting' : 'All caught up'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and updates</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Button 
            variant="outline" 
            className="justify-start"
            onClick={() => navigate('/donor/profile')}
          >
            <User className="mr-2 h-4 w-4" />
            Update Profile
          </Button>
          <Button 
            variant="outline" 
            className="justify-start"
            onClick={() => navigate('/donor/health')}
          >
            <Heart className="mr-2 h-4 w-4" />
            Health Update
          </Button>
          <Button 
            variant="outline" 
            className="justify-start"
            onClick={() => navigate('/donor/communication')}
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            Messages
          </Button>
          <Button 
            variant="outline" 
            className="justify-start"
            onClick={() => navigate('/donor/privacy')}
          >
            <Lock className="mr-2 h-4 w-4" />
            Privacy Settings
          </Button>
        </CardContent>
      </Card>

      {/* Health Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Health Information Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Last Updated</p>
                <p className="text-sm text-muted-foreground">
                  {stats.lastHealthUpdate 
                    ? format(stats.lastHealthUpdate, 'MMMM d, yyyy')
                    : 'Never updated'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {healthReminder?.type === 'current' ? (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Up to date
                  </Badge>
                ) : healthReminder?.type === 'upcoming' ? (
                  <Badge variant="default" className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Update soon
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Update required
                  </Badge>
                )}
              </div>
            </div>
            
            {stats.lastHealthUpdate && (
              <Progress 
                value={Math.max(0, 100 - (healthReminder?.daysSinceUpdate || 0) / 365 * 100)} 
                className="h-2"
              />
            )}
            
            <p className="text-sm text-muted-foreground">
              Annual health updates help keep recipient families informed about important changes.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      {recentActivity.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest actions and updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center space-x-4 text-sm">
                  <div className="flex-shrink-0">
                    <Bell className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">{activity.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(activity.created_at), 'MMM d, yyyy h:mm a')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DonorDashboard;