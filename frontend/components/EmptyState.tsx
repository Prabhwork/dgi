"use client";

import { motion, AnimatePresence, animate } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { Rocket, MessageSquare, TrendingUp, Plus, Brain, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useTheme } from "@/components/ThemeProvider";

export default function EmptyState({ categoryName }: { categoryName?: string }) {
    const { theme } = useTheme();
    const isLight = theme === 'light';

    const [liveListingCurrent, setLiveListingCurrent] = useState<number>(47000); // Default fallback
    const [mainCategories, setMainCategories] = useState<string[]>([]);

    useEffect(() => {
        const fetchSettingsAndMainCategories = async () => {
            try {
                const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
                
                // Fetch settings
                const resSettings = await fetch(`${API}/global-settings`);
                const dataSettings = await resSettings.json();
                if (dataSettings.success && dataSettings.data) {
                    setLiveListingCurrent(dataSettings.data.liveListingCurrent || 47000);
                }

                // Fetch main categories to identify which ones get heavily weighted
                const mainRes = await fetch(`${API}/main-categories?limit=50`).then(r => r.json());

                const mainNames: string[] = [];
                if (mainRes.success && mainRes.data) {
                    mainRes.data.forEach((m: any) => { if (m.name) mainNames.push(m.name.toLowerCase()); });
                }
                if (!mainNames.includes("restaurants")) {
                    mainNames.push("restaurants");
                }

                setMainCategories(mainNames);
            } catch (err) {
                console.error("Failed to fetch settings/categories for empty state", err);
            }
        };
        fetchSettingsAndMainCategories();
    }, []);

    // Helper to generate a deterministic random multiplier based on category name & main status
    const getMultiplier = (name?: string) => {
        if (!name) return 1.0;
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        hash = Math.abs(hash);

        // Check if it's one of the front-page main categories
        const isMain = mainCategories.includes(name.toLowerCase());
        
        if (isMain) {
            // Main categories get 20x to 50x the average
            return 20.0 + (hash % 300) / 10;
        } else {
            // Normal categories get 0x to 0.4x the average (some might be 0, some 10, some 40)
            return (hash % 40) / 100;
        }
    };

    const TOTAL_CATEGORIES = 4000;
    
    const [count, setCount] = useState<number>(0);
    const [displayCount, setDisplayCount] = useState<number>(0);
    const [increment, setIncrement] = useState<number | null>(null);

    // Dynamic Growth simulation
    useEffect(() => {
        if (mainCategories.length === 0 && liveListingCurrent === 47000) return; // Wait until fetched

        const multiplier = getMultiplier(categoryName);
        const avgPerCategory = liveListingCurrent / TOTAL_CATEGORIES;
        const targetCount = Math.floor(avgPerCategory * multiplier);
        
        // Let some normal categories be exactly 0 or very small
        const safeTargetCount = Math.max(0, targetCount);

        // Use local storage to prevent going backwards on immediate reload
        const storageKey = `dgi_growth_count_${categoryName || 'default'}`;
        const savedCount = localStorage.getItem(storageKey);
        const finalCount = savedCount ? Math.max(parseInt(savedCount), safeTargetCount) : safeTargetCount;

        setCount(finalCount);
        setDisplayCount(finalCount);
    }, [categoryName, liveListingCurrent, mainCategories]);

    useEffect(() => {
        const interval = setInterval(() => {
            setCount(prev => {
                // If it grows randomly, just add 1 occasionally
                const inc = Math.floor(Math.random() * 2);
                if (inc === 0) return prev;
                
                const next = prev + inc;
                setIncrement(inc);
                const storageKey = `dgi_growth_count_${categoryName || 'default'}`;
                localStorage.setItem(storageKey, next.toString());
                setTimeout(() => setIncrement(null), 3000);
                return next;
            });
        }, 30000 + Math.random() * 30000);

        return () => clearInterval(interval);
    }, [categoryName]);

    useEffect(() => {
        const controls = animate(displayCount, count, {
            duration: 3,
            ease: "easeOut",
            onUpdate: (latest) => setDisplayCount(Math.round(latest))
        });
        return controls.stop;
    }, [count]);

    return (
        <div className="relative min-h-screen w-full flex flex-col items-center justify-center ">
            {/* --- PREMIUM SPACE BACKGROUND --- */}
            <div className={``}>
                {!isLight && (
                    <>
                        {/* Nebula Clouds */}
                        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-600/10 blur-[120px] rounded-full animate-pulse" />
                        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-600/10 blur-[120px] rounded-full animate-pulse delay-1000" />
                        <div className="absolute top-[20%] right-[10%] w-[40%] h-[40%] bg-indigo-600/5 blur-[100px] rounded-full animate-pulse delay-700" />
                        
                        {/* Star Field */}
                        <div className="absolute inset-0 opacity-40 [background-image:radial-gradient(1px_1px_at_20px_30px,#eee,transparent),radial-gradient(1.5px_1.5px_at_100px_150px,#fff,transparent),radial-gradient(2px_2px_at_250px_50px,#aaa,transparent)] [background-size:300px_300px]" />
                        <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(1px_1px_at_10px_10px,#eee,transparent)] [background-size:100px_100px] animate-pulse" />
                        
                        {/* Digital Grid Overlay */}
                        <div className="absolute inset-0 opacity-[0.05] pointer-events-none [background-image:linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] [background-size:60px_60px]" />
                    </>
                )}
            </div>

            {/* --- MAIN CONTENT CONTAINER --- */}
            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative z-10 w-full max-w-5xl flex flex-col items-center text-center"
            >
                {/* 1. MAIN TITLE */}
                <h1 className="text-5xl md:text-7xl font-black mb-10 tracking-tight text-white leading-tight font-display drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                    We’re building <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300 drop-shadow-[0_0_20px_rgba(34,211,238,0.5)]">something amazing</span>
                </h1>

                {/* 2. PREMIUM ANNOUNCEMENT BADGES */}
                <div className="flex flex-wrap items-center justify-center gap-4 mb-10">
                    <motion.div 
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="group relative"
                    >
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full blur opacity-30 group-hover:opacity-60 transition duration-1000" />
                        <span className="relative flex items-center gap-3 px-6 py-3 bg-black/40 backdrop-blur-xl border border-white/20 rounded-full text-white font-bold text-sm md:text-base cursor-default">
                             <div className="w-3 h-3 rounded-full bg-[#0ea5e9] animate-pulse shadow-[0_0_15px_#0ea5e9]" />
                             Official Launch: <span className="text-cyan-400 font-black ml-1 drop-shadow-[0_0_15px_rgba(34,211,238,0.8)]">May 1st</span>
                        </span>
                    </motion.div>

                    <motion.div
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="group relative"
                    >
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full blur opacity-20 group-hover:opacity-40 transition duration-1000" />
                        <span className="relative flex items-center gap-3 px-6 py-3 bg-black/40 backdrop-blur-xl border border-white/10 rounded-full text-emerald-400 font-bold text-sm md:text-base cursor-default">
                             <Rocket size={18} className="text-emerald-400 animate-bounce" />
                             Accepting New Listings Now
                        </span>
                    </motion.div>
                </div>

                {/* 3. SUBTITLE DESCRIPTION */}
                <p className="text-slate-300 text-lg md:text-xl font-medium max-w-2xl mx-auto mb-14 leading-relaxed opacity-90">
                    We are currently onboarding businesses in this category. 
                    Be among the first to explore and grow with us.
                </p>

                {/* 4. THE MASTER "WOW" CARD */}
                <div className="relative w-full max-w-3xl aspect-[16/10] md:aspect-[21/10] perspective-1000">
                    {/* Floating AI Assistant Badge - Hidden per user's last manual removal */}
                   

                    {/* Main Card Container */}
                    <div className="relative w-full h-full p-[2px] rounded-[2.5rem] bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-500 shadow-[0_0_80px_rgba(139,92,246,0.3)] group overflow-hidden">
                        <div className="w-full h-full bg-[#030014]/90 backdrop-blur-3xl rounded-[2.4rem] p-8 md:p-12 flex flex-col items-center justify-center relative overflow-hidden">
                            
                            {/* Animated Background Mesh */}
                            <div className="absolute inset-0 opacity-[0.2] bg-[radial-gradient(circle_at_50%_120%,#3b82f6,transparent_50%),radial-gradient(circle_at_0%_0%,#8b5cf6,transparent_50%)]" />
                            
                            {/* Card Header Label - User's custom text preserved */}
                            <div className="mb-6 flex items-center gap-3 relative z-10">
                                <span className="text-slate-400 text-[10px] md:text-xs font-black uppercase tracking-[0.4em]">Add your Business Immediate</span>
                            </div>

                            {/* THE BIG NUMBER */}
                            <div className="relative z-10 mb-4">
                                <motion.span 
                                    key={categoryName}
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: increment ? [1, 1.05, 1] : 1, opacity: 1 }}
                                    className="text-8xl md:text-9xl font-display font-black tracking-tighter text-white drop-shadow-[0_0_40px_rgba(255,255,255,0.4)]"
                                >
                                    {displayCount}
                                </motion.span>
                                
                                <AnimatePresence>
                                    {increment && (
                                        <motion.div
                                            initial={{ y: 20, opacity: 0, scale: 0 }}
                                            animate={{ y: -40, opacity: 1, scale: 1 }}
                                            exit={{ y: -60, opacity: 0 }}
                                            className="absolute top-0 -right-4 md:-right-8 text-emerald-400 text-xl md:text-2xl font-black drop-shadow-[0_0_10px_rgba(16,185,129,0.5)] z-20"
                                        >
                                            +{increment}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* GROWTH CURVE SVG */}
                                <div className="absolute bottom-[-35px] left-[-35%] right-[-35%] h-36 opacity-80 pointer-events-none filter drop-shadow-[0_0_20px_rgba(59,130,246,0.5)]">
                                    <svg viewBox="0 0 400 100" className="w-full h-full">
                                        <defs>
                                            <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0" />
                                                <stop offset="50%" stopColor="#06b6d4" stopOpacity="1" />
                                                <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.7" />
                                            </linearGradient>
                                        </defs>
                                        <motion.path 
                                            initial={{ pathLength: 0 }}
                                            animate={{ pathLength: 1 }}
                                            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                            d="M 0,80 C 50,85 150,40 200,60 S 300,20 400,10"
                                            fill="none"
                                            stroke="url(#lineGrad)"
                                            strokeWidth="4"
                                            strokeLinecap="round"
                                            className="drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]"
                                        />
                                        
                                        {/* Multiple data point "sparkles" along the line */}
                                        <motion.circle 
                                            r="5" 
                                            fill="#fff" 
                                            className="shadow-[0_0_15px_#fff]"
                                            animate={{ cx: [0, 50, 150, 200, 300, 400], cy: [80, 85, 40, 60, 20, 10] }}
                                            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                        />
                                        
                                        {/* Static glowing points */}
                                        <circle cx="50" cy="85" r="3" fill="#3b82f6" className="animate-pulse shadow-lg" />
                                        <circle cx="200" cy="60" r="3" fill="#06b6d4" className="animate-pulse delay-500 shadow-lg" />
                                        <circle cx="400" cy="10" r="4" fill="#8b5cf6" className="animate-pulse delay-1000 shadow-lg" />
                                    </svg>
                                </div>
                            </div>

                            {/* Live Metric Footer */}
                            <div className="mt-8 flex items-center gap-4 bg-white/5 border border-white/10 backdrop-blur-md px-6 py-2.5 rounded-2xl shadow-xl hover:bg-white/10 transition-colors cursor-default z-10">
                                <span className="text-white font-black text-[10px] md:text-xs uppercase tracking-[0.2em] flex items-center gap-2">
                                    <TrendingUp size={14} className="text-cyan-400" />
                                    Live Platform Growth
                                </span>
                                <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping shadow-[0_0_12px_#3b82f6]" />
                            </div>
                        </div>

                        {/* Neon Edge Highlights */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-60" />
                        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-60" />
                    </div>
                </div>

                {/* 5. CALL TO ACTION BUTTONS */}
                <div className="mt-16 flex flex-row items-center justify-center gap-3 md:gap-6 w-full max-w-2xl px-2">
                    <Button 
                        asChild
                        className="relative h-14 md:h-16 flex-1 group overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 border-none px-4 md:px-10 transition-all duration-500 hover:scale-105 active:scale-95 shadow-[0_15px_40px_rgba(37,99,235,0.4)]"
                    >
                        <Link href="/community/register" className="flex items-center justify-center gap-3">
                             <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-[30deg]" />
                             <Plus size={18} className="md:w-5 md:h-5" strokeWidth={4} />
                             <span className="text-white font-black text-[10px] md:text-sm uppercase tracking-wider md:tracking-widest drop-shadow-md">List Business</span>
                        </Link>
                    </Button>
                    
                    <Button 
                        asChild
                        variant="ghost"
                        className="h-14 md:h-16 flex-1 rounded-2xl bg-gradient-to-r from-purple-700/80 to-pink-600/80 border border-white/10 px-4 md:px-10 transition-all duration-500 hover:scale-105 active:scale-95 shadow-[0_15px_40px_rgba(147,51,234,0.4)]"
                    >
                        <Link href="/review" className="flex items-center justify-center gap-3">
                            <MessageSquare size={18} className="text-white md:w-5 md:h-5" />
                            <span className="text-white font-black text-[10px] md:text-sm uppercase tracking-wider md:tracking-widest drop-shadow-md">Share Review</span>
                        </Link>
                    </Button>
                </div>
            </motion.div>

            <style jsx global>{`
                .perspective-1000 {
                    perspective: 1000px;
                }
                .gradient-text {
                    background: linear-gradient(to right, #60a5fa, #22d3ee);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
            `}</style>
        </div>
    );
}

