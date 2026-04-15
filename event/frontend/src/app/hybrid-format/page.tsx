"use client";

import React from "react";
import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import { Globe, MapPin, Laptop, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function HybridFormatPage() {
    return (
        <div className="bg-[#f8fafc] min-h-screen text-slate-900 font-poppins selection:bg-sky-500/30">
            <Navbar />
            <main className="pt-32 pb-24 px-4 max-w-6xl mx-auto">
                <div className="text-center mb-16">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-50 text-violet-600 text-[10px] font-black uppercase tracking-[0.3em] mb-6 border border-violet-100"
                    >
                        <Globe size={12} /> Events Ecosystem
                    </motion.div>
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl md:text-7xl font-black text-slate-900 mb-6 italic tracking-tighter uppercase"
                    >
                        Hybrid <span className="text-violet-600">Format.</span>
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-slate-500 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed italic"
                    >
                        Distance is no longer a barrier. Merge physical handshakes with digital speed at India's first truly synchronized hybrid summits.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-16">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="rounded-[3rem] bg-white p-12 shadow-xl shadow-slate-200/40 border border-slate-100 flex flex-col justify-between"
                    >
                        <div>
                            <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 flex items-center justify-center mb-8">
                                <MapPin size={32} />
                            </div>
                            <h2 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900 mb-4">In-Person Scale</h2>
                            <p className="text-slate-600 leading-relaxed text-lg">
                                Nothing beats a face-to-face meeting. Our physical summits hosted across key metropolitan cities offer premium lounges, live pitch arenas, and private negotiation rooms.
                            </p>
                        </div>
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="rounded-[3rem] bg-slate-900 text-white p-12 shadow-xl shadow-slate-900/20 border border-slate-800 flex flex-col justify-between"
                    >
                        <div>
                            <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 text-violet-400 flex items-center justify-center mb-8">
                                <Laptop size={32} />
                            </div>
                            <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white mb-4">Digital Access</h2>
                            <p className="text-slate-400 leading-relaxed text-lg">
                                Can't make the physical event? Our synchronized digital platform features live-streamed pitches, virtual meeting rooms, and instant 1-on-1 matchmaking.
                            </p>
                        </div>
                    </motion.div>
                </div>

                <div className="mt-20 flex justify-center">
                    <Link href="/overview">
                        <button className="bg-violet-600 hover:bg-violet-500 text-white font-black text-xl px-12 py-5 rounded-full shadow-xl shadow-violet-200 transition-all hover:-translate-y-1 inline-flex items-center gap-3">
                            View Event Overview <ChevronRight />
                        </button>
                    </Link>
                </div>
            </main>
        </div>
    );
}
