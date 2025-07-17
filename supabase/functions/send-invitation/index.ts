// Send organization invitations via Resend email service
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const appUrl = Deno.env.get("APP_URL") || "https://6e4109b6-b165-4556-baab-bd21469c6dee.lovableproject.com";

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
    const { invitationId, fromName } = await req.json();

    if (!invitationId) {
      throw new Error("Missing required parameters");
    }

    // Create Supabase client
    const supabase = await createClient();

    // Get the invitation details
    const { data: invitation, error: invitationError } = await supabase
      .from("organization_invitations")
      .select("*, organizations(*)")
      .eq("id", invitationId)
      .single();

    if (invitationError || !invitation) {
      throw new Error(`Failed to retrieve invitation: ${invitationError?.message}`);
    }

    const organizationName = invitation.organizations.name;
    const organizationType = invitation.organizations.type.replace('_', ' ');
    const inviteeEmail = invitation.invitee_email;
    const role = invitation.role;
    
    // Generate accept/decline links
    const acceptUrl = `${appUrl}/invitation/accept/${invitation.token}`;
    const declineUrl = `${appUrl}/invitation/decline/${invitation.token}`;

    // Send the invitation email
    console.log("Attempting to send email to:", inviteeEmail);
    console.log("Organization name:", organizationName);
    
    const { data, error: emailError } = await resend.emails.send({
      from: "Family Shapes <onboarding@resend.dev>",
      to: [inviteeEmail],
      subject: `You're invited to join ${organizationName} on Family Shapes`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              color: #333;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background-color: #f8fafc;
              border-bottom: 1px solid #e2e8f0;
              padding: 20px;
              text-align: center;
            }
            .header h1 {
              color: #1e40af;
              margin: 0;
              font-weight: 600;
            }
            .content {
              padding: 20px;
            }
            .footer {
              background-color: #f8fafc;
              padding: 20px;
              text-align: center;
              font-size: 14px;
              color: #64748b;
            }
            .button {
              display: inline-block;
              padding: 12px 24px;
              background-color: #2563eb;
              color: white !important;
              text-decoration: none;
              border-radius: 4px;
              font-weight: 500;
              margin: 10px 5px;
            }
            .button.secondary {
              background-color: #e2e8f0;
              color: #334155 !important;
            }
            .buttons {
              margin: 30px 0;
              text-align: center;
            }
            .highlight {
              font-weight: 600;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Family Shapes</h1>
            </div>
            <div class="content">
              <h2>You're invited to join ${organizationName}</h2>
              <p>Hello,</p>
              <p>
                ${fromName || 'Someone'} has invited you to join <span class="highlight">${organizationName}</span> 
                (a ${organizationType}) on Family Shapes as a <span class="highlight">${role}</span>.
              </p>
              <p>
                Family Shapes is a platform that helps families visualize and manage complex family relationships,
                especially those formed through donor conception, adoption, and other family structures.
              </p>
              <div class="buttons">
                <a href="${acceptUrl}" class="button">Accept Invitation</a>
                <a href="${declineUrl}" class="button secondary">Decline</a>
              </div>
              <p>
                If you have any questions, please contact the organization administrator.
              </p>
              <p>
                This invitation will expire in 7 days.
              </p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Family Shapes. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (emailError) {
      console.error("Resend API error:", emailError);
      throw new Error(`Failed to send email: ${emailError.message || JSON.stringify(emailError)}`);
    }

    // Update invitation status to 'sent'
    const { error: updateError } = await supabase
      .from("organization_invitations")
      .update({ status: "sent" })
      .eq("id", invitationId);

    if (updateError) {
      console.error("Failed to update invitation status:", updateError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Invitation sent to ${inviteeEmail}`,
        data
      }),
      {
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
    
  } catch (error) {
    console.error("Error in send-invitation function:", error);
    
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