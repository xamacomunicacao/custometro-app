"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  const menuLinks = [
    { name: "Início", href: "/" },
    { name: "Quem somos", href: "/quem-somos" },
    { name: "CEAP'S", href: "/#ceaps" },
    { name: "Parlamentares", href: "/parlamentares" },
    { name: "Metodologia", href: "/metodologia" }
  ];

  return (
    <>
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full absolute top-0 left-0 z-50 flex items-center justify-between text-white"
        style={{ height: "90px", paddingRight: "40px" }}
      >
        {/* ===== LOGO + TV SHAPE (Asset Único Consolidado) ===== */}
        <div className="relative shrink-0 flex items-center" style={{ width: "240px", height: "90px" }}>
          <Link href="/" className="relative z-10 flex items-center h-full pl-[20px] md:pl-[40px]">
            {/* Logo responsivo: menor no mobile, maior no desktop */}
            <div className="relative w-[130px] h-[130px] md:w-[230px] md:h-[230px]" style={{ marginTop: "-40px", marginLeft: "-10px" }}>
              <Image
                src="/logo-completa.png"
                alt="Blink TV Logo"
                fill
                className="object-contain drop-shadow-lg hover:scale-105 transition-transform duration-300"
              />
            </div>
          </Link>
        </div>

        {/* ===== MENU DESKTOP ===== */}
        <div className="hidden md:flex items-center gap-7 text-[14px] font-medium tracking-wide ml-8">
          <Link
            href="/"
            className="relative text-accent font-semibold pb-1"
          >
            Início
            <span
              className="absolute bottom-0 left-0 w-full h-[2px] rounded-full"
              style={{ backgroundColor: "#FF0055" }}
            />
          </Link>
          <Link
            href="/quem-somos"
            className="text-gray-200 hover:text-accent transition-colors pb-1 border-b-2 border-transparent hover:border-accent"
          >
            Quem somos
          </Link>
          <Link
            href="/#ceaps"
            className="text-gray-200 hover:text-accent transition-colors pb-1 border-b-2 border-transparent hover:border-accent"
          >
            CEAP&apos;S
          </Link>
          <Link
            href="/parlamentares"
            className="text-gray-200 hover:text-accent transition-colors pb-1 border-b-2 border-transparent hover:border-accent"
          >
            Parlamentares
          </Link>
          <Link
            href="/metodologia"
            className="text-gray-200 hover:text-accent transition-colors pb-1 border-b-2 border-transparent hover:border-accent"
          >
            Metodologia
          </Link>
          <span className="text-gray-500 text-lg font-light px-1">|</span>
          <button className="text-white hover:text-accent transition-colors hover:scale-110">
            <Search size={18} strokeWidth={2.2} />
          </button>
        </div>

        {/* ===== BOTÃO HAMBÚRGUER MOBILE ===== */}
        <div className="flex md:hidden items-center gap-4">
          <button className="text-white hover:text-accent transition-colors">
            <Search size={20} strokeWidth={2.2} />
          </button>
          <button
            onClick={toggleMenu}
            className="text-white hover:text-accent transition-colors focus:outline-none"
            aria-label="Toggle Menu"
          >
            {isOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </motion.nav>

      {/* ===== MENU OVERLAY MOBILE ===== */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
            className="fixed inset-y-0 right-0 z-40 w-[280px] bg-[#1C2331]/95 backdrop-blur-md border-l border-white/10 shadow-2xl flex flex-col p-8 pt-28 md:hidden"
          >
            <div className="flex flex-col gap-6 text-[18px] font-semibold tracking-wide">
              {menuLinks.map((link, idx) => (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.08 }}
                  key={link.name}
                >
                  <Link
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="text-gray-100 hover:text-accent transition-colors flex items-center py-2 border-b border-white/5"
                  >
                    {link.name}
                  </Link>
                </motion.div>
              ))}
            </div>
            
            <div className="mt-auto text-center text-xs text-gray-400">
              <p>© 2026 Custômetro</p>
              <p>Blink TV & Cynthia Blink</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
