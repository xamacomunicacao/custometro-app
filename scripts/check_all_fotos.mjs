import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const cmm = await prisma.politico.count({ where: { cargo: 'Vereador', fotoUrl: { contains: 'ui-avatars' } } });
  const aleam = await prisma.politico.count({ where: { cargo: 'Deputado Estadual', fotoUrl: { contains: 'ui-avatars' } } });
  const camara = await prisma.politico.count({ where: { cargo: 'Deputado Federal', fotoUrl: { contains: 'ui-avatars' } } });
  const senado = await prisma.politico.count({ where: { cargo: 'Senador', fotoUrl: { contains: 'ui-avatars' } } });

  console.log("Sem foto oficial (com ui-avatars):");
  console.log("CMM (Vereador):", cmm, "de", await prisma.politico.count({where: {cargo: 'Vereador'}}));
  console.log("ALEAM (Dep. Estadual):", aleam, "de", await prisma.politico.count({where: {cargo: 'Deputado Estadual'}}));
  console.log("Camara Federal:", camara, "de", await prisma.politico.count({where: {cargo: 'Deputado Federal'}}));
  console.log("Senado:", senado, "de", await prisma.politico.count({where: {cargo: 'Senador'}}));
}

main().catch(console.error).finally(() => prisma.$disconnect());
