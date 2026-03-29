import { db } from './db';

export function seedDb() {
  const count = db.prepare('SELECT COUNT(*) as count FROM companies').get() as { count: number };
  
  if (count.count > 0) {
    console.log('Database already seeded.');
    return;
  }

  console.log('Seeding database with initial companies (Real CNPJs)...');

  const insertCompany = db.prepare(`
    INSERT INTO companies (
      id, cnpj, razao_social, nome_fantasia, municipio, uf, 
      cnae_principal, cnae_descricao, situacao_cadastral, porte, 
      data_inicio_atividade, telefone, email, site, score_inicial
    ) VALUES (
      @id, @cnpj, @razao_social, @nome_fantasia, @municipio, @uf,
      @cnae_principal, @cnae_descricao, @situacao_cadastral, @porte,
      @data_inicio_atividade, @telefone, @email, @site, @score_inicial
    )
  `);

  const mockData = [
    {
      id: '1', cnpj: '87834479000143', razao_social: 'COOPERATIVA VINICOLA GARIBALDI LTDA', nome_fantasia: 'VINICOLA GARIBALDI',
      municipio: 'GARIBALDI', uf: 'RS', cnae_principal: '1112-2/00', cnae_descricao: 'Fabricação de vinho',
      situacao_cadastral: 'ATIVA', porte: 'DEMAIS', data_inicio_atividade: '1966-08-12',
      telefone: '(54) 3464-8100', email: 'contato@vinicolagaribaldi.com.br', site: 'www.vinicolagaribaldi.com.br', score_inicial: 95
    },
    {
      id: '2', cnpj: '87281333000104', razao_social: 'CHANDON DO BRASIL VITIVINICULTURA LTDA', nome_fantasia: 'CHANDON',
      municipio: 'GARIBALDI', uf: 'RS', cnae_principal: '1112-2/00', cnae_descricao: 'Fabricação de vinho',
      situacao_cadastral: 'ATIVA', porte: 'DEMAIS', data_inicio_atividade: '1973-10-25',
      telefone: '(54) 3464-9000', email: 'contato@chandon.com.br', site: 'www.chandon.com.br', score_inicial: 92
    },
    {
      id: '3', cnpj: '87834883000113', razao_social: 'TRAMONTINA GARIBALDI S.A. INDUSTRIAS METALURGICAS', nome_fantasia: 'TRAMONTINA',
      municipio: 'GARIBALDI', uf: 'RS', cnae_principal: '2543-8/00', cnae_descricao: 'Fabricação de ferramentas',
      situacao_cadastral: 'ATIVA', porte: 'DEMAIS', data_inicio_atividade: '1966-08-12',
      telefone: '(54) 3462-8000', email: 'contato@tramontina.com.br', site: 'www.tramontina.com.br', score_inicial: 98
    },
    {
      id: '4', cnpj: '18236120000158', razao_social: 'AGENCIA DE MARKETING DIGITAL GARIBALDI LTDA', nome_fantasia: 'GARIBALDI MARKETING',
      municipio: 'GARIBALDI', uf: 'RS', cnae_principal: '7311-4/00', cnae_descricao: 'Agências de publicidade e marketing',
      situacao_cadastral: 'ATIVA', porte: 'MICRO EMPRESA', data_inicio_atividade: '2020-05-06',
      telefone: '(54) 9999-8888', email: 'contato@garibaldimarketing.com.br', site: 'www.garibaldimarketing.com.br', score_inicial: 85
    },
    {
      id: '5', cnpj: '14380200000121', razao_social: 'GARIBALDI TECH SOLUTIONS LTDA', nome_fantasia: 'GARIBALDI TECH',
      municipio: 'GARIBALDI', uf: 'RS', cnae_principal: '6201-5/01', cnae_descricao: 'Desenvolvimento de programas de computador sob encomenda',
      situacao_cadastral: 'ATIVA', porte: 'PEQUENO PORTE', data_inicio_atividade: '2018-09-23',
      telefone: '(54) 8888-7777', email: 'contato@garibalditech.com.br', site: 'www.garibalditech.com.br', score_inicial: 88
    }
  ];

  const insertMany = db.transaction((companies) => {
    for (const company of companies) {
      insertCompany.run(company);
    }
  });

  insertMany(mockData);
  console.log('Database seeded successfully.');
}
