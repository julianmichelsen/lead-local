import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Search, Filter, Building, MapPin, Activity, Users, Database } from 'lucide-react';
import { CompanyDrawer } from '../components/prospecting/CompanyDrawer';
import { Company } from '../types';

export function Dashboard() {
  const { companies, leads, totalResults, fetchCompanies, fetchLeads, isLoading } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [cityFilter, setCityFilter] = useState('Garibaldi');
  const [sectorFilter, setSectorFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sizeFilter, setSizeFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState('score');
  
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  const handleSearch = () => {
    fetchCompanies({
      search: searchTerm,
      city: cityFilter,
      sector: sectorFilter,
      status: statusFilter,
      size: sizeFilter,
      startDate,
      endDate,
      sortBy
    });
  };

  useEffect(() => {
    fetchLeads();
    // Initial fetch on mount
    handleSearch();
  }, [fetchLeads]); // Only run on mount

  useEffect(() => {
    if (selectedCompany) {
      const updatedCompany = companies.find(c => c.id === selectedCompany.id);
      if (updatedCompany && JSON.stringify(updatedCompany) !== JSON.stringify(selectedCompany)) {
        setSelectedCompany(updatedCompany);
      }
    }
  }, [companies, selectedCompany]);

  const stats = [
    { label: 'Empresas Encontradas', value: totalResults, icon: Building, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Leads no CRM', value: leads.length, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-100' },
    { label: 'Taxa de Enriquecimento', value: `${companies.length > 0 ? Math.round((companies.filter(c => c.origem === 'api').length / companies.length) * 100) : 0}%`, icon: Database, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { label: 'Oportunidades Ativas', value: leads.filter(l => l.stage !== 'Ganho' && l.stage !== 'Perdido').length, icon: Activity, color: 'text-amber-600', bg: 'bg-amber-100' },
  ];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
            <div className={`p-3 rounded-lg ${stat.bg}`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nome, CNPJ, setor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          <button 
            onClick={handleSearch}
            disabled={isLoading}
            className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Buscando...' : 'Buscar'}
          </button>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-700 font-medium"
          >
            <option value="score">Ordenar por Score</option>
            <option value="name">Ordenar por Nome</option>
            <option value="date">Ordenar por Data de Abertura</option>
          </select>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <select 
            value={cityFilter} 
            onChange={(e) => setCityFilter(e.target.value)}
            className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-sm"
          >
            <option value="">Todas as Cidades</option>
            <option value="Garibaldi">Garibaldi</option>
            <option value="Bento Gonçalves">Bento Gonçalves</option>
            <option value="Carlos Barbosa">Carlos Barbosa</option>
            <option value="Caxias do Sul">Caxias do Sul</option>
          </select>
          
          <select 
            value={sectorFilter} 
            onChange={(e) => setSectorFilter(e.target.value)}
            className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-sm"
          >
            <option value="">Todos os Setores</option>
            <option value="vinho">Vinhos e Bebidas</option>
            <option value="ferramentas">Metalurgia / Ferramentas</option>
            <option value="publicidade">Marketing / Publicidade</option>
            <option value="computador">Software / TI</option>
          </select>

          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-sm"
          >
            <option value="">Qualquer Situação</option>
            <option value="ATIVA">Ativa</option>
            <option value="INAPTA">Inapta</option>
            <option value="BAIXADA">Baixada</option>
          </select>

          <select 
            value={sizeFilter} 
            onChange={(e) => setSizeFilter(e.target.value)}
            className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-sm"
          >
            <option value="">Qualquer Porte</option>
            <option value="MICRO EMPRESA">Micro Empresa</option>
            <option value="PEQUENO PORTE">Pequeno Porte</option>
            <option value="DEMAIS">Demais (Médio/Grande)</option>
          </select>

          <input 
            type="date" 
            value={startDate} 
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-sm"
            title="Data de abertura inicial"
          />
          <input 
            type="date" 
            value={endDate} 
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-sm"
            title="Data de abertura final"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm uppercase tracking-wider">
                <th className="p-4 font-medium">Empresa</th>
                <th className="p-4 font-medium">CNPJ</th>
                <th className="p-4 font-medium">Setor Principal</th>
                <th className="p-4 font-medium">Local / Abertura</th>
                <th className="p-4 font-medium">Score</th>
                <th className="p-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <p className="font-medium text-slate-600">Buscando empresas...</p>
                      <p className="text-sm text-slate-400">Isso pode levar alguns segundos se estivermos buscando em fontes externas.</p>
                    </div>
                  </td>
                </tr>
              ) : companies.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    Nenhuma empresa encontrada com os filtros atuais.
                  </td>
                </tr>
              ) : (
                companies.map((company) => (
                  <tr 
                    key={company.id} 
                    onClick={() => setSelectedCompany(company)}
                    className="hover:bg-blue-50/50 cursor-pointer transition-colors group"
                  >
                    <td className="p-4">
                      <div className="font-medium text-slate-900 group-hover:text-blue-700 transition-colors">
                        {company.nome_fantasia || company.razao_social}
                      </div>
                      <div className="text-sm text-slate-500 truncate max-w-[200px]">
                        {company.razao_social}
                      </div>
                    </td>
                    <td className="p-4 text-sm text-slate-600 font-mono">
                      {company.cnpj}
                    </td>
                    <td className="p-4 text-sm text-slate-600">
                      <div className="truncate max-w-[250px]" title={company.cnae_descricao}>
                        {company.cnae_descricao}
                      </div>
                    </td>
                    <td className="p-4 text-sm text-slate-600">
                      <div className="flex items-center gap-1 mb-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {company.municipio}-{company.uf}
                      </div>
                      <div className="text-xs text-slate-400">
                        {company.data_inicio_atividade ? new Date(company.data_inicio_atividade).toLocaleDateString('pt-BR') : ''}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-full bg-slate-200 rounded-full h-2 max-w-[60px]">
                          <div 
                            className={`h-2 rounded-full ${company.score_inicial >= 80 ? 'bg-emerald-500' : company.score_inicial >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                            style={{ width: `${company.score_inicial}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-slate-600">{company.score_inicial}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        company.situacao_cadastral === 'ATIVA' 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {company.situacao_cadastral}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedCompany && (
        <CompanyDrawer 
          company={selectedCompany} 
          onClose={() => setSelectedCompany(null)} 
        />
      )}
    </div>
  );
}
