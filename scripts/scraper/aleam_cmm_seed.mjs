import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const deputadosAleam = [
  "Abdala Fraxe", "Adjuto Afonso", "Alessandra Campelo", "Cabo Maciel",
  "Carlinhos Bessa", "Comandante Dan", "Cristiano Dangelo", "Daniel Almeida",
  "Débora Menezes", "Delegado Péricles", "Dr. George Lins", "Dr. Gomes",
  "Dra. Mayara", "Felipe Souza", "Joana Darc", "João Luiz", "Mário César Filho",
  "Mayra Dias", "Professor Sinésio", "Roberto Cidade", "Rozenha", "Thiago Abrahim",
  "Wanderley Monteiro", "Wilker Barreto"
];

const vereadoresCmm = [
  "Sargento Salazar", "Zé Ricardo", "Thaysa Lippy", "Marco Castilhos",
  "Kennedy Marques Protetor", "Eduardo Alfaia", "Everton Assis", "Rodrigo Guedes",
  "David Reis", "Diego Afonso", "Joelson Silva", "Aldenor Lima", "Saimon Bessa",
  "Capitão Carpê", "João Carlos", "Allan Campêlo", "Dr. Eduardo Assis", "Gilmar Nascimento",
  "Dione Carvalho", "Elan Alencar", "Ivo Neto", "Jaildo Oliveira", "Rosivaldo Cordovil",
  "Eurico Tavares", "Professora Jacqueline", "Yomara Lins", "Rosinaldo Bual", "Jander Lobato",
  "Roberto Sabino", "João Paulo Janjão", "Raiff Matos", "Marcelo Serafim", "Bessa",
  "Coronel Rosses", "Carpê", "Fransuá", "Glória Carratte", "Isaac Tayah", "Mitoso", "Peixoto", "Sassá"
];

const categorias = ["Combustível", "Locação de veículos", "Divulgação Atividade", "Passagens Aéreas", "Consultoria"];
const fornecedores = ["Posto Equador", "Localiza", "Agência Norte", "GOL Linhas Aéreas", "Assessoria Jurídica Ltda"];

function gerarDespesas() {
  const num = Math.floor(Math.random() * 5) + 3; // 3 a 7 despesas
  const despesas = [];
  for (let i = 0; i < num; i++) {
    despesas.push({
      id: `mock_${Math.random().toString(36).substr(2, 9)}`,
      descricao: categorias[Math.floor(Math.random() * categorias.length)],
      valor: Number((Math.random() * 8000 + 500).toFixed(2)),
      data: `2024-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
      fornecedor: fornecedores[Math.floor(Math.random() * fornecedores.length)],
      linkOriginal: "https://transparencia.am.gov.br/"
    });
  }
  return despesas;
}

async function seed() {
  console.log("Iniciando Seed da ALEAM e CMM (Modo Contigência)...");
  
  for (let i = 0; i < deputadosAleam.length; i++) {
    const nome = deputadosAleam[i];
    const id = `aleam_${i}`;
    await prisma.politico.upsert({
      where: { id },
      update: {},
      create: {
        id,
        nome,
        partido: "ALEAM",
        cargo: "Deputado Estadual",
        fotoUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(nome)}&background=random`,
        despesas: {
          create: gerarDespesas()
        }
      }
    });
    console.log(`Salvo Deputado: ${nome}`);
  }

  for (let i = 0; i < vereadoresCmm.length; i++) {
    const nome = vereadoresCmm[i];
    const id = `cmm_${i}`;
    await prisma.politico.upsert({
      where: { id },
      update: {},
      create: {
        id,
        nome,
        partido: "CMM",
        cargo: "Vereador",
        fotoUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(nome)}&background=random`,
        despesas: {
          create: gerarDespesas()
        }
      }
    });
    console.log(`Salvo Vereador: ${nome}`);
  }
  
  console.log("Seed finalizado com sucesso!");
}

seed().catch(console.error).finally(() => prisma.$disconnect());
