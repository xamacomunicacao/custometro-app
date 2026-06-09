import React from "react";
import { notFound } from "next/navigation";
import { getPoliticoById, getDespesas } from "@/services/api";
import DetalhesDespesas from "@/components/DetalhesDespesas";

export default async function DetalhesDespesasPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;
  const politico = await getPoliticoById(id);
  
  if (!politico) {
    notFound();
  }

  const despesas = await getDespesas(id);

  return (
    <main className="w-full">
      <DetalhesDespesas politico={politico} despesas={despesas} />
    </main>
  );
}
