import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Building2, Check, X, AlertTriangle, Loader2 } from "lucide-react";

const InvitationPage = () => {
  const { token, action } = useParams<{ token: string; action: string }>();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isProcessing, setIsProcessing] = useState(false);
  const [invitationInfo, setInvitationInfo] = useState<{
    organization: { name: string; type: string };
    role: string;
    inviter: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isExpired, setIsExpired] = useState(false);

  // Load invitation information
  useEffect(() => {
    const fetchInvitationInfo = async () => {
      if (!token) {
        setError("Invalid invitation link");
        return;
      }

      try {
        const { data, error } = await supabase
          .from('organization_invitations')
          .select(`
            invitee_email,
            role,
            expires_at,
            status,
            organizations (
              name,
              type
            )
          `)
          .eq('token', token)
          .single();

        if (error || !data) {
          setError("Invitation not found or has been revoked");
          return;
        }

        // Check if invitation is expired
        const expiryDate = new Date(data.expires_at);
        if (expiryDate < new Date()) {
          setIsExpired(true);
          setError("This invitation has expired");
          return;
        }

        // Check if invitation was already accepted or declined
        if (data.status !== 'pending' && data.status !== 'sent') {
          setError(`This invitation has already been ${data.status}`);
          return;
        }

        setInvitationInfo({
          organization: {
            name: data.organizations.name,
            type: data.organizations.type
          },
          role: data.role,
          inviter: 'Organization Admin'
        });
      } catch (err) {
        console.error("Error fetching invitation:", err);
        setError("Failed to load invitation details");
      }
    };

    fetchInvitationInfo();
  }, [token]);

  // Handle automatic action based on URL parameter
  useEffect(() => {
    if (!loading && user && action && token && invitationInfo && !error && !isExpired) {
      // Auto-process based on action in URL
      if (action === 'accept' || action === 'decline') {
        processInvitation(action);
      }
    }
  }, [loading, user, action, token, invitationInfo, error, isExpired]);

  const processInvitation = async (action: 'accept' | 'decline') => {
    if (!user || !token) return;

    setIsProcessing(true);

    try {
      const { data, error } = await supabase.functions.invoke('process-invitation', {
        body: { token, action, userId: user.id }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.success) {
        toast({
          title: action === 'accept' ? 'Invitation Accepted' : 'Invitation Declined',
          description: data.message
        });

        // Navigate to the appropriate page
        if (action === 'accept' && data.organization?.id) {
          navigate(`/organizations/${data.organization.id}`);
        } else {
          navigate('/dashboard');
        }
      } else {
        throw new Error(data.message || 'Failed to process invitation');
      }
    } catch (err) {
      console.error(`Error ${action}ing invitation:`, err);
      setError(`Failed to ${action} invitation`);
      toast({
        title: 'Error',
        description: `Failed to ${action} invitation`,
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // If not authenticated, redirect to auth page with return URL
  useEffect(() => {
    if (!loading && !user) {
      navigate(`/auth?returnTo=${encodeURIComponent(window.location.pathname)}`);
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-md">
      <Card className="text-center shadow-lg">
        <CardHeader>
          <div className="mx-auto mb-4">
            <Building2 className="h-12 w-12 text-primary" />
          </div>
          <CardTitle>Organization Invitation</CardTitle>
          {invitationInfo && !error && !isExpired && (
            <CardDescription>
              You've been invited to join {invitationInfo.organization.name} as a{' '}
              <span className="font-medium">{invitationInfo.role}</span>
            </CardDescription>
          )}
        </CardHeader>

        <CardContent>
          {error ? (
            <div className="flex flex-col items-center text-destructive">
              <AlertTriangle className="h-10 w-10 mb-2" />
              <p>{error}</p>
            </div>
          ) : isExpired ? (
            <div className="flex flex-col items-center text-amber-500">
              <AlertTriangle className="h-10 w-10 mb-2" />
              <p>This invitation has expired</p>
            </div>
          ) : invitationInfo ? (
            <div className="space-y-4 text-left">
              <div>
                <h3 className="text-sm font-medium">Organization</h3>
                <p>{invitationInfo.organization.name}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium">Type</h3>
                <p className="capitalize">{invitationInfo.organization.type.replace('_', ' ')}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium">Role</h3>
                <p className="capitalize">{invitationInfo.role}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium">Invited By</h3>
                <p>{invitationInfo.inviter}</p>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
        </CardContent>

        {invitationInfo && !error && !isExpired && !isProcessing && !action && (
          <CardFooter className="flex gap-4">
            <Button
              onClick={() => processInvitation('accept')}
              className="flex-1"
              disabled={isProcessing}
            >
              <Check className="mr-2 h-4 w-4" />
              Accept
            </Button>
            <Button
              onClick={() => processInvitation('decline')}
              variant="outline"
              className="flex-1"
              disabled={isProcessing}
            >
              <X className="mr-2 h-4 w-4" />
              Decline
            </Button>
          </CardFooter>
        )}

        {isProcessing && (
          <CardFooter className="justify-center">
            <Button disabled>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

export default InvitationPage;