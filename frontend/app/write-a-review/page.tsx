"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CursorGlow from "@/components/CursorGlow";
import ParticleNetworkWrapper from "@/components/ParticleNetworkWrapper";
import { CheckCircle2, Target, XCircle, Camera, MessageSquare, Award, Clock, ShieldCheck, Zap } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";

export default function WriteAReviewPage() {
    return (
        <div className="min-h-screen bg-background relative overflow-hidden">
            <ParticleNetworkWrapper className="z-0 opacity-40" />
            <CursorGlow />
            <Navbar />

            <main className="pt-32 pb-24 relative z-10">
                <div className="container mx-auto px-4 max-w-6xl">
                    {/* Hero Header */}
                    <div className="flex items-center justify-center gap-4 sm:gap-8 mb-12">
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/40 to-primary/60" />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center px-4"
                        >
                            <h1 className="text-2xl sm:text-3xl md:text-5xl font-display font-bold text-white tracking-[0.05em] uppercase">
                                The Next Evolution of Trust: <span className="text-primary italic">Realistic Reviews</span>
                            </h1>
                            <p className="text-primary font-bold mt-2 tracking-widest uppercase text-sm mt-4">(Coming Soon)</p>
                        </motion.div>
                        <div className="h-px flex-1 bg-gradient-to-l from-transparent via-primary/40 to-primary/60" />
                    </div>

                    <div className="text-center mb-20 space-y-6">
                        <p className="text-xl sm:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
                            Most review systems are just numbers and text. Our <span className="text-yellow-500 font-bold glow-text">Realistic Review</span> feature—launching soon—is designed to strip away the "fake" and give your customers a 100% authentic look at a business before they step inside.
                        </p>
                    </div>

                    {/* What Makes a Review "Realistic" */}
                    <div className="space-y-16 mb-32">
                        <div className="text-center">
                            <h3 className="text-3xl font-display font-bold text-white uppercase tracking-tighter">
                                What Makes a Review "Realistic"?
                            </h3>
                            <div className="h-1 w-24 bg-primary mx-auto mt-4 rounded-full" />
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                            {[
                                { 
                                    title: "Verified Visual Evidence", 
                                    desc: "No more stock photos. Realistic reviews will encourage users to upload unedited, real-time photos and videos of their experience (e.g., the actual food served, the real condition of a PG room, or the live atmosphere of a gym)." 
                                },
                                { 
                                    title: "Mandatory \"Niche\" Tags", 
                                    desc: "Users won't just say \"it was good.\" They will rate specific specialized criteria like hygiene, staff behavior, waiting time, and value for money." 
                                },
                                { 
                                    title: "The \"No-Filter\" Policy", 
                                    desc: "We are creating a space where honest, constructive feedback is prioritized over paid promotions, ensuring that what you see on the map is what you get in person." 
                                },
                                { 
                                    title: "Review Verification", 
                                    desc: "Every realistic review will be cross-referenced with our \"Verify People\" tech to ensure it’s coming from a real person who actually visited that zone." 
                                }
                            ].map((item, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    className="glass-strong border-white/10 p-8 rounded-2xl flex gap-6 items-start group hover:glow-border transition-all duration-500"
                                >
                                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20 group-hover:bg-primary/20 transition-colors">
                                        <CheckCircle2 size={28} className="text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-display font-bold text-white text-xl mb-3 group-hover:text-primary transition-colors">{item.title}</h3>
                                        <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* How It Will Work Section */}
                    <div className="space-y-16 mb-32">
                        <div className="text-center">
                            <h3 className="text-3xl font-display font-bold text-white uppercase tracking-tighter">
                                Coming Soon: <span className="text-primary">How It Will Work</span>
                            </h3>
                            <div className="h-1 w-24 bg-primary mx-auto mt-4 rounded-full" />
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            {[
                                {
                                    icon: <MessageSquare className="text-primary" />,
                                    title: "Interactive Review Prompts",
                                    desc: "Instead of a blank box, we’ll ask specific questions: \"How was the crowd at the Rajouri Garden market today?\" or \"Was the liquor shop inventory as per the app?\""
                                },
                                {
                                    icon: <Camera className="text-primary" />,
                                    title: "Video Snaps",
                                    desc: "A 10-second \"Live Look\" option to show the current state of a shop or stall. Instant visual proof of what's happening right now."
                                },
                                {
                                    icon: <Award className="text-primary" />,
                                    title: "Realistic Badges",
                                    desc: "Reviewers who consistently provide helpful, honest, and verified photos will earn a \"Trusted Guide\" badge in their zone."
                                }
                            ].map((item, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    className="glass border-white/5 p-8 rounded-3xl text-center group hover:bg-white/[0.03] transition-all duration-500"
                                >
                                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                                        {item.icon}
                                    </div>
                                    <h4 className="text-xl font-bold text-white mb-4">{item.title}</h4>
                                    <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                        <div className="text-center mt-12">
                             <p className="text-xl font-display font-bold text-white italic">
                                "Standard reviews are just opinions. <span className="text-primary">Realistic Reviews are digital proof.</span>"
                             </p>
                        </div>
                    </div>

                    {/* Comparison Table */}
                    <div className="mb-32 space-y-12">
                        <div className="text-center space-y-4">
                            <h3 className="text-3xl sm:text-5xl font-display font-bold text-white">The <span className="italic text-primary">Difference</span></h3>
                            <p className="text-muted-foreground text-lg">Comparing Standard vs. Realistic review architecture.</p>
                        </div>

                        <div className="glass shadow-2xl rounded-3xl overflow-hidden border-white/10 overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-white/5 h-20">
                                    <TableRow className="border-white/10 hover:bg-transparent">
                                        <TableHead className="text-white font-bold w-[250px] pl-8">Feature</TableHead>
                                        <TableHead className="text-white/40">Traditional Reviews</TableHead>
                                        <TableHead className="text-primary font-bold italic">Our Realistic Reviews</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {[
                                        { f: "Trust Factor", t: "Low (can be faked / bought)", r: "High (Verified & Cross-checked)" },
                                        { f: "Visuals", t: "Often missing or outdated", r: "Live, user-shot photos & videos" },
                                        { f: "Detailing", t: "Vague (e.g. \"Good shop\")", r: "Category-specific (Staff, Speed, Hygiene)" },
                                        { f: "Accuracy", t: "One-sided opinions", r: "Balanced & context-driven feedback" }
                                    ].map((row, idx) => (
                                        <TableRow key={idx} className="border-white/5 h-20 hover:bg-white/5 transition-colors group">
                                            <TableCell className="font-bold text-white pl-8 font-display">{row.f}</TableCell>
                                            <TableCell className="text-white/40">{row.t}</TableCell>
                                            <TableCell className="text-primary font-bold">
                                                <div className="flex items-center gap-2">
                                                    <ShieldCheck size={18} className="text-accent" />
                                                    {row.r}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>

                </div>
            </main>

            <Footer />
        </div>
    );
}
