"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { MapPin, Globe, Users, Flag, Heart } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

const communityLevels = [
    { title: "Your Area", icon: MapPin, desc: "Lead your neighborhood" },
    { title: "Your Zone", icon: Globe, desc: "Manage your local zone" },
    { title: "Your City", icon: Users, desc: "Influence your whole city" },
    { title: "Your State", icon: Flag, desc: "Represent your state" },
    { title: "Your India's", icon: Heart, desc: "A national visionary" },
];

export default function CommunityLeader() {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: "-100px" });
    const { theme } = useTheme();

    return (
        <section className="pt-0 pb-20 relative z-10 mt-4 overflow-hidden" id="leader" ref={ref}>
            <div className="container mx-auto px-4">
                <motion.div initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} className="text-center mb-16">
                    <span className={`rounded-full px-5 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] relative overflow-hidden backdrop-blur-2xl border border-solid transition-all duration-300 ${theme === 'light'
                        ? 'bg-white/80 border-blue-600 text-primary shadow-none'
                        : 'bg-white/10 border-white/30 text-white'}`}>
                        Community Leader
                    </span>
                    <h2 className="text-4xl sm:text-6xl font-display font-black text-foreground mt-4 tracking-tight">
                        Become a Community<br />
                        <span className="gradient-text">Leader</span>
                    </h2>
                </motion.div>

                {/* Mobile Scroll / Desktop Flex Container */}
                <div className="flex overflow-x-auto sm:grid sm:grid-cols-3 lg:grid-cols-5 gap-6 no-scrollbar pb-8 sm:pb-0 snap-x snap-mandatory">
                    {communityLevels.map((level, i) => (
                        <motion.div
                            key={level.title}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={inView ? { opacity: 1, scale: 1 } : {}}
                            transition={{ delay: i * 0.1 }}
                            className={`flex-shrink-0 w-[240px] sm:w-auto snap-center rounded-2xl p-8 flex flex-col items-center text-center cursor-pointer hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden backdrop-blur-md border border-solid ${theme === 'light'
                                ? 'bg-white/40 border-blue-600 shadow-none hover:border-blue-700'
                                : 'bg-white/[0.01] border-white/20 hover:bg-white/[0.05] hover:border-white/40 shadow-[0_4px_24px_rgba(0,0,0,0.2)] hover:shadow-[0_8px_32px_rgba(255,255,255,0.15)]'
                                }`}
                        >
                            {/* Inner shiny highlight */}
                            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-xl transition-colors duration-500 relative z-10 border-[1px] ${theme === 'light' ? 'bg-primary/10 border-primary/20 group-hover:bg-primary/20 group-hover:border-primary/50' : 'bg-foreground/90 border-transparent group-hover:bg-primary group-hover:border-white/20'
                                }`}>
                                <level.icon size={32} className={`transition-colors duration-500 shadow-sm ${theme === 'light' ? 'text-primary' : 'text-primary group-hover:text-white group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]'
                                    }`} />
                            </div>
                            <h3 className="font-display font-bold text-lg text-foreground mb-2">{level.title}</h3>
                            <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">{level.desc}</p>

                            <div className="mt-6 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
