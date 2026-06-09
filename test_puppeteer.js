const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

async function run() {
  console.log("Iniciando Puppeteer...");
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  console.log("Acessando ALEAM...");
  const aleamRes = await page.goto('https://www.aleam.gov.br/transparencia/', { waitUntil: 'networkidle2' });
  console.log("ALEAM Status:", aleamRes ? aleamRes.status() : "No response");
  console.log("ALEAM Título:", await page.title());

  console.log("Acessando CMM...");
  const cmmRes = await page.goto('https://www.cmm.am.gov.br/transparencia/', { waitUntil: 'networkidle2' });
  console.log("CMM Status:", cmmRes ? cmmRes.status() : "No response");
  console.log("CMM Título:", await page.title());

  await browser.close();
  console.log("Fim do teste!");
}

run().catch(console.error);
