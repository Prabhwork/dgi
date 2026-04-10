"use client";

import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { 
    CheckCircle, 
    XCircle, 
    Clock, 
    Building2,
    Banknote,
    Search,
    ArrowLeft,
    Navigation,
    Calendar,
    IndianRupee,
    FileText
} from 'lucide-react';
import Link from 'next/link';

export default function SettlementRequestsPage() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');

    const fetchRequests = async () => {
        try {
            const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
            const res = await api.get('/admin/settlements', { 
                headers: { Authorization: `Bearer ${token}` } 
            });
            setRequests(res || []);
        } catch (err) {
            console.error('Failed to fetch settlement requests:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleAction = async (id: string, status: string, utrNumber?: string, note?: string) => {
        try {
            const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
            await api.patch(`/admin/settlements/${id}`, { 
                status, 
                utrNumber,
                adminNote: note 
            }, { 
                headers: { Authorization: `Bearer ${token}` } 
            });
            fetchRequests();
            alert(`Settlement ${status.toLowerCase()} successfully!`);
        } catch (err) {
            alert('Action failed');
        }
    };

    const filtered = requests.filter((r: any) => 
        (r.partnerBusinessName || '').toLowerCase().includes(filter.toLowerCase()) ||
        (r.id || '').toLowerCase().includes(filter.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <Link href="/" className="flex items-center gap-2 text-sm text-slate-500 hover:text-orange-600 transition-colors mb-4 group w-fit">
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        Back to Overview
                    </Link>
                    <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                        <Banknote className="text-orange-500" size={32} />
                        Settlement Requests
                    </h1>
                    <p className="text-slate-500 mt-1">Review and process withdrawal requests from partners.</p>
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
                                placeholder="Search by partner or ID..."
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                            />
                        </div>
                    </div>

                    <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100">
                        <h3 className="font-bold text-orange-900 mb-2 flex items-center gap-2 text-sm">
                            <Clock size={16} />
                            Settlement Policy
                        </h3>
                        <p className="text-orange-700 text-xs leading-relaxed">Parnters expect settlements within 24-48 hours. Ensure UTR is provided for all completed transfers.</p>
                    </div>
                </div>

                <div className="lg:col-span-3 space-y-4">
                    {loading ? (
                        [1, 2, 3].map(i => <div key={i} className="h-48 bg-white/50 animate-pulse rounded-2xl border border-slate-100"></div>)
                    ) : filtered.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                                <Banknote size={32} />
                            </div>
                            <h3 className="font-bold text-slate-900">No pending requests</h3>
                            <p className="text-slate-500 text-sm mt-1">All partner withdrawals have been processed.</p>
                        </div>
                    ) : (
                        filtered.map((request: any) => (
                            <div key={request._id} className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all p-6 group">
                                <div className="flex flex-col md:flex-row justify-between gap-6">
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold">
                                                    {request.partnerBusinessName?.[0] || 'B'}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-slate-900">{request.partnerBusinessName}</h3>
                                                    <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
                                                        <span className="flex items-center gap-1"><Building2 size={12} /> {request.partnerId}</span>
                                                        <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(request.requestedAt || request.createdAt).toLocaleString()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-2xl font-black text-slate-900 tracking-tighter flex items-center justify-end gap-1">
                                                   <IndianRupee size={20} className="text-emerald-500" />
                                                   {request.amount.toLocaleString()}
                                                </div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{request.id}</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                            <div className="space-y-1">
                                                <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1">
                                                    <Navigation size={10} /> Destination Bank
                                                </div>
                                                <div className="text-sm font-black text-slate-800 tracking-tight">{request.bank}</div>
                                                <div className="text-[10px] font-bold text-slate-400 italic">Verify account details before processing</div>
                                            </div>
                                            <div className="space-y-1">
                                                 <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1">
                                                    <FileText size={10} /> Request Status
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`w-2 h-2 rounded-full ${request.status === 'Pending' ? 'bg-amber-500 animate-pulse' : 'bg-slate-300'}`}></span>
                                                        <span className={`text-sm font-black uppercase tracking-tight ${request.status === 'Pending' ? 'text-amber-600' : 'text-slate-500'}`}>{request.status}</span>
                                                    </div>
                                                    {new Date().getTime() - new Date(request.requestedAt || request.createdAt).getTime() > 24 * 60 * 60 * 1000 && request.status === 'Pending' && (
                                                        <span className="px-2 py-0.5 bg-rose-50 text-rose-500 text-[8px] font-black uppercase rounded border border-rose-100 animate-bounce">Overdue</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex md:flex-col justify-end gap-2 shrink-0 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 min-w-[160px]">
                                        <button 
                                            onClick={() => {
                                                const utr = prompt('Enter Bank UTR Number for this transfer:');
                                                if (utr) handleAction(request._id, 'Completed', utr);
                                            }}
                                            className="flex-1 md:w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-100 transition-all active:scale-95"
                                        >
                                            <CheckCircle size={16} />
                                            Complete
                                        </button>
                                        <button 
                                            onClick={() => {
                                                const reason = prompt('Reason for rejection (will be shown to partner):');
                                                if (reason) handleAction(request._id, 'Rejected', undefined, reason);
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
