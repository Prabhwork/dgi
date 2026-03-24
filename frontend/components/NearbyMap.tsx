"use client";

import "mapbox-gl/dist/mapbox-gl.css";
import { useEffect, useRef, useState, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import { Search, X, MapPin, Phone, Star, Filter, Loader2, Navigation as NavigationIcon, SlidersHorizontal, Circle, ChevronDown, Globe, MessageCircle, Share2, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

const CATEGORIES = ["All", "Food & Beverage", "Healthcare", "Retail", "Education", "Technology", "Finance", "Automobile", "Beauty & Wellness", "Real Estate"];

function debounce<T extends (...args: any[]) => void>(fn: T, delay: number) {
    let timer: ReturnType<typeof setTimeout>;
    return (...args: Parameters<T>) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
}

interface Business {
    _id: string;
    businessName: string;
    brandName?: string;
    businessCategory: string;
    description?: string;
    registeredOfficeAddress?: string;
    gpsCoordinates: { lat: number; lng: number };
    primaryContactNumber?: string;
    officialWhatsAppNumber?: string;
    website?: string;
    openingTime?: string;
    closingTime?: string;
    coverImage?: string;
    aadhaarVerified?: boolean;
    distanceKm?: number;
}

export default function NearbyMap({ onClose }: { onClose: () => void }) {
    const mapContainer = useRef<HTMLDivElement>(null);
    const mapRef = useRef<mapboxgl.Map | null>(null);
    const markersRef = useRef<mapboxgl.Marker[]>([]);
    const animationFrameRef = useRef<number | null>(null);
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [businesses, setBusinesses] = useState<Business[]>([]);
    const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
    const [loading, setLoading] = useState(true);
    const [locating, setLocating] = useState(true);
    const [filterOpen, setFilterOpen] = useState(false);
    const [category, setCategory] = useState("All");
    const [radius, setRadius] = useState(5000000); // 5000km default
    const [mapLoaded, setMapLoaded] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<Business[]>([]);
    const [routeInfo, setRouteInfo] = useState<{ distance: number, duration: number, businessName: string } | null>(null);
    const [isNavigating, setIsNavigating] = useState(false);
    const watchIdRef = useRef<number | null>(null);
    const userMarkerRef = useRef<mapboxgl.Marker | null>(null);
    const startMarkerRef = useRef<mapboxgl.Marker | null>(null);
    const [isAutoCentering, setIsAutoCentering] = useState(true);
    const autoCenteringRef = useRef(true);
    useEffect(() => { autoCenteringRef.current = isAutoCentering; }, [isAutoCentering]);
    const isProgrammaticMove = useRef(false);

    const API = (process.env.NEXT_PUBLIC_API_URL);

    const fetchNearbyBusinesses = useCallback(async (lat: number, lng: number, cat: string, rad: number) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ lat: lat.toString(), lng: lng.toString(), radius: rad.toString() });
            if (cat !== "All") params.set("category", cat);
            const res = await fetch(`${API}/business/nearby?${params.toString()}`);
            const data = await res.json();
            if (data.success) setBusinesses(data.data || []);
        } catch (e) {
            console.error("Failed to fetch nearby businesses:", e);
        } finally {
            setLoading(false);
        }
    }, [API]);

    const debouncedFetch = useCallback(
        debounce((lat: number, lng: number, cat: string, rad: number) => {
            fetchNearbyBusinesses(lat, lng, cat, rad);
        }, 600),
        [fetchNearbyBusinesses]
    );

    const searchParams = useSearchParams();
    const paramLat = searchParams.get("lat");
    const paramLng = searchParams.get("lng");
    const paramId = searchParams.get("id");

    useEffect(() => {
        if (paramLat && paramLng) {
            setUserLocation({ lat: parseFloat(paramLat), lng: parseFloat(paramLng) });
            setLocating(false);
            return;
        }

        // If a specific business ID is provided, center on it
        if (paramId) {
            const fetchTargetBusiness = async () => {
                try {
                    const res = await fetch(`${API}/business/public/${paramId}`);
                    const data = await res.json();
                    if (data.success && data.data.gpsCoordinates?.lat) {
                        setUserLocation({ 
                            lat: data.data.gpsCoordinates.lat, 
                            lng: data.data.gpsCoordinates.lng 
                        });
                        setLocating(false);
                        return;
                    }
                } catch (e) {
                    console.error("Failed to fetch business for map centering:", e);
                }
                
                // Fallback to current location if target fetch fails
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                        (pos) => {
                            setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                            setLocating(false);
                        },
                        () => {
                            setUserLocation({ lat: 28.6139, lng: 77.2090 });
                            setLocating(false);
                        }
                    );
                } else {
                    setUserLocation({ lat: 28.6139, lng: 77.2090 });
                    setLocating(false);
                }
            };
            fetchTargetBusiness();
            return;
        }

        if (!navigator.geolocation) { setLocating(false); return; }
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                setLocating(false);
            },
            () => {
                setUserLocation({ lat: 28.6139, lng: 77.2090 });
                setLocating(false);
            },
            { enableHighAccuracy: false, maximumAge: 60000, timeout: 5000 }
        );
    }, [paramLat, paramLng, paramId, API]);

    useEffect(() => {
        if (!userLocation || !mapContainer.current || mapRef.current) return;

        mapboxgl.accessToken = MAPBOX_TOKEN;
        const map = new mapboxgl.Map({
            container: mapContainer.current,
            style: "mapbox://styles/mapbox/dark-v11",
            center: [userLocation.lng, userLocation.lat],
            zoom: 14,
            pitch: 62,
            bearing: -17,
            antialias: true,
        });

        mapRef.current = map;

        map.on("load", () => {
            setMapLoaded(true);

            // Set futuristic atmosphere
            map.setFog({
                'color': '#020617',
                'high-color': '#1e293b',
                'horizon-blend': 0.15,
                'space-color': '#000000',
                'star-intensity': 0.6
            });
            // Add sky layer for cinematic atmosphere
            if (!map.getLayer('sky')) {
                map.addLayer({
                    'id': 'sky',
                    'type': 'sky',
                    'paint': {
                        'sky-type': 'gradient',
                        'sky-gradient': [
                            'interpolate',
                            ['linear'],
                            ['sky-radial-progress'],
                            0.8,
                            'rgba(2, 6, 49, 1)',
                            1,
                            'rgba(14, 165, 233, 1)'
                        ],
                        'sky-gradient-center': [0, 0],
                        'sky-gradient-radius': 90,
                        'sky-opacity': [
                            'interpolate',
                            ['exponential', 0.1],
                            ['zoom'],
                            5,
                            0,
                            22,
                            1
                        ]
                    }
                });
            }
            // 3D Buildings — Styled for a premium 'Cyber-India' night look
            try {
                if (!map.getLayer("3d-buildings") && map.getSource("composite")) {
                    map.addLayer({
                        id: "3d-buildings",
                        source: "composite",
                        "source-layer": "building",
                        filter: ["==", "extrude", "true"],
                        type: "fill-extrusion",
                        minzoom: 14,
                        paint: {
                            "fill-extrusion-color": [
                                "interpolate", ["linear"], ["get", "height"],
                                0, "#1e293b",
                                15, "#334155",
                                30, "#475569",
                                60, "#64748b",
                                150, "#94a3b8"
                            ],
                            "fill-extrusion-height": [
                                "interpolate", ["linear"], ["zoom"],
                                14, 0, 14.05, ["get", "height"]
                            ],
                            "fill-extrusion-base": [
                                "interpolate", ["linear"], ["zoom"],
                                14, 0, 14.05, ["get", "min_height"]
                            ],
                            "fill-extrusion-opacity": 0.85,
                            "fill-extrusion-vertical-gradient": true
                        }
                    });
                }
            } catch (layerErr) {
                console.warn("Could not add custom 3D buildings layer to this style:", layerErr);
            }

            // Glowing User Location Marker — Premium Pulse
            const userEl = document.createElement("div");
            userEl.className = "user-location-pulse";
            userEl.innerHTML = `
                <div style="position: relative; width: 24px; height: 24px;">
                    <div style="position: absolute; inset: 0; border-radius: 50%; background: #0ea5e9; opacity: 0.3; animate: dbi-ripple 2s infinite ease-out;"></div>
                    <div style="position: absolute; inset: 4px; border-radius: 50%; background: white; border: 3px solid #0ea5e9; box-shadow: 0 0 15px #0ea5e9;"></div>
                </div>
            `;
            userMarkerRef.current = new mapboxgl.Marker(userEl).setLngLat([userLocation.lng, userLocation.lat]).addTo(map);

            map.flyTo({ center: [userLocation.lng, userLocation.lat], zoom: 15, pitch: 62, bearing: -17, duration: 2500, essential: true });
        });

        // Start fetching businesses concurrently while the map style loads
        fetchNearbyBusinesses(userLocation.lat, userLocation.lng, category, radius);

        map.on("moveend", () => {
            const center = map.getCenter();
            debouncedFetch(center.lat, center.lng, category, radius);
        });

        const handleInteraction = () => {
            if (isNavigating && !isProgrammaticMove.current && autoCenteringRef.current) {
                console.log("Interaction detected from map event, pausing auto-centering");
                setIsAutoCentering(false);
            }
        };

        const handleDirectInteraction = () => {
            if (isNavigating && autoCenteringRef.current) {
                console.log("Direct DOM interaction detected (wheel/click), pausing auto-centering IMMEDIATELY");
                setIsAutoCentering(false);
            }
        };

        map.on("dragstart", handleInteraction);
        map.on("zoomstart", handleInteraction);
        map.on("pitchstart", handleInteraction);
        map.on("rotate", handleInteraction);

        const container = mapContainer.current;
        if (container) {
            container.addEventListener('mousedown', handleDirectInteraction, { capture: true, passive: true });
            container.addEventListener('touchstart', handleDirectInteraction, { capture: true, passive: true });
            container.addEventListener('wheel', handleDirectInteraction, { capture: true, passive: true });
        }

        return () => {
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
            if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
            map.remove();
            mapRef.current = null;
            if (container) {
                container.removeEventListener('mousedown', handleDirectInteraction, { capture: true });
                container.removeEventListener('touchstart', handleDirectInteraction, { capture: true });
                container.removeEventListener('wheel', handleDirectInteraction, { capture: true });
            }
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userLocation !== null]); 

    // Keep user marker and camera updated during navigation
    useEffect(() => {
        if (userMarkerRef.current && userLocation) {
            userMarkerRef.current.setLngLat([userLocation.lng, userLocation.lat]);
            userMarkerRef.current.getElement().style.display = isNavigating ? 'none' : 'block';
        }
    }, [userLocation, isNavigating]);

    const initialSelectPerformed = useRef(false);

    useEffect(() => {
        if (!mapLoaded) return;

        // Clear markers
        markersRef.current.forEach(m => m.remove());
        markersRef.current = [];

        // Local filtering by search query
        const filtered = businesses.filter(b =>
            (b.brandName || b.businessName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
            (b.businessCategory || "").toLowerCase().includes(searchQuery.toLowerCase())
        );

        filtered.forEach(biz => {
            if (!biz.gpsCoordinates?.lat || !biz.gpsCoordinates?.lng) return;

            const c = (biz.businessCategory || "").toLowerCase();
            let color = "#60a5fa";   // default blue
            let symbol = "📍";

            if (c.includes("food") || c.includes("rest") || c.includes("cafe")) {
                color = "#34d399"; symbol = "🍔";
            } else if (c.includes("health") || c.includes("hospi")) {
                color = "#f87171"; symbol = "🏥";
            } else if (c.includes("shop") || c.includes("retail")) {
                color = "#f472b6"; symbol = "🛒";
            } else if (c.includes("tech") || c.includes("it") || c.includes("software")) {
                color = "#a78bfa"; symbol = "💻";
            } else if (c.includes("edu") || c.includes("school") || c.includes("college")) {
                color = "#fbbf24"; symbol = "🎓";
            }

            const el = document.createElement("div");
            el.className = "dbi-premium-marker";
            el.style.cssText = "width: 80px; height: 80px; display: flex; align-items: center; justify-content: center; cursor: pointer; position: relative;";

            el.innerHTML = `
                <style>
                    @keyframes dbi-pulse-${color.replace('#', '')} {
                        0% { transform: scale(0.9); box-shadow: 0 0 0 0 ${color}88; }
                        70% { transform: scale(1); box-shadow: 0 0 0 12px rgba(0,0,0,0); }
                        100% { transform: scale(0.9); box-shadow: 0 0 0 0 rgba(0,0,0,0); }
                    }
                </style>
                <div class="dbi-glass-pin" style="
                    position: relative; z-index: 2;
                    width: 56px; height: 56px; border-radius: 50%;
                    background: rgba(10, 15, 35, 0.85); backdrop-filter: blur(8px);
                    border: 2.5px solid ${color};
                    display: flex; align-items: center; justify-content: center; color: white;
                    font-size: 28px; box-shadow: inset 0 0 12px ${color}66, 0 6px 15px rgba(0,0,0,0.6);
                    animation: dbi-pulse-${color.replace('#', '')} 2.5s infinite;
                    transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                ">
                    <span style="filter: drop-shadow(0 0 3px ${color});">${symbol}</span>
                </div>
            `;

            const pinCard = el.querySelector(".dbi-glass-pin") as HTMLElement;
            let labelPopup: mapboxgl.Popup | null = null;

            el.addEventListener("mouseenter", () => {
                if (pinCard) {
                    pinCard.style.transform = "scale(1.2) translateY(-4px)";
                    pinCard.style.background = "rgba(30, 40, 70, 0.95)";
                }
                labelPopup = new mapboxgl.Popup({
                    closeButton: false,
                    closeOnClick: false,
                    offset: [0, -25],
                    className: 'business-label-popup'
                })
                    .setLngLat([biz.gpsCoordinates.lng, biz.gpsCoordinates.lat])
                    .setHTML(`
                    <div style="
                        background: rgba(10, 15, 35, 0.95); backdrop-filter: blur(20px);
                        color: white; padding: 6px 14px; border-radius: 12px;
                        border: 1.5px solid ${color}88; font-size: 13px; font-weight: 800;
                        white-space: nowrap; box-shadow: 0 10px 40px rgba(0,0,0,0.6);
                        display: flex; flex-direction: column; align-items: center; gap: 2px;
                    ">
                        <span style="font-family: inherit; letter-spacing: 0.02em;">${biz.brandName || biz.businessName}</span>
                    </div>
                `)
                    .addTo(mapRef.current!);
            });

            el.addEventListener("mouseleave", () => {
                if (pinCard) {
                    pinCard.style.transform = "scale(1) translateY(0)";
                    pinCard.style.background = "rgba(10, 15, 35, 0.85)";
                }
                if (labelPopup) { labelPopup.remove(); labelPopup = null; }
            });

            el.addEventListener("click", () => {
                setSelectedBusiness(biz);
                mapRef.current?.flyTo({
                    center: [biz.gpsCoordinates.lng, biz.gpsCoordinates.lat],
                    zoom: 17.5,
                    pitch: 60,
                    duration: 1200,
                    essential: true
                });
            });

            // Center anchor is best for circular pins
            const marker = new mapboxgl.Marker({ element: el, anchor: "center" })
                .setLngLat([biz.gpsCoordinates.lng, biz.gpsCoordinates.lat])
                .addTo(mapRef.current!);
            markersRef.current.push(marker);
        });
    }, [businesses, mapLoaded, searchQuery]); // Added searchQuery dependency for local filtering

    // Global search logic
    useEffect(() => {
        if (searchQuery.trim().length === 0) {
            setSearchResults([]);
            return;
        }

        const fetchSearchResults = async () => {
            setLoading(true);
            try {
                // Global search with user location for distance calculation
                let url = `${API}/business/search?q=${searchQuery}`;
                if (userLocation) {
                    url += `&lat=${userLocation.lat}&lng=${userLocation.lng}`;
                }
                const res = await fetch(url);
                const data = await res.json();
                if (data.success) {
                    setSearchResults(data.data);
                }
            } catch (e) {
                console.error("Search failed:", e);
            } finally {
                setLoading(false);
            }
        };

        const timer = setTimeout(fetchSearchResults, 300);
        return () => clearTimeout(timer);
    }, [searchQuery, API]);

    useEffect(() => {
        // Handle initial selection from URL ID - DRY: Only once
        if (paramId && businesses.length > 0 && !initialSelectPerformed.current) {
            const biz = businesses.find(b => b._id === paramId);
            if (biz) {
                initialSelectPerformed.current = true;
                setSelectedBusiness(biz);
                mapRef.current?.flyTo({
                    center: [biz.gpsCoordinates.lng, biz.gpsCoordinates.lat],
                    zoom: 17.5,
                    pitch: 60,
                    duration: 1200,
                    essential: true
                });
            }
        }
    }, [businesses, mapLoaded, paramId]); // Removed searchQuery from this dependency array

    const formatTime = (t: string) => {
        if (!t) return "";
        const [h, m] = t.split(":");
        const hr = parseInt(h);
        return `${(hr % 12 || 12).toString().padStart(2, "0")}:${m} ${hr >= 12 ? "PM" : "AM"}`;
    };

    const handleShare = async (biz: Business) => {
        const shareData = { title: biz.brandName || biz.businessName, text: `Check out ${biz.brandName || biz.businessName} on DBI!`, url: `${window.location.origin}/business/${biz._id}` };
        try {
            if (navigator.share) await navigator.share(shareData);
            else { await navigator.clipboard.writeText(shareData.url); alert("Link copied!"); }
        } catch (e) { console.error(e); }
    };

    const zoomIn = () => {
        if (isNavigating) setIsAutoCentering(false);
        mapRef.current?.zoomIn();
    };
    const zoomOut = () => {
        if (isNavigating) setIsAutoCentering(false);
        mapRef.current?.zoomOut();
    };

    const siteBackground = {
        backgroundImage: `
            radial-gradient(at 0% 0%, hsla(210, 100%, 56%, 0.15) 0px, transparent 50%),
            radial-gradient(at 100% 0%, hsla(255, 60%, 69%, 0.1) 0px, transparent 50%),
            radial-gradient(at 100% 100%, hsla(185, 100%, 50%, 0.05) 0px, transparent 50%),
            radial-gradient(at 0% 100%, hsla(210, 100%, 56%, 0.1) 0px, transparent 50%)
        `,
        backgroundColor: "#020631"
    };

    const filteredBusinesses = businesses.filter(b =>
        (b.brandName || b.businessName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (b.businessCategory || "").toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="relative w-full h-screen overflow-hidden font-display" style={siteBackground}>
            <div ref={mapContainer} className="absolute inset-0 w-full h-full" style={{ backgroundColor: 'transparent' }} />

            {/* Active Navigation Header */}
            <AnimatePresence>
                {isNavigating && (
                    <motion.div initial={{ y: -100 }} animate={{ y: 0 }} exit={{ y: -100 }} className="absolute top-0 left-0 right-0 z-40 bg-black/40 backdrop-blur-2xl p-4 flex items-center justify-between shadow-[0_10px_40px_rgba(0,0,0,0.5)] border-b border-primary/30">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="absolute inset-0 bg-primary/20 blur-lg rounded-full animate-pulse" />
                                <NavigationIcon size={24} className="text-primary relative z-10 animate-bounce" />
                            </div>
                            <div>
                                <h2 className="text-white font-black text-xl tracking-tighter leading-tight flex items-center gap-2">
                                    NAVIGATING
                                    <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
                                </h2>
                                <p className="text-primary/60 font-bold text-[10px] uppercase tracking-[0.2em]">Live Traffic Feed Active</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => {
                                    setIsNavigating(false);
                                    setIsAutoCentering(true);
                                    if (watchIdRef.current !== null) {
                                        navigator.geolocation.clearWatch(watchIdRef.current);
                                        watchIdRef.current = null;
                                    }
                                    // Remove route markers
                                    if (startMarkerRef.current) {
                                        startMarkerRef.current.remove();
                                        startMarkerRef.current = null;
                                    }
                                    mapRef.current?.easeTo({ pitch: 45, zoom: 15, duration: 1500 });
                                }}
                                className="bg-red-500 text-white font-bold py-2 px-6 rounded-xl shadow-lg border border-red-400 hover:bg-red-600 transition-all flex items-center gap-2"
                            >
                                <X size={16} />
                                STOP
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Google-style Re-center Button */}
            <AnimatePresence>
                {isNavigating && !isAutoCentering && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="absolute bottom-32 md:bottom-40 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
                    >
                        <button
                            onClick={() => {
                                setIsAutoCentering(true);
                                if (userLocation) {
                                    isProgrammaticMove.current = true;
                                    mapRef.current?.flyTo({
                                        center: [userLocation.lng, userLocation.lat],
                                        zoom: 19,
                                        pitch: 75,
                                        duration: 1500,
                                        essential: true
                                    });
                                    setTimeout(() => { isProgrammaticMove.current = false; }, 1600);
                                }
                            }}
                            className="pointer-events-auto bg-black/60 backdrop-blur-2xl text-white font-black py-3 px-8 rounded-full border border-primary/50 shadow-[0_0_40px_rgba(14,165,233,0.4)] flex items-center gap-3 hover:bg-black/80 hover:border-primary transition-all group scale-110"
                        >
                            <div className="relative">
                                <div className="absolute inset-0 bg-primary/40 blur-md rounded-full animate-pulse" />
                                <NavigationIcon size={20} className="text-primary relative z-10 rotate-45" />
                            </div>
                            <span className="tracking-widest uppercase text-xs">RE-CENTER</span>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Top Navigation Bar */}
            <div className="absolute top-0 left-0 right-0 z-20 p-3 md:p-6 flex flex-col md:flex-row items-stretch md:items-start gap-3 max-w-7xl mx-auto pointer-events-none">
                <div className="flex-1 flex flex-col gap-2 relative pointer-events-auto order-2 md:order-1">
                    <div className="h-12 md:h-14 flex items-center gap-3 bg-black/40 backdrop-blur-3xl border border-white/20 rounded-2xl md:rounded-3xl px-4 md:px-6 shadow-[0_8px_32px_rgba(0,0,0,0.5)] transition-all focus-within:bg-black/60 focus-within:border-primary/50">
                        <Search size={18} className="text-primary animate-pulse shrink-0" />
                        <input
                            type="text"
                            placeholder="Search for businesses..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            suppressHydrationWarning
                            className="bg-transparent border-none outline-none text-white text-sm md:text-base font-semibold flex-1 placeholder:text-white/50"
                        />
                        {loading && <Loader2 size={18} className="text-primary animate-spin shrink-0" />}
                    </div>

                    {/* Search Results Dropdown */}
                    <AnimatePresence>
                        {searchQuery.trim().length > 0 && searchResults.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="absolute top-[60px] md:top-[64px] left-0 right-0 bg-black/80 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] overflow-hidden max-h-[60vh] overflow-y-auto"
                            >
                                <div className="p-2 flex flex-col gap-1">
                                    {searchResults.slice(0, 10).map((biz) => (
                                        <button
                                            key={biz._id}
                                            onClick={() => {
                                                setSelectedBusiness(biz);
                                                setSearchQuery(''); // Clear search on select to hide dropdown
                                                
                                                // If business is not in the current nearby list, add it so it gets a marker
                                                if (!businesses.find(b => b._id === biz._id)) {
                                                    setBusinesses(prev => [...prev, biz]);
                                                }

                                                mapRef.current?.flyTo({
                                                    center: [biz.gpsCoordinates.lng, biz.gpsCoordinates.lat],
                                                    zoom: 17.5,
                                                    pitch: 60,
                                                    duration: 1200,
                                                    essential: true
                                                });
                                            }}
                                            className="flex items-center gap-3 w-full p-3 md:p-4 hover:bg-white/10 transition-colors rounded-xl text-left border border-transparent hover:border-white/5"
                                        >
                                            <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
                                                <MapPin size={16} className="text-primary" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-white font-bold text-sm md:text-base truncate">{biz.brandName || biz.businessName}</h4>
                                                <p className="text-white/50 text-xs truncate max-w-[90%]">{biz.registeredOfficeAddress}</p>
                                            </div>
                                            {biz.distanceKm && (
                                                <span className="text-primary/80 text-xs font-semibold whitespace-nowrap bg-primary/10 px-2 py-1 rounded-md">
                                                    {biz.distanceKm.toFixed(1)} km
                                                </span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="flex items-center justify-between gap-2 pointer-events-auto order-1 md:order-2">
                    <div className="flex items-center gap-2">
                        <button onClick={zoomIn} className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-3xl bg-black/40 backdrop-blur-3xl border border-white/20 flex items-center justify-center text-white/90 hover:text-primary hover:bg-black/60 hover:border-primary/50 transition-all shadow-lg font-bold text-xl md:text-2xl shrink-0">+</button>
                        <button onClick={zoomOut} className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-3xl bg-black/40 backdrop-blur-3xl border border-white/20 flex items-center justify-center text-white/90 hover:text-primary hover:bg-black/60 hover:border-primary/50 transition-all shadow-lg font-bold text-xl md:text-2xl shrink-0">−</button>
                    </div>

                    <button onClick={onClose} className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-3xl bg-black/40 backdrop-blur-3xl border border-white/20 flex items-center justify-center text-white/90 hover:text-red-400 hover:bg-black/60 hover:border-red-500/50 transition-all shadow-lg shrink-0">
                        <X size={18} />
                    </button>
                </div>
            </div>

            {/* No Results Feedback */}
            <AnimatePresence>
                {searchQuery && searchResults.length === 0 && !loading && (
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="absolute top-20 left-1/2 -translate-x-1/2 z-20 px-6 py-3 bg-red-500/10 border border-red-500/20 backdrop-blur-xl rounded-2xl text-red-400 text-xs font-bold shadow-2xl">
                        No businesses found matching "{searchQuery}"
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Scanning / Loading UI Removed */}

            {/* CSS for animations & Mapbox Overrides */}
            <style>{`
                @keyframes pulse {
                    0% { transform: translate(-50%,-50%) scale(1); opacity: 1; }
                    100% { transform: translate(-50%,-50%) scale(2.5); opacity: 0; }
                }
                .3d-object {
                    transform-style: preserve-3d;
                }
                /* Hide Mapbox default bubble for our labels */
                .business-label-popup .mapboxgl-popup-content {
                    background: none !important;
                    box-shadow: none !important;
                    padding: 0 !important;
                    border: none !important;
                }
                .business-label-popup .mapboxgl-popup-tip {
                    display: none !important;
                }
                input::placeholder {
                    color: rgba(255,255,255,0.3);
                }
            `}</style>

            {/* Business Detail Card */}
            <AnimatePresence>
                {selectedBusiness && (
                    <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }} className="absolute bottom-6 md:bottom-8 left-0 right-0 z-20 px-4 flex justify-center pointer-events-none">
                        <div className="relative bg-black/40 backdrop-blur-3xl border border-white/20 rounded-[2rem] md:rounded-[2.5rem] p-6 shadow-[0_15px_60px_rgba(0,0,0,0.8)] w-full max-w-sm pointer-events-auto">
                            <button onClick={() => setSelectedBusiness(null)} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/20 hover:scale-110 transition-all"><X size={14} /></button>
                            <h3 className="text-white font-black text-xl mb-1 truncate pr-8">{selectedBusiness.brandName || selectedBusiness.businessName}</h3>
                            <span className="text-primary text-[10px] md:text-xs font-bold uppercase mb-4 block tracking-[0.2em]">{selectedBusiness.businessCategory}</span>

                            <p className="text-white/40 text-[11px] md:text-xs mb-6 leading-relaxed flex items-start gap-2">
                                <MapPin size={14} className="text-primary shrink-0 mt-0.5" />
                                {selectedBusiness.registeredOfficeAddress}
                            </p>

                            <div className="grid grid-cols-2 gap-2 mb-3">
                                <Link href={`/business/${selectedBusiness._id}`} className="flex items-center justify-center gap-2 bg-primary text-white font-black text-sm py-4 rounded-2xl hover:scale-[1.02] transition-all"><ExternalLink size={16} /> Details</Link>
                                <button onClick={() => handleShare(selectedBusiness)} className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 text-white font-black text-sm py-4 rounded-2xl hover:bg-white/10 transition-all"><Share2 size={16} /> Share</button>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                {selectedBusiness.primaryContactNumber && (
                                    <a href={`tel:${selectedBusiness.primaryContactNumber}`} className="flex items-center justify-center gap-2 bg-blue-600/20 border border-blue-500/20 text-blue-400 font-bold text-xs py-3.5 rounded-2xl hover:bg-blue-600/30 transition-all"><Phone size={14} /> Call</a>
                                )}
                                <a href={`https://wa.me/${selectedBusiness.officialWhatsAppNumber || selectedBusiness.primaryContactNumber}`} target="_blank" className="flex items-center justify-center gap-2 bg-[#25D366]/20 border border-[#25D366]/20 text-[#25D366] font-bold text-xs py-3.5 rounded-2xl hover:bg-[#25D366]/30 transition-all"><MessageCircle size={14} /> WhatsApp</a>
                            </div>

                            <button
                                onClick={async () => {
                                    if (!mapRef.current || !userLocation) return;
                                    try {
                                         const query = await fetch(
                                             `https://api.mapbox.com/directions/v5/mapbox/driving-traffic/${userLocation.lng},${userLocation.lat};${selectedBusiness.gpsCoordinates.lng},${selectedBusiness.gpsCoordinates.lat}?steps=true&geometries=geojson&annotations=congestion&access_token=${MAPBOX_TOKEN}`,
                                             { method: 'GET' }
                                         );
                                         let json = await query.json();
                                         if (!json || !json.routes || json.routes.length === 0) {
                                             console.warn("Traffic route failed, trying standard driving...");
                                             const fallbackQuery = await fetch(
                                                 `https://api.mapbox.com/directions/v5/mapbox/driving/${userLocation.lng},${userLocation.lat};${selectedBusiness.gpsCoordinates.lng},${selectedBusiness.gpsCoordinates.lat}?steps=true&geometries=geojson&access_token=${MAPBOX_TOKEN}`,
                                                 { method: 'GET' }
                                             );
                                             json = await fallbackQuery.json();
                                         }

                                         if (!json || !json.routes || json.routes.length === 0) {
                                             alert("No route found for this destination.");
                                             console.error("Mapbox Error:", json);
                                             return;
                                         }
                                         const data = json.routes[0];
                                         const userCoord = [userLocation.lng, userLocation.lat] as [number, number];
                                         const rawRoute = data.geometry.coordinates;
                                         // Prepend exact user GPS to the snapped road route
                                         const route = [userCoord, ...rawRoute];

                                        setRouteInfo({
                                            distance: data.distance / 1000,
                                            duration: data.duration / 60,
                                            businessName: selectedBusiness.brandName || selectedBusiness.businessName
                                        });

                                        const map = mapRef.current;
                                        if (!map) return;

                                        // Clear existing route layers if they exist
                                        ['route-glow', 'route-line', 'route-particles'].forEach(id => {
                                            if (map.getLayer(id)) map.removeLayer(id);
                                        });
                                        if (map.getSource('route')) map.removeSource('route');
                                        
                                        if (startMarkerRef.current) {
                                            startMarkerRef.current.remove();
                                            startMarkerRef.current = null;
                                        }
                                        const startCoord = route[0];
                                         const nextCoord = route[1] || route[0];
                                         // Correct bearing math
                                         const bearing = nextCoord ? (Math.atan2(nextCoord[0] - startCoord[0], nextCoord[1] - startCoord[1]) * 180 / Math.PI) : 0;
 
                                         const startEl = document.createElement("div");
                                         startEl.className = "navigation-vehicle-marker";
                                         startEl.style.zIndex = "1000";
                                         startEl.innerHTML = `
                                             <div style="transform: rotate(${bearing}deg); filter: drop-shadow(0 0 15px rgba(14,165,233,0.8)); transition: transform 0.3s ease-out;">
                                                 <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                     <path d="M12 2L19 21L12 17L5 21L12 2Z" fill="#0ea5e9" stroke="white" stroke-width="2" stroke-linejoin="round"/>
                                                     <circle cx="12" cy="14" r="2" fill="white" opacity="0.5"/>
                                                 </svg>
                                             </div>
                                         `;
                                         startMarkerRef.current = new mapboxgl.Marker({ element: startEl, rotationAlignment: 'map' }).setLngLat(startCoord).addTo(map);

                                         // Prepare traffic-aware geojson
                                         const rawCongestion = data.legs[0].annotation?.congestion || [];
                                         // Prepend 'unknown' or 'low' for the segment from home to road
                                         const congestion = ['low', ...rawCongestion];
                                         
                                         const features = [];
                                         if (congestion && congestion.length > 0) {
                                             for (let i = 0; i < route.length - 1; i++) {
                                                 features.push({
                                                     type: 'Feature',
                                                     geometry: {
                                                         type: 'LineString',
                                                         coordinates: [route[i], route[i+1]]
                                                     },
                                                     properties: {
                                                         congestion: congestion[i] || 'unknown'
                                                     }
                                                 });
                                             }
                                         }
 
                                         map.addSource('route', {
                                             type: 'geojson',
                                             data: {
                                                 type: 'FeatureCollection',
                                                 features: features as any
                                             }
                                         });

                                        // Layer 1: Outer Glow (Traffic Colored)
                                        map.addLayer({
                                            id: 'route-glow',
                                            type: 'line',
                                            source: 'route',
                                            layout: { 'line-join': 'round', 'line-cap': 'round' },
                                            paint: {
                                                'line-color': [
                                                    'match',
                                                    ['get', 'congestion'],
                                                    'low', '#22c55e',
                                                    'moderate', '#eab308',
                                                    'heavy', '#f97316',
                                                    'severe', '#ef4444',
                                                    '#0ea5e9' // default
                                                ],
                                                'line-width': 16,
                                                'line-blur': 12,
                                                'line-opacity': 0.25
                                            }
                                        });

                                        // Layer 2: Core Line (Traffic Colored)
                                         map.addLayer({
                                             id: 'route-line',
                                             type: 'line',
                                             source: 'route',
                                             layout: { 'line-join': 'round', 'line-cap': 'round' },
                                             paint: {
                                                 'line-color': [
                                                     'match',
                                                     ['get', 'congestion'],
                                                     'low', '#22c55e',
                                                     'moderate', '#eab308',
                                                     'heavy', '#f97316',
                                                     'severe', '#ef4444',
                                                     '#38bdf8' // default
                                                 ],
                                                 'line-width': 6,
                                                 'line-opacity': 1
                                             }
                                         });

                                        // Layer 3: Moving Particles (dashed line on top)
                                        map.addLayer({
                                            id: 'route-particles',
                                            type: 'line',
                                            source: 'route',
                                            layout: { 'line-join': 'round', 'line-cap': 'round' },
                                            paint: {
                                                'line-color': '#ffffff',
                                                'line-width': 3,
                                                'line-dasharray': [0, 4, 1, 4],
                                                'line-opacity': 0.8
                                            }
                                        });

                                        // Animation loop for particles
                                        let step = 0;
                                        const animate = () => {
                                            step = (step + 0.2) % 10;
                                            if (map.getLayer('route-particles')) {
                                                map.setPaintProperty('route-particles', 'line-dasharray', [0, step, 1, 10 - step]);
                                                animationFrameRef.current = requestAnimationFrame(animate);
                                            }
                                        };
                                        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
                                        animate();
                                        
                                        // Fit bounds with cinematic tilt
                                        const bounds = route.reduce((bounds: mapboxgl.LngLatBounds, coord: any) => {
                                            return bounds.extend(coord);
                                        }, new mapboxgl.LngLatBounds(route[0], route[0]));
                                        
                                        map.fitBounds(bounds, {
                                            padding: {top: 150, bottom: 350, left: 50, right: 50},
                                            duration: 2500,
                                            pitch: 62,
                                            bearing: bearing, // Align map with route start
                                            essential: true
                                        });

                                        setSelectedBusiness(null); 
                                    } catch (err) {
                                        console.error("Could not fetch directions: ", err);
                                    }
                                }}
                                className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] uppercase font-black tracking-widest mt-6 hover:bg-blue-500/20 transition-all cursor-pointer"
                            >
                                <NavigationIcon size={14} /> SHOW ROUTE
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Route Info Card */}
            <AnimatePresence>
                {routeInfo && !selectedBusiness && (
                    <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }} className="absolute bottom-6 md:bottom-8 left-0 right-0 z-20 px-4 flex justify-center pointer-events-none">
                        <div className="relative bg-[#020617]/40 backdrop-blur-3xl border border-primary/40 rounded-[2.5rem] p-6 shadow-[0_20px_80px_rgba(14,165,233,0.3)] w-full max-w-sm pointer-events-auto flex items-center justify-between overflow-hidden">
                            {/* Animated Scanner Background Effect */}
                            <motion.div 
                                animate={{ y: ['100%', '-100%'] }} 
                                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/10 to-transparent h-1/2 pointer-events-none"
                            />

                            <div className="flex flex-col relative z-10">
                                <span className="text-primary/80 text-[10px] md:text-xs font-black uppercase tracking-[0.3em] mb-2 flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                    Scanning Destination
                                </span>
                                <h4 className="text-white/60 text-[10px] md:text-xs font-bold uppercase tracking-wider mb-1">Route to {routeInfo.businessName}</h4>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-white font-black text-2xl md:text-3xl tracking-tighter">
                                        {routeInfo.duration > 60 ? `${Math.floor(routeInfo.duration/60)}h ${Math.round(routeInfo.duration%60)}m` : `${Math.round(routeInfo.duration)} MIN`}
                                    </span>
                                    <span className="text-primary/60 text-xs font-bold tracking-widest uppercase">({routeInfo.distance.toFixed(1)} KM)</span>
                                </div>
                                {!isNavigating && (
                                    <button
                                        onClick={() => {
                                            setIsNavigating(true);
                                            // Get route bearing again for precise alignment
                                            const map = mapRef.current!;
                                            let bearing = 0;
                                            if (startMarkerRef.current) {
                                                const transform = startMarkerRef.current.getElement().querySelector('div')?.style.transform;
                                                const match = transform?.match(/rotate\((.*)deg\)/);
                                                if (match && match[1]) bearing = parseFloat(match[1]);
                                            }
                                            
                                            map.flyTo({ 
                                                center: [userLocation!.lng, userLocation!.lat], 
                                                zoom: 19, 
                                                pitch: 75, 
                                                bearing: bearing,
                                                duration: 2000 
                                            });
                                            if (navigator.geolocation) {
                                                watchIdRef.current = navigator.geolocation.watchPosition(
                                                    (pos) => {
                                                        const lat = pos.coords.latitude;
                                                        const lng = pos.coords.longitude;
                                                        const heading = pos.coords.heading;
                                                        setUserLocation({ lat, lng });
                                                                                          // Animate map smoothly as they move
                                                         // Animate map smoothly as they move
                                                         if (autoCenteringRef.current) {
                                                             isProgrammaticMove.current = true;
                                                             mapRef.current?.easeTo({
                                                                 center: [lng, lat],
                                                                 bearing: heading !== null && !isNaN(heading) ? heading : mapRef.current.getBearing(),
                                                                 pitch: 75,
                                                                 zoom: 19,
                                                                 duration: 1000,
                                                                 easing: (t) => t
                                                             });
                                                             setTimeout(() => { isProgrammaticMove.current = false; }, 1100);
                                                         }
                                                         
                                                         // Always update arrow position and bearing
                                                         if (startMarkerRef.current) {
                                                             startMarkerRef.current.setLngLat([lng, lat]);
                                                             const arrowDiv = startMarkerRef.current.getElement().querySelector('div');
                                                             if (arrowDiv && heading !== null && !isNaN(heading)) {
                                                                 arrowDiv.style.transform = `rotate(${heading}deg)`;
                                                             }
                                                         }
                                                    },
                                                    (err) => console.log("Watch pos err:", err),
                                                    { enableHighAccuracy: true, maximumAge: 0 }
                                                );
                                            }
                                        }}
                                        className="mt-4 bg-primary text-white font-bold py-2 px-6 rounded-xl hover:bg-primary/80 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(59,130,246,0.4)]"
                                    >
                                        <NavigationIcon size={16} /> START NAV
                                    </button>
                                )}
                            </div>
                            <button 
                                onClick={() => {
                                    setRouteInfo(null);
                                    if (mapRef.current) {
                                        const map = mapRef.current;
                                        ['route-glow', 'route-line', 'route-particles'].forEach(id => {
                                            if (map.getLayer(id)) map.removeLayer(id);
                                        });
                                        if (map.getSource('route')) map.removeSource('route');
                                        if (startMarkerRef.current) {
                                            startMarkerRef.current.remove();
                                            startMarkerRef.current = null;
                                        }
                                        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
                                    }
                                    if (userLocation) {
                                        mapRef.current?.flyTo({ center: [userLocation.lng, userLocation.lat], zoom: 15, pitch: 45, duration: 2000 });
                                    }
                                }}
                                className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 hover:text-white flex items-center justify-center transition-all flex-shrink-0 z-10"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
