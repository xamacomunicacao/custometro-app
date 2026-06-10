import { PrismaClient } from '@prisma/client';

const poolerUrl = "postgres://postgres.cuhcvcshsugigrtumrxk:CustometroCynthiaBlink2026!@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1";
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: poolerUrl
    }
  }
});

async function main() {
  try {
    const p = await prisma.politico.findFirst();
    console.log("SUCESSO POOLER SA-EAST-1: " + p.nome);
  } catch(e) {
    console.error("FALHA SA-EAST-1:", e.message);
  } finally {
    await prisma.$disconnect();
  }
}
main();
