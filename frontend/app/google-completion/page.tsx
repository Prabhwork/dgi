"use client";

import { useState, useEffect, Suspense } from "react";
import { motion } from "framer-motion";
import { User, Phone, ChevronRight, AlertCircle, Sparkles, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CursorGlow from "@/components/CursorGlow";
import { useRouter, useSearchParams } from "next/navigation";

function GoogleCompletionContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        email: ""
    });

    useEffect(() => {
        const email = searchParams.get("email");
        const name = searchParams.get("name");
        if (email) setFormData(prev => ({ ...prev, email, name: name || "" }));
    }, [searchParams]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/complete-profile`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: formData.email,
                    name: formData.name,
                    phone: formData.phone
                })
            });

            const data = await res.json();

            if (data.success) {
                setSuccess(true);
                localStorage.setItem("userToken", data.token);
                setTimeout(() => {
                    const redirectUrl = searchParams.get("redirect") || "/";
                    router.push(redirectUrl);
                }, 2000);
            } else {
                setError(data.error || "Failed to complete profile.");
            }
        } catch (err) {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-8"
            >
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-primary/20">
                    <Sparkles className="text-primary w-8 h-8" />
                </div>
                <h1 className="text-3xl font-display font-bold uppercase tracking-widest mb-2">
                    Almost <span className="text-primary italic">There</span>
                </h1>
                <p className="text-muted-foreground text-sm uppercase tracking-widest">Complete your user profile</p>
            </motion.div>

            <div className="glass-strong border-white/10 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

                {success ? (
                    <div className="text-center py-8">
                        <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 className="text-green-500 w-10 h-10" />
                        </div>
                        <h2 className="text-xl font-bold uppercase tracking-[0.1em] mb-4">Profile Completed!</h2>
                        <p className="text-white/60 text-sm uppercase tracking-widest animate-pulse">Redirecting to Dashboard...</p>
                    </div>
                ) : (
                    <>
                        <p className="text-sm text-white/60 mb-8 text-center uppercase tracking-widest leading-relaxed">
                            Please provide a few more details to set up your Digital Book of India account.
                        </p>

                        {error && (
                            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-3">
                                <AlertCircle size={18} />
                                <span className="text-xs font-medium">{error}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
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

                            <Button
                                type="submit"
                                variant="glow"
                                disabled={loading}
                                className="w-full h-12 rounded-xl font-display uppercase tracking-[0.2em] text-xs bg-primary text-white"
                            >
                                {loading ? "Finalizing..." : "Complete Setup"}
                            </Button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}

export default function GoogleCompletionPage() {
    return (
        <div className="min-h-screen bg-background relative overflow-hidden text-foreground">
        
            <CursorGlow />
            <Navbar />

            <main className="pt-32 pb-24 relative z-10 px-4 flex items-center justify-center">
                <Suspense fallback={<div className="text-white/40 uppercase tracking-widest text-xs">Loading Profile Setup...</div>}>
                    <GoogleCompletionContent />
                </Suspense>
            </main>

            <Footer />
        </div>
    );
}
