import React from "react";
import { getSenadores } from "@/services/api";
import ListaPoliticosClient from "@/components/ListaPoliticosClient";

export default async function SenadoPage() {
  const senadores = await getSenadores();

  return (
    <ListaPoliticosClient 
      initialPoliticos={senadores} 
      title="Controle de Cota Parlamentar" 
      subtitle="Senado da República" 
    />
  );
}
