import 'dotenv/config';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
puppeteer.use(StealthPlugin());
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

async function scrapeCMM() {
  console.log("Iniciando Robô Puppeteer - CMM...");
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  // Timeout agressivo de 90s para compensar lentidao do site gov
  page.setDefaultNavigationTimeout(90000);
  page.setDefaultTimeout(90000);

  try {
    await page.goto('https://www.cmm.am.gov.br/transparencia/', { waitUntil: 'networkidle2' });
  } catch(e) {
    console.log("Portal da CMM caiu ou demorou demais para responder o Index:", e.message);
    await browser.close();
    return;
  }

  // Na CMM as opções carregam via Ajax, precisamos esperar o select preencher
  try {
      await page.waitForFunction(() => {
        const options = document.querySelectorAll('select#ceap-filtro-parlamentar-sigae option');
        return options.length > 1 && !options[0].textContent.includes('Carregando');
      }, { timeout: 60000 });
  } catch (e) {
      console.log("Erro: O combo de vereadores da CMM não carregou a tempo:", e.message);
      await browser.close();
      return;
  }

  const vereadores = await page.evaluate(() => {
    const options = Array.from(document.querySelectorAll('select#ceap-filtro-parlamentar-sigae option'));
    return options.map(o => ({
      nome: o.textContent.trim(),
      value: o.value
    })).filter(o => o.value !== '' && !o.nome.includes('Todos'));
  });

  console.log(`Encontrados ${vereadores.length} vereadores na CMM.`);
  
  const currentDate = new Date();
  currentDate.setMonth(currentDate.getMonth() - 1);
  const mesValue = (currentDate.getMonth() + 1).toString().padStart(2, '0');
  const anoValue = currentDate.getFullYear().toString();

  console.log(`Buscando dados de ${mesValue}/${anoValue}...`);

  for (const ver of vereadores) {
    try {
      console.log(`Extraindo: ${ver.nome}...`);
      
      // Abre a aba da CEAP se não estiver aberta
      await page.evaluate(() => {
         const tab = document.querySelector('a[href="#tp-ceap"]');
         if(tab) tab.click();
      });
      await page.waitForTimeout(1000);

      // Seleciona os filtros
      await page.select('select#ceap-filtro-ano', anoValue);
      await page.select('select#ceap-filtro-mes-inicial', mesValue);
      await page.select('select#ceap-filtro-mes-final', mesValue);
      await page.select('select#ceap-filtro-parlamentar-sigae', ver.value);
      
      await page.click('#btn-ceap-pesquisar-sigae');
      
      // Aguarda a tabela carregar ou recarregar
      try {
         await page.waitForTimeout(5000); 
      } catch(e){}

      // Extrai os valores individuais
      const itensDespesa = await page.evaluate(() => {
        const rows = Array.from(document.querySelectorAll('#ceap-sigae-table tbody tr'));
        let itens = [];
        
        for (const row of rows) {
          const cells = row.querySelectorAll('td');
          // Ignora mensagens de tabela vazia
          if (cells.length > 5) { 
            const dataText = cells[0]?.textContent?.trim() || '';
            const fornecedorText = cells[1]?.textContent?.trim() || '';
            const descricaoText = cells[3]?.textContent?.trim() || '';
            const valorText = cells[5]?.textContent?.replace('R$', '').replace('.', '').replace(',', '.').trim() || '0';
            const valor = parseFloat(valorText) || 0;
            if (valor > 0) {
               itens.push({ descricao: descricaoText, valor, data: dataText, fornecedor: fornecedorText });
            }
          }
        }
        return itens;
      });

      console.log(`- Encontrados ${itensDespesa.length} itens de despesa.`);

      const verId = ver.nome.toLowerCase().replace(/[^a-z0-9]/g, '-');
      // Tenta achar com id direto ou parcial
      let politico = await prisma.politico.findFirst({
          where: { cargo: 'Vereador', nome: { contains: ver.nome.split(' ')[0] } }
      });

      if (!politico) {
          console.log(`Vereador ${ver.nome} não encontrado no Seed do banco! Pular.`);
          continue;
      }

      const mesAno = `${mesValue}/${anoValue}`;
      
      // Se não houver despesas, pula a criacao
      if (itensDespesa.length === 0) continue;

      // Injeta item por item no banco
      for (const item of itensDespesa) {
          const uuidHash = crypto.createHash('md5').update(`${politico.id}-${item.descricao}-${item.valor}-${item.data}`).digest('hex');
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
                  data: item.data || mesAno,
                  fornecedor: item.fornecedor || 'CMM Portal',
                  linkOriginal: 'https://www.cmm.am.gov.br/transparencia/',
                  politicoId: politico.id
              }
          });
      }

    } catch (e) {
      console.log(`Erro crítico ao extrair ${ver.nome}: ${e.message}`);
    }
  }

  await browser.close();
  console.log("Fim da extração CMM!");
}

scrapeCMM().catch(console.error);
