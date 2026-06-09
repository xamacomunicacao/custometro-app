import React from "react";
import { getVereadores } from "@/services/api";
import ListaPoliticosClient from "@/components/ListaPoliticosClient";

export default async function CamaraMunicipalPage() {
  try {
    const politicos = await getVereadores();

    return (
      <ListaPoliticosClient 
        initialPoliticos={politicos} 
        title="Controle de Cota Parlamentar" 
        subtitle="Câmara Municipal de Manaus" 
      />
    );
  } catch (error) {
    console.error("Erro ao buscar Vereadores:", error);
    return (
      <ListaPoliticosClient 
        initialPoliticos={[]} 
        title="Controle de Cota Parlamentar" 
        subtitle="Erro ao acessar os dados da Câmara" 
      />
    );
  }
}
