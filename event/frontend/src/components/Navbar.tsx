"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 px-4 md:px-8 py-4 flex items-center justify-between bg-white/90 backdrop-blur-md border-b border-sky-100 shadow-sm">
      <Link href="/" className="flex items-center gap-3 group cursor-pointer">
        <div className="relative">
          <div className="absolute -inset-1 bg-sky-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-500" />
          <img 
            src="/assets/DLOGO1.png" 
            alt="Digital Book of India" 
            className="relative h-14 md:h-16 w-auto object-contain p-1 transition-transform group-hover:scale-105" 
          />
        </div>
        <div className="flex flex-col">
          <span className="text-slate-900 text-xs font-black tracking-[0.2em] uppercase leading-none mb-0.5">Digital Book</span>
          <span className="text-sky-600 text-[10px] font-bold uppercase tracking-widest leading-none">Of India</span>
        </div>
      </Link>
      
      <div className="hidden lg:flex items-center gap-8 mr-auto ml-12">
        <Link href="/" className="text-slate-600 hover:text-sky-600 font-bold transition-colors text-sm uppercase tracking-wider">Home</Link>
        <Link href="/about" className="text-slate-600 hover:text-sky-600 font-bold transition-colors text-sm uppercase tracking-wider">About Us</Link>
        <Link href="/contact" className="text-slate-600 hover:text-sky-600 font-bold transition-colors text-sm uppercase tracking-wider">Contact</Link>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <Link href="/apply/investor" className="text-slate-700 hover:text-sky-600 text-sm md:text-base font-bold px-4 py-2 hover:bg-sky-50 rounded-full transition-all tracking-wide">
          Investor
        </Link>
        <Link href="/apply/business" className="bg-sky-600 hover:bg-sky-500 text-white font-black text-sm md:text-base px-6 py-2.5 md:px-8 md:py-2.5 rounded-full shadow-lg shadow-sky-200 transition-all hover:scale-105 active:scale-95 border border-sky-400/30 tracking-wide uppercase">
          Business
        </Link>
      </div>
    </nav>
  );
}
