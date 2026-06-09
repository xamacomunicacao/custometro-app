import 'dotenv/config';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
puppeteer.use(StealthPlugin());
import prisma from '../../src/lib/prisma.ts';

async function scrapeCMM() {
  console.log("Iniciando Robô Puppeteer - CMM...");
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  await page.goto('https://www.cmm.am.gov.br/transparencia/', { waitUntil: 'networkidle2' });

  // Na CMM as opções carregam via Ajax, precisamos esperar o select preencher
  await page.waitForFunction(() => {
    const options = document.querySelectorAll('select#ceap-filtro-parlamentar-sigae option');
    return options.length > 1 && !options[0].textContent.includes('Carregando');
  }, { timeout: 30000 });

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
      await page.waitForTimeout(3000); 

      // Extrai os valores
      const despesas = await page.evaluate(() => {
        const rows = Array.from(document.querySelectorAll('#ceap-sigae-table tbody tr'));
        let totalGasto = 0;
        
        for (const row of rows) {
          const cells = row.querySelectorAll('td');
          // Ignora mensagens de tabela vazia
          if (cells.length > 5) { 
            const valorText = cells[5].textContent.replace('R$', '').replace('.', '').replace(',', '.').trim();
            const valor = parseFloat(valorText) || 0;
            totalGasto += valor;
          }
        }
        return totalGasto;
      });

      console.log(`- Gasto Total: R$ ${despesas}`);

      const verId = ver.nome.toLowerCase().replace(/[^a-z0-9]/g, '-');
      let politico = await prisma.politico.findUnique({
          where: { id: verId }
      });

      if (!politico) {
          console.log(`Vereador ${ver.nome} não encontrado no Seed do banco! Pular.`);
          continue;
      }

      const mesAno = `${mesValue}/${anoValue}`;
      const despesaId = `${verId}-ceap-${mesAno}`.substring(0, 100);

      await prisma.despesa.upsert({
          where: { id: despesaId },
          update: {
              valor: despesas
          },
          create: {
              id: despesaId,
              descricao: 'Total Despesas CEAP',
              valor: despesas,
              data: mesAno,
              fornecedor: 'CMM Portal',
              politicoId: politico.id
          }
      });

    } catch (e) {
      console.log(`Erro ao extrair ${ver.nome}: ${e.message}`);
    }
  }

  await browser.close();
  console.log("Fim da extração CMM!");
}

scrapeCMM().catch(console.error);
