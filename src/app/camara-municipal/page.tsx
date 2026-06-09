import React from "react";
import { getVereadores } from "@/services/api";
import ListaPoliticosClient from "@/components/ListaPoliticosClient";

export default async function CamaraMunicipalPage() {
  const politicos = await getVereadores();

  return (
    <ListaPoliticosClient 
      initialPoliticos={politicos} 
      title="Controle de Cota Parlamentar" 
      subtitle="Câmara Municipal de Manaus" 
    />
  );
}
