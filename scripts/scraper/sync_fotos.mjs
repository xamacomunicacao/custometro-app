import { PrismaClient } from '@prisma/client';


const prisma = new PrismaClient();

function normalize(str) {
   return str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, '');
}

async function fetchALEAMMedia() {
    let allMedia = [];
    console.log("Buscando imagens via WP REST API da ALEAM...");
    try {
       // Pega as 100 imagens mais recentes da galeria
       const res = await fetch('https://www.aleam.gov.br/wp-json/wp/v2/media?per_page=100');
       if (res.ok) {
           const data = await res.json();
           allMedia = data.map(m => m.source_url);
       }
    } catch(e) { console.error("Erro WP-API ALEAM:", e.message); }
    return allMedia;
}

async function main() {
   const aleamMedia = await fetchALEAMMedia();
   
   // Tentar ALEAM
   const aleamDeputados = await prisma.politico.findMany({ where: { cargo: 'Deputado Estadual' } });
   let aleamCount = 0;

   for (const dep of aleamDeputados) {
       // pula se a foto estiver certinha ja e nao for do avatar
       if (dep.fotoUrl && !dep.fotoUrl.includes('ui-avatars') && dep.fotoUrl !== '') continue;

       const parts = dep.nome.split(' ');
       const first = normalize(parts[0]);
       const last = parts.length > 1 ? normalize(parts[parts.length-1]) : first;

       const match = aleamMedia.find(url => url.toLowerCase().includes(first) && url.toLowerCase().includes(last));
       if (match) {
           await prisma.politico.update({
               where: { id: dep.id },
               data: { fotoUrl: match }
           });
           console.log(`[ALEAM] Resolvido: ${dep.nome} -> ${match}`);
           aleamCount++;
       }
   }
   console.log(`ALEAM: ${aleamCount} recuperadas da API Oculta.`);

   // Tentar fallback hardcoded para deputados que ainda sobrarem (solução paleativa pro cloudflare)
   const fallbackALEAM = {
      'roberto-cidade': 'https://www.aleam.gov.br/wp-content/uploads/2023/02/roberto-cidade.png',
      'joana-darc': 'https://www.aleam.gov.br/wp-content/uploads/2023/02/joana-darc.png',
      'alessandra-campelo': 'https://www.aleam.gov.br/wp-content/uploads/2023/02/alessandra-campelo.png',
      'abdala-fraxe': 'https://www.aleam.gov.br/wp-content/uploads/2023/02/abdala-fraxe.png',
      'carlinhos-bessa': 'https://www.aleam.gov.br/wp-content/uploads/2023/02/carlinhos-bessa.png',
      'felipe-souza': 'https://www.aleam.gov.br/wp-content/uploads/2023/02/felipe-souza.png',
      'wilker-barreto': 'https://www.aleam.gov.br/wp-content/uploads/2023/02/wilker-barreto.png',
      'cabo-maciel': 'https://www.aleam.gov.br/wp-content/uploads/2023/02/cabo-maciel.png',
      'adjuto-afonso': 'https://www.aleam.gov.br/wp-content/uploads/2023/02/adjuto-afonso.png',
      'delegado-pericles': 'https://www.aleam.gov.br/wp-content/uploads/2023/02/delegado-pericles.png',
      'sinasio': 'https://www.aleam.gov.br/wp-content/uploads/2023/02/sinasio.png'
   };

   const stillMissingAleam = await prisma.politico.findMany({ where: { cargo: 'Deputado Estadual', fotoUrl: { contains: 'ui-avatars' } } });
   for (const dep of stillMissingAleam) {
       const key = normalize(dep.nome.split(' ').slice(0, 2).join('-'));
       if (fallbackALEAM[dep.id] || fallbackALEAM[key]) {
           const url = fallbackALEAM[dep.id] || fallbackALEAM[key];
           await prisma.politico.update({
               where: { id: dep.id },
               data: { fotoUrl: url }
           });
           console.log(`[ALEAM Fallback] Resolvido: ${dep.nome} -> ${url}`);
       }
   }

   console.log("Sincronização de fotos finalizada.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
