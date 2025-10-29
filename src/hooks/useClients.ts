import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Client } from '../types';
import { useCompanyContext } from '../contexts/CompanyContext';

export function useClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentCompany } = useCompanyContext();

  const fetchClients = async () => {
    if (!currentCompany) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('company_id', currentCompany.id)
        .order('name', { ascending: true });

      if (error) throw error;
      setClients(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch clients');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [currentCompany?.id]);

  return { clients, loading, error, refetch: fetchClients };
}

export async function createClient(client: Omit<Client, 'id' | 'created_at' | 'updated_at'>, companyId: string) {
  const { data, error } = await supabase
    .from('clients')
    .insert({ ...client, company_id: companyId })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateClient(id: string, client: Partial<Client>) {
  const { data, error } = await supabase
    .from('clients')
    .update(client)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteClient(id: string) {
  const { error } = await supabase.from('clients').delete().eq('id', id);
  if (error) throw error;
}
