"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Lock, ChevronRight, AlertCircle, ShieldCheck, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CursorGlow from "@/components/CursorGlow";

import { useRouter } from "next/navigation";

export default function VerifyOTPPage() {
    const router = useRouter();
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pendingReg, setPendingReg] = useState<any>(null);

    useEffect(() => {
        const stored = sessionStorage.getItem("pendingRegistration");
        if (!stored) {
            router.push("/register");
            return;
        }
        setPendingReg(JSON.parse(stored));
    }, [router]);

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // 1. Verify OTP
            const verifyRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/verify-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: pendingReg.email, otp })
            });
            const verifyData = await verifyRes.json();

            if (!verifyData.success) {
                setError(verifyData.error || "Invalid verification code.");
                setLoading(false);
                return;
            }

            // 2. Finalize Registration
            const regRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register-user`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(pendingReg)
            });
            const regData = await regRes.json();

            if (regData.success) {
                sessionStorage.removeItem("pendingRegistration");
                router.push("/login?message=Account verified successfully! Please login.");
            } else {
                setError(regData.error || "Registration failed.");
                setLoading(false);
            }
        } catch (err) {
            setError("Something went wrong. Please try again.");
            setLoading(false);
        }
    };

    if (!pendingReg) return null;

    return (
        <div className="min-h-screen bg-background relative overflow-hidden text-foreground">
      
            <CursorGlow />
            <Navbar />

            <main className="pt-32 pb-24 relative z-10 px-4 flex items-center justify-center">
                <div className="w-full max-w-md">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-8"
                    >
                        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-primary/20">
                            <ShieldCheck className="text-primary w-8 h-8" />
                        </div>
                        <h1 className="text-3xl font-display font-bold uppercase tracking-widest mb-2">
                            Verify <span className="text-primary italic">Email</span>
                        </h1>
                        <p className="text-muted-foreground text-xs uppercase tracking-widest flex items-center justify-center gap-2">
                            <Mail size={12} /> {pendingReg.email}
                        </p>
                    </motion.div>

                    <div className="glass-strong border-white/10 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden text-center">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

                        <p className="text-sm text-white/60 mb-8 uppercase tracking-widest leading-relaxed">
                            We've sent a 6-digit verification code to your email. Please enter it below to continue.
                        </p>

                        {error && (
                            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-3">
                                <AlertCircle size={18} />
                                <span className="text-xs font-medium">{error}</span>
                            </div>
                        )}

                        <form onSubmit={handleVerify} className="space-y-6">
                            <div className="space-y-4">
                                <Label className="text-white/40 text-[10px] uppercase tracking-[0.3em] font-black">Verification Code</Label>
                                <div className="relative">
                                    <Input
                                        type="text"
                                        maxLength={6}
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                        className="bg-white/5 border-white/10 text-white h-16 rounded-xl focus:ring-primary/50 text-center text-3xl font-display tracking-[0.4em] font-bold"
                                        placeholder="000000"
                                        required
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                variant="glow"
                                disabled={loading || otp.length < 6}
                                className="w-full h-14 rounded-xl font-display uppercase tracking-[0.2em] text-xs bg-primary text-white"
                            >
                                {loading ? "Verifying..." : "Verify & Create Account"}
                            </Button>

                            <button
                                type="button"
                                onClick={() => router.push("/register")}
                                className="text-xs text-white/40 hover:text-white uppercase tracking-widest transition-colors"
                            >
                                Change Email Address
                            </button>
                        </form>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
