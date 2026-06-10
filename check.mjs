import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const pol = await prisma.politico.findFirst({
    where: { nome: { contains: 'Eduardo Braga' } },
    include: { despesas: true }
  });
  console.log('Politico:', pol?.nome, 'ID:', pol?.id);
  console.log('Qtd Despesas:', pol?.despesas?.length);
  
  const countTodos = await prisma.despesa.count();
  console.log('Total de Despesas no BD:', countTodos);
}

main().finally(() => prisma.$disconnect());
