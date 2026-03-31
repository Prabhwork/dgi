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
    Package, Compass, Map, Home, Route, X, type LucideIcon
} from "lucide-react";
import { useTheme } from "./ThemeProvider";
import Link from "next/link";
import { AnimatePresence } from "framer-motion";

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
    const [selectedFeature, setSelectedFeature] = useState<UpcomingItem | null>(null);
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

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

    const gradients = [
        "from-blue-500/10 via-blue-900/5 to-transparent border-blue-500/20 group-hover:border-blue-400/50",
        "from-purple-500/10 via-purple-900/5 to-transparent border-purple-500/20 group-hover:border-purple-400/50",
        "from-emerald-500/10 via-emerald-900/5 to-transparent border-emerald-500/20 group-hover:border-emerald-400/50",
        "from-amber-500/10 via-amber-900/5 to-transparent border-amber-500/20 group-hover:border-amber-400/50",
        "from-pink-500/10 via-pink-900/5 to-transparent border-pink-500/20 group-hover:border-pink-400/50"
    ];

    const iconColors = [
        "bg-blue-500/10 text-blue-400 group-hover:bg-blue-500 group-hover:text-white group-hover:shadow-[0_0_15px_rgba(59,130,246,0.5)]",
        "bg-purple-500/10 text-purple-400 group-hover:bg-purple-500 group-hover:text-white group-hover:shadow-[0_0_15px_rgba(168,85,247,0.5)]",
        "bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white group-hover:shadow-[0_0_15px_rgba(16,185,129,0.5)]",
        "bg-amber-500/10 text-amber-400 group-hover:bg-amber-500 group-hover:text-white group-hover:shadow-[0_0_15px_rgba(245,158,11,0.5)]",
        "bg-pink-500/10 text-pink-400 group-hover:bg-pink-500 group-hover:text-white group-hover:shadow-[0_0_15px_rgba(236,72,153,0.5)]"
    ];

    const renderCard = (f: UpcomingItem, i: number) => {
        const IconComponent = ICON_MAP[f.icon] || Rocket;
        const hasDetail = f._id && !FALLBACK_FEATURES.find(fb => fb._id === f._id);
        const colorIdx = i % gradients.length;

        const cardContent = (
            <motion.div
                key={i}
                whileHover={{ y: -5, scale: 1.02 }}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => setSelectedFeature(f)}
                className={`flex flex-col items-start gap-3 rounded-2xl p-5 border transition-all duration-500 cursor-pointer backdrop-blur-xl group w-full h-full relative overflow-hidden bg-gradient-to-br ${theme === 'light'
                        ? 'bg-white border-slate-200 shadow-sm hover:shadow-md'
                        : `bg-white/5 ${gradients[colorIdx]}`
                    }`}
            >
                {/* Icon & Title Row */}
                <div className="flex items-center gap-3 w-full relative z-10">
                    <div className={`w-10 h-10 rounded-xl flex shrink-0 items-center justify-center transition-all duration-500 ${theme === 'light' ? 'bg-blue-50 text-blue-600' : iconColors[colorIdx]
                        }`}>
                        <IconComponent size={20} />
                    </div>
                    <h3 className={`font-display font-bold text-base sm:text-lg tracking-tight transition-colors leading-tight line-clamp-2 ${theme === 'light' ? 'text-slate-900 group-hover:text-blue-600' : 'text-white'
                        }`}>
                        {f.title}
                    </h3>
                </div>

                {/* Text Content */}
                <div className="flex flex-col gap-2 mt-1 flex-1 w-full relative z-10">
                    <div
                        className={`text-xs sm:text-sm leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity line-clamp-3 ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'
                            }`}
                        dangerouslySetInnerHTML={{ __html: f.description || `Explore the new ${f.title} features coming soon to enhance your digital experience.` }}
                    />
                </div>

                {/* Read More Button */}
                <div className="mt-auto pt-4 w-full border-t border-white/5 relative z-10">
                    <motion.div
                        animate={{ y: [0, -6, 0] }}
                        transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className={`flex items-center justify-between text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${theme === 'light'
                                ? 'text-blue-600'
                                : `${iconColors[colorIdx].split(' ').find(c => c.startsWith('text-'))} brightness-125`
                            }`}
                    >
                        <span className="flex items-center gap-2">
                            Read More
                            <motion.span
                                animate={{ opacity: [0.4, 1, 0.4] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="w-1 h-1 rounded-full bg-current"
                            />
                        </span>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 ${theme === 'light'
                                ? 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white'
                                : 'bg-white/5 border border-white/10 group-hover:bg-white group-hover:text-black group-hover:scale-110 shadow-lg'
                            }`}>
                            <span className="text-base">→</span>
                        </div>
                    </motion.div>
                </div>

                {/* Decorative Background Glow */}
                <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-700 blur-2xl z-0 bg-current text-white pointer-events-none" />
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
                    <div className={`inline-block py-2 px-6 rounded-full border backdrop-blur-md mb-6 ${theme === 'light' ? 'border-blue-200 bg-blue-50/50' : 'border-white/10 bg-white/5'
                        }`}>
                        <span className={`text-[10px] font-bold uppercase tracking-[0.4em] ${theme === 'light' ? 'text-blue-700' : 'text-blue-400/80'
                            }`}>
                            Upcoming Board
                        </span>
                    </div>

                    <h2 className={`text-4xl sm:text-7xl font-display font-black mt-2 tracking-tighter leading-tight ${theme === 'light' ? 'text-slate-900' : 'text-white'
                        }`}>
                        Upcoming <span className="text-blue-500">Categories</span>
                    </h2>
                    <p className={`mt-6 max-w-2xl mx-auto text-base sm:text-xl font-medium ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'
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

            {/* Feature Detail Modal */}
            <AnimatePresence>
                {selectedFeature && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedFeature(null)}
                            className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
                        />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.3, y: 100, rotate: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
                            exit={{ opacity: 0, scale: 0.5, y: 50, rotate: 5 }}
                            transition={{
                                type: "spring",
                                damping: 18,
                                stiffness: 400,
                                mass: 0.8
                            }}
                            className={`relative w-full max-w-lg overflow-hidden rounded-[2.5rem] border shadow-2xl ${theme === 'light'
                                    ? 'bg-white border-slate-200'
                                    : 'bg-slate-900 border-white/10'
                                }`}
                        >
                            {/* Colorful background splash */}
                            <div className={`absolute -top-24 -right-24 w-64 h-64 rounded-full blur-[80px] opacity-20 pointer-events-none bg-blue-500`} />
                            <div className={`absolute -bottom-24 -left-24 w-64 h-64 rounded-full blur-[80px] opacity-20 pointer-events-none bg-purple-500`} />

                            <button
                                onClick={() => setSelectedFeature(null)}
                                className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/10 transition-colors z-20 group"
                            >
                                <X size={20} className={theme === 'light' ? 'text-slate-600' : 'text-white/70 group-hover:text-white'} />
                            </button>

                            <div className="relative z-10 p-8 sm:p-10 flex flex-col gap-6">
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg transform -rotate-3 ${theme === 'light' ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
                                    }`}>
                                    {(() => {
                                        const Icon = ICON_MAP[selectedFeature.icon] || Rocket;
                                        return <Icon size={32} />;
                                    })()}
                                </div>

                                <div className="space-y-4">
                                    <h3 className={`text-3xl sm:text-4xl font-display font-black tracking-tight leading-tight ${theme === 'light' ? 'text-slate-900' : 'text-white'
                                        }`}>
                                        {selectedFeature.title}
                                    </h3>

                                    <div className={`h-1.5 w-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-500`} />

                                    <div
                                        className={`text-base sm:text-lg leading-relaxed font-medium ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'
                                            }`}
                                        dangerouslySetInnerHTML={{
                                            __html: selectedFeature.description || `Explore the new ${selectedFeature.title} features coming soon to enhance your digital experience. We are working hard to bring this to you.`
                                        }}
                                    />
                                </div>

                                <div className="pt-4 flex flex-col sm:flex-row gap-4">
                                    <button
                                        onClick={() => setSelectedFeature(null)}
                                        className={`py-4 px-8 rounded-2xl font-bold transition-all duration-300 transform active:scale-95 ${theme === 'light'
                                                ? 'bg-slate-900 text-white hover:bg-slate-800'
                                                : 'bg-white text-slate-950 hover:bg-slate-100 shadow-[0_0_20px_rgba(255,255,255,0.2)]'
                                            }`}
                                    >
                                        Close Details
                                    </button>

                                    <div className="flex-1 flex items-center justify-center sm:justify-start px-2">
                                        <span className={`text-[10px] font-black uppercase tracking-[0.3em] opacity-40 ${theme === 'light' ? 'text-slate-900' : 'text-white'
                                            }`}>
                                            Coming Soon
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </section>
    );
}
