"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Search, MapPin, Star, Clock, Phone, Globe, ArrowRight, Loader2, Filter, BadgeCheck, MessageCircle, Navigation, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/components/ThemeProvider";

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
        <div className={`min-h-screen relative transition-colors duration-500 overflow-hidden bg-background text-foreground`}>
            {/* Background elements */}
            <div className={`absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b opacity-50 pointer-events-none transition-colors duration-500 ${
                isLight ? 'from-blue-100/50 to-transparent' : 'from-[#1a3a8f]/20 to-transparent'
            }`} />
            
            <div className="fixed inset-0 z-0">
             
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
                    {/* Main Content Area: Results + Filters */}
                    <div className="flex flex-col lg:flex-row gap-8 items-start">
                        {/* Results Column */}
                        <div className="flex-1 w-full order-2 lg:order-1">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-20 gap-4">
                                    <Loader2 size={48} className="text-primary animate-spin" />
                                    <p className="text-muted-foreground animate-pulse font-medium">Fetching verified listings...</p>
                                </div>
                            ) : error ? (
                                <div className="text-center py-20 p-8 rounded-3xl bg-red-500/5 border border-red-500/20">
                                    <p className="text-red-500 mb-6 font-medium">{error}</p>
                                    <Button onClick={() => window.location.reload()} className="bg-primary text-white hover:bg-primary/90 rounded-xl px-8">Try Again</Button>
                                </div>
                            ) : results.length === 0 ? (
                                <EmptyState categoryName={categoryParam || searchInput} />
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-20">
                                    {results.map((item, idx) => (
                                        <motion.div
                                            key={item._id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.5, delay: idx * 0.05 }}
                                            onClick={() => router.push(`/business/${item._id}`)}
                                            className={`group relative flex flex-col rounded-3xl overflow-hidden transition-all duration-300 border hover:shadow-xl cursor-pointer ${
                                                isLight 
                                                    ? 'bg-white border-slate-200 shadow-sm' 
                                                    : 'bg-[#0f172a]/80 backdrop-blur-xl border-white/5 shadow-2xl shadow-black/20'
                                            }`}
                                        >

                                            {/* Card Header Image */}
                                            <div className="h-40 overflow-hidden relative">
                                                <CardImageSlider item={item} />
                                                
                                                {/* Floating Badge Overlay */}
                                                <div className="absolute top-3 left-3 z-20">
                                                    {(item.isVerified || item.aadhaarVerified || item.approvalStatus === 'approved') && (
                                                        <div className="flex items-center gap-1 text-[9px] text-white font-black uppercase tracking-wider px-2 py-1 rounded-lg bg-emerald-500/90 backdrop-blur-md shadow-lg border border-emerald-400/20">
                                                            <BadgeCheck size={12} className="fill-white text-emerald-600" />
                                                            Verified
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            
                                            {/* Card Content Body */}
                                            <div className="p-4 flex-1 flex flex-col gap-3">
                                                {/* Name & Title */}
                                                <div>
                                                    <div className="flex items-center justify-between gap-2 mb-1">
                                                        <h3 className={`text-base font-bold font-display leading-tight line-clamp-1 group-hover:text-primary transition-colors ${isLight ? 'text-slate-900' : 'text-white'}`}>
                                                            {item.brandName || item.businessName}
                                                        </h3>
                                                    </div>
                                                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">
                                                        {item.mainCategoryName}
                                                    </div>
                                                </div>
                                                
                                                {/* Essential Info */}
                                                <div className="space-y-2 pointer-events-none">
                                                    <div className="flex items-start gap-2 text-[12px] text-muted-foreground">
                                                        <MapPin size={14} className="shrink-0 mt-0.5 text-primary" />
                                                        <span className="line-clamp-2 leading-relaxed">{item.registeredOfficeAddress || 'No address provided'}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
                                                        <Clock size={14} className="shrink-0 text-emerald-500" />
                                                        <span className="font-bold">{item.openingTime || '09:00 AM'} - {item.closingTime || '07:00 PM'}</span>
                                                    </div>
                                                </div>
 
                                                {/* Description Snippet */}
                                                <p className="text-[11px] leading-relaxed line-clamp-2 text-muted-foreground opacity-80 pointer-events-none">
                                                    {item.description || "Browse details, reviews, and latest offerings from this verified provider."}
                                                </p>
 
                                                {/* Keywords / Tags */}
                                                {item.keywords && item.keywords.length > 0 && (
                                                    <div className="flex flex-wrap gap-1.5 line-clamp-1 pointer-events-none">
                                                        {item.keywords.slice(0, 2).map((kw: string, kIdx: number) => (
                                                            <span key={kIdx} className="text-[9px] px-2 py-0.5 rounded-md border border-border/40 bg-muted/10 text-muted-foreground font-medium">
                                                                #{kw}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                                
                                                    {/* Interactive Buttons */}
                                                    <div className="mt-auto space-y-2 pt-1 relative z-10">
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <a 
                                                            href={`tel:${item.primaryContactNumber}`}
                                                            onClick={(e) => e.stopPropagation()}
                                                            className="flex items-center justify-center gap-2 h-9 rounded-xl bg-primary text-white text-[10px] font-bold transition-all shadow-md active:scale-95 px-1 hover:brightness-110"
                                                        >
                                                            <motion.span
                                                                animate={{ rotate: [0, -15, 15, -15, 15, 0] }}
                                                                transition={{ repeat: Infinity, duration: 0.5, repeatDelay: 2 }}
                                                            >
                                                                <Phone size={12} />
                                                            </motion.span>
                                                            {item.primaryContactNumber ? `${item.primaryContactNumber.slice(0, -2)}XX` : ''}
                                                        </a>
                                                        <a 
                                                            href={`https://wa.me/${item.officialWhatsAppNumber || item.primaryContactNumber}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            onClick={(e) => e.stopPropagation()}
                                                            className="flex items-center justify-center gap-2 h-9 rounded-xl bg-emerald-500 text-white text-[10px] font-bold transition-all shadow-md active:scale-95 hover:brightness-110"
                                                        >
                                                            <MessageCircle size={14} /> WhatsApp
                                                        </a>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Link 
                                                            href={`/nearby-map?lat=${item.gpsCoordinates?.lat || ''}&lng=${item.gpsCoordinates?.lng || ''}&id=${item._id}`}
                                                            onClick={(e) => e.stopPropagation()}
                                                            className="flex-1 flex items-center justify-center gap-2 h-9 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-[11px] font-bold transition-all shadow-md active:scale-95"
                                                        >
                                                            <Navigation size={14} /> Map
                                                        </Link>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                const url = `${window.location.origin}/business/${item._id}`;
                                                                if (navigator.share) {
                                                                    navigator.share({ title: item.brandName, url });
                                                                } else {
                                                                    navigator.clipboard.writeText(url);
                                                                    alert("Link copied!");
                                                                }
                                                            }}
                                                            className="w-9 h-9 flex items-center justify-center rounded-xl bg-amber-500 hover:bg-amber-600 text-white shadow-md transition-all active:scale-95"
                                                        >
                                                            <Share2 size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Filter Sidebar (Right) */}
                        <aside className="w-full lg:w-80 order-1 lg:order-2 sticky top-32 h-fit mb-8 lg:mb-0">
                            <div className={`p-6 rounded-[2.5rem] border backdrop-blur-3xl transition-all duration-500 overflow-hidden relative ${
                                isLight ? 'bg-white border-slate-200 shadow-xl' : 'bg-[#0f172a]/80 border-white/10 shadow-2xl'
                            }`}>
                                {/* Decorative Gradient */}
                                <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 blur-[80px] rounded-full pointer-events-none" />
                                
                                <div className="flex items-center justify-between mb-8 relative z-10">
                                    <div className="flex items-center gap-2.5">
                                        <div className="p-2 rounded-xl bg-primary/10 text-primary">
                                            <Filter size={20} />
                                        </div>
                                        <h2 className="font-bold text-xl font-display">Filters</h2>
                                    </div>
                                    <button 
                                        onClick={() => router.push('/search')}
                                        className="text-[12px] text-primary font-bold hover:underline transition-all"
                                    >
                                        Clear All
                                    </button>
                                </div>

                                {/* Ad Banner - Premium Image Version */}
                                <div className="mb-10 rounded-[2rem] h-48 relative overflow-hidden group shadow-2xl shadow-primary/20 border border-white/10">
                                    <img 
                                        src="/ad-banner.png" 
                                        alt="Ad Banner" 
                                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-5">
                                        <span className="absolute top-3 right-3 text-[9px] font-black uppercase tracking-widest bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-md text-white/70 border border-white/5">Sponsored</span>
                                        <div className="relative z-20 backdrop-blur-md bg-white/10 p-4 rounded-2xl border border-white/10">
                                            <h4 className="font-bold text-base text-white mb-1 leading-tight">Boost Your Visibility</h4>
                                            <p className="text-[10px] text-white/80 mb-3 line-clamp-2">Get featured at the top of search results and reach 10x more customers.</p>
                                            <Link 
                                                href="/community/register"
                                                className="w-full flex items-center justify-center py-2.5 bg-primary text-white rounded-xl text-[11px] font-bold shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 cursor-pointer relative z-30"
                                            >
                                                Get Listed Now
                                            </Link>
                                        </div>
                                    </div>
                                </div>

                                {/* Section: City Search */}
                                <div className="mb-10 relative z-10">
                                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-4 px-1">Location / City</h3>
                                    <div className="relative mb-4">
                                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-primary" size={16} />
                                        <Input 
                                            placeholder="Search city in India..."
                                            value={locationInput}
                                            onChange={(e) => {
                                                setLocationInput(e.target.value);
                                                // Optional: add debounce and update URL
                                            }}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    const p = new URLSearchParams(searchParams.toString());
                                                    p.set('location', locationInput);
                                                    router.push(`/search?${p.toString()}`);
                                                }
                                            }}
                                            className={`pl-10 h-11 rounded-2xl border-border/40 focus-visible:ring-primary/20 ${isLight ? 'bg-slate-50' : 'bg-white/5'}`}
                                        />
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {['Delhi', 'Mumbai', 'Bangalore', 'Noida', 'Pune'].map((city) => (
                                            <button
                                                key={city}
                                                onClick={() => {
                                                    const p = new URLSearchParams(searchParams.toString());
                                                    p.set('location', city);
                                                    router.push(`/search?${p.toString()}`);
                                                }}
                                                className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all border ${
                                                    locationInput.toLowerCase() === city.toLowerCase()
                                                        ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                                                        : 'bg-muted/30 border-border/20 text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                                                }`}
                                            >
                                                {city}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Section: Price Range */}
                                <div className="mb-10 relative z-10">
                                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-4 px-1">Price Tiers</h3>
                                    <div className="grid grid-cols-2 gap-2">
                                        {['Economy', 'Standard', 'Premium', 'Luxury'].map((pType) => (
                                            <button 
                                                key={pType}
                                                className={`px-4 py-3 rounded-2xl text-[12px] font-bold transition-all border ${
                                                    searchParams.get('price') === pType 
                                                        ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' 
                                                        : 'bg-muted/20 hover:bg-muted/40 border-border/40 text-muted-foreground'
                                                }`}
                                                onClick={() => {
                                                    const p = new URLSearchParams(searchParams.toString());
                                                    if (searchParams.get('price') === pType) p.delete('price');
                                                    else p.set('price', pType);
                                                    router.push(`/search?${p.toString()}`);
                                                }}
                                            >
                                                {pType}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Section: Trust & Status */}
                                <div className="space-y-6 relative z-10 pt-4 border-t border-border/40">
                                    <div className="flex items-center justify-between group cursor-pointer" onClick={() => {
                                        const p = new URLSearchParams(searchParams.toString());
                                        const newVal = searchParams.get('verified') === 'true' ? 'false' : 'true';
                                        p.set('verified', newVal);
                                        router.push(`/search?${p.toString()}`);
                                    }}>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold flex items-center gap-1.5">
                                                Verified Only 
                                                <BadgeCheck size={14} className="text-emerald-500 fill-emerald-500/20" />
                                            </span>
                                            <span className="text-[10px] text-muted-foreground">Show only DBI experts</span>
                                        </div>
                                        <div className={`w-10 h-6 rounded-full p-1 transition-colors duration-300 ${searchParams.get('verified') === 'true' ? 'bg-emerald-500' : 'bg-muted'}`}>
                                            <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-300 ${searchParams.get('verified') === 'true' ? 'translate-x-4' : 'translate-x-0'}`} />
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between group cursor-pointer" onClick={() => {
                                        const p = new URLSearchParams(searchParams.toString());
                                        const newVal = searchParams.get('openNow') === 'true' ? 'false' : 'true';
                                        p.set('openNow', newVal);
                                        router.push(`/search?${p.toString()}`);
                                    }}>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold flex items-center gap-1.5">
                                                Open Now
                                                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                            </span>
                                            <span className="text-[10px] text-muted-foreground">Available at this moment</span>
                                        </div>
                                        <div className={`w-10 h-6 rounded-full p-1 transition-colors duration-300 ${searchParams.get('openNow') === 'true' ? 'bg-primary' : 'bg-muted'}`}>
                                            <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-300 ${searchParams.get('openNow') === 'true' ? 'translate-x-4' : 'translate-x-0'}`} />
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </aside>
                    </div>
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
