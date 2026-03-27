"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CursorGlow from "@/components/CursorGlow";
import ParticleNetworkWrapper from "@/components/ParticleNetworkWrapper";
import { MapPin, Users, Star, Navigation, Shield, Zap, TrendingUp, Eye, Compass } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useTheme } from "@/components/ThemeProvider";

const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (i = 0) => ({
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, delay: i * 0.1 }
    })
};

export default function AboutUsPage() {
    const { theme } = useTheme();
    const isLight = theme === 'light';

    const pillars = [
        {
            icon: Shield,
            title: "Reliable Listings",
            desc: "We focus on maintaining accurate and useful business information so users can trust what they find.",
            color: "blue"
        },
        {
            icon: Star,
            title: "Real User Feedback",
            desc: "Reviews and ratings help users understand the quality of services before making choice.",
            color: "amber"
        },
        {
            icon: Navigation,
            title: "Location Discovery",
            desc: "Find businesses around you with ease, making local search more practical and relevant.",
            color: "emerald"
        },
        {
            icon: Users,
            title: "Local Community",
            desc: "A platform built by the community, for the community, supporting millions of small businesses.",
            color: "primary"
        }
    ];

    return (
        <div className="min-h-screen bg-background relative overflow-hidden transition-colors duration-500">
            <ParticleNetworkWrapper className={`z-0 transition-opacity duration-700 ${isLight ? 'opacity-20' : 'opacity-40'}`} />
            <CursorGlow />
            <Navbar />

            <main className="pt-32 relative z-10 pb-24">

                {/* ── Hero Header ── */}
                <div className="container mx-auto px-4 mb-20 relative">
                    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-center pointer-events-none select-none overflow-hidden h-40">
                        <span className={`text-8xl sm:text-[12rem] font-black uppercase tracking-[0.2em] opacity-5 transition-colors duration-500 ${isLight ? 'text-primary' : 'text-white'}`}>
                            ABOUT
                        </span>
                    </div>
                    <div className="flex items-center justify-center gap-4 sm:gap-8 relative z-10">
                        <div className={`h-px flex-1 bg-gradient-to-r from-transparent ${isLight ? 'via-primary/30 to-primary/60' : 'via-primary/40 to-primary/60'}`} />
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`text-3xl sm:text-5xl md:text-6xl font-display font-black tracking-tight uppercase whitespace-nowrap transition-colors duration-500 ${isLight ? 'text-slate-900' : 'text-white'}`}
                        >
                            About <span className="gradient-text">Us</span>
                        </motion.h1>
                        <div className={`h-px flex-1 bg-gradient-to-l from-transparent ${isLight ? 'via-primary/30 to-primary/60' : 'via-primary/40 to-primary/60'}`} />
                    </div>
                </div>

                {/* ── Intro: Image + Text ── */}
                <section className="container mx-auto px-4 mb-28">
                    <div className="grid lg:grid-cols-12 gap-12 lg:gap-20 items-center">
                        {/* Image */}
                        <motion.div
                            className="lg:col-span-6 relative group"
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                        >
                            <div className={`absolute -inset-4 rounded-[2.5rem] blur-2xl transition-all duration-700 ${isLight ? 'bg-primary/5 opacity-50' : 'bg-primary/20 opacity-25'}`} />
                            <div className={`relative rounded-[2rem] overflow-hidden border shadow-2xl transition-all duration-500 ${isLight ? 'bg-white/40 border-blue-100 shadow-blue-500/10' : 'bg-white/[0.02] border-white/10'}`}>
                                <Image
                                    src="/assets/map.jpg"
                                    alt="Digital Book of India Map"
                                    width={800}
                                    height={500}
                                    className="object-cover transition-transform duration-1000 group-hover:scale-105"
                                />
                                <div className={`absolute inset-0 bg-gradient-to-t via-transparent to-transparent ${isLight ? 'from-white/60' : 'from-background/80'}`} />
                            </div>
                            <motion.div
                                animate={{ y: [0, -10, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                className={`absolute -bottom-6 -right-6 p-4 rounded-2xl border backdrop-blur-md shadow-xl hidden sm:block ${isLight ? 'bg-white/90 border-blue-100' : 'bg-black/40 border-white/10'}`}
                            >
                                <Users className="text-primary mb-2" size={24} />
                                <div className={`text-xl font-bold font-display ${isLight ? 'text-slate-900' : 'text-white'}`}>Join the Network</div>
                            </motion.div>
                        </motion.div>

                        {/* Text */}
                        <motion.div
                            className="lg:col-span-6 space-y-8"
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                        >
                            <div className="space-y-5">
                                <h2 className={`text-4xl sm:text-5xl font-display font-black leading-[1.1] tracking-tight transition-colors duration-500 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                                    Connecting You with <br />
                                    <span className="gradient-text glow-text italic">Local Businesses</span> <br />
                                    <span>Across India</span>
                                </h2>
                                <div className={`space-y-4 text-lg leading-relaxed ${isLight ? 'text-slate-600' : 'text-white/60'}`}>
                                    <p>
                                        Digital Book of India is a platform designed to simplify how people discover local businesses across India. In a world where finding the right service or place can often feel confusing or time-consuming, we aim to make the process clear, fast, and reliable.
                                    </p>
                                    <p>
                                        Whether you're searching for a nearby restaurant, a trusted shop, or a professional service provider, our platform brings everything together in one place — organized, structured, and easy to use.
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* ── What We Do ── */}
                <section className={`mb-20 transition-colors duration-500 `}>
                    <div className="container mx-auto px-4">
                        <motion.div
                            className="max-w-3xl mx-auto text-center mb-14"
                            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                        >
                            <span className="text-primary font-bold uppercase tracking-widest text-sm mb-3 block">Our Platform</span>
                            <h2 className={`text-4xl sm:text-5xl font-display font-black tracking-tight mb-5 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                                What We <span className="gradient-text">Do</span>
                            </h2>
                            <p className={`text-lg leading-relaxed ${isLight ? 'text-slate-600' : 'text-white/60'}`}>
                                We provide a growing directory of businesses from different cities and categories, helping users access relevant information based on their needs and location.
                            </p>
                        </motion.div>

                        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                            {[
                                { icon: MapPin, title: "One Platform", desc: "From discovering new places to checking reviews and finding directions — everything is available within a single experience." },
                                { icon: Eye, title: "Business Visibility", desc: "We help businesses improve their online presence by making them more visible to people who are actively looking for their services." },
                                { icon: TrendingUp, title: "Growing Directory", desc: "Our listing database grows continuously across cities and categories so users always find relevant, up-to-date options." }
                            ].map((item, i) => (
                                <motion.div
                                    key={i}
                                    custom={i}
                                    initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                                    className={`p-7 rounded-3xl border transition-all duration-300 hover:-translate-y-1 ${isLight ? 'bg-white border-slate-100 shadow-sm hover:shadow-md hover:border-primary/20' : 'bg-white/[0.03] border-white/10 hover:border-primary/30'}`}
                                >
                                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-5">
                                        <item.icon size={22} className="text-primary" />
                                    </div>
                                    <h3 className={`text-xl font-black mb-3 ${isLight ? 'text-slate-900' : 'text-white'}`}>{item.title}</h3>
                                    <p className={`leading-relaxed text-sm ${isLight ? 'text-slate-500' : 'text-white/50'}`}>{item.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── Why Digital Book of India ── */}
                <section className="container mx-auto px-4 mb-24">
                    <motion.div
                        className="text-center mb-14"
                        initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                    >
                        <span className="text-primary font-bold uppercase tracking-widest text-sm mb-3 block">Our Value</span>
                        <h2 className={`text-4xl sm:text-5xl font-display font-black tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                            Why <span className="gradient-text">Digital Book of India</span>
                        </h2>
                    </motion.div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto">
                        {pillars.map((p, i) => (
                            <motion.div
                                key={i}
                                custom={i}
                                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                                className={`group p-8 rounded-3xl border transition-all duration-300 hover:-translate-y-2 relative overflow-hidden ${isLight ? 'bg-white border-slate-100 shadow-sm hover:shadow-xl hover:border-primary/20' : 'bg-white/[0.03] border-white/10 hover:border-primary/40 shadow-2xl'}`}
                            >
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-colors ${
                                    p.color === 'blue' ? 'bg-blue-500/10 group-hover:bg-blue-500/20 text-blue-500' :
                                    p.color === 'amber' ? 'bg-amber-500/10 group-hover:bg-amber-500/20 text-amber-500' :
                                    p.color === 'emerald' ? 'bg-emerald-500/10 group-hover:bg-emerald-500/20 text-emerald-500' :
                                    'bg-primary/10 group-hover:bg-primary/20 text-primary'
                                }`}>
                                    <p.icon size={24} />
                                </div>
                                <h3 className={`text-xl font-black mb-3 ${isLight ? 'text-slate-900' : 'text-white'}`}>{p.title}</h3>
                                <p className={`text-sm leading-relaxed ${isLight ? 'text-slate-500' : 'text-white/50'}`}>{p.desc}</p>
                                
                                {/* Decorative corner accent */}
                                <div className={`absolute top-0 right-0 w-16 h-16 opacity-0 group-hover:opacity-10 transition-opacity blur-2xl -mr-8 -mt-8 ${
                                    p.color === 'blue' ? 'bg-blue-500' :
                                    p.color === 'amber' ? 'bg-amber-500' :
                                    p.color === 'emerald' ? 'bg-emerald-500' :
                                    'bg-primary'
                                }`} />
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* ── Approach, Growth, Vision & Goal — unified 2×2 grid ── */}
                <section className="container mx-auto px-4 mb-24">
                    <div className="grid sm:grid-cols-2 gap-8 max-w-5xl mx-auto">
                        {[
                            {
                                icon: Compass,
                                title: "Our Approach",
                                theme: "emerald",
                                desc: "We believe that local discovery should not be complicated. Our approach is centered around clarity, usability, and trust. Every feature is designed to reduce effort for the user — whether it's finding a place, checking details, or deciding where to go."
                            },
                            {
                                icon: TrendingUp,
                                title: "Supporting Growth",
                                theme: "blue",
                                desc: "Local businesses are the backbone of every city. Our goal is to support their growth by providing a platform where they can reach more customers without unnecessary barriers, creating real opportunities for both users and businesses."
                            },
                            {
                                icon: Eye,
                                title: "Long-term Vision",
                                theme: "primary",
                                desc: "To build a dependable and widely trusted platform for local discovery in India, where users can find what they need easily and businesses can grow through genuine connections."
                            },
                            {
                                icon: Zap,
                                title: "Platform Goal",
                                theme: "amber",
                                desc: "We aim to continuously improve the way people search, explore, and connect with local businesses by focusing on accuracy, simplicity, and real value."
                            }
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                custom={i}
                                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                                className={`group p-10 rounded-[2.5rem] border transition-all duration-500 hover:scale-[1.02] relative overflow-hidden ${
                                    isLight 
                                        ? 'bg-slate-50/50 border-slate-200 shadow-sm' 
                                        : 'bg-white/[0.02] border-white/10 shadow-2xl'
                                }`}
                            >
                                {/* Background glow effect */}
                                <div className={`absolute -inset-20 opacity-0 group-hover:opacity-20 transition-opacity blur-[100px] pointer-events-none ${
                                    item.theme === 'emerald' ? 'bg-emerald-500' :
                                    item.theme === 'blue' ? 'bg-blue-500' :
                                    item.theme === 'amber' ? 'bg-amber-500' :
                                    'bg-primary'
                                }`} />

                                <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center mb-8 shadow-inner transition-transform duration-500 group-hover:rotate-12 ${
                                    item.theme === 'emerald' ? 'bg-emerald-500/10 text-emerald-500' :
                                    item.theme === 'blue' ? 'bg-blue-500/10 text-blue-500' :
                                    item.theme === 'amber' ? 'bg-amber-500/10 text-amber-500' :
                                    'bg-primary/10 text-primary'
                                }`}>
                                    <item.icon size={32} />
                                </div>
                                <h3 className={`text-3xl font-black mb-5 ${isLight ? 'text-slate-900' : 'text-white'}`}>{item.title}</h3>
                                <p className={`text-lg leading-relaxed ${isLight ? 'text-slate-600' : 'text-white/60'}`}>{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </section>

            </main>

            <Footer />
        </div>
    );
}
