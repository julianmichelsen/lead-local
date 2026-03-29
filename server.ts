import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { db, initDb } from "./src/server/db";
import { seedDb } from "./src/server/seed";
import { GoogleGenAI, Type } from "@google/genai";

async function startServer() {
  // Initialize Database
  initDb();
  seedDb();

  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Gemini
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  // --- API ROUTES ---

  // 1. Get Companies (Search & Filter)
  app.get("/api/companies", async (req, res) => {
    const { search, city, sector, status, size, startDate, endDate, sortBy, order = 'asc' } = req.query;
    
    let query = 'SELECT * FROM companies WHERE 1=1';
    const params: any[] = [];

    if (search) {
      query += ' AND (razao_social LIKE ? OR nome_fantasia LIKE ? OR cnpj LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (city) {
      query += ' AND UPPER(municipio) = UPPER(?)';
      params.push(city);
    }
    const sectorToCnae: Record<string, string[]> = {
      'vinho': ['1112200', '4634602', '4723800', '4711302'],
      'ferramentas': ['2543800', '4672800', '4744001'],
      'publicidade': ['7311400', '7312200', '7319003'],
      'computador': ['6201501', '6202300', '6203100', '6204000']
    };

    if (sector) {
      const cnaes = typeof sector === 'string' ? sectorToCnae[sector] : null;
      if (cnaes && cnaes.length > 0) {
        query += ` AND cnae_principal IN (${cnaes.map(() => '?').join(',')})`;
        params.push(...cnaes);
      } else {
        query += ' AND cnae_descricao LIKE ?';
        params.push(`%${sector}%`);
      }
    }
    if (status) {
      query += ' AND UPPER(situacao_cadastral) = UPPER(?)';
      params.push(status);
    }
    if (size) {
      query += ' AND porte LIKE ?';
      params.push(`%${size}%`);
    }
    if (startDate) {
      query += ' AND data_inicio_atividade >= ?';
      params.push(startDate);
    }
    if (endDate) {
      query += ' AND data_inicio_atividade <= ?';
      params.push(endDate);
    }

    if (sortBy === 'name') {
      query += ` ORDER BY nome_fantasia ${order === 'desc' ? 'DESC' : 'ASC'}`;
    } else if (sortBy === 'date') {
      query += ` ORDER BY data_inicio_atividade ${order === 'desc' ? 'DESC' : 'ASC'}`;
    } else if (sortBy === 'score') {
      query += ` ORDER BY score_inicial ${order === 'desc' ? 'DESC' : 'ASC'}`;
    } else {
      query += ' ORDER BY score_inicial DESC';
    }

    try {
      let companies = db.prepare(query).all(...params) as any[];
      
      // If no results found, try to fetch from external sources
      if (companies.length === 0) {
        let fetchedFromBrasilApi = false;

        // 1. If search is a CNPJ, fetch from BrasilAPI
        if (search && typeof search === 'string') {
          const cleanSearch = search.replace(/[^\d]/g, '');
          if (cleanSearch.length === 14) {
            try {
              const controller = new AbortController();
              const timeoutId = setTimeout(() => controller.abort(), 5000);
              const apiRes = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cleanSearch}`, { signal: controller.signal });
              clearTimeout(timeoutId);
              
              if (apiRes.ok) {
                const rawData = await apiRes.json();
                
                // Insert into companies
                const newId = Date.now().toString();
                const insertCompany = db.prepare(`
                  INSERT INTO companies (
                    id, cnpj, razao_social, nome_fantasia, municipio, uf, 
                    cnae_principal, cnae_descricao, situacao_cadastral, porte, 
                    data_inicio_atividade, telefone, email, score_inicial
                  ) VALUES (
                    @id, @cnpj, @razao_social, @nome_fantasia, @municipio, @uf,
                    @cnae_principal, @cnae_descricao, @situacao_cadastral, @porte,
                    @data_inicio_atividade, @telefone, @email, @score_inicial
                  )
                `);
                
                insertCompany.run({
                  id: newId,
                  cnpj: rawData.cnpj,
                  razao_social: rawData.razao_social,
                  nome_fantasia: rawData.nome_fantasia || rawData.razao_social,
                  municipio: rawData.municipio,
                  uf: rawData.uf,
                  cnae_principal: rawData.cnae_fiscal ? `${rawData.cnae_fiscal}` : '',
                  cnae_descricao: rawData.cnae_fiscal_descricao || '',
                  situacao_cadastral: rawData.descricao_situacao_cadastral || 'ATIVA',
                  porte: rawData.porte || 'DEMAIS',
                  data_inicio_atividade: rawData.data_inicio_atividade || '',
                  telefone: rawData.ddd_telefone_1 || '',
                  email: rawData.email || '',
                  score_inicial: 80
                });
                
                // Insert into enrichment
                const insertEnrichment = db.prepare(`
                  INSERT INTO company_enrichment (id, company_id, source, raw_json, normalized_json)
                  VALUES (@id, @company_id, @source, @raw_json, @normalized_json)
                `);
                
                insertEnrichment.run({
                  id: `enr_${newId}`,
                  company_id: newId,
                  source: 'brasilapi',
                  raw_json: JSON.stringify(rawData),
                  normalized_json: JSON.stringify(rawData)
                });
                
                // Re-run the query to get the newly inserted company
                companies = db.prepare(query).all(...params) as any[];
                fetchedFromBrasilApi = true;
              }
            } catch (e) {
              console.error('Failed to fetch from BrasilAPI during search:', e);
            }
          }
        }

        // 2. If not fetched from BrasilAPI (e.g. text search or just filters), use Casa dos Dados API
        if (!fetchedFromBrasilApi) {
          try {
            console.log('Using Casa dos Dados API for real companies matching:', { search, city, sector });
            
            // Map sectors to CNAEs (Casa dos Dados uses CNAE codes for 'atividade_principal')
            const sectorToCnae: Record<string, string[]> = {
              'vinho': ['1112200', '4634602', '4723800', '4711302'],
              'ferramentas': ['2543800', '4672800', '4744001'],
              'publicidade': ['7311400', '7312200', '7319003'],
              'computador': ['6201501', '6202300', '6203100', '6204000']
            };

            const cnaes = sector && typeof sector === 'string' ? sectorToCnae[sector] || [] : [];
            const municipios = city && typeof city === 'string' ? [city.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")] : [];
            const termos = search && typeof search === 'string' ? [search] : [];

            // Build payload optimized to save credits (only search if we have city or sector)
            if (municipios.length > 0 || cnaes.length > 0 || termos.length > 0) {
              const payload: any = {
                limite: 10,
                pagina: 1
              };

              if (municipios.length > 0) payload.municipio = municipios;
              if (cnaes.length > 0) payload.codigo_atividade_principal = cnaes;
              if (status) payload.situacao_cadastral = [status.toString().toUpperCase()];
              else payload.situacao_cadastral = ["ATIVA"];
              
              if (termos.length > 0) {
                payload.busca_textual = [
                  {
                    texto: termos,
                    tipo_busca: "radical",
                    razao_social: true,
                    nome_fantasia: true
                  }
                ];
              }

              const apiKey = '56f450c0b96477d35a2e0a34283b97bb212b3cec79d6a32454ff2db93f12658b4d2bec5be3e809f309d902ecf52c381cf40e7885423005438d7cb92b056de367';
              
              const response = await fetch('https://api.casadosdados.com.br/v5/cnpj/pesquisa?tipo_resultado=completo', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Api-Key': apiKey,
                  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                  'Accept': 'application/json',
                  'Origin': 'https://casadosdados.com.br',
                  'Referer': 'https://casadosdados.com.br/'
                },
                body: JSON.stringify(payload)
              });

              if (response.ok) {
                const result = await response.json();
                console.log('Casa dos Dados API result total:', result.total);
                const fetchedCompanies = result.cnpjs || [];
                
                // Limit to 10 to save processing/display space for now
                const companiesToInsert = fetchedCompanies.slice(0, 10);
                console.log('Inserting', companiesToInsert.length, 'companies');

                if (companiesToInsert.length > 0) {
                  const insertCompany = db.prepare(`
                    INSERT OR IGNORE INTO companies (
                      id, cnpj, razao_social, nome_fantasia, municipio, uf, 
                      cnae_principal, cnae_descricao, situacao_cadastral, porte, 
                      data_inicio_atividade, telefone, email, score_inicial
                    ) VALUES (
                      @id, @cnpj, @razao_social, @nome_fantasia, @municipio, @uf,
                      @cnae_principal, @cnae_descricao, @situacao_cadastral, @porte,
                      @data_inicio_atividade, @telefone, @email, @score_inicial
                    )
                  `);

                  db.transaction(() => {
                    for (const comp of companiesToInsert) {
                      const newId = Date.now().toString() + Math.random().toString(36).substring(7);
                      
                      let telefone = '';
                      if (comp.contato_telefonico && comp.contato_telefonico.length > 0) {
                        telefone = comp.contato_telefonico[0].completo || (comp.contato_telefonico[0].ddd + comp.contato_telefonico[0].numero);
                      }
                      
                      let email = '';
                      if (comp.contato_email && comp.contato_email.length > 0) {
                        email = typeof comp.contato_email[0] === 'string' ? comp.contato_email[0] : (comp.contato_email[0].email || '');
                      }

                      insertCompany.run({
                        id: newId,
                        cnpj: comp.cnpj.replace(/[^\d]/g, ''),
                        razao_social: comp.razao_social || 'N/A',
                        nome_fantasia: comp.nome_fantasia || comp.razao_social || 'N/A',
                        municipio: comp.endereco?.municipio || city || '',
                        uf: comp.endereco?.uf || '',
                        cnae_principal: comp.atividade_principal?.codigo || '',
                        cnae_descricao: comp.atividade_principal?.descricao || '',
                        situacao_cadastral: comp.situacao_cadastral?.situacao_atual || 'ATIVA',
                        porte: comp.porte_empresa?.descricao || 'DEMAIS',
                        data_inicio_atividade: comp.data_abertura || '',
                        telefone: telefone,
                        email: email,
                        score_inicial: Math.floor(Math.random() * 30) + 60 // Random score 60-90
                      });
                    }
                  })();

                  // Re-run the query to get the newly inserted companies
                  companies = db.prepare(query).all(...params) as any[];
                }
              } else {
                console.error('Casa dos Dados API error:', response.status, await response.text());
              }
            }
          } catch (e) {
            console.error('Failed to fetch from Casa dos Dados API:', e);
          }
        }
      }
      
      // Get enrichment data for each company
      const enrichments = db.prepare('SELECT company_id, normalized_json FROM company_enrichment').all();
      const enrichmentMap = new Map(enrichments.map((r: any) => [r.company_id, JSON.parse(r.normalized_json)]));
      
      const enrichedCompanies = companies.map((c: any) => {
        const enrichmentData = enrichmentMap.get(c.id);
        if (enrichmentData) {
          return {
            ...c,
            origem: 'api',
            natureza_juridica: enrichmentData.natureza_juridica,
            logradouro: enrichmentData.logradouro,
            numero: enrichmentData.numero,
            bairro: enrichmentData.bairro,
            cep: enrichmentData.cep,
            capital_social: enrichmentData.capital_social,
            simples: enrichmentData.opcao_pelo_simples,
            mei: enrichmentData.opcao_pelo_mei,
            data_inicio_atividade: enrichmentData.data_inicio_atividade,
            socios: enrichmentData.qsa
          };
        }
        return {
          ...c,
          origem: 'local'
        };
      });

      res.json({ data: enrichedCompanies, total: companies.length });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // 2. Enrich Company via BrasilAPI
  app.post("/api/companies/:id/enrich", async (req, res) => {
    const { id } = req.params;
    
    try {
      const company = db.prepare('SELECT cnpj FROM companies WHERE id = ?').get(id) as { cnpj: string };
      if (!company) {
        return res.status(404).json({ error: 'Company not found' });
      }

      const cleanCnpj = company.cnpj.replace(/[^\\d]/g, '');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const apiRes = await fetch(`https://brasilapi.com.br/api/cnpj/v1/\${cleanCnpj}`, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      if (!apiRes.ok) {
        throw new Error(`BrasilAPI Error: \${apiRes.status}`);
      }

      const rawData = await apiRes.json();
      
      // Save to enrichment table
      const insertEnrichment = db.prepare(`
        INSERT INTO company_enrichment (id, company_id, source, raw_json, normalized_json)
        VALUES (@id, @company_id, @source, @raw_json, @normalized_json)
        ON CONFLICT(id) DO UPDATE SET 
          raw_json = excluded.raw_json,
          normalized_json = excluded.normalized_json,
          last_enriched_at = CURRENT_TIMESTAMP
      `);

      const enrichmentId = `enr_\${id}`;
      insertEnrichment.run({
        id: enrichmentId,
        company_id: id,
        source: 'brasilapi',
        raw_json: JSON.stringify(rawData),
        normalized_json: JSON.stringify(rawData) // We'll normalize on the frontend or here
      });

      res.json({ success: true, data: rawData });
    } catch (error: any) {
      console.error('Enrichment failed:', error);
      res.status(500).json({ error: error.message || 'Failed to enrich company' });
    }
  });

  // 3. Get CRM Leads
  app.get("/api/crm/leads", (req, res) => {
    try {
      const leads = db.prepare(`
        SELECT l.*, c.nome_fantasia, c.razao_social, c.cnae_descricao, c.municipio, c.score_inicial
        FROM crm_leads l
        JOIN companies c ON l.company_id = c.id
      `).all();
      res.json(leads);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // 4. Create CRM Lead
  app.post("/api/crm/leads", (req, res) => {
    const { company_id } = req.body;
    try {
      // Check if already exists
      const existing = db.prepare('SELECT id FROM crm_leads WHERE company_id = ?').get(company_id);
      if (existing) {
        return res.status(400).json({ error: 'Lead already exists for this company' });
      }

      const id = `lead_\${Date.now()}`;
      db.prepare(`
        INSERT INTO crm_leads (id, company_id, stage, owner_name, notes, next_action)
        VALUES (?, ?, 'Novo Lead', 'Você', '', 'Ligar para agendar reunião')
      `).run(id, company_id);

      res.json({ success: true, id });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // 5. Update CRM Lead Stage
  app.patch("/api/crm/leads/:id/stage", (req, res) => {
    const { id } = req.params;
    const { stage } = req.body;
    try {
      db.prepare('UPDATE crm_leads SET stage = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(stage, id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // 6. Update CRM Lead Notes
  app.patch("/api/crm/leads/:id/notes", (req, res) => {
    const { id } = req.params;
    const { notes } = req.body;
    try {
      db.prepare('UPDATE crm_leads SET notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(notes, id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // --- VITE MIDDLEWARE ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:\${PORT}`);
  });
}

startServer();
