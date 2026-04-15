"use client";

import React from "react";
import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import { Target, TrendingUp, BarChart, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function StrategyPage() {
    return (
        <div className="bg-[#f8fafc] min-h-screen text-slate-900 font-poppins selection:bg-sky-500/30">
            <Navbar />

            {/* Hero */}
            <main className="pt-32 pb-24 px-4 max-w-6xl mx-auto">
                <div className="text-center mb-16">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-[0.3em] mb-6 border border-emerald-100"
                    >
                        <Target size={12} /> The Blueprint
                    </motion.div>
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl md:text-7xl font-black text-slate-900 mb-6 italic tracking-tighter uppercase"
                    >
                        Strategic <span className="text-emerald-600">Growth.</span>
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-slate-500 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed italic"
                    >
                        Focusing on sustainable business models that drive India&apos;s long-term economic vision towards a multi-trillion dollar digital economy.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-16">
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="rounded-[3rem] bg-white p-12 shadow-xl shadow-slate-200/40 border border-slate-100"
                    >
                        <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-8">
                            <TrendingUp size={32} />
                        </div>
                        <h2 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900 mb-4">Hybrid Ecosystem</h2>
                        <p className="text-slate-600 leading-relaxed text-lg mb-6">
                            Physical scale is limited, but digital scale is infinite. By running massive offline summits synchronized natively with our 365-day digital platform, we ensure deals never stop.
                        </p>
                        <ul className="space-y-4 text-slate-500 font-medium">
                            <li className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-emerald-500" /> Scalable investment matchmaking</li>
                            <li className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-emerald-500" /> Persistent digital storefronts</li>
                            <li className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-emerald-500" /> Annual mega networking events</li>
                        </ul>
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="rounded-[3rem] bg-slate-900 p-12 shadow-xl shadow-slate-900/20 border border-slate-800 text-white"
                    >
                        <div className="w-16 h-16 rounded-2xl bg-slate-800 text-emerald-400 flex items-center justify-center mb-8">
                            <BarChart size={32} />
                        </div>
                        <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white mb-4">Data-Driven Approach</h2>
                        <p className="text-slate-400 leading-relaxed text-lg mb-6">
                            Investments are not gambles. Our platform utilizes macro and micro economic indicators alongside deep business profiling to present investors with high-conviction metrics.
                        </p>
                        <ul className="space-y-4 text-slate-400 font-medium">
                            <li className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-emerald-400" /> Real-time analytics dashboard</li>
                            <li className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-emerald-400" /> Revenue & traction validation</li>
                            <li className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-emerald-400" /> Sector specific trend analysis</li>
                        </ul>
                    </motion.div>
                </div>

                <div className="mt-20 flex justify-center">
                    <Link href="/apply/investor">
                        <button className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xl px-12 py-5 rounded-full shadow-xl shadow-emerald-200 transition-all hover:-translate-y-1 inline-flex items-center gap-3">
                            Invest with Us <ChevronRight />
                        </button>
                    </Link>
                </div>
            </main>
        </div>
    );
}
