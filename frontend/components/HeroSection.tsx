"use client";

import { useState, useEffect, useRef } from "react";
import { animate as animateValue } from "framer-motion";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, Store, CheckCircle2, Compass, ChevronDown, Loader2, Trophy, TrendingUp, Zap, ChevronRight, Navigation as NavigationIcon, Tag, Mic } from "lucide-react";
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
    const [searchInput, setSearchInput] = useState("");
    const [detectedLocation, setDetectedLocation] = useState("");
    const [isLocating, setIsLocating] = useState(false);
    const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
    const [allCategories, setAllCategories] = useState<any[]>([]);
    const [currentSet, setCurrentSet] = useState(0);
    const mobileScrollRef = useRef<HTMLDivElement>(null);
    const scrollPosRef = useRef<number>(0);
    const [isInteractingMobile, setIsInteractingMobile] = useState(false);
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isSearchingSuggestions, setIsSearchingSuggestions] = useState(false);
    const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
    const suggestionRef = useRef<HTMLDivElement>(null);
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef<any>(null);
    const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Overall listings counter - Synced with Backend
    const [listingCount, setListingCount] = useState(3842);
    const [listingDisplay, setListingDisplay] = useState(3842);

    useEffect(() => {
        const fetchLiveListing = async () => {
            try {
                const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
                const res = await fetch(`${API_URL}/global-settings/live-listing`);
                const data = await res.json();
                if (data.success) {
                    setListingCount(data.count);
                }
            } catch (err) {
                console.error('Failed to fetch live listing count:', err);
            }
        };

        // Initial fetch
        fetchLiveListing();

        // Poll every 5 seconds to stay in sync with backend worker
        const syncInterval = setInterval(fetchLiveListing, 5000);

        return () => clearInterval(syncInterval);
    }, []);

    useEffect(() => {
        const ctrl = animateValue(listingDisplay, listingCount, {
            duration: 2.5,
            ease: 'easeOut',
            onUpdate: v => setListingDisplay(Math.round(v))
        });
        return ctrl.stop;
    }, [listingCount]);

    useEffect(() => {
        const fetchCategories = async () => {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
            const BASE_URL = API_URL.replace('/api', '');
            try {
                const res = await fetch(`${API_URL}/main-categories?sort=createdAt&limit=100`);
                const data = await res.json();
                if (data.success && data.data) {
                    let fetchedCats = data.data
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

                    // Pad to 24 items if we have 21 (or any amount less than 24)
                    // The user specifically asked for 24 items total (8, 16, 24)
                    if (fetchedCats.length > 0 && fetchedCats.length < 24) {
                        const needed = 24 - fetchedCats.length;
                        const repeats = fetchedCats.slice(0, needed);
                        fetchedCats = [...fetchedCats, ...repeats];
                    }

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
        // Sync our float ref with the native scroll in case user swiped
        scrollPosRef.current = scrollContainer.scrollLeft;

        const scroll = () => {
            if (scrollContainer) {
                if (scrollPosRef.current >= (scrollContainer.scrollWidth / 2)) {
                    scrollPosRef.current = 0;
                } else {
                    scrollPosRef.current += 1.2; // Smooth glide using explicit float tracking
                }
                scrollContainer.scrollLeft = scrollPosRef.current;
            }
            animationFrameId = requestAnimationFrame(scroll);
        };

        animationFrameId = requestAnimationFrame(scroll);
        return () => cancelAnimationFrame(animationFrameId);
    }, [isInteractingMobile, allCategories]);

    const [placeholderIndex, setPlaceholderIndex] = useState(0);
    const placeholders = [
        "Search for Restaurants in Ludhiana...",
        "Find the best Plumbers near you...",
        "Discover Pizza places in Delhi...",
        "Looking for a Dentist?",
        "Explore Home & Garden services...",
        "Find top-rated Electricians...",
        "Search for Chinese food..."
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

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

    useEffect(() => {
        const fetchSuggestions = async () => {
            if (!searchInput.trim() || searchInput.trim().length < 1) {
                setSuggestions([]);
                setShowSuggestions(false);
                return;
            }

            setIsSearchingSuggestions(true);
            try {
                const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
                const res = await fetch(`${API_URL}/suggestions?q=${encodeURIComponent(searchInput)}`);
                const data = await res.json();
                if (data.success) {
                    setSuggestions(data.data);
                    setShowSuggestions(data.data.length > 0);
                    setActiveSuggestionIndex(-1);
                }
            } catch (err) {
                console.error("Suggestions fetch failed:", err);
            } finally {
                setIsSearchingSuggestions(false);
            }
        };

        const timeoutId = setTimeout(fetchSuggestions, 300);
        return () => clearTimeout(timeoutId);
    }, [searchInput]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (suggestionRef.current && !suggestionRef.current.contains(e.target as Node)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!showSuggestions) {
            if (e.key === 'Enter') handleSearch();
            return;
        }

        if (e.key === "ArrowDown") {
            e.preventDefault();
            setActiveSuggestionIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActiveSuggestionIndex(prev => (prev > -1 ? prev - 1 : prev));
        } else if (e.key === "Enter") {
            if (activeSuggestionIndex >= 0) {
                e.preventDefault();
                const selected = suggestions[activeSuggestionIndex];
                handleSuggestionClick(selected.text);
            } else {
                handleSearch();
            }
        } else if (e.key === "Escape") {
            setShowSuggestions(false);
        }
    };

    const handleSuggestionClick = (text: string) => {
        setSearchInput(text);
        setShowSuggestions(false);
        setTimeout(() => handleSearch(text), 10);
    };

    const handleSearch = async (overrideQuery?: string) => {
        const queryToSearch = overrideQuery || searchInput;
        if (!queryToSearch.trim()) return;
        setShowSuggestions(false);

        let query = queryToSearch.trim();

        // Voice Navigation Logic
        const navMap: { [key: string]: string } = {
            'home': '/',
            'community': '/community',
            'register': '/community/register',
            'map': '/nearby-map',
            'nearby': '/nearby-map',
            'benefits': '/listing-benefits',
            'plans': '/mapping-plans',
            'success': '/success-stories',
            'why choose dbi': '/why-dbi',
            // Hindi equivalents
            'ghar': '/',
            'registration': '/community/register',
            'naksha': '/nearby-map'
        };

        const lowerQuery = query.toLowerCase();
        for (const [key, path] of Object.entries(navMap)) {
            if (lowerQuery.includes(key)) {
                router.push(path);
                return;
            }
        }

        let location = "";
        let lat = "";
        let lng = "";

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
                const res = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(location)}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}&types=region,postcode,district,place,locality,neighborhood`);
                const data = await res.json();

                if (data.features && data.features.length > 0) {
                    const bestMatch = data.features[0];
                    if (bestMatch.relevance > 0.85) {
                        lat = bestMatch.center[1].toString();
                        lng = bestMatch.center[0].toString();
                    }
                }
            } catch (err) {
                console.error("Geocoding failed:", err);
            }
        }

        const params = new URLSearchParams();
        if (query) params.set("q", query);
        if (location) params.set("location", location);
        if (lat && lng) {
            params.set("lat", lat);
            params.set("lng", lng);
        } else if (userCoords) {
            params.set("lat", userCoords.lat.toString());
            params.set("lng", userCoords.lng.toString());
        }

        router.push(`/search?${params.toString()}`);
    };

    const toggleVoiceInput = () => {
        if (isListening) {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
            setIsListening(false);
            return;
        }

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Your browser does not support Speech Recognition. Please try Chrome.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US'; // Default to English, but can detect Hindi too if needed
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onerror = (event: any) => {
            if (event.error === 'no-speech') {
                console.warn("Speech recognition: No speech detected.");
            } else {
                console.error("Speech recognition error", event.error);
            }
            setIsListening(false);
        };

        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setSearchInput(transcript);
            // Wait a bit for the state to update, then search
            setTimeout(() => handleSearch(transcript), 500);
        };

        recognitionRef.current = recognition;
        recognition.start();
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
                            `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}&types=place,locality`
                        );
                        const data = await response.json();
                        const locationName = data.features && data.features[0] ? data.features[0].text : "Detected Location";
                        setDetectedLocation(locationName);
                    } catch (err) {
                        console.warn("Auto-location name fetch failed:", err);
                    } finally {
                        setIsLocating(false);
                    }
                },
                (err) => {
                    // Use console.warn to prevent Next.js dev overlay from appearing for non-critical permission/timeout issues
                    console.warn("Auto-location: User denied permission or timeout.");
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
                    <div className="flex items-center gap-0 w-full sm:w-auto sm:flex-1 sm:max-w-md group relative">
                        {/* Advanced Shadow Glow */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 rounded-2xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-700 -z-10" />

                        <div className={`flex items-center flex-1 backdrop-blur-2xl border rounded-l-lg px-3 py-2.5 transition-all duration-500 ${theme === 'light'
                            ? 'bg-white/80 border-slate-200 group-focus-within:border-primary shadow-xl shadow-blue-900/5'
                            : 'bg-black/40 border-white/10 group-focus-within:border-primary/50 shadow-2xl'
                            }`}>
                            <div className="relative flex-1 flex items-center">
                                <motion.input
                                    type="text"
                                    placeholder={isListening ? "Listening..." : (isLocating ? "Detecting location..." : (detectedLocation ? `Near ${detectedLocation}` : "Search restaurants, services, or cities..."))}
                                    value={searchInput}
                                    onChange={(e) => {
                                        setSearchInput(e.target.value);
                                        setShowSuggestions(true);
                                    }}
                                    onFocus={() => {
                                        if (suggestions.length > 0) setShowSuggestions(true);
                                    }}
                                    onKeyDown={handleKeyDown}
                                    suppressHydrationWarning
                                    className={`bg-transparent text-sm font-medium outline-none w-full pr-16 ${theme === 'light'
                                        ? 'text-slate-900 placeholder:text-slate-400'
                                        : 'text-white placeholder:text-white/40'
                                        }`}
                                />

                                {/* Suggestions Dropdown */}
                                <AnimatePresence>
                                    {showSuggestions && suggestions.length > 0 && (
                                        <motion.div
                                            ref={suggestionRef}
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            className={`absolute top-full left-0 right-[-1px] mt-2 rounded-xl border border-solid shadow-2xl overflow-hidden z-[100] backdrop-blur-2xl ${theme === 'light'
                                                ? 'bg-[#FCF8EB]/95 border-slate-900/10'
                                                : 'bg-[#020631]/95 border-white/10'
                                                }`}
                                        >
                                            <div className="py-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                                                {suggestions.map((s, i) => (
                                                    <button
                                                        key={`${s.text}-${i}`}
                                                        onClick={() => handleSuggestionClick(s.text)}
                                                        onMouseEnter={() => setActiveSuggestionIndex(i)}
                                                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors duration-200 ${activeSuggestionIndex === i
                                                            ? theme === 'light' ? 'bg-primary/5 text-primary' : 'bg-white/5 text-white'
                                                            : theme === 'light' ? 'text-slate-600' : 'text-slate-300'
                                                            }`}
                                                    >
                                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${activeSuggestionIndex === i
                                                            ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                                            : theme === 'light' ? 'bg-slate-100 text-slate-400' : 'bg-white/5 text-slate-500'
                                                            }`}>
                                                            {s.type === 'category' ? <ChevronRight size={14} /> : (s.type === 'subcategory' ? <Tag size={14} /> : <Store size={14} />)}
                                                        </div>
                                                        <div className="flex-1 overflow-hidden">
                                                            <div className={`text-sm font-bold truncate ${theme === 'light' ? 'text-black' : 'text-white'}`}>{s.text}</div>
                                                            <div className={`text-[10px] uppercase tracking-wider font-black ${theme === 'light' ? 'text-black/50' : 'text-white/40'}`}>{s.type}</div>
                                                        </div>
                                                        <Search size={12} className="opacity-20" />
                                                    </button>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Voice Search Button */}
                                <button
                                    onClick={toggleVoiceInput}
                                    className={`absolute right-8 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-all ${isListening ? 'animate-pulse text-red-500 bg-red-500/10 scale-110' : 'text-muted-foreground hover:text-primary hover:bg-primary/10'
                                        }`}
                                    title="Voice Search"
                                >
                                    <Mic size={18} />
                                </button>

                                {/* Inner Location Button */}
                                <button
                                    onClick={() => {
                                        setIsLocating(true);
                                        if (navigator.geolocation) {
                                            navigator.geolocation.getCurrentPosition(
                                                async (pos) => {
                                                    const { latitude, longitude } = pos.coords;
                                                    try {
                                                        const res = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`);
                                                        const data = await res.json();
                                                        if (data.features && data.features[0]) {
                                                            const place = data.features[0].text;
                                                            setDetectedLocation(place);
                                                            setSearchInput(place);
                                                        }
                                                    } catch (e) { } finally { setIsLocating(false); }
                                                },
                                                () => setIsLocating(false)
                                            );
                                        }
                                    }}
                                    className={`absolute right-0 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-all ${isLocating ? 'animate-spin text-primary' : 'text-muted-foreground hover:text-primary hover:bg-primary/10'
                                        }`}
                                    title="Detect My Location"
                                    suppressHydrationWarning
                                >
                                    <NavigationIcon size={16} className={isLocating ? "" : "rotate-45"} />
                                </button>
                            </div>
                        </div>

                        <Link
                            href="/nearby-map"
                            className="relative overflow-hidden flex items-center gap-1.5 bg-primary text-white px-5 py-2.5 rounded-r-lg text-sm font-bold hover:bg-primary/90 transition-all whitespace-nowrap shadow-lg shadow-primary/20 group/btn"
                        >
                            <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="absolute inset-0 bg-white/20 opacity-0 group-hover/btn:opacity-100 transition-opacity"
                            />
                            <MapPin size={18} className="group-hover/btn:animate-bounce" />
                            <span className="hidden sm:inline">See On Map</span>
                            <span className="sm:hidden">Map</span>

                            {/* Animated Shine */}
                            <div className="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-20deg] group-hover/btn:animate-[shimmer-sweep_2s_infinite] pointer-events-none" />
                        </Link>
                    </div>

                    {/* Swadeshi badge — desktop only, inline with search bar */}
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        whileHover={{ scale: 1.05, y: -3 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ delay: 0.5, duration: 1.5, type: "spring", stiffness: 150, damping: 15 }}
                        className={`hidden lg:flex relative px-5 py-2 rounded-2xl items-center gap-3 z-50 shadow-2xl cursor-pointer pointer-events-auto overflow-hidden shrink-0 ${theme === 'light' ? 'bg-primary shadow-lg shadow-primary/20' : 'multicolor-vibrate'}`}
                    >
                        <div className="relative flex items-center gap-3 z-10">
                            <div className="relative w-8 h-8 flex items-center justify-center shrink-0">
                                <div className={`absolute inset-0 rounded-full blur-sm transition-colors ${theme === 'light' ? 'bg-white/20' : 'bg-white/10 group-hover:bg-white/20'}`} />
                                <img
                                    src="/assets/swadeshi-logo-dark.png"
                                    alt="Swadeshi"
                                    className={`w-full h-full object-contain brightness-110 contrast-125 ${theme === 'light' ? 'mix-blend-screen' : 'mix-blend-screen'}`}
                                    onError={(e) => (e.currentTarget.style.display = 'none')}
                                />
                            </div>
                            <span className={`relative font-display font-black text-xs tracking-[0.2em] uppercase ${theme === 'light' ? 'text-white' : 'text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]'}`}>
                                Swadeshi Platform
                            </span>
                        </div>
                    </motion.div>

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
                            <DropdownMenuContent className={`border border-solid p-2 min-w-[240px] z-[60] shadow-[0_8px_32px_rgba(0,0,0,0.2)] backdrop-blur-2xl ${theme === 'light' ? 'bg-[#FCF8EB]/95 border-slate-900/10' : 'bg-slate-900/80 border-white/10'}`}>
                                <DropdownMenuItem className="focus:bg-primary/20 focus:text-white cursor-pointer py-3 rounded-lg group" asChild>
                                    <Link href="/success-stories" className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                            <Trophy size={18} className="text-primary" />
                                        </div>
                                        <span className={`font-bold transition-colors ${theme === 'light' ? 'text-black' : 'text-slate-200'}`}>Success Stories</span>
                                    </Link>
                                </DropdownMenuItem>

                                <DropdownMenuItem className="focus:bg-primary/20 focus:text-white cursor-pointer py-3 rounded-lg group" asChild>
                                    <Link href="/listing-benefits" className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                            <TrendingUp size={18} className="text-primary" />
                                        </div>
                                        <span className={`font-bold transition-colors ${theme === 'light' ? 'text-black' : 'text-slate-200'}`}>Listing Benefits</span>
                                    </Link>
                                </DropdownMenuItem>

                                <DropdownMenuItem className="focus:bg-primary/20 focus:text-white cursor-pointer py-3 rounded-lg group" asChild>
                                    <Link href="/mapping-plans" className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                            <Zap size={18} className="text-primary" />
                                        </div>
                                        <span className={`font-bold transition-colors ${theme === 'light' ? 'text-black' : 'text-slate-200'}`}>Business Plans</span>
                                    </Link>
                                </DropdownMenuItem>

                                <div className="h-px bg-white/10 my-1 px-2" />
                                <DropdownMenuItem className="focus:bg-primary/20 focus:text-white cursor-pointer py-3 rounded-lg group" asChild>
                                    <Link href="/why-dbi" className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                            <Compass size={18} className="text-primary" />
                                        </div>
                                        <span className={`font-bold transition-colors ${theme === 'light' ? 'text-black' : 'text-slate-200'}`}>Why Choose DBI</span>
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
                                    onClick={() => router.push(`/search?q=${encodeURIComponent(cat.name)}`)}
                                    className={`rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:scale-110 transition-all duration-700 w-[140px] h-[130px] group relative overflow-hidden backdrop-blur-[2px] border border-solid ${theme === 'light'
                                        ? 'bg-transparent border-slate-900/25 hover:border-primary/50 shadow-sm'
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
                    <div className="w-full flex flex-col items-center text-center mt-8 sm:mt-0 relative">
                        {/* Swadeshi Platform Badge - ROBUST TOP CENTER */}
                        <motion.div
                            initial={{ opacity: 0, y: -20, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            whileHover={{ scale: 1.05, y: -5 }}
                            whileTap={{ scale: 0.95 }}
                            transition={{ delay: 0.5, duration: 1.5, type: "spring", stiffness: 150, damping: 15 }}
                            className={`relative mb-4 sm:mb-6 lg:hidden px-5 sm:px-8 py-2.5 sm:py-3 rounded-2xl flex items-center gap-3 sm:gap-5 z-50 shadow-2xl scale-90 sm:scale-100 cursor-pointer pointer-events-auto overflow-hidden ${theme === 'light' ? 'bg-primary shadow-lg shadow-primary/20' : 'multicolor-vibrate'}`}
                        >
                            <div className="relative flex items-center gap-2 sm:gap-4 z-10">
                                <div className="relative w-8 h-8 sm:w-12 sm:h-12 flex items-center justify-center shrink-0">
                                    <div className={`absolute inset-0 rounded-full blur-sm transition-colors ${theme === 'light' ? 'bg-white/20' : 'bg-white/10 group-hover:bg-white/20'}`} />
                                    <img
                                        src="/assets/swadeshi-logo-dark.png"
                                        alt="Swadeshi"
                                        className={`w-full h-full object-contain brightness-110 contrast-125 ${theme === 'light' ? 'mix-blend-screen' : 'mix-blend-screen'}`}
                                        onError={(e) => (e.currentTarget.style.display = 'none')}
                                    />
                                </div>
                                <span className={`relative font-display font-black text-xs sm:text-base tracking-[0.1em] sm:tracking-[0.2em] uppercase ${theme === 'light' ? 'text-white' : 'text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]'}`}>
                                    Swadeshi Platform
                                </span>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="relative w-72 h-72 sm:w-[300px] sm:h-[300px] md:w-[340px] md:h-[340px] lg:w-[420px] lg:h-[420px] rounded-full mt-6 sm:mt-0"
                        >
                            {/* Rotating Globe fills the circle */}
                            <div className="absolute inset-0 rounded-full overflow-hidden">
                                <MiniGlobe />
                            </div>

                            {/* Text overlay on top of globe */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none select-none px-3">

                                <motion.h1
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5, duration: 0.8 }}
                                    className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-display font-black text-white tracking-[0.1em] leading-tight uppercase"
                                    style={{
                                        textShadow: "0 0 30px rgba(0,157,255,0.5), 0 0 60px rgba(0,157,255,0.2)",
                                        letterSpacing: "0.15em"
                                    }}
                                >
                                    List Your <br />
                                    Business Online
                                </motion.h1>
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.8 }}
                                    className="mt-1 text-[8px] sm:text-[10px] md:text-xs font-bold tracking-[0.1em] uppercase opacity-90 max-w-[180px] sm:max-w-[220px] mx-auto leading-tight"
                                    style={{ color: "#00d4ff", textShadow: "0 0 15px rgba(0,212,255,0.4)" }}
                                >
                                    Grow your business with <br /> Digital Book of India
                                </motion.p>
                                <motion.div
                                    initial={{ scaleX: 0 }}
                                    animate={{ scaleX: 1 }}
                                    transition={{ delay: 1, duration: 1 }}
                                    className="h-[1px] w-16 bg-gradient-to-r from-transparent via-[#00d4ff]/40 to-transparent my-2"
                                />
                                <motion.p
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 1.2 }}
                                    className="font-black max-w-[180px] sm:max-w-[240px] md:max-w-[300px] mx-auto text-xs sm:text-sm md:text-base leading-relaxed"
                                    style={{ color: "#ffffff", textShadow: "0 2px 6px rgba(0,0,0,0.8)" }}
                                >
                                    ₹365/year <span className="text-[9px] sm:text-xs opacity-80">(₹1/day)</span>
                                </motion.p>

                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 1.4, duration: 0.5 }}
                                    className="mt-4 pointer-events-auto relative z-20"
                                >
                                    <Link href="/community/register" hrefLang="en">
                                        <Button asChild className="bg-primary hover:bg-primary/90 text-white font-black px-5 py-4 rounded-full text-[10px] sm:text-xs shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95 uppercase tracking-[0.08em] cursor-pointer">
                                            <span>List Your Business</span>
                                        </Button>
                                    </Link>
                                </motion.div>
                            </div>

                        </motion.div>

                        {/* Mobile category hybrid scroll strip */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.5 }}
                            className="flex lg:hidden mt-12 mb-12 w-full overflow-hidden"
                        >
                            <div
                                ref={mobileScrollRef}
                                onTouchStart={() => {
                                    setIsInteractingMobile(true);
                                    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
                                }}
                                onTouchMove={() => {
                                    setIsInteractingMobile(true);
                                    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
                                }}
                                onTouchEnd={() => {
                                    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
                                    scrollTimeoutRef.current = setTimeout(() => setIsInteractingMobile(false), 2000);
                                }}
                                style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-x' }}
                                className="flex w-full overflow-x-auto scrollbar-hide px-6 gap-4 select-none cursor-grab active:cursor-grabbing touch-pan-x"
                            >
                                {mobilePool.map((cat, i) => (
                                    <div
                                        key={`${cat.name}-${i}`}
                                        onClick={() => router.push(`/search?q=${encodeURIComponent(cat.name)}`)}
                                        className={`flex-shrink-0 flex flex-col items-center justify-center p-4 rounded-[2rem] border transition-all duration-300 cursor-pointer w-[150px] h-[150px] relative overflow-hidden backdrop-blur-[2px] ${theme === 'light'
                                            ? 'bg-transparent border-slate-900/40 text-slate-900 active:scale-95 shadow-sm'
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
                                    onClick={() => router.push(`/search?q=${encodeURIComponent(cat.name)}`)}
                                    className={`rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:scale-110 transition-all duration-700 w-[140px] h-[130px] group relative overflow-hidden backdrop-blur-[2px] border border-solid ${theme === 'light'
                                        ? 'bg-transparent border-slate-900/25 hover:border-primary/50 shadow-sm'
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

            {/* ── Premium Overall Listings Stats Bar ── */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5, duration: 0.8 }}
                className="relative z-10 w-full px-4 pb-12"
            >
                <div className="max-w-4xl mx-auto relative group">
                    {/* Animated Outer Glow */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-emerald-500/10 to-primary/20 rounded-[2rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

                    <div className={`relative flex flex-col md:flex-row items-center justify-between gap-8 md:gap-8 py-10 md:py-6 px-6 md:px-10 rounded-[2rem] border backdrop-blur-3xl transition-all duration-500 ${theme === 'light'
                        ? 'bg-white/80 border-slate-200 shadow-[0_8px_32px_rgba(0,0,0,0.05)]'
                        : 'bg-[#0A0F1E]/60 border-white/10 shadow-[0_8px_40px_rgba(0,0,0,0.5)] group-hover:border-primary/30'
                        }`}>

                        {/* Left: Live Status & Listings */}
                        <div className="flex flex-col items-center md:items-start gap-4 w-full md:w-auto">
                            <div className="flex flex-col items-center md:items-start gap-1.5">
                                <div className="flex items-center gap-2 mb-0.5">
                                    <div className="relative flex h-2.5 w-2.5">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                                    </div>
                                    <span className={`text-[10px] font-black uppercase tracking-[0.25em] ${theme === 'light' ? 'text-slate-400' : 'text-emerald-400/80'}`}>Live Now</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20 text-primary group-hover:scale-110 transition-transform duration-500 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                                        <Store size={24} strokeWidth={2.5} />
                                    </div>
                                    <div className="flex items-baseline gap-1.5">
                                        <span className={`text-4xl sm:text-5xl font-display font-black tracking-tight tabular-nums transition-all ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                                            {listingDisplay.toLocaleString('en-IN')}
                                        </span>
                                        <span className="text-primary font-black text-2xl animate-pulse">+</span>
                                        <span className={`text-[11px] font-bold uppercase tracking-widest ml-1 ${theme === 'light' ? 'text-slate-500' : 'text-white/40'}`}>Listings</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Divider - hidden on mobile */}
                        <div className="hidden md:block h-14 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent" />
                        {/* Mobile Divider */}
                        <div className="block md:hidden w-full h-px bg-white/5 opacity-50" />

                        {/* Middle: Categories - Perfectly centered vertically under listings on mobile */}
                        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-5 group/cat">
                            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 group-hover:rotate-12 transition-transform duration-500 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
                                <Tag size={24} strokeWidth={2.5} />
                            </div>
                            <div className="flex flex-col items-center md:items-start text-center md:text-left">
                                <span className={`text-3xl font-black tracking-tight ${theme === 'light' ? 'text-slate-800' : 'text-white/90'}`}>4000+</span>
                                <span className={`text-[10px] font-bold uppercase tracking-[0.25em] mt-0.5 ${theme === 'light' ? 'text-slate-400' : 'text-white/30'}`}>Business Categories</span>
                            </div>
                        </div>

                        {/* Divider - hidden on mobile */}
                        <div className="hidden md:block h-14 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent" />
                        {/* Mobile Divider */}
                        <div className="block md:hidden w-full h-px bg-white/5 opacity-50" />

                        {/* Right: CTA & Location */}
                        <div className="flex flex-col items-center md:items-end gap-5 w-full md:w-auto">

                            <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-primary/5 border border-primary/10">
                                <NavigationIcon size={12} className="text-primary animate-pulse" />
                                <span className={`text-[9px] font-black uppercase tracking-[0.4em] ${theme === 'light' ? 'text-primary/70' : 'text-primary'}`}>Across India</span>
                            </div>
                        </div>

                    </div>

                    {/* Bottom Status Decoration */}
                    <div className="absolute -bottom-px left-1/2 -translate-x-1/2 w-1/2 flex justify-center">
                        <motion.div
                            animate={{ opacity: [0.2, 0.5, 0.2], width: ['40%', '80%', '40%'] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            className="h-px bg-gradient-to-r from-transparent via-primary to-transparent blur-sm"
                        />
                    </div>
                </div>
            </motion.div>

        </section>
    );
}
