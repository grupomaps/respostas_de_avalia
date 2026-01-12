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

    const { rating, comentario, empresa_id } = await req.json();

    if (!rating || !comentario || !empresa_id) {
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
      .select("openai_api_key")
      .maybeSingle();

    if (configError || !config?.openai_api_key) {
      return new Response(
        JSON.stringify({ error: "OpenAI API key not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const prompt = `Você é um assistente profissional que gera respostas educadas e apropriadas para avaliações do Google Maps.

Avaliação recebida:
Nota: ${rating}/5
Comentário: ${comentario}

Gere uma resposta profissional, educada e apropriada. ${rating >= 4 ? "Agradeça o feedback positivo." : "Reconheça as preocupações e mostre compromisso em melhorar."} Mantenha a resposta concisa (máximo 3 frases).`;

    const openaiResponse = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${config.openai_api_key}`,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "Você é um assistente profissional para gerar respostas a avaliações."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 150,
        }),
      }
    );

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.text();
      console.error("OpenAI error:", errorData);
      
      await supabase.from("logs").insert({
        tipo: "error",
        mensagem: `Erro ao gerar resposta com OpenAI: ${errorData}`,
      });

      return new Response(
        JSON.stringify({ error: "Failed to generate response" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const openaiData = await openaiResponse.json();
    const generatedResponse = openaiData.choices[0]?.message?.content || "";

    await supabase.from("logs").insert({
      tipo: "info",
      mensagem: `Resposta gerada com sucesso para empresa ${empresa_id}`,
    });

    return new Response(
      JSON.stringify({ response: generatedResponse }),
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