import { useEffect } from "react";

export default function AuthGoogleCallback() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const empresaId = params.get("state");

    if (!code || !empresaId) {
      console.error("OAuth inválido");
      window.location.href = "/empresas?google=error";
      return;
    }

    fetch(
      "https://xxlyawrmiiulovhondas.supabase.co/functions/v1/google-callback",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({
          authorization_code: code,
          empresa_id: empresaId,
        }),
      }
    )
      .then(async (res) => {
        const text = await res.text();
        console.log("STATUS:", res.status);
        console.log("RESPOSTA:", text);

        if (!res.ok) {
          throw new Error("Erro na Edge Function");
        }

        window.location.href = "/empresas?google=connected";
      })
      .catch((err) => {
        console.error("Erro OAuth:", err);
        window.location.href = "/empresas?google=error";
      });
  }, []);

  return <p>Conectando com o Google...</p>;
}
