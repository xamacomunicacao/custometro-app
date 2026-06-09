const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const fs = require('fs');

async function run() {
  console.log("Iniciando Puppeteer para Dump Interno ALEAM...");
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.goto('https://www.aleam.gov.br/transparencia/controle-de-cota-parlamentar/', { waitUntil: 'networkidle2' });
  const html = await page.content();
  fs.writeFileSync('aleam_ceap_dump.html', html);
  
  console.log("Dump salvo em aleam_ceap_dump.html");
  await browser.close();
}

run().catch(console.error);
