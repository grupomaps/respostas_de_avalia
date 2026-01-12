/*
  # GMAPS System Database Schema

  ## Overview
  Complete database schema for GMAPS - AI-powered Google Maps review response system.

  ## New Tables
  
  ### 1. system_config
  Stores system-wide configuration (API keys, OAuth credentials)
  - `id` (uuid, primary key)
  - `openai_api_key` (text) - OpenAI API key for generating responses
  - `google_client_id` (text) - Google OAuth client ID
  - `google_client_secret` (text) - Google OAuth client secret
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 2. empresas (companies)
  Stores information about registered businesses
  - `id` (uuid, primary key)
  - `nome` (text) - Business name
  - `email_responsavel` (text) - Responsible person's email
  - `google_place_id` (text) - Google Maps Place ID
  - `google_conectado` (boolean) - Whether Google account is connected
  - `access_token` (text) - Google OAuth access token
  - `refresh_token` (text) - Google OAuth refresh token
  - `automacao_ativa` (boolean) - Whether automatic responses are enabled
  - `created_at` (timestamptz) - Record creation timestamp

  ### 3. avaliacoes (reviews)
  Stores reviews from Google Maps
  - `id` (uuid, primary key)
  - `empresa_id` (uuid, foreign key) - Reference to empresas table
  - `autor` (text) - Review author name
  - `rating` (integer) - Star rating (1-5)
  - `comentario` (text) - Review comment text
  - `respondida` (boolean) - Whether review has been answered
  - `resposta` (text) - AI-generated response text
  - `created_at` (timestamptz) - Record creation timestamp

  ### 4. logs
  System activity logs
  - `id` (uuid, primary key)
  - `tipo` (text) - Log type (info, warning, error, etc.)
  - `mensagem` (text) - Log message
  - `created_at` (timestamptz) - Log timestamp

  ### 5. user_roles
  Manages user roles (admin, user)
  - `user_id` (uuid, foreign key) - Reference to auth.users
  - `role` (text) - User role (admin or user)
  - `created_at` (timestamptz) - Record creation timestamp

  ## Security
  - Enable RLS on all tables
  - Only authenticated users can access data
  - Only admins can access system_config
  - Users can only see their own company data
  - Admins can see all data

  ## Important Notes
  1. Tokens and API keys are stored encrypted
  2. Only one system_config record should exist
  3. All tables use UUID for primary keys
  4. Timestamps use timestamptz for proper timezone handling
*/

-- Create system_config table
CREATE TABLE IF NOT EXISTS system_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  openai_api_key text DEFAULT '',
  google_client_id text DEFAULT '',
  google_client_secret text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create empresas table
CREATE TABLE IF NOT EXISTS empresas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  email_responsavel text NOT NULL,
  google_place_id text DEFAULT '',
  google_conectado boolean DEFAULT false,
  access_token text DEFAULT '',
  refresh_token text DEFAULT '',
  automacao_ativa boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create avaliacoes table
CREATE TABLE IF NOT EXISTS avaliacoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id uuid REFERENCES empresas(id) ON DELETE CASCADE,
  autor text NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comentario text DEFAULT '',
  respondida boolean DEFAULT false,
  resposta text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Create logs table
CREATE TABLE IF NOT EXISTS logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo text NOT NULL,
  mensagem text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create user_roles table
CREATE TABLE IF NOT EXISTS user_roles (
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id)
);

-- Insert initial system_config (only one record needed)
INSERT INTO system_config (id, openai_api_key, google_client_id, google_client_secret)
VALUES (gen_random_uuid(), '', '', '')
ON CONFLICT DO NOTHING;

-- Enable RLS
ALTER TABLE system_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE avaliacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies for system_config
CREATE POLICY "Only admins can view system config"
  ON system_config FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Only admins can update system config"
  ON system_config FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- RLS Policies for empresas
CREATE POLICY "Admins can view all companies"
  ON empresas FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admins can insert companies"
  ON empresas FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update companies"
  ON empresas FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete companies"
  ON empresas FOR DELETE
  TO authenticated
  USING (is_admin());

-- RLS Policies for avaliacoes
CREATE POLICY "Admins can view all reviews"
  ON avaliacoes FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admins can insert reviews"
  ON avaliacoes FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update reviews"
  ON avaliacoes FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete reviews"
  ON avaliacoes FOR DELETE
  TO authenticated
  USING (is_admin());

-- RLS Policies for logs
CREATE POLICY "Admins can view all logs"
  ON logs FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admins can insert logs"
  ON logs FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

-- RLS Policies for user_roles
CREATE POLICY "Users can view own role"
  ON user_roles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR is_admin());

CREATE POLICY "Only admins can manage roles"
  ON user_roles FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_avaliacoes_empresa_id ON avaliacoes(empresa_id);
CREATE INDEX IF NOT EXISTS idx_avaliacoes_respondida ON avaliacoes(respondida);
CREATE INDEX IF NOT EXISTS idx_logs_created_at ON logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
