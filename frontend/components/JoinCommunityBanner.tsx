"use client";

import { motion } from "framer-motion";
import { Users, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { useTheme } from "./ThemeProvider";

export default function JoinCommunityBanner() {
    const { theme } = useTheme();
    const isLight = theme === "light";

    return (
        <section className="py-20 relative overflow-hidden">
            <div className="container mx-auto px-4 relative z-10">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    className={`relative rounded-[3rem] p-8 md:p-16 overflow-hidden border border-solid border-primary/20 bg-[#020631] ${isLight ? 'bg-primary shadow-2xl shadow-primary/40 text-white' : 'bg-white/[0.03] border-white/10 shadow-3xl text-white'}`}
                >
                    {/* Background glow effects */}
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2" />
                    <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/10 blur-[100px] rounded-full -translate-x-1/2 translate-y-1/2" />

                    <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
                        <div className="text-center lg:text-left max-w-2xl">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 mb-6 backdrop-blur-md">
                                <Sparkles size={16} className="text-yellow-400" />
                                <span className="text-xs font-black uppercase tracking-widest">Connect & Grow</span>
                            </div>
                            <h2 className="text-4xl md:text-6xl font-display font-black mb-6 leading-tight">
                                Join the Digital Book of India <span className="text-primary italic">Community</span>
                            </h2>
                            <p className="text-white/70 text-lg md:text-xl leading-relaxed font-medium mb-8">
                                Be part of India's largest localized business network. Collaborate with peers, share insights, 
                                and stay ahead of the curve with real-time updates and exclusive community benefits.
                            </p>
                            <Link 
                                href="/community/register"
                                className={`inline-flex items-center gap-3 px-10 py-5 rounded-full font-black text-lg transition-all duration-500 hover:scale-105 active:scale-95 shadow-xl ${isLight ? 'bg-white text-primary hover:bg-slate-50' : 'bg-primary text-white hover:bg-primary/90 shadow-primary/30'}`}
                            >
                                Get Started Now
                                <ArrowRight size={20} />
                            </Link>
                        </div>

                        <div className="relative group flex-shrink-0">
                            <div className="absolute inset-0 bg-primary/40 blur-[40px] rounded-full opacity-50 group-hover:opacity-80 transition-opacity" />
                            <div className={`w-40 h-40 md:w-64 md:h-64 rounded-full border-4 flex items-center justify-center relative z-10 transition-transform duration-700 group-hover:rotate-[15deg] ${isLight ? 'bg-white/10 border-white/20' : 'bg-white/5 border-white/10'}`}>
                                <Users size={80} className="md:w-32 md:h-32 text-white drop-shadow-2xl" />
                            </div>
                            {/* Floating decorative elements */}
                            <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 4 }} className="absolute -top-4 -right-4 w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg"><Sparkles size={24} className="text-white"/></motion.div>
                            <motion.div animate={{ x: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 5 }} className="absolute -bottom-2 -left-6 w-10 h-10 rounded-2xl bg-blue-400 flex items-center justify-center shadow-lg rotate-12"><Users size={20} className="text-white"/></motion.div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
