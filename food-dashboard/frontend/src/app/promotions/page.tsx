"use client";

import React, { useState } from 'react';
import { 
  Plus, 
  Ticket, 
  Trash2, 
  Clock, 
  CheckCircle2, 
  Zap, 
  Divide, 
  ArrowRight,
  TrendingUp,
  Tag,
  X,
  Calendar,
  Gift
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MOCK_COUPONS = [
  { id: 1, code: 'DBISAVE50', type: 'Percentage', value: 50, status: 'Active', usage: 124, expiry: '05 Apr, 2026' },
  { id: 2, code: 'WELCOME75', type: 'Flat Off', value: 75, status: 'Active', usage: 86, expiry: '10 Apr, 2026' },
  { id: 3, code: 'LUNCHDEAL', type: 'BOGO', value: '1+1', status: 'Scheduled', usage: 0, expiry: '15 Apr, 2026' },
];

export default function PromotionsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-10 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight italic uppercase italic">Coupons & Campaigns</h2>
          <p className="text-sm font-semibold text-slate-400 mt-1 uppercase tracking-tighter italic font-bold">Drive more orders with lightning deals and discounts</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary text-white px-8 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-primary/90 transition-all flex items-center gap-2 shadow-lg shadow-primary/20 active:scale-95"
        >
          <Plus size={18} /> Create Coupon
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Campaigns Summary Section */}
        <div className="lg:col-span-1 space-y-8">
           <motion.div 
             initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
             className="bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl"
           >
              <div className="absolute top-0 right-0 p-10 opacity-10 rotate-12 scale-150"><Zap size={100} /></div>
              <div className="relative space-y-6">
                 <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-white/40 italic">Active Campaigns</h4>
                    <p className="text-4xl font-black italic tracking-tighter">03 <span className="text-sm font-bold text-emerald-400 not-italic ml-2">+2 New This Week</span></p>
                 </div>
                 <div className="pt-6 border-t border-white/10 space-y-4">
                    <div className="flex justify-between items-center text-xs font-black italic uppercase tracking-widest">
                       <span className="text-white/40">Total Savings Generated</span>
                       <span className="text-emerald-400">₹12,450.00</span>
                    </div>
                    <div className="flex justify-between items-center text-xs font-black italic uppercase tracking-widest">
                       <span className="text-white/40">Conversion Rate</span>
                       <span className="text-primary">+18.5%</span>
                    </div>
                 </div>
              </div>
           </motion.div>

           <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm space-y-8">
              <div className="flex items-center gap-2">
                 <Gift className="text-primary" size={20} />
                 <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 italic">Promotional Tips</h3>
              </div>
              <div className="space-y-4">
                 <p className="text-[10px] font-bold text-slate-400 leading-relaxed uppercase tracking-tighter italic border-l-2 border-primary/20 pl-4">"BOGO deals on Desserts usually increase the Average Order Value by 25% during Sundays."</p>
                 <button className="w-full py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary hover:bg-primary/5 transition-all">View Analytics Insight</button>
              </div>
           </div>
        </div>

        {/* Coupons List Section */}
        <div className="lg:col-span-2 space-y-6">
           <AnimatePresence mode="popLayout">
              {MOCK_COUPONS.map((coupon, idx) => (
                 <motion.div
                   layout
                   initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                   transition={{ delay: idx * 0.1 }}
                   key={coupon.id}
                   className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm relative group overflow-hidden hover:border-primary/20 transition-all cursor-pointer"
                 >
                    {/* Visual Coupon Notch Simulation */}
                    <div className="absolute top-1/2 -left-3 w-6 h-6 bg-slate-50 border border-slate-100 rounded-full -translate-y-1/2" />
                    <div className="absolute top-1/2 -right-3 w-6 h-6 bg-slate-50 border border-slate-100 rounded-full -translate-y-1/2" />

                    <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                       <div className="flex items-center gap-6 w-full md:w-auto">
                          <div className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center font-black italic shadow-lg ${
                             coupon.type === 'Percentage' ? 'bg-primary text-white shadow-primary/20' : 
                             coupon.type === 'Flat Off' ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 
                             'bg-amber-500 text-white shadow-amber-500/20'
                          }`}>
                             <span className="text-lg">{coupon.value}{coupon.type === 'Percentage' ? '%' : ''}</span>
                             <span className="text-[7px] uppercase tracking-widest leading-none">OFF</span>
                          </div>
                          
                          <div className="space-y-1">
                             <div className="flex items-center gap-2">
                                <span className="px-3 py-1 bg-slate-900 text-white rounded-lg text-[10px] font-black tracking-widest uppercase italic">{coupon.code}</span>
                                <span className={`text-[9px] font-black uppercase tracking-widest ${coupon.status === 'Active' ? 'text-emerald-500' : 'text-amber-500'}`}>• {coupon.status}</span>
                             </div>
                             <h4 className="text-sm font-black text-slate-800 italic uppercase italic mt-1">{coupon.type} Discount Offer</h4>
                             <div className="flex items-center gap-4 text-slate-400">
                                <div className="flex items-center gap-1"><TrendingUp size={12} /><span className="text-[10px] font-bold">{coupon.usage} Times Used</span></div>
                                <div className="flex items-center gap-1 border-l border-slate-100 pl-4"><Clock size={12} /><span className="text-[10px] font-bold italic">Until {coupon.expiry}</span></div>
                             </div>
                          </div>
                       </div>

                       <div className="flex items-center gap-3 w-full md:w-auto">
                          <button className="flex-1 md:flex-none py-3 px-6 rounded-xl border border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-red-500 hover:bg-red-50 hover:border-red-100 transition-all"><Trash2 size={16} /></button>
                          <button className="flex-1 md:flex-none py-3 px-8 rounded-xl bg-slate-50 border border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-800 hover:bg-slate-900 hover:text-white transition-all shadow-sm">Config Layer</button>
                       </div>
                    </div>
                 </motion.div>
              ))}
           </AnimatePresence>
        </div>
      </div>

      {/* Modern Creation Modal */}
      <AnimatePresence>
         {isModalOpen && (
           <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
              <motion.div 
                 initial={{ opacity: 0, scale: 0.95, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 30 }}
                 className="relative bg-white w-full max-w-xl rounded-[3rem] p-10 shadow-2xl overflow-hidden"
              >
                 <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-amber-500" />
                 <div className="flex justify-between items-center mb-10">
                    <div>
                       <h3 className="text-2xl font-black text-slate-800 italic uppercase">Launch Offer</h3>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Configure your promotional rules below</p>
                    </div>
                    <button onClick={() => setIsModalOpen(false)} className="p-2.5 border border-slate-100 rounded-2xl text-slate-400 hover:bg-slate-50"><X size={20} /></button>
                 </div>

                 <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Campaign Code</label>
                          <input type="text" placeholder="e.g., LUNCH40" className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs font-black focus:ring-4 focus:ring-primary/5 focus:outline-none transition-all" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Discount Type</label>
                          <select className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs font-black focus:outline-none transition-all">
                             <option>Percentage (%)</option>
                             <option>Flat Off (₹)</option>
                             <option>Free Item (BOGO)</option>
                          </select>
                       </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Value</label>
                          <input type="number" placeholder="e.g., 50" className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs font-black focus:outline-none transition-all" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Minimum Bill Value</label>
                          <input type="number" placeholder="₹499" className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs font-black focus:outline-none transition-all" />
                       </div>
                    </div>

                    <div className="pt-6">
                       <button className="w-full py-5 bg-slate-900 text-white rounded-[2rem] text-xs font-black uppercase tracking-[0.2em] shadow-2xl shadow-slate-900/20 active:scale-95 transition-all flex items-center justify-center gap-3">
                          <Zap size={18} className="text-primary" /> Activate Campaign Now
                       </button>
                    </div>
                 </div>
              </motion.div>
           </div>
         )}
      </AnimatePresence>
    </div>
  );
}
