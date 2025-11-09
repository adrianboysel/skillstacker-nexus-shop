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
    console.log("Newsletter subscription request for:", email);

    // Validate email
    if (!email || !email.includes("@")) {
      return new Response(
        JSON.stringify({ error: "Invalid email address" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const kitApiKey = Deno.env.get("KIT_API_KEY");
    const kitFormId = Deno.env.get("KIT_FORM_ID");

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

    // Subscribe to Kit.com form using v4 API
    console.log(`Subscribing to Kit.com form ID: ${kitFormId}`);
    const kitResponse = await fetch(
      `https://api.kit.com/v4/forms/${kitFormId}/subscribers`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Kit ${kitApiKey}`,
        },
        body: JSON.stringify({
          email_address: email,
        }),
      }
    );

    if (!kitResponse.ok) {
      const errorData = await kitResponse.text();
      console.error("Kit.com API error:", kitResponse.status, errorData);
      
      // Check if already subscribed
      if (kitResponse.status === 400 && errorData.includes("already")) {
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: "You're already subscribed!" 
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }
      
      throw new Error(`Kit.com API returned ${kitResponse.status}`);
    }

    const data = await kitResponse.json();
    console.log("Successfully subscribed to Kit.com:", data);

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
      JSON.stringify({ error: error.message || "Failed to subscribe" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
