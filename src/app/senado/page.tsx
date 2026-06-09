import React from "react";
import { getSenadores } from "@/services/api";
import ListaPoliticosClient from "@/components/ListaPoliticosClient";
export const dynamic = 'force-dynamic';

export default async function SenadoPage() {
  try {
    const politicos = await getSenadores();

    return (
      <ListaPoliticosClient 
        initialPoliticos={politicos} 
        title="Controle de Cota Parlamentar" 
        subtitle="Senado Federal" 
      />
    );
  } catch (error) {
    console.error("Erro ao buscar Senadores:", error);
    return (
      <ListaPoliticosClient 
        initialPoliticos={[]} 
        title="Controle de Cota Parlamentar" 
        subtitle="Erro ao acessar os dados do Senado" 
      />
    );
  }
}
