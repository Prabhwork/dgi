"use client";

import React from "react";
import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import { ShieldCheck, Lock, FileCheck, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function TrustPage() {
    return (
        <div className="bg-[#f8fafc] min-h-screen text-slate-900 font-poppins selection:bg-sky-500/30">
            <Navbar />

            {/* Hero */}
            <main className="pt-32 pb-24 px-4 max-w-6xl mx-auto">
                <div className="text-center mb-16">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-[0.3em] mb-6 border border-indigo-100"
                    >
                        <ShieldCheck size={12} /> The Foundation
                    </motion.div>
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl md:text-7xl font-black text-slate-900 mb-6 italic tracking-tighter uppercase"
                    >
                        Absolute <span className="text-indigo-600">Trust.</span>
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-slate-500 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed italic"
                    >
                        Ensuring every profile is rigorously vetted. We combine advanced cryptographic security with government-level verification to create a zero-fraud zone.
                    </motion.p>
                </div>

                <div className="space-y-8 mt-16">
                    {/* Block 1 */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="bg-white p-12 rounded-[3rem] shadow-xl shadow-slate-200/40 border border-slate-100 flex flex-col md:flex-row items-center gap-10"
                    >
                        <div className="w-24 h-24 rounded-3xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                            <FileCheck size={40} />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900 mb-4">Strict Verification Protocols</h2>
                            <p className="text-slate-600 leading-relaxed text-lg mb-4">
                                No anonymous pitch decks. Every business onboarding on DBI Invest Connect undergoes a strict <strong>GST and Aadhaar Verification</strong> process. Financial credentials must be backed by structural proof.
                            </p>
                            <p className="text-slate-600 leading-relaxed text-lg">
                                Likewise, investors undergo rigorous KYC checks ensuring that when communication happens, it happens between totally verified, serious entities.
                            </p>
                        </div>
                    </motion.div>

                    {/* Block 2 */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="bg-slate-900 p-12 rounded-[3rem] shadow-xl shadow-slate-900/20 border border-slate-800 flex flex-col md:flex-row-reverse items-center gap-10 text-white"
                    >
                        <div className="w-24 h-24 rounded-3xl bg-slate-800 text-indigo-400 flex items-center justify-center shrink-0">
                            <Lock size={40} />
                        </div>
                        <div className="text-left md:text-right">
                            <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white mb-4">End-to-End Security</h2>
                            <p className="text-slate-400 leading-relaxed text-lg mb-4">
                                Deal rooms, direct chats, and financial metric exchanges occur natively within our heavily encrypted, isolated environments. We guarantee total data privacy and NDA compliance right on the platform.
                            </p>
                            <p className="text-slate-400 leading-relaxed text-lg">
                                Your intellectual property and financial strategies remain locked behind enterprise-grade security standard architectures.
                            </p>
                        </div>
                    </motion.div>
                </div>

                <div className="mt-20 flex justify-center">
                    <Link href="/">
                        <button className="bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xl px-12 py-5 rounded-full shadow-xl shadow-indigo-200 transition-all hover:-translate-y-1 inline-flex items-center gap-3">
                            Back to Home <ChevronRight />
                        </button>
                    </Link>
                </div>
            </main>
        </div>
    );
}
