"use client";

import React, { useState } from 'react';
import { 
  Bell, 
  Search, 
  Menu, 
  ChevronDown, 
  Circle, 
  Power,
  Wallet,
  IndianRupee,
  Zap,
  Coffee,
  Volume2,
  VolumeX
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function Header({ setIsSidebarOpen }: { setIsSidebarOpen: (val: boolean) => void }) {
  const [isOpen, setIsOpen] = useState(true);
  const [isBusy, setIsBusy] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-6 bg-white border-b border-slate-100 shadow-sm backdrop-blur-md bg-white/90">
      {/* Search & Toggle Area */}
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 -ml-2 lg:hidden text-slate-500"
        >
          <Menu size={24} />
        </button>
        
        <div className="relative flex-1 hidden sm:block">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            placeholder="Search orders, menu, payments..." 
            className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2.5 pl-10 pr-4 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
          />
        </div>
      </div>

      {/* Action Area */}
      <div className="flex items-center gap-3">
        {/* Wallet Display - NEW */}
        <Link 
          href="/wallet"
          className="hidden md:flex items-center gap-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 rounded-xl px-4 py-2 transition-all group"
        >
          <div className="w-7 h-7 bg-emerald-500 rounded-lg flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
             <Wallet size={16} />
          </div>
          <div className="flex flex-col">
             <span className="text-[8px] font-black uppercase tracking-widest text-emerald-600 leading-none mb-0.5 whitespace-nowrap">Wallet Balance</span>
             <span className="text-xs font-black text-slate-800 leading-none">₹14,560.00</span>
          </div>
        </Link>
        
        {/* Store Status Toggle */}
        <div className="flex items-center gap-2 mr-2 border-r border-slate-100 pr-4">
          <div className="hidden md:block text-right mr-2">
            <div className={`text-[9px] font-black uppercase tracking-widest ${isOpen ? 'text-primary' : 'text-slate-400'}`}>Store Status</div>
            <div className="text-[10px] font-bold text-slate-500 uppercase">{isOpen ? 'Accepting Orders' : 'Offline'}</div>
          </div>
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className={`relative w-12 h-6 rounded-full transition-all duration-300 p-1 flex items-center ${isOpen ? 'bg-primary' : 'bg-slate-200'}`}
          >
            <motion.div 
              layout
              className="w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-lg"
              animate={{ x: isOpen ? 24 : 0 }}
            >
              {isOpen ? <Power size={8} className="text-primary font-bold" /> : <div className="w-1.5 h-1.5 bg-slate-300 rounded-full" />}
            </motion.div>
            {isOpen && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-primary rounded-full animate-ping border border-white" />
            )}
          </button>
        </div>

        {/* Busy Mode Toggle - NEW */}
        <div className="flex items-center gap-2 mr-2 border-r border-slate-100 pr-4 ml-1">
          <div className="hidden lg:block text-right mr-2">
            <div className={`text-[9px] font-black uppercase tracking-widest ${isBusy ? 'text-amber-500' : 'text-emerald-500'}`}>{isBusy ? 'Busy Mode' : 'Standard'}</div>
            <div className="text-[10px] font-bold text-slate-500 uppercase">{isBusy ? 'Slower Prep' : 'Fast Prep'}</div>
          </div>
          <button 
            onClick={() => setIsBusy(!isBusy)}
            className={`relative w-12 h-6 rounded-full transition-all duration-300 p-1 flex items-center group ${isBusy ? 'bg-amber-500 shadow-lg shadow-amber-500/20' : 'bg-emerald-500 shadow-lg shadow-emerald-500/20'}`}
          >
            <motion.div 
              layout
              className="w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-lg"
              animate={{ x: isBusy ? 24 : 0 }}
            >
              {isBusy ? <Zap size={8} className="text-amber-500 font-bold" /> : <Coffee size={8} className="text-emerald-500 font-bold" />}
            </motion.div>
          </button>
        </div>

        {/* Sound Alert Toggle - NEW */}
        <div className="flex items-center gap-2 mr-4 ml-1">
          <button 
            onClick={() => setIsMuted(!isMuted)}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isMuted ? 'bg-red-50 text-red-500 border border-red-100' : 'bg-emerald-50 text-emerald-500 border border-emerald-100'} hover:scale-105 active:scale-95`}
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
        </div>

        {/* Notifications */}
        <button className="relative w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-500 hover:text-primary hover:bg-primary/5 transition-all group">
          <Bell size={20} className="group-hover:animate-bounce" />
          <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white ring-2 ring-red-500/20" />
        </button>

        {/* Profile */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-100 ml-1 group cursor-pointer hover:bg-slate-50 p-1 px-2 rounded-xl transition-all">
          <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden">
            <div className="w-full h-full bg-gradient-to-tr from-primary/10 to-primary/40 flex items-center justify-center text-primary font-black text-xs italic">DB</div>
          </div>
          <div className="hidden sm:block text-left">
            <h4 className="text-xs font-black text-slate-800 leading-none">Admin Partner</h4>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Digital Book of India</span>
          </div>
          <ChevronDown size={14} className="text-slate-400 group-hover:rotate-180 transition-transform" />
        </div>
      </div>
    </header>
  );
}
