"use client";
import Navbar from "@/components/Navbar";
import Image from "next/image";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import ScrollVideo from "@/components/ScrollVideo";

/* ======= Componente do Gráfico de Pizza Animado (Interativo) ======= */
function AnimatedPieChart({ data }: { data: { name: string; value: number; color: string }[] }) {
  const [hoveredSlice, setHoveredSlice] = useState<number | null>(null);

  const cx = 200;
  const cy = 160;
  const r = 90;

  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  };

  const getPiePath = (startAngle: number, endAngle: number) => {
    // Caso seja 100%
    if (endAngle - startAngle >= 360) {
       return `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx - 0.01} ${cy - r} Z`;
    }
    const start = polarToCartesian(cx, cy, r, endAngle);
    const end = polarToCartesian(cx, cy, r, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    return [
      "M", cx, cy,
      "L", start.x, start.y,
      "A", r, r, 0, largeArcFlag, 0, end.x, end.y,
      "Z"
    ].join(" ");
  };

  const totalValue = data.reduce((acc, curr) => acc + curr.value, 0) || 1;
  let currentAngle = 0;
  
  const slices = data.map((item, idx) => {
    const angle = (item.value / totalValue) * 360;
    const start = currentAngle;
    const end = currentAngle + angle;
    currentAngle += angle;
    return { id: idx, start, end, ...item };
  });

  return (
    <div className="relative w-full max-w-[420px] mx-auto mt-6 mb-2" style={{ aspectRatio: "4/3" }}>
      <svg viewBox="0 0 400 300" className="w-full h-full drop-shadow-md overflow-visible">
        {slices[0] && (
          <>
            <polyline points="135,115 80,115" fill="none" stroke="#CBD5E1" strokeWidth="1.5" />
            <text x="75" y="105" fontSize="10" fill="#64748b" fontWeight="500" textAnchor="end">{slices[0].name.split(' ').slice(0,2).join(' ')}</text>
            <text x="75" y="119" fontSize="11" fill="#1e293b" fontWeight="700" textAnchor="end">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(slices[0].value)}
            </text>
          </>
        )}
        {slices[1] && (
          <>
            <polyline points="190,70 190,45 150,45" fill="none" stroke="#CBD5E1" strokeWidth="1.5" />
            <text x="145" y="32" fontSize="10" fill="#64748b" fontWeight="500" textAnchor="middle">{slices[1].name.split(' ').slice(0,2).join(' ')}</text>
            <text x="145" y="46" fontSize="11" fill="#1e293b" fontWeight="700" textAnchor="middle">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(slices[1].value)}
            </text>
          </>
        )}
        {slices[2] && (
          <>
            <polyline points="265,225 265,260 290,260" fill="none" stroke="#CBD5E1" strokeWidth="1.5" />
            <text x="300" y="254" fontSize="10" fill="#64748b" fontWeight="500" textAnchor="start">{slices[2].name.split(' ').slice(0,2).join(' ')}</text>
            <text x="300" y="268" fontSize="11" fill="#1e293b" fontWeight="700" textAnchor="start">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(slices[2].value)}
            </text>
          </>
        )}

        <g style={{ transformOrigin: "200px 160px" }}>
          {slices.map((slice) => {
            const isHovered = hoveredSlice === slice.id;
            return (
              <motion.path
                key={slice.id}
                d={getPiePath(slice.start, slice.end)}
                fill={slice.color}
                onMouseEnter={() => setHoveredSlice(slice.id)}
                onMouseLeave={() => setHoveredSlice(null)}
                animate={{
                  scale: isHovered ? 1.05 : 1,
                  filter: isHovered ? "brightness(1.15)" : "brightness(1)"
                }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                style={{ originX: "200px", originY: "160px", cursor: "pointer" }}
              />
            );
          })}
        </g>
      </svg>
    </div>
  );
}
const arrowVariants = {
  initial: { x: 0 },
  hover: { 
    x: 5, 
    transition: { 
      repeat: Infinity, 
      repeatType: "reverse", 
      duration: 0.5, 
      ease: "easeInOut" 
    } 
  }
} as const;

