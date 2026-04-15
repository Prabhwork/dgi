"use client";

import React from "react";
import { motion } from "framer-motion";
import { Globe, Users, Target, Rocket, TargetIcon, TrendingUp, Handshake, ShieldCheck } from "lucide-react";
import Navbar from "@/components/Navbar";

export default function OverviewPage() {
    return (
        <div className="bg-[#f8fafc] min-h-screen text-slate-900 selection:bg-sky-500/30 font-sans pb-24">
            <Navbar />

            <main className="pt-32 px-4 max-w-5xl mx-auto">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-50 text-sky-600 text-[10px] font-black uppercase tracking-[0.2em] mb-6 border border-sky-100">
                        <Globe size={11} /> 
                        The Vision
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black italic tracking-tighter text-slate-900 mb-6 uppercase">
                        Event <span className="text-sky-600">Overview.</span>
                    </h1>
                    <p className="text-slate-500 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed">
                        BharatNivesh Summit 2026 is India&apos;s First Hybrid Investment Platform, connecting verified high-growth businesses directly with serious investors.
                    </p>
                </motion.div>

                <div className="space-y-12">
                    {/* Section 1 */}
                    <motion.section 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-slate-100"
                    >
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center">
                                <Target size={24} />
                            </div>
                            <h2 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900">Our Core Mission</h2>
                        </div>
                        <p className="text-slate-600 text-lg leading-relaxed mb-6">
                            Digital Book of India (DBI) recognized a massive gap in the Indian startup and SME ecosystem: a severe lack of structured, verified, and accessible platforms for Series A, Seed, and Angel investments outside tier-1 circles. 
                            <br /><br />
                            <strong>BharatNivesh Summit 2026</strong> bridges this gap. Our mission is to democratize investment by providing a hybrid platform (both online mapping and offline mega-events) where GST-verified businesses from 60+ different core sectors can pitch, negotiate, and handshake with accredited investors seamlessly.
                        </p>
                    </motion.section>

                    {/* Section 2 */}
                    <motion.section 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-8"
                    >
                        <div className="bg-sky-600 text-white p-8 md:p-12 rounded-[2.5rem] shadow-xl shadow-sky-200/50">
                            <Rocket size={32} className="mb-6 text-sky-200" />
                            <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-4">Why Hybrid?</h3>
                            <p className="text-sky-50 leading-relaxed">
                                Physical events are constrained by geography; online platforms are constrained by trust. By combining physical mega-summits in key hubs with our persistent digital listing directory, we ensure that deals can be discovered online and closed in-person with absolute trust.
                            </p>
                        </div>
                        <div className="bg-slate-900 text-white p-8 md:p-12 rounded-[2.5rem] shadow-xl shadow-slate-800/20">
                            <ShieldCheck size={32} className="mb-6 text-slate-400" />
                            <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-4">100% Verified</h3>
                            <p className="text-slate-300 leading-relaxed">
                                Every business on our platform is strictly GST-verified. Every investor goes through a mandatory KYC protocol. We are building the cleanest, most reliable capital-infusion network in India, dropping the noise and focusing strictly on high-probability deals.
                            </p>
                        </div>
                    </motion.section>

                    {/* Section 3 */}
                    <motion.section 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-slate-100"
                    >
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center">
                                <TrendingUp size={24} />
                            </div>
                            <h2 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900">Platform Features</h2>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {[
                                { title: "60+ Industry Sectors", desc: "From Tech and Real Estate to Agriculture and DeepTech, neatly categorized via our Mega Menu.", icon: <Globe size={18} /> },
                                { title: "Direct Investor Outreach", desc: "Seamless chat & connection system to schedule pitches.", icon: <Users size={18} /> },
                                { title: "Analytics Dashboard", desc: "Real-time insights for your business profile metrics.", icon: <TargetIcon size={18} /> },
                                { title: "Deal Rooms", desc: "Secure digital rooms for term-sheet negotiations.", icon: <Handshake size={18} /> }
                            ].map((feature, i) => (
                                <div key={i} className="flex gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-100">
                                    <div className="mt-1 text-sky-600 shrink-0">{feature.icon}</div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 mb-1">{feature.title}</h4>
                                        <p className="text-sm text-slate-500 leading-relaxed">{feature.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.section>
                </div>
            </main>
        </div>
    );
}
