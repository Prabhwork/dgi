"use client";

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Users, 
  ShoppingBag, 
  ArrowUpRight, 
  Download,
  BarChart3,
  PieChart,
  Zap,
  IndianRupee,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<any>(null);
  const [performance, setPerformance] = useState<any[]>([]);
  const [salesHistory, setSalesHistory] = useState<any[]>([]);
  const [activePeriod, setActivePeriod] = useState('6M');
  const [trending, setTrending] = useState<any[]>([]);

  const fetchData = async (period = '6M') => {
    try {
      setLoading(true);
      const limits: Record<string, number> = { '1W': 1, '1M': 1, '3M': 3, '6M': 6, '1Y': 12 };
      const [dashData, perfData, historyData, kpiData, trendData] = await Promise.all([
        api.get('/analytics/dashboard'),
        api.get('/analytics/category-performance'),
        api.get('/analytics/monthly-sales', { params: { limit: limits[period] } }),
        api.get('/analytics/kpis'),
        api.get('/analytics/trending-products')
      ]);
      setSummary({ ...dashData, kpis: kpiData });
      setPerformance(perfData);
      setSalesHistory(historyData);
      setTrending(trendData);
    } catch (err) {
      console.error('Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(activePeriod);
  }, [activePeriod]);

  if (loading) {
    return (
       <div className="flex items-center justify-center h-[80vh]">
         <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
       </div>
    );
  }

  const maxRevenue = Math.max(...salesHistory.map(s => s.revenue || 0), 1);

  return (
    <div className="space-y-10 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight italic uppercase">Business Insights</h2>
          <p className="text-sm font-semibold text-slate-400 mt-1 uppercase tracking-tighter italic font-bold">Deep dive into your sales performance and customer trends</p>
        </div>
        <div className="flex bg-white p-1 rounded-2xl border border-slate-100 shadow-sm">
          {['1W', '1M', '3M', '6M', '1Y'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActivePeriod(tab)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${tab === activePeriod ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:text-slate-600'}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {(summary?.stats || []).map((kpi: any, idx: number) => {
          let IconComp = Zap;
          if (kpi.icon === 'orders') IconComp = ShoppingBag;
          else if (kpi.icon === 'revenue') IconComp = IndianRupee;
          else if (kpi.icon === 'pending') IconComp = Clock;
          else if (kpi.icon === 'completed') IconComp = CheckCircle2;
          
          return (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              key={kpi.label}
              className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4 group hover:border-primary/20 transition-all"
            >
              <div className="flex justify-between items-start">
                 <div className={`p-3 rounded-2xl bg-primary/5 text-primary border border-primary/5`}><IconComp size={20} /></div>
                 <div className={`flex items-center gap-1 text-[10px] font-black text-emerald-500`}>
                    <ArrowUpRight size={12} />
                    {kpi.sub?.split(' ')[0] || '+0%'}
                 </div>
              </div>
              <div>
                 <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{kpi.label}</h4>
                 <p className="text-2xl font-black text-slate-800 tracking-tight">{kpi.value}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Main Charts Area */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
         {/* Monthly Revenue Chart */}
         <div className="xl:col-span-2 bg-white rounded-[2.5rem] p-8 md:p-10 border border-slate-100 shadow-sm space-y-10">
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary"><BarChart3 size={20} /></div>
                  <div>
                    <h3 className="text-xl font-black text-slate-800 tracking-tight italic uppercase">Revenue Timeline</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Monthly sales performance across platforms</p>
                  </div>
               </div>
               <button className="p-2.5 border border-slate-100 rounded-xl text-slate-400 hover:text-primary transition-all"><Download size={18} /></button>
            </div>

            <div className="h-64 flex items-end justify-between gap-4 px-4 relative">
               <div className="absolute inset-x-0 h-[1px] bg-slate-50 bottom-1/4" />
               <div className="absolute inset-x-0 h-[1px] bg-slate-50 bottom-1/2" />
               <div className="absolute inset-x-0 h-[1px] bg-slate-50 bottom-3/4" />

               {salesHistory.map((data, idx) => (
                  <div key={data.month} className="flex-1 h-full flex flex-col items-center gap-4 group">
                     <div className="relative w-full flex justify-center h-full items-end">
                        <motion.div 
                           initial={{ height: 0 }}
                           animate={{ height: `${(data.revenue / maxRevenue) * 100}%` }}
                           transition={{ duration: 0.8, delay: idx * 0.1, ease: 'easeOut' }}
                           className={`w-10 md:w-16 rounded-t-2xl relative transition-all cursor-pointer ${idx === salesHistory.length - 1 ? 'bg-primary shadow-xl shadow-primary/20' : 'bg-slate-100 group-hover:bg-primary/20'}`}
                        >
                           {data.revenue > 0 && (
                             <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                ₹{data.revenue.toLocaleString('en-IN')}
                             </div>
                           )}
                        </motion.div>
                     </div>
                     <span className={`text-[10px] font-black uppercase tracking-widest ${idx === salesHistory.length - 1 ? 'text-primary' : 'text-slate-400'}`}>{data.month}</span>
                  </div>
               ))}
            </div>
         </div>

         <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white space-y-10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -translate-y-16 translate-x-16" />
            <div className="relative space-y-8">
               <div className="flex items-center gap-3">
                  <PieChart size={20} className="text-primary" />
                  <h3 className="text-lg font-black italic uppercase">Top Catalogs</h3>
               </div>
               
               <div className="space-y-6">
                  {performance.map((item, idx) => (
                    <div key={item.name} className="space-y-2">
                       <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                          <span className="text-white/60 italic">{item.name}</span>
                          <span className="text-primary italic">{item.percentage}%</span>
                       </div>
                       <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }} 
                            animate={{ width: `${item.percentage}%` }} 
                            className={`h-full ${idx === 0 ? 'bg-primary' : idx === 1 ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                          />
                       </div>
                    </div>
                  ))}
               </div>

               <div className="pt-10 border-t border-white/10 space-y-6">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 italic">Trending Now</h4>
                  <div className="space-y-4">
                     {trending.map(item => (
                       <div key={item.name} className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all cursor-pointer">
                          <div>
                            <p className="text-xs font-black italic uppercase">{item.name}</p>
                            <p className="text-[9px] font-bold text-white/30 tracking-widest italic">{item.orders} Sold</p>
                          </div>
                          <span className="text-[10px] font-black text-emerald-400 italic bg-emerald-400/10 px-2 py-1 rounded-lg">{item.growth}</span>
                       </div>
                     ))}
                     {trending.length === 0 && (
                        <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest italic text-center py-4">No data yet</p>
                     )}
                  </div>
               </div>
            </div>
         </div>
      </div>

    </div>
  );
}
