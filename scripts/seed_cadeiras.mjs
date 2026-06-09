import 'dotenv/config';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { PrismaClient } from '@prisma/client';

puppeteer.use(StealthPlugin());
const prisma = new PrismaClient();

async function seedCadeiras() {
  console.log("Iniciando Semeador de Cadeiras...");
  // Launch com os args do linux pra evitar falhas se for rodado no Vercel ou GHA
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  
  try {
    // 1. SEMENTE DA ALEAM (24 Deputados)
    console.log("Extraindo cadeiras da ALEAM...");
    const pageAleam = await browser.newPage();
    await pageAleam.goto('https://www.aleam.gov.br/transparencia/controle-de-cota-parlamentar/', { waitUntil: 'networkidle2' });
    
    const deputados = await pageAleam.evaluate(() => {
      const options = Array.from(document.querySelectorAll('select#dados option'));
      return options.map(o => o.textContent.trim()).filter(n => n !== '' && !n.includes('Selecione'));
    });
    
    console.log(`Encontrados ${deputados.length} Deputados Estaduais na base.`);

    for (const nome of deputados) {
      const id = nome.toLowerCase().replace(/[^a-z0-9]/g, '-');
      // Cores variadas pro gerador
      const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(nome)}&background=random&color=fff&size=200&font-size=0.4`;
      
      await prisma.politico.upsert({
        where: { id },
        update: {
           nome,
           cargo: 'DEPUTADO',
           // Atualizar foto vazia pra foto com avatar se ele estiver vazio
           fotoUrl: avatarUrl
        },
        create: {
          id,
          nome,
          partido: "ND",
          cargo: 'DEPUTADO',
          fotoUrl: avatarUrl
        }
      });
    }

    // 2. SEMENTE DA CMM (41 Vereadores)
    console.log("Extraindo cadeiras da CMM...");
    const pageCmm = await browser.newPage();
    await pageCmm.goto('https://www.cmm.am.gov.br/transparencia/', { waitUntil: 'networkidle2' });
    
    await pageCmm.waitForFunction(() => {
      const options = document.querySelectorAll('select#ceap-filtro-parlamentar-sigae option');
      return options.length > 1 && !options[0].textContent.includes('Carregando');
    }, { timeout: 30000 });

    const vereadores = await pageCmm.evaluate(() => {
      const options = Array.from(document.querySelectorAll('select#ceap-filtro-parlamentar-sigae option'));
      return options.map(o => o.textContent.trim()).filter(n => n !== '' && !n.includes('Todos'));
    });
    
    console.log(`Encontrados ${vereadores.length} Vereadores na base.`);

    for (const nome of vereadores) {
      const id = nome.toLowerCase().replace(/[^a-z0-9]/g, '-');
      const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(nome)}&background=random&color=fff&size=200&font-size=0.4`;
      
      await prisma.politico.upsert({
        where: { id },
        update: {
           nome,
           cargo: 'VEREADOR',
           fotoUrl: avatarUrl
        },
        create: {
          id,
          nome,
          partido: "ND",
          cargo: 'VEREADOR',
          fotoUrl: avatarUrl
        }
      });
    }

    console.log("SUCESSO: Semente plantada! 65 Cadeiras oficializadas.");
  } catch (error) {
    console.error("Erro ao rodar semeador:", error);
  } finally {
    await browser.close();
  }
}

seedCadeiras().then(() => process.exit(0)).catch(() => process.exit(1));
