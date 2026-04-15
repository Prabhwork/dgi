"use client";

import React from "react";
import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import { Rocket, Target, TrendingUp, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function HighGrowthPage() {
    return (
        <div className="bg-[#f8fafc] min-h-screen text-slate-900 font-poppins selection:bg-sky-500/30">
            <Navbar />
            <main className="pt-32 pb-24 px-4 max-w-6xl mx-auto">
                <div className="text-center mb-16">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-[0.3em] mb-6 border border-blue-100"
                    >
                        <Rocket size={12} /> The Portfolio
                    </motion.div>
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl md:text-7xl font-black text-slate-900 mb-6 italic tracking-tighter uppercase"
                    >
                        High <span className="text-blue-600">Growth.</span>
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-slate-500 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed italic"
                    >
                        We exclusively focus on scalable, high-momentum enterprises shaping the future. DBI Invest Connect curates businesses with proven traction and clear roadmaps.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-16">
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="rounded-[3rem] bg-blue-600 text-white p-12 shadow-xl shadow-blue-200/50 flex flex-col justify-between"
                    >
                        <div>
                            <div className="w-16 h-16 rounded-2xl bg-blue-500 text-white flex items-center justify-center mb-8 shadow-inner shadow-blue-400">
                                <TrendingUp size={32} />
                            </div>
                            <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white mb-4">Scalable Horizons</h2>
                            <p className="text-blue-100 leading-relaxed text-lg">
                                Whether it's deep-tech, scalable commerce, or infrastructure innovations, we bring forward companies positioned to dominate markets globally while being built locally.
                            </p>
                        </div>
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="rounded-[3rem] bg-white p-12 shadow-xl shadow-slate-200/40 border border-slate-100 flex flex-col justify-between"
                    >
                        <div>
                            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-8 border border-blue-100">
                                <Target size={32} />
                            </div>
                            <h2 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900 mb-4">Sector Agnostic</h2>
                            <p className="text-slate-600 leading-relaxed text-lg">
                                True growth isn't bound by one industry. We cover 64 diverse categories, identifying alpha everywhere from prop-tech and fintech to agritech and green energy.
                            </p>
                        </div>
                    </motion.div>
                </div>

                <div className="mt-20 flex justify-center">
                    <Link href="/topics">
                        <button className="bg-slate-900 hover:bg-slate-800 text-white font-black text-xl px-12 py-5 rounded-full shadow-xl shadow-slate-300 transition-all hover:-translate-y-1 inline-flex items-center gap-3">
                            Explore Sectors <ChevronRight />
                        </button>
                    </Link>
                </div>
            </main>
        </div>
    );
}
