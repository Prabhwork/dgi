"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, Store, CheckCircle2, Compass, ChevronDown, Loader2, Trophy, TrendingUp, Zap } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { useRouter } from "next/navigation";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import dynamic from "next/dynamic";

const MiniGlobe = dynamic(() => import("./MiniGlobe"), { ssr: false });

export default function HeroSection() {
    const { theme } = useTheme();
    const router = useRouter();
    const [locationInput, setLocationInput] = useState("");
    const [detectedLocation, setDetectedLocation] = useState("");
    const [isLocating, setIsLocating] = useState(false);
    const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
    const [allCategories, setAllCategories] = useState<any[]>([]);
    const [currentSet, setCurrentSet] = useState(0);
    const mobileScrollRef = useRef<HTMLDivElement>(null);
    const [isInteractingMobile, setIsInteractingMobile] = useState(false);

    useEffect(() => {
        const fetchCategories = async () => {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
            const BASE_URL = API_URL.replace('/api', '');
            try {
                const res = await fetch(`${API_URL}/main-categories?sort=createdAt&limit=100`);
                const data = await res.json();
                if (data.success && data.data) {
                    const fetchedCats = data.data
                        .filter((c: any) => c.isActive !== false)
                        .map((c: any, i: number) => {
                            const catImg = c.image?.startsWith('uploads') ? c.image : `uploads/${c.image}`;
                            const imgSrc = c.image && c.image !== 'no-photo.jpg' 
                                ? `${BASE_URL}/${catImg}` 
                                : '/assets/placeholder-main.jpg';

                            return {
                                name: c.name,
                                img: imgSrc,
                                delay: i * 0.1
                            };
                        });
                    setAllCategories(fetchedCats);
                }
            } catch (err) {
                console.error('Failed to fetch hero main-categories:', err);
            }
        };

        fetchCategories();
    }, []);

    // Hybrid Mobile Scroll Logic
    useEffect(() => {
        const scrollContainer = mobileScrollRef.current;
        if (!scrollContainer || isInteractingMobile || allCategories.length === 0) return;

        let animationFrameId: number;
        const scroll = () => {
            if (scrollContainer) {
                if (scrollContainer.scrollLeft >= (scrollContainer.scrollWidth / 2)) {
                    scrollContainer.scrollLeft = 0;
                } else {
                    scrollContainer.scrollLeft += 0.8; // Smooth slow glide
                }
            }
            animationFrameId = requestAnimationFrame(scroll);
        };

        animationFrameId = requestAnimationFrame(scroll);
        return () => cancelAnimationFrame(animationFrameId);
    }, [isInteractingMobile, allCategories]);

    useEffect(() => {
        if (allCategories.length <= 8) return;

        const interval = setInterval(() => {
            setCurrentSet((prev) => {
                const totalSets = Math.ceil(allCategories.length / 8);
                return (prev + 1) % totalSets;
            });
        }, 5000);

        return () => clearInterval(interval);
    }, [allCategories]);

    const startIdx = currentSet * 8;
    const visibleSlice = allCategories.slice(startIdx, startIdx + 8);
    const leftCategories = visibleSlice.slice(0, 4);
    const rightCategories = visibleSlice.slice(4, 8);

    const handleSearch = () => {
        let url = `/search?q=${encodeURIComponent(locationInput)}`;
        if (userCoords) {
            url += `&lat=${userCoords.lat}&lng=${userCoords.lng}`;
        }
        router.push(url);
    };

    useEffect(() => {
        const autoLocate = async () => {
            if (!navigator.geolocation) return;

            setIsLocating(true);
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    setUserCoords({ lat: latitude, lng: longitude });

                    try {
                        const response = await fetch(
                            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`
                        );
                        const data = await response.json();
                        // Extract city/town/village
                        const address = data.address;
                        const locationName = address.city || address.town || address.village || address.state || "Detected Location";
                        setDetectedLocation(locationName);
                    } catch (err) {
                        console.error("Auto-location name fetch failed:", err);
                    } finally {
                        setIsLocating(false);
                    }
                },
                (err) => {
                    console.error("Auto-location permission/fetch failed:", err);
                    setIsLocating(false);
                },
                { enableHighAccuracy: false, timeout: 5000 }
            );
        };

        autoLocate();
    }, []);

    // Double categories for infinite loop
    const mobilePool = [...allCategories, ...allCategories];

    return (
        <section className="relative min-h-screen flex flex-col overflow-hidden" id="home">

            {/* Top bar */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="relative z-20 mt-24 sm:mt-32 lg:mt-24 px-4"
            >
                <div className="container mx-auto flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-0 w-full sm:w-auto sm:flex-1 sm:max-w-md group">
                        <div className={`flex items-center flex-1 backdrop-blur-md border rounded-l-lg px-3 py-2.5 transition-all ${theme === 'light'
                            ? 'bg-white/80 border-slate-200 group-hover:border-primary/50'
                            : 'bg-black/40 border-white/20 group-hover:border-primary/50'
                            }`}>
                            <input
                                type="text"
                                placeholder={isLocating ? "Detecting location..." : (detectedLocation ? `Near ${detectedLocation}` : "Search near you...")}
                                value={locationInput}
                                onChange={(e) => setLocationInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                suppressHydrationWarning
                                className={`bg-transparent text-sm outline-none w-full ${theme === 'light'
                                    ? 'text-slate-900 placeholder:text-slate-400'
                                    : 'text-white placeholder:text-white/60'
                                    }`}
                            />
                            {isLocating ? (
                                <Loader2 size={18} className="text-primary animate-spin ml-2 shrink-0" />
                            ) : (
                                <Search 
                                    size={18} 
                                    className={`${theme === 'light' ? 'text-slate-400' : 'text-white'} ml-2 shrink-0 cursor-pointer hover:text-primary transition-colors`} 
                                    onClick={handleSearch}
                                />
                            )}
                        </div>
                        <Link 
                            href="/nearby-map"
                            className="flex items-center gap-1.5 bg-primary text-white px-5 py-2.5 rounded-r-lg text-sm font-bold hover:bg-primary/80 transition-all whitespace-nowrap shadow-lg shadow-primary/20"
                        >
                            <MapPin size={15} />
                            <span className="hidden sm:inline">See On Map</span>
                            <span className="sm:hidden">Map</span>
                        </Link>
                    </div>
                    {/* Quick links — visible on all screens */}
                    <div className="flex items-center justify-center sm:justify-end gap-3 sm:gap-5 text-[10px] sm:text-sm text-foreground w-full md:w-auto">

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button 
                                    suppressHydrationWarning
                                    className="flex items-center gap-1 hover:text-primary transition-colors whitespace-nowrap outline-none"
                                >
                                    DBI for Business <ChevronDown size={14} />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className={`border border-solid p-2 min-w-[240px] z-[60] shadow-[0_8px_32px_rgba(0,0,0,0.2)] backdrop-blur-2xl ${theme === 'light' ? 'bg-white/60 border-white/80' : 'bg-white/10 border-white/30'}`}>
                                <DropdownMenuItem className="focus:bg-primary/20 focus:text-white cursor-pointer py-3 rounded-lg group" asChild>
                                    <Link href="/success-stories" className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                            <Trophy size={18} className="text-primary" />
                                        </div>
                                        <span className="font-medium">Success Stories</span>
                                    </Link>
                                </DropdownMenuItem>

                                <DropdownMenuItem className="focus:bg-primary/20 focus:text-white cursor-pointer py-3 rounded-lg group" asChild>
                                    <Link href="/listing-benefits" className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                            <TrendingUp size={18} className="text-primary" />
                                        </div>
                                        <span className="font-medium">Listing Benefits</span>
                                    </Link>
                                </DropdownMenuItem>

                                <DropdownMenuItem className="focus:bg-primary/20 focus:text-white cursor-pointer py-3 rounded-lg group" asChild>
                                    <Link href="/mapping-plans" className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                            <Zap size={18} className="text-primary" />
                                        </div>
                                        <span className="font-medium">Business Plans</span>
                                    </Link>
                                </DropdownMenuItem>

                                <div className="h-px bg-white/10 my-1 px-2" />
                                <DropdownMenuItem className="focus:bg-primary/20 focus:text-white cursor-pointer py-3 rounded-lg group" asChild>
                                    <Link href="/why-dbi" className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                            <Compass size={18} className="text-primary" />
                                        </div>
                                        <span className="font-medium">Why Choose DBI</span>
                                    </Link>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <Link href="/community/register" className={`backdrop-blur-md border px-3 py-1.5 rounded-lg transition-all font-medium whitespace-nowrap text-[11px] sm:text-sm ${theme === 'light'
                            ? 'bg-primary/5 border-primary/20 text-primary hover:bg-primary/10'
                            : 'bg-white/5 border-white/10 text-accent hover:text-accent/80 hover:bg-white/10'
                            }`}>
                            claim business just 1/- a day
                        </Link>

                        <Link 
                            href="/write-a-review"
                            className="hover:text-primary transition-colors whitespace-nowrap outline-none"
                        >
                            Write a Review
                        </Link>


                    </div>
                </div>
            </motion.div>

            {/* Main hero content */}
            <div className="relative z-10 flex-1 flex items-center justify-center px-1 sm:px-4 py-3 sm:py-8">
                <div className="w-full max-w-[1400px] mx-auto flex flex-col lg:flex-row items-center justify-center lg:justify-between gap-1 sm:gap-6 lg:gap-x-16">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={`left-${currentSet}`}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.5 }}
                            className="hidden lg:grid grid-cols-2 gap-x-12 gap-y-5 shrink-0"
                        >
                            {leftCategories.map((cat, i) => (
                                <motion.div
                                    key={cat.name}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: i * 0.1, duration: 0.3 }}
                                    onClick={() => router.push(`/search?mainCategory=${encodeURIComponent(cat.name)}`)}
                                    className={`rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:scale-110 transition-all duration-700 w-[140px] h-[130px] group relative overflow-hidden backdrop-blur-md border border-solid ${theme === 'light'
                                        ? 'bg-white border-slate-200 hover:border-primary/40 shadow-xl'
                                        : 'bg-white/[0.02] border-white/10 hover:bg-white/[0.08] hover:border-primary/50 shadow-2xl'
                                        }`}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                                    <div className={`w-14 h-14 rounded-full overflow-hidden mb-2 border-[1.5px] transition-transform duration-500 group-hover:-translate-y-1 shadow-[0_0_15px_rgba(255,255,255,0.1)] relative z-10 ${theme === 'light' ? 'border-primary/30' : 'border-white/40 group-hover:border-white/80'}`}>
                                        <img src={cat.img} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                    </div>
                                    <p className={`text-[11px] font-bold text-center transition-colors z-10 ${theme === 'light' ? 'text-slate-900 group-hover:text-primary' : 'text-white/80 group-hover:text-white'}`}>
                                        {cat.name}
                                    </p>
                                </motion.div>
                            ))}
                        </motion.div>
                    </AnimatePresence>

                    {/* Center portal — Globe */}
                    <div className="w-full flex flex-col items-center text-center mt-8 sm:mt-0">
                        <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="relative w-72 h-72 sm:w-[300px] sm:h-[300px] md:w-[340px] md:h-[340px] lg:w-[420px] lg:h-[420px] rounded-full mt-6 sm:mt-0 overflow-hidden"
                        >
                            {/* Rotating Globe fills the circle */}
                            <div className="absolute inset-0">
                                <MiniGlobe />
                            </div>

                            {/* Text overlay on top of globe */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none select-none px-3">
                                <motion.h1
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5, duration: 0.8 }}
                                    className="text-3xl sm:text-4xl md:text-5xl font-display font-black text-white tracking-[0.2em] leading-tight uppercase"
                                    style={{ 
                                        textShadow: "0 0 40px rgba(0,157,255,0.6), 0 0 80px rgba(0,157,255,0.3)",
                                        letterSpacing: "0.25em"
                                    }}
                                >
                                    PRE 
                                    LAUNCH
                                </motion.h1>
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.8 }}
                                    className="mt-2 text-xs sm:text-sm font-bold tracking-[0.3em] uppercase opacity-90"
                                    style={{ color: "#00d4ff", textShadow: "0 0 20px rgba(0,212,255,0.5)" }}
                                >
                                    Prepared To Be Amazed!!
                                </motion.p>
                                <motion.div
                                    initial={{ scaleX: 0 }}
                                    animate={{ scaleX: 1 }}
                                    transition={{ delay: 1, duration: 1 }}
                                    className="h-[1px] w-24 bg-gradient-to-r from-transparent via-[#00d4ff]/50 to-transparent my-3"
                                />
                                <motion.p
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 1.2 }}
                                    className="font-medium max-w-[180px] sm:max-w-[240px] md:max-w-[300px] mx-auto text-[10px] sm:text-xs leading-relaxed opacity-80"
                                    style={{ color: "#ffffff", textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}
                                >
                                    Digital Book Of India is on its way to make your way of living more easier..stay tuned.
                                </motion.p>

                                {/* Swadeshi Platform Badge */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    transition={{ delay: 1.2, duration: 0.8 }}
                                    className="relative mt-4 sm:mt-8 px-4 sm:px-6 py-2 sm:py-3 rounded-2xl flex items-center gap-2 sm:gap-4 group outline outline-1 outline-white/10"
                                >
                                    {/* Frosted glass background */}
                                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xl rounded-2xl border border-white/10 transition-all duration-500 group-hover:bg-slate-900/60 group-hover:scale-105" />
                                
                                <div className="relative flex items-center gap-2 sm:gap-4">
                                    {/* Inner glow effect */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 via-white/5 to-green-500/5 opacity-50" />
                                    
                                    {/* Swadeshi Logo with Blending */}
                                    <div className="relative w-8 h-8 sm:w-12 sm:h-12 flex items-center justify-center shrink-0">
                                        <img 
                                            src="/assets/swadeshi-logo-dark.png" 
                                            alt="Swadeshi" 
                                            className="w-full h-full object-contain mix-blend-screen" 
                                            onError={(e) => (e.currentTarget.style.display = 'none')}
                                        />
                                    </div>

                                    <span className="relative text-[9px] sm:text-[11px] font-black uppercase tracking-[0.1em] sm:tracking-[0.15em] text-white whitespace-nowrap pointer-events-none">
                                        Swadeshi Platform
                                    </span>
                                </div>
                            </motion.div>
                            </div>
                        </motion.div>

                        {/* Mobile category hybrid scroll strip */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.5 }}
                            className="flex lg:hidden mt-8 w-full overflow-hidden"
                        >
                            <div
                                ref={mobileScrollRef}
                                onTouchStart={() => setIsInteractingMobile(true)}
                                onTouchEnd={() => setTimeout(() => setIsInteractingMobile(false), 3000)}
                                onPointerDown={() => setIsInteractingMobile(true)}
                                onPointerUp={() => setTimeout(() => setIsInteractingMobile(false), 3000)}
                                className="flex w-full overflow-x-auto scrollbar-hide px-6 gap-4 select-none cursor-grab active:cursor-grabbing"
                            >
                                {mobilePool.map((cat, i) => (
                                    <div
                                        key={`${cat.name}-${i}`}
                                        onClick={() => router.push(`/search?mainCategory=${encodeURIComponent(cat.name)}`)}
                                        className={`flex-shrink-0 flex flex-col items-center justify-center p-4 rounded-[2rem] border transition-all duration-300 cursor-pointer w-[150px] h-[150px] relative overflow-hidden backdrop-blur-md ${theme === 'light'
                                            ? 'bg-white border-blue-600/30 text-slate-900 active:scale-95 shadow-lg'
                                            : 'bg-white/5 border-white/20 text-white active:scale-95 shadow-2xl'
                                            }`}
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 active:opacity-100 pointer-events-none transition-opacity" />

                                        <div className={`w-14 h-14 rounded-full overflow-hidden mb-2.5 border-[1.5px] shadow-[0_0_15px_rgba(255,255,255,0.1)] relative z-10 ${theme === 'light' ? 'border-primary/30' : 'border-white/40'}`}>
                                            <img src={cat.img} alt={cat.name} className="w-full h-full object-cover" />
                                        </div>
                                        <p className="text-[11px] font-black text-center transition-colors z-10 uppercase tracking-wider">
                                            {cat.name}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={`right-${currentSet}`}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.5 }}
                            className="hidden lg:grid grid-cols-2 gap-x-12 gap-y-5 shrink-0"
                        >
                            {rightCategories.map((cat, i) => (
                                <motion.div
                                    key={cat.name}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: i * 0.1, duration: 0.3 }}
                                    onClick={() => router.push(`/search?mainCategory=${encodeURIComponent(cat.name)}`)}
                                    className={`rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:scale-110 transition-all duration-700 w-[140px] h-[130px] group relative overflow-hidden backdrop-blur-md border border-solid ${theme === 'light'
                                        ? 'bg-white border-slate-200 hover:border-primary/40 shadow-xl'
                                        : 'bg-white/[0.02] border-white/10 hover:bg-white/[0.08] hover:border-primary/50 shadow-2xl'
                                        }`}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                                    <div className={`w-14 h-14 rounded-full overflow-hidden mb-2 border-[1.5px] transition-transform duration-500 group-hover:-translate-y-1 shadow-[0_0_15px_rgba(255,255,255,0.1)] relative z-10 ${theme === 'light' ? 'border-primary/30' : 'border-white/40 group-hover:border-white/80'}`}>
                                        <img src={cat.img} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                    </div>
                                    <p className={`text-[11px] font-bold text-center transition-colors z-10 ${theme === 'light' ? 'text-slate-900 group-hover:text-primary' : 'text-white/80 group-hover:text-white'}`}>
                                        {cat.name}
                                    </p>
                                </motion.div>
                            ))}
                        </motion.div>
                    </AnimatePresence>

                </div>
            </div>

        </section>
    );
}
