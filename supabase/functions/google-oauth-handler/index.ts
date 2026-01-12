/* eslint-disable @typescript-eslint/no-explicit-any */
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { empresa_id, authorization_code } = await req.json();

    if (!empresa_id || !authorization_code) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { data: config, error: configError } = await supabase
      .from("system_config")
      .select("google_client_id, google_client_secret")
      .maybeSingle();

    if (configError || !config?.google_client_id || !config?.google_client_secret) {
      return new Response(
        JSON.stringify({ error: "Google OAuth credentials not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code: authorization_code,
        client_id: config.google_client_id,
        client_secret: config.google_client_secret,
        redirect_uri: `${req.headers.get("origin")}/oauth/callback`,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error("Google OAuth error:", errorData);
      
      await supabase.from("logs").insert({
        tipo: "error",
        mensagem: `Erro no OAuth do Google: ${errorData}`,
      });

      return new Response(
        JSON.stringify({ error: "Failed to exchange authorization code" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const tokenData = await tokenResponse.json();

    const { error: updateError } = await supabase
      .from("empresas")
      .update({
        google_conectado: true,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token || "",
      })
      .eq("id", empresa_id);

    if (updateError) {
      console.error("Error updating empresa:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to update company" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    await supabase.from("logs").insert({
      tipo: "info",
      mensagem: `Empresa ${empresa_id} conectada ao Google com sucesso`,
    });

    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});