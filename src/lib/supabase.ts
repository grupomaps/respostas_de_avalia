import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface UserRole {
  user_id: string;
  role: 'admin' | 'user';
  created_at: string;
}

export interface SystemConfig {
  id: string;
  openai_api_key: string;
  google_client_id: string;
  google_client_secret: string;
  created_at: string;
  updated_at: string;
}

export interface SystemSettings {
  id: string;
  system_name: string;
  logo_url: string;
  admin_email: string;
  created_at: string;
  updated_at: string;
}

export interface Empresa {
  id: string;
  nome: string;
  email_responsavel: string;
  google_place_id: string;
  google_conectado: boolean;
  access_token: string;
  refresh_token: string;
  automacao_ativa: boolean;
  created_at: string;
}

export interface Avaliacao {
  id: string;
  empresa_id: string;
  autor: string;
  rating: number;
  comentario: string;
  respondida: boolean;
  resposta: string;
  created_at: string;
}

export interface Log {
  id: string;
  tipo: string;
  mensagem: string;
  created_at: string;
}
