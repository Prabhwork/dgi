"use client";

import React, { useState, useEffect } from 'react';
import { 
  Star, 
  Filter, 
  CheckCircle2, 
  AlertCircle,
  ThumbsUp,
  Reply,
  ArrowRight,
  UtensilsCrossed,
  Gift,
  Check,
  Zap,
  X,
  Banknote,
  Percent,
  RotateCcw,
  Wand2,
  Copy,
  Sparkles,
  ShieldCheck,
  MousePointer2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';

export default function ReviewsPage() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [isLikingId, setIsLikingId] = useState<string | null>(null);
  const [isRewardingId, setIsRewardingId] = useState<string | null>(null);
  const [issuedCode, setIssuedCode] = useState<string | null>(null);
  const [rewardModalReview, setRewardModalReview] = useState<any>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [customReward, setCustomReward] = useState({
    type: 'Flat Off',
    value: '100',
    minBill: '500'
  });

  const restaurantName = "Suman Lata Bhadola Marg Restaurant";

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await api.get('/reviews');
      setReviews(data);
    } catch (err) {
      console.error('Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleReplySubmit = async (reviewId: string) => {
    if (!replyText.trim()) return;
    try {
      setIsSubmittingReply(true);
      await api.put(`/reviews/${reviewId}/reply`, { 
        reply: replyText,
        repliedBy: restaurantName
      });
      setReplyText('');
      setReplyingToId(null);
      fetchData();
    } catch (err) {
      console.error('Failed to submit reply');
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const handleLike = async (reviewId: string) => {
    try {
      setIsLikingId(reviewId);
      await api.patch(`/reviews/${reviewId}/like`);
      fetchData();
    } catch (err) {
      console.error('Failed to toggle like');
    } finally {
      setIsLikingId(null);
    }
  };

  const handleIssueReward = async () => {
    if (!rewardModalReview) return;
    try {
      setIsRewardingId(rewardModalReview._id);
      const res = await api.post(`/reviews/${rewardModalReview._id}/reward`, {
        discountValue: Number(customReward.value),
        type: customReward.type,
        minBillValue: Number(customReward.minBill)
      });
      setIssuedCode(res.coupon.code);
      setRewardModalReview(null);
      fetchData();
    } catch (err) {
      console.error('Failed to issue reward');
    } finally {
      setIsRewardingId(null);
    }
  };

  const handleResetReward = async (reviewId: string) => {
    if (!window.confirm("Reset this reward? This will let you re-grant a new manual code.")) return;
    try {
      await api.post(`/reviews/${reviewId}/reward/reset`, {});
      fetchData();
    } catch (err) {
      console.error('Failed to reset reward');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  if (loading) {
    return (
       <div className="flex items-center justify-center h-[80vh]">
         <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
       </div>
    );
  }

  const avgRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : "0.0";

  const filteredReviews = activeFilter === 'All' 
    ? reviews 
    : reviews.filter(r => r.sentiment === activeFilter);

  const stats = {
    total: reviews.length,
    positive: reviews.filter(r => r.sentiment === 'Positive').length,
    neutral: reviews.filter(r => r.sentiment === 'Neutral').length,
    negative: reviews.filter(r => r.sentiment === 'Negative').length,
  };

  return (
    <div className="space-y-10 pb-20 font-black uppercase italic tracking-tight">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight italic uppercase">Partner Feedback</h2>
          <p className="text-sm font-semibold text-slate-400 mt-1 uppercase tracking-tighter italic font-black">Audit Desk: Reward Management Console</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-white border border-slate-200 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
            <Filter size={16} /> Filters
          </button>
          <button className="bg-primary text-white px-8 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest hover:shadow-xl hover:shadow-primary/30 transition-all flex items-center gap-2">
             Export Analytics
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sentiment Summary */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-1 bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm h-fit sticky top-10">
           <div className="text-center space-y-2">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-black">Sentiment Score</h4>
              <p className="text-6xl font-black text-slate-800 tracking-tighter">{avgRating}</p>
              <div className="flex items-center justify-center gap-1 text-amber-400">
                {[1,2,3,4,5].map(i => <Star key={i} size={18} fill={i <= Math.floor(Number(avgRating)) ? "currentColor" : "none"} />)}
              </div>
           </div>
           
           <div className="mt-10 space-y-4 pt-8 border-t border-slate-50">
              <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-300 italic mb-4 font-black">Global Breakdown</h5>
              {[
                { label: 'Positive', val: stats.positive, color: 'emerald' },
                { label: 'Neutral', val: stats.neutral, color: 'blue' },
                { label: 'Negative', val: stats.negative, color: 'red' },
              ].map(item => (
                <div key={item.label} className="space-y-1">
                   <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-slate-500">
                      <span>{item.label}</span>
                      <span>{item.val}</span>
                   </div>
                   <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${(item.val/stats.total)*100}%` }} className={`h-full bg-${item.color}-500`} />
                   </div>
                </div>
              ))}
           </div>
        </motion.div>

        {/* Reviews List */}
        <div className="lg:col-span-3 space-y-6">
           <div className="flex items-center gap-4 p-2 bg-slate-50 rounded-2xl border border-slate-100 overflow-x-auto scrollbar-hide font-black italic">
              {['All', 'Positive', 'Neutral', 'Negative'].map(f => (
                <button key={f} onClick={() => setActiveFilter(f)} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeFilter === f ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}>
                   {f}
                </button>
              ))}
           </div>

           <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                 {filteredReviews.map((review, idx) => (
                    <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} key={review._id} className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm group hover:border-primary/20 transition-all">
                       <div className="flex flex-col md:flex-row gap-6">
                          <div className="shrink-0 flex flex-col items-center gap-2">
                             <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-100 flex items-center justify-center text-primary font-black text-xl italic uppercase">
                                {(review.customer || 'Guest').split(' ').map((n: string) => n[0]).join('')}
                             </div>
                             <div className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase ${review.sentiment === 'Positive' ? 'bg-emerald-50 text-emerald-500' : review.sentiment === 'Negative' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
                                {review.sentiment || 'Neutral'}
                             </div>
                          </div>
                          
                          <div className="flex-1 space-y-4 font-black italic uppercase">
                             <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                   <h4 className="text-sm font-black text-slate-800 tracking-tight leading-none italic uppercase">{review.customer}</h4>
                                   <div className="flex items-center gap-2 mt-2">
                                      <div className="flex items-center gap-0.5 text-amber-400">
                                         {[1,2,3,4,5].map(i => <Star key={i} size={12} fill={i <= review.rating ? "currentColor" : "none"} />)}
                                      </div>
                                      <span className="text-[10px] font-bold text-slate-300">• {new Date(review.createdAt).toLocaleDateString()}</span>
                                   </div>
                                </div>
                                <div className="flex items-center gap-2">
                                   {review.rewardSent ? (
                                      <div className="flex items-center gap-1 group/badge">
                                         <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-2.5 flex items-center gap-2 text-emerald-600 shadow-sm">
                                            <CheckCircle2 size={14} />
                                            <span className="text-[9px] font-black uppercase italic tracking-widest">{review.rewardCode}</span>
                                         </div>
                                         <button onClick={() => handleResetReward(review._id)} className="p-2.5 bg-red-50 text-red-500 rounded-xl border border-red-100 hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover/badge:opacity-100" title="Reset Reward Entry">
                                            <RotateCcw size={14} />
                                         </button>
                                      </div>
                                   ) : (
                                      <button 
                                         onClick={() => setRewardModalReview(review)}
                                         className="p-2.5 rounded-xl border border-amber-100 bg-amber-50 text-amber-500 hover:bg-amber-100 transition-all shadow-sm flex items-center gap-2 group/reward"
                                      >
                                         <Gift size={16} />
                                         <span className="text-[9px] font-black px-1">Grant Reward</span>
                                      </button>
                                   )}
                                   <button disabled={isLikingId === review._id} onClick={() => handleLike(review._id)} className={`p-2.5 rounded-xl border transition-all ${review.isLikedByPartner ? 'border-emerald-200 bg-emerald-50 text-emerald-600' : 'border-slate-100 text-slate-400 hover:bg-emerald-50'}`}>
                                      <ThumbsUp size={16} fill={review.isLikedByPartner ? "currentColor" : "none"} />
                                   </button>
                                   <button onClick={() => setReplyingToId(replyingToId === review._id ? null : review._id)} className={`${replyingToId === review._id ? 'bg-primary' : 'bg-slate-900'} text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-slate-900/10`}>
                                      <Reply size={14} /> {review.replied ? 'Edit' : 'Reply'}
                                   </button>
                                </div>
                             </div>

                             <p className="text-xs font-bold text-slate-600 leading-relaxed italic border-l-2 border-slate-100 pl-4 font-black">{review.comment}</p>
                             
                             {review.replied && (
                                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-2 relative">
                                   <div className="flex items-center gap-2 mb-2 font-black">
                                      <UtensilsCrossed size={12} className="text-primary" />
                                      <span className="text-[10px] font-black text-slate-800">AUDIT: RESPONSE LOG</span>
                                   </div>
                                   <p className="text-xs font-bold text-slate-600 leading-relaxed italic">"{review.reply}"</p>
                                </div>
                             )}

                             {/* Reply Input */}
                             <AnimatePresence>
                                {replyingToId === review._id && (
                                   <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                                      <div className="pt-4 space-y-4">
                                         <textarea autoFocus value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="Drafting official response..." className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-6 text-xs font-bold focus:outline-none focus:ring-4 focus:ring-primary/5 min-h-[100px]" />
                                         <div className="flex justify-end gap-3 font-black">
                                            <button onClick={() => setReplyingToId(null)} className="text-[10px] uppercase text-slate-400">Cancel</button>
                                            <button disabled={isSubmittingReply || !replyText.trim()} onClick={() => handleReplySubmit(review._id)} className="bg-primary text-white px-8 py-3 rounded-xl text-[10px] uppercase tracking-widest shadow-lg active:scale-95 transition-all">Submit Entry</button>
                                         </div>
                                      </div>
                                   </motion.div>
                                )}
                             </AnimatePresence>
                          </div>
                       </div>
                    </motion.div>
                 ))}
              </AnimatePresence>
           </div>
        </div>
      </div>

      {/* Reward Workshop Modal */}
      <AnimatePresence>
         {rewardModalReview && (
           <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setRewardModalReview(null)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
              <motion.div 
                 initial={{ opacity: 0, scale: 0.95, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 30 }}
                 className="relative bg-white w-full max-w-lg rounded-[3.5rem] p-12 shadow-2xl overflow-hidden font-black uppercase italic"
              >
                 <div className="flex justify-between items-center mb-10">
                    <div>
                       <h4 className="text-2xl font-black text-slate-800 leading-none">Reward Workshop</h4>
                       <p className="text-[10px] font-black text-slate-400 tracking-widest mt-1">Manual Audit Logic: <span className="text-primary">{rewardModalReview.customer}</span></p>
                    </div>
                    <button onClick={() => setRewardModalReview(null)} className="p-2 border border-slate-100 rounded-xl text-slate-400"><X size={20} /></button>
                 </div>

                 <div className="space-y-8">
                    <div className="space-y-4">
                       <label className="text-[10px] font-black tracking-widest text-slate-800 flex items-center gap-2">
                          <Wand2 size={12} className="text-primary" /> Logic Engine
                       </label>
                       <div className="grid grid-cols-2 gap-4">
                          <button onClick={() => setCustomReward({...customReward, type: 'Flat Off'})} className={`p-6 rounded-[2rem] border transition-all flex flex-col items-center gap-2 ${customReward.type === 'Flat Off' ? 'bg-primary text-white border-primary shadow-xl shadow-primary/20 scale-[1.02]' : 'bg-slate-50 text-slate-800 border-slate-100 opacity-60'}`}>
                             <Banknote size={24} /><span className="text-[9px] font-black">Flat Off</span>
                          </button>
                          <button onClick={() => setCustomReward({...customReward, type: 'Percentage'})} className={`p-6 rounded-[2rem] border transition-all flex flex-col items-center gap-2 ${customReward.type === 'Percentage' ? 'bg-primary text-white border-primary shadow-xl shadow-primary/20 scale-[1.02]' : 'bg-slate-50 text-slate-800 border-slate-100 opacity-60'}`}>
                             <Percent size={24} /><span className="text-[9px] font-black">Percentage</span>
                          </button>
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-800">Value ({customReward.type === 'Percentage' ? '%' : '₹'})</label>
                          <input type="number" value={customReward.value} onChange={(e) => setCustomReward({...customReward, value: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs font-black uppercase" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-800">Min. Bill Floor (₹)</label>
                          <input type="number" value={customReward.minBill} onChange={(e) => setCustomReward({...customReward, minBill: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs font-black uppercase" />
                       </div>
                    </div>

                    <div className="p-6 bg-slate-900 rounded-[2rem] text-white">
                       <p className="text-[10px] font-black text-primary/70 mb-1 tracking-widest font-black italic underline decoration-primary/30 underline-offset-4">Audit Tip</p>
                       <p className="text-[11px] font-bold text-white/80 leading-relaxed tracking-tighter italic font-black">"Analyze previous bill value. A ₹125 discount on ₹600+ bill is ideal for high-ticket retention."</p>
                    </div>

                    <button 
                       disabled={isRewardingId === rewardModalReview._id}
                       onClick={handleIssueReward} 
                       className="w-full py-5 bg-slate-900 text-white rounded-[2.5rem] text-xs font-black uppercase tracking-[0.2em] shadow-2xl hover:bg-primary transition-all flex items-center justify-center gap-3 active:scale-95 shadow-xl shadow-slate-900/20"
                    >
                       <Zap size={18} className="text-primary font-black" /> {isRewardingId ? 'Auditing Ledger...' : 'Commit Activation'}
                    </button>
                 </div>
              </motion.div>
           </div>
         )}
      </AnimatePresence>

      {/* Premium Code Reveal Modal */}
      <AnimatePresence>
         {issuedCode && (
           <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIssuedCode(null)} className="absolute inset-0 bg-slate-900/80 backdrop-blur-xl" />
              <motion.div initial={{ opacity: 0, scale: 0.8, y: 50 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.8, y: 50 }} className="relative bg-white w-full max-w-md rounded-[4rem] p-16 text-center shadow-[0_30px_100px_-20px_rgba(30,41,59,0.3)] font-black italic uppercase overflow-hidden">
                 <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-amber-500 to-primary" />
                 
                 {/* Sparkle Background Elements */}
                 <div className="absolute top-10 left-10 text-primary/10 animate-pulse"><Sparkles size={40} /></div>
                 <div className="absolute bottom-40 right-10 text-primary/10 animate-pulse" style={{ animationDelay: '1s' }}><Sparkles size={30} /></div>

                 <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-emerald-500/10 border border-emerald-100">
                    <ShieldCheck size={48} strokeWidth={3} />
                 </div>
                 
                 <h3 className="text-3xl font-black text-slate-800 leading-none">Entry Commited</h3>
                 <p className="text-[10px] font-black text-slate-400 tracking-widest mt-4 mb-12">Hand-made discount code activated in Database</p>
                 
                 <motion.div 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => copyToClipboard(issuedCode || '')}
                    className="relative group cursor-pointer mb-12"
                 >
                    <div className="absolute inset-0 bg-primary/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity rounded-full" />
                    <div className="relative bg-slate-900 rounded-[2.5rem] p-10 border border-white/10 shadow-2xl flex flex-col items-center justify-center gap-4 overflow-hidden">
                       <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
                       <p className="text-4xl font-black text-white tracking-[0.2em] italic font-black break-all leading-tight">{issuedCode}</p>
                       <div className="flex items-center gap-2 text-primary">
                          {isCopied ? <><Check size={14} strokeWidth={4} /> <span className="text-[9px] font-black tracking-widest">Logic Copied!</span></> : <><Copy size={14} /> <span className="text-[9px] font-black tracking-widest">Click to Copy Code</span></>}
                       </div>
                    </div>
                    {/* Floating Glow Icon */}
                    <div className="absolute -top-4 -right-4 w-12 h-12 bg-white rounded-2xl shadow-xl flex items-center justify-center text-slate-400 border border-slate-100">
                       <MousePointer2 size={20} />
                    </div>
                 </motion.div>

                 <button onClick={() => setIssuedCode(null)} className="w-full py-6 bg-slate-900 text-white rounded-[2rem] text-xs font-black uppercase tracking-[0.3em] hover:bg-emerald-500 transition-all shadow-2xl hover:shadow-emerald-500/20 active:scale-95">
                    Audit Finished
                 </button>
              </motion.div>
           </div>
         )}
      </AnimatePresence>
    </div>
  );
}
