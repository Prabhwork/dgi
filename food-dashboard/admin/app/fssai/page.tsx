"use client";

import React, { useState, useEffect } from 'react';
import { ShieldCheck, CheckCircle2, XCircle, FileImage } from 'lucide-react';

export default function FSSAIModeration() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('Pending');

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const FOOD_API = process.env.NEXT_PUBLIC_FOOD_API_URL;
      const res = await fetch(`${FOOD_API}/admin/fssai-submissions?status=${filter}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
      });
      const data = await res.json();
      setSubmissions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch FSSAI submissions', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [filter]);

  const handleAction = async (id: string, newStatus: string) => {
    try {
      const FOOD_API = process.env.NEXT_PUBLIC_FOOD_API_URL ;
      await fetch(`${FOOD_API}/admin/fssai-submissions/${id}`, {
        method: 'PATCH',
        headers: { 
           'Content-Type': 'application/json',
           'Authorization': `Bearer ${localStorage.getItem('adminToken')}` 
        },
        body: JSON.stringify({ status: newStatus })
      });
      fetchSubmissions();
    } catch (err) {
      console.error(`Failed to ${newStatus} submission`, err);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 font-bold uppercase italic">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3 italic">
            <ShieldCheck size={36} className="text-amber-500" />
            FSSAI Approvals
          </h1>
          <p className="text-slate-500 mt-1 uppercase font-black text-xs tracking-widest">Verify Food Quality Standards Compliance</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-2xl">
           {['Pending', 'Approved', 'Rejected'].map(s => (
             <button
               key={s}
               onClick={() => setFilter(s)}
               className={`px-6 py-2 rounded-xl text-xs font-black tracking-widest transition-all ${filter === s ? 'bg-white shadow-sm text-amber-600' : 'text-slate-500 hover:text-slate-800'}`}
             >
               {s}
             </button>
           ))}
        </div>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center bg-white rounded-3xl border-2 border-dashed border-slate-100">
           <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : submissions.length === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center bg-white rounded-3xl border-2 border-dashed border-slate-100 space-y-4">
           <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300"><ShieldCheck size={32} /></div>
           <p className="text-slate-400 text-sm font-black uppercase tracking-widest italic">No {filter} FSSAI submissions found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {submissions.map(sub => (
            <div key={sub._id} className="bg-white rounded-[2rem] border border-slate-100 p-6 flex flex-col md:flex-row gap-6 shadow-sm hover:shadow-md transition-all">
               {/* Image Preview */}
               <div className="w-full md:w-48 h-48 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {sub.fssaiImageUrl ? (
                    <img src={sub.fssaiImageUrl} alt="FSSAI Cert" className="w-full h-full object-cover hover:scale-110 transition-transform cursor-pointer" />
                  ) : (
                    <div className="text-slate-300 flex flex-col items-center gap-2">
                       <FileImage size={32} />
                       <span className="text-[10px] uppercase font-black tracking-widest">No Image</span>
                    </div>
                  )}
               </div>

               {/* Details */}
               <div className="flex-1 flex flex-col">
                  <div className="flex items-start justify-between">
                     <div>
                        <div className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1 flex items-center gap-1">
                           <ShieldCheck size={12} /> FSSAI Details
                        </div>
                        <h3 className="text-xl font-black text-slate-800 leading-tight">{sub.businessName}</h3>
                        <p className="text-xs text-slate-500 mt-2 bg-slate-50 inline-block px-3 py-1 rounded-lg border border-slate-100">LIC: {sub.fssaiNumber}</p>
                     </div>
                     <span className={`text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-widest border ${
                        sub.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                        sub.status === 'Rejected' ? 'bg-red-50 text-red-600 border-red-100' :
                        'bg-amber-50 text-amber-600 border-amber-100'
                     }`}>
                        {sub.status}
                     </span>
                  </div>

                  <div className="mt-auto pt-6 flex gap-3">
                     {sub.status === 'Pending' && (
                        <>
                          <button onClick={() => handleAction(sub._id, 'Approved')} className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all">
                             <CheckCircle2 size={16} /> Approve
                          </button>
                          <button onClick={() => handleAction(sub._id, 'Rejected')} className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all">
                             <XCircle size={16} /> Reject
                          </button>
                        </>
                     )}
                     {sub.status !== 'Pending' && (
                        <div className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">
                          Reviewed On: {new Date(sub.reviewedAt).toLocaleDateString()}
                        </div>
                     )}
                  </div>
               </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
