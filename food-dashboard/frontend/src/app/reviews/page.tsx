"use client";

import React, { useState } from 'react';
import { 
  Star, 
  MessageSquare, 
  Filter, 
  Search, 
  ChevronDown, 
  CheckCircle2, 
  AlertCircle,
  ThumbsUp,
  MoreVertical,
  Reply,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { REVIEWS } from '@/lib/mockData';

export default function ReviewsPage() {
  const [activeFilter, setActiveFilter] = useState('All');
  const avgRating = (REVIEWS.reduce((acc, r) => acc + r.rating, 0) / REVIEWS.length).toFixed(1);

  const filteredReviews = activeFilter === 'All' 
    ? REVIEWS 
    : REVIEWS.filter(r => r.sentiment === activeFilter);

  return (
    <div className="space-y-10 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight italic uppercase italic">Partner Feedback</h2>
          <p className="text-sm font-semibold text-slate-400 mt-1 uppercase tracking-tighter italic font-bold">Monitor and respond to customer reviews</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-white border border-slate-200 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm">
            <Filter size={16} /> Filter By Stars
          </button>
          <button className="bg-primary text-white px-8 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-primary/90 transition-all flex items-center gap-2 shadow-lg shadow-primary/20">
             Export Feedback
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Rating Summary Card */}
        <motion.div 
           initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
           className="lg:col-span-1 bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm space-y-8 h-fit"
        >
           <div className="text-center space-y-2">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Average Rating</h4>
              <p className="text-6xl font-black text-slate-800 tracking-tighter">{avgRating}</p>
              <div className="flex items-center justify-center gap-1 text-amber-400">
                {[1,2,3,4,5].map(i => <Star key={i} size={18} fill={i <= Math.floor(Number(avgRating)) ? "currentColor" : "none"} />)}
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pt-2">Based on {REVIEWS.length} Reviews</p>
           </div>
           
           <div className="space-y-4">
              <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 italic">Sentiment Analysis</h5>
              {[
                { label: 'Positive', val: 75, color: 'emerald' },
                { label: 'Neutral', val: 15, color: 'blue' },
                { label: 'Negative', val: 10, color: 'red' },
              ].map(item => (
                <div key={item.label} className="space-y-1">
                   <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-slate-500">
                      <span>{item.label}</span>
                      <span>{item.val}%</span>
                   </div>
                   <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }} animate={{ width: `${item.val}%` }} 
                        className={`h-full bg-${item.color}-500`}
                      />
                   </div>
                </div>
              ))}
           </div>
        </motion.div>

        {/* Reviews List */}
        <div className="lg:col-span-3 space-y-6">
           {/* Review Toolbar */}
           <div className="flex items-center gap-4 p-2 bg-slate-50 rounded-2xl border border-slate-100 overflow-x-auto pb-2 scrollbar-hide">
              {['All', 'Positive', 'Neutral', 'Negative'].map(filter => (
                <button 
                  key={filter} 
                  onClick={() => setActiveFilter(filter)}
                  className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeFilter === filter ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                   {filter}
                </button>
              ))}
           </div>

           <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                 {filteredReviews.map((review, idx) => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      key={review.id}
                      className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm relative group hover:border-primary/10 transition-all"
                    >
                       <div className="flex flex-col md:flex-row gap-6">
                          <div className="shrink-0 flex flex-col items-center gap-2">
                             <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-primary font-black text-xl italic uppercase">
                                {review.customer.split(' ').map(n => n[0]).join('')}
                             </div>
                             <div className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                                review.sentiment === 'Positive' ? 'bg-emerald-50 text-emerald-500 border border-emerald-100' : 
                                review.sentiment === 'Negative' ? 'bg-red-50 text-red-500 border border-red-100' : 
                                'bg-blue-50 text-blue-500 border border-blue-100'
                             }`}>
                                {review.sentiment}
                             </div>
                          </div>
                          
                          <div className="flex-1 space-y-4">
                             <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                                <div>
                                   <h4 className="text-sm font-black text-slate-800 tracking-tight italic uppercase">{review.customer}</h4>
                                   <div className="flex items-center gap-2 mt-1">
                                      <div className="flex items-center gap-0.5 text-amber-400">
                                         {[1,2,3,4,5].map(i => <Star key={i} size={12} fill={i <= review.rating ? "currentColor" : "none"} />)}
                                      </div>
                                      <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">• {review.date}</span>
                                   </div>
                                </div>
                                <div className="flex items-center gap-2">
                                   <button className="p-2.5 rounded-xl border border-slate-100 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 transition-all hover:border-emerald-200"><ThumbsUp size={16} /></button>
                                   <button className="bg-slate-900 text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary transition-all shadow-lg shadow-slate-900/10 flex items-center gap-2 group/btn">
                                      <Reply size={14} className="group-hover/btn:-rotate-12 transition-transform" /> Reply
                                   </button>
                                </div>
                             </div>

                             <p className="text-xs font-bold text-slate-600 leading-relaxed italic border-l-2 border-slate-100 pl-4">{review.comment}</p>
                             
                             {review.sentiment === 'Negative' && (
                                <div className="bg-red-50/50 p-4 rounded-2xl border border-red-100 flex items-center gap-3">
                                   <AlertCircle className="text-red-500 shrink-0" size={16} />
                                   <p className="text-[10px] font-black text-red-600 uppercase tracking-widest leading-relaxed">System Suggestion: Offering a discount coupon might resolve this customer's dissatisfaction.</p>
                                </div>
                             )}
                          </div>
                       </div>
                    </motion.div>
                 ))}
              </AnimatePresence>
           </div>
           
           <div className="pt-8 text-center">
              <button className="text-[10px] font-black uppercase tracking-widest text-slate-400 border-b-2 border-slate-100 hover:text-primary hover:border-primary transition-all pb-1 italic">Load older reviews...</button>
           </div>
        </div>
      </div>
    </div>
  );
}
