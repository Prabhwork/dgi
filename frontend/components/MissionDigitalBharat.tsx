"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { useTheme } from "@/components/ThemeProvider";

const logos = [
    "/assets/logo1.png",
    "/assets/logo2.png",
    "/assets/logo3.png",
    "/assets/logo4.jpeg",
    "/assets/logo5.png",
    "/assets/logo6.png",
    "/assets/logo7.png"
];

const repeatingLogos = [...logos, ...logos, ...logos, ...logos];

export default function MissionDigitalBharat() {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: "-100px" });
    const { theme } = useTheme();

    return (
        <section className="pt-6 pb-12 overflow-hidden relative z-10 -mt-6" id="mission" ref={ref}>
            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    className="text-center mb-6"
                >
                    <span className={`rounded-full px-5 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] relative overflow-hidden backdrop-blur-2xl border border-solid transition-all duration-300 ${theme === 'light'
                        ? 'bg-white/80 border-blue-600 text-primary shadow-none'
                        : 'bg-white/10 border-white/30 text-white'
                        }`}>
                        Support
                    </span>
                    <h2 className="text-4xl sm:text-5xl font-display font-black text-foreground mt-4 tracking-tight">
                        Mission <span className="gradient-text">Digital Bharat</span>
                    </h2>
                </motion.div>
            </div>

            <div className="relative flex overflow-hidden group">
                {/* Gradient Masks for smooth edges */}
                <div className="absolute left-0 top-0 bottom-0 w-24 sm:w-48 bg-gradient-to-r from-background to-transparent z-20 pointer-events-none" />
                <div className="absolute right-0 top-0 bottom-0 w-24 sm:w-48 bg-gradient-to-l from-background to-transparent z-20 pointer-events-none" />

                <div className="flex animate-marquee gap-6 whitespace-nowrap items-center min-w-max hover:[animation-play-state:paused] px-4" style={{ animationDuration: "35s" }}>
                    {[...repeatingLogos, ...repeatingLogos].map((logo, i) => (
                        <div
                            key={i}
                            className="flex-shrink-0 flex items-center justify-center px-8 transition-all duration-300 cursor-pointer h-[72px]"
                        >
                            <img
                                src={logo}
                                alt={`Partner Logo ${i}`}
                                className="h-10 sm:h-12 w-auto object-contain transition-transform hover:scale-110 duration-300"
                                draggable={false}
                                onError={(e) => {
                                    // Fallback if extension was uppercase etc.
                                    (e.target as HTMLImageElement).style.display = 'none';
                                }}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
