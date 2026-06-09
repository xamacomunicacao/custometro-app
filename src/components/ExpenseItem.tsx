"use client";
import { motion } from "framer-motion";
import { Despesa } from "@/services/api";

interface ExpenseItemProps {
  despesa: Despesa;
}

export default function ExpenseItem({ despesa }: ExpenseItemProps) {
  const formattedValue = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(despesa.valor);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.005, boxShadow: "0 4px 15px rgba(0,0,0,0.03)" }}
      className="bg-white border border-[#FF0055] rounded-[6px] py-3 px-5 flex flex-col sm:flex-row justify-between items-center gap-4 mb-3 shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all w-full"
    >
      {/* Natureza da despesa */}
      <div className="text-[#1C2331] text-[13px] sm:text-[14px] font-bold flex-1 text-center sm:text-left leading-snug">
        {despesa.descricao}
      </div>
      
      {/* Valor formatado */}
      <div className="text-[#1C2331] font-bold text-[14px] sm:text-[15px] sm:text-right sm:pr-4 min-w-[140px] text-center tracking-tight">
        {formattedValue}
      </div>

      {/* Botão Consulte */}
      <motion.button
        whileHover={{ scale: 1.02, backgroundColor: "#ff1a6c" }}
        whileTap={{ scale: 0.98 }}
        className="bg-[#FF0055] text-white px-7 py-2 rounded-[4px] font-bold text-[13px] hover:bg-[#ff1a6c] transition-colors w-full sm:w-auto shadow-[0_3px_8px_rgba(255,0,85,0.2)] cursor-pointer"
      >
        Consulte
      </motion.button>
    </motion.div>
  );
}
