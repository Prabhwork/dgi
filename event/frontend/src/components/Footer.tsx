"use client";

import React from "react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="pt-12 md:pt-24 pb-8 md:pb-12 bg-[#020617] text-white border-t border-white/5 relative overflow-hidden">
      {/* Decorative Dots Grid - Same as About Us sections */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
      
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12 relative z-10">
        <div className="col-span-1 md:col-span-2">
          <Link href="/" className="flex items-center gap-3 mb-6 group">
            <img src="/assets/DLOGO.png" alt="Digital Book of India" className="h-14 w-auto object-contain" />
            <div className="flex flex-col text-left">
              <span className="text-white text-xs font-black tracking-[0.2em] uppercase leading-none mb-0.5">Digital Book</span>
              <span className="text-sky-400 text-[10px] font-bold uppercase tracking-widest leading-none">Of India</span>
            </div>
          </Link>
          <p className="text-slate-400 max-w-sm mb-6 font-medium italic">
            Connecting India's verified business ecosystem with strategic investors. Empowering the next generation of Indian enterprise.
          </p>
        </div>
        
        <div>
          <h4 className="text-sky-400 font-black uppercase tracking-widest text-[10px] mb-4 md:mb-8">Platform</h4>
          <ul className="space-y-4">
            <li><Link href="/about" className="text-slate-400 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest">About Us</Link></li>
            <li><Link href="/contact" className="text-slate-400 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest">Contact Us</Link></li>
            <li><Link href="/apply/business" className="text-slate-400 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest">Register Business</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sky-400 font-black uppercase tracking-widest text-[10px] mb-4 md:mb-8">Legal</h4>
          <ul className="space-y-4">
            <li><Link href="/privacy" className="text-slate-400 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest">Privacy Policy</Link></li>
            <li><Link href="/terms" className="text-slate-400 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest">Terms & Conditions</Link></li>
          </ul>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 mt-10 md:mt-20 pt-8 border-t border-white/5 text-center relative z-10">
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">
          © {new Date().getFullYear()} DBI Invest Connect • Digital Bharat Initiative
        </p>
      </div>
    </footer>
  );
}
