const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const fs = require('fs');

async function run() {
  console.log("Iniciando Puppeteer para Dump ALEAM...");
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.goto('https://www.aleam.gov.br/transparencia/', { waitUntil: 'networkidle2' });
  const html = await page.content();
  fs.writeFileSync('aleam_dump.html', html);
  
  console.log("Dump salvo em aleam_dump.html");
  await browser.close();
}

run().catch(console.error);
