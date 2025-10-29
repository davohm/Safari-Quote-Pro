export interface Company {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  tax_id?: string;
  logo_url?: string;
  default_tax_rate?: number;
  default_currency?: string;
  default_terms?: string;
  quote_prefix?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  contact_person?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export type QuotationStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
export type DiscountType = 'percentage' | 'fixed';

export interface Quotation {
  id: string;
  quote_number: string;
  company_id?: string;
  client_id?: string;
  status: QuotationStatus;
  issue_date: string;
  valid_until?: string;
  currency: string;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  discount_type: DiscountType;
  discount_value: number;
  discount_amount: number;
  total: number;
  terms?: string;
  notes?: string;
  template_id: string;
  created_at?: string;
  updated_at?: string;
  company?: Company;
  client?: Client;
  items?: QuotationItem[];
}

export interface QuotationItem {
  id: string;
  quotation_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
  sort_order: number;
  created_at?: string;
}

export interface Template {
  id: string;
  name: string;
  description?: string;
  preview_url?: string;
  is_active: boolean;
  created_at?: string;
}

export interface QuotationFormData {
  company_id?: string;
  client_id?: string;
  issue_date: string;
  valid_until?: string;
  currency: string;
  tax_rate: number;
  discount_type: DiscountType;
  discount_value: number;
  terms?: string;
  notes?: string;
  template_id: string;
  items: Omit<QuotationItem, 'id' | 'quotation_id' | 'created_at'>[];
}
