"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowRight, CheckCircle2, ChevronRight,
    Users, TrendingUp, BarChart3, Megaphone,
    Briefcase, Layout, Globe, MoreHorizontal,
    DollarSign, Rocket, Target, ShieldCheck, Mail, Phone, User, Store, ArrowLeft, Loader2,
    Building2, ShoppingCart, Award
} from "lucide-react";

// Fallback steps if API fails
const FALLBACK_STEPS = [
    {
        _id: "1",
        question: "What type of business do you run?",
        options: [
            { label: "Service-based (Agency, Freelancer, Consultant)", icon: "Briefcase", color: "from-blue-500 to-cyan-400" },
            { label: "Product-based (Physical products)", icon: "Store", color: "from-purple-500 to-pink-500" },
            { label: "Online/Digital (Courses, SaaS, etc.)", icon: "Globe", color: "from-emerald-500 to-teal-400" },
            { label: "Local business (Shop, Salon, Gym, etc.)", icon: "Building2", color: "from-amber-500 to-orange-400" },
            { label: "Other", icon: "MoreHorizontal", color: "from-slate-500 to-slate-400" }
        ]
    }
];

const DynamicIcon = ({ name, size = 20, className = "" }: { name: string, size?: number, className?: string }) => {
    const icons: Record<string, any> = {
        Users, TrendingUp, BarChart3, Megaphone, Briefcase, Layout, Globe, 
        MoreHorizontal, DollarSign, Rocket, Target, ShieldCheck, Mail, 
        Phone, User, Store, ArrowLeft, Building2, ShoppingCart, Award
    };
    const IconComponent = icons[name] || MoreHorizontal;
    return <IconComponent size={size} className={className} />;
};

