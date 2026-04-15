"use client";

import React from "react";
import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import { Users, FileCheck, ShieldCheck, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function VerifiedInvestorsPage() {
    return (
        <div className="bg-[#f8fafc] min-h-screen text-slate-900 font-poppins selection:bg-sky-500/30">
            <Navbar />
            <main className="pt-32 pb-24 px-4 max-w-6xl mx-auto">
                <div className="text-center mb-16">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-[0.3em] mb-6 border border-slate-200"
                    >
                        <Users size={12} /> Investor Ecosystem
                    </motion.div>
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl md:text-7xl font-black text-slate-900 mb-6 italic tracking-tighter uppercase"
                    >
                        100% Verified <span className="text-blue-600">Investors.</span>
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-slate-500 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed italic"
                    >
                        We ensure that founders only spend their valuable time with vetted, serious capital. No tire-kickers. No anonymous profiles.
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
                            <div className="w-16 h-16 rounded-2xl bg-slate-50 text-slate-900 flex items-center justify-center mb-8 border border-slate-200">
                                <FileCheck size={32} />
                            </div>
                            <h2 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900 mb-4">KYC Compliance</h2>
                            <p className="text-slate-600 leading-relaxed text-lg">
                                Every investor on our platform has passed strict financial background checks. Whether it's an angel, VC fund, or private equity firm, you know exactly who you are speaking to.
                            </p>
                        </div>
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="rounded-[3rem] bg-slate-900 text-white p-12 shadow-xl shadow-slate-900/20 flex flex-col justify-between border border-slate-800"
                    >
                        <div>
                            <div className="w-16 h-16 rounded-2xl bg-slate-800 text-blue-400 flex items-center justify-center mb-8 border border-slate-700">
                                <ShieldCheck size={32} />
                            </div>
                            <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white mb-4">Secure Outreach</h2>
                            <p className="text-slate-400 leading-relaxed text-lg">
                                Founders can accept or decline introduction requests to maintain complete control over their cap-table strategy. All interactions remain strictly confidential and secured.
                            </p>
                        </div>
                    </motion.div>
                </div>

                <div className="mt-20 flex justify-center">
                    <Link href="/apply/business">
                        <button className="bg-slate-900 hover:bg-slate-800 text-white font-black text-xl px-12 py-5 rounded-full shadow-xl shadow-slate-300 transition-all hover:-translate-y-1 inline-flex items-center gap-3">
                            Connect Now <ChevronRight />
                        </button>
                    </Link>
                </div>
            </main>
        </div>
    );
}
