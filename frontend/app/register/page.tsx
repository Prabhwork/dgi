"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
    User, Mail, Phone, Lock, ChevronRight, AlertCircle, Eye, EyeOff, Sparkles 
} from "lucide-react";
import { useGoogleLogin } from "@react-oauth/google";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CursorGlow from "@/components/CursorGlow";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
    return (
        <div className="min-h-screen bg-background relative overflow-hidden text-foreground">
           
            <CursorGlow />
            <Navbar />

            <main className="pt-32 pb-24 relative z-10 px-4 flex items-center justify-center">
                <RegisterContent />
            </main>

            <Footer />
        </div>
    );
}

function RegisterContent() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: ""
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            setLoading(false);
            return;
        }

        try {
            // 1. Send OTP first
            const otpRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/send-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: formData.email })
            });
            const otpData = await otpRes.json();
            
            if (!otpData.success) {
                setError(otpData.error || "Failed to send verification code.");
                setLoading(false);
                return;
            }

            // 2. Store form data temporarily and redirect to OTP verification
            sessionStorage.setItem("pendingRegistration", JSON.stringify(formData));
            router.push("/register/verify-otp");
        } catch (err) {
            setError("Something went wrong. Please try again.");
            setLoading(false);
        }
    };

    const handleGoogleSignup = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/google-login`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ accessToken: tokenResponse.access_token })
                });

                const data = await res.json();

                if (data.success) {
                    if (data.isNewUser) {
                        router.push(`/google-completion?email=${data.email}&name=${data.name}`);
                        return;
                    }
                    localStorage.setItem("userToken", data.token);
                    router.push("/");
                } else {
                    setError(data.error || "Google signup failed.");
                }
            } catch (err) {
                setError("Failed to connect with Google authentication.");
            } finally {
                setLoading(false);
            }
        },
        onError: () => setError("Google signup was unsuccessful. Try again."),
    });

    return (
        <div className="w-full max-w-xl">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-8"
            >
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-primary/20">
                    <Sparkles className="text-primary w-8 h-8" />
                </div>
                <h1 className="text-3xl font-display font-bold uppercase tracking-widest mb-2">
                    Create <span className="text-primary italic">Account</span>
                </h1>
                <p className="text-muted-foreground text-sm uppercase tracking-widest">Join the DBI Community</p>
            </motion.div>

            <div className="glass-strong border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

                {/* Portal Toggle */}
                <div className="flex bg-white/5 p-1.5 rounded-2xl mb-8 relative overflow-hidden max-w-xs mx-auto">
                    <motion.div 
                        className="absolute inset-y-1.5 bg-primary rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.5)] z-0"
                        initial={false}
                        animate={{ 
                            left: "6px",
                            width: "calc(50% - 9px)"
                        }}
                    />
                    <button
                        className="flex-1 py-3 text-[11px] font-black uppercase tracking-[0.2em] rounded-xl transition-all relative z-10 text-white"
                    >
                        User
                    </button>
                    <Link
                        href="/community/register"
                        className="flex-1 py-3 text-[11px] font-black uppercase tracking-[0.2em] rounded-xl transition-all relative z-10 text-white/40 hover:text-white/60 text-center"
                    >
                        Business
                    </Link>
                </div>

                {error && (
                    <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-3 animate-shake">
                        <AlertCircle size={18} />
                        <span className="text-xs font-medium">{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2 md:col-span-2">
                        <Label className="text-white/70 text-xs uppercase tracking-widest ml-1">Full Name</Label>
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                            <Input
                                name="name"
                                type="text"
                                value={formData.name}
                                onChange={handleInputChange}
                                className="bg-white/5 border-white/10 text-white pl-11 h-12 rounded-xl focus:ring-primary/50"
                                placeholder="Enter your full name"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-white/70 text-xs uppercase tracking-widest ml-1">Email Address</Label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                            <Input
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className="bg-white/5 border-white/10 text-white pl-11 h-12 rounded-xl focus:ring-primary/50"
                                placeholder="name@example.com"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-white/70 text-xs uppercase tracking-widest ml-1">Phone Number</Label>
                        <div className="relative">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                            <Input
                                name="phone"
                                type="tel"
                                value={formData.phone}
                                onChange={handleInputChange}
                                className="bg-white/5 border-white/10 text-white pl-11 h-12 rounded-xl focus:ring-primary/50"
                                placeholder="+91 00000 00000"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-white/70 text-xs uppercase tracking-widest ml-1">Password</Label>
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
                                minLength={6}
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

                    <div className="space-y-2">
                        <Label className="text-white/70 text-xs uppercase tracking-widest ml-1">Confirm Password</Label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                            <Input
                                name="confirmPassword"
                                type={showPassword ? "text" : "password"}
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                                className="bg-white/5 border-white/10 text-white pl-11 h-12 rounded-xl focus:ring-primary/50"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <Button
                        type="submit"
                        variant="glow"
                        disabled={loading}
                        className="w-full md:col-span-2 h-12 rounded-xl font-display uppercase tracking-[0.2em] text-xs bg-primary text-white mt-4"
                    >
                        {loading ? "Processing..." : "Continue to Verification"}
                    </Button>
                </form>

                <div className="mt-8 flex items-center gap-4">
                    <div className="h-px flex-1 bg-white/10" />
                    <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Or continue with</span>
                    <div className="h-px flex-1 bg-white/10" />
                </div>

                <div className="mt-6 grid grid-cols-1 gap-4">
                    <button
                        onClick={() => handleGoogleSignup()}
                        className="h-12 w-full rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all flex items-center justify-center gap-3 group"
                    >
                        <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        <span className="text-xs uppercase tracking-widest font-bold">Sign up with Google</span>
                    </button>
                </div>

                <div className="mt-8 pt-8 border-t border-white/10 text-center">
                    <p className="text-white/40 text-xs uppercase tracking-widest inline-block mr-2">
                        Already have an account?
                    </p>
                    <Button variant="link" className="p-0 h-auto text-primary font-bold uppercase tracking-widest text-xs" asChild>
                        <Link href="/login">Log In <ChevronRight size={14} className="ml-1 inline" /></Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