export default function BusinessGrowthFunnel() {
    const [started, setStarted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [steps, setSteps] = useState(FALLBACK_STEPS);
    const [step, setStep] = useState(1);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [showResult, setShowResult] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        email: "",
        businessName: "",
        description: ""
    });
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const API = process.env.NEXT_PUBLIC_API_URL;

    useEffect(() => {
        const fetchSteps = async () => {
            try {
                const res = await fetch(`${API}/funnel/questions`);
                const data = await res.json();
                if (data.success && data.data.length > 0) {
                    setSteps(data.data);
                }
            } catch (err) {
                console.error("Failed to fetch funnel steps:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchSteps();
    }, [API]);

    const progress = started ? (showResult ? 100 : (step / steps.length) * 100) : 0;

    const handleOptionSelect = (option: string) => {
        setAnswers({ ...answers, [steps[step - 1].question]: option });
        if (step < steps.length) {
            setStep(step + 1);
        } else {
            setShowResult(true);
        }
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await fetch(`${API}/funnel/leads`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...formData, answers })
            });
            if (res.ok) {
                setSubmitted(true);
            }
        } catch (err) {
            console.error("Submission error:", err);
        } finally {
            setSubmitting(false);
        }
    };

    const reset = () => {
        setStarted(false);
        setStep(1);
        setAnswers({});
        setShowResult(false);
        setSubmitted(false);
    };

    if (submitted) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-2xl mx-auto my-12 p-12 text-center rounded-[2.5rem] border border-white/10 glass shadow-2xl relative overflow-hidden"
            >
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-transparent to-transparent opacity-40 pointer-events-none" />
                <div className="relative z-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 text-green-400 mb-6 border border-green-500/30 shadow-[0_0_20px_rgba(34,197,94,0.3)]">
                        <CheckCircle2 size={32} />
                    </div>
                    <h2 className="text-3xl font-display font-black text-white mb-4 tracking-tight">
                        Strategy <span className="gradient-text">Locked In</span>
                    </h2>
                    <p className="text-lg text-white/70 mb-8 max-w-md mx-auto font-medium">
                        Thank you! Our experts are now crafting your personalized plan. We'll contact you shortly!
                    </p>
                    <button
                        onClick={reset}
                        className="px-8 h-12 bg-white/10 hover:bg-white/20 text-white text-sm font-bold rounded-xl transition-all border border-white/10"
                    >
                        Close Funnel
                    </button>
                </div>
            </motion.div>
        );
    }

    return (
        <section className="relative w-full max-w-5xl mx-auto px-4 py-8">
            {!started ? (
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="relative py-16 px-6 rounded-[3rem] overflow-hidden border border-white/10 glass shadow-2xl text-center"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-cyan-500/10 opacity-30 pointer-events-none" />
                    <div className="absolute inset-0 digital-grid opacity-5 pointer-events-none" />
                    
                    <div className="relative z-10">
                        <span className="inline-block px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-white text-[8px] font-black uppercase tracking-[0.4em] mb-6 shadow-xl shadow-primary/5">
                            Interactive Strategy
                        </span>
                        <h2 className="text-4xl md:text-5xl font-display font-black text-white mb-6 tracking-tighter leading-tight">
                            Grow Your Business <span className="gradient-text brightness-110">Smarter</span>
                        </h2>
                        <p className="text-base md:text-lg text-white/60 mb-10 leading-relaxed max-w-xl mx-auto font-medium">
                            Answer a few quick questions to get a personalized growth plan tailored to your goals.
                        </p>
                        <button
                            onClick={() => setStarted(true)}
                            className="inline-flex items-center gap-3 h-16 px-12 bg-white text-[#010638] font-black uppercase tracking-[0.1em] rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-[0_0_40px_rgba(255,255,255,0.3)] group text-sm"
                        >
                            Start Analysis
                            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </motion.div>
            ) : (
                <div className="relative min-h-[500px]">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <button 
                            onClick={step === 1 ? () => setStarted(false) : () => setStep(step - 1)}
                            className="flex items-center gap-2 text-white/40 hover:text-white transition-colors group"
                        >
                            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Back</span>
                        </button>

                        <div className="flex-1 max-w-xs mx-8">
                            <div className="flex justify-between items-end mb-1.5">
                                <span className="text-[8px] font-black uppercase tracking-widest text-white/30">Step {showResult ? steps.length : step}/{steps.length}</span>
                                <span className="text-[10px] font-bold text-primary">{Math.round(progress)}%</span>
                            </div>
                            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                                <motion.div 
                                    className="h-full bg-gradient-to-r from-blue-500 to-primary rounded-full shadow-[0_0_10px_rgba(59,130,246,0.3)]"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>

                        <div className="w-12" /> {/* Spacer */}
                    </div>

                    <AnimatePresence mode="wait">
                        {!showResult ? (
                            <motion.div
                                key={`step-${step}`}
                                initial={{ opacity: 0, x: 10, filter: "blur(5px)" }}
                                animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                                exit={{ opacity: 0, x: -10, filter: "blur(5px)" }}
                                className="grid gap-4"
                            >
                                <h3 className="text-3xl md:text-4xl font-display font-black text-white mb-6 tracking-tight text-center max-w-2xl mx-auto px-4">
                                    {steps[step - 1].question}
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-3xl mx-auto w-full px-4">
                                    {steps[step - 1].options.map((opt, idx) => (
                                        <motion.button
                                            key={`${step}-${opt.label}`}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            onClick={() => handleOptionSelect(opt.label)}
                                            className="group relative h-28 p-5 rounded-2xl border border-white/5 glass hover:border-primary/40 transition-all text-left overflow-hidden bg-white/[0.01] hover:bg-white/[0.03]"
                                        >
                                            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${opt.color} opacity-0 group-hover:opacity-10 blur-xl transition-opacity`} />
                                            <div className="flex items-center gap-4">
                                                <div className={`w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br ${opt.color} flex items-center justify-center text-white group-hover:scale-110 transition-transform shadow-lg`}>
                                                    <DynamicIcon name={opt.icon} size={20} />
                                                </div>
                                                <div className="text-base font-bold text-white group-hover:text-primary transition-colors leading-tight pr-6">
                                                    {opt.label}
                                                </div>
                                            </div>
                                            <ChevronRight className="absolute bottom-4 right-4 text-white/20 group-hover:text-primary group-hover:translate-x-1 transition-all" size={16} />
                                        </motion.button>
                                    ))}
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="max-w-2xl mx-auto px-4"
                            >
                                <div className="p-8 md:p-10 rounded-[2.5rem] border border-white/10 glass shadow-2xl relative overflow-hidden mb-8">
                                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-40 pointer-events-none" />
                                    <div className="relative z-10 text-center mb-10">
                                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[8px] font-black uppercase tracking-widest mb-4">
                                            <Rocket size={10} /> Strategy Ready
                                        </div>
                                        <h3 className="text-3xl font-display font-black text-white mb-4 tracking-tight">
                                            Growth Plan <span className="gradient-text">Generated</span>
                                        </h3>
                                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-sm md:text-base text-white/80 font-medium italic mb-6">
                                            👉 "You're just one step away from your personalized growth plan."
                                        </div>
                                    </div>

                                    <form onSubmit={handleFormSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[9px] font-black uppercase tracking-widest text-white/30 ml-2">Name</label>
                                            <input 
                                                required
                                                type="text" 
                                                placeholder="John Doe"
                                                value={formData.name}
                                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                                className="w-full h-11 bg-white/5 border border-white/10 rounded-xl px-4 text-sm text-white focus:border-primary/50 outline-none transition-all focus:bg-white/[0.08]" 
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[9px] font-black uppercase tracking-widest text-white/30 ml-2">Phone</label>
                                            <input 
                                                required
                                                type="tel" 
                                                placeholder="+91 00000 00000"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                                className="w-full h-11 bg-white/5 border border-white/10 rounded-xl px-4 text-sm text-white focus:border-primary/50 outline-none transition-all focus:bg-white/[0.08]" 
                                            />
                                        </div>
                                        <div className="md:col-span-2 space-y-1.5">
                                            <label className="text-[9px] font-black uppercase tracking-widest text-white/30 ml-2">Business Email</label>
                                            <input 
                                                required
                                                type="email" 
                                                placeholder="john@business.com"
                                                value={formData.email}
                                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                                className="w-full h-11 bg-white/5 border border-white/10 rounded-xl px-4 text-sm text-white focus:border-primary/50 outline-none transition-all focus:bg-white/[0.08]" 
                                            />
                                        </div>
                                        <div className="md:col-span-2 space-y-1.5">
                                            <label className="text-[9px] font-black uppercase tracking-widest text-white/30 ml-2">Business Name</label>
                                            <input 
                                                required
                                                type="text" 
                                                placeholder="Your Company Name"
                                                value={formData.businessName}
                                                onChange={(e) => setFormData({...formData, businessName: e.target.value})}
                                                className="w-full h-11 bg-white/5 border border-white/10 rounded-xl px-4 text-sm text-white focus:border-primary/50 outline-none transition-all focus:bg-white/[0.08]" 
                                            />
                                        </div>
                                        <div className="md:col-span-2 space-y-1.5">
                                            <label className="text-[9px] font-black uppercase tracking-widest text-white/30 ml-2">Tell us more (Optional)</label>
                                            <textarea 
                                                rows={2}
                                                placeholder="Briefly describe your business goals..."
                                                value={formData.description}
                                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white focus:border-primary/50 outline-none transition-all focus:bg-white/[0.08] resize-none" 
                                            />
                                        </div>
                                        <button 
                                            disabled={submitting}
                                            type="submit"
                                            className="md:col-span-2 h-14 bg-white text-[#010638] font-black uppercase tracking-widest rounded-xl hover:scale-[1.02] active:scale-95 transition-all text-xs flex items-center justify-center gap-2 disabled:opacity-50 shadow-xl shadow-white/10 mt-2"
                                        >
                                            {submitting ? <Loader2 className="animate-spin" size={16} /> : "Get Personalized Plan"}
                                            {!submitting && <ArrowRight size={16} />}
                                        </button>
                                    </form>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}
        </section>
    );
}
