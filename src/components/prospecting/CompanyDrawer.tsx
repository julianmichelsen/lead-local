import { useState, useEffect } from 'react';
import { Company } from '../../types';
import { useStore } from '../../store/useStore';
import { generateInsights } from '../../utils/insights';
import { X, MapPin, Phone, Mail, Globe, Briefcase, Database, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import { cn } from '../../lib/utils';

interface Props {
  company: Company;
  onClose: () => void;
}

export function CompanyDrawer({ company, onClose }: Props) {
  const { enrichCompany, addLead, leads, isLoading, error } = useStore();
  const [isEnriching, setIsEnriching] = useState(false);
  
  const isLead = leads.some(l => l.company_id === company.id);
  const insights = generateInsights(company);

  const handleEnrich = async () => {
    setIsEnriching(true);
    await enrichCompany(company.id); // Assuming enrichCompany takes ID now
    setIsEnriching(false);
  };

  const handleSaveToCRM = () => {
    addLead(company.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="relative w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 border-l border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-slate-50/50">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-2xl font-bold text-slate-900">{company.nome_fantasia || company.razao_social}</h2>
              {company.origem === 'api' ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <Database className="w-3 h-3" />
                  Dados Enriquecidos
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
                  <AlertCircle className="w-3 h-3" />
                  Dados Simulados
                </span>
              )}
            </div>
            <p className="text-sm text-slate-500 font-mono">{company.cnpj}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* Actions */}
          <div className="flex gap-4">
            <button
              onClick={handleEnrich}
              disabled={isEnriching || isLoading || company.origem === 'api'}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-colors border",
                company.origem === 'api'
                  ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                  : "bg-white text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300 shadow-sm"
              )}
            >
              <Database className="w-4 h-4" />
              {isEnriching ? 'Enriquecendo...' : company.origem === 'api' ? 'Dados Atualizados' : 'Enriquecer via BrasilAPI'}
            </button>
            
            <button
              onClick={handleSaveToCRM}
              disabled={isLead}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-colors shadow-sm",
                isLead
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700 border border-transparent"
              )}
            >
              {isLead ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Salvo no CRM
                </>
              ) : (
                <>
                  <Briefcase className="w-4 h-4" />
                  Salvar no CRM
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          {/* AI Insights */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-5 border border-indigo-100/50 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Sparkles className="w-24 h-24 text-indigo-600" />
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                <h3 className="font-semibold text-indigo-900">Insights da IA</h3>
              </div>
              
              <p className="text-sm text-indigo-800 mb-4 leading-relaxed">
                {insights.summary}
              </p>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-white/60 rounded-lg p-3 border border-indigo-100">
                  <p className="text-xs font-medium text-indigo-400 uppercase tracking-wider mb-1">Score ICP</p>
                  <div className="flex items-end gap-2">
                    <span className="text-2xl font-bold text-indigo-700">{insights.icpScore}</span>
                    <span className="text-sm font-medium text-indigo-500 mb-1">/ 100</span>
                  </div>
                </div>
                <div className="bg-white/60 rounded-lg p-3 border border-indigo-100">
                  <p className="text-xs font-medium text-indigo-400 uppercase tracking-wider mb-1">Prioridade</p>
                  <span className={cn(
                    "inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium mt-1",
                    insights.priority === 'Alta' ? "bg-red-100 text-red-700" :
                    insights.priority === 'Média' ? "bg-amber-100 text-amber-700" :
                    "bg-emerald-100 text-emerald-700"
                  )}>
                    {insights.priority}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-xs font-medium text-indigo-400 uppercase tracking-wider mb-2">Dores Prováveis</p>
                  <ul className="space-y-1">
                    {insights.painPoints.map((point, i) => (
                      <li key={i} className="text-sm text-indigo-800 flex items-start gap-2">
                        <span className="text-indigo-400 mt-1">•</span>
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-medium text-indigo-400 uppercase tracking-wider mb-1">Abordagem Sugerida</p>
                  <p className="text-sm text-indigo-800 bg-white/50 p-3 rounded-lg border border-indigo-100/50">
                    {insights.approach}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2">
                Informações Básicas
              </h3>
              
              <div>
                <p className="text-xs text-slate-500 mb-1">Razão Social</p>
                <p className="text-sm font-medium text-slate-900">{company.razao_social}</p>
              </div>
              
              <div>
                <p className="text-xs text-slate-500 mb-1">CNAE Principal</p>
                <p className="text-sm font-medium text-slate-900">{company.cnae_principal}</p>
                <p className="text-xs text-slate-600 mt-0.5">{company.cnae_descricao}</p>
              </div>

              <div>
                <p className="text-xs text-slate-500 mb-1">Porte</p>
                <p className="text-sm font-medium text-slate-900">{company.porte}</p>
              </div>

              {company.natureza_juridica && (
                <div>
                  <p className="text-xs text-slate-500 mb-1">Natureza Jurídica</p>
                  <p className="text-sm font-medium text-slate-900">{company.natureza_juridica}</p>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2">
                Contato & Endereço
              </h3>

              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {company.logradouro ? `${company.logradouro}, ${company.numero || 'S/N'}` : 'Endereço não informado'}
                  </p>
                  <p className="text-xs text-slate-600">
                    {company.bairro ? `${company.bairro} - ` : ''}{company.municipio}/{company.uf}
                  </p>
                  {company.cep && <p className="text-xs text-slate-500 mt-0.5">CEP: {company.cep}</p>}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                <p className="text-sm font-medium text-slate-900">{company.telefone || 'Não informado'}</p>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <p className="text-sm font-medium text-slate-900">{company.email || 'Não informado'}</p>
              </div>

              <div className="flex items-center gap-3">
                <Globe className="w-4 h-4 text-slate-400 shrink-0" />
                {company.site ? (
                  <a href={`https://${company.site}`} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-blue-600 hover:underline">
                    {company.site}
                  </a>
                ) : (
                  <p className="text-sm font-medium text-slate-500">Não informado</p>
                )}
              </div>
            </div>
          </div>

          {/* Extra Data from API */}
          {company.origem === 'api' && (
            <div className="space-y-4 pt-4 border-t border-slate-200">
              <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2">
                Dados Adicionais (Receita Federal)
              </h3>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <p className="text-xs text-slate-500 mb-1">Capital Social</p>
                  <p className="text-sm font-medium text-slate-900">
                    {company.capital_social ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(company.capital_social) : 'N/A'}
                  </p>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <p className="text-xs text-slate-500 mb-1">Optante Simples</p>
                  <p className="text-sm font-medium text-slate-900">{company.simples ? 'Sim' : 'Não'}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <p className="text-xs text-slate-500 mb-1">Início Atividade</p>
                  <p className="text-sm font-medium text-slate-900">
                    {company.data_inicio_atividade ? new Date(company.data_inicio_atividade).toLocaleDateString('pt-BR') : 'N/A'}
                  </p>
                </div>
              </div>

              {company.socios && company.socios.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs text-slate-500 mb-2">Quadro Societário</p>
                  <div className="space-y-2">
                    {company.socios.map((socio: any, i: number) => (
                      <div key={i} className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-200 text-sm">
                        <span className="font-medium text-slate-900">{socio.nome_socio || socio.nome}</span>
                        <span className="text-slate-500 text-xs">{socio.qualificacao_socio || 'Sócio'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
