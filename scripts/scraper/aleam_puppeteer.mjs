import 'dotenv/config';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
puppeteer.use(StealthPlugin());
import prisma from '../../src/lib/prisma.ts';

async function scrapeALEAM() {
  console.log("Iniciando Robô Puppeteer - ALEAM...");
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.goto('https://www.aleam.gov.br/transparencia/controle-de-cota-parlamentar/', { waitUntil: 'networkidle2' });

  // Pega todos os deputados do select
  const deputados = await page.evaluate(() => {
    const options = Array.from(document.querySelectorAll('select#dados option'));
    return options.map(o => ({
      nome: o.textContent.trim(),
      value: o.value
    })).filter(o => o.value !== '' && !o.nome.includes('Selecione'));
  });

  console.log(`Encontrados ${deputados.length} deputados na ALEAM.`);
  
  // Pegar mês passado (Ex: Maio de 2026 -> valor 05)
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
        page.waitForNavigation({ waitUntil: 'networkidle2' }),
        page.click('button[type="submit"]')
      ]);

      // Extrai o valor do HTML de resultado
      const resultado = await page.evaluate(() => {
        // A ALEAM mostra o total gasto numa div de classe .cont-result-label__valor
        const labels = Array.from(document.querySelectorAll('.cont-result-label__title'));
        const valorSpan = Array.from(document.querySelectorAll('.cont-result-label__valor'));
        
        let gasto = 0;
        for(let i = 0; i < labels.length; i++) {
          if(labels[i] && labels[i].textContent.includes('Total de Despesa')) {
             if(valorSpan[i]) {
                const text = valorSpan[i].textContent.replace('R$', '').replace('.', '').replace(',', '.').trim();
                gasto = parseFloat(text) || 0;
             }
          }
        }
        return gasto;
      });

      console.log(`- Gasto: R$ ${resultado}`);
      
      if(resultado > 0) {
        // Encontra ou cria o politico
        const depId = dep.nome.toLowerCase().replace(/[^a-z0-9]/g, '-');
        let politico = await prisma.politico.findUnique({
            where: { id: depId }
        });

        if (!politico) {
            politico = await prisma.politico.create({
                data: {
                    id: depId,
                    nome: dep.nome,
                    partido: "ND",
                    fotoUrl: "",
                    cargo: 'DEPUTADO'
                }
            });
        }

        const mesAno = `${mesValue}/${anoValue}`;
        const despesaId = `${depId}-ceap-${mesAno}`.substring(0, 100);

        await prisma.despesa.upsert({
            where: { id: despesaId },
            update: {
                valor: resultado
            },
            create: {
                id: despesaId,
                descricao: 'Total Despesas CEAP',
                valor: resultado,
                data: mesAno,
                fornecedor: 'ALEAM Portal',
                politicoId: politico.id
            }
        });
      }

    } catch (e) {
      console.log(`Erro ao extrair ${dep.nome}: ${e.message}`);
    }
  }

  await browser.close();
  console.log("Fim da extração ALEAM!");
}

scrapeALEAM().catch(console.error);
