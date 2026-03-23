"use client";

import { useEffect, useState } from "react";
import { Search, CreditCard, RefreshCw, CheckCircle, Clock } from "lucide-react";

interface Transaction {
    _id: string;
    businessName: string;
    officialEmailAddress: string;
    primaryContactNumber: string;
    amountPaid: number;
    paymentStatus: string;
    razorpayPaymentId?: string;
    razorpayOrderId?: string;
    createdAt: string;
}

export default function TransactionsPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filter] = useState("all");

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('adminToken');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/business/transactions`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await res.json();
            if (data.success) {
                setTransactions(data.data);
            }
        } catch (error) {
            console.error("Failed to fetch transactions", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredTransactions = transactions.filter(t => {
        const matchesSearch = t.businessName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             t.officialEmailAddress.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             (t.razorpayPaymentId || "").toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filter === "all" || t.paymentStatus === filter;
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Payment Transactions</h1>
                    <p className="text-slate-500 mt-1">Monitor all successful Razorpay business registrations.</p>
                </div>
                <button 
                    onClick={fetchTransactions}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 text-slate-700 shadow-sm transition-all"
                >
                    <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh Data
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="relative flex-1 min-w-[300px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input 
                        type="text" 
                        placeholder="Search by business name, email, or Payment ID..."
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm text-slate-900"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
                    <button
                        className="px-4 py-1.5 rounded-md text-sm font-medium transition-all capitalize bg-white text-emerald-600 shadow-sm cursor-default"
                    >
                        Completed
                    </button>
                </div>
            </div>

            {/* List Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date & Time</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Business</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Payment Details</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Amount</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-900">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400">Loading transactions...</td>
                                </tr>
                            ) : filteredTransactions.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                                        <div className="flex flex-col items-center justify-center space-y-3">
                                            <CreditCard size={48} className="text-slate-200" />
                                            <p>No transactions found.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredTransactions.map(t => (
                                    <tr key={t._id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-sm text-slate-700 font-medium">
                                                <Clock size={14} className="text-slate-400" />
                                                {new Date(t.createdAt).toLocaleDateString()}
                                            </div>
                                            <div className="text-[10px] text-slate-400 mt-1 ml-6 uppercase tracking-wider">
                                                {new Date(t.createdAt).toLocaleTimeString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-slate-900">{t.businessName}</div>
                                            <div className="text-xs text-slate-500 flex flex-col gap-0.5 mt-1">
                                                <span>{t.officialEmailAddress}</span>
                                                <span>{t.primaryContactNumber}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1 text-xs">
                                                {t.razorpayPaymentId ? (
                                                    <span className="font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded w-fit">ID: {t.razorpayPaymentId}</span>
                                                ) : <span className="text-slate-400 italic">No Payment ID</span>}
                                                {t.razorpayOrderId && (
                                                    <span className="text-[10px] text-slate-400 mt-0.5 font-mono">Ord: {t.razorpayOrderId}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="text-lg font-bold font-mono text-slate-900">₹{t.amountPaid || '0.00'}</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex justify-center">
                                                <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider w-fit ${
                                                    t.paymentStatus === 'completed' ? 'bg-emerald-100/50 text-emerald-700 border border-emerald-200' :
                                                    t.paymentStatus === 'failed' ? 'bg-red-50 text-red-700 border border-red-200' :
                                                    'bg-amber-50 text-amber-700 border border-amber-200'
                                                }`}>
                                                    {t.paymentStatus === 'completed' && <CheckCircle size={12} />}
                                                    {t.paymentStatus || 'Pending'}
                                                </span>
                                            </div>
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
