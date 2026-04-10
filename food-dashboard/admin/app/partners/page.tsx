"use client";

import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { 
    Users, 
    Building2,
    Search,
    ShieldAlert,
    ShieldCheck,
    Mail,
    Phone,
    Filter,
    ArrowLeft
} from 'lucide-react';
import Link from 'next/link';

export default function PartnersPage() {
    const [partners, setPartners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('All');

    const fetchPartners = async () => {
        try {
            const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
            const res = await api.get('/admin/partners', { 
                headers: { Authorization: `Bearer ${token}` } 
            });
            setPartners(res || []);
        } catch (err) {
            console.error('Failed to fetch partners:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPartners();
    }, []);

    const toggleStatus = async (id: string, currentStatus: string) => {
        try {
            const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
            const newStatus = currentStatus === 'Active' ? 'Suspended' : 'Active';
            await api.patch(`/admin/partners/${id}/status`, { 
                status: newStatus 
            }, { 
                headers: { Authorization: `Bearer ${token}` } 
            });
            fetchPartners();
        } catch (err) {
            alert('Action failed');
        }
    };

    const filtered = partners.filter((p: any) => 
        (p.businessName.toLowerCase().includes(filter.toLowerCase()) || 
         p.ownerName.toLowerCase().includes(filter.toLowerCase())) &&
        (selectedStatus === 'All' || p.status === selectedStatus)
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <Link href="/" className="flex items-center gap-2 text-sm text-slate-500 hover:text-teal-600 transition-colors mb-4 group w-fit">
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        Back to Overview
                    </Link>
                    <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                        <Building2 className="text-teal-500" size={32} />
                        Partner Management
                    </h1>
                    <p className="text-slate-500 mt-1">Manage food businesses, audit profiles, and control platform access.</p>
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-3 text-slate-400" size={18} />
                        <input 
                            type="text"
                            placeholder="Find partner or owner..."
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter size={18} className="text-slate-400" />
                        <select 
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm font-medium text-slate-600"
                        >
                            <option value="All">All Statuses</option>
                            <option value="Active">Active</option>
                            <option value="Suspended">Suspended</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full border-separate border-spacing-y-2">
                        <thead>
                            <tr className="text-left">
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-50/50 rounded-l-xl">Business / Owner</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-50/50">Contact Info</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-50/50">Joined On</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-50/50">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-50/50 rounded-r-xl">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                [1, 2, 3].map(i => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={5} className="h-16 bg-slate-50/20 rounded-xl"></td>
                                    </tr>
                                ))
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-12 text-center text-slate-500 italic">No partners found matching criteria.</td>
                                </tr>
                            ) : (
                                filtered.map((partner: any) => (
                                    <tr key={partner._id} className="group hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-6 border-b border-slate-50">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${partner.status === 'Active' ? 'bg-teal-50 text-teal-600' : 'bg-rose-50 text-rose-600'}`}>
                                                    {partner.businessName[0]}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-900 group-hover:text-teal-600 transition-colors">{partner.businessName}</div>
                                                    <div className="text-xs text-slate-400">{partner.ownerName} • {partner.id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6 border-b border-slate-50">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                                                    <Mail size={12} className="text-slate-400" />
                                                    {partner.email}
                                                </div>
                                                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                                    <Phone size={12} className="text-slate-400" />
                                                    +91 {partner.phone}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6 border-b border-slate-50 text-xs text-slate-500 font-medium uppercase tracking-tight">
                                            {new Date(partner.createdAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </td>
                                        <td className="px-6 py-6 border-b border-slate-50">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                partner.status === 'Active' 
                                                ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                                                : 'bg-rose-50 text-rose-600 border border-rose-100'
                                            }`}>
                                                {partner.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-6 border-b border-slate-50">
                                            <button 
                                                onClick={() => toggleStatus(partner._id, partner.status)}
                                                className={`flex items-center gap-2 group/btn px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                                                    partner.status === 'Active' 
                                                    ? 'bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white' 
                                                    : 'bg-teal-50 text-teal-600 hover:bg-teal-600 hover:text-white'
                                                }`}
                                            >
                                                {partner.status === 'Active' ? (
                                                    <>
                                                        <ShieldAlert size={14} className="group-hover/btn:scale-110 transition-transform" />
                                                        Suspend
                                                    </>
                                                ) : (
                                                    <>
                                                        <ShieldCheck size={14} className="group-hover/btn:scale-110 transition-transform" />
                                                        Re-activate
                                                    </>
                                                )}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
