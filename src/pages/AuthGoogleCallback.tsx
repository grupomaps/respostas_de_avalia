import { useEffect } from 'react';

export default function AuthGoogleCallback() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const empresaId = params.get('state');

    if (!code || !empresaId) {
      console.error('OAuth inválido');
      return;
    }

    fetch('/api/google/callback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, empresaId }),
    })
      .then(() => {
        window.location.href = '/empresas?google=connected';
      })
      .catch(() => {
        window.location.href = '/empresas?google=error';
      });
  }, []);

  return <p>Conectando com o Google...</p>;
}