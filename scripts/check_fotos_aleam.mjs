import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const aleam = await prisma.politico.findMany({
    where: { cargo: 'Deputado Estadual' },
    select: { nome: true, fotoUrl: true }
  });
  console.log("Qtd ALEAM:", aleam.length);
  for (const dep of aleam.slice(0, 5)) {
    console.log(dep.nome, "->", dep.fotoUrl);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
