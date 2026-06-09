import prisma from '../lib/prisma';
export interface Despesa {
  id: string;
  descricao: string;
  valor: number;
  data: string;
  fornecedor: string;
  linkOriginal?: string | null;
  politicoId?: string;
}

export interface Politico {
  id: string;
  nome: string;
  partido: string;
  cargo: string;
  fotoUrl: string;
  despesas?: Despesa[];
  totalGastoMes?: number;
}

// Para a ALEAM e CMM que ainda não têm scraper, vamos manter os Mocks temporários.
const deputadosEstaduaisMock: Politico[] = [
  { id: "7", nome: "Roberto Cidade", partido: "UNIÃO", cargo: "Deputado Estadual", fotoUrl: "https://ui-avatars.com/api/?name=Roberto+Cidade&background=random", despesas: [
    { id: "d14", descricao: "Locação de veículos", valor: 29500.00, data: "2025-07-08", fornecedor: "Locadora Z", linkOriginal: "https://transparencia.aleam.gov.br/?recibo=776501" }
  ] },
  { id: "8", nome: "Joana Darc", partido: "UNIÃO", cargo: "Deputado Estadual", fotoUrl: "https://ui-avatars.com/api/?name=Joana+Darc&background=random", despesas: [
    { id: "d15", descricao: "Eventos e palestras", valor: 31200.15, data: "2025-07-11", fornecedor: "Eventos SA", linkOriginal: "https://transparencia.aleam.gov.br/?recibo=776502" }
  ] },
];

const vereadoresMock: Politico[] = [
  { id: "9", nome: "Rodrigo Guedes", partido: "PP", cargo: "Vereador", fotoUrl: "https://ui-avatars.com/api/?name=Rodrigo+Guedes&background=random", despesas: [
    { id: "d16", descricao: "Combustível", valor: 15400.00, data: "2025-07-05", fornecedor: "Postos", linkOriginal: "https://transparencia.cmm.am.gov.br/?recibo=991201" }
  ] },
  { id: "10", nome: "Caio André", partido: "PSC", cargo: "Vereador", fotoUrl: "https://ui-avatars.com/api/?name=Caio+André&background=random", despesas: [
    { id: "d17", descricao: "Material de expediente", valor: 18500.50, data: "2025-07-06", fornecedor: "Papelaria", linkOriginal: "https://transparencia.cmm.am.gov.br/?recibo=991202" }
  ] },
];

export const getSenadores = async (): Promise<Politico[]> => {
  return await prisma.politico.findMany({
    where: { cargo: 'Senador' },
    include: { despesas: true }
  });
};

export const getDeputadosFederais = async (): Promise<Politico[]> => {
  return await prisma.politico.findMany({
    where: { cargo: 'Deputado Federal' },
    include: { despesas: true }
  });
};

export const getDeputadosEstaduais = async (): Promise<Politico[]> => {
  return new Promise((resolve) => setTimeout(() => resolve(deputadosEstaduaisMock), 800));
};

export const getVereadores = async (): Promise<Politico[]> => {
  return new Promise((resolve) => setTimeout(() => resolve(vereadoresMock), 800));
};

export const getTodosPoliticos = async (): Promise<Politico[]> => {
  const senadores = await getSenadores();
  const federais = await getDeputadosFederais();
  const estaduais = await getDeputadosEstaduais();
  const vereadores = await getVereadores();
  return [...senadores, ...federais, ...estaduais, ...vereadores];
};

export async function getPoliticoById(id: string): Promise<Politico | undefined> {
  const politico = await prisma.politico.findUnique({
    where: { id },
    include: { despesas: true }
  });
  
  if (politico) return politico;

  // Se não achar no DB, procura nos mocks
  const todosMocks = [...deputadosEstaduaisMock, ...vereadoresMock];
  return todosMocks.find(p => p.id === id);
}

export async function getDespesas(politicoId: string, mes?: string, ano?: string): Promise<Despesa[]> {
  const despesasDb = await prisma.despesa.findMany({
    where: { politicoId },
    orderBy: { data: 'desc' }
  });

  if (despesasDb.length > 0) return despesasDb;

  // Se não tiver no DB, pega do mock
  const politicoMock = await getPoliticoById(politicoId);
  return politicoMock?.despesas || [];
}
