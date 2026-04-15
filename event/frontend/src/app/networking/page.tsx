"use client";

import React from "react";
import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import { Handshake, MessageSquare, Briefcase, Globe, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function NetworkingPage() {
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
                        <Handshake size={12} /> The Connectivity
                    </motion.div>
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl md:text-7xl font-black text-slate-900 mb-6 italic tracking-tighter uppercase"
                    >
                        Deep <span className="text-violet-600">Networking.</span>
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-slate-500 text-lg md:text-xl font-medium max-w-3xl mx-auto leading-relaxed italic"
                    >
                        Stop relying on cold emails and closed circles. Become part of a fluid ecosystem where communication runs natively, securely, and without gatekeepers. Real-time chat leading to real face-to-face handshakes.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="bg-white rounded-[3rem] p-12 shadow-xl shadow-slate-200/50 border border-slate-100"
                    >
                        <div className="w-16 h-16 bg-violet-50 text-violet-600 rounded-2xl flex items-center justify-center mb-8">
                            <MessageSquare size={32} />
                        </div>
                        <h2 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900 mb-6">Encrypted Comms Lines</h2>
                        <p className="text-slate-600 text-lg leading-relaxed mb-6">
                            Interact with interested parties immediately via the DBI Secure Pipeline. Once a match is made, instant messaging is unlocked allowing founders to transmit secure data-room links and NDA documents directly over a 256-bit encrypted channel.
                        </p>
                        <p className="text-slate-600 text-lg leading-relaxed">
                            No external messy email threads. Complete audit trails. Total professional boundaries.
                        </p>
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="bg-slate-900 rounded-[3rem] p-12 shadow-2xl text-white"
                    >
                        <div className="w-16 h-16 bg-slate-800 text-indigo-400 rounded-2xl flex items-center justify-center mb-8">
                            <Briefcase size={32} />
                        </div>
                        <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-6">Pitch Room Automation</h2>
                        <p className="text-slate-400 text-lg leading-relaxed mb-6">
                            Schedule video pitch calls directly through the platform. When the Hybrid Event happens, you can book physical lounges at the convention center directly from the same interface used to chat online.
                        </p>
                        <p className="text-slate-400 text-lg leading-relaxed">
                            The O2O (Online to Offline) crossover ensures that when you actually meet in person, 90% of the friction is already handled.
                        </p>
                    </motion.div>
                </div>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[3rem] p-12 md:p-20 text-center text-white shadow-2xl shadow-indigo-600/30"
                >
                    <Globe className="mx-auto mb-6 opacity-50" size={64} />
                    <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter mb-8">A Global Audience</h2>
                    <p className="text-xl md:text-2xl text-indigo-100 leading-relaxed max-w-3xl mx-auto font-medium">
                        The platform bridges the gap between massive foreign capital seeking Indian deployment and local grassroots businesses entirely shut off from the traditional ecosystem.
                    </p>
                </motion.div>

                <div className="mt-20 flex justify-center">
                    <Link href="/apply/business">
                        <button className="bg-slate-900 hover:bg-slate-800 text-white font-black text-xl px-12 py-5 rounded-full shadow-xl shadow-slate-300 transition-all hover:-translate-y-1 inline-flex items-center gap-3">
                            Join the Network <ChevronRight />
                        </button>
                    </Link>
                </div>

            </main>
        </div>
    );
}
