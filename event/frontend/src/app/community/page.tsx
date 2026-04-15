"use client";

import React from "react";
import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import { Users, Search, Handshake, ChevronRight, MessageCircle } from "lucide-react";
import Link from "next/link";

export default function CommunityPage() {
    return (
        <div className="bg-[#f8fafc] min-h-screen text-slate-900 font-poppins selection:bg-sky-500/30">
            <Navbar />

            {/* Hero */}
            <main className="pt-32 pb-24 px-4 max-w-6xl mx-auto">
                <div className="text-center mb-16">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-[0.3em] mb-6 border border-blue-100"
                    >
                        <Users size={12} /> The Network
                    </motion.div>
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl md:text-7xl font-black text-slate-900 mb-6 italic tracking-tighter uppercase"
                    >
                        India&apos;s Elite <span className="text-blue-600">Community.</span>
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-slate-500 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed italic"
                    >
                        We are building a verified network where every entrepreneur finds the capital they deserve, and every investor discovers high-growth opportunities.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-16">
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="rounded-[3rem] bg-white p-12 shadow-xl shadow-slate-200/40 border border-slate-100 h-full flex flex-col justify-between"
                    >
                        <div>
                            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-8">
                                <Handshake size={32} />
                            </div>
                            <h2 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900 mb-4">Direct Access</h2>
                            <p className="text-slate-600 leading-relaxed text-lg">
                                Skip the middleman. Our community platform brings verified investors directly to the table with founders. Engage in real-time chat, schedule pitches, and exchange term sheets natively.
                            </p>
                        </div>
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="rounded-[3rem] bg-slate-900 p-12 shadow-xl shadow-slate-900/20 border border-slate-800 text-white h-full flex flex-col justify-between"
                    >
                        <div>
                            <div className="w-16 h-16 rounded-2xl bg-slate-800 text-sky-400 flex items-center justify-center mb-8">
                                <Search size={32} />
                            </div>
                            <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white mb-4">Seamless Discovery</h2>
                            <p className="text-slate-400 leading-relaxed text-lg">
                                Browse through 60+ industry categories locally and globally. Our matchmaking engine connects capital with vision instantly, ensuring your next big deal is just a click away.
                            </p>
                        </div>
                    </motion.div>
                </div>

                {/* Call to Action */}
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mt-20 text-center"
                >
                    <Link href="/apply/business">
                        <button className="bg-sky-600 hover:bg-sky-500 text-white font-black text-xl px-12 py-5 rounded-full shadow-xl shadow-sky-200 transition-all hover:-translate-y-1 inline-flex items-center gap-3">
                            Join the Community <ChevronRight />
                        </button>
                    </Link>
                </motion.div>
            </main>
        </div>
    );
}
