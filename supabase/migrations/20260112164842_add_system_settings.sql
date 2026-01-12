/*
  # Add System Settings Table

  ## Overview
  Creates a table for general system settings like system name, logo, etc.

  ## New Tables
  
  ### system_settings
  Stores general system configuration
  - `id` (uuid, primary key)
  - `system_name` (text) - Name of the system
  - `logo_url` (text) - URL to the logo image
  - `admin_email` (text) - Administrator email
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ## Security
  - Enable RLS
  - Only admins can view and update

  ## Important Notes
  1. Only one record should exist
  2. Admins have full control
*/

-- Create system_settings table
CREATE TABLE IF NOT EXISTS system_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  system_name text DEFAULT 'GMAPS',
  logo_url text DEFAULT '/chatgpt_image_10_de_jan._de_2026,_23_15_19.png',
  admin_email text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Insert initial record
INSERT INTO system_settings (id, system_name, logo_url, admin_email)
VALUES (gen_random_uuid(), 'GMAPS', '/chatgpt_image_10_de_jan._de_2026,_23_15_19.png', '')
ON CONFLICT DO NOTHING;

-- Enable RLS
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for system_settings
CREATE POLICY "Only admins can view system settings"
  ON system_settings FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Only admins can update system settings"
  ON system_settings FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());
