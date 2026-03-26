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
    Package, Compass, Map, Home, Route, type LucideIcon
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
    { _id: "5", title: "Live Route Guide", icon: "Route", description: "Real-time logistics and supply chain optimization for vendors.", order: 4, isActive: true },
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

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20, scale: 0.95 },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: { type: "spring" as const, stiffness: 300, damping: 24 }
        }
    };

    const renderCard = (f: UpcomingItem, i: number) => {
        const IconComponent = ICON_MAP[f.icon] || Rocket;
        const hasDetail = f._id && !FALLBACK_FEATURES.find(fb => fb._id === f._id);

        const cardContent = (
            <motion.div
                key={i}
                whileHover={{ y: -5, scale: 1.02 }}
                className={`flex flex-col items-start gap-2 rounded-3xl p-6 border transition-all duration-500 cursor-pointer backdrop-blur-xl group w-full h-full relative overflow-hidden ${
                    theme === 'light' 
                    ? 'bg-white border-slate-200 shadow-sm hover:border-blue-400 hover:shadow-[0_20px_40px_-15px_rgba(59,130,246,0.15)]' 
                    : 'bg-white/5 border-white/5 hover:border-blue-500/40 hover:shadow-[0_20px_50px_-12px_rgba(59,130,246,0.25)]'
                }`}
            >
                {/* Icon Container */}
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-500 relative z-10 ${
                    theme === 'light' 
                    ? 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white' 
                    : 'bg-white/5 text-blue-400 group-hover:bg-blue-500 group-hover:text-white group-hover:shadow-[0_0_20px_rgba(59,130,246,0.4)]'
                }`}>
                    <IconComponent size={24} />
                </div>
                
                {/* Text Content */}
                <div className="flex flex-col gap-1 mt-1">
                    <h3 className={`font-display font-bold text-lg sm:text-xl tracking-tight transition-colors leading-tight ${
                        theme === 'light' ? 'text-slate-900 group-hover:text-blue-600' : 'text-white group-hover:text-blue-400'
                    }`}>
                        {f.title}
                    </h3>
                    {f.description && (
                        <div 
                            className={`text-sm sm:text-base leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity line-clamp-4 ${
                                theme === 'light' ? 'text-slate-600' : 'text-slate-400'
                            }`}
                            dangerouslySetInnerHTML={{ __html: f.description }}
                        />
                    )}
                </div>

                {/* Decorative Background Pattern */}
                <div className="absolute inset-0 z-0 opacity-[0.05] group-hover:opacity-[0.12] transition-opacity duration-700 pointer-events-none overflow-hidden rounded-3xl">
                    {f.title.includes("Grow Your Existing Business") ? (
                        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                            <rect x="10" y="60" width="10" height="30" fill="currentColor" />
                            <rect x="25" y="40" width="10" height="50" fill="currentColor" />
                            <rect x="40" y="50" width="10" height="40" fill="currentColor" />
                            <rect x="55" y="30" width="10" height="60" fill="currentColor" />
                            <rect x="70" y="45" width="10" height="45" fill="currentColor" />
                            <rect x="85" y="55" width="10" height="35" fill="currentColor" />
                        </svg>
                    ) : f.title.includes("Live Route Guide") ? (
                        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                            <path d="M0 80 L100 80 M0 60 L100 60 M0 40 L100 40 M20 0 L20 100 M40 0 L40 100 M60 0 L60 100 M80 0 L80 100" 
                                  stroke="currentColor" fill="none" strokeWidth="0.5" />
                            <path d="M10 90 L30 70 L50 75 L80 40 L95 10" 
                                  stroke="currentColor" fill="none" strokeWidth="2" strokeDasharray="4 2" />
                        </svg>
                    ) : f.title.includes("Start Ready To Kick Start Business") ? (
                        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                            <path d="M20 90 L50 20 L80 90" stroke="currentColor" fill="none" strokeWidth="1" />
                            <path d="M30 85 L50 40 L70 85" stroke="currentColor" fill="none" strokeWidth="0.5" />
                            <path d="M40 80 L50 60 L60 80" stroke="currentColor" fill="none" strokeWidth="0.5" />
                            <circle cx="50" cy="15" r="2" fill="currentColor" />
                        </svg>
                    ) : f.title.includes("Sale In Your Zone") ? (
                        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                            <circle cx="50" cy="50" r="10" stroke="currentColor" fill="none" strokeWidth="0.5" />
                            <circle cx="50" cy="50" r="25" stroke="currentColor" fill="none" strokeWidth="0.5" />
                            <circle cx="50" cy="50" r="40" stroke="currentColor" fill="none" strokeWidth="0.5" />
                            <path d="M50 0 L50 100 M0 50 L100 50" stroke="currentColor" fill="none" strokeWidth="0.2" />
                        </svg>
                    ) : f.title.includes("Pre-Book") ? (
                        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                            <circle cx="50" cy="50" r="30" stroke="currentColor" fill="none" strokeWidth="1" />
                            <path d="M50 50 L50 30 M50 50 L65 50" stroke="currentColor" fill="none" strokeWidth="1.5" />
                            <path d="M10 20 L30 20 M10 30 L30 30 M10 40 L30 40" stroke="currentColor" fill="none" strokeWidth="0.5" opacity="0.5" />
                            <path d="M70 20 L90 20 M70 30 L90 30 M70 40 L90 40" stroke="currentColor" fill="none" strokeWidth="0.5" opacity="0.5" />
                        </svg>
                    ) : f.title.includes("Education Gallery") ? (
                        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                            <path d="M20 30 L80 30 L80 70 L20 70 Z M20 40 L80 40 M20 50 L80 50 M20 60 L80 60" stroke="currentColor" fill="none" strokeWidth="0.5" />
                            <path d="M50 20 L80 30 L50 40 L20 30 Z" stroke="currentColor" fill="none" strokeWidth="0.5" />
                            <path d="M80 30 L80 50" stroke="currentColor" fill="none" strokeWidth="1" />
                        </svg>
                    ) : f.title.includes("Gem Tenders Info") ? (
                        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                            <path d="M30 20 L70 20 L80 30 L80 80 L20 80 L20 30 Z" stroke="currentColor" fill="none" strokeWidth="0.5" />
                            <path d="M30 40 L70 40 M30 50 L70 50 M30 60 L70 60" stroke="currentColor" fill="none" strokeWidth="0.5" />
                            <circle cx="70" cy="30" r="5" stroke="currentColor" fill="none" strokeWidth="0.5" />
                        </svg>
                    ) : f.title.includes("Govt. Contractual Job") ? (
                        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                            <rect x="20" y="20" width="60" height="60" stroke="currentColor" fill="none" strokeWidth="0.5" />
                            <path d="M20 40 L80 40 M20 60 L80 60 M40 20 L40 80 M60 20 L60 80" stroke="currentColor" fill="none" strokeWidth="0.2" />
                            <path d="M35 15 L65 15 L65 20 L35 20 Z" stroke="currentColor" fill="none" strokeWidth="0.5" />
                        </svg>
                    ) : f.title.includes("Earning Options") ? (
                        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                            <rect x="20" y="30" width="60" height="40" rx="5" stroke="currentColor" fill="none" strokeWidth="0.5" />
                            <circle cx="50" cy="50" r="8" stroke="currentColor" fill="none" strokeWidth="0.5" />
                            <path d="M10 20 L25 35 M90 20 L75 35 M10 80 L25 65 M90 80 L75 65" stroke="currentColor" fill="none" strokeWidth="0.5" />
                        </svg>
                    ) : f.title.includes("Verify People") ? (
                        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                            <path d="M50 10 L85 25 L85 55 Q 50 90, 15 55 L15 25 Z" stroke="currentColor" fill="none" strokeWidth="0.5" />
                            <path d="M35 50 L45 60 L65 40" stroke="currentColor" fill="none" strokeWidth="1" />
                        </svg>
                    ) : f.title.includes("Business Suites") ? (
                        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                            <rect x="15" y="15" width="25" height="25" stroke="currentColor" fill="none" strokeWidth="0.5" />
                            <rect x="55" y="15" width="30" height="30" stroke="currentColor" fill="none" strokeWidth="0.5" />
                            <rect x="15" y="55" width="35" height="30" stroke="currentColor" fill="none" strokeWidth="0.5" />
                            <rect x="65" y="60" width="20" height="20" stroke="currentColor" fill="none" strokeWidth="0.5" />
                        </svg>
                    ) : f.title.includes("DBI Pay") ? (
                        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                            <rect x="15" y="25" width="70" height="50" rx="8" stroke="currentColor" fill="none" strokeWidth="0.5" />
                            <path d="M15 40 L85 40" stroke="currentColor" fill="none" strokeWidth="2" />
                            <path d="M25 60 L45 60 M25 70 L35 70" stroke="currentColor" fill="none" strokeWidth="1" />
                        </svg>
                    ) : (
                        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                            <path d="M0 20 Q 25 10, 50 20 T 100 20 M0 40 Q 25 30, 50 40 T 100 40 M0 60 Q 25 50, 50 60 T 100 60 M0 80 Q 25 70, 50 80 T 100 80" 
                                  stroke="currentColor" fill="none" strokeWidth="0.5" />
                        </svg>
                    )}
                </div>
            </motion.div>
        );

        if (hasDetail) {
            return (
                <Link href={`/upcoming/${f._id}`} key={i} className="flex-1 block h-full"> 
                    {cardContent}
                </Link>
            );
        }

        return cardContent;
    };

    return (
        <section className={`pt-20 pb-20 relative z-10 overflow-hidden ${theme === 'light' ? 'bg-slate-50' : 'bg-transparent'}`} id="upcoming" ref={ref}>
            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-16">
                    <div className={`inline-block py-2 px-6 rounded-full border backdrop-blur-md mb-6 ${
                        theme === 'light' ? 'border-blue-200 bg-blue-50/50' : 'border-white/10 bg-white/5'
                    }`}>
                        <span className={`text-[10px] font-bold uppercase tracking-[0.4em] ${
                            theme === 'light' ? 'text-blue-700' : 'text-blue-400/80'
                        }`}>
                            Upcoming Board
                        </span>
                    </div>
                    
                    <h2 className={`text-4xl sm:text-7xl font-display font-black mt-2 tracking-tighter leading-tight ${
                        theme === 'light' ? 'text-slate-900' : 'text-white'
                    }`}>
                        Upcoming <span className="text-blue-500">Categories</span>
                    </h2>
                    <p className={`mt-6 max-w-2xl mx-auto text-base sm:text-xl font-medium ${
                        theme === 'light' ? 'text-slate-600' : 'text-slate-400'
                    }`}>
                        New tools we are bringing soon to the platform.
                    </p>
                </div>

                {/* Desktop Grid Layout (hidden on mobile) */}
                <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((f, i) => (
                        <motion.div 
                            key={f._id}
                            variants={itemVariants}
                            initial="hidden"
                            animate={inView ? "visible" : "hidden"}
                            custom={i}
                            className="flex h-full"
                        >
                            {renderCard(f, i)}
                        </motion.div>
                    ))}
                </div>

                {/* Mobile Auto-Scroll Marquee (hidden on desktop) */}
                <div className="sm:hidden -mx-4 overflow-hidden relative">
                    <motion.div
                        className="flex gap-4 px-4"
                        animate={{
                            x: [0, -1 * (280 + 16) * features.length]
                        }}
                        transition={{
                            duration: features.length * 4,
                            ease: "linear",
                            repeat: Infinity
                        }}
                    >
                        {[...features, ...features].map((f, i) => (
                            <div key={`${f._id}-${i}`} className="flex-shrink-0 w-[280px] h-full">
                                {renderCard(f, i)}
                            </div>
                        ))}
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
