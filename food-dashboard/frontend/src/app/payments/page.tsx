"use client";

import React, { useState, useEffect } from 'react';
import { 
  IndianRupee, 
  TrendingUp, 
  History, 
  Download,
  ShieldCheck,
  ChevronRight,
  Search
} from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';

export default function PaymentsPage() {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [walletMeta, setWalletMeta] = useState<any>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [txnData, metaData] = await Promise.all([
        api.get('/transactions'),
        api.get('/settlements/meta/wallet')
      ]);
      setTransactions(txnData);
      setWalletMeta(metaData);
    } catch (err) {
      console.error('Failed to fetch payments data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
       <div className="flex items-center justify-center h-[80vh]">
         <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
       </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Payments & Earnings</h2>
          <p className="text-sm font-semibold text-slate-400 mt-1">Track your daily income and settlements</p>
        </div>
        <button className="bg-primary text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-primary/90 transition-all flex items-center gap-2 shadow-lg shadow-primary/20">
          <Download size={18} /> Download Statement
        </button>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div 
           initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
           className="lg:col-span-2 bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl"
        >
           <div className="absolute top-0 right-0 p-10 opacity-10 rotate-12 scale-150"><IndianRupee size={200} /></div>
           <div className="relative space-y-8">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/20"><IndianRupee size={20} className="text-emerald-400" /></div>
                 <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Total Settlement Balance</span>
              </div>
              <div className="space-y-2">
                 <h3 className="text-5xl font-black tracking-tight">₹{(walletMeta?.redeemableBalance || 0).toLocaleString()}</h3>
                 <div className="flex items-center gap-2 text-emerald-400 text-sm font-bold bg-emerald-400/10 w-fit px-3 py-1 rounded-lg">
                    <TrendingUp size={16} /> +12% vs last week
                 </div>
              </div>
              <div className="flex flex-wrap items-center gap-10 pt-4 border-t border-white/10">
                 <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Today&apos;s Earnings</p>
                    <p className="text-xl font-bold">₹{(walletMeta?.lifetimeEarnings || 0).toLocaleString()}</p>
                 </div>
                 <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Lifetime Earnings</p>
                    <p className="text-xl font-bold">₹{(walletMeta?.lifetimeEarnings || 0).toLocaleString()}</p>
                 </div>
                 <div className="ml-auto">
                    <button className="bg-white text-slate-900 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all shadow-lg active:scale-95">Withdraw Now</button>
                 </div>
              </div>
           </div>
        </motion.div>

        <motion.div 
           initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
           className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col justify-between"
        >
           <div className="space-y-6">
              <div className="flex justify-between items-center">
                 <h4 className="text-sm font-black uppercase tracking-widest text-slate-400">Payment Status</h4>
                 <ShieldCheck size={20} className="text-emerald-500" />
              </div>
              <div className="space-y-4">
                 {[
                   { label: 'Paid Orders', percentage: 95, color: '#10b981' },
                   { label: 'Failed/Refunded', percentage: 5, color: '#dc2626' },
                 ].map((bar) => (
                   <div key={bar.label} className="space-y-2">
                      <div className="flex justify-between text-xs font-bold text-slate-600">
                         <span>{bar.label}</span>
                         <span>{bar.percentage}%</span>
                      </div>
                      <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100 p-[1px]">
                         <motion.div initial={{ width: 0 }} animate={{ width: `${bar.percentage}%` }} className="h-full rounded-full" style={{ backgroundColor: bar.color }} />
                      </div>
                   </div>
                 ))}
              </div>
           </div>
           <p className="mt-8 text-[10px] font-bold text-slate-300 uppercase leading-relaxed text-center italic">Payments are settled every 24 hours to your linked bank account</p>
        </motion.div>
      </div>

      {/* Transaction History Section */}
      <div className="space-y-4">
         <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2"><History size={20} className="text-primary" /> Recent Transactions</h3>
            <div className="relative group min-w-[200px]">
               <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" />
               <input type="text" placeholder="Search Transaction ID..." className="w-full bg-white border border-slate-100 rounded-xl py-2 pl-9 pr-3 text-[10px] font-bold placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all shadow-sm" />
            </div>
         </div>

         <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                       <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">TXN ID</th>
                       <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Order ID</th>
                       <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Date & Time</th>
                       <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest italic text-center">Amount</th>
                       <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest italic text-center">Status</th>
                       <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest italic text-right">Method</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {transactions.map((txn) => (
                      <tr key={txn._id} className="hover:bg-slate-50 transition-colors group">
                        <td className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">{txn.id || txn._id.substring(0,8).toUpperCase()}</td>
                        <td className="px-6 py-4 text-xs font-black text-slate-700 tracking-tight group-hover:text-primary transition-colors">{txn.orderId || 'N/A'}</td>
                        <td className="px-6 py-4 text-[11px] font-bold text-slate-500">{new Date(txn.createdAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</td>
                        <td className="px-6 py-4 text-center">
                           <span className="text-xs font-black text-slate-800">₹{txn.amount}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                           <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                             txn.status === 'Paid' ? 'bg-emerald-50 text-emerald-500 border border-emerald-100' : 
                             txn.status === 'Failed' ? 'bg-red-50 text-red-500 border border-red-100' : 'bg-amber-50 text-amber-500 border border-amber-100'
                           }`}>
                             {txn.status}
                           </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                           <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{txn.method}</span>
                        </td>
                      </tr>
                    ))}
                    {transactions.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-10 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest italic">No transactions found</td>
                      </tr>
                    )}
                  </tbody>
               </table>
            </div>
         </div>
      </div>
    </div>
  );
}
