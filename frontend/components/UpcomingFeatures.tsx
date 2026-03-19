"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import {
    TrendingUp, Rocket, CalendarClock, MapPin,
    Navigation, GraduationCap, Briefcase, Building2,
    Wallet, UserCheck, Building, CreditCard,
    ShoppingCart, Heart, Star, Zap, Globe, Shield,
    Award, Target, BookOpen, Truck, Phone, Camera,
    Music, Film, Monitor, Cpu, Database, Cloud,
    Gift, Coffee, Smile, ThumbsUp, Bell, Layers,
    Package, Compass, Map, Home, type LucideIcon
} from "lucide-react";
import { useTheme } from "./ThemeProvider";
import Link from "next/link";

// Icon mapping: string name -> Lucide component
const ICON_MAP: Record<string, LucideIcon> = {
    TrendingUp, Rocket, CalendarClock, MapPin, Navigation,
    GraduationCap, Briefcase, Building2, Wallet, UserCheck,
    Building, CreditCard, ShoppingCart, Heart, Star, Zap,
    Globe, Shield, Award, Target, BookOpen, Truck, Phone,
    Camera, Music, Film, Monitor, Cpu, Database, Cloud,
    Gift, Coffee, Smile, ThumbsUp, Bell, Layers, Package,
    Compass, Map, Home
};

interface UpcomingItem {
    _id: string;
    title: string;
    icon: string;
    description?: string;
    image?: string;
    order: number;
    isActive: boolean;
}

// Hardcoded fallback data
const FALLBACK_FEATURES = [
    { _id: "1", title: "Grow Your Existing Business", icon: "TrendingUp", order: 0, isActive: true },
    { _id: "2", title: "Start Ready To Kick Start Business", icon: "Rocket", order: 1, isActive: true },
    { _id: "3", title: "Pre-Book(Anything)", icon: "CalendarClock", order: 2, isActive: true },
    { _id: "4", title: "Sale In Your Zone", icon: "MapPin", order: 3, isActive: true },
    { _id: "5", title: "Live Route Guide", icon: "Navigation", order: 4, isActive: true },
    { _id: "6", title: "Education Gallery", icon: "GraduationCap", order: 5, isActive: true },
    { _id: "7", title: "Gem Tenders Info", icon: "Briefcase", order: 6, isActive: true },
    { _id: "8", title: "Govt. Contractual Job Openings", icon: "Building2", order: 7, isActive: true },
    { _id: "9", title: "Earning Options", icon: "Wallet", order: 8, isActive: true },
    { _id: "10", title: "Verify People (vendors & employees)", icon: "UserCheck", order: 9, isActive: true },
    { _id: "11", title: "Business Suites", icon: "Building", order: 10, isActive: true },
    { _id: "12", title: "DBI Pay", icon: "CreditCard", order: 11, isActive: true },
];

export default function UpcomingFeatures() {
    const { theme } = useTheme();
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: "-100px" });
    const [features, setFeatures] = useState<UpcomingItem[]>(FALLBACK_FEATURES);

    useEffect(() => {
        const fetchFeatures = async () => {
            try {
                const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
                const res = await fetch(`${API}/upcoming-categories`);
                const data = await res.json();
                if (data.success && data.data && data.data.length > 0) {
                    setFeatures(data.data.filter((item: UpcomingItem) => item.isActive));
                }
            } catch (err) {
                console.error("Failed to fetch upcoming categories:", err);
            }
        };
        fetchFeatures();
    }, []);

    const half = Math.ceil(features.length / 2);
    const row1 = features.slice(0, half);
    const row2 = features.slice(half);

    const repeatedRow1 = [...row1, ...row1, ...row1];
    const repeatedRow2 = [...row2, ...row2, ...row2];

    const renderCard = (f: UpcomingItem, i: number) => {
        const IconComponent = ICON_MAP[f.icon] || Rocket;
        const hasDetail = f._id && !FALLBACK_FEATURES.find(fb => fb._id === f._id);

        const cardContent = (
            <div
                key={i}
                className={`flex-shrink-0 flex items-center gap-4 rounded-[2rem] px-8 py-4 border border-solid hover:border-white/50 transition-all duration-300 cursor-pointer group/card relative overflow-hidden backdrop-blur-md ${theme === 'light' ? 'bg-white/10 border-blue-600 shadow-none hover:border-blue-700' : 'bg-white/[0.01] border-white/20 hover:bg-white/[0.05] hover:border-white/40 shadow-[0_4px_24px_rgba(0,0,0,0.15)]'
                    }`}
            >
                {/* Inner shiny highlight */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 pointer-events-none" />

                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300 shadow-inner relative z-10 border-[1px] ${theme === 'light' ? 'bg-primary/10 border-primary/20 group-hover/card:bg-primary/20' : 'bg-white/5 border-white/20 group-hover/card:bg-white/10'
                    }`}>
                    <IconComponent size={18} className={`transition-colors shadow-sm ${theme === 'light' ? 'text-primary' : 'text-white/80 group-hover/card:text-white group-hover/card:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]'
                        }`} />
                </div>
                <span className={`font-display font-bold text-base sm:text-lg transition-colors relative z-10 ${theme === 'light' ? 'text-slate-900 group-hover/card:text-primary' : 'text-white/90 group-hover/card:text-white'
                    }`}>
                    {f.title}
                </span>
            </div>
        );

        if (hasDetail) {
            return (
                <Link href={`/upcoming/${f._id}`} key={i} className="flex-shrink-0">
                    {cardContent}
                </Link>
            );
        }

        return cardContent;
    };

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
                    {repeatedRow1.map((f, i) => renderCard(f, i))}
                </div>

                {/* Bottom Row */}
                <div
                    className="flex animate-marquee gap-6 whitespace-nowrap items-center min-w-max hover:[animation-play-state:paused] px-4"
                    style={{ animationDuration: "40s" }}
                >
                    {repeatedRow2.map((f, i) => renderCard(f, i))}
                </div>
            </div>
        </section>
    );
}
