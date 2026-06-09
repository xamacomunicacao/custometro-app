import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient({ log: ['query', 'info', 'warn', 'error'] });

async function main() {
  try {
    console.log("Tentando conectar no banco de dados...");
    const politicos = await prisma.politico.findMany({
      include: { despesas: true }
    });
    console.log(`Sucesso: ${politicos.length} politicos retornados!`);
  } catch(e) {
    console.error("Erro fatal do Prisma:", e);
  } finally {
    await prisma.$disconnect();
  }
}
main();
