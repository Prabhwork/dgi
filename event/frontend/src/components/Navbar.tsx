"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "About Us", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <>
      <nav className="fixed top-0 w-full z-[100] px-4 md:px-8 py-4 flex items-center justify-between bg-white/90 backdrop-blur-md border-b border-sky-100 shadow-sm">
        <Link href="/" className="flex items-center gap-3 group cursor-pointer z-[101]">
          <div className="relative">
            <div className="absolute -inset-1 bg-sky-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-500" />
            <img 
              src="/assets/DLOGO1.png" 
              alt="Digital Book of India" 
              className="relative h-12 md:h-16 w-auto object-contain p-1 transition-transform group-hover:scale-105" 
            />
          </div>
          <div className="flex flex-col">
            <span className="text-slate-900 text-[10px] md:text-xs font-black tracking-[0.2em] uppercase leading-none mb-0.5">Digital Book</span>
            <span className="text-sky-600 text-[8px] md:text-[10px] font-bold uppercase tracking-widest leading-none">Of India</span>
          </div>
        </Link>
        
        {/* Desktop Links */}
        <div className="hidden lg:flex items-center gap-8 mr-auto ml-12">
          {navLinks.map((link) => (
            <Link key={link.name} href={link.href} className="text-slate-600 hover:text-sky-600 font-bold transition-colors text-sm uppercase tracking-wider">
              {link.name}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <div className="hidden sm:flex items-center gap-2 md:gap-4">
            <Link href="/apply/investor" className="text-slate-700 hover:text-sky-600 text-sm md:text-base font-bold px-4 py-2 hover:bg-sky-50 rounded-full transition-all tracking-wide">
              Investor
            </Link>
            <Link href="/apply/business" className="bg-sky-600 hover:bg-sky-500 text-white font-black text-sm md:text-base px-6 py-2.5 md:px-8 md:py-2.5 rounded-full shadow-lg shadow-sky-200 transition-all hover:scale-105 active:scale-95 border border-sky-400/30 tracking-wide uppercase">
              Business
            </Link>
          </div>

          {/* Mobile Toggle */}
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 text-slate-900 hover:bg-slate-100 rounded-xl transition-colors z-[101]"
          >
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-[90] bg-white pt-24 px-6 lg:hidden flex flex-col justify-between pb-12"
          >
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link 
                  key={link.name} 
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="text-xl font-black italic uppercase tracking-tighter text-slate-900 border-b border-slate-50 pb-4"
                >
                  {link.name}
                </Link>
              ))}
            </div>

            <div className="flex flex-col gap-4">
              <Link 
                href="/apply/investor" 
                onClick={() => setIsOpen(false)}
                className="w-full text-center py-4 rounded-2xl border-2 border-slate-100 font-black italic text-slate-900 uppercase tracking-tighter"
              >
                Investor Registration
              </Link>
              <Link 
                href="/apply/business" 
                onClick={() => setIsOpen(false)}
                className="w-full text-center py-4 rounded-2xl bg-sky-600 text-white font-black italic uppercase tracking-tighter shadow-xl shadow-sky-100"
              >
                Business Registration
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
