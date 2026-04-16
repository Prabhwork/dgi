"use client";

import { useState, useEffect, Suspense } from "react";
import { motion } from "framer-motion";
import { 
    Mail, Lock, Phone, ChevronRight, AlertCircle, Eye, EyeOff, UserCircle, LogIn 
} from "lucide-react";
import { useGoogleLogin } from "@react-oauth/google";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CursorGlow from "@/components/CursorGlow";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

function LoginContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [loginType, setLoginType] = useState<"user" | "business">("user");
    const [loginWith, setLoginWith] = useState<"email" | "phone">("email");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    // 2FA state
    const [requires2fa, setRequires2fa] = useState(false);
    const [tempToken, setTempToken] = useState("");
    const [otp, setOtp] = useState("");

    const [formData, setFormData] = useState({
        email: "",
        phone: "",
        contactNumber: "",
        password: ""
    });

    useEffect(() => {
        const msg = searchParams.get("message");
        if (msg) setMessage(msg);
    }, [searchParams]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        let payload, url;

        if (loginType === "user") {
            url = `${process.env.NEXT_PUBLIC_API_URL}/auth/login-user`;
            payload = loginWith === "email"
                ? { email: formData.email, password: formData.password }
                : { phone: formData.phone, password: formData.password };
        } else {
            url = `${process.env.NEXT_PUBLIC_API_URL}/business/login`;
            payload = loginWith === "email"
                ? { email: formData.email, password: formData.password }
                : { contactNumber: formData.contactNumber, password: formData.password };
        }

        try {
            const res = await fetch(url, {
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

                // Store correct token
                if (loginType === "user") {
                    localStorage.setItem("userToken", data.token);
                } else {
                    localStorage.setItem("businessToken", data.token);
                }
                const redirectUrl = searchParams.get("redirect") || "/";
                router.push(redirectUrl);
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

        const url = loginType === "user" 
            ? `${process.env.NEXT_PUBLIC_API_URL}/auth/2fa/verify-login`
            : `${process.env.NEXT_PUBLIC_API_URL}/business/2fa/verify-login`;

        try {
            const res = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ tempToken, token: otp })
            });

            const data = await res.json();

            if (data.success) {
                if (loginType === "user") {
                    localStorage.setItem("userToken", data.token);
                } else {
                    localStorage.setItem("businessToken", data.token);
                }
                const redirectUrl = searchParams.get("redirect") || "/";
                router.push(redirectUrl);
            } else {
                setError(data.error || "Invalid verification code.");
            }
        } catch (err) {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = useGoogleLogin({
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
                        const redirectParam = searchParams.get("redirect");
                        const redirectQuery = redirectParam ? `&redirect=${encodeURIComponent(redirectParam)}` : "";
                        router.push(`/google-completion?email=${data.email}&name=${data.name}${redirectQuery}`);
                        return;
                    }
                    localStorage.setItem("userToken", data.token);
                    const redirectUrl = searchParams.get("redirect") || "/";
                    router.push(redirectUrl);
                } else {
                    setError(data.error || "Google login failed.");
                }
            } catch (err) {
                setError("Failed to connect with Google authentication.");
            } finally {
                setLoading(false);
            }
        },
        onError: () => setError("Google login was unsuccessful. Try again."),
    });

    return (
        <div className="w-full max-w-md">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-8"
            >
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-primary/20">
                    <UserCircle className="text-primary w-8 h-8" />
                </div>
                <h1 className="text-3xl font-display font-bold uppercase tracking-widest mb-2">
                    User <span className="text-primary italic">Login</span>
                </h1>
                <p className="text-muted-foreground text-sm uppercase tracking-widest">Access your DBI Profile</p>
            </motion.div>

            <div className="glass-strong border-white/10 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

                {/* Portal Toggle */}
                <div className="flex bg-white/5 p-1.5 rounded-2xl mb-6 relative overflow-hidden">
                    <motion.div 
                        className="absolute inset-y-1.5 bg-primary rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.5)] z-0"
                        initial={false}
                        animate={{ 
                            left: loginType === "user" ? "6px" : "calc(50% + 3px)",
                            width: "calc(50% - 9px)"
                        }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                    <button
                        onClick={() => setLoginType("user")}
                        className={`flex-1 py-3 text-[11px] font-black uppercase tracking-[0.2em] rounded-xl transition-all relative z-10 ${loginType === "user" ? "text-white" : "text-white/40 hover:text-white/60"}`}
                    >
                        User
                    </button>
                    <button
                        onClick={() => setLoginType("business")}
                        className={`flex-1 py-3 text-[11px] font-black uppercase tracking-[0.2em] rounded-xl transition-all relative z-10 ${loginType === "business" ? "text-white" : "text-white/40 hover:text-white/60"}`}
                    >
                        Business
                    </button>
                </div>

                {/* Credential Type Toggle */}
                <div className="flex justify-center gap-8 mb-8 border-b border-white/5 pb-2">
                    <button
                        onClick={() => setLoginWith("email")}
                        className={`text-[10px] font-bold uppercase tracking-widest transition-all relative py-2 ${loginWith === "email" ? "text-primary after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-primary" : "text-white/30 hover:text-white/50"}`}
                    >
                        Email
                    </button>
                    <button
                        onClick={() => setLoginWith("phone")}
                        className={`text-[10px] font-bold uppercase tracking-widest transition-all relative py-2 ${loginWith === "phone" ? "text-primary after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-primary" : "text-white/30 hover:text-white/50"}`}
                    >
                        {loginType === "business" ? "Contact" : "Phone"}
                    </button>
                </div>

                {message && (
                    <div className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 flex items-center gap-3">
                        <span className="text-xs font-medium">{message}</span>
                    </div>
                )}

                {error && (
                    <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-3">
                        <AlertCircle size={18} />
                        <span className="text-xs font-medium">{error}</span>
                    </div>
                )}

                {requires2fa ? (
                    <form onSubmit={handle2FASubmit} className="space-y-6">
                        <div className="space-y-2 text-center">
                            <Label className="text-white/70 text-[10px] uppercase tracking-widest">2-Step Verification</Label>
                            <Input
                                type="text"
                                maxLength={6}
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                className="bg-white/5 border-white/10 text-white h-12 rounded-xl focus:ring-primary/50 text-center text-lg tracking-[0.4em] font-bold"
                                placeholder="000000"
                                required
                            />
                            <p className="text-white/40 text-[10px] uppercase tracking-widest mt-4 leading-relaxed">Enter the 6-digit code from your authenticator app.</p>
                        </div>
                        <Button
                            type="submit"
                            variant="glow"
                            disabled={loading || otp.length < 6}
                            className="w-full h-12 rounded-xl font-display uppercase tracking-[0.2em] text-xs bg-primary text-white"
                        >
                            {loading ? "Verifying..." : "Verify Code"}
                        </Button>
                    </form>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {loginWith === "email" ? (
                            <div className="space-y-2">
                                <Label className="text-white/70 text-[10px] uppercase tracking-widest ml-1">{loginType === "business" ? "Official Email" : "Email Address"}</Label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                                    <Input
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="bg-white/5 border-white/10 text-white pl-11 h-12 rounded-xl focus:ring-primary/50"
                                        placeholder={loginType === "business" ? "name@business.com" : "name@example.com"}
                                        required
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <Label className="text-white/70 text-[10px] uppercase tracking-widest ml-1">{loginType === "business" ? "Contact Number" : "Phone Number"}</Label>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                                    <Input
                                        name={loginType === "business" ? "contactNumber" : "phone"}
                                        type="tel"
                                        value={loginType === "business" ? formData.contactNumber : formData.phone}
                                        onChange={handleInputChange}
                                        className="bg-white/5 border-white/10 text-white pl-11 h-12 rounded-xl focus:ring-primary/50"
                                        placeholder="+91 00000 00000"
                                        required
                                    />
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <div className="flex justify-between items-center ml-1">
                                <Label className="text-white/70 text-[10px] uppercase tracking-widest">Password</Label>
                                <Link 
                                    href={`/forgot-password?type=${loginType}`} 
                                    className="text-[10px] text-primary hover:underline uppercase tracking-widest font-bold"
                                >
                                    Forgot?
                                </Link>
                            </div>
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
                            {loading ? <span className="flex items-center gap-2"><LogIn size={14} className="animate-pulse" /> Authenticating...</span> : `Login to ${loginType === "business" ? "Portal" : "Profile"}`}
                        </Button>
                    </form>
                )}

                {loginType === "user" && (
                    <>
                        <div className="mt-8 flex items-center gap-4">
                            <div className="h-px flex-1 bg-white/10" />
                            <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Or</span>
                            <div className="h-px flex-1 bg-white/10" />
                        </div>

                        <button
                            onClick={() => handleGoogleLogin()}
                            className="mt-6 h-12 w-full rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all flex items-center justify-center gap-3 group"
                        >
                            <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            <span className="text-xs uppercase tracking-widest font-bold">Login with Google</span>
                        </button>
                    </>
                )}

                <div className="mt-8 pt-6 border-t border-white/10 text-center">
                    <p className="text-white/40 text-xs uppercase tracking-widest inline-block mr-2">
                        {loginType === "business" ? "Start your business journey?" : "New to DBI?"}
                    </p>
                    <Button variant="link" className="p-0 h-auto text-primary font-bold uppercase tracking-widest text-xs" asChild>
                        <Link href={loginType === "business" ? "/community/register" : "/register"}>Sign Up <ChevronRight size={14} className="ml-1 inline" /></Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <div className="min-h-screen bg-background relative overflow-hidden text-foreground">
          
            <CursorGlow />
            <Navbar />

            <main className="pt-32 pb-24 relative z-10 px-4 flex items-center justify-center">
                <Suspense fallback={<div className="text-white/40 uppercase tracking-widest text-xs">Loading Authentication Portal...</div>}>
                    <LoginContent />
                </Suspense>
            </main>

            <Footer />
        </div>
    );
}
