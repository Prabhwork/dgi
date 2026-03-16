"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CursorGlow from "@/components/CursorGlow";
import ParticleNetworkWrapper from "@/components/ParticleNetworkWrapper";
import { Check, Facebook, Twitter, Instagram, Linkedin, Flag, Users, Heart } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useTheme } from "@/components/ThemeProvider";

export default function AboutUsPage() {
    const { theme } = useTheme();
    const isLight = theme === 'light';

    return (
        <div className="min-h-screen bg-background relative overflow-hidden transition-colors duration-500">
            <ParticleNetworkWrapper className={`z-0 transition-opacity duration-700 ${isLight ? 'opacity-20' : 'opacity-40'}`} />
            <CursorGlow />
            <Navbar />

            <main className="pt-32 relative z-10 pb-24">
                {/* Hero Header Section */}
                <div className="container mx-auto px-4 mb-20 relative">
                    {/* Background "ABOUT" Text Watermark */}
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

                {/* Main Content Section */}
                <section className="container mx-auto px-4">
                    <div className="grid lg:grid-cols-12 gap-12 lg:gap-20 items-center">
                        {/* Left: Premium Image Container */}
                        <motion.div
                            className="lg:col-span-6 relative group"
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <div className={`absolute -inset-4 rounded-[2.5rem] blur-2xl transition-all duration-700 ${isLight ? 'bg-primary/5 opacity-50' : 'bg-primary/20 opacity-25'}`} />
                            <div className={`relative rounded-[2rem] overflow-hidden border border-solid shadow-2xl transition-all duration-500 ${isLight ? 'bg-white/40 border-blue-100 shadow-blue-500/10' : 'bg-white/[0.02] border-white/10'}`}>
                                <Image
                                    src="/assets/map.jpg"
                                    alt="Digital Directory Map"
                                    width={800}
                                    height={500}
                                    className="object-cover transition-transform duration-1000 group-hover:scale-105"
                                />
                                <div className={`absolute inset-0 bg-gradient-to-t via-transparent to-transparent ${isLight ? 'from-white/60' : 'from-background/80'}`} />
                            </div>

                            {/* Floating Card Accents */}
                            <motion.div
                                animate={{ y: [0, -10, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                className={`absolute -bottom-6 -right-6 p-4 rounded-2xl border border-solid backdrop-blur-md shadow-xl hidden sm:block ${isLight ? 'bg-white/90 border-blue-100' : 'bg-black/40 border-white/10'}`}
                            >
                                <Users className="text-primary mb-2" size={24} />
                                <div className={`text-xl font-bold font-display ${isLight ? 'text-slate-900' : 'text-white'}`}>Join the Network</div>
                            </motion.div>
                        </motion.div>

                        {/* Right: Themed Content */}
                        <motion.div
                            className="lg:col-span-6 space-y-10"
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <div className="space-y-6">
                                <h2 className={`text-4xl sm:text-6xl font-display font-black leading-[1.1] tracking-tight transition-colors duration-500 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                                    Connecting You with <br />
                                    <span className="gradient-text glow-text italic">Local Businesses</span> <br />
                                    <span>Across India</span>
                                </h2>

                                <div className="space-y-6 text-lg leading-relaxed text-muted-foreground">
                                    <p>
                                        Digital Book of India is a comprehensive directory designed to help you discover nearby businesses, services, and places. Whether you're looking for a restaurant, a shop, or a service provider, our platform makes it easy to connect with the best options in your area.
                                    </p>
                                    <p>
                                        Explore various categories, read reviews, and get directions to your desired locations, all in one place. We aim to support local businesses by providing them with a platform to increase their visibility and reach more customers.
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {[
                                    { text: "Comprehensive Listings", icon: Flag },
                                    { text: "Easy Navigation", icon: Users },
                                    { text: "User Reviews & Ratings", icon: Heart },
                                    { text: "Local Support", icon: Check }
                                ].map((feature, idx) => (
                                    <div key={idx} className={`flex items-center gap-4 p-4 rounded-xl border border-solid transition-all duration-300 ${isLight ? 'bg-white border-slate-100 hover:border-primary/30' : 'bg-white/5 border-white/10 hover:border-white/30'}`}>
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isLight ? 'bg-primary/10 text-primary' : 'bg-primary/20 text-primary'}`}>
                                            <feature.icon size={16} />
                                        </div>
                                        <span className={`font-bold transition-colors ${isLight ? 'text-slate-800' : 'text-white/90'}`}>{feature.text}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </section>

            </main>

            <Footer />
        </div>
    );
}
