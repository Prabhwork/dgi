"use client";

import React from "react";
import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import { ShieldCheck, Fingerprint, Lock, CheckCircle, ChevronRight, Scaling } from "lucide-react";
import Link from "next/link";

export default function VerificationPage() {
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
                        <ShieldCheck size={12} /> The Identity Layer
                    </motion.div>
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl md:text-7xl font-black text-slate-900 mb-6 italic tracking-tighter uppercase"
                    >
                        Total <span className="text-blue-600">Verification.</span>
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-slate-500 text-lg md:text-xl font-medium max-w-3xl mx-auto leading-relaxed italic"
                    >
                        The biggest barrier to digital investment is fraud. We have engineered the most secure, comprehensive authentication gateway in the Indian investment ecosystem. If a profile is strictly verified here, they are completely real. Period.
                    </motion.p>
                </div>

                <div className="flex flex-col lg:flex-row gap-10">
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="flex-1 bg-white p-12 rounded-[3rem] shadow-xl shadow-slate-200/50 border border-slate-100"
                    >
                        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-8">
                            <Fingerprint size={32} />
                        </div>
                        <h2 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900 mb-6">Government Level KYC Checks</h2>
                        <div className="space-y-6 text-slate-600 leading-relaxed text-lg">
                            <p>
                                A startup claims to have 100 Lakh MRR? We don't just take their word for it. Every single business entity onboarding into the DBI framework must provide verifiable government documentation including GST numbers, CIN, and direct Director level Aadhaar authentication.
                            </p>
                            <p>
                                <strong>Why this matters deeply:</strong> Investors lose billions globally to shell companies and false metrics. By completely gatekeeping our platform with harsh entry criteria, we guarantee that the people sitting across from your chat or hybrid-event table literally exist and operate legally within the Indian constitution.
                            </p>
                        </div>
                    </motion.div>

                    <div className="flex-1 space-y-10">
                        <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="bg-slate-900 text-white p-10 rounded-[3rem] shadow-2xl relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 blur-[80px] rounded-full opacity-40" />
                            <h3 className="text-2xl font-black italic uppercase text-white mb-4 relative z-10 flex items-center gap-3">
                                <Lock className="text-blue-400" /> Platform Integrity
                            </h3>
                            <p className="text-slate-400 leading-relaxed font-medium relative z-10">
                                Beyond just initial ID checks, platform behavior modeling actively filters out spam actors. Connection requests are rate-limited, preventing mass-blasting. Our objective is quality signaling over quantity noise.
                            </p>
                        </motion.div>

                        <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="bg-[#f8fafc] border border-slate-200 p-10 rounded-[3rem] shadow-sm relative overflow-hidden"
                        >
                            <h3 className="text-2xl font-black italic uppercase text-slate-900 mb-4 relative z-10 flex items-center gap-3">
                                <CheckCircle className="text-sky-500" /> Green Tick Baseline
                            </h3>
                            <p className="text-slate-600 leading-relaxed font-medium relative z-10">
                                A verified green-tick on the platform implies manual due diligence checks by the DBI internal legal compliance team. We manually inspect and verify cap tables for top-tier listings.
                            </p>
                        </motion.div>
                    </div>
                </div>

                <div className="mt-20 flex justify-center">
                    <Link href="/about">
                        <button className="bg-blue-600 hover:bg-blue-500 text-white font-black text-xl px-12 py-5 rounded-full shadow-xl shadow-blue-200 transition-all hover:-translate-y-1 inline-flex items-center gap-3">
                            Read About Us <ChevronRight />
                        </button>
                    </Link>
                </div>
            </main>
        </div>
    );
}
