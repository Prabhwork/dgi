"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import Link from "next/link";

interface MainCategory {
    _id: string;
    name: string;
    description: string;
    image: string;
}

export default function MainCategories() {
    const [categories, setCategories] = useState<MainCategory[]>([
        {
            _id: "dummy",
            name: "Dummy Sector (Testing)",
            description: "If you see this, the UI and component are rendering correctly. The issue is likely the API connection.",
            image: "no-photo.jpg"
        }
    ]);
    const { theme } = useTheme();

    useEffect(() => {
        const fetchMainCategories = async () => {
            const API = process.env.NEXT_PUBLIC_API_URL;
            try {
                const res = await fetch(`${API}/main-categories`);
                const data = await res.json();
                if (data.success && data.data) {
                    setCategories(data.data.filter((c: any) => c.isActive !== false));
                }
            } catch (err) {
                console.error("Failed to fetch main categories:", err);
            }
        };

        fetchMainCategories();
    }, []);

    const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') ;
    return (
        <section className="py-24 relative overflow-hidden z-10 bg-[#020631]" id="main-categories">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <Sparkles className="text-primary w-5 h-5" />
                            <span className="text-xs font-bold uppercase tracking-[0.25em] text-primary/80">Premium Sectors</span>
                        </div>
                        <h2 className="text-4xl md:text-6xl font-display font-black tracking-tight leading-tight text-white">
                            Explore <span className="gradient-text">Main Sectors</span><br />
                            of Digital India
                        </h2>
                    </motion.div>
                    
                    <motion.p 
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="text-white/60 max-w-md text-sm sm:text-base leading-relaxed"
                    >
                        Access verified information across all major industries. From digital governance to local services, we connect you to the heart of Digital Bharat.
                    </motion.p>
                </div>

                {categories.length === 0 ? (
                    <div className="flex justify-center py-20">
                         <div className="animate-pulse flex flex-col items-center gap-4">
                            <div className="w-12 h-1 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                            <p className="text-white/40 font-medium">Connecting to Digital Directory...</p>
                         </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {categories.map((cat, i) => {
                            const catImg = cat.image?.startsWith('uploads') ? cat.image : `uploads/${cat.image}`;
                            const imageSrc = cat.image && cat.image !== 'no-photo.jpg' ? `${API_BASE}/${catImg}` : '/assets/placeholder-main.jpg';

                            return (
                                <motion.div
                                    key={cat._id}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                >
                                    <Link href={`/search?mainCategory=${encodeURIComponent(cat.name)}`}>
                                        <div className={`group relative h-[400px] rounded-[2.5rem] overflow-hidden border border-white/10 glass-strong transition-all duration-700 hover:scale-[1.02] hover:-translate-y-2 cursor-pointer ${
                                            theme === 'light' ? 'bg-white/40 border-slate-200' : 'bg-white/[0.02]'
                                        }`}>
                                            {/* Image Background */}
                                            <div className="absolute inset-0 z-0">
                                                <img 
                                                    src={imageSrc} 
                                                    alt={cat.name}
                                                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-60 grayscale group-hover:grayscale-0"
                                                />
                                                <div className={`absolute inset-0 bg-gradient-to-t from-[#020631] via-[#020631]/40 to-transparent transition-opacity duration-500 ${
                                                    theme === 'light' ? 'from-white via-white/40' : ''
                                                }`} />
                                            </div>

                                            {/* Content */}
                                            <div className="relative z-10 h-full p-8 flex flex-col justify-end">
                                                <div className="space-y-4">
                                                    <div className="w-12 h-1 bg-primary transform origin-left transition-all duration-500 group-hover:w-full" />
                                                    <h3 className="text-2xl font-display font-bold text-white group-hover:text-primary transition-colors">{cat.name}</h3>
                                                    <p className="text-sm text-white/60 line-clamp-2 transform translate-y-4 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                                                        {cat.description}
                                                    </p>
                                                    <div className="flex items-center gap-2 text-primary font-bold text-sm transform translate-y-8 opacity-0 transition-all duration-700 group-hover:translate-y-0 group-hover:opacity-100">
                                                        Explore Sector <ArrowRight size={16} />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Glass Specular */}
                                            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                                        </div>
                                    </Link>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </section>
    );
}
