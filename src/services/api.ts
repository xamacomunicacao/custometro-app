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

export const getSenadores = async (): Promise<Politico[]> => {
  return await prisma.politico.findMany({ where: { cargo: 'Senador' }, include: { despesas: true } });
};

export const getDeputadosFederais = async (): Promise<Politico[]> => {
  return await prisma.politico.findMany({ where: { cargo: 'Deputado Federal' }, include: { despesas: true } });
};

export const getDeputadosEstaduais = async (): Promise<Politico[]> => {
  return await prisma.politico.findMany({ where: { cargo: 'DEPUTADO' }, include: { despesas: true } });
};

export const getVereadores = async (): Promise<Politico[]> => {
  return await prisma.politico.findMany({ where: { cargo: 'VEREADOR' }, include: { despesas: true } });
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
  
  return politico || undefined;
}

export async function getDespesas(politicoId: string, mes?: string, ano?: string): Promise<Despesa[]> {
  const despesasDb = await prisma.despesa.findMany({
    where: { politicoId },
    orderBy: { data: 'desc' }
  });
  
  return despesasDb || [];
}
