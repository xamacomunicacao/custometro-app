import React from "react";
import { getDeputadosEstaduais } from "@/services/api";
import ListaPoliticosClient from "@/components/ListaPoliticosClient";

export default async function DeputadosEstaduaisPage() {
  try {
    const politicos = await getDeputadosEstaduais();

    return (
      <ListaPoliticosClient 
        initialPoliticos={politicos} 
        title="Controle de Cota Parlamentar" 
        subtitle="Assembleia Legislativa do Amazonas" 
      />
    );
  } catch (error) {
    console.error("Erro ao buscar Deputados Estaduais:", error);
    return (
      <ListaPoliticosClient 
        initialPoliticos={[]} 
        title="Controle de Cota Parlamentar" 
        subtitle="Erro ao acessar os dados da Assembleia" 
      />
    );
  }
}
