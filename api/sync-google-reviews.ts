/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from '../../lib/supabase';
import { syncGoogleReviewsPendentes } from '../../../functions/sync-google-reviews/syncGoogleReviewsPendentes';

export async function handler(req, res) {
  try {
    await syncGoogleReviewsPendentes(supabase);
    res.status(200).json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}