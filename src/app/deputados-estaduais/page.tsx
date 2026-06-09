import React from "react";
import { getDeputadosEstaduais } from "@/services/api";
import ListaPoliticosClient from "@/components/ListaPoliticosClient";

export default async function DeputadosEstaduaisPage() {
  const politicos = await getDeputadosEstaduais();

  return (
    <ListaPoliticosClient 
      initialPoliticos={politicos} 
      title="Controle de Cota Parlamentar" 
      subtitle="Assembleia Legislativa do Amazonas" 
    />
  );
}
