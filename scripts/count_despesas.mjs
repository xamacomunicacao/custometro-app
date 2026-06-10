import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
   const count = await prisma.despesa.count();
   console.log("Total de despesas no banco agora:", count);
}
main().finally(() => prisma.$disconnect());
