import 'dotenv/config';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
puppeteer.use(StealthPlugin());
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

async function scrapeALEAM() {
  console.log("Iniciando Robô Puppeteer - ALEAM...");
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  page.setDefaultNavigationTimeout(90000);
  page.setDefaultTimeout(90000);

  try {
     await page.goto('https://www.aleam.gov.br/transparencia/controle-de-cota-parlamentar/', { waitUntil: 'networkidle2' });
  } catch(e) {
     console.log("Portal da ALEAM caiu ou demorou demais:", e.message);
     await browser.close();
     return;
  }

  // Pega todos os deputados do select
  const deputados = await page.evaluate(() => {
    const options = Array.from(document.querySelectorAll('select#dados option'));
    return options.map(o => ({
      nome: o.textContent.trim(),
      value: o.value
    })).filter(o => o.value !== '' && !o.nome.includes('Selecione'));
  });

  console.log(`Encontrados ${deputados.length} deputados na ALEAM.`);
  
  // Pegar mês passado
  const currentDate = new Date();
  currentDate.setMonth(currentDate.getMonth() - 1);
  const mesValue = (currentDate.getMonth() + 1).toString().padStart(2, '0');
  const anoValue = currentDate.getFullYear().toString();

  console.log(`Buscando dados de ${mesValue}/${anoValue}...`);

  for (const dep of deputados) {
    try {
      console.log(`Extraindo: ${dep.nome}...`);
      
      // Seleciona os filtros e pesquisa
      await page.select('select#ano', anoValue);
      await page.select('select#mes', mesValue);
      await page.select('select#dados', dep.value);
      
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 60000 }).catch(() => {}),
        page.click('button[type="submit"]')
      ]);

      // Extrai os valores detalhados
      const itensDespesa = await page.evaluate(() => {
        const labels = Array.from(document.querySelectorAll('.cont-result-label__title'));
        const valorSpan = Array.from(document.querySelectorAll('.cont-result-label__valor'));
        
        let itens = [];
        for(let i = 0; i < labels.length; i++) {
          if(labels[i] && !labels[i].textContent.includes('Total de Despesa')) {
             if(valorSpan[i]) {
                const text = valorSpan[i].textContent.replace('R$', '').replace('.', '').replace(',', '.').trim();
                const valor = parseFloat(text) || 0;
                if(valor > 0) {
                    itens.push({ descricao: labels[i].textContent.trim(), valor });
                }
             }
          }
        }
        return itens;
      });

      console.log(`- ${itensDespesa.length} rubricas de gasto extraídas.`);
      
      let politico = await prisma.politico.findFirst({
          where: { cargo: 'Deputado Estadual', nome: { contains: dep.nome.split(' ')[0] } }
      });

      if (!politico) {
          console.log(`Deputado ${dep.nome} não encontrado no Seed! Pular.`);
          continue;
      }

      const mesAno = `${mesValue}/${anoValue}`;

      for(const item of itensDespesa) {
          const uuidHash = crypto.createHash('md5').update(`${politico.id}-${item.descricao}-${item.valor}`).digest('hex');
          const despesaId = `${politico.id}-ceap-${mesAno}-${uuidHash}`.substring(0, 100);

          await prisma.despesa.upsert({
              where: { id: despesaId },
              update: {
                  valor: item.valor
              },
              create: {
                  id: despesaId,
                  descricao: item.descricao,
                  valor: item.valor,
                  data: mesAno,
                  fornecedor: 'ALEAM Portal',
                  linkOriginal: 'https://www.aleam.gov.br/transparencia/controle-de-cota-parlamentar/',
                  politicoId: politico.id
              }
          });
      }

    } catch (e) {
      console.log(`Erro isolado ao extrair ${dep.nome}: ${e.message}`);
    }
  }

  await browser.close();
  console.log("Fim da extração ALEAM!");
}

scrapeALEAM().catch(console.error);
