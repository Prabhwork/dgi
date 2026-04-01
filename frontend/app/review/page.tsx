"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star } from "lucide-react";
import Link from "next/link";
import { CheckCircle2, ArrowLeft } from "lucide-react";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useTheme } from "@/components/ThemeProvider";
import ParticleNetworkWrapper from "@/components/ParticleNetworkWrapper";

export default function ReviewPage() {
    const { theme } = useTheme();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        role: '',
        quote: '',
        rating: 5
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitStatus('idle');

        try {
            const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
            const res = await fetch(`${API}/testimonials`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            
            // Artificial delay for better UX
            await new Promise(resolve => setTimeout(resolve, 800));

            if (data.success) {
                setSubmitStatus('success');
                setFormData({ name: '', email: '', phone: '', role: '', quote: '', rating: 5 });
            } else {
                setSubmitStatus('error');
            }
        } catch (err) {
            setSubmitStatus('error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="min-h-screen flex flex-col relative overflow-hidden bg-background text-foreground">
            <ParticleNetworkWrapper className="z-0 opacity-80" />
            <Navbar />
            
            {/* Background elements */}
            <div className="absolute inset-0 pointer-events-none z-0">
                <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full blur-[120px] bg-primary/10" />
                <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full blur-[100px] bg-accent/10" />
            </div>

            <div className="flex-grow flex items-center justify-center pt-32 pb-20 px-4 relative z-10 w-full">
                <div className="w-full max-w-[600px] mx-auto">
                    <Link href="/#testimonials" className={`inline-flex items-center mb-8 transition-colors ${theme === 'light' ? 'text-slate-500 hover:text-primary' : 'text-white/60 hover:text-white'}`}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Home
                    </Link>

                    <div className={`border rounded-[2rem] p-8 md:p-12 shadow-2xl relative overflow-hidden backdrop-blur-xl ${
                        theme === 'light' 
                            ? 'bg-white/80 border-slate-200/60 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)]' 
                            : 'bg-[#020631]/60 border-white/10 glass-strong'
                    }`}>
                        {/* Shimmer effect */}
                        <div className={`absolute inset-0 pointer-events-none ${theme === 'light' ? 'bg-gradient-to-br from-white/60 to-transparent' : 'bg-gradient-to-br from-white/5 to-transparent'}`} />

                        <AnimatePresence mode="wait">
                            {submitStatus === 'success' ? (
                                <motion.div
                                    key="success"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="text-center py-12"
                                >
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: "spring", delay: 0.2 }}
                                        className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6"
                                    >
                                        <CheckCircle2 size={56} className="text-green-500" />
                                    </motion.div>
                                    <h2 className={`text-3xl font-display font-bold mb-4 ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>Thank You!</h2>
                                    <p className={`text-lg mb-8 max-w-sm mx-auto ${theme === 'light' ? 'text-slate-600' : 'text-white/70'}`}>
                                        Your review has been successfully submitted and is awaiting administrator approval. 
                                        We truly appreciate your feedback!
                                    </p>
                                    <Link href="/">
                                        <button className={`font-medium py-3 px-8 rounded-xl transition-all border ${
                                            theme === 'light'
                                                ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 shadow-sm'
                                                : 'bg-white/10 hover:bg-white/20 border-white/20 text-white'
                                        }`}>
                                            Return to Homepage
                                        </button>
                                    </Link>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="form"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                >
                                    <div className="text-center mb-10">
                                        <h1 className="text-4xl md:text-5xl font-display font-black mb-4 tracking-tight">
                                            Share Your <span className="gradient-text">Experience</span>
                                        </h1>
                                        <p className={`text-lg max-w-lg mx-auto ${theme === 'light' ? 'text-slate-600' : 'text-white/60'}`}>
                                            How has Digital Book of India helped your business grow? We&apos;d love to hear your story.
                                        </p>
                                    </div>

                                    <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className={`text-sm font-medium ml-1 ${theme === 'light' ? 'text-slate-700' : 'text-white/80'}`}>Full Name</label>
                                                <input
                                                    required
                                                    type="text"
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                    placeholder="e.g. Rahul Sharma"
                                                    className={`w-full border rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all ${
                                                        theme === 'light'
                                                            ? 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
                                                            : 'bg-black/20 border-white/10 text-white placeholder:text-white/20'
                                                    }`}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className={`text-sm font-medium ml-1 ${theme === 'light' ? 'text-slate-700' : 'text-white/80'}`}>Phone Number</label>
                                                <input
                                                    required
                                                    type="tel"
                                                    value={formData.phone}
                                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                    placeholder="e.g. 9876543210"
                                                    className={`w-full border rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all ${
                                                        theme === 'light'
                                                            ? 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
                                                            : 'bg-black/20 border-white/10 text-white placeholder:text-white/20'
                                                    }`}
                                                />
                                            </div>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className={`text-sm font-medium ml-1 ${theme === 'light' ? 'text-slate-700' : 'text-white/80'}`}>Email Address</label>
                                                <input
                                                    required
                                                    type="email"
                                                    value={formData.email}
                                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                    placeholder="e.g. rahul@example.com"
                                                    className={`w-full border rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all ${
                                                        theme === 'light'
                                                            ? 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
                                                            : 'bg-black/20 border-white/10 text-white placeholder:text-white/20'
                                                    }`}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className={`text-sm font-medium ml-1 ${theme === 'light' ? 'text-slate-700' : 'text-white/80'}`}>Your Role / Business</label>
                                                <input
                                                    required
                                                    type="text"
                                                    value={formData.role}
                                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                                    placeholder="e.g. Shop Owner, Developer"
                                                    className={`w-full border rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all ${
                                                        theme === 'light'
                                                            ? 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
                                                            : 'bg-black/20 border-white/10 text-white placeholder:text-white/20'
                                                    }`}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className={`text-sm font-medium ml-1 ${theme === 'light' ? 'text-slate-700' : 'text-white/80'}`}>Your Review</label>
                                            <textarea
                                                required
                                                rows={5}
                                                value={formData.quote}
                                                onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
                                                placeholder="Tell us about your experience..."
                                                className={`w-full border rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all resize-none ${
                                                    theme === 'light'
                                                        ? 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
                                                        : 'bg-black/20 border-white/10 text-white placeholder:text-white/20'
                                                }`}
                                            />
                                        </div>

                                        <button
                                            disabled={isSubmitting}
                                            type="submit"
                                            className={`w-full mt-4 font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg border-none disabled:opacity-70 disabled:cursor-not-allowed ${
                                                theme === 'light'
                                                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-600/20'
                                                    : 'bg-primary text-white hover:bg-primary/90 shadow-primary/20'
                                            }`}
                                        >
                                            {isSubmitting ? (
                                                <span className="flex items-center gap-2">
                                                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                                                        <Star className="w-5 h-5" />
                                                    </motion.div>
                                                    Submitting...
                                                </span>
                                            ) : (
                                                <span className="flex items-center">
                                                    Submit Review
                                                </span>
                                            )}
                                        </button>

                                        {submitStatus === 'error' && (
                                            <motion.p 
                                                initial={{ opacity: 0, y: -10 }} 
                                                animate={{ opacity: 1, y: 0 }} 
                                                className={`text-sm mt-4 text-center font-medium py-2 rounded-lg ${
                                                    theme === 'light' ? 'bg-red-50 text-red-600' : 'bg-red-500/10 text-red-400'
                                                }`}
                                            >
                                                Something went wrong. Please try again or contact support.
                                            </motion.p>
                                        )}
                                    </form>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
            
            <Footer />
        </main>
    );
}
