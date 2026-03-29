export type CompanySource = 'mock' | 'api' | 'local';

export interface Company {
  id: string;
  cnpj: string;
  razao_social: string;
  nome_fantasia: string;
  municipio: string;
  uf: string;
  cnae_principal: string;
  cnae_descricao: string;
  porte: string;
  situacao_cadastral: string;
  telefone: string;
  email: string;
  site: string;
  score_inicial: number;
  origem: CompanySource;
  created_at: string;
  updated_at: string;
  
  // Extra fields from API
  natureza_juridica?: string;
  logradouro?: string;
  numero?: string;
  bairro?: string;
  cep?: string;
  capital_social?: number;
  simples?: boolean;
  mei?: boolean;
  data_inicio_atividade?: string;
  socios?: any[];
}

export type CRMColumn = 
  | 'Novo Lead'
  | 'Qualificado'
  | 'Contato Iniciado'
  | 'Oportunidade'
  | 'Ganho'
  | 'Perdido';

export interface CRMLead {
  id: string;
  company_id: string;
  stage: CRMColumn;
  notes: string;
  owner_name: string;
  next_action: string;
  created_at: string;
  updated_at: string;
}

export interface AIInsight {
  summary: string;
  painPoints: string[];
  approach: string;
  icpScore: number;
  priority: 'Baixa' | 'Média' | 'Alta';
}
