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
            transition: { type: "spring", stiffness: 300, damping: 24 }
        }
    };

    const renderCard = (f: UpcomingItem, i: number) => {
        const IconComponent = ICON_MAP[f.icon] || Rocket;
        const hasDetail = f._id && !FALLBACK_FEATURES.find(fb => fb._id === f._id);

        const cardContent = (
            <motion.div
                key={i}
                whileHover={{ y: -2, scale: 1.01 }}
                className={`flex items-center gap-1.5 rounded-lg sm:rounded-2xl px-2 py-1.5 sm:px-6 sm:py-4 border border-solid transition-all duration-300 cursor-pointer backdrop-blur-md ${theme === 'light' ? 'bg-white border-slate-200 shadow-sm hover:border-primary/30' : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/30 shadow-xl'
                    }`}
            >
                <div className={`w-6 h-6 sm:w-10 sm:h-10 rounded-md sm:rounded-xl flex items-center justify-center transition-colors duration-300 ${theme === 'light' ? 'bg-primary/5 text-primary' : 'bg-white/5 text-white/80'
                    }`}>
                    <IconComponent size={12} className="sm:size-5" />
                </div>
                <span className={`font-display font-medium text-[9px] sm:text-base tracking-tight transition-colors leading-tight ${theme === 'light' ? 'text-slate-900 group-hover:text-primary' : 'text-white/95'
                    }`}>
                    {f.title}
                </span>
            </motion.div>
        );

        if (hasDetail) {
            return (
                <Link href={`/upcoming/${f._id}`} key={i} className="block">
                    {cardContent}
                </Link>
            );
        }

        return cardContent;
    };

    return (
        <section className="pt-8 sm:pt-20 pb-16 relative z-10 overflow-hidden" id="upcoming" ref={ref}>
            <div className="container mx-auto px-4">
                <div className="text-center mb-2 sm:mb-10">
                    <span className={`rounded-full px-4 py-0 sm:px-5 sm:py-1.5 text-[7px] sm:text-[11px] font-bold uppercase tracking-[0.2em] relative overflow-hidden backdrop-blur-2xl border border-solid transition-all duration-300 ${theme === 'light'
                        ? 'bg-white border-blue-600 text-primary shadow-none'
                        : 'bg-white/10 border-white/30 text-white/80'}`}>
                        Upcoming Board
                    </span>
                    <h2 className="text-lg sm:text-5xl font-display font-black text-foreground mt-0.5 sm:mt-4 tracking-tight leading-tight">
                        Upcoming <span className="gradient-text">Categories</span>
                    </h2>
                    <p className="mt-1 text-muted-foreground max-w-2xl mx-auto text-[8px] sm:text-base hidden sm:block opacity-80">
                        New tools we are bringing soon to the platform.
                    </p>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-1.5 sm:gap-6">
                    {features.map((f, i) => (
                        <div key={i}>
                            {renderCard(f, i)}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
