"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CursorGlow from "@/components/CursorGlow";

import {
    Rocket,
    Users,
    Shield,
    Zap,
    TrendingUp,
    Handshake,
    Share2,
    Search,
    CheckCircle2,
    FastForward
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { motion } from "framer-motion";

export default function JoinCommunityPage() {
    return (
        <div className="min-h-screen bg-background relative overflow-hidden">
      
            <CursorGlow />
            <Navbar />

            <main className="pt-20 pb-4 relative z-10">
                <div className="container mx-auto px-4 max-w-6xl">
                    {/* Hero Header - Consistent with About and Coming Soon */}
                    <div className="flex items-center justify-center gap-4 sm:gap-8 mb-2">
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/40 to-primary/60" />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center px-4"
                        >
                            <h1 className="text-2xl sm:text-4xl md:text-5xl font-display font-bold text-white tracking-[0.1em] uppercase">
                                Join The <span className="text-primary italic">Community</span>
                            </h1>
                        </motion.div>
                        <div className="h-px flex-1 bg-gradient-to-l from-transparent via-primary/40 to-primary/60" />
                    </div>

                    <div className="text-center mb-6 space-y-2">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border-primary/20 text-accent glow-text font-medium text-sm mb-2 uppercase tracking-widest"
                        >
                            <FastForward size={16} /> High-Speed Sales Engine
                        </motion.div>
                        <h2 className="text-3xl sm:text-5xl font-display font-bold text-white leading-tight">
                            The Ultimate <span className="gradient-text italic">Sales & Security</span> Alliance
                        </h2>
                        <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed text-sm opacity-80">
                            We are inviting all our directory partners to move beyond competition and enter a state of <span className="text-yellow-500 font-bold glow-text uppercase tracking-tight">Collective Growth</span>. Plug into a network where every member helps every other member sell in record time.
                        </p>
                    </div>

                    {/* Feature Highlight Section */}
                    <div className="space-y-6 mb-2">
                        <div className="text-center">
                            <h3 className="text-3xl font-display font-bold text-white flex items-center justify-center gap-3 uppercase tracking-tighter">
                                <Zap className="text-primary" /> The "Sell-Faster" Ecosystem
                            </h3>
                            <div className="h-1 w-24 bg-primary mx-auto mt-4 rounded-full" />
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[
                                {
                                    icon: <Rocket className="text-primary" />,
                                    title: "Inter-Member Flash Sales",
                                    desc: "Got excess stock? Use the Community Broadcast Tool to offer a special \"Member-Only\" price to other businesses. Wholesalers clear inventory in seconds.",
                                    label: "Internal Trade Tools"
                                },
                                {
                                    icon: <Share2 className="text-primary" />,
                                    title: "The \"Cross-Sell\" Engine",
                                    desc: "Our AI tools identify complementary businesses. A customer at a Bridal shop gets a suggestion for your Jewelry shop. We redirect high-intent traffic.",
                                    label: "AI Traffic Redirection"
                                },
                                {
                                    icon: <TrendingUp className="text-primary" />,
                                    title: "Unified Lead Sharing",
                                    desc: "Received a lead for something you don't carry? Use the Lead Transfer Tool to pass it to a fellow member. Today you give, tomorrow you receive.",
                                    label: "Lead Sharing System"
                                },
                                {
                                    icon: <Handshake className="text-primary" />,
                                    title: "Bulk Purchase Power",
                                    desc: "Collective Negotiation Tool. We group 100 members' requirements to get factory-direct prices. Buying cheaper means selling more competitively.",
                                    label: "Bottom-Line Boost"
                                },
                                {
                                    icon: <Shield className="text-primary" />,
                                    title: "Fraud-Free Trading Zone",
                                    desc: "Every member is pre-vetted by our Accuracy Shield. Trade with confidence, knowing payments are secure and goods are genuine. No trust gaps.",
                                    label: "Security Alliance"
                                },
                                {
                                    icon: <Users className="text-primary" />,
                                    title: "Collective Strategy",
                                    desc: "We provide dedicated guidance on how to bundle your services with other members and use Anti-Fraud Alerts to keep your capital safe.",
                                    label: "Growth Playbook"
                                }
                            ].map((item, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="glass-strong border-white/10 p-8 rounded-2xl hover:glow-border transition-all duration-500 group relative"
                                >
                                    <div className="text-[10px] font-bold text-accent/60 uppercase tracking-[0.2em] mb-4">
                                        {item.label}
                                    </div>
                                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 border border-primary/20 group-hover:scale-110 group-hover:bg-primary/20 transition-all">
                                        {item.icon}
                                    </div>
                                    <h3 className="text-xl font-display font-bold text-white mb-4 group-hover:text-primary transition-colors">
                                        {item.title}
                                    </h3>
                                    <p className="text-muted-foreground leading-relaxed">
                                        {item.desc}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </div>



                </div>
            </main>

            <Footer />
        </div>
    );
}
