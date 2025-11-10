import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SubscribeRequest {
  email: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email }: SubscribeRequest = await req.json();
    console.log("Newsletter subscription request received");

    // Validate email with proper regex and length limits
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || typeof email !== 'string' || email.length > 255 || !emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: "Invalid email address" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const kitApiKey = Deno.env.get("KIT_API_KEY")?.trim();
    const kitFormId = Deno.env.get("KIT_FORM_ID")?.trim();

    if (!kitApiKey || !kitFormId) {
      console.error("Missing Kit.com credentials");
      return new Response(
        JSON.stringify({ error: "Newsletter service not configured" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Subscribe to Kit.com form using v4 API with detailed debugging and endpoint fallbacks
    const maskedKey = kitApiKey ? `${kitApiKey.slice(0, 4)}***${kitApiKey.slice(-4)}` : "missing";
    console.log(`Subscribing to Kit.com form ID: ${kitFormId} with masked key: ${maskedKey}`);

    const baseUrl = "https://api.kit.com/v4";

    const baseHeaders: Record<string, string> = {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "User-Agent": "SkillStackerNewsletter/1.0",
      "X-Kit-Api-Key": kitApiKey!,
    };

    // Try multiple endpoints to maximize compatibility across Kit API changes
    const endpoints = [
      { name: "forms/{id}/subscribers", url: `${baseUrl}/forms/${kitFormId}/subscribers`, body: { email_address: email } },
      { name: "forms/{id}/subscriptions", url: `${baseUrl}/forms/${kitFormId}/subscriptions`, body: { email_address: email } },
      { name: "subscribers (with form_id)", url: `${baseUrl}/subscribers`, body: { email_address: email, form_id: Number(kitFormId) } },
    ] as const;

    let kitResponse: Response | null = null;
    let lastErrorStatus = 0;
    let lastErrorBody = "";

    for (const ep of endpoints) {
      try {
        console.log(`Kit.com request → POST ${ep.name}: ${ep.url}`);
        const resp = await fetch(ep.url, {
          method: "POST",
          headers: baseHeaders,
          body: JSON.stringify(ep.body),
        });

        if (resp.ok) {
          kitResponse = resp;
          console.log(`Kit.com endpoint ${ep.name} succeeded with ${resp.status}`);
          break;
        }

        const bodyText = await resp.text();
        console.error(`Kit.com endpoint ${ep.name} failed with status ${resp.status}`);

        // Handle already subscribed gracefully
        if (resp.status === 400 && bodyText.toLowerCase().includes("already")) {
          return new Response(
            JSON.stringify({ success: true, message: "You're already subscribed!" }),
            { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
          );
        }

        lastErrorStatus = resp.status;
        lastErrorBody = bodyText;
      } catch (err) {
        console.error(`Kit.com endpoint ${ep.name} error:`, (err as Error).message);
        lastErrorStatus = 0;
        lastErrorBody = (err as Error).message || "Unknown error";
      }
    }

    if (!kitResponse) {
      console.error(`Kit.com request failed across all endpoints. Last status: ${lastErrorStatus}`);
      return new Response(
        JSON.stringify({ error: "Failed to subscribe to newsletter" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const data = await kitResponse.json();
    console.log("Successfully subscribed to Kit.com");

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Successfully subscribed to newsletter!" 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in subscribe-newsletter function:", error);
    return new Response(
      JSON.stringify({ error: "Failed to subscribe to newsletter" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
