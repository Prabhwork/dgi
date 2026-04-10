"use client";

import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { 
    ShieldAlert, 
    Search,
    Filter,
    ArrowLeft,
    Store,
    Tag,
    AlertTriangle,
    Eye,
    Ban
} from 'lucide-react';
import Link from 'next/link';

export default function ModerationPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');
    const [view, setView] = useState('All'); // All, Banned

    const fetchProducts = async () => {
        try {
            const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
            const res = await api.get('/admin/products', { 
                headers: { Authorization: `Bearer ${token}` } 
            });
            setProducts(res || []);
        } catch (err) {
            console.error('Failed to fetch products:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleBan = async (id: string) => {
        const reason = prompt('Enter reason for banning this product:');
        if (!reason) return;

        try {
            const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
            await api.patch(`/admin/products/${id}/ban`, { 
                banReason: reason 
            }, { 
                headers: { Authorization: `Bearer ${token}` } 
            });
            fetchProducts();
        } catch (err) {
            alert('Action failed');
        }
    };

    const handleUnban = async (id: string) => {
        if (!confirm('Are you sure you want to reinstate this product?')) return;
        try {
            const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
            await api.patch(`/admin/products/${id}/unban`, {}, { 
                headers: { Authorization: `Bearer ${token}` } 
            });
            fetchProducts();
        } catch (err) {
            alert('Action failed');
        }
    };

    const filtered = products.filter((p: any) => 
        p.name.toLowerCase().includes(filter.toLowerCase()) &&
        (view === 'All' || (view === 'Banned' && p.isBanned))
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
                        <ShieldAlert className="text-rose-500" size={32} />
                        Content Moderation
                    </h1>
                    <p className="text-slate-500 mt-1">Audit platform content and enforce sanctions on problematic items.</p>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-64 shrink-0 space-y-6">
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                        <h3 className="font-bold text-slate-900 mb-4 text-sm uppercase tracking-widest">Filters</h3>
                        <div className="space-y-2">
                            {['All', 'Banned'].map((v) => (
                                <button 
                                    key={v}
                                    onClick={() => setView(v)}
                                    className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                                        view === v 
                                        ? 'bg-rose-50 text-rose-600 border border-rose-100' 
                                        : 'text-slate-600 hover:bg-slate-50'
                                    }`}
                                >
                                    {v} Products
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-rose-500 rounded-3xl p-6 text-white shadow-lg shadow-rose-100">
                        <AlertTriangle className="mb-4 opacity-50" size={32} />
                        <h3 className="font-bold mb-2">Zero Tolerance</h3>
                        <p className="text-rose-100 text-xs leading-relaxed">Banning a product hides it immediately from all customer-facing apps and restricts partner modifications.</p>
                    </div>
                </div>

                <div className="flex-1 space-y-6">
                    <div className="relative">
                        <Search className="absolute left-4 top-3.5 text-slate-400" size={20} />
                        <input 
                            type="text"
                            placeholder="Search globally for products..."
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-100 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm transition-all"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {loading ? (
                            [1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-48 bg-slate-100/50 animate-pulse rounded-2xl border border-slate-100"></div>)
                        ) : filtered.length === 0 ? (
                            <div className="col-span-full py-24 text-center">
                                <Search size={48} className="mx-auto text-slate-200 mb-4" />
                                <h3 className="text-slate-500 font-medium">No results found</h3>
                                <p className="text-slate-400 text-xs mt-1">Try adjusting your filters or search keywords.</p>
                            </div>
                        ) : (
                            filtered.map((product: any) => (
                                <div key={product._id} className={`bg-white rounded-3xl border ${product.isBanned ? 'border-rose-200 bg-rose-50/10' : 'border-slate-100'} shadow-sm overflow-hidden group hover:scale-[1.02] transition-all duration-300`}>
                                    <div className="aspect-video relative overflow-hidden bg-slate-50">
                                        <img 
                                            src={product.coverImage || product.images?.[0]} 
                                            alt={product.name}
                                            className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ${product.isBanned ? 'grayscale opacity-60' : ''}`}
                                        />
                                        {product.isBanned && (
                                            <div className="absolute inset-0 bg-rose-900/40 flex items-center justify-center backdrop-blur-[2px]">
                                                <Ban size={48} className="text-white opacity-80" />
                                            </div>
                                        )}
                                        <div className="absolute top-2 right-2 flex flex-col gap-2">
                                            <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-tight shadow-sm text-white ${product.isVeg ? 'bg-emerald-500' : 'bg-rose-500'}`}>
                                                {product.isVeg ? 'Veg' : 'Non-Veg'}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className="p-5">
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <h3 className="font-bold text-slate-900 leading-tight group-hover:text-rose-600 transition-colors line-clamp-1">{product.name}</h3>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1 mt-1">
                                                    <Tag size={10} /> {product.category}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm font-black text-slate-900">₹{product.price}</div>
                                            </div>
                                        </div>

                                        {product.isBanned ? (
                                            <>
                                                <div className="mt-4 p-3 bg-rose-50 rounded-xl border border-rose-100">
                                                    <div className="text-[10px] uppercase font-bold text-rose-400 mb-1">Ban Reason</div>
                                                    <p className="text-xs text-rose-600 italic leading-snug">"{product.banReason}"</p>
                                                </div>
                                                <div className="mt-4 flex gap-2">
                                                    <button 
                                                        onClick={() => handleUnban(product._id)}
                                                        className="flex-1 px-4 py-2 bg-rose-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-700 transition-all shadow-lg shadow-rose-600/20"
                                                    >
                                                        Revoke Restriction
                                                    </button>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="mt-6 flex items-center gap-2">
                                                <button 
                                                    onClick={() => handleBan(product._id)}
                                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-rose-100 text-rose-600 hover:bg-rose-600 hover:text-white rounded-xl text-xs font-bold transition-all active:scale-95 group/btn"
                                                >
                                                    <Ban size={14} className="group-hover/btn:rotate-12 transition-transform" />
                                                    Execute Ban
                                                </button>
                                                <button className="p-2.5 bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-xl transition-all">
                                                    <Eye size={18} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
