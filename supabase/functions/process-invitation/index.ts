// Process invitation acceptance/rejection
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

// Required CORS headers for browser requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Create Supabase client
const createClient = async () => {
  const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2.21.0");
  return createClient(supabaseUrl as string, supabaseServiceKey as string);
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Parse the request body
    const { token, action, userId } = await req.json();

    if (!token || !action || !userId) {
      throw new Error("Missing required parameters");
    }

    // Create Supabase client
    const supabase = await createClient();

    // Get the invitation details
    const { data: invitation, error: invitationError } = await supabase
      .from("organization_invitations")
      .select("*, organizations(*)")
      .eq("token", token)
      .single();

    if (invitationError || !invitation) {
      throw new Error(`Invitation not found or invalid`);
    }

    // Check if invitation is expired
    const expiryDate = new Date(invitation.expires_at);
    if (expiryDate < new Date()) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "This invitation has expired."
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    }

    if (action === "accept") {
      // Add user to organization members
      const { error: membershipError } = await supabase
        .from("organization_memberships")
        .insert({
          organization_id: invitation.organization_id,
          user_id: userId,
          role: invitation.role,
          invited_by: invitation.inviter_id,
          joined_at: new Date().toISOString()
        });

      if (membershipError) {
        throw new Error(`Failed to add member: ${membershipError.message}`);
      }

      // Update invitation status
      await supabase
        .from("organization_invitations")
        .update({ status: "accepted", invitee_id: userId })
        .eq("id", invitation.id);

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `Successfully joined ${invitation.organizations.name}`,
          organization: {
            id: invitation.organization_id,
            name: invitation.organizations.name
          }
        }),
        {
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    } else if (action === "decline") {
      // Update invitation status
      await supabase
        .from("organization_invitations")
        .update({ status: "declined", invitee_id: userId })
        .eq("id", invitation.id);

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `Invitation declined`
        }),
        {
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    } else {
      throw new Error("Invalid action");
    }
  } catch (error) {
    console.error("Error in process-invitation function:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  }
});