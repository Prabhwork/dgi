"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CursorGlow from "@/components/CursorGlow";
import ParticleNetworkWrapper from "@/components/ParticleNetworkWrapper";
import { CheckCircle2, Target, XCircle } from "lucide-react";
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
                    {/* Hero Header - Consistent with other pages */}
                    <div className="flex items-center justify-center gap-4 sm:gap-8 mb-12">
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/40 to-primary/60" />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center px-4"
                        >
                            <h1 className="text-2xl sm:text-4xl md:text-5xl font-display font-bold text-white tracking-[0.1em] uppercase">
                                Realistic <span className="text-primary italic">Reviews</span>
                            </h1>
                        </motion.div>
                        <div className="h-px flex-1 bg-gradient-to-l from-transparent via-primary/40 to-primary/60" />
                    </div>

                    <div className="text-center mb-20 space-y-6">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border-primary/20 text-accent glow-text font-medium text-sm mb-4 uppercase tracking-widest"
                        >
                            <Target size={16} /> Authenticity First
                        </motion.div>
                        <h2 className="text-4xl sm:text-6xl font-display font-bold text-white leading-tight">
                            The Next <span className="gradient-text italic">Evolution</span> of Trust
                        </h2>
                        <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                            Most review systems are just numbers and text. Our <span className="text-yellow-500 font-bold glow-text uppercase tracking-tight">Realistic Review</span> feature is designed to strip away the "fake" and give your customers a 100% authentic look at a business before they step inside.
                        </p>
                    </div>

                    {/* Features Matrix Section */}
                    <div className="space-y-16 mb-32">
                        <div className="text-center">
                            <h3 className="text-3xl font-display font-bold text-white uppercase tracking-tighter">
                                What Makes a Review "Realistic"?
                            </h3>
                            <div className="h-1 w-24 bg-primary mx-auto mt-4 rounded-full" />
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                            {[
                                { title: "Verified Visual Evidence", desc: "No more stock photos. Realistic reviews will encourage users to upload unedited, real-time photos and videos of their experience." },
                                { title: "Mandatory \"Niche\" Tags", desc: "Users will rate specific specialized criteria like hygiene, staff behavior, waiting time, and value for money." },
                                { title: "The \"No-Filter\" Policy", desc: "We are creating a space where honest, constructive feedback is prioritized over paid promotions." },
                                { title: "Review Verification", desc: "Every realistic review will be cross-referenced with our \"Verify People\" tech to ensure real human visits." }
                            ].map((item, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    className="glass-strong border-white/10 p-8 rounded-2xl flex gap-6 items-start group hover:glow-border transition-all duration-500"
                                >
                                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20 group-hover:bg-primary/20 transition-colors">
                                        <CheckCircle2 size={28} className="text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-display font-bold text-white text-xl mb-3 group-hover:text-primary transition-colors">{item.title}</h3>
                                        <p className="text-muted-foreground leading-relaxed text-lg">{item.desc}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Comparison - Premium Glass Table */}
                    <div className="mb-32 space-y-12">
                        <div className="text-center space-y-4">
                            <h3 className="text-3xl sm:text-5xl font-display font-bold text-white">Realistic vs. <span className="italic text-primary">Traditional</span></h3>
                            <p className="text-muted-foreground text-lg">See how we're changing the trust landscape in India.</p>
                        </div>

                        <div className="glass shadow-[0_0_50px_-12px_rgba(59,130,246,0.3)] rounded-3xl overflow-hidden border-white/10">
                            <Table>
                                <TableHeader className="bg-white/5 h-24">
                                    <TableRow className="border-white/10 hover:bg-transparent">
                                        <TableHead className="text-white text-xl font-display font-bold pl-12 uppercase tracking-wider">Feature</TableHead>
                                        <TableHead className="text-white/40 text-lg font-medium">Traditional Reviews</TableHead>
                                        <TableHead className="text-primary text-2xl font-display font-bold glow-text italic">Realistic Reviews</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {[
                                        ["Trust Factor", "Low (can be faked)", "High (Verified & Cross-checked)"],
                                        ["Visuals", "Often missing or outdated", "Live, user-shot photos & videos"],
                                        ["Detailing", "Vague reviews", "Category-specific insights"],
                                        ["Accuracy", "One-sided opinions", "Balanced & context-driven"]
                                    ].map((row, idx) => (
                                        <TableRow key={idx} className="border-white/5 h-24 hover:bg-white/5 transition-colors group">
                                            <TableCell className="font-bold text-white pl-12 text-lg font-display">{row[0]}</TableCell>
                                            <TableCell className="text-white/40 italic flex items-center gap-3 h-24">
                                                <XCircle size={18} className="text-destructive/30" /> {row[1]}
                                            </TableCell>
                                            <TableCell className="text-primary font-bold text-lg flex items-center gap-3 h-24 group-hover:glow-text transition-all">
                                                <CheckCircle2 size={22} className="text-accent" /> {row[2]}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>

                    {/* Philosophy CTA Section */}
                    <div className="glass-strong border-primary/30 rounded-[3rem] p-12 sm:p-20 text-center relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent shadow-[0_0_20px_rgba(59,130,246,0.5)]" />

                        <h4 className="text-accent font-bold tracking-[0.3em] uppercase mb-8 glow-text">True Transparency</h4>
                        <h2 className="text-3xl sm:text-6xl font-display font-bold text-white mb-10 leading-tight">
                            "Real People. Real Photos.<br />
                            <span className="gradient-text italic text-yellow-500">Real Trust.</span>"
                        </h2>

                        <p className="text-xl sm:text-2xl text-muted-foreground/80 mb-16 max-w-4xl mx-auto italic leading-relaxed">
                            Tired of visiting a location only to find it looks nothing like the outdated photos online? We are fixing that. Realistic Reviews are coming to your zone soon to ensure you always know exactly what to expect.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-8 justify-center items-center relative z-10">
                            <Button variant="glow" size="lg" className="h-20 px-16 text-xl rounded-2xl font-display uppercase tracking-widest text-white" asChild>
                                <Link href="/pre-launch">Stay Notified</Link>
                            </Button>
                            <Button variant="outline-glow" size="lg" className="h-20 px-16 text-xl rounded-2xl font-display uppercase tracking-widest text-white/70" asChild>
                                <Link href="/join-community">Explore the Alliance</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
