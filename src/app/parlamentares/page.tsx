import ListaPoliticosClient from "@/components/ListaPoliticosClient";
import { getTodosPoliticos } from "@/services/api";

export const revalidate = 3600; // Cache de 1 hora

export default async function ParlamentaresPage() {
  try {
    const politicos = await getTodosPoliticos();

    // Calcular totalGastoMes para cada um
    const politicosComTotal = politicos.map(p => {
      const total = p.despesas?.reduce((acc, d) => acc + d.valor, 0) || 0;
      return { ...p, totalGastoMes: total };
    });

    // Ordenar por gasto
    politicosComTotal.sort((a, b) => (b.totalGastoMes || 0) - (a.totalGastoMes || 0));

    return (
      <ListaPoliticosClient 
        initialPoliticos={politicosComTotal} 
        title="Todos os Parlamentares" 
        subtitle="Filtre e pesquise por despesas"
      />
    );
  } catch (error) {
    console.error("Erro na busca de todos politicos:", error);
    return (
      <ListaPoliticosClient 
        initialPoliticos={[]} 
        title="Todos os Parlamentares" 
        subtitle="Erro ao buscar os dados do banco"
      />
    );
  }
}
