"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Search, MapPin, Star, Clock, Phone, Globe, ArrowRight, Loader2, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

function SearchResults() {
    const searchParams = useSearchParams();
    const query = searchParams.get("q") || "";
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");
    
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchResults = async () => {
            setLoading(true);
            try {
                let url = `${process.env.NEXT_PUBLIC_API_URL}/business/search?q=${encodeURIComponent(query)}`;
                if (lat && lng) {
                    url += `&lat=${lat}&lng=${lng}`;
                }
                
                const res = await fetch(url);
                const data = await res.json();
                
                if (data.success) {
                    setResults(data.data);
                } else {
                    setError(data.error || "Failed to fetch results");
                }
            } catch (err) {
                setError("Something went wrong. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [query, lat, lng]);

    return (
        <div className="min-h-screen bg-slate-950 text-white selection:bg-primary/30">
            <Navbar />
            
            <main className="container mx-auto px-4 pt-32 pb-20">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-3xl md:text-5xl font-display font-black tracking-tight mb-2">
                            Search <span className="gradient-text">Results</span>
                        </h1>
                        <p className="text-white/60">
                            {loading ? "Searching for the best businesses..." : `Found ${results.length} businesses for "${query}"`}
                        </p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <Button variant="outline-glow" className="gap-2 border-white/10 bg-white/5">
                            <Filter size={16} /> Filters
                        </Button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <Loader2 size={40} className="text-primary animate-spin" />
                        <p className="text-white/40 font-medium">Connecting you to local experts...</p>
                    </div>
                ) : error ? (
                    <div className="text-center py-20">
                        <p className="text-red-400 mb-4">{error}</p>
                        <Button onClick={() => window.location.reload()} className="bg-primary text-white hover:bg-primary/80">Try Again</Button>
                    </div>
                ) : results.length === 0 ? (
                    <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/10 border-dashed">
                        <Search size={48} className="mx-auto text-white/20 mb-4" />
                        <h3 className="text-xl font-bold mb-2">No results found</h3>
                        <p className="text-white/40 mb-6">Try adjusting your search keywords or location.</p>
                        <Button variant="outline-glow" onClick={() => window.history.back()}>Go Back</Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {results.map((item, idx) => (
                            <motion.div
                                key={item._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="group bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-primary/50 transition-all duration-500 hover:shadow-[0_8px_32px_rgba(0,120,255,0.1)] flex flex-col"
                            >
                                <div className="h-48 overflow-hidden relative">
                                    <img 
                                        src={item.coverImage ? `${(process.env.NEXT_PUBLIC_API_URL || '').replace('/api', '')}/${item.coverImage}` : '/assets/business-placeholder.jpg'} 
                                        alt={item.businessName}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                    <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 text-[10px] font-bold uppercase tracking-wider text-primary">
                                        {item.businessCategory}
                                    </div>
                                    {item.distance !== undefined && (
                                        <div className="absolute bottom-4 left-4 bg-primary px-3 py-1 rounded-full text-xs font-bold text-white shadow-lg">
                                            {item.distance < 1 ? `${(item.distance * 1000).toFixed(0)}m` : `${item.distance.toFixed(1)}km`} away
                                        </div>
                                    )}
                                </div>
                                
                                <div className="p-6 flex-1 flex flex-col">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-xl font-bold group-hover:text-primary transition-colors">{item.businessName}</h3>
                                        <div className="flex items-center gap-1 text-yellow-500">
                                            <Star size={14} fill="currentColor" />
                                            <span className="text-sm font-bold text-white">4.8</span>
                                        </div>
                                    </div>
                                    
                                    <p className="text-white/60 text-sm line-clamp-2 mb-4 flex-1">
                                        {item.description || "No description available for this business."}
                                    </p>
                                    
                                    <div className="space-y-2 mb-6">
                                        <div className="flex items-center gap-2 text-white/40 text-xs">
                                            <MapPin size={14} />
                                            <span className="truncate">{item.registeredOfficeAddress}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-white/40 text-xs">
                                            <Clock size={14} />
                                            <span>{item.openingTime} - {item.closingTime}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="flex gap-2">
                                        <Button variant="outline-glow" size="sm" className="flex-1 bg-white/5 border-white/10">
                                            <Phone size={14} className="mr-2" /> Call
                                        </Button>
                                        <Button size="sm" className="flex-1">
                                            View Details <ArrowRight size={14} className="ml-2" />
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </main>
            
            <Footer />
        </div>
    );
}

export default function SearchPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <Loader2 size={40} className="text-primary animate-spin" />
            </div>
        }>
            <SearchResults />
        </Suspense>
    );
}
