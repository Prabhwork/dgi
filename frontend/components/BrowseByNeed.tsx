"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useRef, useEffect, useState } from "react";
import { useTheme } from "@/components/ThemeProvider";
import { useRouter } from "next/navigation";

export default function BrowseByNeed() {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [isInteracting, setIsInteracting] = useState(false);
    const { theme } = useTheme();
    const router = useRouter();
    const [categories, setCategories] = useState<any[]>([]);

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
                        .map((c: any) => ({
                            title: c.name,
                            img: c.image && c.image !== 'no-photo.jpg' 
                                ? `${BASE_URL}/${c.image.startsWith('uploads') ? c.image : 'uploads/' + c.image}` 
                                : '/assets/placeholder-category.jpg'
                        }));
                    setCategories(fetchedCats);
                }
            } catch (err) {
                console.error('Failed to fetch main categories:', err);
            }
        };

        fetchCategories();
    }, []);

    // Combined pool for smooth looping
    const allCategories = categories.length > 0 
        ? [...categories, ...categories, ...categories, ...categories]
        : [];

    useEffect(() => {
        const scrollContainer = scrollRef.current;
        if (!scrollContainer || isInteracting || allCategories.length === 0) return;

        let animationFrameId: number;

        const scroll = () => {
            if (scrollContainer) {
                if (scrollContainer.scrollLeft >= (scrollContainer.scrollWidth / 2)) {
                    scrollContainer.scrollLeft = 0;
                } else {
                    scrollContainer.scrollLeft += 1;
                }
            }
            animationFrameId = requestAnimationFrame(scroll);
        };

        animationFrameId = requestAnimationFrame(scroll);
        return () => cancelAnimationFrame(animationFrameId);
    }, [isInteracting, allCategories]);

    const handleScroll = (direction: 'left' | 'right') => {
        const scrollContainer = scrollRef.current;
        if (!scrollContainer) return;

        setIsInteracting(true);
        const scrollAmount = 400;
        scrollContainer.scrollBy({
            left: direction === 'left' ? -scrollAmount : scrollAmount,
            behavior: 'smooth'
        });

        setTimeout(() => setIsInteracting(false), 3000);
    };

    if (categories.length === 0) return null;

    return (
        <section className="pt-4 pb-10 overflow-hidden relative z-10 -mt-4" id="categories">
            <div className="container mx-auto px-4 mb-8 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                >
                    <span className={`rounded-full px-5 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] relative overflow-hidden backdrop-blur-2xl border border-solid transition-all duration-300 ${theme === 'light'
                        ? 'bg-white/80 border-blue-600 text-primary shadow-none'
                        : 'bg-white/10 border-white/30 text-white'}`}>
                        Explore categories
                    </span>
                    <h2 className="text-4xl sm:text-6xl font-display font-black text-foreground mt-4 tracking-tight">
                        Browse By <span className="gradient-text">Need</span>
                    </h2>
                    <p className="text-muted-foreground mt-2 max-w-2xl mx-auto text-sm sm:text-base">
                        Quickly find the most essential services in your location with our verified digital directory.
                    </p>
                </motion.div>
            </div>

            <div
                className="relative"
                onMouseEnter={() => setIsInteracting(true)}
                onMouseLeave={() => setIsInteracting(false)}
                onTouchStart={() => setIsInteracting(true)}
                onTouchEnd={() => setIsInteracting(false)}
                onTouchCancel={() => setIsInteracting(false)}
            >


                <div
                    ref={scrollRef}
                    className="flex gap-8 px-10 py-6 overflow-x-auto scrollbar-hide select-none cursor-grab active:cursor-grabbing"
                    style={{
                        scrollBehavior: isInteracting ? 'smooth' : 'auto',
                    }}
                >
                    {allCategories.map((cat, i) => (
                        <motion.div
                            key={`${cat.title}-${i}`}
                            whileHover={{ y: -15 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => router.push(`/main-category/${encodeURIComponent(cat.title)}`)}
                            className={`w-[280px] sm:w-[350px] flex-shrink-0 rounded-[2.5rem] cursor-pointer transition-all duration-500 group relative isolate overflow-hidden backdrop-blur-md border border-solid ${theme === 'light'
                                ? 'bg-white/60 border-blue-600/20 hover:border-blue-600/40 shadow-none'
                                : 'bg-white/[0.01] border-white/20 hover:bg-white/[0.05] hover:border-white/40 shadow-[0_4px_24px_rgba(0,0,0,0.2)] hover:shadow-[0_8px_32px_rgba(255,255,255,0.15)]'
                                }`}
                        >
                           
                            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-10" />

                            <div className="relative h-48 sm:h-64 overflow-hidden z-0">
                                <img
                                    src={cat.img}
                                    alt={cat.title}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    draggable={false}
                                />
                                {theme === 'dark' && (
                                    <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent transition-all z-10" />
                                )}
                            </div>
                            <div className="p-6 sm:p-8 -mt-6 relative z-20">
                                <div className="flex items-end justify-between">
                                    <div className="space-y-1">
                                        <p className={`text-[10px] font-black uppercase tracking-[0.25em] ${theme === 'light' ? 'text-primary/80' : 'text-primary'}`}>Services</p>
                                        <h3 className={`font-display font-bold text-xl sm:text-2xl transition-colors ${theme === 'light' ? 'text-slate-900 group-hover:text-primary' : 'text-foreground group-hover:text-primary'}`}>{cat.title}</h3>
                                    </div>
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 ${theme === 'light'
                                        ? 'bg-blue-600/10 border border-blue-600/20 text-blue-600 group-hover:bg-blue-600 group-hover:text-white shadow-none'
                                        : 'bg-muted border border-border text-foreground group-hover:bg-primary group-hover:border-primary group-hover:text-white group-hover:shadow-primary/40'
                                        }`}>
                                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-all" />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
