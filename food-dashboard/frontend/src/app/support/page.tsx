"use client";

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Package, 
  CreditCard, 
  User, 
  ChevronRight, 
  ShieldCheck,
  X,
  Clock,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';

export default function SupportPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState<any[]>([]);
  
  const [newTicket, setNewTicket] = useState({
    subject: '',
    category: 'Order Logic Audit',
    priority: 'Normal Business Support',
    description: '',
    customerName: 'Suman Lata Partner'
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const ticketData = await api.get('/support/tickets');
      setTickets(ticketData);
    } catch (err) {
      console.error('Failed to fetch support data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCategoryTicket = (category: string) => {
    let internalCategory = 'Order Logic Audit';
    if (category === 'Payments') internalCategory = 'Payments & Settlements';
    if (category === 'Shop Profile') internalCategory = 'Profile & Data View';
    if (category === 'Safety Hub') internalCategory = 'Platform Bug / Error';
    if (category === 'Order Issues') internalCategory = 'Order Logic Audit';

    setNewTicket(prev => ({ ...prev, category: internalCategory }));
    setIsModalOpen(true);
  };

  const handleRaiseTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/support/tickets', newTicket);
      setIsModalOpen(false);
      setNewTicket({ 
        subject: '', 
        category: 'Order Logic Audit', 
        priority: 'Normal Business Support', 
        description: '',
        customerName: 'Suman Lata Partner'
      });
      fetchData();
    } catch (err) {
      console.error('Failed to raise ticket');
    }
  };

  if (loading) {
    return (
       <div className="flex items-center justify-center h-[80vh]">
         <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
       </div>
    );
  }

  return (
    <div className="space-y-12 pb-20 font-black italic uppercase">
      {/* Header Area */}
      <div className="text-center space-y-6 pt-10">
        <h2 className="text-4xl font-black text-slate-800 tracking-tighter italic uppercase">Support Hub & Incident Status</h2>
        <div className="max-w-2xl mx-auto relative group">
          <Search size={24} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            placeholder="Search for articles, help topics or ticket status..." 
            className="w-full bg-white border border-slate-100 rounded-[2.5rem] py-6 pl-16 pr-8 text-sm font-bold shadow-xl shadow-slate-100/50 focus:outline-none focus:border-primary/20 transition-all font-black uppercase italic"
          />
        </div>
      </div>

      {/* Help Categories - Now Functional */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 font-black uppercase">
        {[
          { label: 'Order Issues', icon: Package, color: 'primary' },
          { label: 'Payments', icon: CreditCard, color: 'emerald' },
          { label: 'Shop Profile', icon: User, color: 'blue' },
          { label: 'Safety Hub', icon: ShieldCheck, color: 'amber' },
        ].map((cat, idx) => (
          <motion.button
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            key={cat.label}
            onClick={() => openCategoryTicket(cat.label)}
            className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:border-primary/20 transition-all text-center space-y-4 group relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-1 h-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="w-14 h-14 rounded-2xl bg-primary/5 text-primary flex items-center justify-center mx-auto group-hover:bg-primary group-hover:text-white transition-all duration-300"><cat.icon size={28} /></div>
            <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">{cat.label}</h4>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center justify-center gap-1 group-hover:text-primary transition-colors">Raise Incident <ChevronRight size={12} /></span>
          </motion.button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Support Engine & Activity */}
        <div className="lg:col-span-2 space-y-8 font-black uppercase italic">
           <div className="bg-slate-900 rounded-[3rem] p-12 text-white flex flex-col md:flex-row items-center justify-between gap-10 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[100px] -translate-y-32 translate-x-32 group-hover:bg-primary/20 transition-all" />
              <div className="relative space-y-4">
                 <div className="bg-primary/10 text-primary w-fit px-4 py-1 rounded-full text-[9px] font-black tracking-widest border border-primary/20 mb-2">24/7 PRIORITY SUPPORT</div>
                 <h3 className="text-3xl font-black italic tracking-tighter uppercase leading-none">Need Direct Logic Help?</h3>
                 <p className="text-white/40 text-xs font-bold max-w-sm uppercase font-black italic">Our dedicated partner desk is standing by to resolve any business incident instantly.</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-primary text-white px-10 py-6 rounded-[2rem] text-xs font-black uppercase tracking-widest hover:shadow-[0_0_40px_rgba(255,215,0,0.3)] hover:scale-105 active:scale-95 transition-all shadow-xl font-black"
              >
                 Raise Support Ticket
              </button>
           </div>

           <div className="bg-white rounded-[2.5rem] p-10 border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-center space-y-4 opacity-50">
              <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-300"><ShieldCheck size={32} /></div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">All data communications are encrypted and audited for business safety.</p>
           </div>
        </div>

        {/* Activity Feed */}
        <div className="space-y-8 h-fit font-black uppercase italic">
           <div className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-slate-100 shadow-sm space-y-8">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic font-black">Ticket Activity Log</h3>
              <div className="space-y-6">
                 {tickets.map(tkt => (
                    <div key={tkt._id} className="flex items-start gap-4 p-4 hover:bg-slate-50 rounded-2xl transition-all border border-transparent hover:border-slate-100">
                       <div className={`p-3 rounded-xl ${tkt.status === 'Solved' ? 'bg-emerald-50 text-emerald-500' : 'bg-amber-50 text-amber-500'}`}>
                          {tkt.status === 'Solved' ? <CheckCircle2 size={16} /> : <Clock size={16} />}
                       </div>
                       <div className="space-y-1 flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-slate-800 italic uppercase font-black">ID: {tkt.id}</span>
                            <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">{tkt.date}</span>
                          </div>
                          <p className="text-xs font-bold text-slate-600 line-clamp-2 leading-tight uppercase italic">{tkt.subject}</p>
                          <span className={`text-[9px] font-black px-2 py-0.5 rounded-lg uppercase tracking-widest block w-fit mt-2 ${tkt.status === 'Solved' ? 'bg-emerald-50 text-emerald-500 shadow-sm' : 'bg-amber-50 text-amber-500 shadow-sm'}`}>{tkt.status}</span>
                       </div>
                    </div>
                 ))}
                 {tickets.length === 0 && (
                    <div className="py-10 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest italic">No Open Support Logs</div>
                 )}
              </div>
              <button className="w-full py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-primary transition-all font-black italic">Archive Console</button>
           </div>
        </div>
      </div>

      {/* New Ticket Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
             <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 30 }}
                className="relative bg-white w-full max-w-xl rounded-[3.5rem] p-12 shadow-2xl overflow-hidden font-black uppercase italic"
             >
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-emerald-500" />
                <div className="flex justify-between items-center mb-10 font-black">
                   <div>
                      <h3 className="text-2xl font-black text-slate-800 italic uppercase">Log Business Incident</h3>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">SLA Level: Priority 1 - 30 Min Auto-Escalate</p>
                   </div>
                   <button onClick={() => setIsModalOpen(false)} className="p-2.5 border border-slate-100 rounded-2xl text-slate-400 hover:bg-slate-50 shadow-sm"><X size={20} /></button>
                </div>

                <form className="space-y-8" onSubmit={handleRaiseTicket}>
                   <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Subject / Logic Summary</label>
                       <input 
                         required
                         type="text" 
                         value={newTicket.subject}
                         onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                         placeholder="Brief summary of the issue..." 
                         className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 text-xs font-black focus:outline-none transition-all uppercase placeholder:opacity-30 italic" 
                       />
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2 font-black">
                         <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Category</label>
                         <select 
                           value={newTicket.category}
                           onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value })}
                           className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 text-xs font-black focus:outline-none transition-all appearance-none cursor-pointer uppercase italic"
                         >
                            <option>Order Logic Audit</option>
                            <option>Payments & Settlements</option>
                            <option>Profile & Data View</option>
                            <option>Platform Bug / Error</option>
                         </select>
                      </div>
                      <div className="space-y-2 font-black">
                         <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Impact Priority Level</label>
                         <select 
                           value={newTicket.priority}
                           onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })}
                           className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 text-xs font-black focus:outline-none transition-all appearance-none cursor-pointer uppercase italic"
                         >
                            <option>Normal Business Support</option>
                            <option>CRITICAL (Live Impact)</option>
                         </select>
                      </div>
                   </div>

                   <div className="space-y-2 font-black">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Incident Details (Describe Logically)</label>
                      <textarea 
                        required
                        value={newTicket.description}
                        onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                        placeholder="Provide IDs or specific logs for faster audit..." 
                        className="w-full bg-slate-50 border border-slate-100 rounded-[2.5rem] p-8 text-xs font-black focus:outline-none h-44 resize-none transition-all uppercase placeholder:opacity-30 italic" 
                      />
                   </div>

                   <div className="pt-6 font-black uppercase italic">
                      <button type="submit" className="w-full py-6 bg-slate-900 text-white rounded-[2.5rem] text-xs font-black uppercase tracking-[0.2em] shadow-2xl shadow-slate-900/40 active:scale-95 transition-all flex items-center justify-center gap-4 group">
                         Initiate Direct Ticket <ArrowRight size={18} className="text-primary group-hover:translate-x-2 transition-transform" />
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
