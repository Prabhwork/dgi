"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Globe, Zap, Target, Award } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import dynamic from "next/dynamic";

const ThreeIndiaMap = dynamic(() => import("./ThreeIndiaMap"), { 
    ssr: false,
    loading: () => (
        <div className="w-full h-full flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
    )
});
import Link from "next/link";

const PILLARS = [
    { icon: Globe, title: "Global Reach", desc: "Connect with the world" },
    { icon: Zap, title: "Fast Growth", desc: "Accelerate your business" },
    { icon: Target, title: "Precision", desc: "Targeted local discovery" },
    { icon: Award, title: "Trust", desc: "Verified digital directory" }
];

export default function PlatformIntro() {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: "-10%" });
    const { theme } = useTheme();
    const isLight = theme === 'light';

    return (
        <section className="relative pt-12 pb-24 overflow-hidden bg-transparent z-10" id="about" ref={ref}>
            {/* Background decorative elements */}
            <div className={`absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-50`} />

            <div className="container mx-auto px-4">
                <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">

                    {/* Content Section (Left) */}
                    <motion.div
                        className="lg:col-span-6 space-y-8"
                        initial={{ opacity: 0, x: -30 }}
                        animate={inView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                        <div className="space-y-4">
                            <motion.span
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={inView ? { opacity: 1, scale: 1 } : {}}
                                transition={{ delay: 0.2 }}
                                className={`inline-block rounded-full px-5 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] relative overflow-hidden backdrop-blur-2xl border border-solid transition-all duration-300 ${isLight ? 'bg-white/80 border-blue-600 text-primary' : 'bg-white/5 border-white/20 text-blue-400'
                                    }`}
                            >
                                Digital Book Of India
                            </motion.span>

                            <h2 className="text-4xl sm:text-6xl font-display font-black text-foreground leading-[1.1] tracking-tight">
                                Empowering India&apos;s <br />
                                <span className="gradient-text">Local Business</span>
                            </h2>

                            <p className="text-muted-foreground text-lg leading-relaxed max-w-xl">
                                We are bridging the gap between local craftsmanship and global demand. Our platform is a beacon for businesses ready to thrive in the digital age.
                            </p>
                        </div>

                        {/* Feature Pillars Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {PILLARS.map((pillar, i) => (
                                <motion.div
                                    key={pillar.title}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={inView ? { opacity: 1, y: 0 } : {}}
                                    transition={{ delay: 0.4 + (i * 0.1) }}
                                    className={`p-4 rounded-2xl border border-solid transition-all duration-300 flex items-start gap-4 ${isLight
                                        ? 'bg-white/80 border-slate-200 hover:border-blue-600/30'
                                        : 'bg-white/5 border-white/10 hover:border-white/30'
                                        }`}
                                >
                                    <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${isLight ? 'bg-primary/10 text-primary' : 'bg-primary/20 text-primary'
                                        }`}>
                                        <pillar.icon size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm text-foreground">{pillar.title}</h4>
                                        <p className="text-xs text-muted-foreground">{pillar.desc}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        <div className="flex flex-wrap gap-4 pt-4">
                            <Button
                                asChild
                                className={`px-8 py-6 text-sm font-bold rounded-full transition-all duration-300 group ${isLight
                                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20'
                                    : 'glow bg-primary text-background hover:scale-105'
                                    }`}
                            >
                                <Link href="/about-us">
                                    Learn More
                                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </Button>
                            <Button
                                asChild
                                variant="ghost"
                                className={`px-8 py-6 text-sm font-bold rounded-full border-2 border-solid transition-all duration-300 ${isLight
                                    ? 'border-slate-300 text-slate-600 hover:bg-slate-50 hover:text-slate-800 active:border-blue-600 active:text-slate-800'
                                    : 'border-white/20 !text-white hover:bg-white/5 hover:border-white/40 active:border-primary active:!text-white'
                                    }`}
                            >
                                <Link href="/contact">
                                    Contact Us
                                </Link>
                            </Button>
                        </div>
                    </motion.div>

                    {/* Interactive Map Visual (Right) */}
                    <motion.div
                        className="lg:col-span-6 flex justify-center lg:justify-end relative"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={inView ? { opacity: 1, scale: 1 } : {}}
                        transition={{ duration: 1, ease: "easeOut" }}
                    >
                        <div className="relative w-full aspect-square max-w-[540px]">
                            {/* Tech Scanner Decorative Rings */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                    className={`absolute inset-0 rounded-full border-2 border-dashed ${isLight ? 'border-primary/5' : 'border-primary/10'
                                        }`}
                                />
                                <motion.div
                                    animate={{ rotate: -360 }}
                                    transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                                    className={`absolute inset-8 rounded-full border border-dotted ${isLight ? 'border-primary/10' : 'border-primary/20'
                                        }`}
                                />

                                {/* Geometric Accents */}
                                <div className={`absolute top-0 right-10 w-3 h-3 rounded-full bg-primary animate-pulse`} />
                                <div className={`absolute bottom-20 left-0 w-2 h-2 rounded-full bg-accent animate-ping`} />
                            </div>

                            {/* Map Container */}
                            <div className="absolute inset-0 flex items-center justify-center p-8 sm:p-12">
                                {/* Back Glow */}
                                <div className={`absolute inset-12 rounded-full blur-[100px] -z-10 opacity-30 ${isLight ? 'bg-blue-400' : 'bg-primary'}`} />
                                
                                <div className={`relative w-full h-full rounded-full border border-solid flex items-center justify-center transition-all duration-500 overflow-hidden backdrop-blur-2xl ${isLight
                                    ? 'bg-white/60 border-blue-100 shadow-[0_32px_64px_-16px_rgba(0,100,255,0.1)]'
                                    : 'bg-white/[0.03] border-white/10 shadow-2xl shadow-primary/10'
                                    }`}>
                                    <ThreeIndiaMap />

                                    {/* Scan Line Animation */}
                                    <motion.div
                                        animate={{ top: ['0%', '100%', '0%'] }}
                                        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                                        className={`absolute left-0 right-0 h-px z-10 pointer-events-none opacity-20 ${isLight ? 'bg-blue-600' : 'bg-primary'
                                            }`}
                                    />
                                </div>
                            </div>

                            {/* Connectivity Badge - Outside overflow-hidden */}
                            <motion.div
                                className={`absolute bottom-0 left-1/2 -translate-x-1/2 backdrop-blur-lg border px-4 py-2 rounded-xl z-50 transition-all duration-300 ${isLight
                                    ? 'bg-white/95 border-blue-600/30 shadow-none'
                                    : 'bg-primary/10 border-primary/20 shadow-xl'
                                    }`}
                                initial={{ opacity: 0, y: 20 }}
                                animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                                transition={{ delay: 1.5 }}
                            >
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                                    <span className="text-[10px] uppercase tracking-widest text-primary font-bold whitespace-nowrap">
                                        Connecting To India
                                    </span>
                                </div>
                            </motion.div>

                            {/* Floating Metric Badges */}
                            <motion.div
                                animate={{ y: [0, -10, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                className={`absolute top-10 left-0 p-3 rounded-xl border border-solid backdrop-blur-md shadow-xl ${isLight ? 'bg-white/90 border-blue-100' : 'bg-black/60 border-white/10'
                                    }`}
                            >
                                <div className="text-[10px] font-bold text-primary uppercase tracking-wider">Growth</div>
                                <div className="text-lg font-black font-display">+150%</div>
                            </motion.div>

                            <motion.div
                                animate={{ y: [0, 10, 0] }}
                                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                                className={`absolute bottom-10 right-0 p-3 rounded-xl border border-solid backdrop-blur-md shadow-xl ${isLight ? 'bg-white/90 border-blue-100' : 'bg-black/60 border-white/10'
                                    }`}
                            >
                                <div className="text-[10px] font-bold text-primary uppercase tracking-wider">Status</div>
                                <div className="text-lg font-black font-display tracking-tight">GLOBAL</div>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Bottom Section Divider */}
            <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent rounded-full`} />
        </section>
    );
}
