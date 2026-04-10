"use client";

import { useEffect, useState } from 'react';
import { api } from './lib/api';
import { 
    Users, 
    ShieldCheck, 
    ShieldAlert, 
    TrendingUp, 
    Clock,
    ArrowRight,
    Banknote
} from 'lucide-react';
import { usePartner } from './lib/PartnerContext';
import Link from 'next/link';

export default function DashboardPage() {
    const { selectedPartner, isGlobal } = usePartner();
    const [stats, setStats] = useState({
        pendingApprovals: 0,
        pendingSettlements: 0,
        activePartners: 0,
        suspendedPartners: 0,
        bannedProducts: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
                const config = { headers: { Authorization: `Bearer ${token}` } };
                
                const [approvals, settlements, partners, products] = await Promise.all([
                    api.get('/admin/bank-approvals', config),
                    api.get('/admin/settlements', config),
                    api.get('/admin/partners', config),
                    api.get('/admin/products', config)
                ]);

                setStats({
                    pendingApprovals: approvals.length,
                    pendingSettlements: settlements.length,
                    activePartners: partners.filter((p: any) => p.status === 'Active').length,
                    suspendedPartners: partners.filter((p: any) => p.status === 'Suspended').length,
                    bannedProducts: products.filter((p: any) => p.isBanned).length
                });
            } catch (err) {
                console.error('Failed to fetch stats:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const statCards = [
        { name: 'Pending Bank Approvals', value: stats.pendingApprovals, icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50', link: '/bank-approvals' },
        { name: 'Settlement Requests', value: stats.pendingSettlements, icon: Banknote, color: 'text-orange-600', bg: 'bg-orange-50', link: '/settlements' },
        { name: 'Active Partners', value: stats.activePartners, icon: Users, color: 'text-teal-600', bg: 'bg-teal-50', link: '/partners' },
        { name: 'Banned Products', value: stats.bannedProducts, icon: ShieldAlert, color: 'text-slate-600', bg: 'bg-slate-50', link: '/moderation' },
    ];

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                    {isGlobal ? (
                        <>Console Overview</>
                    ) : (
                        <>
                            <span className="text-slate-400">Monitoring:</span> 
                            <span className="text-teal-600">{selectedPartner?.businessName}</span>
                        </>
                    )}
                </h1>
                <p className="text-slate-500 mt-1">
                    {isGlobal 
                        ? "Welcome back. Here's what's happening across the platform." 
                        : `Viewing actual traction and live metrics for ${selectedPartner?.businessName}.`
                    }
                </p>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-32 bg-white rounded-2xl border border-slate-100"></div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {statCards.map((card) => (
                        <Link key={card.name} href={card.link}>
                            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all hover:border-teal-100 group">
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`p-2.5 rounded-xl ${card.bg} ${card.color}`}>
                                        <card.icon size={24} />
                                    </div>
                                    <div className="text-slate-300 group-hover:text-teal-500 transition-colors">
                                        <TrendingUp size={16} />
                                    </div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-slate-900">{card.value}</div>
                                    <div className="text-sm text-slate-500 font-medium">{card.name}</div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
                    <h3 className="text-lg font-bold text-slate-900 mb-2">DBI Compliance Portal</h3>
                    <p className="text-slate-500 text-sm mb-6">Review partner documentation and enforce platform standards. Your moderation actions are permanent and affect real-time visibility.</p>
                    <div className="space-y-4">
                        <Link href="/bank-approvals" className="flex items-center justify-between p-4 rounded-xl bg-slate-50 hover:bg-emerald-50 transition-colors group">
                            <div className="flex items-center gap-3">
                                <ShieldCheck className="text-emerald-500" size={20} />
                                <span className="font-medium text-slate-700">Audit Bank Details</span>
                            </div>
                            <ArrowRight size={18} className="text-slate-300 group-hover:text-emerald-500" />
                        </Link>
                        <Link href="/settlements" className="flex items-center justify-between p-4 rounded-xl bg-slate-50 hover:bg-orange-50 transition-colors group">
                            <div className="flex items-center gap-3">
                                <Banknote className="text-orange-500" size={20} />
                                <span className="font-medium text-slate-700">Process Settlements</span>
                            </div>
                            <ArrowRight size={18} className="text-slate-300 group-hover:text-orange-500" />
                        </Link>
                        <Link href="/moderation" className="flex items-center justify-between p-4 rounded-xl bg-slate-50 hover:bg-rose-50 transition-colors group">
                             <div className="flex items-center gap-3">
                                <ShieldAlert className="text-rose-500" size={20} />
                                <span className="font-medium text-slate-700">Manage Sanctions</span>
                            </div>
                            <ArrowRight size={18} className="text-slate-300 group-hover:text-rose-500" />
                        </Link>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl shadow-teal-100">
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 text-teal-100 text-sm font-medium mb-4">
                            <Clock size={16} />
                            System Snapshot
                        </div>
                        <h2 className="text-3xl font-bold mb-4">Integrity Monitoring</h2>
                        <p className="text-teal-50 opacity-90 mb-8 max-w-sm">Every action taken in this panel is logged for audit purposes. Ensure you provide clear reasons for bans to maintain partner relationships.</p>
                        <button className="bg-white text-teal-600 font-bold px-6 py-3 rounded-xl hover:bg-teal-50 transition-colors shadow-sm">
                            Generate Audit Report
                        </button>
                    </div>
                    {/* Decorative Blobs */}
                    <div className="absolute -top-12 -right-12 w-64 h-64 bg-teal-400 rounded-full opacity-20 blur-3xl"></div>
                    <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-white rounded-full opacity-10 blur-2xl"></div>
                </div>
            </div>
        </div>
    );
}

function Building2(props: any) {
    return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg>;
}
