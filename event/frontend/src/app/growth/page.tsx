"use client";

import React from "react";
import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import { Rocket, Gem, Activity, LineChart, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function GrowthPage() {
    return (
        <div className="bg-[#f8fafc] min-h-screen text-slate-900 font-poppins selection:bg-sky-500/30">
            <Navbar />
            <main className="pt-32 pb-24 px-4 max-w-6xl mx-auto">
                <div className="text-center mb-16">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-[0.3em] mb-6 border border-emerald-100"
                    >
                        <Rocket size={12} /> The Multiplier
                    </motion.div>
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl md:text-7xl font-black text-slate-900 mb-6 italic tracking-tighter uppercase"
                    >
                        Accelerated <span className="text-emerald-600">Growth.</span>
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-slate-500 text-lg md:text-xl font-medium max-w-3xl mx-auto leading-relaxed italic"
                    >
                        Capital isn't just money; it's momentum. We specifically curate and elevate businesses that possess the fundamentals to 100x and investors who bring strategic network value beyond cash.
                    </motion.p>
                </div>

                <div className="mt-20 max-w-4xl mx-auto">
                    <div className="space-y-12 border-l-4 border-emerald-100 pl-8 ml-4 relative">
                        {/* Point 1 */}
                        <div className="relative">
                            <div className="absolute -left-[45px] top-0 w-12 h-12 bg-emerald-500 rounded-full border-4 border-[#f8fafc] flex items-center justify-center text-white font-black">
                                01
                            </div>
                            <motion.div 
                                initial={{ opacity: 0, x: 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                className="bg-white p-10 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100"
                            >
                                <h2 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900 mb-4 flex items-center gap-3">
                                    <Gem className="text-emerald-500" /> Defining Alpha
                                </h2>
                                <p className="text-slate-600 text-lg leading-relaxed">
                                    Our evaluation algorithms identify hidden champions. We expose businesses that are flying under the radar but command substantial, defensible monopolies in tier 2 and tier 3 cities in India. The growth multiples here out-scale typical saturated metropolitan startups.
                                </p>
                            </motion.div>
                        </div>

                        {/* Point 2 */}
                        <div className="relative">
                            <div className="absolute -left-[45px] top-0 w-12 h-12 bg-blue-500 rounded-full border-4 border-[#f8fafc] flex items-center justify-center text-white font-black">
                                02
                            </div>
                            <motion.div 
                                initial={{ opacity: 0, x: 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                className="bg-slate-900 text-white p-10 rounded-[2rem] shadow-2xl relative overflow-hidden"
                            >
                                <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-4 flex items-center gap-3">
                                    <Activity className="text-blue-400" /> Strategic Capital Deployment
                                </h2>
                                <p className="text-slate-400 text-lg leading-relaxed mb-6">
                                    By connecting founders with the right investors — those who bring supply chain connections, manufacturing leverage, or distribution channels — we turn a mere capital injection into a massive structural advantage. Smart money wins.
                                </p>
                                <div className="h-[1px] w-full bg-slate-800 my-6" />
                                <div className="flex gap-4">
                                    <div className="bg-slate-800 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest text-slate-300">Mentorship</div>
                                    <div className="bg-slate-800 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest text-slate-300">Distribution</div>
                                </div>
                            </motion.div>
                        </div>

                        {/* Point 3 */}
                        <div className="relative">
                            <div className="absolute -left-[45px] top-0 w-12 h-12 bg-sky-500 rounded-full border-4 border-[#f8fafc] flex items-center justify-center text-white font-black">
                                03
                            </div>
                            <motion.div 
                                initial={{ opacity: 0, x: 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                className="bg-white p-10 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100"
                            >
                                <h2 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900 mb-4 flex items-center gap-3">
                                    <LineChart className="text-sky-500" /> Institutional Preparation
                                </h2>
                                <p className="text-slate-600 text-lg leading-relaxed">
                                    We prep young startups to handle massive institutional capital flows. Utilizing the platform tools helps align unorganized financial books making founders completely transaction-ready for Series A/B placements.
                                </p>
                            </motion.div>
                        </div>
                    </div>
                </div>

                <div className="mt-20 flex justify-center">
                    <Link href="/apply/investor">
                        <button className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xl px-12 py-5 rounded-full shadow-xl shadow-emerald-200 transition-all hover:-translate-y-1 inline-flex items-center gap-3">
                            Fuel Growth <ChevronRight />
                        </button>
                    </Link>
                </div>
            </main>
        </div>
    );
}
