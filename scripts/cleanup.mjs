import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function clean() {
  console.log("Deletando todos os gastos falsos/mock...");
  await prisma.despesa.deleteMany({});
  console.log("Banco de dados de despesas limpo!");
}

clean().catch(console.error).finally(() => prisma.$disconnect());
