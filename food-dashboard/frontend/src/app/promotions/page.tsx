"use client";

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Clock, 
  Zap, 
  TrendingUp,
  X,
  Gift,
  Target,
  ChevronDown,
  Layers,
  Package,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';

export default function PromotionsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    type: 'Percentage',
    value: '',
    minBillValue: '0',
    expiry: '',
    scope: 'Global',
    targetId: '',
    targetName: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [couponData, catData, prodData] = await Promise.all([
        api.get('/promotions'),
        api.get('/categories'),
        api.get('/products')
      ]);
      setCoupons(couponData);
      setCategories(catData || []);
      setProducts(prodData || []);
    } catch (err) {
      console.error('Failed to fetch promotions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Determine targetName for UI display
      let tName = '';
      if (newCoupon.scope === 'Category') {
        tName = categories.find(c => c._id === newCoupon.targetId)?.name || 'Specified Category';
      } else if (newCoupon.scope === 'Product') {
        tName = products.find(p => p._id === newCoupon.targetId)?.name || 'Specified Product';
      }

      await api.post('/promotions', {
        ...newCoupon,
        value: Number(newCoupon.value),
        minBillValue: Number(newCoupon.minBillValue),
        targetName: tName
      });
      setIsModalOpen(false);
      setNewCoupon({ code: '', type: 'Percentage', value: '', minBillValue: '0', expiry: '', scope: 'Global', targetId: '', targetName: '' });
      fetchData();
    } catch (err) {
      console.error('Failed to create coupon');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this campaign? This cannot be undone.")) return;
    try {
      await api.delete(`/promotions/${id}`);
      fetchData();
    } catch (err) {
      console.error('Failed to delete coupon');
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
    <div className="space-y-10 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight italic uppercase">Coupons & Campaigns</h2>
          <p className="text-sm font-semibold text-slate-400 mt-1 uppercase tracking-tighter italic font-bold">Drive more orders with lightning deals and targeted discounts</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary text-white px-8 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest hover:shadow-xl hover:shadow-primary/30 transition-all flex items-center gap-3 active:scale-95"
        >
          <Plus size={18} /> Create New Campaign
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
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-white/40 italic">Global Insight</h4>
                    <p className="text-4xl font-black italic tracking-tighter">{coupons.filter(c => c.status === 'Active').length.toString().padStart(2, '0')}</p>
                    <p className="text-[10px] font-bold text-emerald-400 uppercase mt-2">Active Campaigns Online</p>
                 </div>
                 <div className="pt-6 border-t border-white/10 space-y-4">
                    <div className="flex justify-between items-center text-xs font-black italic uppercase tracking-widest">
                       <span className="text-white/40">Loyalty Index</span>
                       <span className="text-primary">+24.5%</span>
                    </div>
                 </div>
              </div>
           </motion.div>

           <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm space-y-8">
              <div className="flex items-center gap-2">
                 <Target className="text-primary" size={20} />
                 <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 italic font-black">Targeting Strategy</h3>
              </div>
              <div className="space-y-4">
                 <div className="flex gap-4 items-start p-4 bg-slate-50 rounded-2xl">
                    <Layers size={18} className="text-slate-400 shrink-0 mt-1" />
                    <p className="text-[10px] font-bold text-slate-500 leading-relaxed uppercase tracking-tighter italic">Use <span className="text-slate-800 underline font-black">Category Targeting</span> to clear inventory for specific sections like Desserts or Starters.</p>
                 </div>
                 <div className="flex gap-4 items-start p-4 bg-slate-50 rounded-2xl">
                    <Package size={18} className="text-slate-400 shrink-0 mt-1" />
                    <p className="text-[10px] font-bold text-slate-500 leading-relaxed uppercase tracking-tighter italic">Use <span className="text-slate-800 underline font-black">Product Targeting</span> to launch a new dish with a 50% "First Try" offer.</p>
                 </div>
              </div>
           </div>
        </div>

        {/* Coupons List Section */}
        <div className="lg:col-span-2 space-y-6">
           <AnimatePresence mode="popLayout">
              {coupons.map((coupon, idx) => (
                 <motion.div
                   layout
                   initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                   transition={{ delay: idx * 0.1 }}
                   key={coupon._id}
                   className={`bg-white rounded-3xl p-8 border border-slate-100 shadow-sm relative group overflow-hidden transition-all hover:border-primary/20 ${coupon.isPrivate ? 'border-amber-200 bg-amber-50/10' : ''}`}
                 >
                    <div className="absolute top-1/2 -left-3 w-6 h-6 bg-slate-50 border border-slate-100 rounded-full -translate-y-1/2" />
                    <div className="absolute top-1/2 -right-3 w-6 h-6 bg-slate-50 border border-slate-100 rounded-full -translate-y-1/2" />

                    <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                       <div className="flex items-center gap-6 w-full md:w-auto">
                          <div className={`w-20 h-20 rounded-2xl flex flex-col items-center justify-center font-black italic shadow-lg ${
                             coupon.type === 'Percentage' ? 'bg-slate-900 text-white' : 
                             coupon.type === 'Flat Off' ? 'bg-emerald-500 text-white' : 
                             'bg-amber-500 text-white'
                          }`}>
                             <span className="text-xl leading-none">{coupon.value}{coupon.type === 'Percentage' ? '%' : ''}</span>
                             <span className="text-[8px] uppercase tracking-widest mt-1">OFF</span>
                          </div>
                          
                          <div className="space-y-1">
                             <div className="flex items-center gap-2 flex-wrap">
                                <span className={`px-3 py-1 text-white rounded-lg text-[10px] font-black tracking-widest uppercase italic ${coupon.isPrivate ? 'bg-amber-500' : 'bg-slate-900'}`}>{coupon.code}</span>
                                {coupon.scope !== 'Global' && (
                                  <span className="px-3 py-1 bg-primary/10 text-primary rounded-lg text-[8px] font-black tracking-widest uppercase italic flex items-center gap-1">
                                    <Target size={10} /> {coupon.targetName || coupon.scope}
                                  </span>
                                )}
                                {coupon.isPrivate && <span className="px-3 py-1 bg-amber-100 text-amber-600 rounded-lg text-[8px] font-black tracking-widest uppercase italic">Private Reward</span>}
                             </div>
                             <h4 className="text-md font-black text-slate-800 italic uppercase mt-2">{coupon.description || `${coupon.type} Campaign`}</h4>
                             <div className="flex items-center gap-4 text-slate-500 mt-1">
                                <div className="flex items-center gap-1"><TrendingUp size={12} /><span className="text-[10px] font-black uppercase">{coupon.usage || 0} Uses</span></div>
                                <div className="flex items-center gap-1 border-l border-slate-100 pl-4 font-black"><Clock size={12} /><span className="text-[10px] uppercase italic text-slate-800">Ends {new Date(coupon.expiry).toLocaleDateString()}</span></div>
                             </div>
                          </div>
                       </div>

                       <div className="flex items-center gap-3 w-full md:w-auto">
                          <button 
                            onClick={() => handleDelete(coupon._id)}
                            className="bg-white p-3.5 rounded-xl border border-slate-100 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all shadow-sm"
                          >
                             <Trash2 size={18} />
                          </button>
                          <button className="flex-1 md:flex-none py-3.5 px-8 rounded-xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-primary transition-all shadow-xl shadow-slate-900/10">Manage</button>
                       </div>
                    </div>
                 </motion.div>
              ))}
           </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
         {isModalOpen && (
           <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
              <motion.div 
                 initial={{ opacity: 0, scale: 0.95, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 30 }}
                 className="relative bg-white w-full max-w-xl rounded-[3rem] p-10 shadow-2xl overflow-y-auto max-h-[90vh]"
              >
                 <div className="flex justify-between items-center mb-10">
                    <div>
                       <h3 className="text-2xl font-black text-slate-800 italic uppercase">Launch Targeted Offer</h3>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Define your discount logic and target audience</p>
                    </div>
                    <button onClick={() => setIsModalOpen(false)} className="p-2.5 border border-slate-100 rounded-2xl text-slate-400 hover:bg-slate-50"><X size={20} /></button>
                 </div>

                 <form className="space-y-8" onSubmit={handleCreate}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-800 italic font-black">Campaign Code</label>
                          <input required type="text" value={newCoupon.code} onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value })} placeholder="e.g., PIZZA50" className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs font-black uppercase" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-800 italic font-black">Discount Type</label>
                          <select value={newCoupon.type} onChange={(e) => setNewCoupon({ ...newCoupon, type: e.target.value })} className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs font-black">
                             <option>Percentage</option>
                             <option>Flat Off</option>
                             <option>BOGO</option>
                          </select>
                       </div>
                    </div>

                    <div className="space-y-4 p-6 bg-slate-900 rounded-[2rem] text-white">
                       <div className="flex items-center gap-2 mb-2">
                          <Target size={16} className="text-primary" />
                          <label className="text-[10px] font-black uppercase tracking-widest text-primary italic">Targeting Scope</label>
                       </div>
                       <div className="grid grid-cols-3 gap-2">
                          {['Global', 'Category', 'Product'].map(s => (
                            <button key={s} type="button" onClick={() => setNewCoupon({...newCoupon, scope: s, targetId: ''})} className={`py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${newCoupon.scope === s ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-105' : 'bg-white/10 text-white/40 hover:bg-white/20'}`}>
                               {s}
                            </button>
                          ))}
                       </div>

                       {newCoupon.scope === 'Category' && (
                         <div className="mt-4 space-y-2">
                            <label className="text-[9px] font-black uppercase text-white/40">Select Targeted Category</label>
                            <select value={newCoupon.targetId} onChange={(e) => setNewCoupon({...newCoupon, targetId: e.target.value})} className="w-full bg-white/10 border border-white/5 rounded-xl p-3 text-xs font-bold text-white focus:outline-none">
                               <option value="" disabled className="text-slate-800">Choose Category...</option>
                               {categories.map(c => <option key={c._id} value={c._id} className="text-slate-800">{c.name}</option>)}
                            </select>
                         </div>
                       )}

                       {newCoupon.scope === 'Product' && (
                         <div className="mt-4 space-y-2">
                            <label className="text-[9px] font-black uppercase text-white/40">Select Targeted Product</label>
                            <select value={newCoupon.targetId} onChange={(e) => setNewCoupon({...newCoupon, targetId: e.target.value})} className="w-full bg-white/10 border border-white/5 rounded-xl p-3 text-xs font-bold text-white focus:outline-none">
                               <option value="" disabled className="text-slate-800">Choose Product...</option>
                               {products.map(p => <option key={p._id} value={p._id} className="text-slate-800">{p.name}</option>)}
                            </select>
                         </div>
                       )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-800 italic font-black">Value</label>
                          <input required type="number" value={newCoupon.value} onChange={(e) => setNewCoupon({ ...newCoupon, value: e.target.value })} placeholder="e.g., 20" className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs font-black" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-800 italic font-black">Expiry Date</label>
                          <input required type="date" value={newCoupon.expiry} onChange={(e) => setNewCoupon({ ...newCoupon, expiry: e.target.value })} className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs font-black" />
                       </div>
                    </div>

                    <div className="pt-4">
                       <button type="submit" className="w-full py-5 bg-slate-900 text-white rounded-[2rem] text-xs font-black uppercase tracking-[0.2em] shadow-2xl shadow-slate-900/20 active:scale-95 transition-all flex items-center justify-center gap-3">
                          <Zap size={18} className="text-primary" /> Activate Targeted Campaign
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
