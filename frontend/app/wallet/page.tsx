"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Wallet, Plus, History, ShieldCheck, Lock, AlertCircle, 
    CheckCircle2, Loader2, ArrowLeft, CreditCard,
    ChevronRight, ArrowUpRight, ArrowDownLeft, ShieldAlert, ArrowRight,
    Mail, KeyRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CursorGlow from "@/components/CursorGlow";
import ParticleNetworkWrapper from "@/components/ParticleNetworkWrapper";

const MAIN_API = process.env.NEXT_PUBLIC_API_URL;

export default function WalletPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [isRecharging, setIsRecharging] = useState(false);
    const [showPinModal, setShowPinModal] = useState(false);
    const [rechargeAmount, setRechargeAmount] = useState("");
    
    // Wallet State
    const [wallet, setWallet] = useState<{ balance: number; isPinSet: boolean; status: string } | null>(null);
    const [transactions, setTransactions] = useState<any[]>([]);

    // PIN Setup & Recovery State
    const [pin, setPin] = useState("");
    const [confirmPin, setConfirmPin] = useState("");
    const [isSettingPin, setIsSettingPin] = useState(false);
    
    // Recovery flow
    const [forgotMode, setForgotMode] = useState(false);
    const [recoveryStep, setRecoveryStep] = useState<"otp" | "reset">("otp");
    const [recoveryOtp, setRecoveryOtp] = useState("");
    const [isRecovering, setIsRecovering] = useState(false);
    const [otpSent, setOtpSent] = useState(false);

    useEffect(() => {
        fetchWalletData();
    }, []);

    const fetchWalletData = async () => {
        const token = localStorage.getItem("userToken");
        if (!token) {
            router.push("/login?redirect=/wallet");
            return;
        }

        try {
            const [balRes, transRes] = await Promise.all([
                fetch(`${MAIN_API}/wallet/balance`, {
                    headers: { "Authorization": `Bearer ${token}` }
                }),
                fetch(`${MAIN_API}/wallet/transactions`, {
                    headers: { "Authorization": `Bearer ${token}` }
                })
            ]);

            const balData = await balRes.json();
            const transData = await transRes.json();

            if (balData.success) setWallet(balData);
            if (transData.success) setTransactions(transData.data);
            
        } catch (err) {
            toast.error("Failed to load wallet data");
        } finally {
            setLoading(false);
        }
    };

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handleRecharge = async () => {
        const amount = parseFloat(rechargeAmount);
        if (isNaN(amount) || amount <= 0) {
            toast.error("Please enter a valid amount");
            return;
        }

        setIsRecharging(true);
        const token = localStorage.getItem("userToken");

        try {
            // 1. Create Order
            const orderRes = await fetch(`${MAIN_API}/wallet/recharge/order`, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ amount })
            });

            const orderData = await orderRes.json();
            if (!orderData.success) throw new Error(orderData.error);

            // 2. Load Razorpay
            const isLoaded = await loadRazorpayScript();
            if (!isLoaded) throw new Error("Razorpay SDK failed to load");

            const options = {
                key: orderData.keyId,
                amount: orderData.amount * 100,
                currency: "INR",
                name: "DBI Digital Wallet",
                description: `Add money to your wallet`,
                image: "/assets/DLOGO.png",
                order_id: orderData.orderId,
                handler: async function (response: any) {
                    try {
                        const verifyRes = await fetch(`${MAIN_API}/wallet/recharge/verify`, {
                            method: "POST",
                            headers: { 
                                "Content-Type": "application/json",
                                "Authorization": `Bearer ${token}`
                            },
                            body: JSON.stringify({
                                razorpayOrderId: response.razorpay_order_id,
                                razorpayPaymentId: response.razorpay_payment_id,
                                razorpaySignature: response.razorpay_signature
                            })
                        });

                        const verifyData = await verifyRes.json();
                        if (verifyData.success) {
                            toast.success(`₹${amount} added to your wallet!`);
                            setRechargeAmount("");
                            fetchWalletData();
                        } else {
                            toast.error(verifyData.error || "Payment verification failed");
                        }
                    } catch (err) {
                        toast.error("Error verifying payment");
                    }
                },
                theme: { color: "#3b82f6" }
            };

            const rzp = new (window as any).Razorpay(options);
            rzp.open();

        } catch (err: any) {
            toast.error(err.message || "Recharge failed");
        } finally {
            setIsRecharging(false);
        }
    };

    const handleSetPin = async () => {
        if (pin.length < 4) {
            toast.error("PIN must be at least 4 digits");
            return;
        }
        if (pin !== confirmPin) {
            toast.error("PINs do not match");
            return;
        }

        setIsSettingPin(true);
        const token = localStorage.getItem("userToken");

        try {
            const res = await fetch(`${MAIN_API}/wallet/pin`, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ pin })
            });

            const data = await res.json();
            if (data.success) {
                toast.success("Wallet PIN set successfully!");
                setShowPinModal(false);
                fetchWalletData();
            } else {
                toast.error(data.error || "Failed to set PIN");
            }
        } catch (err) {
            toast.error("Error setting PIN");
        } finally {
            setIsSettingPin(false);
        }
    };

    const handleForgotPinRequest = async () => {
        setIsRecovering(true);
        const token = localStorage.getItem("userToken");
        try {
            const res = await fetch(`${MAIN_API}/wallet/pin/forgot`, {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                toast.success("OTP sent to your email");
                setRecoveryStep("otp");
                setOtpSent(true);
            } else {
                toast.error(data.error || "Failed to send OTP");
            }
        } catch (err) {
            toast.error("Error connecting to server");
        } finally {
            setIsRecovering(false);
        }
    };

    const handleRecoveryReset = async () => {
        if (pin.length < 4) {
            toast.error("PIN must be at least 4 digits");
            return;
        }
        if (pin !== confirmPin) {
            toast.error("PINs do not match");
            return;
        }

        setIsRecovering(true);
        const token = localStorage.getItem("userToken");
        try {
            const res = await fetch(`${MAIN_API}/wallet/pin/reset`, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}` 
                },
                body: JSON.stringify({ otp: recoveryOtp, newPin: pin })
            });
            const data = await res.json();
            if (data.success) {
                toast.success("Wallet PIN reset successfully!");
                setForgotMode(false);
                setPin("");
                setConfirmPin("");
                setRecoveryOtp("");
                setRecoveryStep("otp");
                fetchWalletData();
            } else {
                toast.error(data.error || "Reset failed");
            }
        } catch (err) {
            toast.error("Error connecting to server");
        } finally {
            setIsRecovering(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#020631] flex flex-col items-center justify-center text-white">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
                <p className="mt-4 uppercase tracking-widest text-xs opacity-50">Syncing Wallet...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen relative overflow-hidden bg-[#020631] text-white font-sans">
            <ParticleNetworkWrapper className="z-0 opacity-40" />
            <CursorGlow />
            <Navbar />

            <main className="pt-28 md:pt-36 pb-24 relative z-10 px-4 max-w-4xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* Left Side: Balance & Quick Actions */}
                    <div className="lg:col-span-5 space-y-6">
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="p-8 rounded-[2.5rem] bg-gradient-to-br from-blue-600 to-indigo-700 shadow-2xl shadow-blue-500/20 relative overflow-hidden group"
                        >
                            <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-110 transition-transform duration-500">
                                <Wallet size={160} />
                            </div>
                            <div className="relative z-10 space-y-6">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">Current Balance</p>
                                        <h2 className="text-4xl font-black tracking-tight italic">₹{wallet?.balance.toFixed(2)}</h2>
                                    </div>
                                    <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10">
                                        <ShieldCheck className={wallet?.isPinSet ? "text-emerald-300" : "text-amber-300"} size={24} />
                                    </div>
                                </div>
                                    <div className="pt-4 flex items-center justify-between">
                                        <div className="flex flex-col">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-white/40">Account Status</span>
                                            <span className="text-[11px] font-black uppercase italic tracking-wider">{wallet?.status}</span>
                                        </div>
                                        {wallet?.isPinSet ? (
                                            <button 
                                                onClick={() => setForgotMode(true)}
                                                className="text-[9px] font-black uppercase tracking-widest bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl border border-white/10 transition-all"
                                            >
                                                Reset PIN
                                            </button>
                                        ) : (
                                            <button 
                                                onClick={() => setShowPinModal(true)}
                                                className="text-[10px] font-black uppercase tracking-widest bg-white text-blue-600 px-4 py-2 rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all"
                                            >
                                                Secure with PIN
                                            </button>
                                        )}
                                    </div>
                            </div>
                        </motion.div>

                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="p-6 rounded-[2rem] bg-slate-900/60 border border-white/10 backdrop-blur-xl shadow-xl"
                        >
                            <h3 className="text-xs font-black uppercase tracking-widest mb-6 pb-4 border-b border-white/5 flex items-center gap-2">
                                <Plus size={14} className="text-blue-400" /> Add Money
                            </h3>
                            <div className="space-y-4">
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-black text-white/20">₹</span>
                                    <input 
                                        type="number"
                                        value={rechargeAmount}
                                        onChange={(e) => setRechargeAmount(e.target.value)}
                                        placeholder="0.00"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-8 pr-4 text-lg font-black outline-none focus:border-blue-500 transition-colors"
                                    />
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    {["500", "1000", "2000"].map(amt => (
                                        <button 
                                            key={amt}
                                            onClick={() => setRechargeAmount(amt)}
                                            className="py-2.5 rounded-xl border border-white/5 bg-white/5 text-[10px] font-black uppercase hover:bg-white/10 transition-colors"
                                        >
                                            +₹{amt}
                                        </button>
                                    ))}
                                </div>
                                <Button
                                    onClick={handleRecharge}
                                    disabled={isRecharging || !rechargeAmount}
                                    className="w-full py-7 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest text-[11px] shadow-xl shadow-blue-600/20 active:scale-[0.98] transition-all"
                                >
                                    {isRecharging ? <Loader2 className="animate-spin" /> : <>Recharge via Razorpay <ArrowRight className="ml-2" size={14} /></>}
                                </Button>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Side: Transaction History */}
                    <div className="lg:col-span-7">
                        <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-slate-900/40 border border-white/10 rounded-[2.5rem] backdrop-blur-xl h-full flex flex-col overflow-hidden shadow-2xl"
                        >
                            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/3">
                                <h3 className="text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2">
                                    <History size={16} className="text-blue-400" /> Recent Activity
                                </h3>
                                <div className="text-[10px] font-black uppercase tracking-widest text-white/30 hidden sm:block italic">
                                    Encrypted Transactions
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                                {transactions.length > 0 ? (
                                    transactions.map((t, idx) => (
                                        <motion.div 
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.2 + (idx * 0.05) }}
                                            key={t._id}
                                            className="p-5 rounded-2xl bg-white/3 border border-white/5 flex items-center justify-between hover:bg-white/5 transition-colors group"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${t.type === 'credit' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                                                    {t.type === 'credit' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                                                </div>
                                                <div>
                                                    <p className="text-[11px] font-black uppercase tracking-wider mb-0.5">{t.description}</p>
                                                    <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.1em]">
                                                        {new Date(t.createdAt).toLocaleDateString()} • {new Date(t.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className={`text-base font-black italic ${t.type === 'credit' ? 'text-emerald-400' : 'text-red-400'}`}>
                                                    {t.type === 'credit' ? '+' : '-'}₹{t.amount}
                                                </p>
                                                <div className="flex items-center gap-1.5 justify-end">
                                                    <span className={`w-1.5 h-1.5 rounded-full ${t.status === 'success' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
                                                    <span className="text-[8px] font-black uppercase text-white/20 tracking-widest">{t.status}</span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center opacity-20 py-20">
                                        <History size={64} className="mb-4" />
                                        <p className="text-xs font-black uppercase tracking-[0.3em]">No activity yet</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Additional Security Info */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mt-8 p-6 rounded-[2rem] bg-indigo-500/5 border border-indigo-500/10 flex flex-col sm:flex-row items-center gap-6"
                >
                    <div className="w-16 h-16 rounded-full bg-indigo-500/10 flex items-center justify-center shrink-0">
                        <ShieldAlert size={32} className="text-indigo-400" />
                    </div>
                    <div className="space-y-2 text-center sm:text-left">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400">Security Commitment</h4>
                        <p className="text-[10px] font-medium leading-relaxed uppercase tracking-tight opacity-50 max-w-2xl italic">
                            Your DBI Digital Wallet is protected by military-grade encryption. Every transaction is monitored for security. Once a PIN is set, it cannot be recovered without identity verification. Use your wallet for swift, secure multi-restaurant ordering.
                        </p>
                    </div>
                </motion.div>
            </main>

            {/* PIN Setup Modal */}
            <AnimatePresence>
                {showPinModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-[#0f172a] border border-white/10 rounded-[3rem] w-full max-w-md overflow-hidden shadow-2xl shadow-indigo-500/20"
                        >
                            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/3">
                                <div>
                                    <h3 className="text-lg font-black text-white italic uppercase leading-none">Setup Secure PIN</h3>
                                    <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mt-1.5 flex items-center gap-1.5">
                                        <Lock size={10} /> 2-Factor Authentication
                                    </p>
                                </div>
                                <button onClick={() => setShowPinModal(false)} className="p-2 hover:bg-white/10 rounded-xl transition-colors"><X size={20} className="text-white/40" /></button>
                            </div>
                            <div className="p-8 space-y-6">
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 ml-1">New 4-Digit PIN</label>
                                        <Input 
                                            type="password"
                                            maxLength={4}
                                            value={pin}
                                            onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                                            placeholder="••••"
                                            className="bg-white/5 border-white/10 text-center text-2xl tracking-[1em] font-black py-7 rounded-2xl"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 ml-1">Confirm PIN</label>
                                        <Input 
                                            type="password"
                                            maxLength={4}
                                            value={confirmPin}
                                            onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                                            placeholder="••••"
                                            className="bg-white/5 border-white/10 text-center text-2xl tracking-[1em] font-black py-7 rounded-2xl"
                                        />
                                    </div>
                                </div>
                                <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl flex items-start gap-4">
                                    <AlertCircle className="text-amber-500 shrink-0 mt-0.5" size={16} />
                                    <p className="text-[10px] font-bold text-amber-500/80 leading-relaxed uppercase italic">
                                        Choose a PIN you'll remember. This will be required for every wallet payment you make on DBI.
                                    </p>
                                </div>
                                <Button 
                                    onClick={handleSetPin}
                                    disabled={isSettingPin || pin.length < 4}
                                    className="w-full py-8 bg-indigo-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-[11px] shadow-xl shadow-indigo-600/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                                >
                                    {isSettingPin ? <Loader2 className="animate-spin" /> : "Set Secure PIN"}
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Forgot PIN Recovery Modal */}
            <AnimatePresence>
                {forgotMode && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 30 }}
                            className="bg-[#0f172a] border border-white/10 rounded-[3.5rem] w-full max-w-sm overflow-hidden shadow-2xl shadow-blue-500/20"
                        >
                            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/3">
                                <div>
                                    <h3 className="text-lg font-black text-white italic uppercase leading-none">Recover PIN</h3>
                                    <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mt-1.5 flex items-center gap-1.5">
                                        <Mail size={10} /> Email Verification
                                    </p>
                                </div>
                                <button 
                                    onClick={() => {
                                        setForgotMode(false);
                                        setOtpSent(false);
                                        setRecoveryOtp("");
                                        setRecoveryStep("otp");
                                    }} 
                                    className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                                >
                                    <X size={20} className="text-white/40" />
                                </button>
                            </div>

                            <div className="p-8 space-y-6">
                                {recoveryStep === "otp" ? (
                                    <div className="space-y-6">
                                        <div className="text-center space-y-4">
                                            <div className="w-16 h-16 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto">
                                                <KeyRound className="text-blue-400" size={28} />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Step 1: Verify OTP</p>
                                                <p className="text-[11px] text-white/60 leading-relaxed italic">Click send to receive a 6-digit code on your mail.</p>
                                            </div>
                                        </div>

                                        {!otpSent && !isRecovering ? (
                                            <Button 
                                                onClick={handleForgotPinRequest}
                                                className="w-full py-8 bg-blue-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-[11px] shadow-xl shadow-blue-600/20 hover:scale-[1.02] active:scale-95 transition-all"
                                            >
                                                Send Verification OTP
                                            </Button>
                                        ) : (
                                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                                <div className="space-y-2">
                                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 text-center">Enter 6-Digit OTP</p>
                                                    <Input 
                                                        maxLength={6}
                                                        value={recoveryOtp}
                                                        autoFocus
                                                        onChange={(e) => setRecoveryOtp(e.target.value.replace(/\D/g, ''))}
                                                        placeholder="••••••"
                                                        className="bg-white/5 border-white/10 text-center text-3xl tracking-[0.5em] font-black py-8 rounded-2xl focus:border-blue-500/50 outline-none"
                                                    />
                                                </div>
                                                <Button 
                                                    onClick={() => setRecoveryStep("reset")}
                                                    disabled={recoveryOtp.length < 6 || isRecovering}
                                                    className="w-full py-8 bg-emerald-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-[11px] shadow-xl shadow-emerald-600/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                                                >
                                                    {isRecovering ? <Loader2 className="animate-spin" /> : <>Verify OTP <ArrowRight size={14} /></>}
                                                </Button>
                                                <button 
                                                    onClick={handleForgotPinRequest}
                                                    disabled={isRecovering}
                                                    className="w-full text-[9px] font-black uppercase tracking-widest text-white/30 hover:text-white transition-colors"
                                                >
                                                    Didn't get code? Send Again
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
                                        <div className="space-y-4">
                                            <div className="space-y-1.5">
                                                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 ml-1">New 4-Digit PIN</label>
                                                <Input 
                                                    type="password"
                                                    maxLength={4}
                                                    value={pin}
                                                    onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                                                    placeholder="••••"
                                                    className="bg-white/5 border-white/10 text-center text-2xl tracking-[1em] font-black py-7 rounded-2xl"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 ml-1">Confirm New PIN</label>
                                                <Input 
                                                    type="password"
                                                    maxLength={4}
                                                    value={confirmPin}
                                                    onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                                                    placeholder="••••"
                                                    className="bg-white/5 border-white/10 text-center text-2xl tracking-[1em] font-black py-7 rounded-2xl"
                                                />
                                            </div>
                                        </div>
                                        <Button 
                                            onClick={handleRecoveryReset}
                                            disabled={isRecovering || pin.length < 4 || pin !== confirmPin}
                                            className="w-full py-8 bg-blue-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-[11px] shadow-xl shadow-blue-600/20 hover:scale-[1.02] active:scale-95 transition-all"
                                        >
                                            {isRecovering ? <Loader2 className="animate-spin" /> : "Set New Secret PIN"}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <Footer />
        </div>
    );
}

function X({ size, className }: { size: number, className: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="3" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
    </svg>
  );
}
