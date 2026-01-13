/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from '../../../src/lib/supabase';
import fetch from 'node-fetch'; // ou globalThis.fetch em Edge Functions

export async function syncGoogleReviewsPendentes() {
  try {
    console.log('[SYNC] Iniciando sincronização de reviews...');

    // 1️⃣ Buscar empresas com Google conectado
    const { data: empresas, error: empError } = await supabase
      .from('empresas')
      .select('id, nome, google_place_id, refresh_token, google_account_id')
      .eq('google_conectado', true);

    if (empError) throw empError;
    if (!empresas || empresas.length === 0) {
      console.log('[SYNC] Nenhuma empresa com Google conectado.');
      return;
    }

    for (const empresa of empresas) {
      console.group(`[SYNC] Empresa: ${empresa.nome}`);

      if (!empresa.google_place_id || !empresa.refresh_token || !empresa.google_account_id) {
        console.warn('[SYNC] Pulando empresa: falta place_id, refresh_token ou account_id', empresa);
        console.groupEnd();
        continue;
      }

      // 2️⃣ Obter access token usando refresh token
      console.log('[SYNC] Solicitando access_token via refresh token...');
      const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID!,
          client_secret: import.meta.env.VITE_GOOGLE_CLIENT_SECRET!,
          refresh_token: empresa.refresh_token,
          grant_type: 'refresh_token',
        }),
      });

      const tokenData = await tokenRes.json();
      const accessToken = tokenData.access_token;
      if (!accessToken) {
        console.error('[SYNC] Falha ao obter access_token', tokenData);
        console.groupEnd();
        continue;
      }

      console.log('[SYNC] Access token obtido com sucesso.');

      // 3️⃣ Buscar reviews da empresa no Google
      console.log('[SYNC] Buscando reviews no Google Business Profile API...');
      const reviewsRes = await fetch(
        `https://mybusinessbusinessinformation.googleapis.com/v1/accounts/${empresa.google_account_id}/locations/${empresa.google_place_id}/reviews`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (!reviewsRes.ok) {
        const text = await reviewsRes.text();
        console.error('[SYNC] Erro ao buscar reviews:', text);
        console.groupEnd();
        continue;
      }

      const reviewsJson = await reviewsRes.json();
      const reviews: any[] = reviewsJson.reviews || [];
      console.log(`[SYNC] ${reviews.length} reviews encontradas.`);

      // 4️⃣ Formatar e inserir/upsert no Supabase
      for (const r of reviews) {
        const upsertData = {
          id: `${empresa.id}-${r.reviewId}`,
          empresa_id: empresa.id,
          autor: r.reviewer?.displayName || 'Anônimo',
          rating: r.starRating ? parseInt(r.starRating.replace('STAR_', '')) : 0,
          comentario: r.comment || '',
          respondida: !!r.reply,
          created_at: r.createTime,
        };

        const { error: upsertError } = await supabase
          .from('avaliacoes')
          .upsert([upsertData], { onConflict: 'id' });

        if (upsertError) console.error('[SYNC] Erro ao upsertar review:', upsertError, upsertData);
      }

      console.log(`[SYNC] Empresa ${empresa.nome} sincronizada com sucesso.`);
      console.groupEnd();
    }

    console.log('[SYNC] Sincronização de reviews finalizada!');
  } catch (err: any) {
    console.error('[SYNC] Erro geral ao sincronizar reviews:', err);
  }
}
