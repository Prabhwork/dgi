"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Mail, Lock, ChevronRight, AlertCircle, Building2, CheckCircle2, ArrowLeft, KeyRound
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CursorGlow from "@/components/CursorGlow";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [step, setStep] = useState<"email" | "otp" | "reset" | "success">("email");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        email: "",
        otp: "",
        password: "",
        confirmPassword: ""
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSendOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/business/forgot-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: formData.email })
            });

            const data = await res.json();

            if (data.success) {
                setStep("otp");
            } else {
                setError(data.error || "Failed to send OTP. Please check your email.");
            }
        } catch (err) {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.otp.length === 6) {
            setStep("reset");
        } else {
            setError("Please enter a valid 6-digit code.");
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/business/reset-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: formData.email,
                    otp: formData.otp,
                    password: formData.password
                })
            });

            const data = await res.json();

            if (data.success) {
                // Store token for automatic login
                localStorage.setItem("businessToken", data.token);
                setStep("success");
                
                // Optional: Automatically redirect after a few seconds
                setTimeout(() => {
                    router.push("/community/login"); // Or directly to dashboard if already logged in
                }, 3000);
            } else {
                setError(data.error || "Reset failed. Please try again.");
            }
        } catch (err) {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

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
                            <KeyRound className="text-primary w-8 h-8" />
                        </div>
                        <h1 className="text-3xl font-display font-bold uppercase tracking-widest mb-2">
                            Reset <span className="text-primary italic">Password</span>
                        </h1>
                        <p className="text-muted-foreground text-sm uppercase tracking-widest">Business Portal Recovery</p>
                    </motion.div>

                    <div className="glass-strong border-white/10 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

                        {error && (
                            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-3">
                                <AlertCircle size={18} />
                                <span className="text-xs font-medium">{error}</span>
                            </div>
                        )}

                        <AnimatePresence mode="wait">
                            {step === "email" && (
                                <motion.form
                                    key="email"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    onSubmit={handleSendOTP}
                                    className="space-y-6"
                                >
                                    <div className="space-y-2">
                                        <Label className="text-white/70 text-xs uppercase tracking-widest">Official Email</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                                            <Input
                                                name="email"
                                                type="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                className="bg-white/5 border-white/10 text-white pl-11 h-12 rounded-xl focus:ring-primary/50"
                                                placeholder="name@business.com"
                                                required
                                            />
                                        </div>
                                        <p className="text-white/40 text-[10px] mt-2 px-1">We'll send a 6-digit verification code to this email.</p>
                                    </div>
                                    <Button
                                        type="submit"
                                        variant="glow"
                                        disabled={loading}
                                        className="w-full h-12 rounded-xl font-display uppercase tracking-[0.2em] text-xs bg-primary text-white"
                                    >
                                        {loading ? "Sending OTP..." : "Get Verification Code"}
                                    </Button>
                                    <Link 
                                        href="/community/login" 
                                        className="flex items-center justify-center gap-2 text-xs text-white/40 hover:text-white transition-colors"
                                    >
                                        <ArrowLeft size={14} /> Back to Login
                                    </Link>
                                </motion.form>
                            )}

                            {step === "otp" && (
                                <motion.form
                                    key="otp"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    onSubmit={handleVerifyOTP}
                                    className="space-y-6"
                                >
                                    <div className="space-y-2 text-center">
                                        <Label className="text-white/70 text-xs uppercase tracking-widest">Verification Code</Label>
                                        <div className="relative mt-4">
                                            <Input
                                                name="otp"
                                                type="text"
                                                maxLength={6}
                                                value={formData.otp}
                                                onChange={(e) => setFormData(prev => ({ ...prev, otp: e.target.value.replace(/\D/g, '') }))}
                                                className="bg-white/5 border-white/10 text-white h-14 rounded-xl focus:ring-primary/50 text-center text-2xl font-bold tracking-[0.5em]"
                                                placeholder="000000"
                                                required
                                            />
                                        </div>
                                        <p className="text-white/40 text-[10px] mt-4">
                                            Enter the 6-digit code sent to <span className="text-primary">{formData.email}</span>
                                        </p>
                                    </div>
                                    <Button
                                        type="submit"
                                        variant="glow"
                                        disabled={formData.otp.length < 6}
                                        className="w-full h-12 rounded-xl font-display uppercase tracking-[0.2em] text-xs bg-primary text-white"
                                    >
                                        Verify Code
                                    </Button>
                                    <button
                                        type="button"
                                        onClick={() => setStep("email")}
                                        className="w-full text-xs text-white/40 hover:text-white uppercase tracking-widest transition-colors"
                                    >
                                        Change Email
                                    </button>
                                </motion.form>
                            )}

                            {step === "reset" && (
                                <motion.form
                                    key="reset"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    onSubmit={handleResetPassword}
                                    className="space-y-6"
                                >
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label className="text-white/70 text-xs uppercase tracking-widest">New Password</Label>
                                            <div className="relative">
                                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                                                <Input
                                                    name="password"
                                                    type="password"
                                                    value={formData.password}
                                                    onChange={handleInputChange}
                                                    className="bg-white/5 border-white/10 text-white pl-11 h-12 rounded-xl focus:ring-primary/50"
                                                    placeholder="••••••••"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-white/70 text-xs uppercase tracking-widest">Confirm Password</Label>
                                            <div className="relative">
                                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                                                <Input
                                                    name="confirmPassword"
                                                    type="password"
                                                    value={formData.confirmPassword}
                                                    onChange={handleInputChange}
                                                    className="bg-white/5 border-white/10 text-white pl-11 h-12 rounded-xl focus:ring-primary/50"
                                                    placeholder="••••••••"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <Button
                                        type="submit"
                                        variant="glow"
                                        disabled={loading || !formData.password || formData.password !== formData.confirmPassword}
                                        className="w-full h-12 rounded-xl font-display uppercase tracking-[0.2em] text-xs bg-primary text-white"
                                    >
                                        {loading ? "Updating..." : "Update Password"}
                                    </Button>
                                </motion.form>
                            )}

                            {step === "success" && (
                                <motion.div
                                    key="success"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="text-center space-y-6"
                                >
                                    <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto border border-green-500/20">
                                        <CheckCircle2 className="text-green-500 w-8 h-8" />
                                    </div>
                                    <div className="space-y-2">
                                        <h2 className="text-xl font-bold uppercase tracking-widest">Password Reset!</h2>
                                        <p className="text-white/40 text-xs">Your password has been successfully updated. You can now login with your new credentials.</p>
                                    </div>
                                    <Button
                                        variant="glow"
                                        className="w-full h-12 rounded-xl font-display uppercase tracking-[0.2em] text-xs bg-primary text-white"
                                        asChild
                                    >
                                        <Link href="/community/login">Back to Login</Link>
                                    </Button>
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
