import React from "react";
import { getTodosPoliticos } from "@/services/api";
import ListaPoliticosClient from "@/components/ListaPoliticosClient";
export const dynamic = 'force-dynamic';

export default async function DeputadosFederaisPage() {
  try {
    const politicos = await getTodosPoliticos();

    return (
      <ListaPoliticosClient 
        initialPoliticos={politicos} 
        title="Controle de Cota Parlamentar" 
        subtitle="Câmara dos Deputados" 
        defaultCasa="Deputado Federal"
      />
    );
  } catch (error) {
    console.error("Erro ao buscar politicos:", error);
    return (
      <ListaPoliticosClient 
        initialPoliticos={[]} 
        title="Controle de Cota Parlamentar" 
        subtitle="Erro ao acessar os dados da Câmara Federal" 
      />
    );
  }
}
