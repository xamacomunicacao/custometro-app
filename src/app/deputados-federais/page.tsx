import React from "react";
import { getDeputadosFederais } from "@/services/api";
import ListaPoliticosClient from "@/components/ListaPoliticosClient";

export default async function DeputadosFederaisPage() {
  try {
    const politicos = await getDeputadosFederais();

    return (
      <ListaPoliticosClient 
        initialPoliticos={politicos} 
        title="Controle de Cota Parlamentar" 
        subtitle="Câmara dos Deputados (Federal)" 
      />
    );
  } catch (error) {
    console.error("Erro ao buscar Deputados Federais:", error);
    return (
      <ListaPoliticosClient 
        initialPoliticos={[]} 
        title="Controle de Cota Parlamentar" 
        subtitle="Erro ao acessar os dados da Câmara" 
      />
    );
  }
}
