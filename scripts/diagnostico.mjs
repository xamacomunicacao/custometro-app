import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const senado = await prisma.politico.findMany({ where: { cargo: 'Senador' } });
  const camara = await prisma.politico.findMany({ where: { cargo: 'Deputado Federal' } });
  const aleam = await prisma.politico.findMany({ where: { cargo: 'Deputado Estadual' } });
  const cmm = await prisma.politico.findMany({ where: { cargo: 'Vereador' } });

  function isMissing(url) {
      return !url || url.includes('ui-avatars') || url.includes('undefined') || url === '';
  }

  const senadoMissing = senado.filter(p => isMissing(p.fotoUrl)).map(p => p.nome);
  const camaraMissing = camara.filter(p => isMissing(p.fotoUrl)).map(p => p.nome);
  const aleamMissing = aleam.filter(p => isMissing(p.fotoUrl)).map(p => p.nome);
  const cmmMissing = cmm.filter(p => isMissing(p.fotoUrl)).map(p => p.nome);

  console.log("=== RELATORIO DE IMAGENS FALTANTES ===");
  console.log(`Senado: Faltam ${senadoMissing.length} de ${senado.length} (${senadoMissing.join(', ')})`);
  console.log(`Camara: Faltam ${camaraMissing.length} de ${camara.length} (${camaraMissing.join(', ')})`);
  console.log(`ALEAM: Faltam ${aleamMissing.length} de ${aleam.length}`);
  console.log(`CMM: Faltam ${cmmMissing.length} de ${cmm.length}`);
  console.log("=======================================");
}

main().catch(console.error).finally(() => prisma.$disconnect());
