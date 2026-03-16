"use client";

import { motion } from "framer-motion";
import { Check, X, AlertTriangle, Zap, Trophy, ShieldCheck, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const comparisonRows = [
    { feature: "Listed on Map", mini: true, micro: true },
    { feature: "Mapping Show (Direction)", mini: true, micro: true },
    { feature: "Ratings & Customer Reviews", mini: true, micro: true },
    { feature: "About Section", mini: true, micro: true },
    {
        feature: "Personalized Business Page",
        sub: "Your Own Mini-Site",
        mini: false,
        micro: true,
    },
    {
        feature: "Visual Gallery (Products/Work)",
        sub: "High-Quality Photos",
        mini: false,
        micro: true,
    },
    {
        feature: "Operating Hours (Timings)",
        sub: "Live & Accurate",
        mini: false,
        micro: true,
    },
    {
        feature: "In-Directory Advertisements",
        sub: "Boosted Visibility",
        mini: false,
        micro: true,
    },
    {
        feature: "Direct Ordering System",
        mini: false,
        micro: true,
    },
    {
        feature: "Full Merchant Control Panel",
        sub: "Manage Your Data",
        mini: false,
        micro: true,
    },
    {
        feature: "Live Status Pulse",
        sub: "Active / Inactive",
        mini: false,
        micro: true,
    },
    {
        feature: "Order Management Terminal",
        sub: "Receive & Track",
        mini: false,
        micro: true,
    },
    {
        feature: "Business Analytics (Stats)",
        sub: "Know Your Visitors",
        mini: false,
        micro: true,
    },
];

const benefits = [
    {
        icon: <Trophy size={16} className="text-yellow-400" />,
        title: "Massive Savings",
        desc: "Save ₹5,000 immediately. This price will never be this low again once we go live.",
    },
    {
        icon: <Zap size={16} className="text-primary" />,
        title: '"First-Mover" Advantage',
        desc: "Early partners get priority placement — you're at the top when customers in your area search.",
    },
    {
        icon: <ShieldCheck size={16} className="text-green-400" />,
        title: "Total Control",
        desc: "Unlock your Merchant Panel today. Upload your gallery, set timings, and start receiving orders.",
    },
    {
        icon: <Users size={16} className="text-violet-400" />,
        title: "Stop Losing Neighbors",
        desc: "Your neighbors order from global apps because they can't see your stock. Micro Mapping fixes this.",
    },
];

const afterJoining = [
    { icon: "⚡", text: "Instant Activation — Your business goes Live immediately." },
    { icon: "🔰", text: "Badge Award — DBI Verified Badge appears on your profile instantly." },
    { icon: "🤝", text: "Community Entry — Immediate access to the Business Brotherhood for bulk buying & fraud alerts." },
];

export default function PreLaunchOffer() {
    return (
        <section className="py-20 relative z-10 overflow-hidden" id="pre-launch-offer">
            <div className="container mx-auto px-4 max-w-5xl">

                {/* Section Badge */}
                <div className="text-center mb-10 space-y-3">
                    <motion.span
                        initial={{ opacity: 0, y: -10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-block bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest"
                    >
                        🔥 The Pre-Launch Opportunity
                    </motion.span>
                    <motion.h2
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-3xl sm:text-4xl font-display font-bold text-white leading-tight"
                    >
                        Get the Power of{" "}
                        <span className="text-primary italic">Micro Mapping</span>
                        <br />at a Fraction of the Cost
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-muted-foreground text-sm max-w-xl mx-auto"
                    >
                        In 2026, a basic map pin isn't enough to beat the competition. You need a digital storefront that works while you sleep.
                    </motion.p>
                </div>

                {/* Main Offer Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="backdrop-blur-[2px] bg-white/[0.01] border border-white/20 hover:border-white/40 shadow-[0_4px_24px_rgba(0,0,0,0.2)] transition-all duration-300 rounded-2xl p-6 sm:p-10 mb-6 relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-yellow-500/5 pointer-events-none" />

                    {/* Price */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-8">
                        <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold mb-1">Special Pre-Launch Price</p>
                            <div className="flex items-end gap-3">
                                <span className="text-2xl text-white/30 line-through font-bold">₹7,500</span>
                                <span className="text-5xl sm:text-6xl font-display font-black text-white">₹2,500</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">One-Time Setup for one year &nbsp;—&nbsp;
                                <span className="text-yellow-400 font-bold">Flat 66% OFF</span>
                            </p>
                        </div>
                        <Button
                            className="h-12 px-10 text-sm font-bold uppercase tracking-widest rounded-xl bg-primary hover:bg-primary/80 text-white shadow-[0_0_25px_rgba(59,130,246,0.5)] transition-all shrink-0"
                            asChild
                        >
                            <Link href="/become-a-part">Claim This Offer</Link>
                        </Button>
                    </div>

                    {/* Why Grab This Offer */}
                    <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-white/50 mb-4">Why Grab This Offer Today?</p>
                        <div className="grid sm:grid-cols-2 gap-3">
                            {benefits.map((b, i) => (
                                <div key={i} className="flex items-start gap-3 bg-white/5 rounded-xl p-4 border border-white/5">
                                    <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
                                        {b.icon}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-white mb-0.5">{b.title}</p>
                                        <p className="text-xs text-muted-foreground leading-relaxed">{b.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* After Joining */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="backdrop-blur-[2px] bg-white/[0.01] border border-white/20 shadow-[0_4px_24px_rgba(0,0,0,0.2)] transition-all duration-300 rounded-2xl p-5 mb-6"
                >
                    <p className="text-xs font-bold uppercase tracking-widest text-white/50 mb-3">What Happens After You Join?</p>
                    <div className="flex flex-col sm:flex-row gap-3">
                        {afterJoining.map((step, i) => (
                            <div key={i} className="flex items-start gap-2 flex-1">
                                <span className="text-lg shrink-0">{step.icon}</span>
                                <p className="text-xs text-white/70 leading-relaxed">{step.text}</p>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Urgency Banner */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="flex items-center gap-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-10"
                >
                    <AlertTriangle size={16} className="text-yellow-400 shrink-0" />
                    <p className="text-xs text-yellow-200 leading-relaxed">
                        <span className="font-bold text-yellow-400">Act Fast:</span> This ₹2,500 offer is strictly limited to the first{" "}
                        <span className="font-bold">100 members</span> in your zone. Once slots are full, the price returns to ₹7,500.
                    </p>
                </motion.div>

                {/* Comparison Table */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <h3 className="text-xl font-display font-bold text-white text-center uppercase tracking-widest mb-6">
                        Our Pricing Plans
                    </h3>
                    <div className="backdrop-blur-[2px] bg-white/[0.01] border border-white/20 shadow-[0_4px_24px_rgba(0,0,0,0.2)] rounded-2xl overflow-hidden transition-all duration-300">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-white/10">
                                    <th className="text-left px-5 py-4 text-white/50 text-xs font-semibold uppercase tracking-wider w-1/2">Feature</th>
                                    <th className="px-5 py-4 text-center text-white/70 text-xs font-bold uppercase tracking-wider w-1/4">Mini Mapping</th>
                                    <th className="px-5 py-4 text-center text-primary text-xs font-bold uppercase tracking-wider w-1/4">
                                        Micro Mapping
                                        <span className="block text-[9px] text-primary/60 font-normal normal-case tracking-normal mt-0.5">Pre-Launch Offer</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {comparisonRows.map((row, i) => (
                                    <tr
                                        key={i}
                                        className={`border-b border-white/5 last:border-0 ${i % 2 === 0 ? "bg-white/[0.02]" : ""}`}
                                    >
                                        <td className="px-5 py-3">
                                            <p className="text-white/80 text-xs font-medium">{row.feature}</p>
                                            {row.sub && <p className="text-white/30 text-[10px] mt-0.5">({row.sub})</p>}
                                        </td>
                                        <td className="px-5 py-3 text-center">
                                            {row.mini ? (
                                                <Check size={16} className="text-green-400 mx-auto" />
                                            ) : (
                                                <X size={14} className="text-white/20 mx-auto" />
                                            )}
                                        </td>
                                        <td className="px-5 py-3 text-center">
                                            {row.micro ? (
                                                <Check size={16} className="text-primary mx-auto" />
                                            ) : (
                                                <X size={14} className="text-white/20 mx-auto" />
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Bottom CTA */}
                    <div className="text-center mt-6">
                        <Button
                            className="h-11 px-10 text-sm font-bold uppercase tracking-widest rounded-xl bg-primary hover:bg-primary/80 text-white shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all"
                            asChild
                        >
                            <Link href="/become-a-part">Join Now at ₹2,500 →</Link>
                        </Button>
                        <p className="text-xs text-muted-foreground mt-3">Limited to first 100 members. No hidden charges.</p>
                    </div>
                </motion.div>

            </div>
        </section>
    );
}
