import ListaPoliticosClient from "@/components/ListaPoliticosClient";
import { getTodosPoliticos } from "@/services/api";

export const revalidate = 3600; // Cache de 1 hora

export default async function ParlamentaresPage() {
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
}
