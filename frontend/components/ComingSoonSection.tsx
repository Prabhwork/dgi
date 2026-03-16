"use client";

import { motion } from "framer-motion";

export default function ComingSoonSection() {
    return (
        <section className="relative py-24 sm:py-32 overflow-hidden" id="pre-launch">
            <div className="container mx-auto px-4 text-center">
                <div className="relative inline-block w-full max-w-[1200px]">
                    <div className="flex items-center justify-center gap-4 sm:gap-8 mb-4 sm:mb-8">
                        <div className="h-0.5 flex-1 bg-gradient-to-r from-transparent via-white/40 to-white/60" />
                        <motion.h2
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8 }}
                            className="text-4xl sm:text-6xl md:text-8xl font-display font-bold text-white tracking-[0.2em] sm:tracking-[0.4em] uppercase whitespace-nowrap"
                        >
                            Pre Launch
                        </motion.h2>
                        <div className="h-0.5 flex-1 bg-gradient-to-l from-transparent via-white/40 to-white/60" />
                    </div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                    className="mt-8 sm:mt-12"
                >
                    <p className="text-sm sm:text-lg md:text-xl font-bold text-yellow-500 tracking-wider max-w-[1000px] mx-auto uppercase leading-relaxed glow-text">
                        PREPARED TO BE AMAZED....DIGITAL BOOK OF INDIA IS ON ITS WAY TO MAKE YOUR WAY OF LIVING WITH A MORE TECHNICAL FEEL.
                    </p>
                </motion.div>

                {/* Decorative Elements */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-32 bg-primary/10 blur-[120px] -z-10 rounded-full" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-px bg-white/10 -z-10" />
            </div>
        </section>
    );
}
