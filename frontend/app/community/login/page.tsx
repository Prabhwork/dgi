"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
    Mail, Lock, Phone, ChevronRight, AlertCircle, Building2, Eye, EyeOff
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CursorGlow from "@/components/CursorGlow";
import ParticleNetworkWrapper from "@/components/ParticleNetworkWrapper";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const router = useRouter();
    const [loginWith, setLoginWith] = useState<"email" | "phone">("email");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // 2FA state
    const [requires2fa, setRequires2fa] = useState(false);
    const [tempToken, setTempToken] = useState("");
    const [otp, setOtp] = useState("");

    const [formData, setFormData] = useState({
        email: "",
        contactNumber: "",
        password: ""
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const payload = loginWith === "email"
            ? { email: formData.email, password: formData.password }
            : { contactNumber: formData.contactNumber, password: formData.password };

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/business/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (data.success) {
                if (data.requires2fa) {
                    setRequires2fa(true);
                    setTempToken(data.tempToken);
                    return;
                }

                // Store token
                localStorage.setItem("businessToken", data.token);
                router.push("/");
            } else {
                setError(data.error || "Login failed. Please check your credentials.");
            }
        } catch (err) {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handle2FASubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/business/2fa/verify-login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ tempToken, token: otp })
            });

            const data = await res.json();

            if (data.success) {
                // Store token
                localStorage.setItem("businessToken", data.token);
                
                // Redirect based on status
                if (data.status === 'approved') {
                    router.push("/");
                } else {
                    router.push("/community/status");
                }
            } else {
                setError(data.error || "Invalid verification code.");
            }
        } catch (err) {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background relative overflow-hidden text-white">
            <ParticleNetworkWrapper className="z-0 opacity-40" />
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
                            <Building2 className="text-primary w-8 h-8" />
                        </div>
                        <h1 className="text-3xl font-display font-bold uppercase tracking-widest mb-2">
                            Business <span className="text-primary italic">Login</span>
                        </h1>
                        <p className="text-muted-foreground text-sm uppercase tracking-widest">DBI Community Portal</p>
                    </motion.div>

                    <div className="glass-strong border-white/10 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

                        <div className="flex bg-white/5 p-1 rounded-xl mb-8">
                            <button
                                onClick={() => setLoginWith("email")}
                                className={`flex-1 py-2 text-xs font-bold uppercase tracking-widest rounded-lg transition-all ${loginWith === "email" ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-white/40 hover:text-white"}`}
                            >
                                Email
                            </button>
                            <button
                                onClick={() => setLoginWith("phone")}
                                className={`flex-1 py-2 text-xs font-bold uppercase tracking-widest rounded-lg transition-all ${loginWith === "phone" ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-white/40 hover:text-white"}`}
                            >
                                Contact
                            </button>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-3">
                                <AlertCircle size={18} />
                                <span className="text-xs font-medium">{error}</span>
                            </div>
                        )}

                        {requires2fa ? (
                            <form onSubmit={handle2FASubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <Label className="text-white/70 text-xs uppercase tracking-widest">Authenticator Code</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                                        <Input
                                            name="otp"
                                            type="text"
                                            maxLength={6}
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                            className="bg-white/5 border-white/10 text-white pl-11 h-12 rounded-xl focus:ring-primary/50 text-center text-lg tracking-[0.2em]"
                                            placeholder="000000"
                                            required
                                        />
                                    </div>
                                    <p className="text-white/40 text-[10px] text-center mt-2">Open your authenticator app to view your 6-digit code.</p>
                                </div>
                                <Button
                                    type="submit"
                                    variant="glow"
                                    disabled={loading || otp.length < 6}
                                    className="w-full h-12 rounded-xl font-display uppercase tracking-[0.2em] text-xs bg-primary text-white"
                                >
                                    {loading ? "Verifying..." : "Verify Code"}
                                </Button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setRequires2fa(false);
                                        setTempToken("");
                                        setOtp("");
                                        setError(null);
                                    }}
                                    className="w-full text-xs text-white/40 hover:text-white uppercase tracking-widest transition-colors mt-2"
                                >
                                    Back to Login
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {loginWith === "email" ? (
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
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <Label className="text-white/70 text-xs uppercase tracking-widest">Contact Number</Label>
                                        <div className="relative">
                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                                            <Input
                                                name="contactNumber"
                                                type="tel"
                                                value={formData.contactNumber}
                                                onChange={handleInputChange}
                                                className="bg-white/5 border-white/10 text-white pl-11 h-12 rounded-xl focus:ring-primary/50"
                                                placeholder="+91 99999 99999"
                                                required
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <Label className="text-white/70 text-xs uppercase tracking-widest">Password</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                                        <Input
                                            name="password"
                                            type={showPassword ? "text" : "password"}
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            className="bg-white/5 border-white/10 text-white pl-11 pr-11 h-12 rounded-xl focus:ring-primary/50"
                                            placeholder="••••••••"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                                        >
                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    variant="glow"
                                    disabled={loading}
                                    className="w-full h-12 rounded-xl font-display uppercase tracking-[0.2em] text-xs bg-primary text-white"
                                >
                                    {loading ? "Authenticating..." : "Login to Portal"}
                                </Button>
                            </form>
                        )}

                        <div className="mt-8 pt-8 border-t border-white/10 text-center space-y-4">
                            <p className="text-white/40 text-xs uppercase tracking-widest">
                                Don't have an account?
                            </p>
                            <Button variant="link" className="text-primary font-bold uppercase tracking-widest text-xs" asChild>
                                <Link href="/community/register">Register Business <ChevronRight size={14} className="ml-1" /></Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
