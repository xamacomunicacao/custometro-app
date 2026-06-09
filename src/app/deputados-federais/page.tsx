import React from "react";
import { getDeputadosFederais } from "@/services/api";
import ListaPoliticosClient from "@/components/ListaPoliticosClient";

export default async function DeputadosFederaisPage() {
  const politicos = await getDeputadosFederais();

  return (
    <ListaPoliticosClient 
      initialPoliticos={politicos} 
      title="Controle de Cota Parlamentar" 
      subtitle="Câmara dos Deputados" 
    />
  );
}
