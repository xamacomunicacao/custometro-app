import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
puppeteer.use(StealthPlugin());

async function main() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.goto('https://www.aleam.gov.br/deputados/', { waitUntil: 'networkidle2' });
  
  const imgs = await page.evaluate(() => {
     const results = [];
     document.querySelectorAll('img').forEach(i => {
         const alt = i.alt || '';
         if (alt && !alt.includes('logo') && !alt.includes('Logo') && i.src.includes('uploads')) {
             results.push({ src: i.src, alt: alt.trim() });
         }
     });
     return results;
  });

  console.log("ALEAM FOTOS:");
  console.log(imgs.slice(0, 10));

  await page.goto('https://www.cmm.am.gov.br/vereadores/', { waitUntil: 'networkidle2' });
  const cmm = await page.evaluate(() => {
     const results = [];
     document.querySelectorAll('.elementor-image-box-wrapper').forEach(b => {
         const src = b.querySelector('img')?.src;
         const nome = b.querySelector('.elementor-image-box-title')?.textContent?.trim();
         if(src && nome) results.push({nome, src});
     });
     if(results.length === 0) {
        // Se não achou, pega as imgs
        document.querySelectorAll('img').forEach(i => {
           const alt = i.alt || '';
           if (alt && !alt.includes('logo') && i.src.includes('uploads')) {
               results.push({ nome: alt, src: i.src });
           }
        });
     }
     return results;
  });
  console.log("CMM FOTOS:");
  console.log(cmm.slice(0, 10));

  await browser.close();
}

main().catch(console.error);
