import { useState, DragEvent, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { CRMColumn, CRMLead, Company } from '../types';
import { Calendar, MessageSquare, MoreVertical, GripVertical, Plus, MapPin } from 'lucide-react';
import { cn } from '../lib/utils';
import { generateInsights } from '../utils/insights';

const COLUMNS: CRMColumn[] = [
  'Novo Lead',
  'Qualificado',
  'Contato Iniciado',
  'Oportunidade',
  'Ganho',
  'Perdido'
];

export function CRM() {
  const { leads, companies, moveLead, updateLeadNotes, fetchLeads, fetchCompanies } = useStore();
  const [draggedLead, setDraggedLead] = useState<string | null>(null);
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [notesValue, setNotesValue] = useState('');

  useEffect(() => {
    fetchLeads();
    if (companies.length === 0) {
      fetchCompanies();
    }
  }, [fetchLeads, fetchCompanies, companies.length]);

  const handleDragStart = (e: DragEvent, leadId: string) => {
    setDraggedLead(leadId);
    e.dataTransfer.effectAllowed = 'move';
    // Small delay to allow the drag image to be generated before adding opacity
    setTimeout(() => {
      const el = document.getElementById(`lead-${leadId}`);
      if (el) el.classList.add('opacity-50');
    }, 0);
  };

  const handleDragEnd = (e: DragEvent, leadId: string) => {
    setDraggedLead(null);
    const el = document.getElementById(`lead-${leadId}`);
    if (el) el.classList.remove('opacity-50');
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: DragEvent, column: CRMColumn) => {
    e.preventDefault();
    if (draggedLead) {
      moveLead(draggedLead, column);
    }
  };

  const getCompanyForLead = (companyId: string): Company | undefined => {
    return companies.find(c => c.id === companyId);
  };

  const handleSaveNotes = (leadId: string) => {
    updateLeadNotes(leadId, notesValue);
    setEditingNotes(null);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Pipeline de Vendas</h2>
          <p className="text-slate-500">Arraste os cards para atualizar o status das oportunidades.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm">
          <Plus className="w-4 h-4" />
          Novo Lead Manual
        </button>
      </div>

      <div className="flex-1 overflow-x-auto pb-4">
        <div className="flex gap-6 h-full min-w-max items-start">
          {COLUMNS.map(column => {
            const columnLeads = leads.filter(l => l.stage === column);
            
            return (
              <div 
                key={column}
                className="w-80 bg-slate-100/50 rounded-xl border border-slate-200 flex flex-col max-h-full shrink-0"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, column)}
              >
                <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 rounded-t-xl shrink-0">
                  <h3 className="font-semibold text-slate-700">{column}</h3>
                  <span className="bg-white text-slate-500 text-xs font-bold px-2.5 py-1 rounded-full border border-slate-200 shadow-sm">
                    {columnLeads.length}
                  </span>
                </div>
                
                <div className="p-3 flex-1 overflow-y-auto space-y-3 min-h-[150px]">
                  {columnLeads.map(lead => {
                    const company = getCompanyForLead(lead.company_id);
                    if (!company) return null;
                    
                    const insights = generateInsights(company);

                    return (
                      <div
                        id={`lead-${lead.id}`}
                        key={lead.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, lead.id)}
                        onDragEnd={(e) => handleDragEnd(e, lead.id)}
                        className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm cursor-grab active:cursor-grabbing hover:border-blue-300 hover:shadow-md transition-all group"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <GripVertical className="w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <h4 className="font-semibold text-slate-900 truncate max-w-[200px]" title={company.nome_fantasia || company.razao_social}>
                              {company.nome_fantasia || company.razao_social}
                            </h4>
                          </div>
                          <button className="text-slate-400 hover:text-slate-600 p-1 rounded hover:bg-slate-100">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </div>
                        
                        <p className="text-xs text-slate-500 mb-3 truncate" title={company.cnae_descricao}>
                          {company.cnae_descricao}
                        </p>

                        <div className="flex items-center gap-2 mb-4">
                          <span className={cn(
                            "text-xs font-medium px-2 py-0.5 rounded-md",
                            insights.priority === 'Alta' ? "bg-red-50 text-red-700 border border-red-100" :
                            insights.priority === 'Média' ? "bg-amber-50 text-amber-700 border border-amber-100" :
                            "bg-emerald-50 text-emerald-700 border border-emerald-100"
                          )}>
                            Score: {insights.icpScore}
                          </span>
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {company.municipio}
                          </span>
                        </div>

                        {editingNotes === lead.id ? (
                          <div className="mt-3">
                            <textarea
                              autoFocus
                              value={notesValue}
                              onChange={(e) => setNotesValue(e.target.value)}
                              className="w-full text-sm p-2 border border-blue-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                              rows={3}
                              placeholder="Adicionar nota..."
                            />
                            <div className="flex justify-end gap-2 mt-2">
                              <button 
                                onClick={() => setEditingNotes(null)}
                                className="text-xs px-2 py-1 text-slate-500 hover:bg-slate-100 rounded"
                              >
                                Cancelar
                              </button>
                              <button 
                                onClick={() => handleSaveNotes(lead.id)}
                                className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                              >
                                Salvar
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div 
                            className="mt-3 pt-3 border-t border-slate-100 cursor-text group/notes"
                            onClick={() => {
                              setEditingNotes(lead.id);
                              setNotesValue(lead.notes || '');
                            }}
                          >
                            {lead.notes ? (
                              <p className="text-xs text-slate-600 line-clamp-2 italic">
                                "{lead.notes}"
                              </p>
                            ) : (
                              <p className="text-xs text-slate-400 flex items-center gap-1 opacity-0 group-hover/notes:opacity-100 transition-opacity">
                                <MessageSquare className="w-3 h-3" />
                                Adicionar nota...
                              </p>
                            )}
                          </div>
                        )}

                        <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(lead.updated_at || lead.created_at).toLocaleDateString('pt-BR')}
                          </div>
                          <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[10px]" title={lead.owner_name || 'Unassigned'}>
                            {(lead.owner_name || 'UN').substring(0, 2).toUpperCase()}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  
                  {columnLeads.length === 0 && (
                    <div className="h-full flex items-center justify-center border-2 border-dashed border-slate-200 rounded-lg p-6 text-center">
                      <p className="text-sm text-slate-400">Arraste leads para cá</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
