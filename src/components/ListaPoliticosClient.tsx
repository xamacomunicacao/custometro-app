"use client";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import FilterBar from "@/components/FilterBar";
import PoliticianCard from "@/components/PoliticianCard";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Politico } from "@/services/api";

const arrowVariants = {
  initial: { x: 0 },
  hover: {
    x: 5,
    transition: { repeat: Infinity, repeatType: "reverse" as const, duration: 0.5, ease: "easeInOut" as const },
  },
} as const;

export default function ListaPoliticosClient({ initialPoliticos, title, subtitle, defaultCasa }: { initialPoliticos: Politico[], title: string, subtitle: string, defaultCasa?: string }) {
  // Inicializa o estado já filtrando pela casa padrão (se existir)
  const [politicos, setPoliticos] = useState(
    defaultCasa ? initialPoliticos.filter(p => p.cargo === defaultCasa) : initialPoliticos
  );
  
  // O subtítulo rosa agora pode iniciar preenchido se tivermos um defaultCasa, ou aguarda o pesquisar
  const [dynamicSubtitle, setDynamicSubtitle] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = (filters: any) => {
    let result = initialPoliticos;
    
    // Filtrar por Casa Legislativa (Cargo)
    let newSubtitle = "";
    if (filters.casa) {
      result = result.filter(s => s.cargo === filters.casa);
      if (filters.casa === "Senador") newSubtitle = "Senado Federal";
      else if (filters.casa === "Deputado Federal") newSubtitle = "Câmara Federal";
      else if (filters.casa === "Deputado Estadual") newSubtitle = "Assembleia Legislativa (ALEAM)";
      else if (filters.casa === "Vereador") newSubtitle = "Câmara Municipal de Manaus";
    }
    
    // Filtrar por Nome do Parlamentar
    if (filters.parlamentar && filters.parlamentar !== "Todos") {
      const pLower = filters.parlamentar.toLowerCase();
      result = result.filter(s => s.nome.toLowerCase().includes(pLower));
    }
    
    setDynamicSubtitle(newSubtitle);
    setPoliticos(result);
    setHasSearched(true);
  };

  return (
    <main className="w-full min-h-screen bg-background font-sans overflow-x-hidden">
      <Navbar />

      {/* ===================== HERO — Idêntico à Home/Quem Somos ===================== */}
      <div className="relative w-full z-10 overflow-hidden" style={{ paddingBottom: "180px" }}>

        {/* Mobile */}
        <div className="block md:hidden absolute inset-0 w-full h-full pointer-events-none">
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 375 800" preserveAspectRatio="none" style={{ zIndex: 1 }}>
            <path d="M0,0 L375,0 L375,530 Q375,590 315,622 L100,736.7 Q0,790 0,690 Z" fill="#FF0055" />
          </svg>
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 375 800" preserveAspectRatio="none" style={{ zIndex: 2 }}>
            <path d="M0,0 L375,0 L375,500 Q375,560 315,592 L100,706.7 Q0,760 0,660 Z" fill="#1C2331" />
          </svg>
        </div>

        {/* Desktop */}
        <div className="hidden md:block absolute inset-0 w-full h-full pointer-events-none">
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1440 860" preserveAspectRatio="none" style={{ zIndex: 1 }}>
            <path d="M0,0 L1440,0 L1440,509 Q1440,609 1340,627 L100,850 Q0,868 0,768 Z" fill="#FF0055" />
          </svg>
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1440 860" preserveAspectRatio="none" style={{ zIndex: 2 }}>
            <path d="M0,0 L1440,0 L1440,499 Q1440,599 1340,614 L100,800 Q0,815 0,715 Z" fill="#1C2331" />
          </svg>
        </div>

        {/* TV decorativa */}
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
          className="absolute pointer-events-none"
          style={{ top: "-5%", right: "-8%", width: "65%", maxWidth: "950px", opacity: 0.15, transform: "scaleX(-1) rotate(-15deg)", zIndex: 3 }}
        >
          <Image src="/Shape logo 02.png" alt="TV Shape Decorativa" width={1000} height={1000} className="w-full h-auto object-contain" />
        </motion.div>

        {/* Conteúdo */}
        <div className="relative z-20 pt-36 pb-20 px-6 md:px-16 max-w-5xl mx-auto">
          <div className="absolute left-[20px] top-[145px] opacity-25 hidden md:block pointer-events-none">
            <svg width="40" height="160" viewBox="0 0 40 160">
              <pattern id="hero-dots-senado" x="0" y="0" width="12" height="12" patternUnits="userSpaceOnUse">
                <circle fill="#ffffff" cx="2" cy="2" r="1.8" />
              </pattern>
              <rect x="0" y="0" width="40" height="160" fill="url(#hero-dots-senado)" />
            </svg>
          </div>

          <div className="pl-0 md:pl-14">
            <motion.p initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}
              className="text-gray-300 font-semibold text-[18px] mb-2 tracking-wide">
              Bem vindo ao
            </motion.p>
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.6 }}
              className="font-heading font-black tracking-tight leading-none mb-5"
              style={{ fontSize: "clamp(2.5rem, 8vw, 7.5rem)" }}>
              <span style={{ color: "#FF0055" }}>CU</span>
              <span style={{ color: "#ffffff", fontWeight: 900 }}>$</span>
              <span style={{ color: "#FF0055" }}>TÔMETRO</span>
            </motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.5 }}
              className="text-gray-300 text-[14px] leading-relaxed mb-9 max-w-[480px]">
              Aqui você fica por dentro dos valores gastos pelos políticos do Amazonas de forma&nbsp;
              transparente, com dados atualizados em real time.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.5 }}
              className="flex flex-wrap gap-4">
              <Link href="/quem-somos">
                <motion.button
                  whileHover="hover" initial="initial" whileTap={{ scale: 0.96 }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                  className="px-6 py-2.5 border border-white/40 rounded text-[13px] font-medium text-white transition-all duration-300 flex items-center gap-1.5 hover:border-[#FF0055] hover:bg-[#FF0055]/10 hover:shadow-[0_0_15px_rgba(255,0,85,0.3)] bg-transparent">
                  <span>Quem somos</span>
                  <motion.span variants={arrowVariants} className="inline-block font-bold">&gt;&gt;</motion.span>
                </motion.button>
              </Link>
              <Link href="/metodologia">
                <motion.button
                  whileHover={{ scale: 1.03, y: -2, borderColor: "#FF0055", backgroundColor: "rgba(255,0,85,0.1)", boxShadow: "0 0 15px rgba(255,0,85,0.3)" }}
                  whileTap={{ scale: 0.96 }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                  className="px-6 py-2.5 border border-white/40 rounded text-[13px] font-medium text-white transition-all duration-300">
                  O que é a CEAP?
                </motion.button>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ===================== CONTEÚDO PRINCIPAL — Fundo branco/cinza claro ===================== */}
      <section className="relative z-20 max-w-6xl mx-auto px-6 md:px-12 py-16">
        {/* Barra de Filtros */}
        <FilterBar onSearch={handleSearch} politicosDisponiveis={initialPoliticos} defaultCasa={defaultCasa} />

        {/* Títulos de Cota */}
        <div className="mb-12 mt-10">
          <h2 className="text-[32px] md:text-[38px] font-black text-[#1C2331] tracking-tight leading-none">
            {title === "Todos os Parlamentares" ? "Controle de Cota Parlamentar" : title}
          </h2>
          {dynamicSubtitle && (
            <h3 className="text-[20px] md:text-[24px] font-extrabold text-[#FF0055] mt-1.5">
              {dynamicSubtitle}
            </h3>
          )}
        </div>

        {/* Grid de Parlamentares */}
        {hasSearched ? (
          politicos.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {politicos.map((politico, index) => (
                <PoliticianCard key={`${politico.id}-${index}`} politico={politico} />
              ))}
            </div>
          ) : (
            <div className="bg-white border border-gray-100 rounded-lg p-12 text-center text-gray-500 shadow-sm">
              Nenhum parlamentar encontrado para esta pesquisa.
            </div>
          )
        ) : (
          <div className="bg-transparent py-12 text-center text-gray-400">
            {/* Estado Inicial Vazio conforme solicitado */}
          </div>
        )}
      </section>

      {/* ===================== FOOTER — 3 colunas conforme referência ===================== */}
      <footer className="w-full bg-[#2A2F3B] text-white py-10 px-6 md:px-16 relative overflow-hidden">
        <div className="absolute top-6 right-8 opacity-10 pointer-events-none hidden md:block">
          <svg width="80" height="120" viewBox="0 0 80 120">
            <pattern id="footer-dots-senado-ft" x="0" y="0" width="14" height="14" patternUnits="userSpaceOnUse">
              <circle fill="#ffffff" cx="2" cy="2" r="2" />
            </pattern>
            <rect x="0" y="0" width="80" height="120" fill="url(#footer-dots-senado-ft)" />
          </svg>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 items-start">
          {/* Coluna 1: Política e Termos */}
          <div>
            <p className="font-bold text-[13px] text-white mb-2">Política de Privacidade | Termos e Condições</p>
            <p className="text-[12px] text-gray-400 leading-relaxed">
              <span className="text-[#FF0055] font-semibold">©2025 Custômetro®</span>. Todos os direitos reservados.<br />
              Desenvolvido por Xamã Comunicação
            </p>
          </div>

          {/* Coluna 2: Parcerias */}
          <div>
            <h4 className="font-bold text-[13px] text-white mb-4">Parcerias</h4>
            <div className="flex items-center gap-3 opacity-90 hover:opacity-100 transition-opacity cursor-pointer">
              <Image src="/Manaus 360.png" alt="Manaus 360 por Cynthia Blink" width={150} height={48} className="object-contain" />
            </div>
          </div>

          {/* Coluna 3: Continue bem informado */}
          <div>
            <h4 className="font-bold text-[13px] text-white mb-4">Continue bem informado</h4>
            <ul className="space-y-3 text-[12px] text-gray-300 font-medium">
              {[
                { d: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z", label: "@cynthiablink" },
                { d: "M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.51a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15.2a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.63a8.35 8.35 0 0 0 4.93 1.59V6.77a4.81 4.81 0 0 1-1.17-.08z", label: "@cynthiablink360" },
                { d: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z", label: "@Cynthia Pinheiro (Jornalista)" },
              ].map(({ d, label }) => (
                <li key={label} className="flex items-center gap-3 hover:text-white cursor-pointer transition-colors group">
                  <div className="w-7 h-7 border border-[#FF0055] rounded-md text-[#FF0055] flex items-center justify-center group-hover:bg-[#FF0055] group-hover:text-white transition-colors">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d={d} /></svg>
                  </div>
                  {label}
                </li>
              ))}
              <li className="flex items-center gap-3 hover:text-white cursor-pointer transition-colors group">
                <div className="w-7 h-7 border border-[#FF0055] rounded-md text-[#FF0055] flex items-center justify-center group-hover:bg-[#FF0055] group-hover:text-white transition-colors">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </div>
                contato@custometro.caboco.tech
              </li>
            </ul>
          </div>
        </div>
      </footer>
    </main>
  );
}
