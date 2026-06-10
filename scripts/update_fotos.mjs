import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
puppeteer.use(StealthPlugin());
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function normalizeName(name) {
   return name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
}

async function main() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  // ====================== CMM ======================
  await page.goto('https://www.cmm.am.gov.br/vereadores/', { waitUntil: 'networkidle2' });
  const cmmFotos = await page.evaluate(() => {
     const results = [];
     document.querySelectorAll('img').forEach(i => {
        const alt = i.alt || '';
        if (alt && !alt.includes('logo') && i.src.includes('uploads')) {
            results.push({ nome: alt, src: i.src });
        }
     });
     return results;
  });

  const vereadores = await prisma.politico.findMany({ where: { cargo: 'Vereador' } });
  
  let atualizadosCMM = 0;
  for (const foto of cmmFotos) {
      const nomeFoto = normalizeName(foto.nome);
      // tenta encontrar o vereador
      const ver = vereadores.find(v => normalizeName(v.nome).includes(nomeFoto) || nomeFoto.includes(normalizeName(v.nome)));
      if (ver) {
          await prisma.politico.update({
             where: { id: ver.id },
             data: { fotoUrl: foto.src }
          });
          atualizadosCMM++;
          console.log(`CMM atualizado: ${ver.nome} com ${foto.src}`);
      }
  }
  console.log(`CMM: ${atualizadosCMM} vereadores atualizados com foto oficial.`);

  // ====================== ALEAM ======================
  // vamos tentar investigar o DOM
  await page.goto('https://www.aleam.gov.br/deputados/', { waitUntil: 'networkidle2' });
  const aleamHtml = await page.evaluate(() => document.body.innerHTML);
  const fs = await import('fs');
  fs.writeFileSync('aleam_dump.html', aleamHtml);
  console.log("ALEAM HTML salvo em aleam_dump.html");

  await browser.close();
  await prisma.$disconnect();
}

main().catch(console.error);
