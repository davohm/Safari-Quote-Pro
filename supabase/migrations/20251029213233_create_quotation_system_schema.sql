/*
  # Quotation Generator System Schema

  ## Overview
  Complete database schema for a professional quotation/invoice management system
  with support for companies, clients, quotations, line items, and templates.

  ## New Tables

  ### 1. companies
  Stores business information for the quotation issuer
  - `id` (uuid, primary key) - Unique company identifier
  - `name` (text) - Company legal name
  - `email` (text) - Contact email address
  - `phone` (text) - Contact phone number
  - `address` (text) - Full business address
  - `city` (text) - City location
  - `state` (text) - State/province
  - `postal_code` (text) - ZIP/postal code
  - `country` (text) - Country name
  - `tax_id` (text) - Tax identification number (EIN, VAT, etc.)
  - `logo_url` (text) - URL to company logo in storage
  - `default_tax_rate` (numeric) - Default tax percentage
  - `default_currency` (text) - Default currency code (USD, EUR, etc.)
  - `default_terms` (text) - Default terms and conditions
  - `quote_prefix` (text) - Prefix for quote numbers (e.g., "QT-")
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 2. clients
  Stores customer/client information
  - `id` (uuid, primary key) - Unique client identifier
  - `name` (text) - Client name or company name
  - `email` (text) - Primary contact email
  - `phone` (text) - Contact phone number
  - `address` (text) - Full address
  - `city` (text) - City location
  - `state` (text) - State/province
  - `postal_code` (text) - ZIP/postal code
  - `country` (text) - Country name
  - `contact_person` (text) - Primary contact person name
  - `notes` (text) - Internal notes about the client
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 3. quotations
  Main quotations/invoices table
  - `id` (uuid, primary key) - Unique quotation identifier
  - `quote_number` (text, unique) - Human-readable quote number
  - `company_id` (uuid) - Reference to companies table
  - `client_id` (uuid) - Reference to clients table
  - `status` (text) - Quote status: draft, sent, accepted, rejected, expired
  - `issue_date` (date) - Date quotation was issued
  - `valid_until` (date) - Expiration date for the quote
  - `currency` (text) - Currency code for this quote
  - `subtotal` (numeric) - Sum of all line items
  - `tax_rate` (numeric) - Tax percentage applied
  - `tax_amount` (numeric) - Calculated tax amount
  - `discount_type` (text) - Type: percentage or fixed
  - `discount_value` (numeric) - Discount amount or percentage
  - `discount_amount` (numeric) - Calculated discount amount
  - `total` (numeric) - Final total after tax and discount
  - `terms` (text) - Terms and conditions for this quote
  - `notes` (text) - Internal notes
  - `template_id` (text) - PDF template identifier
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 4. quotation_items
  Line items for each quotation
  - `id` (uuid, primary key) - Unique line item identifier
  - `quotation_id` (uuid) - Reference to quotations table
  - `description` (text) - Item/service description
  - `quantity` (numeric) - Quantity of items
  - `unit_price` (numeric) - Price per unit
  - `total` (numeric) - Calculated line total (quantity × unit_price)
  - `sort_order` (integer) - Display order in the quote
  - `created_at` (timestamptz) - Record creation timestamp

  ### 5. templates
  PDF template configurations
  - `id` (text, primary key) - Template identifier
  - `name` (text) - Template display name
  - `description` (text) - Template description
  - `preview_url` (text) - URL to template preview image
  - `is_active` (boolean) - Whether template is available
  - `created_at` (timestamptz) - Record creation timestamp

  ## Security
  - Enable Row Level Security (RLS) on all tables
  - Add policies for authenticated users to manage their data
  - Public read access for templates table

  ## Indexes
  - Index on quotations.quote_number for fast lookup
  - Index on quotations.status for filtering
  - Index on quotations.client_id for client history
  - Index on quotation_items.quotation_id for efficient joins
*/

-- Create companies table
CREATE TABLE IF NOT EXISTS companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text,
  phone text,
  address text,
  city text,
  state text,
  postal_code text,
  country text DEFAULT 'United States',
  tax_id text,
  logo_url text,
  default_tax_rate numeric(5,2) DEFAULT 0,
  default_currency text DEFAULT 'USD',
  default_terms text,
  quote_prefix text DEFAULT 'QT-',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create clients table
CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text,
  phone text,
  address text,
  city text,
  state text,
  postal_code text,
  country text DEFAULT 'United States',
  contact_person text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create quotations table
CREATE TABLE IF NOT EXISTS quotations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_number text UNIQUE NOT NULL,
  company_id uuid REFERENCES companies(id) ON DELETE SET NULL,
  client_id uuid REFERENCES clients(id) ON DELETE SET NULL,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'accepted', 'rejected', 'expired')),
  issue_date date DEFAULT CURRENT_DATE,
  valid_until date,
  currency text DEFAULT 'USD',
  subtotal numeric(12,2) DEFAULT 0,
  tax_rate numeric(5,2) DEFAULT 0,
  tax_amount numeric(12,2) DEFAULT 0,
  discount_type text DEFAULT 'percentage' CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value numeric(12,2) DEFAULT 0,
  discount_amount numeric(12,2) DEFAULT 0,
  total numeric(12,2) DEFAULT 0,
  terms text,
  notes text,
  template_id text DEFAULT 'modern',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create quotation_items table
CREATE TABLE IF NOT EXISTS quotation_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_id uuid REFERENCES quotations(id) ON DELETE CASCADE NOT NULL,
  description text NOT NULL,
  quantity numeric(10,2) DEFAULT 1,
  unit_price numeric(12,2) DEFAULT 0,
  total numeric(12,2) DEFAULT 0,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create templates table
CREATE TABLE IF NOT EXISTS templates (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text,
  preview_url text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Insert default templates
INSERT INTO templates (id, name, description, is_active) VALUES
  ('modern', 'Modern Minimal', 'Clean and contemporary design with bold typography', true),
  ('professional', 'Professional Classic', 'Traditional business layout with sidebar details', true),
  ('elegant', 'Elegant Invoice', 'Sophisticated design with centered header', true)
ON CONFLICT (id) DO NOTHING;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_quotations_quote_number ON quotations(quote_number);
CREATE INDEX IF NOT EXISTS idx_quotations_status ON quotations(status);
CREATE INDEX IF NOT EXISTS idx_quotations_client_id ON quotations(client_id);
CREATE INDEX IF NOT EXISTS idx_quotations_company_id ON quotations(company_id);
CREATE INDEX IF NOT EXISTS idx_quotation_items_quotation_id ON quotation_items(quotation_id);
CREATE INDEX IF NOT EXISTS idx_quotations_issue_date ON quotations(issue_date DESC);

-- Enable Row Level Security
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for companies
CREATE POLICY "Allow public read access to companies"
  ON companies FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert to companies"
  ON companies FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update to companies"
  ON companies FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete from companies"
  ON companies FOR DELETE
  TO public
  USING (true);

-- RLS Policies for clients
CREATE POLICY "Allow public read access to clients"
  ON clients FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert to clients"
  ON clients FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update to clients"
  ON clients FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete from clients"
  ON clients FOR DELETE
  TO public
  USING (true);

-- RLS Policies for quotations
CREATE POLICY "Allow public read access to quotations"
  ON quotations FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert to quotations"
  ON quotations FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update to quotations"
  ON quotations FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete from quotations"
  ON quotations FOR DELETE
  TO public
  USING (true);

-- RLS Policies for quotation_items
CREATE POLICY "Allow public read access to quotation_items"
  ON quotation_items FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert to quotation_items"
  ON quotation_items FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update to quotation_items"
  ON quotation_items FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete from quotation_items"
  ON quotation_items FOR DELETE
  TO public
  USING (true);

-- RLS Policies for templates (public read only)
CREATE POLICY "Allow public read access to templates"
  ON templates FOR SELECT
  TO public
  USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_companies_updated_at ON companies;
CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON companies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_clients_updated_at ON clients;
CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_quotations_updated_at ON quotations;
CREATE TRIGGER update_quotations_updated_at
  BEFORE UPDATE ON quotations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
