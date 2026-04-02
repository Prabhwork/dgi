"use client";

import React, { useState } from 'react';
import { 
  Search, 
  HelpCircle, 
  Package, 
  CreditCard, 
  User, 
  ChevronRight, 
  MessageSquare, 
  ShieldCheck,
  Plus,
  X,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FAQS = [
  { q: 'How do I update my menu?', cat: 'Orders' },
  { q: 'When will I get my payment?', cat: 'Payments' },
  { q: 'How to change shop timings?', cat: 'Profile' },
  { q: 'Order not showing in prep?', cat: 'Technical' },
];

const TICKETS = [
  { id: 'TKT-991', subject: 'Payment delayed for 31st March', category: 'Payments', status: 'Solved', date: '01 Apr' },
  { id: 'TKT-992', subject: 'Customer complaining about packaging', category: 'Orders', status: 'In Progress', date: '02 Apr' },
];

export default function SupportPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-12 pb-20">
      {/* Header Area */}
      <div className="text-center space-y-6 pt-10">
        <h2 className="text-4xl font-black text-slate-800 tracking-tighter italic uppercase">How can we help you today?</h2>
        <div className="max-w-2xl mx-auto relative group">
          <Search size={24} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            placeholder="Search for articles, help topics or ticket status..." 
            className="w-full bg-white border-2 border-slate-100 rounded-[2.5rem] py-6 pl-16 pr-8 text-sm font-bold shadow-xl shadow-slate-100/50 focus:outline-none focus:border-primary/20 transition-all"
          />
        </div>
      </div>

      {/* Help Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Order Issues', icon: Package, color: 'primary' },
          { label: 'Payments', icon: CreditCard, color: 'emerald' },
          { label: 'Shop Profile', icon: User, color: 'blue' },
          { label: 'Safety Hub', icon: ShieldCheck, color: 'amber' },
        ].map((cat, idx) => (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            key={cat.label}
            className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:border-primary/10 transition-all text-center space-y-4 group"
          >
            <div className={`w-14 h-14 rounded-2xl bg-${cat.color}/5 text-primary flex items-center justify-center mx-auto group-hover:scale-110 transition-transform`}><cat.icon size={28} /></div>
            <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">{cat.label}</h4>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center justify-center gap-1">Browse Topics <ChevronRight size={12} /></span>
          </motion.button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* FAQs Section */}
        <div className="lg:col-span-2 space-y-8">
           <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm space-y-8">
              <div className="flex items-center justify-between">
                 <h3 className="text-xl font-black text-slate-800 italic uppercase italic">Top Frequently Asked</h3>
                 <button className="text-[10px] font-black text-primary uppercase tracking-widest hover:border-b border-primary">View All FAQ Library</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {FAQS.map(faq => (
                   <div key={faq.q} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 hover:bg-white hover:shadow-md transition-all cursor-pointer group">
                      <div className="text-[8px] font-black text-primary uppercase tracking-tight mb-2 italic">#{faq.cat} Help</div>
                      <p className="text-xs font-bold text-slate-700 leading-relaxed italic">{faq.q}</p>
                   </div>
                 ))}
              </div>
           </div>

           <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white flex flex-col md:flex-row items-center justify-between gap-10 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -translate-y-16 translate-x-16" />
              <div className="relative space-y-4">
                 <h3 className="text-2xl font-black italic tracking-tight">Need 1-on-1 Help?</h3>
                 <p className="text-white/40 text-xs font-bold max-w-sm">Our 24/7 dedicated partner support team is here to solve any business emergency you might have.</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-white text-slate-900 px-10 py-5 rounded-3xl text-xs font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl"
              >
                 Raise New Ticket
              </button>
           </div>
        </div>

        {/* Recent Tickets Activity */}
        <div className="space-y-8 h-fit">
           <div className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-slate-100 shadow-sm space-y-8">
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 italic">Ticket Activity</h3>
              <div className="space-y-6">
                 {TICKETS.map(tkt => (
                   <div key={tkt.id} className="flex items-start gap-4 p-4 hover:bg-slate-50 rounded-2xl transition-all border border-transparent hover:border-slate-100">
                      <div className={`p-3 rounded-xl ${tkt.status === 'Solved' ? 'bg-emerald-50 text-emerald-500' : 'bg-amber-50 text-amber-500'}`}>
                         {tkt.status === 'Solved' ? <CheckCircle2 size={16} /> : <Clock size={16} />}
                      </div>
                      <div className="space-y-1">
                         <div className="flex items-center gap-2">
                           <span className="text-[10px] font-black text-slate-800">{tkt.id}</span>
                           <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">• {tkt.date}</span>
                         </div>
                         <p className="text-xs font-bold text-slate-600 line-clamp-2 leading-tight">{tkt.subject}</p>
                         <span className={`text-[9px] font-black p-0.5 uppercase tracking-widest block w-fit ${tkt.status === 'Solved' ? 'text-emerald-500' : 'text-amber-500'}`}>{tkt.status}</span>
                      </div>
                   </div>
                 ))}
              </div>
              <button className="w-full py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-primary transition-all">View All Tickets</button>
           </div>
        </div>
      </div>

      {/* Modern Raise Ticket Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
             <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 30 }}
                className="relative bg-white w-full max-w-xl rounded-[3rem] p-10 shadow-2xl overflow-hidden"
             >
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-emerald-500" />
                <div className="flex justify-between items-center mb-10">
                   <div>
                      <h3 className="text-2xl font-black text-slate-800 italic uppercase">Raise Incident Ticket</h3>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Expected response time: 30 minutes</p>
                   </div>
                   <button onClick={() => setIsModalOpen(false)} className="p-2.5 border border-slate-100 rounded-2xl text-slate-400 hover:bg-slate-50"><X size={20} /></button>
                </div>

                <form className="space-y-8">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                         <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Core Category</label>
                         <select className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs font-black focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all">
                            <option>Payments & Settlements</option>
                            <option>Order Management</option>
                            <option>Profile & Account View</option>
                            <option>Technical Error/Bug</option>
                         </select>
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Priority Level</label>
                         <select className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs font-black focus:outline-none transition-all">
                            <option>Normal Business Support</option>
                            <option>Critical (Live Order Impact)</option>
                         </select>
                      </div>
                   </div>

                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Describe your issue in detail</label>
                      <textarea placeholder="Please provide order IDs or transaction IDs for faster resolution..." className="w-full bg-slate-50 border border-slate-100 rounded-[2.5rem] p-8 text-xs font-black focus:outline-none focus:ring-4 focus:ring-primary/5 h-48 resize-none transition-all" />
                   </div>

                   <div className="pt-6">
                      <button className="w-full py-6 bg-slate-900 text-white rounded-[2.5rem] text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-slate-900/20 active:scale-95 transition-all flex items-center justify-center gap-3">
                         Submit Ticket Request <ArrowRight size={18} className="text-primary" />
                      </button>
                   </div>
                </form>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
