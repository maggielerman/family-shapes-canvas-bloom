import { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Building2, 
  Users, 
  Globe, 
  Calendar, 
  Shield,
  UserPlus,
  LogIn,
  Loader2,
  CheckCircle,
  AlertTriangle
} from "lucide-react";

interface OrganizationPreview {
  id: string;
  name: string;
  type: string;
  description: string;
  visibility: string;
  created_at: string;
  subdomain: string;
  memberCount: number;
}

interface InvitationDetails {
  id: string;
  role: string;
  invitee_email: string;
  expires_at: string;
  status: string;
  organization: OrganizationPreview;
}

export default function OrganizationInvitePage() {
  const { token, action } = useParams<{ token: string; action: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [invitation, setInvitation] = useState<InvitationDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchInvitationDetails();
  }, [token]);

  // If user is already authenticated, redirect to the normal invitation flow
  useEffect(() => {
    if (!authLoading && user && invitation && !error) {
      navigate(`/invitation/${action}/${token}`);
    }
  }, [authLoading, user, invitation, error, action, token, navigate]);

  const fetchInvitationDetails = async () => {
    if (!token) {
      setError("Invalid invitation link");
      setLoading(false);
      return;
    }

    try {
      // Fetch invitation details with organization info (publicly accessible)
      const { data: invitationData, error: invitationError } = await supabase
        .from('organization_invitations')
        .select(`
          id,
          role,
          invitee_email,
          expires_at,
          status,
          organizations (
            id,
            name,
            type,
            description,
            visibility,
            created_at,
            subdomain
          )
        `)
        .eq('token', token)
        .single();

      if (invitationError || !invitationData) {
        setError("Invitation not found or has been revoked");
        setLoading(false);
        return;
      }

      // Check if invitation is expired
      const expiryDate = new Date(invitationData.expires_at);
      if (expiryDate < new Date()) {
        setError("This invitation has expired");
        setLoading(false);
        return;
      }

      // Check if invitation was already processed
      if (invitationData.status !== 'pending' && invitationData.status !== 'sent') {
        setError(`This invitation has already been ${invitationData.status}`);
        setLoading(false);
        return;
      }

      // Get member count (publicly accessible info)
      const { count: memberCount } = await supabase
        .from('organization_memberships')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', invitationData.organizations.id);

      setInvitation({
        ...invitationData,
        organization: {
          ...invitationData.organizations,
          memberCount: memberCount || 0
        }
      });

    } catch (err) {
      console.error("Error fetching invitation:", err);
      setError("Failed to load invitation details");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = () => {
    const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
    navigate(`/auth?returnTo=${returnUrl}&mode=signup`);
  };

  const handleSignIn = () => {
    const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
    navigate(`/auth?returnTo=${returnUrl}`);
  };

  const formatOrganizationType = (type: string) => {
    return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Full access to manage the organization, members, and settings';
      case 'editor':
        return 'Can create and edit family trees, add people and relationships';
      case 'viewer':
        return 'Can view family trees and organization content';
      default:
        return 'Member access to organization content';
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <Card className="text-center">
          <CardContent className="pt-8">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-destructive" />
            <h1 className="text-2xl font-bold mb-2">Invitation Issue</h1>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button onClick={() => navigate('/')}>
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!invitation) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <Card className="text-center">
          <CardContent className="pt-8">
            <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h1 className="text-2xl font-bold mb-2">Invitation Not Found</h1>
            <p className="text-muted-foreground mb-6">
              This invitation link is invalid or may have been revoked.
            </p>
            <Button onClick={() => navigate('/')}>
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const org = invitation.organization;
  const actionText = action === 'accept' ? 'Join' : 'Decline Invitation to';

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {action === 'accept' ? "You're Invited to Join" : "Decline Invitation"}
          </h1>
          <p className="text-muted-foreground">
            {action === 'accept' 
              ? "Learn about this organization and create a free account to get started"
              : "You can decline this invitation if you're not interested"
            }
          </p>
        </div>

        {/* Main Organization Card */}
        <Card className="mb-8 shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Building2 className="h-8 w-8 text-primary" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-2xl">{org.name}</CardTitle>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary">{formatOrganizationType(org.type)}</Badge>
                  <Badge variant={org.visibility === 'public' ? 'default' : 'outline'}>
                    {org.visibility}
                  </Badge>
                </div>
                <CardDescription className="mt-2 text-base">
                  {org.description || 'A Family Shapes organization helping families visualize and manage complex relationships.'}
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <Users className="h-6 w-6 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">{org.memberCount}</div>
                <div className="text-sm text-muted-foreground">Members</div>
              </div>
              
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <Globe className="h-6 w-6 mx-auto mb-2 text-primary" />
                <div className="text-lg font-medium">{org.subdomain}</div>
                <div className="text-sm text-muted-foreground">Subdomain</div>
              </div>
              
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <Calendar className="h-6 w-6 mx-auto mb-2 text-primary" />
                <div className="text-lg font-medium">{formatDate(org.created_at)}</div>
                <div className="text-sm text-muted-foreground">Created</div>
              </div>
            </div>

            {/* Invitation Details */}
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Your Invitation Details
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email:</span>
                  <span>{invitation.invitee_email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Role:</span>
                  <Badge variant="outline" className="text-xs">
                    {invitation.role}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Expires:</span>
                  <span>{formatDate(invitation.expires_at)}</span>
                </div>
                <div className="mt-3 pt-3 border-t border-primary/10">
                  <p className="text-xs text-muted-foreground">
                    <strong>{invitation.role} access:</strong> {getRoleDescription(invitation.role)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        {action === 'accept' ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                <h2 className="text-xl font-semibold mb-2">Ready to Join?</h2>
                <p className="text-muted-foreground mb-6">
                  Create a free Family Shapes account to accept this invitation and start collaborating.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button 
                    onClick={handleSignUp}
                    size="lg"
                    className="flex items-center gap-2"
                  >
                    <UserPlus className="h-4 w-4" />
                    Create Free Account
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={handleSignIn}
                    size="lg"
                    className="flex items-center gap-2"
                  >
                    <LogIn className="h-4 w-4" />
                    Already Have Account? Sign In
                  </Button>
                </div>
                
                <p className="text-xs text-muted-foreground mt-4">
                  By creating an account, you agree to our Terms of Service and Privacy Policy
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-amber-500" />
                <h2 className="text-xl font-semibold mb-2">Decline Invitation</h2>
                <p className="text-muted-foreground mb-6">
                  If you don't want to join this organization, you can decline the invitation.
                  This action cannot be undone.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button 
                    variant="destructive"
                    onClick={handleSignIn}
                    size="lg"
                  >
                    Sign In to Decline
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/')}
                    size="lg"
                  >
                    Go to Home
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* What is Family Shapes */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-lg">About Family Shapes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Family Shapes helps families—especially those formed through donor conception, adoption, 
              and other non-traditional paths—visualize and manage complex family relationships. 
              Organizations use Family Shapes to support their communities with collaborative tools 
              for family tree building, relationship mapping, and connection discovery.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}