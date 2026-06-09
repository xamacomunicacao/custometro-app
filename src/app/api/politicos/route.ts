import { NextResponse } from 'next/server';
import { getSenadores, getDeputadosFederais, getDeputadosEstaduais, getVereadores } from '@/services/api';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cargo = searchParams.get('cargo') as "Senador" | "Deputado Federal" | "Deputado Estadual" | "Vereador" | null;

  if (!cargo) {
    return NextResponse.json({ error: 'Cargo é obrigatório' }, { status: 400 });
  }

  try {
    let politicos = [];
    switch (cargo) {
      case 'Senador': politicos = await getSenadores(); break;
      case 'Deputado Federal': politicos = await getDeputadosFederais(); break;
      case 'Deputado Estadual': politicos = await getDeputadosEstaduais(); break;
      case 'Vereador': politicos = await getVereadores(); break;
      default: return NextResponse.json({ error: 'Cargo inválido' }, { status: 400 });
    }
    
    // Calcula o totalGastoMes para cada politico
    politicos = politicos.map(p => {
      const total = p.despesas?.reduce((acc, d) => acc + d.valor, 0) || 0;
      return { ...p, totalGastoMes: total };
    });

    // Ordena do maior para o menor gasto
    politicos.sort((a, b) => (b.totalGastoMes || 0) - (a.totalGastoMes || 0));

    return NextResponse.json(politicos);
  } catch (error) {
    console.error('Erro ao buscar politicos:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
