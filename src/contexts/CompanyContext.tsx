import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Company } from '../types';
import { supabase } from '../lib/supabase';

interface CompanyContextType {
  currentCompany: Company | null;
  setCurrentCompany: (company: Company | null) => void;
  loading: boolean;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export function CompanyProvider({ children }: { children: ReactNode }) {
  const [currentCompany, setCurrentCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load the first company as default for now
    // In a real multi-tenant app, this would be based on user authentication
    const loadDefaultCompany = async () => {
      try {
        const { data, error } = await supabase
          .from('companies')
          .select('*')
          .limit(1)
          .maybeSingle();

        if (!error && data) {
          setCurrentCompany(data);
        }
      } catch (err) {
        console.error('Failed to load default company:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDefaultCompany();
  }, []);

  return (
    <CompanyContext.Provider value={{ currentCompany, setCurrentCompany, loading }}>
      {children}
    </CompanyContext.Provider>
  );
}

export function useCompanyContext() {
  const context = useContext(CompanyContext);
  if (!context) {
    throw new Error('useCompanyContext must be used within a CompanyProvider');
  }
  return context;
}