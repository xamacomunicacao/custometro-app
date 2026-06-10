import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const cargos = await prisma.politico.findMany({
    select: { cargo: true, nome: true }
  });
  console.log("Qtd:", cargos.length);
  const unicos = [...new Set(cargos.map(c => c.cargo))];
  console.log("Cargos no banco:", unicos);
}

main().catch(console.error).finally(() => prisma.$disconnect());