export default function Home() {
  const [selectedCargo, setSelectedCargo] = useState("Senador");
  const [topPoliticos, setTopPoliticos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const cargosData = [
    { id: 'Senador', label1: 'Senado', label2: '', path: '/senado' },
    { id: 'Deputado Federal', label1: 'Câmara dos', label2: 'Deputados', path: '/deputados-federais' },
    { id: 'Deputado Estadual', label1: 'Assembleia', label2: 'Legislativa', path: '/deputados-estaduais' },
    { id: 'Vereador', label1: 'Câmara', label2: 'Municipal', path: '/camara-municipal' },
  ];

  const colors = ["#4A65E6", "#B0E551", "#4A5568"];

  useEffect(() => {
    async function fetchTop() {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/politicos?cargo=${selectedCargo}`);
        const data = await res.json();
        setTopPoliticos(data.slice(0, 3));
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchTop();
  }, [selectedCargo]);

  const chartData = topPoliticos.map((p, idx) => ({
    name: p.nome,
    value: p.totalGastoMes || 0.01, // 0.01 se for 0 para não quebrar proporção do SVG
    color: colors[idx] || "#ccc"
  }));


  return (
    <main className="w-full min-h-screen bg-background font-sans overflow-x-hidden">
      <Navbar />

      {/* ===================== HERO SECTION ===================== */}
      {/* Wrapper com overflow hidden para recortar a TV lateralmente, e fundo transparente/branco para misturar com a próxima seção */}
      <div className="relative w-full z-10 overflow-hidden" style={{ paddingBottom: "180px" }}>

        {/* ===================== SVGS RESPONSIVOS DO HERO ===================== */}
        
        {/* --- VERSÃO MOBILE (< 768px) --- */}
        <div className="block md:hidden absolute inset-0 w-full h-full pointer-events-none">
          {/* Borda Rosa Mobile */}
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 375 800"
            preserveAspectRatio="none"
            style={{ zIndex: 1 }}
          >
            <path
              d="M0,0 L375,0 L375,530 Q375,590 315,622 L100,736.7 Q0,790 0,690 Z"
              fill="#FF0055"
            />
          </svg>
          {/* Fundo Azul Mobile */}
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 375 800"
            preserveAspectRatio="none"
            style={{ zIndex: 2 }}
          >
            <path
              d="M0,0 L375,0 L375,500 Q375,560 315,592 L100,706.7 Q0,760 0,660 Z"
              fill="#1C2331"
            />
          </svg>
        </div>

        {/* --- VERSÃO DESKTOP (>= 768px) --- */}
        <div className="hidden md:block absolute inset-0 w-full h-full pointer-events-none">
          {/* Borda Rosa Desktop */}
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 1440 860"
            preserveAspectRatio="none"
            style={{ zIndex: 1 }}
          >
            <path
              d="M0,0 L1440,0 L1440,509 Q1440,609 1340,627 L100,850 Q0,868 0,768 Z"
              fill="#FF0055"
            />
          </svg>
          {/* Fundo Azul Desktop */}
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 1440 860"
            preserveAspectRatio="none"
            style={{ zIndex: 2 }}
          >
            <path
              d="M0,0 L1440,0 L1440,499 Q1440,599 1340,614 L100,800 Q0,815 0,715 Z"
              fill="#1C2331"
            />
          </svg>
        </div>

        {/* TV GIGANTE TRANSLÚCIDA — Espelhada (scaleX(-1)) e posicionada perfeitamente no canto direito */}
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
          className="absolute pointer-events-none"
          style={{
            top: "-5%",
            right: "-8%",
            width: "65%",
            maxWidth: "950px",
            opacity: 0.15,
            transform: "scaleX(-1) rotate(-15deg)",
            zIndex: 3,
          }}
        >
          <Image
            src="/Shape logo 02.png"
            alt="TV Shape Decorativa"
            width={1000}
            height={1000}
            className="w-full h-auto object-contain"
          />
        </motion.div>

        {/* CONTEÚDO HERO — fica acima de tudo */}
        <div className="relative z-20 pt-36 pb-20 px-6 md:px-16 max-w-5xl mx-auto">
          {/* Dots decorativos — lado esquerdo */}
          <div className="absolute left-[20px] top-[145px] opacity-25 hidden md:block pointer-events-none">
            <svg width="40" height="160" viewBox="0 0 40 160">
              <pattern id="hero-dots" x="0" y="0" width="12" height="12" patternUnits="userSpaceOnUse">
                <circle fill="#ffffff" cx="2" cy="2" r="1.8" />
              </pattern>
              <rect x="0" y="0" width="40" height="160" fill="url(#hero-dots)" />
            </svg>
          </div>

          <div className="pl-0 md:pl-14">
            <motion.p
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}
              className="text-gray-300 font-semibold text-[18px] mb-2 tracking-wide"
            >
              Bem vindo ao
            </motion.p>

            {/* Título CUSTÔMETRO com tamanho responsivo para evitar quebra no mobile */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.6 }}
              className="font-heading font-black tracking-tight leading-none mb-5"
              style={{ fontSize: "clamp(2.5rem, 8vw, 7.5rem)" }}
            >
              <span style={{ color: "#FF0055" }}>CU</span>
              <span style={{ color: "#ffffff", fontWeight: 900 }}>$</span>
              <span style={{ color: "#FF0055" }}>TÔMETRO</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.5 }}
              className="text-gray-300 text-[14px] leading-relaxed mb-9 max-w-[480px]"
            >
              Aqui você fica por dentro dos valores gastos pelos políticos do Amazonas de forma&nbsp;
              transparente, com dados atualizados em real time.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.5 }}
              className="flex flex-wrap gap-4"
            >
              <Link href="/quem-somos">
                <motion.button
                  whileHover="hover"
                  initial="initial"
                  whileTap={{ scale: 0.96 }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                  className="px-6 py-2.5 border border-white/40 rounded text-[13px] font-medium text-white transition-all duration-300 flex items-center gap-1.5 hover:border-[#FF0055] hover:bg-[#FF0055]/10 hover:shadow-[0_0_15px_rgba(255,0,85,0.3)]"
                >
                  <span>Quem somos</span>
                  <motion.span variants={arrowVariants} className="inline-block font-bold">
                    &gt;&gt;
                  </motion.span>
                </motion.button>
              </Link>
              <motion.button
                whileHover={{ scale: 1.03, y: -2, borderColor: "#FF0055", backgroundColor: "rgba(255, 0, 85, 0.1)", boxShadow: "0 0 15px rgba(255, 0, 85, 0.3)" }}
                whileTap={{ scale: 0.96 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                className="px-6 py-2.5 border border-white/40 rounded text-[13px] font-medium text-white transition-all duration-300"
              >
                O que é a CEAP?
              </motion.button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ===================== ACESSE AQUI AS CEAP'S + Gráfico ===================== */}
      <section id="ceaps" className="max-w-7xl mx-auto px-6 md:px-16 py-20 relative overflow-visible z-10">
        {/* Marca d'água de Sólido Cinza Retangular Diagonal de Fundo (com dimensões responsivas) */}
        <div 
          className="absolute pointer-events-none rounded-[80px] top-[140px] md:top-[245px] left-[-20px] w-[115vw] h-[85%] md:h-[460px]"
          style={{
            backgroundColor: "#F4F6F9",
            transform: "rotate(-11deg)",
            transformOrigin: "left center",
            zIndex: -1,
            opacity: 0.9
          }}
        ></div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_1.1fr] gap-12 items-center">
           <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
             <p className="text-[#FF0055] font-light text-[15px] mb-2 tracking-wide">Transparência absoluta</p>
             <h2 className="text-[2.6rem] md:text-[3rem] leading-[1.05] font-black text-[#1C2331] mb-6 tracking-tight">ACESSE AQUI AS CEAP&apos;S</h2>
             <p className="text-gray-500 text-[13px] mb-12 leading-relaxed max-w-[340px]">
               Aqui você encontra informações oficiais sobre as verbas de cada casa legislativa, de forma clara e acessível para todos os cidadãos.
             </p>
             
             <div id="parlamentares" className="grid grid-cols-2 gap-4 max-w-[340px] scroll-mt-32">
                {cargosData.map((c) => {
                  const isActive = selectedCargo === c.id;
                  return (
                    <motion.button
                      key={c.id}
                      onClick={() => setSelectedCargo(c.id)}
                      whileHover={{ 
                        scale: 1.03, 
                        y: -3,
                        boxShadow: "0px 12px 28px rgba(255, 0, 85, 0.5)",
                      }}
                      whileTap={{ scale: 0.97 }}
                      transition={{ type: "spring", stiffness: 400, damping: 15 }}
                      className={`w-full h-full text-white py-3.5 px-4 rounded-[12px] font-bold text-[14px] flex flex-col items-center justify-center leading-tight transition-colors duration-300 ${
                        isActive ? "bg-[#FF0055] shadow-[0_8px_20px_rgba(255,0,85,0.4)]" : "bg-[#2A2F3B] hover:bg-[#FF0055] hover:shadow-[0_8px_20px_rgba(255,0,85,0.4)]"
                      }`}
                    >
                      <span>{c.label1}</span>
                      {c.label2 && <span>{c.label2}</span>}
                    </motion.button>
                  );
                })}
             </div>
             
             {/* Ícone de dinheiro voando oficial (já contém o rastro pontilhado integrado na imagem) */}
             <div className="mt-6 ml-6 relative w-64 h-64 translate-y-12">
                <motion.div
                  animate={{
                    y: [0, -8, 0],
                    x: [0, 4, 0],
                    rotate: [0, -2, 2, -2, 0],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 6,
                    ease: "easeInOut"
                  }}
                  className="w-full h-full flex items-center justify-center"
                >
                  <Image
                    src="/ícone dinheiro voando.png"
                    alt="Dinheiro voando"
                    width={256}
                    height={256}
                    className="w-full h-full object-contain drop-shadow-md"
                  />
                </motion.div>
             </div>
           </motion.div>
           
           <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
              <div className="w-full md:w-[90%] ml-auto bg-white shadow-[0_30px_80px_rgba(0,0,0,0.08)] rounded-[24px] pt-12 pb-10 px-8 border border-gray-50 relative">
                  <h3 className="text-center font-bold text-[#1C2331] text-[20px] mb-8 leading-snug">Gráfico representativo de<br/>gastos parlamentares</h3>
                  
                  <div className="text-center mb-6 flex flex-col items-center">
                    <p className="text-[14px] font-bold text-gray-800 capitalize">Maiores Gastos - {new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(new Date())}</p>
                    <p className="text-[12px] text-gray-500 mb-2">{cargosData.find(c => c.id === selectedCargo)?.label1} {cargosData.find(c => c.id === selectedCargo)?.label2}</p>
                  </div>

                  {/* Ícone Superior Direito Rosa que agora é o link para a página completa */}
                  <Link href={cargosData.find(c => c.id === selectedCargo)?.path || "#"}>
                    <motion.div 
                      whileHover={{ scale: 1.1 }}
                      className="absolute right-8 top-16 bg-[#FF0055] text-white w-12 h-12 rounded-[10px] shadow-[0_8px_20px_rgba(255,0,85,0.3)] flex items-center justify-center cursor-pointer group" 
                      title="Ver Lista Completa"
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                      </svg>
                    </motion.div>
                  </Link>
                  
                  {/* Gráfico Pizza Animado e Interativo */}
                  <div className="relative min-h-[250px] flex items-center justify-center">
                    {isLoading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-10 rounded-full">
                        <div className="w-8 h-8 border-4 border-[#FF0055] border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                    
                    {!isLoading && chartData.length === 0 ? (
                      <div className="flex flex-col items-center justify-center text-gray-400">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-3 opacity-30">
                          <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                          <line x1="8" y1="21" x2="16" y2="21"></line>
                          <line x1="12" y1="17" x2="12" y2="21"></line>
                        </svg>
                        <p className="text-[14px] font-bold text-gray-500">Aguardando prestação</p>
                        <p className="text-[12px]">Nenhum gasto neste mês</p>
                      </div>
                    ) : (
                      <div className="w-full">
                        <AnimatedPieChart data={chartData} />
                        <div className="flex justify-center flex-wrap gap-x-6 gap-y-2 mt-10 text-[10px] font-bold text-gray-500">
                           {chartData.map((d, i) => (
                              <span key={i} className="flex items-center gap-2">
                                <div className="w-3.5 h-2.5 rounded-[2px]" style={{backgroundColor: d.color}}></div> 
                                {d.name.split(' ').slice(0, 2).join(' ')}
                              </span>
                           ))}
                        </div>
                      </div>
                    )}
                  </div>

                 {/* Carrossel Pointers */}
                 <div className="flex justify-center items-center gap-1.5 mt-6">
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-800"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
                 </div>
              </div>
           </motion.div>
        </div>
      </section>

      {/* ===================== Sobre a Idealizadora / Footer ===================== */}
      <footer className="w-full bg-[#2A2F3B] text-white pt-24 pb-16 px-6 md:px-16 relative z-20 overflow-hidden">
        {/* Grid de dots decorativos — lado direito */}
        <div className="absolute top-12 right-8 opacity-15 pointer-events-none hidden md:block">
          <svg width="80" height="200" viewBox="0 0 80 200">
            <pattern id="footer-dots" x="0" y="0" width="14" height="14" patternUnits="userSpaceOnUse">
              <circle fill="#ffffff" cx="2" cy="2" r="2" />
            </pattern>
            <rect x="0" y="0" width="80" height="200" fill="url(#footer-dots)" />
          </svg>
        </div>

        <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-16 relative z-10">
          
          {/* Esquerda: Cynthia Blink — Imagem Estática com Flutuação (dimensões responsivas) */}
          <div className="w-full md:w-1/3 flex justify-center md:justify-start">
             <div className="relative w-[270px] h-[340px] md:w-[300px] md:h-[380px]">
                {/* Quadrado Rosa de Fundo (deslocado) */}
                <motion.div 
                  initial={{ opacity: 0, x: -20, y: 20 }} whileInView={{ opacity: 1, x: 20, y: 30 }} transition={{ duration: 0.6 }} viewport={{ once: true }}
                  className="absolute top-0 right-0 w-full h-full bg-accent rounded-[20px]"
                ></motion.div>
                
                {/* Quadrado Branco na Frente */}
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.2 }} viewport={{ once: true }}
                  className="absolute top-0 left-0 w-full h-full bg-white rounded-[20px] shadow-[0_20px_50px_rgba(0,0,0,0.3)] z-10"
                ></motion.div>

                 {/* Vídeo Interativo de Cynthia com enquadramento responsivo */}
                 <motion.div
                   className="absolute z-20 pointer-events-none w-[155%] h-[130%] md:w-[165%] md:h-[135%]"
                   style={{
                     bottom: "0px",
                     left: "50%",
                     transform: "translateX(-50%)",
                   }}
                 >
                   <ScrollVideo />
                 </motion.div>
             </div>
          </div>

          {/* Direita: Textos Bio + Redes Sociais */}
          <div className="w-full md:w-2/3 flex flex-col justify-center pl-0 md:pl-10">
             <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} viewport={{ once: true }}>
                <p className="text-accent font-bold text-sm tracking-wide mb-1">Bastidores</p>
                <h2 className="text-4xl font-black text-white mb-6">Sobre a idealizadora</h2>
                <p className="text-[13px] text-gray-300 leading-relaxed mb-12 max-w-2xl text-justify">
                  Cynthia Blink é jornalista graduada pela Universidade Federal do Amazonas (UFAM). Em 2012, entrou na redação da então TV Cultura do Amazonas – atual TV Encontro das Águas. Em seguida entrou para o jornal A Crítica, depois jornal Diário do Amazonas, Portal Amazonas 1 e rádio Mix. Também trabalhou como assessora de imprensa da cantora amazonense Karine Aguiar na França. Atualmente Cynthia Blink é diretora executiva do portal de notícias Manaus 360º.
                </p>
             </motion.div>

             <div className="flex flex-col md:flex-row gap-16">
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }} viewport={{ once: true }}>
                  <h4 className="font-bold mb-4 text-[13px] text-gray-300 tracking-wide">Parcerias</h4>
                  {/* Logo Manaus 360 — imagem oficial */}
                  <div className="flex items-center gap-3 opacity-90 hover:opacity-100 transition-opacity cursor-pointer">
                     <Image
                       src="/Manaus 360.png"
                       alt="Manaus 360"
                       width={160}
                       height={50}
                       className="object-contain"
                     />
                  </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }} viewport={{ once: true }}>
                  <h4 className="font-bold mb-4 text-[13px] text-gray-200 tracking-wide">Continue bem informado</h4>
                  <ul className="space-y-4 text-[12px] text-gray-300 font-medium">
                    <li className="flex items-center gap-3 hover:text-white cursor-pointer transition-colors group">
                      <div className="w-7 h-7 border border-[#FF0055] rounded-md text-[#FF0055] flex items-center justify-center group-hover:bg-[#FF0055] group-hover:text-white transition-colors shadow-[0_0_10px_rgba(255,0,85,0.2)]">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                      </div> 
                      @cynthiablink
                    </li>
                    <li className="flex items-center gap-3 hover:text-white cursor-pointer transition-colors group">
                      <div className="w-7 h-7 border border-[#FF0055] rounded-md text-[#FF0055] flex items-center justify-center group-hover:bg-[#FF0055] group-hover:text-white transition-colors shadow-[0_0_10px_rgba(255,0,85,0.2)]">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.51a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15.2a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.63a8.35 8.35 0 0 0 4.93 1.59V6.77a4.81 4.81 0 0 1-1.17-.08z"/></svg>
                      </div> 
                      @cynthiablink360
                    </li>
                    <li className="flex items-center gap-3 hover:text-white cursor-pointer transition-colors group">
                      <div className="w-7 h-7 border border-[#FF0055] rounded-md text-[#FF0055] flex items-center justify-center group-hover:bg-[#FF0055] group-hover:text-white transition-colors shadow-[0_0_10px_rgba(255,0,85,0.2)]">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                      </div> 
                      Cynthia Pinheiro (Jornalista)
                    </li>
                    <li className="flex items-center gap-3 hover:text-white cursor-pointer transition-colors group">
                      <div className="w-7 h-7 border border-[#FF0055] rounded-md text-[#FF0055] flex items-center justify-center group-hover:bg-[#FF0055] group-hover:text-white transition-colors shadow-[0_0_10px_rgba(255,0,85,0.2)]">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                      </div> 
                      custometro@blinktv.com
                    </li>
                  </ul>
                </motion.div>
             </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
