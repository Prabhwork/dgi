"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await axios.post(`${process.env.NEXT_PUBLIC_FOOD_API_URL}/admin/login`, { 
                email, 
                password 
            });

            if (res.data.success && res.data.token) {
                localStorage.setItem('adminToken', res.data.token);
                router.push('/');
            } else {
                setError('Login failed');
            }
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || 'An error occurred during login';
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <div className="w-12 h-12 rounded-xl bg-teal-500 flex items-center justify-center text-xl font-bold text-white shadow-lg">DBI</div>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Admin Login</h1>
                    <p className="text-sm text-slate-500 mt-2">Manage partners, bank approvals and moderation</p>
                </div>

                {error && (
                    <div className="mb-6 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100 flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-red-600 block"></span>
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all placeholder:text-slate-400"
                            placeholder="admin@dbi.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all placeholder:text-slate-400"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-teal-500 hover:bg-teal-600 active:scale-[0.98] text-white font-semibold py-3 rounded-xl shadow-lg shadow-teal-100 transition-all disabled:opacity-70 flex justify-center items-center"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : 'Sign in to Console'}
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-slate-50 text-center">
                    <p className="text-xs text-slate-400">© 2026 Admin Management System • DBI India</p>
                </div>
            </div>
        </div>
    );
}
