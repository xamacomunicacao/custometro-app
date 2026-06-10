import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
puppeteer.use(StealthPlugin());

async function main() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.goto('https://www.aleam.gov.br/deputados/', { waitUntil: 'networkidle2' });
  
  const fotos = await page.evaluate(() => {
     const boxes = document.querySelectorAll('.elementor-image-box-wrapper');
     const results = [];
     boxes.forEach(box => {
        const img = box.querySelector('img')?.src;
        const nome = box.querySelector('.elementor-image-box-title')?.textContent?.trim();
        if (nome && img) {
            results.push({ nome, img });
        }
     });
     return results;
  });

  console.log("ALEAM FOTOS:");
  console.log(fotos.slice(0, 5));
  await browser.close();
}

main().catch(console.error);
