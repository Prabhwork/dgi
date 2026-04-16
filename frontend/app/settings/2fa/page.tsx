"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

import { useTheme } from "@/components/ThemeProvider";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, ShieldAlert, KeyRound, QrCode, CheckCircle2 } from "lucide-react";

export default function TwoFactorAuthPage() {
    const { theme } = useTheme();
    const isLight = theme === 'light';
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [isEnabled, setIsEnabled] = useState(false);
    const [setupData, setSetupData] = useState<{ secret: string; qrCodeUrl: string } | null>(null);
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const token = localStorage.getItem("businessToken");
        if (!token) {
            router.push('/community/login');
            return;
        }

        const API = process.env.NEXT_PUBLIC_API_URL;
        fetch(`${API}/business/me`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(r => r.json())
        .then(res => {
            if (res.success && res.data) {
                setIsEnabled(res.data.isTwoFactorEnabled);
            } else {
                router.push('/community/login');
            }
        })
        .catch(() => router.push('/community/login'))
        .finally(() => setLoading(false));
    }, [router]);

    const handleEnableClick = async () => {
        setActionLoading(true);
        setError('');
        const token = localStorage.getItem("businessToken");
        const API = process.env.NEXT_PUBLIC_API_URL;
        
        try {
            const res = await fetch(`${API}/business/2fa/generate`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            const data = await res.json();
            
            if (data.success) {
                setSetupData({ secret: data.secret, qrCodeUrl: data.qrCodeUrl });
            } else {
                setError(data.error || 'Failed to generate 2FA setup');
            }
        } catch (err) {
            setError('Network error. Please try again later.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleVerifyAndEnable = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!setupData || otp.length < 6) return;
        
        setActionLoading(true);
        setError('');
        const token = localStorage.getItem("businessToken");
        const API = process.env.NEXT_PUBLIC_API_URL;
        
        try {
            const res = await fetch(`${API}/business/2fa/verify-enable`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ token: otp, secret: setupData.secret })
            });
            const data = await res.json();
            
            if (data.success) {
                setIsEnabled(true);
                setSetupData(null);
                setOtp('');
            } else {
                setError(data.error || 'Invalid OTP code');
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDisable = async (e: React.FormEvent) => {
        e.preventDefault();
        if (otp.length < 6) return;
        
        setActionLoading(true);
        setError('');
        const token = localStorage.getItem("businessToken");
        const API = process.env.NEXT_PUBLIC_API_URL;
        
        try {
            const res = await fetch(`${API}/business/2fa/disable`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ token: otp })
            });
            const data = await res.json();
            
            if (data.success) {
                setIsEnabled(false);
                setOtp('');
            } else {
                setError(data.error || 'Invalid OTP code');
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <div className={`min-h-screen flex items-center justify-center bg-background text-foreground`}>
                <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen relative overflow-hidden transition-colors bg-background text-foreground`}>
           

            <div className="relative z-10 flex flex-col min-h-screen">
                <Navbar />

                <main className="container mx-auto px-4 pt-32 pb-20 flex-1 max-w-3xl">
                    <div className={`rounded-3xl p-8 md:p-12 border backdrop-blur-xl shadow-xl ${isLight ? 'bg-white/90 border-slate-200' : 'bg-white/5 border-white/10'}`}>
                        <div className="flex items-center gap-4 mb-8">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                                isEnabled 
                                    ? 'bg-emerald-500/20 text-emerald-500' 
                                    : 'bg-primary/20 text-primary'
                            }`}>
                                {isEnabled ? <ShieldCheck size={28} /> : <ShieldAlert size={28} />}
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-black text-foreground">2-Step Verification</h1>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {isEnabled ? 'Your account is protected.' : 'Add an extra layer of security to your account.'}
                                </p>
                            </div>
                        </div>

                        {error && (
                            <div className="p-4 mb-6 bg-red-500/10 border border-red-500/30 rounded-xl text-red-500 text-sm font-medium flex items-center gap-2">
                                <ShieldAlert size={16} />
                                {error}
                            </div>
                        )}

                        {isEnabled ? (
                            <div className="space-y-6">
                                <div className="p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
                                    <h3 className="text-emerald-600 font-bold flex items-center gap-2 mb-2">
                                        <CheckCircle2 size={18} /> 2FA is Currently Enabled
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        You'll be asked for a code from your authenticator app whenever you sign in. 
                                        This helps ensure that only you can access your account, even if someone else knows your password.
                                    </p>
                                </div>
                                
                                <div className="pt-6 border-t border-border">
                                    <h3 className="text-lg font-bold text-foreground mb-4">Turn off 2-Step Verification</h3>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        To disable 2FA, please enter a code from your authenticator app to verify it's you.
                                    </p>
                                    <form onSubmit={handleDisable} className="flex gap-3 max-w-md">
                                        <input
                                            type="text"
                                            maxLength={6}
                                            required
                                            placeholder="6-digit code"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                            className={`flex-1 rounded-xl border px-4 h-12 text-center text-lg tracking-[0.2em] outline-none transition-colors ${
                                                isLight 
                                                    ? 'bg-white border-slate-300 focus:border-red-500 text-slate-900' 
                                                    : 'bg-white/5 border-white/10 focus:border-red-500/50 text-white'
                                            }`}
                                        />
                                        <button 
                                            type="submit" 
                                            disabled={actionLoading || otp.length < 6}
                                            className="px-6 h-12 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 disabled:opacity-50 transition-colors shrink-0"
                                        >
                                            {actionLoading ? 'Verifying...' : 'Disable 2FA'}
                                        </button>
                                    </form>
                                </div>
                            </div>
                        ) : setupData ? (
                            <div className="space-y-8 animate-in fade-in zoom-in duration-300">
                                <div>
                                    <h3 className="text-lg font-bold text-foreground mb-2 flex items-center gap-2">
                                        <span className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs">1</span>
                                        Scan the QR code
                                    </h3>
                                    <p className="text-sm text-muted-foreground pl-8">
                                        Open an authenticator app (like Google Authenticator or Authy) and scan this QR code.
                                    </p>
                                    <div className="mt-4 pl-8 flex flex-col md:flex-row gap-6 items-start">
                                        <div className="p-4 bg-white rounded-2xl inline-block shadow-sm">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={setupData.qrCodeUrl} alt="QR Code" className="w-40 h-40" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs text-muted-foreground font-medium mb-1 uppercase tracking-wider">Secret Key</p>
                                            <div className={`p-3 rounded-lg font-mono text-sm break-all ${isLight ? 'bg-slate-100' : 'bg-black/30'}`}>
                                                {setupData.secret}
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-2">
                                                If you can't scan the QR code, you can manually enter this secret key into your authenticator app.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-border">
                                    <h3 className="text-lg font-bold text-foreground mb-2 flex items-center gap-2">
                                        <span className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs">2</span>
                                        Verify the code
                                    </h3>
                                    <p className="text-sm text-muted-foreground pl-8 mb-4">
                                        Enter the 6-digit code generated by your app to verify and enable 2-Step Verification.
                                    </p>
                                    <form onSubmit={handleVerifyAndEnable} className="pl-8 flex gap-3 max-w-md">
                                        <input
                                            type="text"
                                            maxLength={6}
                                            required
                                            placeholder="000000"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                            className={`flex-1 rounded-xl border px-4 h-12 text-center text-lg tracking-[0.2em] outline-none transition-colors ${
                                                isLight 
                                                    ? 'bg-white border-slate-300 focus:border-primary text-slate-900' 
                                                    : 'bg-white/5 border-white/10 focus:border-primary/50 text-white'
                                            }`}
                                        />
                                        <button 
                                            type="submit" 
                                            disabled={actionLoading || otp.length < 6}
                                            className="px-6 h-12 rounded-xl bg-primary text-white font-bold hover:shadow-lg hover:shadow-primary/30 disabled:opacity-50 transition-all shrink-0"
                                        >
                                            {actionLoading ? 'Verifying...' : 'Enable'}
                                        </button>
                                    </form>
                                    <div className="pl-8 mt-4">
                                        <button 
                                            type="button" 
                                            onClick={() => setSetupData(null)}
                                            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            Cancel setup
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <p className="text-muted-foreground">
                                    Protect your account with Time-Based One-Time Passwords (TOTP). 
                                    When enabled, you'll need to enter a verification code from your authenticator app (like Google Authenticator) every time you sign in.
                                </p>
                                <div className="grid md:grid-cols-2 gap-4 py-4">
                                    <div className={`p-5 rounded-2xl flex gap-4 ${isLight ? 'bg-slate-50 border border-slate-200' : 'bg-black/20 border border-white/5'}`}>
                                        <div className="mt-1 text-primary"><KeyRound size={20} /></div>
                                        <div>
                                            <h4 className="font-bold text-foreground mb-1">Stronger Security</h4>
                                            <p className="text-xs text-muted-foreground">Requires both your password and your phone to sign in.</p>
                                        </div>
                                    </div>
                                    <div className={`p-5 rounded-2xl flex gap-4 ${isLight ? 'bg-slate-50 border border-slate-200' : 'bg-black/20 border border-white/5'}`}>
                                        <div className="mt-1 text-primary"><QrCode size={20} /></div>
                                        <div>
                                            <h4 className="font-bold text-foreground mb-1">Authenticator App</h4>
                                            <p className="text-xs text-muted-foreground">Use apps like Google Authenticator, Authy, or Microsoft Authenticator.</p>
                                        </div>
                                    </div>
                                </div>
                                <button 
                                    onClick={handleEnableClick}
                                    disabled={actionLoading}
                                    className="px-8 h-12 rounded-xl bg-primary text-white font-bold hover:shadow-lg hover:shadow-primary/30 transition-all disabled:opacity-50"
                                >
                                    {actionLoading ? 'Loading...' : 'Setup 2-Step Verification'}
                                </button>
                            </div>
                        )}
                    </div>
                </main>

                <Footer />
            </div>
        </div>
    );
}
