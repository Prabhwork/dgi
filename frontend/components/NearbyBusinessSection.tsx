"use client";

import { motion } from "framer-motion";
import { Navigation, Map, Sparkles, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function NearbyBusinessSection() {
    return (
        <section className="relative py-24 overflow-hidden">
            {/* Background gradient & elements */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#020631] via-[#0B1D51]/20 to-[#020631] pointer-events-none" />
            
            {/* Animated grid overlay */}
            <div className="absolute inset-0 z-0 opacity-[0.03]" 
                style={{ backgroundImage: "linear-gradient(rgba(59,130,246,0.3) 1px,transparent 1px),linear-gradient(90deg,rgba(59,130,246,0.3) 1px,transparent 1px)", backgroundSize: "100px 100px" }}
            />

            <div className="container mx-auto px-4 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="max-w-4xl mx-auto text-center"
                >
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-black uppercase tracking-widest mb-8">
                        <Navigation size={14} className="animate-pulse" />
                        Next-Gen Discovery
                    </div>

                    {/* Headline */}
                    <h2 className="text-4xl md:text-7xl font-black text-white mb-6 leading-none tracking-tighter">
                        Experience Your City in <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-indigo-400">3D Spaces</span>
                    </h2>

                    <p className="text-white/50 text-lg md:text-xl max-w-2xl mx-auto mb-12 font-medium">
                        Auto-detect your location and explore verified local businesses through an immersive, interactive 3D map engine.
                    </p>

                    {/* Main CTA */}
                    <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                        <Link
                            href="/nearby-map"
                            className="group relative flex items-center gap-3 px-10 py-5 rounded-2xl bg-primary text-white font-black text-lg overflow-hidden shadow-[0_0_40px_rgba(37,99,235,0.4)] hover:shadow-[0_0_60px_rgba(37,99,235,0.6)] transition-all hover:scale-105"
                        >
                            {/* Animated Shine Effect */}
                            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000" />
                            
                            <Map size={22} className="group-hover:rotate-12 transition-transform" />
                            <span>See on Map</span>
                            <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                        
                        <Link
                            href="/search"
                            className="flex items-center gap-2 px-8 py-5 rounded-2xl bg-white/5 border border-white/10 text-white/70 font-bold text-lg hover:bg-white/10 hover:text-white transition-all backdrop-blur-md"
                        >
                            <Sparkles size={18} />
                            Directory List
                        </Link>
                    </div>
                </motion.div>
            </div>

            {/* Glowing bottom decoration */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-20" />
        </section>
    );
}
