import { useEffect } from "react";
import { supabase } from '../lib/supabase.ts'

export default function AuthGoogleCallback() {
  useEffect(() => {
    const executar = async () => {
      console.group("🔵 Google OAuth Callback");

      // 🔍 URL atual
      console.log("URL atual:", window.location.href);

      const params = new URLSearchParams(window.location.search);
const code = params.get("code");
const empresaId = params.get("state");

if (!code || !empresaId) return;

// 1️⃣ Trocar authorization code por tokens
const body = new URLSearchParams({
  code,
  client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
  client_secret: import.meta.env.VITE_GOOGLE_CLIENT_SECRET,
  redirect_uri: "http://localhost:5173/auth/google/callback",
      // redirect_uri: "https://respostas-de-avalia.vercel.app/auth/google/callback",
  grant_type: "authorization_code",
});

console.log("Authorization code:", code);
console.log("Body enviado para o token endpoint:", body.toString());

const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: body.toString(),
});

const tokenData = await tokenRes.json();
console.log("Resposta do Google:", tokenData);

// 2️⃣ Salvar no Supabase
const { access_token, refresh_token } = tokenData;

const { data, error } = await supabase
  .from("empresas")
  .update({ 
    google_conectado: true,
    access_token,
    refresh_token,
  })
  .eq("id", empresaId)
  .select();

console.log("Supabase update:", { data, error });

      if (error) {
        console.error("❌ Erro ao atualizar empresa:", error);
        console.groupEnd();
        window.location.href = "/empresas?google=error";
        return;
      }

      if (!data || data.length === 0) {
        console.warn(
          "⚠️ Nenhuma linha foi atualizada. Possíveis causas:",
          "\n- ID inexistente",
          "\n- RLS bloqueando UPDATE",
          "\n- Policy incorreta"
        );
      } else {
        console.log("✅ Empresa atualizada com sucesso:", data);
      }

      console.groupEnd();

      // sucesso
      window.location.href = "/empresas?google=connected";
    };

    executar();
  }, []);

  return <p>Conectando com o Google...</p>;
}
