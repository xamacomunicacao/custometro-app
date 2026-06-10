"use client";
import { useState } from "react";
import { motion } from "framer-motion";

import { Politico } from "@/services/api";

export default function FilterBar({ 
  onSearch, 
  politicosDisponiveis = [],
  defaultCasa = ""
}: { 
  onSearch: (filters: any) => void,
  politicosDisponiveis?: Politico[],
  defaultCasa?: string
}) {
  const [casa, setCasa] = useState(defaultCasa);
  const [parlamentar, setParlamentar] = useState("");
  const [ano, setAno] = useState("");
  const [mes, setMes] = useState("");

  // Filtrar os parlamentares disponíveis baseado na Casa Legislativa selecionada
  const politicosFiltrados = casa 
    ? politicosDisponiveis.filter(p => p.cargo === casa) 
    : politicosDisponiveis;
    
  const nomesUnicos = Array.from(new Set(politicosFiltrados.map(p => p.nome))).sort();

  return (
    <div className="flex flex-wrap gap-4 items-center justify-start w-full mb-8">
      {/* Filtro Casa Legislativa */}
      <div className="relative w-full sm:w-auto">
        <select
          className="appearance-none w-full sm:w-48 bg-white border border-[#FF0055] text-gray-800 px-4 py-2.5 pr-10 rounded-[4px] outline-none focus:ring-1 focus:ring-[#FF0055]/50 font-bold text-[14px] cursor-pointer"
          value={casa}
          onChange={(e) => {
            setCasa(e.target.value);
            setParlamentar(""); // Reseta o parlamentar ao trocar de casa
          }}
        >
          <option value="" className="text-gray-800">Casa Legislativa &gt;&gt;</option>
          <option value="Senador" className="text-gray-800">Senado</option>
          <option value="Deputado Federal" className="text-gray-800">Câmara Federal</option>
          <option value="Deputado Estadual" className="text-gray-800">Assembleia (ALEAM)</option>
          <option value="Vereador" className="text-gray-800">Câmara (CMM)</option>
        </select>
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#FF0055] pointer-events-none font-bold text-xs">
          &#9660;
        </span>
      </div>

      {/* Filtro Parlamentar */}
      <div className="relative w-full sm:w-auto">
        <select
          className="appearance-none w-full sm:w-56 bg-white border border-[#FF0055] text-gray-800 px-4 py-2.5 pr-10 rounded-[4px] outline-none focus:ring-1 focus:ring-[#FF0055]/50 font-bold text-[14px] cursor-pointer"
          value={parlamentar}
          onChange={(e) => setParlamentar(e.target.value)}
        >
          <option value="" disabled hidden className="text-gray-800">Parlamentar &gt;&gt;</option>
          <option value="Todos" className="text-gray-800">Todos</option>
          {nomesUnicos.map(nome => (
            <option key={nome} value={nome} className="text-gray-800">{nome}</option>
          ))}
        </select>
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#FF0055] pointer-events-none font-bold text-xs">
          &#9660;
        </span>
      </div>

      {/* Filtro Ano */}
      <div className="relative w-full sm:w-auto">
        <select
          className="appearance-none w-full sm:w-36 bg-white border border-[#FF0055] text-gray-800 px-4 py-2.5 pr-10 rounded-[4px] outline-none focus:ring-1 focus:ring-[#FF0055]/50 font-bold text-[14px] cursor-pointer"
          value={ano}
          onChange={(e) => setAno(e.target.value)}
        >
          <option value="" className="text-gray-800">Ano &gt;&gt;</option>
          <option value="2026" className="text-gray-800">2026</option>
          <option value="2025" className="text-gray-800">2025</option>
          <option value="2024" className="text-gray-800">2024</option>
        </select>
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#FF0055] pointer-events-none font-bold text-xs">
          &#9660;
        </span>
      </div>

      {/* Filtro Mês */}
      <div className="relative w-full sm:w-auto">
        <select
          className="appearance-none w-full sm:w-36 bg-white border border-[#FF0055] text-gray-800 px-4 py-2.5 pr-10 rounded-[4px] outline-none focus:ring-1 focus:ring-[#FF0055]/50 font-bold text-[14px] cursor-pointer"
          value={mes}
          onChange={(e) => setMes(e.target.value)}
        >
          <option value="" className="text-gray-800">Mês &gt;&gt;</option>
          <option value="07" className="text-gray-800">Julho</option>
          <option value="06" className="text-gray-800">Junho</option>
        </select>
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#FF0055] pointer-events-none font-bold text-xs">
          &#9660;
        </span>
      </div>

      {/* Botão Pesquisar */}
      <motion.button
        whileHover={{ scale: 1.02, backgroundColor: "#ff1a6c" }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onSearch({ casa, parlamentar, ano, mes })}
        className="w-full sm:w-auto bg-[#FF0055] text-white px-8 py-2.5 rounded-[4px] font-bold text-[14px] shadow-[0_4px_12px_rgba(255,0,85,0.25)] hover:shadow-[0_6px_16px_rgba(255,0,85,0.4)] transition-all cursor-pointer"
      >
        Pesquisar
      </motion.button>
    </div>
  );
}
