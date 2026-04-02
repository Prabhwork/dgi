"use client";

import React, { useState } from 'react';
import { 
  Wallet, 
  IndianRupee, 
  ArrowUpRight, 
  Download, 
  History, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  TrendingUp,
  Banknote,
  Navigation,
  ArrowDownToLine
} from 'lucide-react';
import { motion } from 'framer-motion';

const SETTLEMENTS = [
  { id: 'SET-1221', date: '02 Apr, 2026', amount: 8450, status: 'Completed', bank: 'HDFC Bank **** 4321' },
  { id: 'SET-1222', date: '01 Apr, 2026', amount: 4120, status: 'Completed', bank: 'HDFC Bank **** 4321' },
  { id: 'SET-1223', date: '31 Mar, 2026', amount: 6780, status: 'Completed', bank: 'HDFC Bank **** 4321' },
  { id: 'SET-1224', date: '30 Mar, 2026', amount: 5200, status: 'Processing', bank: 'HDFC Bank **** 4321' },
];

export default function WalletPage() {
  return (
    <div className="space-y-10 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Business Wallet</h2>
          <p className="text-sm font-semibold text-slate-400 mt-1">Manage your settlements and fund transfers</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="bg-white border border-slate-200 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm">
            <Download size={16} /> Get Tax Invoice
          </button>
          <button className="bg-primary text-white px-8 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-primary/90 transition-all flex items-center gap-2 shadow-lg shadow-primary/20 active:scale-95">
             Transfer to Bank
          </button>
        </div>
      </div>

      {/* Hero Balance Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl"
         >
            <div className="absolute top-0 right-0 p-12 opacity-5 rotate-12 scale-150"><Wallet size={200} /></div>
            <div className="relative space-y-10">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20 backdrop-blur-md">
                     <IndianRupee size={24} className="text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Current Redeemable Balance</h4>
                    <p className="text-xs font-bold text-emerald-400/80 mt-0.5">Ready for instant settlement</p>
                  </div>
               </div>
               
               <div className="flex flex-col md:flex-row items-baseline gap-10">
                  <div>
                    <span className="text-6xl font-black tracking-tighter">₹14,560<span className="opacity-40">.00</span></span>
                  </div>
                  <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-2xl flex items-center gap-3">
                     <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400"><TrendingUp size={16} /></div>
                     <span className="text-xs font-bold text-white/80">+24% vs last month</span>
                  </div>
               </div>

               <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-8 border-t border-white/10">
                  <div>
                     <p className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-1">Lifetime Earnings</p>
                     <p className="text-xl font-bold italic">₹4,25,890</p>
                  </div>
                  <div>
                     <p className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-1">Next Settlement</p>
                     <p className="text-xl font-bold italic">Tomorrow, 9 AM</p>
                  </div>
                  <div className="sm:text-right">
                     <p className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-1 italic">DBI Business Partner ID</p>
                     <p className="text-sm font-black tracking-widest text-primary">DBI-FOOD-4552</p>
                  </div>
               </div>
            </div>
         </motion.div>

         <motion.div 
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm flex flex-col justify-between group overflow-hidden relative"
         >
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-16 translate-x-16 blur-3xl group-hover:bg-primary/10 transition-colors" />
            <div className="space-y-8 relative">
               <div className="flex justify-between items-center">
                  <h4 className="text-sm font-black uppercase tracking-widest text-slate-800">Linked Bank</h4>
                  <Banknote className="text-primary" size={24} />
               </div>
               
               <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-4">
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center font-black text-xs text-slate-400">HDFC</div>
                     <div>
                        <p className="text-xs font-black text-slate-800 uppercase tracking-tighter">HDFC Savings Account</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">**** **** 4321</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-500 bg-emerald-50 w-fit px-2 py-0.5 rounded-lg border border-emerald-100">
                     <CheckCircle2 size={12} />
                     <span className="text-[9px] font-black uppercase tracking-widest">Verified</span>
                  </div>
               </div>

               <div className="space-y-3">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Self Payout</p>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                     <span>Next Transfer Limit</span>
                     <span className="text-primary">₹50,000</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                     <motion.div initial={{ width: 0 }} animate={{ width: "30%" }} className="h-full bg-primary" />
                  </div>
               </div>
            </div>

            <button className="mt-8 w-full py-4 rounded-2xl bg-slate-50 border border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary hover:bg-primary/5 transition-all">Change Bank Account</button>
         </motion.div>
      </div>

      {/* Settlement Records */}
      <div className="space-y-6">
         <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-3"><History size={20} className="text-primary" /> Settlement History</h3>
            <div className="flex gap-2">
               <button className="bg-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 border border-slate-100">Last 7 Days</button>
               <button className="bg-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 border border-slate-100">Filter By Status</button>
            </div>
         </div>

         <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                     <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Settlement ID</th>
                     <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Processed On</th>
                     <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Beneficiary Bank</th>
                     <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Amount</th>
                     <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Status</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {SETTLEMENTS.map((set) => (
                     <tr key={set.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-8 py-5 text-xs font-black text-slate-400 group-hover:text-primary transition-colors">{set.id}</td>
                        <td className="px-8 py-5 text-xs font-bold text-slate-700">{set.date}</td>
                        <td className="px-8 py-5">
                           <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 lowercase tracking-tighter italic opacity-60 group-hover:opacity-100">
                              <Navigation size={12} className="rotate-45" /> {set.bank}
                           </div>
                        </td>
                        <td className="px-8 py-5 text-center text-sm font-black text-slate-800 italic">₹{set.amount}</td>
                        <td className="px-8 py-5 text-right">
                           <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                              set.status === 'Completed' ? 'bg-emerald-50 text-emerald-500 border border-emerald-100' : 'bg-amber-50 text-amber-500 border border-amber-100'
                           }`}>
                              {set.status}
                           </span>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
         
         <div className="p-8 bg-primary/5 rounded-3xl border border-dashed border-primary/20 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-primary shadow-sm"><ArrowDownToLine size={24} /></div>
               <div>
                  <h4 className="text-sm font-black text-slate-800 tracking-tight">Automatic Payouts are ON</h4>
                  <p className="text-xs font-semibold text-slate-500">Scheduled for every morning at 09:00 AM</p>
               </div>
            </div>
            <button className="text-xs font-black uppercase tracking-widest text-primary border-b-2 border-primary/20 hover:border-primary transition-all">Configure Payout Settings</button>
         </div>
      </div>
    </div>
  );
}
