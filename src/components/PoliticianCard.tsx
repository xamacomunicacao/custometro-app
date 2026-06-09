"use client";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Politico } from "@/services/api";

interface PoliticianCardProps {
  politico: Politico;
}

export default function PoliticianCard({ politico }: PoliticianCardProps) {
  // Format currency
  const formattedValue = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(politico.totalGastoMes || 0);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, boxShadow: "0 12px 30px rgba(0,0,0,0.08)" }}
      className="bg-white rounded-[12px] shadow-[0_4px_20px_rgba(0,0,0,0.04)] overflow-hidden flex flex-col items-center p-6 pt-8 border-t-[8px] border-[#FF0055] relative w-full border border-gray-100"
    >
      {/* Star Icon */}
      <div className="absolute top-3 flex items-center justify-center">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FF0055" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-sm">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
        </svg>
      </div>

      {/* Photo */}
      <div className="mt-4 mb-4 w-[110px] h-[110px] bg-black rounded-[8px] overflow-hidden relative shadow-md">
        <Image 
          src={politico.fotoUrl} 
          alt={`Foto de ${politico.nome}`} 
          fill 
          className="object-cover"
        />
      </div>

      {/* Name */}
      <h3 className="text-gray-500 font-bold text-[12px] tracking-wide mb-2 uppercase text-center">{politico.nome}</h3>

      {/* Value */}
      <div className="text-[22px] font-black text-[#1C2331] mb-1 tracking-tight">
        {formattedValue}
      </div>

      {/* Date Context */}
      <div className="text-[#FF0055] text-[12px] font-bold mb-6 tracking-wide capitalize">
        Em {new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(new Date())}
      </div>

      {/* Button */}
      <Link 
        href={`/${
          politico.cargo.toLowerCase().includes('senador') ? 'senado' : 
          politico.cargo.toLowerCase().includes('federal') ? 'deputados-federais' : 
          politico.cargo.toLowerCase().includes('vereador') ? 'camara-municipal' : 
          'deputados-estaduais'
        }/${politico.id}`} 
        className="w-full"
      >
        <motion.button 
          whileHover={{ backgroundColor: "rgba(255, 0, 85, 0.05)", borderColor: "#FF0055" }}
          whileTap={{ scale: 0.97 }}
          className="w-full border border-[#FF0055] text-[#FF0055] rounded-[4px] py-2 text-[12px] font-bold tracking-wide transition-all bg-white cursor-pointer"
        >
          Conferir &gt;&gt;
        </motion.button>
      </Link>
    </motion.div>
  );
}
