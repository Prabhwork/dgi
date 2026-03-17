"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Search, MapPin, Star, Clock, Phone, Globe, ArrowRight, Loader2, Filter, BadgeCheck, MessageCircle, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { useTheme } from "@/components/ThemeProvider";
import ParticleNetwork from "@/components/ParticleNetwork";
import Link from "next/link";

function CardImageSlider({ item }: { item: any }) {
    const images = [item.coverImage, ...(item.gallery || [])].filter(Boolean);
    const hasImages = images.length > 0;
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (images.length > 1) {
            const timer = setInterval(() => {
                setCurrentIndex((prev) => (prev + 1) % images.length);
            }, 3000);
            return () => clearInterval(timer);
        }
    }, [images.length]);

    if (!hasImages) {
         return (
             <img 
                src='/assets/business-placeholder.jpg'
                alt={item.businessName || 'Business'}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
         );
    }

    const imageBaseUrl = (process.env.NEXT_PUBLIC_API_URL || '').replace('/api', '');

    return (
        <div className="w-full h-full relative overflow-hidden">
            {images.map((img, index) => (
                <img 
                    key={`${index}-${img}`}
                    src={`${imageBaseUrl}/${img}`} 
                    alt={item.businessName || 'Business Image'}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 group-hover:scale-110 ${index === currentIndex ? 'opacity-100' : 'opacity-0'}`}
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = '/assets/business-placeholder.jpg';
                    }}
                />
            ))}
            {/* Indicators */}
            {images.length > 1 && (
                <div className="absolute top-4 left-0 right-0 flex justify-center gap-1.5 z-10 pointer-events-none">
                    {images.map((_, idx) => (
                        <div 
                            key={idx} 
                            className={`h-1 rounded-full transition-all duration-300 shadow-sm ${idx === currentIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/50'}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

function SearchResults() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { theme } = useTheme();
    
    // URL params
    const initialQuery = searchParams.get("q") || "";
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");
    const categoryParam = searchParams.get("mainCategory") || searchParams.get("category") || "";
    
    // State
    const [searchInput, setSearchInput] = useState(initialQuery);
    const [categoryInput, setCategoryInput] = useState(categoryParam);
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [isLocating, setIsLocating] = useState(false);

    const fetchResults = async (q: string, cat: string) => {
        setLoading(true);
        try {
            let url = `${process.env.NEXT_PUBLIC_API_URL}/business/search?`;
            const params = new URLSearchParams();
            if (q) params.append("q", q);
            if (cat) params.append("category", cat);
            if (lat && lng) {
                params.append("lat", lat);
                params.append("lng", lng);
            }
            
            const res = await fetch(url + params.toString());
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

    useEffect(() => {
        fetchResults(initialQuery, categoryParam);
        setSearchInput(initialQuery);
        setCategoryInput(categoryParam);
    }, [initialQuery, categoryParam, lat, lng]);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const params = new URLSearchParams();
        if (searchInput) params.append("q", searchInput);
        if (categoryInput) params.append("mainCategory", categoryInput);
        if (lat && lng) {
            params.append("lat", lat as string);
            params.append("lng", lng as string);
        }
        router.push(`/search?${params.toString()}`);
    };

    const handleLocateMe = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser");
            return;
        }
        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const params = new URLSearchParams();
                if (searchInput) params.append("q", searchInput);
                if (categoryInput) params.append("mainCategory", categoryInput);
                params.append("lat", position.coords.latitude.toString());
                params.append("lng", position.coords.longitude.toString());
                router.push(`/search?${params.toString()}`);
                setIsLocating(false);
            },
            () => {
                alert("Unable to retrieve your location. Please check browser permissions.");
                setIsLocating(false);
            }
        );
    };

    const isLight = theme === 'light';

    return (
        <div className={`min-h-screen relative transition-colors duration-500 overflow-hidden ${
            isLight ? 'bg-slate-50' : 'bg-[#020631]'
        }`}>
            {/* Background elements */}
            <div className={`absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b opacity-50 pointer-events-none transition-colors duration-500 ${
                isLight ? 'from-blue-100/50 to-transparent' : 'from-[#1a3a8f]/20 to-transparent'
            }`} />
            
            <div className="fixed inset-0 z-0">
                <ParticleNetwork />
            </div>

            <div className="relative z-10 flex flex-col min-h-screen">
                <Navbar />
                
                <main className="container mx-auto px-4 pt-32 pb-20 flex-1">
                    {/* Search & Filter Top Bar */}
                    <div className="mb-12 max-w-4xl mx-auto">
                        <div className="mb-6 text-center">
                            <h1 className="text-3xl md:text-5xl font-display font-black tracking-tight mb-3 text-foreground">
                                Discover <span className="gradient-text">Businesses</span>
                            </h1>
                            <p className="text-muted-foreground">
                                {loading ? "Searching for the best businesses..." : `Found ${results.length} businesses matching your criteria`}
                            </p>
                        </div>

                        <form onSubmit={handleSearchSubmit} className={`p-2 rounded-2xl flex flex-col md:flex-row gap-2 backdrop-blur-xl border shadow-xl ${
                            isLight ? 'bg-white/80 border-white shadow-blue-900/5' : 'bg-white/5 border-white/10 shadow-black/50'
                        }`}>
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                                <Input 
                                    value={searchInput}
                                    onChange={(e) => setSearchInput(e.target.value)}
                                    placeholder="Search by name, description, or keywords..." 
                                    className={`pl-10 pr-12 border-0 shadow-none focus-visible:ring-0 ${isLight ? 'bg-transparent text-slate-900' : 'bg-transparent text-white'}`}
                                />
                                <button
                                    type="button"
                                    onClick={handleLocateMe}
                                    title="Search Near Me"
                                    disabled={isLocating}
                                    className={`absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-md transition-colors ${
                                        lat && lng ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:bg-slate-100 dark:hover:bg-white/10'
                                    }`}
                                >
                                    {isLocating ? <Loader2 size={16} className="animate-spin" /> : <Navigation size={16} className={lat && lng ? "fill-primary/20" : ""} />}
                                </button>
                            </div>

                            <Button type="submit" className="md:w-32 bg-primary text-white hover:bg-primary/90 h-10 rounded-xl">
                                Search
                            </Button>
                        </form>
                    </div>

                    {/* Results Grid */}
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <Loader2 size={40} className="text-primary animate-spin" />
                            <p className="text-muted-foreground font-medium">Connecting you to local experts...</p>
                        </div>
                    ) : error ? (
                        <div className="text-center py-20">
                            <p className="text-red-500 mb-4">{error}</p>
                            <Button onClick={() => window.location.reload()} className="bg-primary text-white hover:bg-primary/90">Try Again</Button>
                        </div>
                    ) : results.length === 0 ? (
                        <div className={`text-center py-20 rounded-3xl border border-dashed backdrop-blur-md ${isLight ? 'bg-white/60 border-slate-300' : 'bg-white/5 border-white/10'}`}>
                            <Search size={48} className="mx-auto text-muted-foreground mb-4 opacity-50" />
                            <h3 className="text-xl font-bold mb-2 text-foreground">No matches found</h3>
                            <p className="text-muted-foreground mb-6">Try adjusting your search terms or filters.</p>
                            <Button onClick={() => router.push('/search')} variant={isLight ? 'default' : 'outline-glow'}>Clear Filters</Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {results.map((item, idx) => (
                                <motion.div
                                    key={item._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className={`group flex flex-col rounded-3xl overflow-hidden backdrop-blur-xl border border-solid transition-all duration-500 hover:-translate-y-1 ${
                                        isLight 
                                            ? 'bg-white/80 border-slate-200 hover:border-primary/40 hover:shadow-[0_12px_40px_rgba(37,99,235,0.1)]' 
                                            : 'bg-white/5 border-white/10 hover:border-primary/50 hover:shadow-[0_12px_40px_rgba(0,120,255,0.15)]'
                                    }`}
                                >
                                    {/* Card Header Image */}
                                    <div className="h-48 overflow-hidden relative">
                                        <CardImageSlider item={item} />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />
                                        
                                        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                                            <div>
                                                <h3 className="text-xl font-bold text-white leading-tight mb-1 truncate drop-shadow-md">
                                                    {item.brandName || item.businessName}
                                                </h3>
                                                {(item.isVerified || item.aadhaarVerified || item.approvalStatus === 'approved') && (
                                                    <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium bg-black/40 w-fit px-2 py-0.5 rounded-full backdrop-blur-sm border border-emerald-500/30">
                                                        <BadgeCheck size={14} className="fill-emerald-500 text-black" />
                                                        Verified
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Card Body */}
                                    <div className="p-5 flex-1 flex flex-col">
                                        
                                        <div className="space-y-3 mb-5">
                                            <div className="flex items-start gap-2.5 text-sm text-muted-foreground group/loc">
                                                <MapPin size={16} className="mt-0.5 shrink-0 text-primary group-hover/loc:text-primary transition-colors" />
                                                <span className="line-clamp-2 leading-relaxed">{item.registeredOfficeAddress || 'No address provided'}</span>
                                            </div>
                                            <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                                                <Clock size={16} className="shrink-0 text-slate-400" />
                                                <span className="font-medium">
                                                    {(() => {
                                                        const formatTime = (timeStr: string) => {
                                                            if (!timeStr) return '';
                                                            const [hours, minutes] = timeStr.split(':');
                                                            const h = parseInt(hours, 10);
                                                            const ampm = h >= 12 ? 'PM' : 'AM';
                                                            const h12 = h % 12 || 12;
                                                            return `${h12.toString().padStart(2, '0')}:${minutes} ${ampm}`;
                                                        };
                                                        return `${formatTime(item.openingTime || '09:00')} - ${formatTime(item.closingTime || '18:00')}`;
                                                    })()}
                                                </span>
                                                {item.weeklyOff && item.weeklyOff.toLowerCase() !== 'none' && (
                                                    <span className="text-xs bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400 px-2 py-0.5 rounded-full ml-auto">
                                                        Closed {item.weeklyOff}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <p className="text-sm text-muted-foreground line-clamp-2 mb-6 flex-1">
                                            {item.description || "No description available for this business."}
                                        </p>
                                        
                                        {/* Action Buttons */}
                                        <div className="grid grid-cols-2 gap-2 mb-3">
                                            <a 
                                                href={`tel:${item.primaryContactNumber}`}
                                                className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded-xl text-sm font-bold transition-colors shadow-sm shadow-emerald-500/20"
                                            >
                                                <Phone size={16} /> Call
                                            </a>
                                            <a 
                                                href={`https://wa.me/${item.officialWhatsAppNumber || item.primaryContactNumber}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={`flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-bold transition-all shadow-sm border ${
                                                    isLight 
                                                        ? 'bg-white text-emerald-600 border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300' 
                                                        : 'bg-white/5 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/10 hover:border-emerald-500/40'
                                                }`}
                                            >
                                                <MessageCircle size={16} /> WhatsApp
                                            </a>
                                        </div>
                                        
                                        <div className="grid grid-cols-2 gap-2">
                                            <a 
                                                href={`https://maps.google.com/?q=${item.gpsCoordinates?.lat || ''},${item.gpsCoordinates?.lng || ''}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={`flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-bold transition-all shadow-sm border ${
                                                    isLight 
                                                        ? 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100/50 hover:border-blue-300' 
                                                        : 'bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20 hover:border-blue-500/40'
                                                }`}
                                            >
                                                <MapPin size={16} /> Location
                                            </a>
                                            <Link 
                                                href={`/business/${item._id}`}
                                                className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-bold transition-all shadow-sm border ${
                                                    isLight 
                                                        ? 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200/50' 
                                                        : 'bg-white/5 text-white border-white/10 hover:bg-white/10'
                                                }`}
                                            >
                                                Details <ArrowRight size={14} />
                                            </Link>
                                        </div>
                                    </div>
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
