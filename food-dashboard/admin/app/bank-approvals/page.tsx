"use client";

import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { 
    CheckCircle, 
    XCircle, 
    Clock, 
    Building2,
    ShieldCheck,
    Search,
    ChevronRight,
    ArrowLeft
} from 'lucide-react';
import Link from 'next/link';

export default function BankApprovalsPage() {
    const [approvals, setApprovals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');

    const fetchApprovals = async () => {
        try {
            const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
            const res = await api.get('/admin/bank-approvals', { 
                headers: { Authorization: `Bearer ${token}` } 
            });
            setApprovals(res || []);
        } catch (err) {
            console.error('Failed to fetch approvals:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApprovals();
    }, []);

    const handleAction = async (id: string, status: string, reason?: string) => {
        try {
            const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
            await api.patch(`/admin/bank-approvals/${id}`, { 
                status, 
                rejectionReason: reason 
            }, { 
                headers: { Authorization: `Bearer ${token}` } 
            });
            fetchApprovals();
        } catch (err) {
            alert('Action failed');
        }
    };

    const filtered = approvals.filter((a: any) => 
        (a.partnerBusinessName || '').toLowerCase().includes(filter.toLowerCase()) ||
        (a.holderName || '').toLowerCase().includes(filter.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <Link href="/" className="flex items-center gap-2 text-sm text-slate-500 hover:text-teal-600 transition-colors mb-4 group w-fit">
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        Back to Overview
                    </Link>
                    <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                        <ShieldCheck className="text-teal-500" size={32} />
                        Bank Approvals
                    </h1>
                    <p className="text-slate-500 mt-1">Review and verify partner banking credentials for automated payouts.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                        <h3 className="font-bold text-slate-900 mb-4">Filters</h3>
                        <div className="relative">
                            <Search className="absolute left-3 top-3 text-slate-400" size={18} />
                            <input 
                                type="text"
                                placeholder="Search partners..."
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                            />
                        </div>
                    </div>

                    <div className="bg-teal-50 p-6 rounded-2xl border border-teal-100">
                        <h3 className="font-bold text-teal-900 mb-2 flex items-center gap-2 text-sm">
                            <Clock size={16} />
                            SLA Tracking
                        </h3>
                        <p className="text-teal-700 text-xs leading-relaxed">Ensure you review details within 24 hours of submission to maintain service standards.</p>
                    </div>
                </div>

                <div className="lg:col-span-3 space-y-4">
                    {loading ? (
                        [1, 2, 3].map(i => <div key={i} className="h-48 bg-white/50 animate-pulse rounded-2xl border border-slate-100"></div>)
                    ) : filtered.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                                <ShieldCheck size={32} />
                            </div>
                            <h3 className="font-bold text-slate-900">Queue is empty</h3>
                            <p className="text-slate-500 text-sm mt-1">No pending bank approvals found matching your search.</p>
                        </div>
                    ) : (
                        filtered.map((approval: any) => (
                            <div key={approval._id} className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all p-6 group">
                                <div className="flex flex-col md:flex-row justify-between gap-6">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
                                                {approval.partnerBusinessName[0]}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-900">{approval.partnerBusinessName}</h3>
                                                <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
                                                    <span className="flex items-center gap-1"><Building2 size={12} /> {approval.id}</span>
                                                    <span className="flex items-center gap-1"><Clock size={12} /> Submitted: {new Date(approval.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 p-4 bg-slate-50 rounded-xl">
                                            <div>
                                                <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">Bank Name</div>
                                                <div className="text-sm font-semibold text-slate-700">{approval.bankName}</div>
                                            </div>
                                            <div>
                                                <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">IFSC Code</div>
                                                <div className="text-sm font-semibold text-slate-700 uppercase">{approval.ifscCode}</div>
                                            </div>
                                            <div>
                                                <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">A/C Number</div>
                                                <div className="text-sm font-black text-slate-900 tracking-wider whitespace-nowrap">{approval.accountNumber}</div>
                                            </div>
                                            <div>
                                                <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">Holder Name</div>
                                                <div className="text-sm font-semibold text-slate-700 uppercase tracking-tight">{approval.holderName}</div>
                                            </div>
                                            <div>
                                                <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">Branch</div>
                                                <div className="text-sm font-medium text-slate-500 italic text-[11px] truncate">{approval.branch || 'N/A'}</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex md:flex-col justify-end gap-2 shrink-0 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6">
                                        <button 
                                            onClick={() => handleAction(approval._id, 'Approved')}
                                            className="flex-1 md:w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-500 hover:bg-teal-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-teal-100 transition-all active:scale-95"
                                        >
                                            <CheckCircle size={16} />
                                            Approve
                                        </button>
                                        <button 
                                            onClick={() => {
                                                const reason = prompt('Reason for rejection:');
                                                if (reason) handleAction(approval._id, 'Rejected', reason);
                                            }}
                                            className="flex-1 md:w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-rose-100 hover:bg-rose-50 text-rose-500 rounded-xl text-sm font-bold transition-all active:scale-95"
                                        >
                                            <XCircle size={16} />
                                            Reject
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
