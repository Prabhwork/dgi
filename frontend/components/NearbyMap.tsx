"use client";

import "mapbox-gl/dist/mapbox-gl.css";
import { useEffect, useRef, useState, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import { X, MapPin, Phone, Star, Filter, Loader2, Navigation, SlidersHorizontal, Circle, ChevronDown, Globe, MessageCircle, Share2, ExternalLink } from "lucide-react";
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
            style: "mapbox://styles/mapbox/dark-v11",
            center: [userLocation.lng, userLocation.lat],
            zoom: 14,
            pitch: 60,
            bearing: 30,
            antialias: true,
        });

        mapRef.current = map;

        map.on("load", () => {
            setMapLoaded(true);

            // Override Mapbox background and land layers to exactly match site #020631
            if (map.getLayer("background")) map.setPaintProperty("background", "background-color", "#020631");
            
            // Site-matched dark fog effect
            map.setFog({
                color: "#020631",
                "high-color": "#010421",
                "horizon-blend": 0.05,
                "space-color": "#010421",
                "star-intensity": 0.4
            });

            // Standard 3D Building Layer (Native Mapbox)
            map.addLayer({
                id: "3d-buildings",
                source: "composite",
                "source-layer": "building",
                filter: ["==", "extrude", "true"],
                type: "fill-extrusion",
                minzoom: 14,
                paint: {
                    "fill-extrusion-color": "#1e40af", // Slightly brighter blue for contrast
                    "fill-extrusion-height": ["interpolate", ["linear"], ["zoom"], 15, 0, 15.05, ["get", "height"]],
                    "fill-extrusion-base": ["interpolate", ["linear"], ["zoom"], 15, 0, 15.05, ["get", "min_height"]],
                    "fill-extrusion-opacity": 0.5
                }
            });

            // Glowing User Location Marker
            const el = document.createElement("div");
            el.innerHTML = `<div style="width:20px;height:20px;border-radius:50%;background:#0ea5e9;border:3px solid white;box-shadow:0 0 20px #0ea5e9;"></div>`;
            new mapboxgl.Marker(el).setLngLat([userLocation.lng, userLocation.lat]).addTo(map);

            map.flyTo({ center: [userLocation.lng, userLocation.lat], zoom: 15, pitch: 60, duration: 2500, essential: true });
            fetchNearbyBusinesses(userLocation.lat, userLocation.lng, category, radius);
        });

        map.on("moveend", () => {
            const center = map.getCenter();
            debouncedFetch(center.lat, center.lng, category, radius);
        });

        return () => map.remove();
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
            let color = "#3b82f6";
            let icon = "🏢";

            if (c.includes("food") || c.includes("rest") || c.includes("cafe")) { color = "#10b981"; icon = "🍴"; }
            else if (c.includes("health") || c.includes("hospi")) { color = "#ef4444"; icon = "🏥"; }
            else if (c.includes("shop") || c.includes("retail")) { color = "#ec4899"; icon = "🛍️"; }

            const el = document.createElement("div");
            el.className = "marker-glow-pin";
            el.style.width = "40px";
            el.style.height = "40px";
            
            el.innerHTML = `
                <div style="position: relative; width: 40px; height: 40px; cursor: pointer;">
                    <!-- Pin -->
                    <div style="
                        width: 40px; height: 40px; border-radius: 12px;
                        background: ${color}; border: 2.5px solid white;
                        display: flex; align-items: center; justify-content: center;
                        font-size: 20px; box-shadow: 0 0 20px ${color}66;
                        transition: all 0.2s ease-out;
                    " class="pin">
                        ${icon}
                        <!-- Pointer triangle -->
                        <div style="position:absolute; bottom: -8px; left: 50%; transform: translateX(-50%); width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 8px solid white;"></div>
                    </div>
                </div>
            `;

            const container = el;
            let labelPopup: mapboxgl.Popup | null = null;

            container.addEventListener("mouseenter", () => {
                const pin = container.querySelector(".pin") as HTMLElement;
                if (pin) pin.style.transform = "scale(1.15) translateY(-5px)";
                
                labelPopup = new mapboxgl.Popup({
                    closeButton: false,
                    closeOnClick: false,
                    offset: [0, -42],
                    className: 'business-label-popup'
                })
                .setLngLat([biz.gpsCoordinates.lng, biz.gpsCoordinates.lat])
                .setHTML(`
                    <div style="background: rgba(2, 6, 49, 0.9); backdrop-filter: blur(12px); color: white; padding: 6px 14px; border-radius: 12px; border: 2px solid ${color}; font-size: 13px; font-weight: 800; white-space: nowrap; box-shadow: 0 8px 32px rgba(0,0,0,0.4);">
                        ${biz.brandName || biz.businessName}
                    </div>
                `)
                .addTo(mapRef.current!);
            });

            container.addEventListener("mouseleave", () => {
                const pin = container.querySelector(".pin") as HTMLElement;
                if (pin) pin.style.transform = "scale(1) translateY(0)";
                if (labelPopup) { labelPopup.remove(); labelPopup = null; }
            });

            container.addEventListener("click", () => {
                setSelectedBusiness(biz);
                mapRef.current?.flyTo({
                    center: [biz.gpsCoordinates.lng, biz.gpsCoordinates.lat],
                    zoom: 17.5,
                    pitch: 60,
                    duration: 1200,
                    essential: true
                });
            });

            const marker = new mapboxgl.Marker({ element: container, anchor: "bottom" })
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
            <div className="absolute top-0 left-0 right-0 z-20 p-4 md:p-6 flex items-center gap-2 md:gap-3 max-w-7xl mx-auto">
                <div className="flex-1 h-12 md:h-14 flex items-center gap-3 bg-black/60 backdrop-blur-2xl border border-white/10 rounded-2xl md:rounded-3xl px-4 md:px-6 shadow-2xl transition-all focus-within:border-primary/50 focus-within:bg-black/80">
                    <MapPin size={18} className="text-primary animate-pulse shrink-0" />
                    <input 
                        type="text"
                        placeholder="Search for businesses..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        suppressHydrationWarning
                        className="bg-transparent border-none outline-none text-white text-sm md:text-base font-semibold flex-1 placeholder:text-white/20"
                    />
                    {loading && <Loader2 size={18} className="text-primary animate-spin shrink-0" />}
                </div>

                <div className="flex items-center gap-2">
                    <button onClick={zoomIn} className="w-12 h-12 md:w-14 md:h-14 rounded-2xl md:rounded-3xl bg-black/60 backdrop-blur-2xl border border-white/10 flex items-center justify-center text-white/70 hover:text-primary hover:border-primary/40 transition-all shadow-xl font-bold text-xl">+</button>
                    <button onClick={zoomOut} className="w-12 h-12 md:w-14 md:h-14 rounded-2xl md:rounded-3xl bg-black/60 backdrop-blur-2xl border border-white/10 flex items-center justify-center text-white/70 hover:text-primary hover:border-primary/40 transition-all shadow-xl font-bold text-xl">−</button>
                </div>

                <button onClick={onClose} className="w-12 h-12 md:w-14 md:h-14 rounded-2xl md:rounded-3xl bg-black/60 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white/70 hover:text-red-400 hover:bg-red-500/10 transition-all">
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
                            <p className="text-white/40 text-xs md:text-sm font-bold animate-pulse max-w-[280px] md:max-w-md tracking-wider">Finding nearby businesses in your city...</p>
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
                        <div className="relative bg-black/90 backdrop-blur-3xl border border-white/10 rounded-[2rem] md:rounded-[2.5rem] p-6 shadow-2xl w-full max-w-sm pointer-events-auto">
                            <button onClick={() => setSelectedBusiness(null)} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/30 hover:text-white transition-all"><X size={14} /></button>
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

                            <a 
                                href={`https://www.google.com/maps/dir/?api=1&destination=${selectedBusiness.gpsCoordinates.lat},${selectedBusiness.gpsCoordinates.lng}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] uppercase font-black tracking-widest mt-6 hover:bg-blue-500/20 transition-all"
                            >
                                <Navigation size={14} /> DIRECTION
                            </a>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
