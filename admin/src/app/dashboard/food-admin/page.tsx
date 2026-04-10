"use client";

import { useState } from 'react';
import {
    Utensils,
    ShieldAlert,
    Save,
    ExternalLink,
    AlertCircle,
    CheckCircle2,
    Lock,
    Mail
} from 'lucide-react';

export default function FoodAdminManagement() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            // Using the shared secret key from environment variables
            const secret = process.env.NEXT_PUBLIC_MANAGEMENT_SECRET || 'dbi_master_key_7721';

            const response = await fetch(`${process.env.NEXT_PUBLIC_FOOD_API_URL}/admin/managed-reset`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-management-secret': secret
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (data.success) {
                setMessage({ type: 'success', text: 'Food Dashboard Admin credentials have been updated successfully!' });
                setEmail('');
                setPassword('');
            } else {
                throw new Error(data.message || 'Remote reset failed');
            }
        } catch (err) {
            const errorMsg = (err as Error).message || 'Remote reset failed. Ensure the Food Backend is running.';
            setMessage({ type: 'error', text: errorMsg });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                    <Utensils className="text-teal-500" size={32} />
                    Food Console Management
                </h1>
                <p className="text-slate-500 mt-1">Remote administrative control for the Digital Book of India Food Ecosystem.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    {message.text && (
                        <div className={`p-4 rounded-xl flex items-center gap-3 border ${message.type === 'success'
                                ? 'bg-teal-50 border-teal-100 text-teal-700'
                                : 'bg-red-50 border-red-100 text-red-700'
                            }`}>
                            {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                            <p className="font-medium text-sm">{message.text}</p>
                        </div>
                    )}

                    <form onSubmit={handleReset} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                            <h2 className="text-lg font-bold text-slate-800">Reset Credentials</h2>
                            <p className="text-xs text-slate-500 mt-1">Use this form to forcibly update the Food Dashboard&apos;s master administrator account.</p>
                        </div>

                        <div className="p-8 space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                                        <Mail size={14} className="text-slate-400" />
                                        New Admin Email
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="food-admin@dbi.com"
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                                        <Lock size={14} className="text-slate-400" />
                                        New Master Password
                                    </label>
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-3">
                                <ShieldAlert className="text-amber-600 shrink-0" size={20} />
                                <div className="text-xs text-amber-700 leading-relaxed font-medium">
                                    <span className="font-bold">Caution:</span> This action is permanent. The existing admin will lose access immediately and must log in with these new details.
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-teal-500 hover:bg-teal-600 disabled:opacity-50 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-teal-500/20 transition-all flex items-center gap-2"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <Save size={18} />
                                )}
                                {loading ? 'Syncing...' : 'Update Food Admin'}
                            </button>
                        </div>
                    </form>
                </div>

                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 text-white shadow-xl">
                        <h3 className="text-xl font-bold mb-4">Quick Access</h3>
                        <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                            Once you&apos;ve updated the credentials, you can provide them to your staff and access the console directly using the link below.
                        </p>
                        <a
                            href={process.env.NEXT_PUBLIC_FOOD_CONSOLE_URL}
                            target="_blank"
                            className="flex items-center justify-center gap-2 w-full py-4 bg-white/10 hover:bg-white/20 rounded-2xl font-bold transition-all border border-white/10"
                        >
                            <ExternalLink size={18} />
                            Open Food Console
                        </a>
                    </div>

                    <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
                        <h4 className="font-bold text-slate-800 mb-3 text-sm flex items-center gap-2">
                            <ShieldAlert className="text-teal-500" size={16} />
                            Management Protocol
                        </h4>
                        <ul className="space-y-3">
                            <li className="flex gap-2 text-xs text-slate-500 leading-snug">
                                <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-1 shrink-0"></span>
                                These credentials grant full data access to the Food ecosystem.
                            </li>
                            <li className="flex gap-2 text-xs text-slate-500 leading-snug">
                                <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-1 shrink-0"></span>
                                Resetting is only possible from this Main Admin Panel.
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
