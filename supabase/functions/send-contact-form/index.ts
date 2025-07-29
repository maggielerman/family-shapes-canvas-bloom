// Send contact form submissions via Resend email service
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  try {
    const { name, email, subject, message }: ContactFormData = await req.json();

    // Basic validation
    if (!name || !email || !subject || !message) {
      return new Response(
        JSON.stringify({ error: "All fields are required" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: "Invalid email format" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    // Send email to support team
    const { data, error: emailError } = await resend.emails.send({
      from: "Family Shapes <noreply@familyshapes.com>",
      to: ["hello@familyshapes.com"],
      subject: `Contact Form: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #e67e22;">New Contact Form Submission</h2>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #2c3e50;">Contact Details</h3>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Subject:</strong> ${subject}</p>
          </div>
          
          <div style="background-color: #fff; padding: 20px; border: 1px solid #e9ecef; border-radius: 8px;">
            <h3 style="margin-top: 0; color: #2c3e50;">Message</h3>
            <p style="white-space: pre-wrap; line-height: 1.6;">${message}</p>
          </div>
          
          <div style="margin-top: 20px; padding: 15px; background-color: #e8f5e8; border-radius: 8px;">
            <p style="margin: 0; color: #2c5e2c; font-size: 14px;">
              This message was sent from the Family Shapes contact form.
            </p>
          </div>
        </div>
      `,
    });

    if (emailError) {
      console.error("Resend API error:", emailError);
      return new Response(
        JSON.stringify({ error: "Failed to send email" }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    // Send confirmation email to the user
    const { error: confirmationError } = await resend.emails.send({
      from: "Family Shapes <noreply@familyshapes.com>",
      to: [email],
      subject: "Thank you for contacting Family Shapes",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #e67e22;">Thank you for reaching out!</h2>
          
          <p>Hi ${name},</p>
          
          <p>We've received your message and will get back to you as soon as possible.</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #2c3e50;">Your Message</h3>
            <p><strong>Subject:</strong> ${subject}</p>
            <p style="white-space: pre-wrap; line-height: 1.6;">${message}</p>
          </div>
          
          <p>In the meantime, you can:</p>
          <ul>
            <li>Check out our <a href="https://familyshapes.com/faq" style="color: #e67e22;">FAQ page</a></li>
            <li>Explore our <a href="https://familyshapes.com/features" style="color: #e67e22;">features</a></li>
            <li>Join our <a href="https://familyshapes.com/community" style="color: #e67e22;">community</a></li>
          </ul>
          
          <p>Best regards,<br>The Family Shapes Team</p>
          
          <div style="margin-top: 30px; padding: 15px; background-color: #f8f9fa; border-radius: 8px; font-size: 14px; color: #6c757d;">
            <p style="margin: 0;">This is an automated response. Please do not reply to this email.</p>
          </div>
        </div>
      `,
    });

    if (confirmationError) {
      console.error("Confirmation email error:", confirmationError);
      // Don't fail the request if confirmation email fails
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Message sent successfully" 
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );

  } catch (error) {
    console.error("Contact form error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
});