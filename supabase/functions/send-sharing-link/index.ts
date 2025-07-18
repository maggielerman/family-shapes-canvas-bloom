import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SendSharingLinkRequest {
  linkId: string;
  emails: string[];
  message?: string;
  senderName?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { linkId, emails, message, senderName }: SendSharingLinkRequest = await req.json();

    // Fetch the sharing link details
    const { data: linkData, error: linkError } = await supabase
      .from('sharing_links')
      .select(`
        *,
        family_trees!inner(name, description)
      `)
      .eq('id', linkId)
      .single();

    if (linkError || !linkData) {
      throw new Error('Sharing link not found');
    }

    // Generate the sharing URL
    const baseUrl = Deno.env.get("SITE_URL") || "https://familyshapes.lovable.app";
    const sharingUrl = `${baseUrl}/public/tree/${linkData.group_id}?token=${linkData.link_token}`;

    // Send emails to all recipients
    const emailPromises = emails.map(async (email) => {
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; margin-bottom: 10px;">Family Shapes</h1>
            <p style="color: #64748b; margin: 0;">You've been invited to view a family tree</p>
          </div>
          
          <div style="background: #f8fafc; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
            <h2 style="color: #1e293b; margin-top: 0;">${linkData.family_trees.name}</h2>
            ${linkData.family_trees.description ? `<p style="color: #64748b; margin-bottom: 16px;">${linkData.family_trees.description}</p>` : ''}
            ${senderName ? `<p style="color: #64748b; margin-bottom: 16px;"><strong>${senderName}</strong> has invited you to view their family tree.</p>` : ''}
            ${message ? `<div style="background: white; border-left: 4px solid #2563eb; padding: 16px; margin: 16px 0;"><p style="margin: 0; color: #1e293b; font-style: italic;">"${message}"</p></div>` : ''}
          </div>

          <div style="text-align: center; margin-bottom: 24px;">
            <a href="${sharingUrl}" 
               style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">
              View Family Tree
            </a>
          </div>

          <div style="background: #f1f5f9; border-radius: 6px; padding: 16px; margin-bottom: 24px;">
            <h3 style="color: #1e293b; margin-top: 0; font-size: 14px;">Access Details:</h3>
            <ul style="color: #64748b; font-size: 14px; margin: 8px 0;">
              <li>Access Level: ${linkData.access_level === 'view' ? 'View Only' : 'View & Comment'}</li>
              ${linkData.max_uses ? `<li>Usage Limit: ${linkData.current_uses}/${linkData.max_uses} uses</li>` : '<li>Usage: Unlimited</li>'}
              ${linkData.expires_at ? `<li>Expires: ${new Date(linkData.expires_at).toLocaleDateString()}</li>` : '<li>Expires: Never</li>'}
            </ul>
          </div>

          <div style="text-align: center; color: #64748b; font-size: 12px;">
            <p>If you can't click the button above, copy and paste this link into your browser:</p>
            <p style="word-break: break-all; background: #f8fafc; padding: 8px; border-radius: 4px; font-family: monospace;">
              ${sharingUrl}
            </p>
          </div>

          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;">
          
          <div style="text-align: center; color: #94a3b8; font-size: 12px;">
            <p>This invitation was sent through Family Shapes. If you didn't expect this email, you can safely ignore it.</p>
          </div>
        </div>
      `;

      return resend.emails.send({
        from: "Family Shapes <invites@familyshapes.com>",
        to: [email],
        subject: `You're invited to view "${linkData.family_trees.name}" family tree`,
        html: emailHtml,
      });
    });

    const results = await Promise.allSettled(emailPromises);
    
    // Update the sharing link with invited emails
    const { error: updateError } = await supabase
      .from('sharing_links')
      .update({ 
        invited_emails: emails,
        updated_at: new Date().toISOString()
      })
      .eq('id', linkId);

    if (updateError) {
      console.error('Error updating sharing link:', updateError);
    }

    // Check for any failed emails
    const failed = results.filter(result => result.status === 'rejected');
    const successful = results.filter(result => result.status === 'fulfilled');

    return new Response(JSON.stringify({
      success: true,
      sent: successful.length,
      failed: failed.length,
      failedEmails: failed.map((result, index) => ({
        email: emails[index],
        error: result.reason
      }))
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error("Error in send-sharing-link function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);