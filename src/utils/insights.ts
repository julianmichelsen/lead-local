import { Company, AIInsight } from '../types';

export function generateInsights(company: Company): AIInsight {
  let score = company.score_inicial || 50;
  let priority: 'Baixa' | 'Média' | 'Alta' = 'Média';
  const painPoints: string[] = [];
  let approach = '';
  
  const isIndustrial = company.cnae_descricao?.toLowerCase().includes('fabricação') || company.cnae_descricao?.toLowerCase().includes('indústria');
  const isMediumOrLarge = company.porte === 'MÉDIO' || company.porte === 'GRANDE';
  const hasNoSite = !company.site || company.site.trim() === '';
  const hasGenericEmail = company.email?.includes('gmail.com') || company.email?.includes('hotmail.com');
  
  if (isIndustrial && isMediumOrLarge) {
    painPoints.push('Necessidade de automação de processos');
    painPoints.push('Otimização da cadeia de suprimentos');
    approach = 'Focar em eficiência operacional e redução de custos na linha de produção. Abordagem consultiva sobre automação.';
    score += 15;
  } else if (company.cnae_descricao?.toLowerCase().includes('comércio')) {
    painPoints.push('Gestão de estoque e logística');
    painPoints.push('Expansão de canais de venda');
    approach = 'Destacar soluções para aumento de vendas e controle de inventário.';
    score += 5;
  } else {
    painPoints.push('Atração e retenção de clientes');
    painPoints.push('Eficiência administrativa');
    approach = 'Oferecer soluções que melhorem a produtividade da equipe e a experiência do cliente.';
  }

  if (hasNoSite || hasGenericEmail) {
    painPoints.push('Presença digital fraca ou inexistente');
    approach += ' Destacar a importância da profissionalização digital e presença online para atrair mais negócios B2B.';
    score += 10;
  }

  if (company.situacao_cadastral !== 'ATIVA') {
    score -= 40;
    painPoints.push('Atenção: Empresa com situação cadastral irregular');
    approach = 'Cuidado ao prospectar. Verificar viabilidade financeira e situação legal antes de investir tempo.';
  }

  if (company.municipio?.toLowerCase() === 'garibaldi') {
    score += 10;
  }

  if (score > 100) score = 100;
  if (score < 0) score = 0;

  if (score >= 80) {
    priority = 'Alta';
  } else if (score >= 50) {
    priority = 'Média';
  } else {
    priority = 'Baixa';
  }

  const summary = `A ${company.nome_fantasia || company.razao_social} é uma empresa de porte ${company.porte} localizada em ${company.municipio}-${company.uf}, atuando no setor de ${company.cnae_descricao?.split(',')[0] || 'serviços'}.`;

  return {
    summary,
    painPoints,
    approach,
    icpScore: score,
    priority
  };
}
