import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const cmm = await prisma.despesa.findFirst({ where: { politico: { cargo: 'Vereador' } } });
  const aleam = await prisma.despesa.findFirst({ where: { politico: { cargo: 'Deputado Estadual' } } });
  const camara = await prisma.despesa.findFirst({ where: { politico: { cargo: 'Deputado Federal' } } });
  const senado = await prisma.despesa.findFirst({ where: { politico: { cargo: 'Senador' } } });

  console.log("CMM Link:", cmm?.linkOriginal);
  console.log("ALEAM Link:", aleam?.linkOriginal);
  console.log("Camara Link:", camara?.linkOriginal);
  console.log("Senado Link:", senado?.linkOriginal);
}

main().catch(console.error).finally(() => prisma.$disconnect());
