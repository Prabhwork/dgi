"use client";

import { motion, AnimatePresence, animate } from "framer-motion";
import { useEffect, useState } from "react";
import { Rocket, MessageSquare, TrendingUp, Plus, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useTheme } from "@/components/ThemeProvider";

export default function EmptyState() {
    const { theme } = useTheme();
    const isLight = theme === 'light';
    const [count, setCount] = useState(164);
    const [displayCount, setDisplayCount] = useState(164);
    const [increment, setIncrement] = useState<number | null>(null);

    // Initial "Realistic" Count Calculation (Persists across refreshes)
    useEffect(() => {
        // Base: 164 businesses on March 27, 2026 (Modern Calibration)
        // Growth: 1 business every 20 minutes (more methodical)
        const baseDate = new Date('2026-03-27T14:00:00').getTime();
        const now = Date.now();
        const elapsedMinutes = (now - baseDate) / (1000 * 60);
        const realisticBase = Math.floor(164 + (elapsedMinutes / 20));
        
        // Ensure it never goes backwards using localStorage (saved state)
        const savedCount = localStorage.getItem('dgi_growth_count');
        const finalBase = savedCount ? Math.max(parseInt(savedCount), realisticBase) : realisticBase;

        setCount(finalBase);
        setDisplayCount(finalBase);
    }, []);

    useEffect(() => {
        // Infinite loop for live growth simulation
        const interval = setInterval(() => {
            const inc = Math.floor(Math.random() * 2) + 1; // Random +1 to +2 (slower)
            setIncrement(inc);
            setCount(prev => {
                const next = prev + inc;
                // Sync to localStorage
                localStorage.setItem('dgi_growth_count', next.toString());
                return next;
            });
            
            // Clear the floating "+X" indicator after animation completes
            setTimeout(() => setIncrement(null), 2500);
        }, 15000 + Math.random() * 15000); // Slower random interval: 15-30 seconds

        return () => clearInterval(interval);
    }, []);

    // Smooth counting-up effect
    useEffect(() => {
        const controls = animate(displayCount, count, {
            duration: 3,
            ease: "easeOut",
            onUpdate: (latest) => setDisplayCount(Math.round(latest))
        });
        return controls.stop;
    }, [count]);

    return (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center max-w-5xl mx-auto min-h-[60vh]">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`relative p-10 md:p-24 rounded-[3rem] border border-solid shadow-2xl overflow-hidden backdrop-blur-[80px] transform-gpu transition-all duration-500 ${
                    isLight 
                        ? 'bg-white/20 border-white shadow-blue-500/10' 
                        : 'bg-white/5 border-white/5 shadow-black/50'
                }`}
            >
                {/* Decorative background glows */}
                
                
                {/* Tech grid overlay effect */}
                <div className={`absolute inset-0 opacity-[0.03] pointer-events-none [background-image:radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px] ${isLight ? 'invert' : ''}`} />

                <motion.div 
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.8 }}
                    className="relative z-10"
                >
                    {/* Floating Orb Icon */}
                    

                    <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight text-foreground leading-[1.1] font-display">
                        We’re building <span className="gradient-text">something amazing</span>
                    </h2>
                    
                    <p className="text-muted-foreground text-lg mb-6 max-w-xl mx-auto leading-relaxed font-medium">
                        We are currently onboarding businesses in this category. 
                        Be among the first to explore and grow with us.
                    </p>

                    <div className="mb-12 flex items-center justify-center">
                        <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl border font-bold text-sm shadow-xl transition-all ${
                            isLight ? 'bg-blue-50 border-blue-100 text-blue-600 shadow-blue-500/5' : 'bg-primary/10 border-primary/20 text-primary shadow-primary/5'
                        }`}>
                             <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                             Official Launch: <span className={isLight ? 'text-blue-700 font-black' : 'text-white font-black'}>May 1st</span> | Accepting New Listings Now
                        </span>
                    </div>

                    {/* Animated Counter Section with Startup Vibe */}
                    <div className="mb-14 p-8 rounded-3xl bg-white/5 border border-white/5 backdrop-blur-xl relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                        
                        <p className="text-[10px] uppercase tracking-[0.4em] font-black text-primary mb-6 opacity-70">
                            Businesses onboarded so far
                        </p>
                        
                        <div className="flex flex-col items-center">
                            <div className="relative inline-flex items-center">
                                <motion.span 
                                    animate={{ scale: increment ? [1, 1.2, 1] : 1 }}
                                    transition={{ duration: 0.4 }}
                                    className="text-5xl md:text-6xl font-display font-black tracking-tighter text-foreground"
                                >
                                    {displayCount}
                                </motion.span>
                                
                                <AnimatePresence>
                                    {increment && (
                                        <motion.div
                                            initial={{ y: 10, opacity: 0, scale: 0, x: "-50%" }}
                                            animate={{ y: -65, opacity: 1, scale: 1.1, x: "-50%" }}
                                            exit={{ y: -90, opacity: 0, scale: 0.8, x: "-50%" }}
                                            transition={{ type: "spring", stiffness: 400, damping: 15 }}
                                            className="absolute left-1/2 bg-emerald-500 text-white text-xl font-black px-4 py-1.5 rounded-full shadow-[0_8px_30px_rgba(16,185,129,0.5)] flex items-center gap-1 z-[60] border-2 border-white/30"
                                        >
                                            <Plus size={20} strokeWidth={4} /> {increment}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Live Growth Metric */}
                            <div className="mt-8 flex items-center gap-4 text-xs font-bold">
                                <span className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${
                                    isLight ? 'bg-blue-50 border-blue-100 text-blue-600' : 'bg-primary/10 border-primary/20 text-primary'
                                } shadow-lg shadow-primary/5`}>
                                    <TrendingUp size={14} className="animate-pulse" />
                                    Live Platform Growth
                                </span>
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                            </div>
                        </div>
                    </div>

                    {/* CTA Section - Premium Buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
                        <Button 
                            asChild
                            variant="default"
                            size="lg"
                            className={`w-full sm:w-auto px-10 h-14 rounded-2xl font-bold text-sm uppercase tracking-wider group border-none transition-all duration-300 shadow-lg ${
                                isLight 
                                    ? "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-600/20" 
                                    : "bg-primary text-white hover:bg-primary/90 shadow-primary/20"
                            }`}
                        >
                            <Link href="/community/register" className="flex items-center gap-2">
                                List Your Business
                                
                            </Link>
                        </Button>
                        
                        <Button 
                            asChild
                            variant="ghost"
                            size="lg"
                            className={`w-full sm:w-auto px-10 h-14 rounded-2xl font-bold text-sm uppercase tracking-wider transition-all border border-solid group ${
                                isLight 
                                    ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50' 
                                    : 'bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/30'
                            }`}
                        >
                            <Link href="/review" className="flex items-center gap-2">
                                <MessageSquare size={18} className="group-hover:scale-110 transition-transform" />
                                Share Review
                            </Link>
                        </Button>
                    </div>
                </motion.div>
                
                {/* Decorative background orbs */}
                <div className="absolute top-[10%] left-[5%] w-24 h-24 bg-primary/20 blur-3xl animate-pulse delay-700" />
                <div className="absolute bottom-[10%] right-[5%] w-32 h-32 bg-purple-500/20 blur-3xl animate-pulse" />
            </motion.div>
        </div>
    );
}
