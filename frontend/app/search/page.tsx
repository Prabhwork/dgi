"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Search, MapPin, Star, Clock, Phone, Globe, ArrowRight, Loader2, Filter, BadgeCheck, MessageCircle, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/components/ThemeProvider";
import ParticleNetwork from "@/components/ParticleNetwork";
import Link from "next/link";
import EmptyState from "@/components/EmptyState";

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
        <div className="w-full h-full relative overflow-hidden group">
            {images.map((img, index) => (
                <img 
                    key={`${index}-${img}`}
                    src={`${imageBaseUrl}/${img}`} 
                    alt={item.businessName || 'Business Image'}
                    className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 group-hover:scale-110 ${index === currentIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = '/assets/business-placeholder.jpg';
                    }}
                />
            ))}
            {/* Indicators removed per request */}
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
    const [locationInput, setLocationInput] = useState(searchParams.get("location") || "");
    const [searchCoords, setSearchCoords] = useState<{lat: string, lng: string} | null>(
        lat && lng ? {lat, lng} : null
    );
    const [results, setResults] = useState<any[]>([]);
    const [mainSubcategories, setMainSubcategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [isLocating, setIsLocating] = useState(false);

    const fetchMainSubcategories = async (catName: string) => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/main-subcategories?mainCategoryName=${encodeURIComponent(catName)}&limit=50`);
            const data = await res.json();
            if (data.success) {
                setMainSubcategories(data.data);
            }
        } catch (err) {
            console.error("Failed to fetch subcategories:", err);
        }
    };

    const fetchResults = async (q: string, cat: string, overrideCoords?: {lat: string, lng: string}) => {
        setLoading(true);
        try {
            let url = `${process.env.NEXT_PUBLIC_API_URL}/business/search?`;
            const params = new URLSearchParams();
            if (q) params.append("q", q);
            if (cat) params.append("category", cat);
            
            const effectiveLat = overrideCoords?.lat || lat;
            const effectiveLng = overrideCoords?.lng || lng;

            if (effectiveLat && effectiveLng) {
                params.append("lat", effectiveLat);
                params.append("lng", effectiveLng);
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
        const prepareSearch = async () => {
            let overrideCoords = undefined;
            
            const locationParam = searchParams.get("location");
            if (locationParam && (!lat || !lng)) {
                try {
                    const res = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(locationParam)}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}&limit=1`);
                    const data = await res.json();
                    if (data.features && data.features.length > 0) {
                        overrideCoords = {
                            lat: data.features[0].center[1].toString(),
                            lng: data.features[0].center[0].toString()
                        };
                        setSearchCoords(overrideCoords);
                    }
                } catch (err) {
                    console.error("Geocoding failed in SearchPage:", err);
                }
            }

            fetchResults(initialQuery, categoryParam, overrideCoords);
        };

        prepareSearch();

        if (categoryParam) {
            fetchMainSubcategories(categoryParam);
        } else {
            setMainSubcategories([]);
        }
        setSearchInput(initialQuery);
        setCategoryInput(categoryParam);
        setLocationInput(searchParams.get("location") || "");
    }, [initialQuery, categoryParam, lat, lng, searchParams.get("location")]);

    const handleSearchSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchInput.trim()) return;

        let query = searchInput.trim();
        let location = "";
        let latToUse = "";
        let lngToUse = "";

        // 1. Check for " in " pattern
        if (query.toLowerCase().includes(" in ")) {
            const parts = query.toLowerCase().split(" in ");
            if (parts.length >= 2) {
                query = parts[0].trim();
                location = parts[1].trim();
            }
        }

        // 2. Try to geocode the location part ONLY IF provided
        if (location) {
            try {
                const res = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(location)}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}&limit=1&types=region,postcode,district,place,locality,neighborhood`);
                const data = await res.json();
                if (data.features && data.features.length > 0) {
                    const bestMatch = data.features[0];
                    if (bestMatch.relevance > 0.85) {
                        latToUse = bestMatch.center[1].toString();
                        lngToUse = bestMatch.center[0].toString();
                    }
                }
            } catch (err) {
                console.error("Geocoding failed in SearchPage submit:", err);
            }
        }

        const params = new URLSearchParams();
        if (query) params.append("q", query);
        if (categoryInput) params.append("mainCategory", categoryInput);
        if (location) params.append("location", location);
        
        if (latToUse && lngToUse) {
            params.append("lat", latToUse);
            params.append("lng", lngToUse);
        } else if (lat && lng) {
            // Keep existing coords if we didn't find new ones
            params.append("lat", lat);
            params.append("lng", lng);
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
                                Discover <span className="gradient-text">Businesses</span> {locationInput && <span className="text-primary/60">in {locationInput}</span>}
                            </h1>
                            <p className="text-muted-foreground">
                                {loading ? "Searching for the best businesses..." : (
                                    results.length > 0 
                                      ? `Found ${results.length} businesses matching your criteria`
                                      : "No businesses found. Try a different search term or location."
                                )}
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

                    {/* Subcategory Exploration */}
                    <AnimatePresence>
                        {categoryParam && mainSubcategories.length > 0 && (
                            <motion.div 
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="mb-12"
                            >
                                <div className="flex items-center justify-between mb-4 px-2">
                                    <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-primary">
                                        Explore {categoryParam} Specialties
                                    </h3>
                                    <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest bg-muted px-2 py-0.5 rounded border border-border">
                                        {mainSubcategories.length} Options
                                    </span>
                                </div>
                                <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide px-1 mask-linear-right">
                                    {mainSubcategories.map((sub, idx) => (
                                        <motion.button
                                            key={sub._id}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: idx * 0.03 }}
                                            onClick={() => {
                                                setSearchInput(sub.name);
                                                const params = new URLSearchParams(searchParams.toString());
                                                params.set("q", sub.name);
                                                router.push(`/search?${params.toString()}`);
                                            }}
                                            className={`flex-shrink-0 px-5 py-2.5 rounded-2xl border backdrop-blur-md transition-all duration-300 font-bold text-xs flex items-center gap-2 group ${
                                                searchInput.toLowerCase() === sub.name.toLowerCase()
                                                    ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20 scale-105'
                                                    : isLight 
                                                        ? 'bg-white border-slate-200 text-slate-700 hover:border-primary/50 hover:bg-slate-50' 
                                                        : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10 hover:border-white/30'
                                            }`}
                                        >
                                            <div className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                                                searchInput.toLowerCase() === sub.name.toLowerCase() 
                                                    ? 'bg-white scale-125' 
                                                    : 'bg-primary/40 group-hover:bg-primary'
                                            }`} />
                                            {sub.name}
                                        </motion.button>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

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
                        <EmptyState categoryName={categoryParam || searchInput} />
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {results.map((item, idx) => (
                                <motion.div
                                    key={item._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className={`group flex flex-col rounded-none overflow-hidden backdrop-blur-2xl border transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)] cursor-pointer ${
                                        isLight 
                                            ? 'bg-white/95 border-slate-200 hover:border-primary/30' 
                                            : 'bg-slate-900/80 border-white/10 hover:border-primary/40'
                                    }`}
                                    onClick={() => router.push(`/business/${item._id}`)}
                                >
                                    {/* Card Header Image */}
                                    <div className="h-44 overflow-hidden relative">
                                        <CardImageSlider item={item} />
                                        {/* Removed overlay to show photo clearly */}
                                    </div>
                                    
                                    {/* Card Body */}
                                    <div className="p-4 flex-1 flex flex-col">
                                        
                                        {/* Business Name & Verified Badge - Moved here from image overlay */}
                                        <div className="mb-4">
                                            <div className="flex items-start justify-between gap-2 mb-1.5">
                                                <h3 className={`text-lg font-black leading-tight truncate font-display ${isLight ? 'text-slate-900' : 'text-white'}`}>
                                                    {item.brandName || item.businessName}
                                                </h3>
                                                {(item.isVerified || item.aadhaarVerified || item.approvalStatus === 'approved') && (
                                                    <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold uppercase tracking-wider bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 shrink-0">
                                                        <BadgeCheck size={12} className="fill-emerald-500 text-black" />
                                                        Verified
                                                    </div>
                                                )}
                                            </div>
                                            {/* Rating removed per request */}
                                        </div>
                                        
                                        <div className="space-y-3 mb-4">
                                            <div className="flex items-start gap-3 text-[13px] text-foreground/70 group/loc">
                                                <div className={`p-1.5 rounded-lg transition-colors ${isLight ? 'bg-primary/5 text-primary' : 'bg-primary/10 text-primary'}`}>
                                                    <MapPin size={16} className="shrink-0" />
                                                </div>
                                                <span className="line-clamp-2 leading-snug pt-0.5">{item.registeredOfficeAddress || 'No address provided'}</span>
                                            </div>
                                            <div className="flex items-start gap-3 text-[13px] text-foreground/70">
                                                <div className={`p-1.5 rounded-lg transition-colors ${isLight ? 'bg-slate-100 text-slate-500' : 'bg-white/5 text-slate-400'}`}>
                                                    <Clock size={16} className="shrink-0" />
                                                </div>
                                                <div className="flex flex-col pt-0.5">
                                                    <span className="font-bold text-foreground">
                                                        {(() => {
                                                            const formatTime = (timeStr: string) => {
                                                                if (!timeStr) return '';
                                                                const [hours, minutes] = timeStr.split(':');
                                                                const h = parseInt(hours, 10);
                                                                const ampm = h >= 12 ? 'PM' : 'AM';
                                                                const h12 = h % 12 || 12;
                                                                return `${h12.toString().padStart(2, '0')}:${minutes} ${ampm}`;
                                                            };

                                                            // NEW: Use businessHours if available
                                                            if (item.businessHours) {
                                                                const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
                                                                const today = days[new Date().getDay()];
                                                                const todayData = item.businessHours[today];
                                                                
                                                                if (todayData) {
                                                                    if (!todayData.isOpen) return "Closed Today";
                                                                    if (todayData.slots && todayData.slots.length > 0) {
                                                                        const slot = todayData.slots[0];
                                                                        return `${formatTime(slot.open)} - ${formatTime(slot.close)}`;
                                                                    }
                                                                }
                                                            }

                                                            // Fallback to legacy fields
                                                            return `${formatTime(item.openingTime || '09:00')} - ${formatTime(item.closingTime || '18:00')}`;
                                                        })()}
                                                    </span>
                                                    {(() => {
                                                        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
                                                        const today = days[new Date().getDay()];
                                                        
                                                        // Check if currently closed due to weeklyOff (legacy) or businessHours (new)
                                                        const isWeeklyOffLegacy = item.weeklyOff && item.weeklyOff.toLowerCase() === today;
                                                        const isClosedNew = item.businessHours?.[today]?.isOpen === false;
                                                        
                                                        if (isClosedNew || isWeeklyOffLegacy) {
                                                            return (
                                                                <span className="text-[10px] font-black uppercase text-red-500 tracking-wider mt-0.5">
                                                                    Closed Now
                                                                </span>
                                                            );
                                                        }
                                                        return null;
                                                    })()}
                                                </div>
                                            </div>
                                        </div>

                                        <p className={`text-sm leading-relaxed mb-4 line-clamp-3 md:line-clamp-4 ${isLight ? 'text-slate-600' : 'text-foreground/80'}`}>
                                            {item.description || "No description available for this business."}
                                        </p>

                                        {/* Keywords */}
                                        {item.keywords && item.keywords.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5 mb-4">
                                                {item.keywords.slice(0, 3).map((kw: string, kIdx: number) => (
                                                    <span key={kIdx} className={`text-[10px] px-2 py-0.5 rounded-md border ${isLight ? 'bg-blue-50/50 border-blue-100 text-blue-600' : 'bg-white/5 border-white/10 text-white/50'}`}>
                                                        #{kw}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                        
                                        {/* Action Buttons - Compact Row */}
                                        <div className="flex gap-2 h-10 mt-auto">
                                            <a 
                                                href={`tel:${item.primaryContactNumber}`}
                                                onClick={(e) => e.stopPropagation()}
                                                className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-[12px] font-bold transition-all"
                                                title="Call Now"
                                            >
                                                <Phone size={14} /> Call
                                            </a>
                                            <a 
                                                href={`https://wa.me/${item.officialWhatsAppNumber || item.primaryContactNumber}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                onClick={(e) => e.stopPropagation()}
                                                className="flex-1 flex items-center justify-center gap-1.5 bg-[#25D366] hover:bg-[#22c35e] text-white rounded-lg text-[12px] font-bold transition-all shadow-lg shadow-[#25D366]/20"
                                            >
                                                <MessageCircle size={14} /> WhatsApp
                                            </a>
                                            <Link 
                                                href={`/nearby-map?lat=${item.gpsCoordinates?.lat || ''}&lng=${item.gpsCoordinates?.lng || ''}&id=${item._id}`}
                                                onClick={(e) => e.stopPropagation()}
                                                className="flex-1 flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[12px] font-bold transition-all shadow-lg shadow-blue-600/20"
                                                title="Map View"
                                            >
                                                <Navigation size={14} /> Map
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
