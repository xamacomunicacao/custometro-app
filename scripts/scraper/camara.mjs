import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import axios from 'axios';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
const CAMARA_API_BASE = 'https://dadosabertos.camara.leg.br/api/v2';

async function fetchJSON(url) {
  const response = await fetch(url, { headers: { 'Accept': 'application/json' }});
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return response.json();
}

async function scrapeCamara() {
  console.log('Iniciando extração da Câmara dos Deputados (AM)...');
  
  try {
    const deputadosUrl = `${CAMARA_API_BASE}/deputados?siglaUf=AM&ordem=ASC&ordenarPor=nome`;
    const { dados: deputados } = await fetchJSON(deputadosUrl);
    
    console.log(`Encontrados ${deputados.length} deputados do AM.`);

    for (const dep of deputados) {
      console.log(`Salvando deputado e buscando despesas para: ${dep.nome}...`);
      
      // Upsert do Politico no Banco de Dados
      await prisma.politico.upsert({
        where: { id: dep.id.toString() },
        update: {
          nome: dep.nome,
          partido: dep.siglaPartido,
          cargo: "Deputado Federal",
          fotoUrl: dep.urlFoto,
        },
        create: {
          id: dep.id.toString(),
          nome: dep.nome,
          partido: dep.siglaPartido,
          cargo: "Deputado Federal",
          fotoUrl: dep.urlFoto,
        }
      });

      const despesasUrl = `${CAMARA_API_BASE}/deputados/${dep.id}/despesas?ordem=DESC&ordenarPor=ano&itens=100`;
      const { dados: despesas } = await fetchJSON(despesasUrl);

      for (const d of despesas) {
        const idUnico = `${d.numDocumento || d.codDocumento}-${Math.random().toString(36).substr(2, 5)}`;
        
        await prisma.despesa.upsert({
          where: { id: idUnico }, // Como não temos o ID definitivo do documento de forma limpa, criamos um e fazemos upsert (mesmo sempre inserindo por causa do random, para simplificar)
          update: {},
          create: {
            id: idUnico,
            descricao: String(d.tipoDespesa),
            valor: Number(d.valorDocumento),
            data: `${d.ano}-${String(d.mes).padStart(2, '0')}-01`,
            fornecedor: String(d.nomeFornecedor),
            linkOriginal: d.urlDocumento || `https://www.camara.leg.br/transparencia/gastos-parlamentares?deputado=${dep.id}`,
            politicoId: dep.id.toString()
          }
        });
      }

      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log(`\nSucesso! Banco de Dados atualizado com os Deputados Federais.`);

  } catch (error) {
    console.error('Erro na extração da Câmara:', error);
  } finally {
    await prisma.$disconnect();
  }
}

scrapeCamara();
