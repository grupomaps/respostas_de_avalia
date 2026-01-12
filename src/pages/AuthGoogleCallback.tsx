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

      console.log("Authorization code:", code);
      console.log("Empresa ID (state):", empresaId);
      console.log("Tipo do empresaId:", typeof empresaId);

      if (!code || !empresaId) {
        console.error("❌ Callback inválido — code ou state ausente");
        console.groupEnd();
        window.location.href = "/empresas?google=error";
        return;
      }

      // 🔍 Teste de conexão com Supabase
      console.log("🔄 Tentando atualizar google_conectado...");

      const { data, error } = await supabase
        .from("empresas")
        .update({ google_conectado: true })
        .eq("id", empresaId)
        .select(); // 👈 força retorno para debug

      console.log("Resposta Supabase (data):", data);
      console.log("Resposta Supabase (error):", error);

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
