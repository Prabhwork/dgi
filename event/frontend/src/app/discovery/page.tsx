"use client";

import React from "react";
import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import { Search, Filter, ShieldAlert, Cpu, Sparkles, Navigation, Layers, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function DiscoveryPage() {
    return (
        <div className="bg-[#f8fafc] min-h-screen text-slate-900 font-poppins selection:bg-sky-500/30">
            <Navbar />
            <main className="pt-32 pb-24 px-4 max-w-6xl mx-auto">
                <div className="text-center mb-16">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-50 text-sky-600 text-[10px] font-black uppercase tracking-[0.3em] mb-6 border border-sky-100"
                    >
                        <Search size={12} /> The Core Engine
                    </motion.div>
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl md:text-7xl font-black text-slate-900 mb-6 italic tracking-tighter uppercase"
                    >
                        Deep <span className="text-sky-600">Discovery.</span>
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-slate-500 text-lg md:text-xl font-medium max-w-3xl mx-auto leading-relaxed italic"
                    >
                        Finding the right partner in an ocean of millions of businesses is impossible without the right tools. DBI Invest Connect deploys an ultra-advanced discovery engine to match vision mapping with exact financial requirements. Stop searching aimlessly, start finding exact matches.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 mb-10">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="bg-slate-900 rounded-[3rem] p-12 shadow-2xl overflow-hidden relative text-white"
                    >
                        <div className="absolute -top-40 -right-40 w-96 h-96 bg-sky-500 rounded-full blur-[100px] opacity-20" />
                        
                        <div className="max-w-4xl relative z-10">
                            <h2 className="text-4xl font-black italic uppercase tracking-tighter mb-6">Unrivaled Filtering Mechanics</h2>
                            <p className="text-slate-400 text-lg md:text-xl leading-relaxed mb-6">
                                We go far beyond simple "industry" searching. Our platform provides multi-variate filters allowing investors and business owners to sort by exact MRR (Monthly Recurring Revenue), burn rates, team size, patent registrations, geographical scale, and exact funding stages (Pre-Seed to Series D+). 
                            </p>
                            <p className="text-slate-400 text-lg md:text-xl leading-relaxed">
                                You can locate a drone-manufacturing startup in tier-2 India looking for exactly $50K to scale production within 3 mouse clicks. That is the power of the DBI Discovery backbone.
                            </p>
                        </div>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        { icon: Filter, title: "Precision Optics", desc: "Filter through thousands of profiles using high-fidelity financial markers rather than just marketing tags." },
                        { icon: Sparkles, title: "AI Matchmaking", desc: "Our deterministic engine analyzes your search history and investment thesis to auto-suggest portfolios daily." },
                        { icon: Layers, title: "Sector Drilling", desc: "Explore 64 specialized categories with embedded sub-categories to find niche-monopoly businesses." },
                    ].map((feature, i) => (
                        <motion.div 
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-white p-10 rounded-[3rem] shadow-xl shadow-slate-200/50 border border-slate-100 hover:-translate-y-2 transition-all cursor-default"
                        >
                            <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mb-6">
                                <feature.icon size={28} />
                            </div>
                            <h3 className="text-2xl font-black italic uppercase text-slate-900 mb-4">{feature.title}</h3>
                            <p className="text-slate-500 leading-relaxed font-medium">{feature.desc}</p>
                        </motion.div>
                    ))}
                </div>

                <div className="mt-20 flex justify-center">
                    <Link href="/topics">
                        <button className="bg-sky-600 hover:bg-sky-500 text-white font-black text-xl px-12 py-5 rounded-full shadow-xl shadow-sky-200 transition-all hover:-translate-y-1 inline-flex items-center gap-3">
                            Start Discovering <ChevronRight />
                        </button>
                    </Link>
                </div>
            </main>
        </div>
    );
}
