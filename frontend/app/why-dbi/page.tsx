"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CursorGlow from "@/components/CursorGlow";
import ParticleNetworkWrapper from "@/components/ParticleNetworkWrapper";
import {
    ShieldCheck,
    Bell,
    FileText,
    BadgeCheck,
    Radio,
    MapPin,
    Check,
    X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";

const features = [
    {
        icon: <ShieldCheck size={22} className="text-primary" />,
        badge: "Accuracy Difference",
        title: "Verified Data Matters",
        body: "Bad data leads to lost customers. Most directories are graveyards of wrong numbers and old addresses.",
        edge: "Our Accuracy Shield ensures your data is vetted and precise. When a customer finds you on DBI, they trust you are exactly where you say you are.",
        tagline: "In 2026, Accuracy is Authority.",
    },
    {
        icon: <Bell size={22} className="text-primary" />,
        badge: "Stay Ahead",
        title: "Free Updates & Community Intelligence",
        body: "The market moves fast. DBI keeps you at the front of the line without any extra cost.",
        edge: "Receive real-time notifications about local market trends, regulatory changes, and anti-fraud alerts — your Information Radar for safe and profitable navigation.",
        tagline: "",
    },
    {
        icon: <FileText size={22} className="text-primary" />,
        badge: "Unlock Opportunities",
        title: "Exclusive Tender Access",
        body: "Stop missing out on big-ticket contracts just because you didn't know where to look.",
        edge: "Get filtered, high-value tender details related specifically to your domain — construction, textiles, or tech — delivered directly to your dashboard.",
        tagline: "",
    },
    {
        icon: <BadgeCheck size={22} className="text-primary" />,
        badge: "Build Instant Trust",
        title: "The DBI Verified Badge",
        body: "In the digital world, a badge is a promise — the difference between doubt and certainty.",
        edge: "Receive an official DBI Business Certification. Our Verified Badge proves your credibility and significantly increases your lead conversion rate.",
        tagline: "",
    },
    {
        icon: <Radio size={22} className="text-primary" />,
        badge: "Real-Time Reliability",
        title: "Accurate Active / Inactive Status",
        body: "Nothing frustrates customers more than reaching a shop that is unexpectedly closed.",
        edge: "Your listing shows live Open / Closed status. If you're open, we highlight you; if closed, we update instantly — preventing bad reviews and building long-term trust.",
        tagline: "",
    },
    {
        icon: <MapPin size={22} className="text-primary" />,
        badge: "Reclaiming Your Neighborhood",
        title: "The Hyper-Local Growth Engine",
        body: "Why should nearby customers order from massive apps when you are right next door?",
        edge: "DBI connects you directly with customers closest to you, stopping them from scrolling past and redirecting spending back into the local community — where it belongs.",
        tagline: "",
    },
];

const comparison = [
    {
        feature: "Data Quality",
        standard: "Self-claimed / Unverified",
        dbi: 'DBI Verified "Accuracy Shield"',
    },
    {
        feature: "Opportunity",
        standard: "General listings",
        dbi: "Direct Tender Alerts (Domain-Specific)",
    },
    {
        feature: "Trust Signal",
        standard: "Basic 5-Star Rating",
        dbi: "Official Business Certification Badge",
    },
    {
        feature: "Local Reach",
        standard: "Competes with global brands",
        dbi: "Prioritizes Your Neighborhood Customers",
    },
    {
        feature: "Status Sync",
        standard: "Static hours (often wrong)",
        dbi: "Live Active / Inactive Pulse",
    },
];

export default function WhyDBIPage() {
    return (
        <div className="min-h-screen bg-background relative overflow-hidden">
            <ParticleNetworkWrapper className="z-0 opacity-30" />
            <CursorGlow />
            <Navbar />

            <main className="pt-28 pb-20 relative z-10">
                <div className="container mx-auto px-4 max-w-5xl">

                    {/* Hero */}
                    <div className="text-center mb-16 space-y-4">
                        <motion.span
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-block bg-primary/20 text-primary border border-primary/30 px-3 py-0.5 rounded-full text-xs font-semibold uppercase tracking-widest"
                        >
                            Why DBI
                        </motion.span>
                        <motion.h1
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-3xl sm:text-5xl font-display font-bold text-white leading-tight"
                        >
                            The Power of the{" "}
                            <span className="text-primary italic">Verified Collective</span>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto leading-relaxed"
                        >
                            In a market where everyone is shouting for attention, DBI is the only platform that speaks the language of truth, growth, and community. We don&apos;t just list your business — we certify your existence and arm you with the tools to dominate your local economy.
                        </motion.p>
                    </div>

                    {/* Feature Cards */}
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-16">
                        {features.map((f, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.07 }}
                                className="glass-strong border border-white/10 rounded-2xl p-5 flex flex-col gap-3 hover:border-primary/30 transition-all duration-300"
                            >
                                <div className="flex items-center gap-2">
                                    <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                                        {f.icon}
                                    </div>
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary/80 bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                                        {f.badge}
                                    </span>
                                </div>
                                <h3 className="text-base font-bold text-white leading-snug">{f.title}</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed">{f.body}</p>
                                <div className="border-t border-white/5 pt-3">
                                    <p className="text-xs text-white/60 leading-relaxed">
                                        <span className="text-primary font-semibold">DBI Edge: </span>
                                        {f.edge}
                                    </p>
                                    {f.tagline && (
                                        <p className="text-xs text-yellow-400 font-semibold mt-1">{f.tagline}</p>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Comparison Table */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="mb-16"
                    >
                        <h2 className="text-xl sm:text-2xl font-display font-bold text-white text-center mb-6 uppercase tracking-widest">
                            DBI vs Traditional Platforms
                        </h2>
                        <div className="glass-strong border border-white/10 rounded-2xl overflow-hidden">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-white/10">
                                        <th className="text-left px-5 py-3 text-white/50 font-semibold uppercase text-xs tracking-wider w-1/3">Feature</th>
                                        <th className="text-left px-5 py-3 text-white/50 font-semibold uppercase text-xs tracking-wider w-1/3">Standard Directories</th>
                                        <th className="text-left px-5 py-3 text-primary font-semibold uppercase text-xs tracking-wider w-1/3">DBI Platform</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {comparison.map((row, i) => (
                                        <tr
                                            key={i}
                                            className={`border-b border-white/5 last:border-0 transition-colors hover:bg-white/5 ${i % 2 === 0 ? "bg-white/[0.02]" : ""}`}
                                        >
                                            <td className="px-5 py-3.5 text-white font-medium text-xs">{row.feature}</td>
                                            <td className="px-5 py-3.5 text-muted-foreground text-xs">
                                                <span className="flex items-center gap-1.5">
                                                    <X size={12} className="text-red-400 shrink-0" />
                                                    {row.standard}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5 text-white/80 text-xs">
                                                <span className="flex items-center gap-1.5">
                                                    <Check size={12} className="text-primary shrink-0" />
                                                    {row.dbi}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>



                </div>
            </main>

            <Footer />
        </div>
    );
}
