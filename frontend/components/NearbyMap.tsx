"use client";

import "mapbox-gl/dist/mapbox-gl.css";
import { useEffect, useRef, useState, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import { Search, X, MapPin, Phone, Star, Filter, Loader2, Navigation, SlidersHorizontal, Circle, ChevronDown, Globe, MessageCircle, Share2, ExternalLink } from "lucide-react";
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
    const [radius, setRadius] = useState(5000);
    const [mapLoaded, setMapLoaded] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [routeInfo, setRouteInfo] = useState<{ distance: number, duration: number, businessName: string } | null>(null);

    const API = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api");

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
            { timeout: 8000 }
        );
    }, [paramLat, paramLng]);

    useEffect(() => {
        if (!userLocation || !mapContainer.current || mapRef.current) return;

        mapboxgl.accessToken = MAPBOX_TOKEN;
        const map = new mapboxgl.Map({
            container: mapContainer.current,
            style: "mapbox://styles/prabhjotwork2004/cmn2zm0vd005701qy6oc8heo6",
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
                                0, "#0f172a", // Deep slate/navy base
                                15, "#1e293b",
                                30, "#334155",
                                60, "#475569",
                                150, "#64748b"  // Lighter tops
                            ],
                            "fill-extrusion-height": [
                                "interpolate", ["linear"], ["zoom"],
                                15, 0, 15.05, ["get", "height"]
                            ],
                            "fill-extrusion-base": [
                                "interpolate", ["linear"], ["zoom"],
                                15, 0, 15.05, ["get", "min_height"]
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
            new mapboxgl.Marker(userEl).setLngLat([userLocation.lng, userLocation.lat]).addTo(map);

            map.flyTo({ center: [userLocation.lng, userLocation.lat], zoom: 15, pitch: 62, bearing: -17, duration: 2500, essential: true });
            fetchNearbyBusinesses(userLocation.lat, userLocation.lng, category, radius);
        });

        map.on("moveend", () => {
            const center = map.getCenter();
            debouncedFetch(center.lat, center.lng, category, radius);
        });

        return () => {
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
            map.remove();
        };
    }, [userLocation]);

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
            el.style.cssText = "width: 54px; height: 54px; display: flex; align-items: center; justify-content: center; cursor: pointer; position: relative;";

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
                    width: 38px; height: 38px; border-radius: 50%;
                    background: rgba(10, 15, 35, 0.85); backdrop-filter: blur(8px);
                    border: 2px solid ${color};
                    display: flex; align-items: center; justify-content: center; color: white;
                    font-size: 18px; box-shadow: inset 0 0 8px ${color}66, 0 4px 10px rgba(0,0,0,0.5);
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
    }, [businesses, mapLoaded, searchQuery, paramId]);

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

    const zoomIn = () => mapRef.current?.zoomIn();
    const zoomOut = () => mapRef.current?.zoomOut();

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

            {/* Top Navigation Bar */}
            <div className="absolute top-0 left-0 right-0 z-20 p-4 md:p-6 flex items-start gap-2 md:gap-3 max-w-7xl mx-auto pointer-events-none">
                <div className="flex-1 flex flex-col gap-2 relative pointer-events-auto">
                    <div className="h-12 md:h-14 flex items-center gap-3 bg-black/40 backdrop-blur-2xl border border-white/20 rounded-2xl md:rounded-3xl px-4 md:px-6 shadow-[0_8px_32px_rgba(0,0,0,0.5)] transition-all focus-within:bg-black/60 focus-within:border-primary/50">
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
                        {searchQuery.trim().length > 0 && filteredBusinesses.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="absolute top-[60px] md:top-[64px] left-0 right-0 bg-black/80 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] overflow-hidden max-h-[60vh] overflow-y-auto"
                            >
                                <div className="p-2 flex flex-col gap-1">
                                    {filteredBusinesses.slice(0, 10).map((biz) => (
                                        <button
                                            key={biz._id}
                                            onClick={() => {
                                                setSelectedBusiness(biz);
                                                setSearchQuery(''); // Clear search on select to hide dropdown
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

                <div className="flex items-center gap-2 pointer-events-auto h-12 md:h-14">
                    <button onClick={zoomIn} className="w-12 h-12 md:w-14 md:h-14 rounded-2xl md:rounded-3xl bg-black/40 backdrop-blur-2xl border border-white/20 flex items-center justify-center text-white/90 hover:text-primary hover:bg-black/60 hover:border-primary/50 transition-all shadow-[0_8px_32px_rgba(0,0,0,0.5)] font-bold text-2xl shrink-0">+</button>
                    <button onClick={zoomOut} className="w-12 h-12 md:w-14 md:h-14 rounded-2xl md:rounded-3xl bg-black/40 backdrop-blur-2xl border border-white/20 flex items-center justify-center text-white/90 hover:text-primary hover:bg-black/60 hover:border-primary/50 transition-all shadow-[0_8px_32px_rgba(0,0,0,0.5)] font-bold text-2xl shrink-0">−</button>
                </div>

                <button onClick={onClose} className="w-12 h-12 md:w-14 md:h-14 rounded-2xl md:rounded-3xl bg-black/40 backdrop-blur-2xl border border-white/20 flex items-center justify-center text-white/90 hover:text-red-400 hover:bg-black/60 hover:border-red-500/50 transition-all shadow-[0_8px_32px_rgba(0,0,0,0.5)] pointer-events-auto shrink-0">
                    <X size={20} />
                </button>
            </div>

            {/* No Results Feedback */}
            <AnimatePresence>
                {searchQuery && filteredBusinesses.length === 0 && !loading && (
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="absolute top-20 left-1/2 -translate-x-1/2 z-20 px-6 py-3 bg-red-500/10 border border-red-500/20 backdrop-blur-xl rounded-2xl text-red-400 text-xs font-bold shadow-2xl">
                        No businesses found matching "{searchQuery}"
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Scanning / Loading UI */}
            <AnimatePresence>
                {(locating || (loading && businesses.length === 0)) && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-[#020631]/80 backdrop-blur-sm"
                    >
                        <div className="flex flex-col items-center justify-center text-center px-6">
                            <div className="relative mb-10">
                                <div className="w-32 h-32 border-4 border-primary/20 rounded-full animate-ping" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(59,130,246,0.6)] z-10 transition-transform duration-500">
                                        <MapPin size={32} className="text-white animate-bounce" />
                                    </div>
                                </div>
                                {/* Scanning wave */}
                                <div className="absolute inset-0 border-2 border-primary rounded-full animate-[spin_3s_linear_infinite] scale-125 opacity-20" style={{ borderRightColor: 'transparent', borderBottomColor: 'transparent' }} />
                                <div className="absolute inset-0 border-2 border-primary rounded-full animate-[spin_4s_linear_infinite_reverse] scale-150 opacity-10" style={{ borderLeftColor: 'transparent', borderTopColor: 'transparent' }} />
                            </div>

                            <h2 className="text-white text-2xl md:text-3xl font-black mb-3 tracking-tight uppercase">Scanning Area</h2>

                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

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
                                            `https://api.mapbox.com/directions/v5/mapbox/driving/${userLocation.lng},${userLocation.lat};${selectedBusiness.gpsCoordinates.lng},${selectedBusiness.gpsCoordinates.lat}?steps=true&geometries=geojson&access_token=${MAPBOX_TOKEN}`,
                                            { method: 'GET' }
                                        );
                                        const json = await query.json();
                                        const data = json.routes[0];
                                        const route = data.geometry.coordinates;
                                        const geojson = {
                                            type: 'Feature' as const,
                                            properties: {},
                                            geometry: {
                                                type: 'LineString' as const,
                                                coordinates: route
                                            }
                                        };

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

                                        map.addSource('route', {
                                            type: 'geojson',
                                            lineMetrics: true,
                                            data: geojson
                                        });

                                        // Layer 1: Outer Glow (wide, fuzzy)
                                        map.addLayer({
                                            id: 'route-glow',
                                            type: 'line',
                                            source: 'route',
                                            layout: { 'line-join': 'round', 'line-cap': 'round' },
                                            paint: {
                                                'line-color': '#0ea5e9',
                                                'line-width': 12,
                                                'line-blur': 8,
                                                'line-opacity': 0.4
                                            }
                                        });

                                        // Layer 2: Core Line (solid)
                                        map.addLayer({
                                            id: 'route-line',
                                            type: 'line',
                                            source: 'route',
                                            layout: { 'line-join': 'round', 'line-cap': 'round' },
                                            paint: {
                                                'line-color': '#38bdf8',
                                                'line-width': 4,
                                                'line-opacity': 0.9
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
                                            padding: {top: 100, bottom: 350, left: 100, right: 100},
                                            duration: 2000,
                                            pitch: 60,
                                            bearing: -20,
                                            essential: true
                                        });

                                        setSelectedBusiness(null); 
                                    } catch (err) {
                                        console.error("Could not fetch directions: ", err);
                                    }
                                }}
                                className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] uppercase font-black tracking-widest mt-6 hover:bg-blue-500/20 transition-all cursor-pointer"
                            >
                                <Navigation size={14} /> SHOW ROUTE
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
