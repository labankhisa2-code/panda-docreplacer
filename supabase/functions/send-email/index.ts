import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

interface TestConnectionRequest {
  test: boolean;
}

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const smtpHost = Deno.env.get("SMTP_HOST");
    const smtpPort = Deno.env.get("SMTP_PORT");
    const smtpUsername = Deno.env.get("SMTP_USERNAME");
    const smtpPassword = Deno.env.get("SMTP_PASSWORD");

    if (!smtpHost || !smtpPort || !smtpUsername || !smtpPassword) {
      console.error("Missing SMTP configuration");
      return new Response(
        JSON.stringify({ error: "SMTP configuration is incomplete. Please check your email settings." }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const body = await req.json();

    // Test connection
    if ((body as TestConnectionRequest).test) {
      console.log("Testing SMTP connection...");
      
      // Use SMTPClient from denopkg
      const { SMTPClient } = await import("https://deno.land/x/denomailer@1.6.0/mod.ts");
      
      try {
        const client = new SMTPClient({
          connection: {
            hostname: smtpHost,
            port: parseInt(smtpPort),
            tls: true,
            auth: {
              username: smtpUsername,
              password: smtpPassword,
            },
          },
        });

        await client.close();
        
        console.log("SMTP connection test successful");
        return new Response(
          JSON.stringify({ success: true, message: "SMTP connection successful!" }),
          { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      } catch (connError: unknown) {
        console.error("SMTP connection test failed:", connError);
        const errorMessage = connError instanceof Error ? connError.message : "Unknown error";
        return new Response(
          JSON.stringify({ error: `SMTP connection failed: ${errorMessage}` }),
          { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
    }

    // Send email
    const { to, subject, html, text }: EmailRequest = body;

    if (!to || !subject || !html) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: to, subject, and html are required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Sending email to: ${to}, subject: ${subject}`);

    const { SMTPClient } = await import("https://deno.land/x/denomailer@1.6.0/mod.ts");

    const client = new SMTPClient({
      connection: {
        hostname: smtpHost,
        port: parseInt(smtpPort),
        tls: true,
        auth: {
          username: smtpUsername,
          password: smtpPassword,
        },
      },
    });

    await client.send({
      from: smtpUsername,
      to: to,
      subject: subject,
      content: text || html,
      html: html,
    });

    await client.close();

    console.log("Email sent successfully");
    return new Response(
      JSON.stringify({ success: true, message: "Email sent successfully!" }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("Error in send-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to send email" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
