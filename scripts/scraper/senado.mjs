import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();
const SENADO_LEGIS_API = 'https://legis.senado.leg.br/dadosabertos/senador/lista/atual';
const SENADO_CEAPS_API = 'https://adm.senado.gov.br/adm-dadosabertos/api/v1/senadores/despesas_ceaps/2024';

async function fetchJSON(url, headers = {}) {
  const response = await fetch(url, { headers: { 'Accept': 'application/json', ...headers }});
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return response.json();
}

async function scrapeSenado() {
  console.log('Iniciando extração do Senado Federal (AM)...');
  
  try {
    const { ListaParlamentarEmExercicio: { Parlamentares: { Parlamentar } } } = await fetchJSON(SENADO_LEGIS_API);
    
    const senadoresAM = Parlamentar
      .filter(p => p.IdentificacaoParlamentar.UfParlamentar === 'AM')
      .map(p => ({
        id: p.IdentificacaoParlamentar.CodigoParlamentar,
        nome: p.IdentificacaoParlamentar.NomeParlamentar,
        partido: p.IdentificacaoParlamentar.SiglaPartidoParlamentar,
        fotoUrl: p.IdentificacaoParlamentar.UrlFotoParlamentar
      }));

    console.log(`Encontrados ${senadoresAM.length} senadores do AM.`);

    console.log(`Baixando base de dados CEAPS 2024... isso pode demorar alguns segundos.`);
    const todasDespesas = await fetchJSON(SENADO_CEAPS_API);

    for (const sen of senadoresAM) {
      console.log(`Salvando senador e processando despesas para: ${sen.nome}...`);
      
      await prisma.politico.upsert({
        where: { id: sen.id.toString() },
        update: {
          nome: sen.nome,
          partido: sen.partido,
          cargo: "Senador",
          fotoUrl: sen.fotoUrl,
        },
        create: {
          id: sen.id.toString(),
          nome: sen.nome,
          partido: sen.partido,
          cargo: "Senador",
          fotoUrl: sen.fotoUrl,
        }
      });

      const despesasDoSenador = todasDespesas
        .filter(d => String(d.codSenador) === String(sen.id))
        .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
        .slice(0, 100);

      for (const d of despesasDoSenador) {
        const idUnico = `sen-${d.id}`;
        await prisma.despesa.upsert({
          where: { id: idUnico },
          update: {
             valor: Number(d.valorReembolsado),
          },
          create: {
            id: idUnico,
            descricao: String(d.tipoDespesa),
            valor: Number(d.valorReembolsado),
            data: d.data,
            fornecedor: String(d.fornecedor),
            linkOriginal: `https://www12.senado.leg.br/transparencia?recibo=${d.documento || d.id}`,
            politicoId: sen.id.toString()
          }
        });
      }
    }
    
    console.log(`\nSucesso! Banco de Dados atualizado com os Senadores.`);

  } catch (error) {
    console.error('Erro na extração do Senado:', error);
  } finally {
    await prisma.$disconnect();
  }
}

scrapeSenado();
