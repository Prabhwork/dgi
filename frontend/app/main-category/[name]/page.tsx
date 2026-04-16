"use client";

import { useState, useEffect, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowRight, Loader2, Sparkles, ChevronLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/components/ThemeProvider";


function CategorySubcategories() {
    const params = useParams();
    const router = useRouter();
    const { theme } = useTheme();
    const categoryName = decodeURIComponent(params.name as string);
    
    const [subcategories, setSubcategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchSubcategories = async () => {
            setLoading(true);
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/main-subcategories?mainCategoryName=${encodeURIComponent(categoryName)}&limit=100`);
                const data = await res.json();
                if (data.success) {
                    setSubcategories(data.data);
                } else {
                    setError("No subcategories found for this category.");
                }
            } catch (err) {
                setError("Failed to connect to the server.");
            } finally {
                setLoading(false);
            }
        };

        if (categoryName) fetchSubcategories();
    }, [categoryName]);

    const isLight = theme === 'light';

    return (
        <div className={`min-h-screen relative transition-colors duration-500 overflow-hidden bg-background text-foreground`}>
            {/* Background elements */}
            <div className={`fixed inset-0 z-0`}>
              
            </div>

            <div className={`absolute top-0 inset-x-0 h-[600px] bg-gradient-to-b opacity-50 pointer-events-none z-0 ${
                isLight ? 'from-blue-100/50 to-transparent' : 'from-[#1a3a8f]/30 to-transparent'
            }`} />

            <div className="relative z-10 flex flex-col min-h-screen">
                <Navbar />
                
                <main className="container mx-auto px-4 pt-32 pb-20 flex-1">
                    {/* Hero Section */}
                    <div className="mb-16 text-center">
                        <motion.button
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            onClick={() => router.push('/')}
                            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 mb-8 font-bold text-sm uppercase tracking-widest transition-all"
                        >
                            <ChevronLeft size={16} /> Back to Home
                        </motion.button>
                        
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <h1 className="text-4xl md:text-7xl font-display font-black tracking-tight mb-4 text-foreground uppercase">
                                Explore <span className="gradient-text">{categoryName}</span>
                            </h1>
                            <div className="h-1 w-24 bg-primary mx-auto rounded-full mb-6 shadow-[0_0_15px_rgba(0,157,255,0.5)]" />
                            <p className="text-muted-foreground text-sm md:text-lg max-w-2xl mx-auto font-medium">
                                Select a specialty under <span className="text-primary font-bold">{categoryName}</span> to find the best verified businesses near you.
                            </p>
                        </motion.div>
                    </div>

                    {/* Subcategories Grid */}
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <Loader2 size={48} className="text-primary animate-spin" />
                            <p className="text-muted-foreground font-bold tracking-widest uppercase text-xs">Fetching Specialties...</p>
                        </div>
                    ) : error ? (
                        <div className="text-center py-20 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 max-w-lg mx-auto">
                            <Sparkles size={48} className="mx-auto text-primary/40 mb-4" />
                            <p className="text-foreground font-bold mb-6">{error}</p>
                            <button onClick={() => router.push('/')} className="px-8 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/80 transition-all">Go Back</button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6 px-1 sm:px-0">
                            {subcategories.map((sub, idx) => (
                                <motion.div
                                    key={sub._id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: idx * 0.05 }}
                                    onClick={() => router.push(`/search?mainCategory=${encodeURIComponent(categoryName)}&q=${encodeURIComponent(sub.name)}`)}
                                    className={`group relative p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] border transition-all duration-500 cursor-pointer overflow-hidden backdrop-blur-xl ${
                                        isLight 
                                            ? 'bg-white border-slate-200 hover:border-primary shadow-xl shadow-blue-900/5' 
                                            : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.08] hover:border-primary/50 shadow-2xl'
                                    }`}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    
                                    <div className="relative z-10 flex flex-col items-center text-center">

                                        <h3 className={`text-base sm:text-lg font-bold leading-tight mb-3 transition-colors ${
                                            isLight ? 'text-slate-900 group-hover:text-primary' : 'text-white group-hover:text-primary-foreground'
                                        }`}>
                                            {sub.name}
                                        </h3>
                                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground group-hover:text-primary transition-colors">
                                            View Listings <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </div>
                                    
                                    {/* Corner accent */}
                                    <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-bl-[4rem] transition-all duration-500 group-hover:bg-primary/20 group-hover:w-24 group-hover:h-24" />
                                </motion.div>
                            ))}
                        </div>
                    )}
                </main>
                
                <Footer />
            </div>
        </div>
    );
}

export default function CategoryPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#020631] flex items-center justify-center">
                <Loader2 size={40} className="text-primary animate-spin" />
            </div>
        }>
            <CategorySubcategories />
        </Suspense>
    );
}
