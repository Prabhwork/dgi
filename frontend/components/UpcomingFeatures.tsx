"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
    TrendingUp, Rocket, CalendarClock, MapPin,
    Navigation, GraduationCap, Briefcase, Building2,
    Wallet, UserCheck, Building, CreditCard
} from "lucide-react";
import { useTheme } from "./ThemeProvider";

const features = [
    { title: "Grow Your Existing Business", icon: TrendingUp },
    { title: "Start Ready To Kick Start Business", icon: Rocket },
    { title: "Pre-Book(Anything)", icon: CalendarClock },
    { title: "Sale In Your Zone", icon: MapPin },
    { title: "Live Route Guide", icon: Navigation },
    { title: "Education Gallery", icon: GraduationCap },
    { title: "Gem Tenders Info", icon: Briefcase },
    { title: "Govt. Contractual Job Openings", icon: Building2 },
    { title: "Earning Options", icon: Wallet },
    { title: "Verify People (vendors & employees)", icon: UserCheck },
    { title: "Business Suites", icon: Building },
    { title: "DBI Pay", icon: CreditCard },
];

const row1 = features.slice(0, 6);
const row2 = features.slice(6, 12);

// Repeating logic for infinite scroll
const repeatedRow1 = [...row1, ...row1, ...row1];
const repeatedRow2 = [...row2, ...row2, ...row2];

export default function UpcomingFeatures() {
    const { theme } = useTheme();
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: "-100px" });

    return (
        <section className="pt-6 pb-20 relative z-10 -mt-12 overflow-hidden" id="upcoming" ref={ref}>
            <div className="container mx-auto px-4">
                <motion.div initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} className="text-center mb-16">
                    <span className={`rounded-full px-5 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] relative overflow-hidden backdrop-blur-2xl border border-solid transition-all duration-300 ${theme === 'light'
                        ? 'bg-white/80 border-blue-600 text-primary shadow-none'
                        : 'bg-white/10 border-white/30 text-white'}`}>
                        Future Board
                    </span>
                    <h2 className="text-4xl sm:text-6xl font-display font-black text-foreground mt-4 tracking-tight">
                        Upcoming <span className="gradient-text">Categories</span>
                    </h2>
                    <p className="mt-4 text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base">
                        Get ready for powerful new tools and directories we are bringing to the Digital Book of India platform very soon.
                    </p>
                </motion.div>
            </div>

            {/* Dual Marquee Rows */}
            <div className="relative flex flex-col gap-6 w-full max-w-[100vw] overflow-hidden group">

                {/* Top Row - Scrolling Left */}
                <div className="flex animate-marquee gap-6 whitespace-nowrap items-center min-w-max hover:[animation-play-state:paused] px-4" style={{ animationDuration: "35s" }}>
                    {repeatedRow1.map((f, i) => (
                        <div
                            key={i}
                            className={`flex-shrink-0 flex items-center gap-4 rounded-[2rem] px-8 py-4 border border-solid hover:border-white/50 transition-all duration-300 cursor-pointer group/card relative overflow-hidden backdrop-blur-md ${theme === 'light' ? 'bg-white/10 border-blue-600 shadow-none hover:border-blue-700' : 'bg-white/[0.01] border-white/20 hover:bg-white/[0.05] hover:border-white/40 shadow-[0_4px_24px_rgba(0,0,0,0.15)]'
                                }`}
                        >
                            {/* Inner shiny highlight */}
                            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 pointer-events-none" />

                            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300 shadow-inner relative z-10 border-[1px] ${theme === 'light' ? 'bg-primary/10 border-primary/20 group-hover/card:bg-primary/20' : 'bg-white/5 border-white/20 group-hover/card:bg-white/10'
                                }`}>
                                <f.icon size={18} className={`transition-colors shadow-sm ${theme === 'light' ? 'text-primary' : 'text-white/80 group-hover/card:text-white group-hover/card:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]'
                                    }`} />
                            </div>
                            <span className={`font-display font-bold text-base sm:text-lg transition-colors relative z-10 ${theme === 'light' ? 'text-slate-900 group-hover/card:text-primary' : 'text-white/90 group-hover/card:text-white'
                                }`}>
                                {f.title}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Bottom Row - Scrolling Left (Consistent direction for stability) */}
                <div
                    className="flex animate-marquee gap-6 whitespace-nowrap items-center min-w-max hover:[animation-play-state:paused] px-4"
                    style={{ animationDuration: "40s" }}
                >
                    {repeatedRow2.map((f, i) => (
                        <div
                            key={i}
                            className={`flex-shrink-0 flex items-center gap-4 rounded-[2rem] px-8 py-4 border border-solid hover:border-white/50 transition-all duration-300 cursor-pointer group/card relative overflow-hidden backdrop-blur-md ${theme === 'light' ? 'bg-white/10 border-blue-600 shadow-none hover:border-blue-700' : 'bg-white/[0.01] border-white/20 hover:bg-white/[0.05] hover:border-white/40 shadow-[0_4px_24px_rgba(0,0,0,0.15)]'
                                }`}
                        >
                            {/* Inner shiny highlight */}
                            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 pointer-events-none" />

                            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300 shadow-inner relative z-10 border-[1px] ${theme === 'light' ? 'bg-primary/10 border-primary/20 group-hover/card:bg-primary/20' : 'bg-white/5 border-white/20 group-hover/card:bg-white/10'
                                }`}>
                                <f.icon size={18} className={`transition-colors shadow-sm ${theme === 'light' ? 'text-primary' : 'text-white/80 group-hover/card:text-white group-hover/card:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]'
                                    }`} />
                            </div>
                            <span className={`font-display font-bold text-base sm:text-lg transition-colors relative z-10 ${theme === 'light' ? 'text-slate-900 group-hover/card:text-primary' : 'text-white/90 group-hover/card:text-white'
                                }`}>
                                {f.title}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
