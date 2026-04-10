"use client";

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Building2, 
  Phone,
  Eye,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';

export default function ModerationPage() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [bankSubmissions, setBankSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'fssai' | 'bank'>('fssai');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [fssaiData, bankData] = await Promise.all([
        api.get('/admin/fssai-submissions'),
        api.get('/admin/bank-approvals')
      ]);
      setSubmissions(fssaiData || []);
      setBankSubmissions(bankData || []);
    } catch (err) {
      console.error('Failed to fetch moderation data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApproveFSSAI = async (id: string) => {
    try {
      await api.patch(`/admin/fssai-submissions/${id}`, { status: 'Approved' });
      alert('FSSAI Approved successfully!');
      fetchData();
    } catch (err) {
      alert('Failed to approve FSSAI');
    }
  };

  const handleRejectFSSAI = async (id: string) => {
    const reason = prompt('Reason for rejection?');
    if (!reason) return;
    try {
      await api.patch(`/admin/fssai-submissions/${id}`, { status: 'Rejected', adminNote: reason });
      alert('FSSAI Rejected');
      fetchData();
    } catch (err) {
      alert('Failed to reject FSSAI');
    }
  };

  const handleApproveBank = async (id: string) => {
    try {
      await api.patch(`/admin/bank-approvals/${id}`, { status: 'Approved' });
      alert('Bank Details Approved!');
      fetchData();
    } catch (err) {
      alert('Failed to approve Bank Details');
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
          <h2 className="text-3xl font-black text-slate-800 tracking-tight italic uppercase">Moderation Console</h2>
          <p className="text-sm font-semibold text-slate-400 mt-1 uppercase tracking-tighter italic font-bold">Review and approve partner documents and bank details</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 p-1 bg-slate-100 w-fit rounded-2xl">
        <button 
          onClick={() => setTab('fssai')}
          className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${tab === 'fssai' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          FSSAI Compliance
        </button>
        <button 
          onClick={() => setTab('bank')}
          className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${tab === 'bank' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Bank Approvals
        </button>
      </div>

      {tab === 'fssai' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {submissions.map((sub, idx) => (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              key={sub._id} 
              className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${sub.status === 'Approved' ? 'bg-emerald-50 text-emerald-500' : 'bg-amber-50 text-amber-500'}`}>
                      {sub.status === 'Approved' ? <CheckCircle2 size={20} /> : <Clock size={20} />}
                   </div>
                   <div>
                      <h4 className="text-sm font-black text-slate-800 uppercase italic leading-none">{sub.businessName || 'DGI Partner'}</h4>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID: {sub.partnerId}</span>
                   </div>
                </div>
                <span className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${sub.status === 'Approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                   {sub.status}
                </span>
              </div>

              <div className="p-6 space-y-4 flex-1">
                 <div className="p-4 bg-slate-50 rounded-2xl space-y-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">FSSAI License No.</p>
                    <p className="text-sm font-black text-slate-800 tracking-widest">{sub.fssaiNumber}</p>
                 </div>

                 {sub.fssaiImageUrl ? (
                   <div className="relative group aspect-video rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                      <img src={sub.fssaiImageUrl} alt="FSSAI Certificate" className="w-full h-full object-cover transition-transform group-hover:scale-110 cursor-pointer" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                         <a href={sub.fssaiImageUrl} target="_blank" className="bg-white text-slate-800 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2">
                            <Eye size={14} /> Full View
                         </a>
                      </div>
                   </div>
                 ) : (
                   <div className="aspect-video rounded-2xl bg-red-50 border border-red-100 flex flex-col items-center justify-center text-red-500 gap-2">
                      <AlertTriangle size={24} />
                      <span className="text-[10px] font-black uppercase tracking-widest">No Certificate Uploaded</span>
                   </div>
                 )}
              </div>

              {sub.status === 'Pending' && (
                <div className="p-6 pt-0 flex gap-3">
                   <button 
                     onClick={() => handleApproveFSSAI(sub._id)}
                     className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
                   >
                     Approve
                   </button>
                   <button 
                     onClick={() => handleRejectFSSAI(sub._id)}
                     className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all"
                   >
                     Reject
                   </button>
                </div>
              )}
            </motion.div>
          ))}
          {submissions.length === 0 && (
            <div className="col-span-full py-20 text-center text-xs font-black text-slate-400 uppercase tracking-[0.2em] italic">No pending FSSAI submissions</div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
           {bankSubmissions.map((sub, idx) => (
             <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ delay: idx * 0.05 }}
               key={sub._id} 
               className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col"
             >
               <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                        <Building2 size={20} />
                     </div>
                     <div>
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Partner ID</h4>
                        <span className="text-sm font-black text-slate-800 tracking-tight uppercase italic">{sub.partnerId}</span>
                     </div>
                  </div>
                  <span className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${sub.status === 'Approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                    {sub.status}
                  </span>
               </div>

               <div className="p-6 space-y-4 flex-1">
                  <div className="grid grid-cols-2 gap-4">
                     <div className="p-4 bg-slate-50 rounded-2xl space-y-1">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">A/C Number</p>
                        <p className="text-xs font-black text-slate-800 tracking-widest">{sub.accountNumber}</p>
                     </div>
                     <div className="p-4 bg-slate-50 rounded-2xl space-y-1">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">IFSC Code</p>
                        <p className="text-xs font-black text-slate-800 tracking-widest">{sub.ifscCode}</p>
                     </div>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl space-y-1">
                     <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Account Name</p>
                     <p className="text-xs font-black text-slate-800 uppercase italic">{sub.accountName}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl space-y-1">
                     <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Bank Name</p>
                     <p className="text-xs font-black text-slate-800 uppercase italic">{sub.bankName}</p>
                  </div>
               </div>

               {sub.status === 'Pending' && (
                <div className="p-6 pt-0 flex gap-3">
                   <button 
                     onClick={() => handleApproveBank(sub._id)}
                     className="flex-1 bg-primary hover:bg-primary/90 text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 active:scale-95 transition-all"
                   >
                     Approve
                   </button>
                </div>
               )}
             </motion.div>
           ))}
           {bankSubmissions.length === 0 && (
            <div className="col-span-full py-20 text-center text-xs font-black text-slate-400 uppercase tracking-[0.2em] italic">No pending bank approvals</div>
          )}
        </div>
      )}
    </div>
  );
}
