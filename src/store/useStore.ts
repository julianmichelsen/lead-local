import { create } from 'zustand';
import { Company, CRMLead, CRMColumn } from '../types';

interface AppState {
  companies: Company[];
  leads: CRMLead[];
  isLoading: boolean;
  error: string | null;
  totalResults: number;
  
  // Actions
  fetchCompanies: (filters?: any) => Promise<void>;
  enrichCompany: (id: string) => Promise<void>;
  fetchLeads: () => Promise<void>;
  addLead: (companyId: string) => Promise<void>;
  moveLead: (leadId: string, newColumn: CRMColumn) => Promise<void>;
  updateLeadNotes: (leadId: string, notes: string) => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
  companies: [],
  leads: [],
  isLoading: false,
  error: null,
  totalResults: 0,

  fetchCompanies: async (filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, String(value));
      });

      const res = await fetch(`/api/companies?${queryParams.toString()}`);
      if (!res.ok) throw new Error('Falha ao buscar empresas');
      const { data, total } = await res.json();
      
      set({ companies: data, totalResults: total, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  enrichCompany: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`/api/companies/${id}/enrich`, { method: 'POST' });
      if (!res.ok) throw new Error('Falha ao enriquecer empresa');
      const { data } = await res.json();
      
      // Refresh companies to get updated status
      await get().fetchCompanies();
      set({ isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  fetchLeads: async () => {
    try {
      const res = await fetch('/api/crm/leads');
      if (!res.ok) throw new Error('Falha ao buscar leads');
      const data = await res.json();
      set({ leads: data });
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  addLead: async (companyId) => {
    try {
      const res = await fetch('/api/crm/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company_id: companyId })
      });
      if (!res.ok) throw new Error('Falha ao salvar lead');
      
      await get().fetchLeads();
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  moveLead: async (leadId, newColumn) => {
    // Optimistic update
    set((state) => ({
      leads: state.leads.map(l => 
        l.id === leadId ? { ...l, stage: newColumn, updated_at: new Date().toISOString() } : l
      )
    }));

    try {
      const res = await fetch(`/api/crm/leads/${leadId}/stage`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: newColumn })
      });
      if (!res.ok) throw new Error('Falha ao mover lead');
    } catch (error: any) {
      // Revert on error (simple version: just refetch)
      await get().fetchLeads();
      set({ error: error.message });
    }
  },

  updateLeadNotes: async (leadId, notes) => {
    // Optimistic update
    set((state) => ({
      leads: state.leads.map(l => 
        l.id === leadId ? { ...l, notes, updated_at: new Date().toISOString() } : l
      )
    }));

    try {
      const res = await fetch(`/api/crm/leads/${leadId}/notes`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes })
      });
      if (!res.ok) throw new Error('Falha ao atualizar notas');
    } catch (error: any) {
      await get().fetchLeads();
      set({ error: error.message });
    }
  }
}));
