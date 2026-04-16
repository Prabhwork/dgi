"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    ShieldCheck, ArrowLeft, Loader2, CheckCircle2, AlertCircle, 
    Smartphone, Copy, RefreshCw, Key, LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CursorGlow from "@/components/CursorGlow";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function TwoFactorPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState<any>(null);
    const [step, setStep] = useState(1); // 1: Status/Initial, 2: Setup, 3: Verify Setup
    const [qrCode, setQrCode] = useState("");
    const [secret, setSecret] = useState("");
    const [verifyToken, setVerifyToken] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        fetchStatus();
    }, []);

    const fetchStatus = async () => {
        const token = localStorage.getItem("userToken");
        if (!token) {
            router.push("/login");
            return;
        }

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setStatus(data.data);
                if (data.data.isTwoFactorEnabled) {
                    setStep(1);
                }
            } else {
                localStorage.removeItem("userToken");
                router.push("/login");
            }
        } catch (err) {
            toast.error("Failed to fetch 2FA status");
        } finally {
            setLoading(false);
        }
    };

    const handleGenerate = async () => {
        setIsProcessing(true);
        const token = localStorage.getItem("userToken");
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/2fa/generate`, {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setQrCode(data.qrCodeUrl);
                setSecret(data.secret);
                setStep(2);
            } else {
                toast.error(data.error || "Generation failed");
            }
        } catch (err) {
            toast.error("Something went wrong.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleEnable = async () => {
        if (verifyToken.length !== 6) {
            toast.error("Invalid token format");
            return;
        }

        setIsProcessing(true);
        const token = localStorage.getItem("userToken");
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/2fa/verify-enable`, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}` 
                },
                body: JSON.stringify({ token: verifyToken, secret })
            });
            const data = await res.json();
            if (data.success) {
                toast.success("2FA Enabled Successfully!");
                fetchStatus();
                setStep(1);
            } else {
                toast.error(data.error || "Verification failed");
            }
        } catch (err) {
            toast.error("Verification failed");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDisable = async () => {
        if (!verifyToken) {
            toast.error("Enter your 2FA token to disable");
            return;
        }

        setIsProcessing(true);
        const token = localStorage.getItem("userToken");
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/2fa/disable`, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}` 
                },
                body: JSON.stringify({ token: verifyToken })
            });
            const data = await res.json();
            if (data.success) {
                toast.success("2FA Disabled");
                fetchStatus();
                setVerifyToken("");
            } else {
                toast.error(data.error || "Failed to disable");
            }
        } catch (err) {
            toast.error("Failed to disable");
        } finally {
            setIsProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center font-display">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background relative overflow-hidden text-foreground font-display">
     
            <CursorGlow />
            <Navbar />

            <main className="pt-32 pb-24 relative z-10 px-4">
                <div className="max-w-2xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center gap-6 mb-12">
                        <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center border border-primary/20 shadow-lg shadow-primary/10">
                            <ShieldCheck className="w-8 h-8 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black uppercase tracking-widest">2-Step Verification</h1>
                            <p className="text-muted-foreground text-xs uppercase tracking-[0.2em] font-medium">Protect your account with an extra layer of security</p>
                        </div>
                    </div>

                    <div className="glass-strong border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
                        
                        <AnimatePresence mode="wait">
                            {step === 1 && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="space-y-8"
                                >
                                    <div className="flex items-center justify-between p-6 rounded-3xl bg-white/5 border border-white/10">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${status?.isTwoFactorEnabled ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-white/40'}`}>
                                                <Smartphone className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg">Authenticator App</h3>
                                                <p className="text-xs text-muted-foreground">Use an app like Google Authenticator or Authy</p>
                                            </div>
                                        </div>
                                        <div className={`text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full border ${status?.isTwoFactorEnabled ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                                            {status?.isTwoFactorEnabled ? 'Enabled' : 'Disabled'}
                                        </div>
                                    </div>

                                    {!status?.isTwoFactorEnabled ? (
                                        <div className="space-y-6">
                                            <div className="p-6 rounded-3xl bg-primary/5 border border-primary/10 space-y-4">
                                                <h4 className="font-bold text-sm text-primary uppercase tracking-widest">How it works</h4>
                                                <ul className="space-y-3 text-sm text-white/70">
                                                    <li className="flex gap-3"><CheckCircle2 className="w-4 h-4 text-primary shrink-0" /> Pair your account with an authentication app</li>
                                                    <li className="flex gap-3"><CheckCircle2 className="w-4 h-4 text-primary shrink-0" /> Scan the QR code we provide</li>
                                                    <li className="flex gap-3"><CheckCircle2 className="w-4 h-4 text-primary shrink-0" /> Enter the 6-digit code from your app at login</li>
                                                </ul>
                                            </div>
                                            <Button 
                                                onClick={handleGenerate} 
                                                disabled={isProcessing}
                                                className="w-full h-14 rounded-2xl bg-primary text-white font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform"
                                            >
                                                {isProcessing ? <Loader2 className="animate-spin" /> : 'Get Started'}
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            <div className="space-y-2">
                                                <Label className="text-[10px] uppercase tracking-widest text-white/40 ml-1">Confirm Token to Disable</Label>
                                                <Input 
                                                    type="text"
                                                    placeholder="Enter 6-digit code"
                                                    value={verifyToken}
                                                    onChange={(e) => setVerifyToken(e.target.value)}
                                                    className="h-14 bg-white/5 border-white/10 rounded-2xl text-center text-xl tracking-[0.5em] font-black focus:ring-red-500/50"
                                                />
                                            </div>
                                            <Button 
                                                onClick={handleDisable}
                                                disabled={isProcessing || !verifyToken}
                                                variant="outline"
                                                className="w-full h-14 rounded-2xl border-red-500/20 text-red-500 hover:bg-red-500/5 font-black uppercase tracking-widest"
                                            >
                                                {isProcessing ? <Loader2 className="animate-spin" /> : 'Disable 2FA'}
                                            </Button>
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {step === 2 && (
                                <motion.div 
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-8 text-center"
                                >
                                    <div className="space-y-2">
                                        <h3 className="text-xl font-bold">Scan QR Code</h3>
                                        <p className="text-xs text-muted-foreground">Scan this code in your Authenticator app</p>
                                    </div>

                                    <div className="p-4 bg-white rounded-3xl mx-auto w-fit shadow-2xl">
                                        <img src={qrCode} alt="2FA QR Code" className="w-48 h-48" />
                                    </div>

                                    <div className="space-y-4">
                                        <div className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Or enter code manually</div>
                                        <div className="flex items-center gap-2 bg-white/5 p-4 rounded-2xl border border-white/10 justify-between">
                                            <code className="text-primary font-mono font-black tracking-widest">{secret}</code>
                                            <Button variant="ghost" size="sm" onClick={() => { navigator.clipboard.writeText(secret); toast.success("Copied!"); }}>
                                                <Copy size={16} />
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="space-y-6 pt-4">
                                        <div className="space-y-2 text-left">
                                            <Label className="text-[10px] uppercase tracking-widest text-white/40 ml-1">Verify 6-digit code</Label>
                                            <Input 
                                                type="text"
                                                placeholder="000000"
                                                value={verifyToken}
                                                onChange={(e) => setVerifyToken(e.target.value)}
                                                className="h-14 bg-white/5 border-white/10 rounded-2xl text-center text-xl tracking-[0.5em] font-black"
                                            />
                                        </div>
                                        <div className="flex gap-4">
                                            <Button variant="outline" className="flex-1 rounded-2xl h-14 uppercase tracking-widest font-black" onClick={() => setStep(1)}>Cancel</Button>
                                            <Button 
                                                className="flex-1 rounded-2xl h-14 bg-primary text-white uppercase tracking-widest font-black"
                                                disabled={isProcessing || verifyToken.length !== 6}
                                                onClick={handleEnable}
                                            >
                                                {isProcessing ? <Loader2 className="animate-spin" /> : 'Confirm'}
                                            </Button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
