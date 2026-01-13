/* eslint-disable @typescript-eslint/no-explicit-any */
import { serve } from 'std/server';
import { supabase } from '../../../src/lib/supabase'
import { syncGoogleReviewsPendentes } from './syncGoogleReviewsPendentes';

serve(async () => {
  try {
    await syncGoogleReviewsPendentes(supabase);
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err: any) {
    console.error(err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});
