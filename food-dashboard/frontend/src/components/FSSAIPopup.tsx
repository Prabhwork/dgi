"use client";

import React, { useState, useEffect } from 'react';
import { ShieldCheck, Upload, AlertTriangle, ArrowRight, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';

interface FSSAIPopupProps {
  businessName: string;
  initialPending?: boolean;
  onSuccess: () => void;
  onSkip?: () => void;
}

export default function FSSAIPopup({ businessName, initialPending = false, onSuccess, onSkip }: FSSAIPopupProps) {
  const [fssaiNumber, setFssaiNumber] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isPending, setIsPending] = useState(initialPending);

  useEffect(() => {
    setIsPending(initialPending);
  }, [initialPending]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fssaiNumber) {
      setError('FSSAI License Number is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let fssaiImageUrl = '';
      if (file) {
        const formData = new FormData();
        formData.append('image', file);
        // Upload file first
        const uploadRes = await api.post('/upload', formData);
        fssaiImageUrl = uploadRes.url || '';
      }

      await api.post('/admin/fssai-submission', {
        fssaiNumber,
        fssaiImageUrl,
        businessName
      });

      setIsPending(true);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to submit details');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100"
      >
        <div className={`${isPending ? 'bg-sky-50 border-sky-100' : 'bg-amber-50 border-amber-100'} p-6 border-b text-center relative overflow-hidden transition-colors`}>
           <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 ${isPending ? 'bg-sky-500/10' : 'bg-amber-500/10'}`} />
           <div className={`w-16 h-16 bg-white rounded-2xl mx-auto flex items-center justify-center shadow-sm border mb-4 relative z-10 ${isPending ? 'border-sky-100 text-sky-500' : 'border-amber-100 text-amber-500'}`}>
              {isPending ? <Clock size={32} /> : <ShieldCheck size={32} />}
           </div>
           <h2 className="text-xl font-black text-slate-800 uppercase italic tracking-tight relative z-10">
              {isPending ? 'Verification Pending' : 'Compliance Required'}
           </h2>
           <p className="text-xs font-bold text-slate-500 mt-2 uppercase tracking-widest relative z-10">
              {isPending ? 'Awaiting moderation by DBI Admin' : 'Verify FSSAI License to unlock features'}
           </p>
        </div>

        {isPending ? (
          <div className="p-10 text-center space-y-6">
             <div className="inline-flex h-12 w-12 rounded-full border-4 border-sky-100 border-t-sky-500 animate-spin" />
             <div className="space-y-2">
                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-800">Review In Progress</h3>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest leading-relaxed">
                   Your compliance document has been safely submitted. The DBI Admin team is currently verifying your details. Access to the dashboard will be automatically unlocked upon approval.
                </p>
             </div>
             <button onClick={() => window.location.reload()} className="w-full mt-4 bg-slate-50 hover:bg-slate-100 text-slate-600 font-black uppercase tracking-widest py-4 rounded-2xl text-[10px] transition-all">
                Check Status Again
             </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-xs font-bold uppercase tracking-widest border border-red-100 flex items-center gap-2">
                 <AlertTriangle size={14} /> {error}
              </div>
            )}

            <div className="space-y-2">
               <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">FSSAI License Number <span className="text-red-500">*</span></label>
               <input 
                 type="text" 
                 value={fssaiNumber}
                 onChange={(e) => setFssaiNumber(e.target.value)}
                 placeholder="14 Digit FSSAI Number"
                 className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all uppercase tracking-widest text-slate-700"
                 maxLength={14}
               />
            </div>

            <div className="space-y-2">
               <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Upload Certificate (Optional)</label>
               <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 cursor-pointer hover:bg-slate-100 hover:border-amber-500/50 transition-all group">
                  <div className="text-center space-y-2">
                     <Upload size={24} className="mx-auto text-slate-400 group-hover:text-amber-500 transition-colors" />
                     <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                       {file ? file.name : "Click or drag image here"}
                     </p>
                  </div>
                  <input type="file" className="hidden" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
               </label>
            </div>

            <div className="pt-4 flex flex-col gap-3">
               <button 
                 type="submit"
                 disabled={loading}
                 className="w-full bg-amber-500 hover:bg-amber-600 text-white font-black uppercase tracking-[0.2em] py-4 rounded-2xl text-xs shadow-xl shadow-amber-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
               >
                  {loading ? 'Submitting...' : 'Submit Verification'} <ArrowRight size={14} />
               </button>
               
               {onSkip && !isPending && (
                  <button 
                    type="button"
                    onClick={onSkip}
                    className="w-full text-slate-400 hover:text-slate-600 font-black uppercase tracking-widest py-2 text-[10px] transition-all"
                  >
                    Skip for now
                  </button>
               )}
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}
