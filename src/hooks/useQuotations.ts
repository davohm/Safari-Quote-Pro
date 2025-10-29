import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Quotation, QuotationItem } from '../types';

export function useQuotations() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQuotations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('quotations')
        .select(`
          *,
          company:companies(*),
          client:clients(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQuotations(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch quotations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotations();
  }, []);

  return { quotations, loading, error, refetch: fetchQuotations };
}

export function useQuotation(id: string) {
  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQuotation = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('quotations')
        .select(`
          *,
          company:companies(*),
          client:clients(*),
          items:quotation_items(*)
        `)
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      setQuotation(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch quotation');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchQuotation();
    }
  }, [id]);

  return { quotation, loading, error, refetch: fetchQuotation };
}

export async function createQuotation(quotation: Partial<Quotation>, items: Omit<QuotationItem, 'id' | 'quotation_id' | 'created_at'>[]) {
  const { data: quoteData, error: quoteError } = await supabase
    .from('quotations')
    .insert(quotation)
    .select()
    .single();

  if (quoteError) throw quoteError;

  const itemsWithQuotationId = items.map((item, index) => ({
    ...item,
    quotation_id: quoteData.id,
    sort_order: index,
  }));

  const { error: itemsError } = await supabase
    .from('quotation_items')
    .insert(itemsWithQuotationId);

  if (itemsError) throw itemsError;

  return quoteData;
}

export async function updateQuotation(id: string, quotation: Partial<Quotation>, items?: Omit<QuotationItem, 'id' | 'quotation_id' | 'created_at'>[]) {
  const { data: quoteData, error: quoteError } = await supabase
    .from('quotations')
    .update(quotation)
    .eq('id', id)
    .select()
    .single();

  if (quoteError) throw quoteError;

  if (items) {
    await supabase.from('quotation_items').delete().eq('quotation_id', id);

    const itemsWithQuotationId = items.map((item, index) => ({
      ...item,
      quotation_id: id,
      sort_order: index,
    }));

    const { error: itemsError } = await supabase
      .from('quotation_items')
      .insert(itemsWithQuotationId);

    if (itemsError) throw itemsError;
  }

  return quoteData;
}

export async function deleteQuotation(id: string) {
  const { error } = await supabase.from('quotations').delete().eq('id', id);
  if (error) throw error;
}

export async function generateQuoteNumber(prefix: string = 'QT-'): Promise<string> {
  const { data, error } = await supabase
    .from('quotations')
    .select('quote_number')
    .like('quote_number', `${prefix}%`)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error && error.code !== 'PGRST116') throw error;

  if (!data) {
    return `${prefix}0001`;
  }

  const lastNumber = data.quote_number.replace(prefix, '');
  const nextNumber = parseInt(lastNumber) + 1;
  return `${prefix}${nextNumber.toString().padStart(4, '0')}`;
}
