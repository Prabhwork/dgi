"use client";

import "mapbox-gl/dist/mapbox-gl.css";
import { useEffect, useRef, useState, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import { Search, X, MapPin, Phone, Star, Filter, Loader2, Navigation as NavigationIcon, SlidersHorizontal, Circle, ChevronDown, Globe, MessageCircle, Share2, ExternalLink, Octagon, Mic, MicOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";
const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

const CATEGORIES = ["All", "Food & Beverage", "Healthcare", "Retail", "Education", "Technology", "Finance", "Automobile", "Beauty & Wellness", "Real Estate"];

function debounce<T extends (...args: any[]) => void>(fn: T, delay: number) {
    let timer: ReturnType<typeof setTimeout>;
    return (...args: Parameters<T>) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
}

function decodePolyline(encoded: string): [number, number][] {
    const points: [number, number][] = [];
    let index = 0, len = encoded.length;
    let lat = 0, lng = 0;

    while (index < len) {
        let b, shift = 0, result = 0;
        do {
            b = encoded.charCodeAt(index++) - 63;
            result |= (b & 0x1f) << shift;
            shift += 5;
        } while (b >= 0x20);
        let dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
        lat += dlat;

        shift = 0;
        result = 0;
        do {
            b = encoded.charCodeAt(index++) - 63;
            result |= (b & 0x1f) << shift;
            shift += 5;
        } while (b >= 0x20);
        let dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
        lng += dlng;

        points.push([lng / 1e5, lat / 1e5]); // Mapbox expects [lng, lat]
    }
    return points;
}

// ── Navigation Geometry Utilities ─────────────────────────────────────────────

/** Haversine distance in meters between two lngLat points */
function haversineMeters(a: [number, number], b: [number, number]): number {
    const R = 6371000;
    const dLat = (b[1] - a[1]) * Math.PI / 180;
    const dLng = (b[0] - a[0]) * Math.PI / 180;
    const aa =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(a[1] * Math.PI / 180) * Math.cos(b[1] * Math.PI / 180) *
        Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(aa), Math.sqrt(1 - aa));
}

/** Perpendicular distance (meters) from point P to segment [A, B] */
function pointToSegmentDistance(
    p: [number, number],
    a: [number, number],
    b: [number, number]
): number {
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    if (dx === 0 && dy === 0) return haversineMeters(p, a);
    let t = ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (dx * dx + dy * dy);
    t = Math.max(0, Math.min(1, t));
    return haversineMeters(p, [a[0] + t * dx, a[1] + t * dy]);
}

/**
 * Snap user position to the nearest point on the polyline.
 * Returns { index: nearest segment start index, distanceM: meters from route }
 */
function snapToPolyline(
    user: [number, number],
    polyline: [number, number][]
): { index: number; distanceM: number } {
    let bestIdx = 0;
    let bestDist = Infinity;
    for (let i = 0; i < polyline.length - 1; i++) {
        const d = pointToSegmentDistance(user, polyline[i], polyline[i + 1]);
        if (d < bestDist) {
            bestDist = d;
            bestIdx = i;
        }
    }
    return { index: bestIdx, distanceM: bestDist };
}

/**
 * Split polyline into covered (grey) and remaining (green) segments.
 * snapIdx = index of the segment the user is currently on.
 */
function splitRoute(
    polyline: [number, number][],
    snapIdx: number
): { covered: [number, number][]; remaining: [number, number][] } {
    if (polyline.length < 2) return { covered: [], remaining: polyline };
    // covered = points 0 … snapIdx+1 (inclusive)
    const splitPt = Math.min(snapIdx + 1, polyline.length - 1);
    const covered = polyline.slice(0, splitPt + 1);
    const remaining = polyline.slice(splitPt);
    return { covered, remaining };
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
    distanceKm?: number | null;
    durationMins?: number | null;
}

export default function NearbyMap({ onClose }: { onClose: () => void }) {
    const mapContainer = useRef<HTMLDivElement>(null);
    const mapRef = useRef<mapboxgl.Map | null>(null);
    const markersRef = useRef<mapboxgl.Marker[]>([]);
    const animationFrameRef = useRef<number | null>(null);
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [mapInitialCenter, setMapInitialCenter] = useState<{ lat: number; lng: number } | null>(null);
    const [businesses, setBusinesses] = useState<Business[]>([]);
    const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
    const [loading, setLoading] = useState(true);
    const [locating, setLocating] = useState(true);
    const [filterOpen, setFilterOpen] = useState(false);
    const [category, setCategory] = useState("All");
    const [radius, setRadius] = useState(5000000);
    const [mapLoaded, setMapLoaded] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<Business[]>([]);
    const [routeInfo, setRouteInfo] = useState<{ distance: number, duration: number, businessName: string, trafficCondition: string } | null>(null);
    const [isNavigating, setIsNavigating] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef<any>(null);
    const watchIdRef = useRef<number | null>(null);
    const userMarkerRef = useRef<mapboxgl.Marker | null>(null);
    const startMarkerRef = useRef<mapboxgl.Marker | null>(null);
    const [isAutoCentering, setIsAutoCentering] = useState(true);
    const autoCenteringRef = useRef(true);
    useEffect(() => { autoCenteringRef.current = isAutoCentering; }, [isAutoCentering]);
    const isProgrammaticMove = useRef(false);
    const rerouteTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const lastLocationRef = useRef<{ lat: number; lng: number } | null>(null);
    const activeDestRef = useRef<{ lat: number; lng: number } | null>(null);
    const [isMuted, setIsMuted] = useState(false);
    const isMutedRef = useRef(false);

    // ✅ Single canonical GPS ref — continuously updated
    const canonicalLocRef = useRef<{ lat: number; lng: number } | null>(null);

    // ✅ The EXACT GPS coord used when route was drawn — used by START NAVIGATION to fly to correct origin
    const routeOriginRef = useRef<{ lat: number; lng: number } | null>(null);

    // ✅ GPS ready flag — true jab real GPS mil jaaye
    const gpsReadyRef = useRef<boolean>(false);
    const [gpsReady, setGpsReady] = useState(false);

    const navigationStepsRef = useRef<any[]>([]);
    const lastInstructionSpokenRef = useRef<string>("");

    // ── Navigation engine refs ─────────────────────────────────────────────────
    /** Full decoded route polyline [[lng,lat]…] — used for snapping & off-route checks */
    const routePolylineRef = useRef<[number, number][]>([]);
    /** Timestamp (ms) of last reroute API call — gates calls to max 1 per 10s */
    const lastRerouteTimeRef = useRef<number>(0);
    /** True while a reroute fetch is in-flight — prevents duplicate concurrent calls */
    const isReroutingRef = useRef<boolean>(false);
    /** Per-segment traffic array aligned with routePolylineRef */
    const routeTrafficRef = useRef<string[]>([]);

    const API = (process.env.NEXT_PUBLIC_API_URL);

    const getTrafficLevel = (congestion: string[]): string => {
        const counts: Record<string, number> = {};
        congestion.forEach(c => { counts[c] = (counts[c] || 0) + 1; });
        const total = congestion.length || 1;
        const severePct = ((counts['severe'] || 0) + (counts['heavy'] || 0)) / total;
        if (severePct > 0.25) return 'HEAVY';
        if ((counts['moderate'] || 0) / total + severePct > 0.35) return 'MODERATE';
        return 'LOW';
    };

    const hasMoved = (a: { lat: number; lng: number }, b: { lat: number; lng: number }, thresholdM = 15): boolean => {
        const R = 6371000;
        const dLat = (b.lat - a.lat) * Math.PI / 180;
        const dLng = (b.lng - a.lng) * Math.PI / 180;
        const aa = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * Math.PI / 180) * Math.cos(b.lat * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
        return R * 2 * Math.atan2(Math.sqrt(aa), Math.sqrt(1 - aa)) > thresholdM;
    };

    // ✅ FIX: getFreshLocation ab properly wait karta hai real GPS ke liye
    // Pehle canonicalLocRef check karta hai (jo continuously update hota hai watchPosition se)
    const getFreshLocation = (): Promise<{ lat: number; lng: number }> => {
        return new Promise((resolve) => {
            // ✅ Agar canonical ref mein already real GPS hai, use karo
            if (canonicalLocRef.current && gpsReadyRef.current) {
                console.log("✅ Using canonical GPS:", canonicalLocRef.current);
                resolve(canonicalLocRef.current);
                return;
            }

            // ✅ Warna fresh GPS request karo with no cache
            if (navigator.geolocation) {
                const timeout = setTimeout(() => {
                    // GPS timeout — fallback to best available
                    const fallback = canonicalLocRef.current || lastLocationRef.current;
                    if (fallback) {
                        console.warn("⚠️ GPS timeout, using fallback:", fallback);
                        resolve(fallback);
                    } else {
                        console.error("❌ No GPS available, using Delhi default");
                        resolve({ lat: 28.6139, lng: 77.2090 });
                    }
                }, 8000);

                navigator.geolocation.getCurrentPosition(
                    (pos) => {
                        clearTimeout(timeout);
                        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                        console.log("✅ Fresh GPS obtained:", loc);
                        canonicalLocRef.current = loc;
                        gpsReadyRef.current = true;
                        lastLocationRef.current = loc;
                        setUserLocation(loc);
                        resolve(loc);
                    },
                    (err) => {
                        clearTimeout(timeout);
                        console.warn("⚠️ GPS error:", err.message);
                        const fallback = canonicalLocRef.current || lastLocationRef.current;
                        if (fallback) {
                            resolve(fallback);
                        } else {
                            resolve({ lat: 28.6139, lng: 77.2090 });
                        }
                    },
                    { enableHighAccuracy: true, timeout: 7000, maximumAge: 0 }
                );
            } else {
                resolve(canonicalLocRef.current || { lat: 28.6139, lng: 77.2090 });
            }
        });
    };

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
        // Step 1: Handle initial map view centering
        if (paramLat && paramLng) {
            const lat = parseFloat(paramLat);
            const lng = parseFloat(paramLng);
            setMapInitialCenter({ lat, lng });
        }

        // ✅ Step 2: GPS acquire karo IMMEDIATELY aur canonicalLocRef set karo
        if (navigator.geolocation) {
            setLocating(true);

            // ✅ First: Quick low-accuracy fix for faster response
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                    canonicalLocRef.current = loc;
                    lastLocationRef.current = loc;
                    gpsReadyRef.current = true;
                    setUserLocation(loc);
                    setGpsReady(true);
                    setLocating(false);

                    if (!paramLat || !paramLng) {
                        setMapInitialCenter(loc);
                    }
                },
                () => {
                    if (!paramLat || !paramLng) {
                        const delhi = { lat: 28.6139, lng: 77.2090 };
                        setMapInitialCenter(delhi);
                        setUserLocation(delhi);
                    }
                    setLocating(false);
                },
                { enableHighAccuracy: false, timeout: 5000, maximumAge: 10000 }
            );

            // ✅ Then: High-accuracy GPS watch (continuously updates canonicalLocRef)
            const watchId = navigator.geolocation.watchPosition(
                (p) => {
                    const loc = { lat: p.coords.latitude, lng: p.coords.longitude };
                    canonicalLocRef.current = loc;
                    lastLocationRef.current = loc;
                    gpsReadyRef.current = true;
                    setGpsReady(true);
                    // userMarker update karo
                    if (userMarkerRef.current) {
                        userMarkerRef.current.setLngLat([loc.lng, loc.lat]);
                    }
                },
                () => { },
                { enableHighAccuracy: true, maximumAge: 5000 }
            );
            watchIdRef.current = watchId;
        } else {
            if (!paramLat || !paramLng) {
                const delhi = { lat: 28.6139, lng: 77.2090 };
                setMapInitialCenter(delhi);
                setUserLocation(delhi);
            }
            setLocating(false);
        }

        if (paramId) {
            const fetchTarget = async () => {
                try {
                    const res = await fetch(`${API}/business/public/${paramId}`);
                    const data = await res.json();
                } catch (e) {
                    console.error("Failed target fetch:", e);
                }
            };
            fetchTarget();
        }

        return () => {
            if (watchIdRef.current !== null) {
                navigator.geolocation.clearWatch(watchIdRef.current);
                watchIdRef.current = null;
            }
        };
    }, [paramLat, paramLng, paramId, API]);

    useEffect(() => {
        const initial = mapInitialCenter || userLocation;
        if (!initial || !mapContainer.current || mapRef.current) return;

        mapboxgl.accessToken = MAPBOX_TOKEN;
        const map = new mapboxgl.Map({
            container: mapContainer.current,
            style: "mapbox://styles/mapbox/dark-v11",
            center: [initial.lng, initial.lat],
            zoom: 14,
            pitch: 62,
            bearing: -17,
            antialias: true,
        });

        mapRef.current = map;

        map.on("load", () => {
            setMapLoaded(true);

            map.setFog({
                'color': '#020617',
                'high-color': '#1e293b',
                'horizon-blend': 0.15,
                'space-color': '#000000',
                'star-intensity': 0.6
            });

            if (!map.getLayer('sky')) {
                map.addLayer({
                    'id': 'sky',
                    'type': 'sky',
                    'paint': {
                        'sky-type': 'gradient',
                        'sky-gradient': [
                            'interpolate', ['linear'], ['sky-radial-progress'],
                            0.8, 'rgba(2, 6, 49, 1)',
                            1, 'rgba(14, 165, 233, 1)'
                        ],
                        'sky-gradient-center': [0, 0],
                        'sky-gradient-radius': 90,
                        'sky-opacity': ['interpolate', ['exponential', 0.1], ['zoom'], 5, 0, 22, 1]
                    }
                });
            }

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
                                0, "#1e293b", 15, "#334155", 30, "#475569", 60, "#64748b", 150, "#94a3b8"
                            ],
                            "fill-extrusion-height": ["interpolate", ["linear"], ["zoom"], 14, 0, 14.05, ["get", "height"]],
                            "fill-extrusion-base": ["interpolate", ["linear"], ["zoom"], 14, 0, 14.05, ["get", "min_height"]],
                            "fill-extrusion-opacity": 0.85,
                            "fill-extrusion-vertical-gradient": true
                        }
                    });
                }
            } catch (layerErr) {
                console.warn("Could not add 3D buildings layer:", layerErr);
            }

            // ✅ User marker — canonicalLocRef se location lo
            const markerLoc = canonicalLocRef.current || initial;
            const userEl = document.createElement("div");
            userEl.innerHTML = `
                <div style="position: relative; width: 24px; height: 24px;">
                    <div style="position: absolute; inset: 0; border-radius: 50%; background: #0ea5e9; opacity: 0.3;"></div>
                    <div style="position: absolute; inset: 4px; border-radius: 50%; background: white; border: 3px solid #0ea5e9; box-shadow: 0 0 15px #0ea5e9;"></div>
                </div>
            `;
            userMarkerRef.current = new mapboxgl.Marker(userEl)
                .setLngLat([markerLoc.lng, markerLoc.lat])
                .addTo(map);

            map.flyTo({ center: [initial.lng, initial.lat], zoom: 15, pitch: 62, bearing: -17, duration: 2500, essential: true });
        });

        fetchNearbyBusinesses(initial.lat, initial.lng, category, radius);

        map.on("moveend", () => {
            const center = map.getCenter();
            debouncedFetch(center.lat, center.lng, category, radius);
            if (!canonicalLocRef.current) {
                canonicalLocRef.current = { lat: center.lat, lng: center.lng };
            }
        });

        const handleInteraction = () => {
            if (autoCenteringRef.current) {
                setIsAutoCentering(false);
                autoCenteringRef.current = false;
            }
        };

        map.on("dragstart", handleInteraction);
        map.on("zoomstart", handleInteraction);
        map.on("pitchstart", handleInteraction);
        map.on("rotate", handleInteraction);

        const container = mapContainer.current;
        if (container) {
            container.addEventListener('wheel', handleInteraction, { capture: true, passive: true });
        }

        return () => {
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
            map.remove();
            mapRef.current = null;
            if (container) {
                container.removeEventListener('wheel', handleInteraction, { capture: true });
            }
        };
    }, [mapInitialCenter !== null || userLocation !== null]);

    useEffect(() => {
        if (!mapRef.current || !userLocation) return;

        if (!userMarkerRef.current && mapLoaded) {
            const userEl = document.createElement("div");
            userEl.innerHTML = `
                <div style="position: relative; width: 24px; height: 24px;">
                    <div style="position: absolute; inset: 0; border-radius: 50%; background: #0ea5e9; opacity: 0.3;"></div>
                    <div style="position: absolute; inset: 4px; border-radius: 50%; background: white; border: 3px solid #0ea5e9; box-shadow: 0 0 15px #0ea5e9;"></div>
                </div>
            `;
            userMarkerRef.current = new mapboxgl.Marker(userEl)
                .setLngLat([userLocation.lng, userLocation.lat])
                .addTo(mapRef.current);
        } else if (userMarkerRef.current) {
            userMarkerRef.current.setLngLat([userLocation.lng, userLocation.lat]);
            userMarkerRef.current.getElement().style.display = isNavigating ? 'none' : 'block';
        }
    }, [userLocation, mapLoaded, isNavigating]);

    const initialSelectPerformed = useRef(false);

    useEffect(() => {
        if (!mapLoaded) return;

        markersRef.current.forEach(m => m.remove());
        markersRef.current = [];

        const filtered = businesses.filter(b =>
            (b.brandName || b.businessName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
            (b.businessCategory || "").toLowerCase().includes(searchQuery.toLowerCase())
        );

        filtered.forEach(biz => {
            if (!biz.gpsCoordinates?.lat || !biz.gpsCoordinates?.lng) return;

            const c = (biz.businessCategory || "").toLowerCase();
            let color = "#60a5fa";
            let symbol = "📍";

            if (c.includes("food") || c.includes("rest") || c.includes("cafe")) { color = "#34d399"; symbol = "🍔"; }
            else if (c.includes("health") || c.includes("hospi")) { color = "#f87171"; symbol = "🏥"; }
            else if (c.includes("shop") || c.includes("retail")) { color = "#f472b6"; symbol = "🛒"; }
            else if (c.includes("tech") || c.includes("it") || c.includes("software")) { color = "#a78bfa"; symbol = "💻"; }
            else if (c.includes("edu") || c.includes("school") || c.includes("college")) { color = "#fbbf24"; symbol = "🎓"; }

            const el = document.createElement("div");
            el.style.cssText = "width: 80px; height: 80px; display: flex; align-items: center; justify-content: center; cursor: pointer; position: relative;";

            el.innerHTML = `
                <div class="dbi-glass-pin" style="
                    position: relative; z-index: 2;
                    width: 56px; height: 56px; border-radius: 50%;
                    background: rgba(10, 15, 35, 0.85); backdrop-filter: blur(8px);
                    border: 2.5px solid ${color};
                    display: flex; align-items: center; justify-content: center; color: white;
                    font-size: 28px; box-shadow: inset 0 0 12px ${color}66, 0 6px 15px rgba(0,0,0,0.6);
                    transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                ">
                    <span style="filter: drop-shadow(0 0 3px ${color});">${symbol}</span>
                </div>
            `;

            const pinCard = el.querySelector(".dbi-glass-pin") as HTMLElement;
            let labelPopup: mapboxgl.Popup | null = null;

            el.addEventListener("mouseenter", () => {
                if (pinCard) { pinCard.style.transform = "scale(1.2) translateY(-4px)"; }
                labelPopup = new mapboxgl.Popup({ closeButton: false, closeOnClick: false, offset: [0, -25], className: 'business-label-popup' })
                    .setLngLat([biz.gpsCoordinates.lng, biz.gpsCoordinates.lat])
                    .setHTML(`<div style="background: rgba(10, 15, 35, 0.95); backdrop-filter: blur(20px); color: white; padding: 6px 14px; border-radius: 12px; border: 1.5px solid ${color}88; font-size: 13px; font-weight: 800; white-space: nowrap;">${biz.brandName || biz.businessName}</div>`)
                    .addTo(mapRef.current!);
            });

            el.addEventListener("mouseleave", () => {
                if (pinCard) { pinCard.style.transform = "scale(1) translateY(0)"; }
                if (labelPopup) { labelPopup.remove(); labelPopup = null; }
            });

            el.addEventListener("click", () => {
                setSelectedBusiness(biz);
                mapRef.current?.flyTo({ center: [biz.gpsCoordinates.lng, biz.gpsCoordinates.lat], zoom: 17.5, pitch: 60, duration: 1200, essential: true });
            });

            const marker = new mapboxgl.Marker({ element: el, anchor: "center" })
                .setLngLat([biz.gpsCoordinates.lng, biz.gpsCoordinates.lat])
                .addTo(mapRef.current!);
            markersRef.current.push(marker);
        });
    }, [businesses, mapLoaded, searchQuery]);

    useEffect(() => {
        if (searchQuery.trim().length === 0) { setSearchResults([]); return; }

        const haversineKm = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
            const R = 6371;
            const dLat = (lat2 - lat1) * Math.PI / 180;
            const dLng = (lng2 - lng1) * Math.PI / 180;
            const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
            return parseFloat((R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1));
        };

        const fetchSearchResults = async () => {
            setLoading(true);
            try {
                const mapCenter = mapRef.current?.getCenter();
                const searchLoc = mapCenter ? { lat: mapCenter.lat, lng: mapCenter.lng } : canonicalLocRef.current;

                let url = `${API}/business/search?q=${encodeURIComponent(searchQuery)}`;
                if (searchLoc) url += `&lat=${searchLoc.lat}&lng=${searchLoc.lng}`;

                const res = await fetch(url);
                const data = await res.json();

                if (data.success && data.data) {
                    let results = data.data;

                    if (searchLoc) {
                        // Priority 1: Initialize with Haversine base distance for all results
                        results = results.map((b: any) => ({
                            ...b,
                            distanceKm: haversineKm(searchLoc.lat, searchLoc.lng, b.gpsCoordinates.lat, b.gpsCoordinates.lng),
                            durationMins: null
                        }));

                        // Priority 2: Enrich first 10 with precise Google Routes Matrix API
                        try {
                            const matrixRes = await fetch('/api/distance-matrix', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    origin: searchLoc,
                                    destinations: results.slice(0, 10).map((b: any) => b.gpsCoordinates)
                                })
                            });

                            if (matrixRes.ok) {
                                const matrixData = await matrixRes.json();
                                // matrixData is an array of elements
                                if (Array.isArray(matrixData)) {
                                    results = results.map((b: any, i: number) => {
                                        if (i >= 10) return b;
                                        const m = matrixData.find((item: any) => item.destinationIndex === i);
                                        if (!m || m.status?.code) return b; // Fallback to Haversine if error for this element
                                        return {
                                            ...b,
                                            distanceKm: m.distanceMeters != null ? parseFloat((m.distanceMeters / 1000).toFixed(1)) : b.distanceKm,
                                            durationMins: m.duration ? Math.round(parseInt(m.duration) / 60) : null
                                        };
                                    });
                                }
                            }
                        } catch (e) {
                            console.warn("Matrix enrichment failed, keeping Haversine fallback.", e);
                        }

                        results.sort((a: any, b: any) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));
                    }

                    setSearchResults(results.slice(0, 20)); // Keep top 20 for performance
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
        if (paramId && businesses.length > 0 && !initialSelectPerformed.current) {
            const biz = businesses.find(b => b._id === paramId);
            if (biz) {
                initialSelectPerformed.current = true;
                setSelectedBusiness(biz);
                mapRef.current?.flyTo({ center: [biz.gpsCoordinates.lng, biz.gpsCoordinates.lat], zoom: 17.5, pitch: 60, duration: 1200, essential: true });
            }
        }
    }, [businesses, mapLoaded, paramId]);

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

    const zoomIn = () => { mapRef.current?.zoomIn(); };
    const zoomOut = () => { mapRef.current?.zoomOut(); };

    const toggleVoiceInput = () => {
        if (isListening) {
            if (recognitionRef.current) recognitionRef.current.stop();
            setIsListening(false);
            return;
        }
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) { alert("Voice not supported. Try Chrome."); return; }

        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;
        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onerror = () => setIsListening(false);
        recognition.onresult = async (event: any) => {
            const transcript = event.results[0][0].transcript;
            setSearchQuery(transcript);
            setIsListening(false);
            if (recognitionRef.current) recognitionRef.current.stop();

            try {
                const voiceLoc = canonicalLocRef.current;
                let url = `${API}/business/search?q=${encodeURIComponent(transcript)}`;
                if (voiceLoc) url += `&lat=${voiceLoc.lat}&lng=${voiceLoc.lng}`;
                const res = await fetch(url);
                const data = await res.json();
                if (data.success && data.data && data.data.length > 0) {
                    const topBiz = data.data[0];
                    setSelectedBusiness(topBiz);
                    setBusinesses(prev => prev.some(b => b._id === topBiz._id) ? prev : [...prev, topBiz]);
                    mapRef.current?.flyTo({ center: [topBiz.gpsCoordinates.lng, topBiz.gpsCoordinates.lat], zoom: 18, pitch: 65, bearing: -17, duration: 2500, essential: true });
                }
            } catch (err) { console.error("Voice search failed:", err); }
        };
        recognitionRef.current = recognition;
        recognition.start();
    };

    // ── Route Visualization ───────────────────────────────────────────────────────────────
    /**
     * Draw (or update) the route on the map.
     * - covered: grey segments (already driven)
     * - remaining: green/traffic segments (still to go)
     * Uses setData() when sources already exist to avoid flicker from add/remove.
     */
    const updateRouteVisualization = (
        map: mapboxgl.Map,
        covered: [number, number][],
        remaining: [number, number][],
        trafficArr: string[],
        startIdx: number, // offset into trafficArr for remaining
        walkingPaths?: { start?: [number, number][], end?: [number, number][] }
    ) => {
        // Build remaining features with per-segment traffic colour
        const remainingFeatures: any[] = [];
        for (let i = 0; i < remaining.length - 1; i++) {
            const tIdx = startIdx + i;
            const congestion = trafficArr[tIdx] || 'low';
            remainingFeatures.push({
                type: 'Feature',
                geometry: { type: 'LineString', coordinates: [remaining[i], remaining[i + 1]] },
                properties: { congestion }
            });
        }

        const coveredFeatures: any[] = covered.length >= 2 ? [{
            type: 'Feature',
            geometry: { type: 'LineString', coordinates: covered },
            properties: { congestion: 'covered' }
        }] : [];

        const allFeatures = [...coveredFeatures, ...remainingFeatures];

        const walkingFeatures: any[] = [];
        if (walkingPaths?.start?.length) {
            walkingFeatures.push({ type: 'Feature', geometry: { type: 'LineString', coordinates: walkingPaths.start } });
        }
        if (walkingPaths?.end?.length) {
            walkingFeatures.push({ type: 'Feature', geometry: { type: 'LineString', coordinates: walkingPaths.end } });
        }

        // ─ If sources already exist, just update data (no flicker) ─
        if (map.getSource('route-remaining')) {
            (map.getSource('route-remaining') as mapboxgl.GeoJSONSource)
                .setData({ type: 'FeatureCollection', features: remainingFeatures });
        }
        if (map.getSource('route-covered')) {
            (map.getSource('route-covered') as mapboxgl.GeoJSONSource)
                .setData({ type: 'FeatureCollection', features: coveredFeatures });
        }
        if (map.getSource('route')) {
            (map.getSource('route') as mapboxgl.GeoJSONSource)
                .setData({ type: 'FeatureCollection', features: allFeatures as any });
        }
        if (map.getSource('route-walking')) {
            (map.getSource('route-walking') as mapboxgl.GeoJSONSource)
                .setData({ type: 'FeatureCollection', features: walkingFeatures as any });
            return; // Sources/layers already set up
        }
        if (map.getSource('route')) return; // sources exist but no walking source

        // ─ First-time setup: create all sources & layers ─

        // Remove any legacy layers
        ['route-glow', 'route-line', 'route-particles', 'route-covered-line', 'route-walking-line',
            'route-remaining-glow', 'route-remaining-line', 'route-particles-remaining']
            .forEach(id => { if (map.getLayer(id)) map.removeLayer(id); });
        ['route', 'route-covered', 'route-remaining', 'route-walking']
            .forEach(id => { if (map.getSource(id)) map.removeSource(id); });

        // Covered source
        map.addSource('route-covered', {
            type: 'geojson',
            data: { type: 'FeatureCollection', features: coveredFeatures as any }
        });

        // Remaining source
        map.addSource('route-remaining', {
            type: 'geojson',
            data: { type: 'FeatureCollection', features: remainingFeatures as any }
        });

        // Combined "route" source for the particle animation (remaining only)
        map.addSource('route', {
            type: 'geojson',
            data: { type: 'FeatureCollection', features: remainingFeatures as any }
        });

        // Walking dots source
        map.addSource('route-walking', {
            type: 'geojson',
            data: { type: 'FeatureCollection', features: walkingFeatures as any }
        });

        // Walking dots layer (off-road segments)
        map.addLayer({
            id: 'route-walking-line', type: 'line', source: 'route-walking',
            layout: { 'line-join': 'round', 'line-cap': 'round' },
            paint: { 'line-color': '#9ca3af', 'line-width': 4, 'line-dasharray': [0.5, 2], 'line-opacity': 0.9 }
        });

        // Covered: grey line, half opacity
        map.addLayer({
            id: 'route-covered-line', type: 'line', source: 'route-covered',
            layout: { 'line-join': 'round', 'line-cap': 'round' },
            paint: { 'line-color': '#6b7280', 'line-width': 4, 'line-opacity': 0.55 }
        });

        // Remaining: glow
        map.addLayer({
            id: 'route-remaining-glow', type: 'line', source: 'route-remaining',
            layout: { 'line-join': 'round', 'line-cap': 'round' },
            paint: {
                'line-color': ['match', ['get', 'congestion'],
                    'low', '#22c55e', 'moderate', '#eab308', 'heavy', '#f97316', 'severe', '#ef4444', '#22c55e'],
                'line-width': 16, 'line-blur': 12, 'line-opacity': 0.25
            }
        });

        // Remaining: main line with traffic colours
        map.addLayer({
            id: 'route-remaining-line', type: 'line', source: 'route-remaining',
            layout: { 'line-join': 'round', 'line-cap': 'round' },
            paint: {
                'line-color': ['match', ['get', 'congestion'],
                    'low', '#22c55e', 'moderate', '#eab308', 'heavy', '#f97316', 'severe', '#ef4444', '#38bdf8'],
                'line-width': 6, 'line-opacity': 1
            }
        });

        // Animated dashes on remaining route
        map.addLayer({
            id: 'route-particles', type: 'line', source: 'route',
            layout: { 'line-join': 'round', 'line-cap': 'round' },
            paint: { 'line-color': '#ffffff', 'line-width': 2, 'line-dasharray': [0, 4, 1, 4], 'line-opacity': 0.7 }
        });
    };

    // ── SHOW ROUTE ──────────────────────────────────────────────────────────────────
    const handleShowRoute = async () => {
        if (!mapRef.current || !selectedBusiness) return;

        const freshUserLoc = await getFreshLocation();
        console.log('🗺️ Route from:', freshUserLoc, '→ to:', selectedBusiness.gpsCoordinates);

        const distCheck =
            Math.abs(freshUserLoc.lat - selectedBusiness.gpsCoordinates.lat) +
            Math.abs(freshUserLoc.lng - selectedBusiness.gpsCoordinates.lng);
        if (distCheck < 0.0001) {
            alert(!gpsReadyRef.current
                ? 'Please enable GPS/Location access to get turn-by-turn directions.'
                : 'You appear to be at this location already!');
            return;
        }

        activeDestRef.current = selectedBusiness.gpsCoordinates;

        try {
            const originStr = `${freshUserLoc.lat},${freshUserLoc.lng}`;
            const destStr = `${selectedBusiness.gpsCoordinates.lat},${selectedBusiness.gpsCoordinates.lng}`;
            const json = await fetch(`/api/directions?origin=${originStr}&destination=${destStr}`).then(r => r.json());

            if (!json.routes?.length) {
                if (json.error) alert(`Google API Error: ${json.error.message}`);
                else alert('No route found for this destination.');
                return;
            }

            const data = json.routes[0];

            // FIX #3: Do NOT prepend userCoord — Google polyline already starts at
            // the road-snapped origin. Prepending creates a gap & road misalignment.
            const route: [number, number][] = decodePolyline(data.polyline?.encodedPolyline || '');

            // Store route for snapping & off-route detection
            routePolylineRef.current = route;
            lastRerouteTimeRef.current = Date.now();

            // Build per-segment traffic array
            const intervals = data.travelAdvisory?.speedReadingIntervals || [];
            const trafficArr = new Array(route.length).fill('low');
            let severeCount = 0, moderateCount = 0;
            intervals.forEach((iv: any) => {
                const s = iv.startPolylinePointIndex || 0;
                const e = iv.endPolylinePointIndex || route.length - 1;
                let lvl = 'low';
                if (iv.speed === 'TRAFFIC_JAM') { lvl = 'severe'; severeCount += (e - s); }
                else if (iv.speed === 'SLOW') { lvl = 'moderate'; moderateCount += (e - s); }
                for (let j = s; j <= e && j + 1 < route.length; j++) trafficArr[j + 1] = lvl;
            });
            routeTrafficRef.current = trafficArr;

            const totalPts = Math.max(1, route.length);
            let overallCongestion = 'LOW';
            if (severeCount / totalPts > 0.25) overallCongestion = 'HEAVY';
            else if (severeCount > 0 || moderateCount / totalPts > 0.3) overallCongestion = 'MODERATE';

            // Extract voice steps
            const processedSteps = (data.legs?.[0]?.steps || []).map((s: any) => {
                let inst = s.navigationInstruction?.instructions?.replace(/<[^>]*>?/gm, '') || '';
                if (inst && !inst.toLowerCase().includes('destination') && !inst.toLowerCase().startsWith('head '))
                    inst = `In 200 meters, ${inst}`;
                return { lat: s.startLocation?.latLng?.latitude, lng: s.startLocation?.latLng?.longitude, instruction: inst };
            }).filter((s: any) => s.instruction);

            navigationStepsRef.current = processedSteps;
            lastInstructionSpokenRef.current = '';

            routeOriginRef.current = freshUserLoc;
            canonicalLocRef.current = freshUserLoc;
            lastLocationRef.current = freshUserLoc;

            setIsNavigating(false);
            setRouteInfo({
                distance: (data.distanceMeters || 0) / 1000,
                duration: parseInt(data.duration || '0') / 60,
                businessName: selectedBusiness.brandName || selectedBusiness.businessName,
                trafficCondition: overallCongestion
            });

            const map = mapRef.current;
            if (!map) return;

            if (startMarkerRef.current) { startMarkerRef.current.remove(); startMarkerRef.current = null; }

            const startCoord = route[0];
            const nextCoord = route[1] || route[0];
            const bearing = Math.atan2(nextCoord[0] - startCoord[0], nextCoord[1] - startCoord[1]) * 180 / Math.PI;

            const startEl = document.createElement('div');
            startEl.style.zIndex = '1000';
            startEl.innerHTML = `
                <div style="transform: rotate(${bearing}deg); filter: drop-shadow(0 0 15px rgba(14,165,233,0.8)); transition: transform 0.3s ease-out;">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2L19 21L12 17L5 21L12 2Z" fill="#0ea5e9" stroke="white" stroke-width="2" stroke-linejoin="round"/>
                        <circle cx="12" cy="14" r="2" fill="white" opacity="0.5"/>
                    </svg>
                </div>
            `;
            startMarkerRef.current = new mapboxgl.Marker({ element: startEl, rotationAlignment: 'map' })
                .setLngLat(startCoord)
                .addTo(map);

            // Initial visualization: full route is "remaining" (nothing covered yet)
            const walkingPaths = { 
                start: [[freshUserLoc.lng, freshUserLoc.lat] as [number, number], route[0]], 
                end: [route[route.length - 1], [selectedBusiness.gpsCoordinates.lng, selectedBusiness.gpsCoordinates.lat] as [number, number]] 
            };
            updateRouteVisualization(map, [], route, trafficArr, 0, walkingPaths);

            // Animated dashes
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

            const bounds = route.reduce(
                (b: mapboxgl.LngLatBounds, c) => b.extend(c),
                new mapboxgl.LngLatBounds(route[0], route[0])
            );
            map.fitBounds(bounds, { padding: { top: 150, bottom: 350, left: 50, right: 50 }, duration: 2500, pitch: 62, bearing, essential: true });

            setSelectedBusiness(null);
            console.log('🛣️ Route drawn. Points:', route.length);
        } catch (err) {
            console.error('Could not fetch directions:', err);
            alert('Could not fetch route. Please try again.');
        }
    };


    const siteBackground = {
        backgroundImage: `radial-gradient(at 0% 0%, hsla(210, 100%, 56%, 0.15) 0px, transparent 50%), radial-gradient(at 100% 0%, hsla(255, 60%, 69%, 0.1) 0px, transparent 50%)`,
        backgroundColor: "#020631"
    };

    return (
        <div className="relative w-full h-screen overflow-hidden font-display" style={siteBackground}>
            <div ref={mapContainer} className="absolute inset-0 w-full h-full" />

            {/* ✅ GPS Loading indicator — jab tak GPS nahi milta */}
            <AnimatePresence>
                {locating && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute top-20 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 px-4 py-2 bg-black/60 backdrop-blur-xl border border-primary/30 rounded-full text-primary text-xs font-bold"
                    >
                        <Loader2 size={14} className="animate-spin" />
                        Getting your location...
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Active Navigation Header */}
            <AnimatePresence>
                {isNavigating && (
                    <motion.div initial={{ y: -100 }} animate={{ y: 0 }} exit={{ y: -100 }} className="absolute top-0 left-0 right-0 z-40 bg-black/40 backdrop-blur-2xl p-2.5 sm:p-4 flex items-center justify-between shadow-[0_10px_40px_rgba(0,0,0,0.5)] border-b border-primary/30">
                        <div className="flex items-center gap-2 sm:gap-3">
                            <div className="relative">
                                <div className="absolute inset-0 bg-primary/20 blur-lg rounded-full animate-pulse" />
                                <NavigationIcon size={18} className="text-primary relative z-10 animate-bounce" />
                            </div>
                            <div>
                                <h2 className="text-white font-black text-lg sm:text-xl tracking-tighter leading-tight flex items-center gap-2">
                                    NAVIGATING
                                </h2>
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                setIsNavigating(false);
                                setIsAutoCentering(true);
                                if (watchIdRef.current !== null) { navigator.geolocation.clearWatch(watchIdRef.current); watchIdRef.current = null; }
                                if (startMarkerRef.current) { startMarkerRef.current.remove(); startMarkerRef.current = null; }
                                mapRef.current?.easeTo({ pitch: 45, zoom: 15, duration: 1500 });
                            }}
                            className="bg-red-500 text-white font-black py-1.5 px-4 rounded-xl shadow-[0_0_20px_rgba(239,68,68,0.4)] border border-red-400 hover:bg-red-600 transition-all flex items-center gap-2 group"
                        >
                            <Octagon size={12} className="fill-white/20" />
                            <span className="text-[10px] sm:text-xs tracking-widest uppercase">EXIT</span>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Top Navigation Bar */}
            <AnimatePresence>
                {!routeInfo && !isNavigating && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="absolute top-0 left-0 right-0 z-20 p-3 md:p-6 flex flex-col md:flex-row items-stretch md:items-start gap-3 max-w-7xl mx-auto pointer-events-none"
                    >
                        <div className="flex-1 flex flex-col gap-2 relative pointer-events-auto order-2 md:order-1">
                            <div className="h-12 md:h-14 flex items-center gap-3 bg-black/40 backdrop-blur-3xl border border-white/20 rounded-2xl md:rounded-3xl px-4 md:px-6 shadow-[0_8px_32px_rgba(0,0,0,0.5)] transition-all focus-within:bg-black/60 focus-within:border-primary/50">
                                <Search size={18} className="text-primary animate-pulse shrink-0" />
                                <input
                                    type="text"
                                    placeholder={isListening ? "Listening..." : "Search for businesses..."}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    suppressHydrationWarning
                                    className="bg-transparent border-none outline-none text-white text-sm md:text-base font-semibold flex-1 placeholder:text-white/50"
                                />
                                <button onClick={toggleVoiceInput} suppressHydrationWarning className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 pointer-events-auto shrink-0 relative ${isListening ? 'bg-primary text-white' : 'text-primary/60 hover:text-primary'}`}>
                                    {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                                </button>
                                {loading && <Loader2 size={18} className="text-primary animate-spin shrink-0" />}
                            </div>

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
                                                        setSearchQuery('');
                                                        if (!businesses.find(b => b._id === biz._id)) setBusinesses(prev => [...prev, biz]);
                                                        mapRef.current?.flyTo({ center: [biz.gpsCoordinates.lng, biz.gpsCoordinates.lat], zoom: 17.5, pitch: 60, duration: 1200, essential: true });
                                                    }}
                                                    className="flex items-center gap-3 w-full p-3 md:p-4 hover:bg-white/10 transition-colors rounded-xl text-left"
                                                >
                                                    <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
                                                        <MapPin size={16} className="text-primary" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="text-white font-bold text-sm truncate">{biz.brandName || biz.businessName}</h4>
                                                        <p className="text-white/50 text-xs truncate">{biz.registeredOfficeAddress}</p>
                                                    </div>
                                                    {(biz.distanceKm != null || biz.durationMins != null) && (
                                                        <span className="flex items-center gap-1 sm:gap-1.5 text-primary font-black whitespace-nowrap bg-primary/10 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg border border-primary/30 text-[10px] sm:text-[11px]">
                                                            {biz.distanceKm != null ? `${biz.distanceKm.toFixed(1)} KM` : ''}
                                                            {biz.distanceKm != null && biz.durationMins != null && <span className="opacity-40 text-[8px] sm:text-[9px]">•</span>}
                                                            {biz.durationMins != null ? <span className="text-white">{biz.durationMins} MIN</span> : null}
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
                                <button onClick={zoomIn} className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-3xl bg-black/40 backdrop-blur-3xl border border-white/20 flex items-center justify-center text-white/90 hover:text-primary transition-all font-bold text-xl">+</button>
                                <button onClick={zoomOut} className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-3xl bg-black/40 backdrop-blur-3xl border border-white/20 flex items-center justify-center text-white/90 hover:text-primary transition-all font-bold text-xl">−</button>
                            </div>
                            <button onClick={onClose} className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-3xl bg-black/40 backdrop-blur-3xl border border-white/20 flex items-center justify-center text-white/90 hover:text-red-400 transition-all">
                                <X size={18} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* No Results */}
            <AnimatePresence>
                {searchQuery && searchResults.length === 0 && !loading && (
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="absolute top-20 left-1/2 -translate-x-1/2 z-20 px-6 py-3 bg-red-500/10 border border-red-500/20 backdrop-blur-xl rounded-2xl text-red-400 text-xs font-bold shadow-2xl">
                      
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`
                .business-label-popup .mapboxgl-popup-content { background: none !important; box-shadow: none !important; padding: 0 !important; border: none !important; }
                .business-label-popup .mapboxgl-popup-tip { display: none !important; }
                input::placeholder { color: rgba(255,255,255,0.3); }
            `}</style>

            {/* Business Detail Card */}
            <AnimatePresence>
                {selectedBusiness && (
                    <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }} className="absolute bottom-6 md:bottom-8 left-0 right-0 z-20 px-4 flex justify-center pointer-events-none">
                        <div className="relative bg-black/40 backdrop-blur-3xl border border-white/20 rounded-[2rem] md:rounded-[2.5rem] p-6 shadow-[0_15px_60px_rgba(0,0,0,0.8)] w-full max-w-sm pointer-events-auto">
                            <button onClick={() => setSelectedBusiness(null)} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/20 transition-all"><X size={14} /></button>
                            <h3 className="text-white font-black text-xl mb-1 truncate pr-8">{selectedBusiness.brandName || selectedBusiness.businessName}</h3>
                            <span className="text-primary text-[10px] md:text-xs font-bold uppercase mb-4 block tracking-[0.2em]">{selectedBusiness.businessCategory}</span>

                            <p className="text-white/40 text-[11px] md:text-xs mb-6 leading-relaxed flex items-start gap-2">
                                <MapPin size={14} className="text-primary shrink-0 mt-0.5" />
                                {selectedBusiness?.registeredOfficeAddress}
                            </p>

                            <div className="grid grid-cols-2 gap-2 mb-3">
                                <Link href={`/business/${selectedBusiness._id}`} className="flex items-center justify-center gap-2 bg-primary text-white font-black text-sm py-4 rounded-2xl hover:scale-[1.02] transition-all"><ExternalLink size={16} /> Details</Link>
                                <button onClick={() => handleShare(selectedBusiness)} className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 text-white font-black text-sm py-4 rounded-2xl hover:bg-white/10 transition-all"><Share2 size={16} /> Share</button>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                {selectedBusiness?.primaryContactNumber && (
                                    <a href={`tel:${selectedBusiness.primaryContactNumber}`} className="flex items-center justify-center gap-2 bg-blue-600/20 border border-blue-500/20 text-blue-400 font-bold text-xs py-3.5 rounded-2xl hover:bg-blue-600/30 transition-all"><Phone size={14} /> Call</a>
                                )}
                                <a href={`https://wa.me/${selectedBusiness?.officialWhatsAppNumber || selectedBusiness?.primaryContactNumber}`} target="_blank" className="flex items-center justify-center gap-2 bg-[#25D366]/20 border border-[#25D366]/20 text-[#25D366] font-bold text-xs py-3.5 rounded-2xl hover:bg-[#25D366]/30 transition-all"><MessageCircle size={14} /> WhatsApp</a>
                            </div>

                            {/* ✅ SHOW ROUTE button — ab handleShowRoute use karta hai */}
                            <button
                                onClick={handleShowRoute}
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
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 40 }}
                        className={`absolute z-20 px-2 sm:px-12 flex justify-center sm:justify-end pointer-events-auto transition-all duration-700 w-full left-0 right-0 bottom-4 sm:bottom-12 h-min`}
                    >
                        <div className={`relative bg-[#020617]/95 backdrop-blur-3xl border ${isNavigating ? 'border-primary/40' : 'border-primary/20'} shadow-[0_20px_90px_rgba(0,0,0,0.9)] overflow-hidden transition-all duration-500
                            ${isNavigating ? 'rounded-[1rem] sm:rounded-[1.2rem] p-2.5 sm:p-3.5 w-[min(calc(100%-2.5rem),380px)]' : 'rounded-[1.2rem] sm:rounded-2xl p-4 sm:p-5 w-[calc(100%-2rem)] sm:w-full max-w-[280px] sm:max-w-[260px]'}
                        `}>
                            <motion.div
                                animate={{ y: ['100%', '-100%'] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/10 to-transparent h-1/2 pointer-events-none opacity-40"
                            />

                            {!isNavigating && (
                                <button
                                    onClick={() => {
                                        setRouteInfo(null);
                                        if (mapRef.current) {
                                            const map = mapRef.current;
                                            ['route-covered-line', 'route-remaining-glow', 'route-remaining-line', 'route-particles', 'route-walking-line'].forEach(id => {
                                                if (map.getLayer(id)) map.removeLayer(id);
                                            });
                                            ['route-covered', 'route-remaining', 'route', 'route-walking'].forEach(id => {
                                                if (map.getSource(id)) map.removeSource(id);
                                            });
                                            if (startMarkerRef.current) { startMarkerRef.current.remove(); startMarkerRef.current = null; }
                                            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
                                        }
                                        if (userLocation) mapRef.current?.flyTo({ center: [userLocation.lng, userLocation.lat], zoom: 15, pitch: 45, duration: 2000 });
                                    }}
                                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/5 border border-white/10 text-white flex items-center justify-center z-20 hover:bg-white/10 transition-colors"
                                >
                                    <X size={14} />
                                </button>
                            )}

                            <div className={`flex relative z-10 w-full ${isNavigating ? 'flex-row items-center justify-between gap-3' : 'flex-col'}`}>
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-2 mb-1.5 font-black uppercase tracking-[0.2em] text-[10px] sm:text-[12px]">
                                        <div className={`w-1.5 h-1.5 rounded-full bg-primary ${isNavigating ? 'animate-pulse' : 'animate-ping'}`} />
                                        <span className="text-primary">{isNavigating ? 'LIVE' : 'ROUTE READY'}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className={`text-white font-black tracking-tighter leading-none ${isNavigating ? 'text-xl sm:text-2xl' : 'text-3xl sm:text-5xl'}`}>
                                            {routeInfo.duration > 60 ? `${Math.floor(routeInfo.duration / 60)}h ${Math.round(routeInfo.duration % 60)}m` : `${Math.round(routeInfo.duration)}`}
                                            <span className="text-[9px] sm:text-[10px] ml-0.5 font-bold opacity-60 uppercase">MIN</span>
                                        </span>
                                        <span className={`text-primary font-black uppercase tracking-[0.1em] ${isNavigating ? 'text-[10px] sm:text-xs' : 'text-xs sm:text-base'}`}>
                                            {routeInfo.distance.toFixed(1)} <span className="text-[8px] sm:text-[9px]">KM</span>
                                        </span>
                                    </div>
                                </div>

                                <div className={`flex items-center ${isNavigating ? 'flex-shrink-0' : 'w-full mt-4 pt-4 border-t border-white/5'}`}>
                                    {!isNavigating ? (
                                        <button
                                            onClick={() => {
                                                setIsNavigating(true);
                                                setIsAutoCentering(true);
                                                const map = mapRef.current!;
                                                const navLoc = routeOriginRef.current || canonicalLocRef.current;
                                                if (navLoc) {
                                                    map.flyTo({ center: [navLoc.lng, navLoc.lat], zoom: 18, pitch: 75, duration: 2000 });
                                                }

                                                // Announce first instruction
                                                if (navigationStepsRef.current.length > 0) {
                                                    const firstStep = navigationStepsRef.current[0];
                                                    const utterance = new SpeechSynthesisUtterance('Starting navigation. ' + firstStep.instruction);
                                                    utterance.rate = 0.95; utterance.pitch = 1.05;
                                                    if (!isMutedRef.current) window.speechSynthesis.speak(utterance);
                                                    lastInstructionSpokenRef.current = firstStep.instruction;
                                                }

                                                if (rerouteTimerRef.current) clearInterval(rerouteTimerRef.current);

                                                // ── Reroute helper: only called when off-route ──────────────────────
                                                const doReroute = async (loc: { lat: number; lng: number }) => {
                                                    const dest = activeDestRef.current;
                                                    if (!dest || !mapRef.current || isReroutingRef.current) return;
                                                    isReroutingRef.current = true;
                                                    lastRerouteTimeRef.current = Date.now();
                                                    console.log('⚠️ Off-route! Fetching new route from', loc);
                                                    try {
                                                        const bName = routeInfo?.businessName || '';
                                                        const js = await fetch(
                                                            `/api/directions?origin=${loc.lat},${loc.lng}&destination=${dest.lat},${dest.lng}`
                                                        ).then(r => r.json());
                                                        if (!js.routes?.length) return;

                                                        const d = js.routes[0];
                                                        const newRoute: [number, number][] = decodePolyline(d.polyline?.encodedPolyline || '');
                                                        routePolylineRef.current = newRoute;

                                                        // Rebuild traffic array for new route
                                                        const ivs = d.travelAdvisory?.speedReadingIntervals || [];
                                                        const ta = new Array(newRoute.length).fill('low');
                                                        let sc = 0, mc = 0;
                                                        ivs.forEach((iv: any) => {
                                                            const s = iv.startPolylinePointIndex || 0;
                                                            const e = iv.endPolylinePointIndex || newRoute.length - 1;
                                                            let lvl = 'low';
                                                            if (iv.speed === 'TRAFFIC_JAM') { lvl = 'severe'; sc += (e - s); }
                                                            else if (iv.speed === 'SLOW') { lvl = 'moderate'; mc += (e - s); }
                                                            for (let j = s; j <= e && j + 1 < newRoute.length; j++) ta[j + 1] = lvl;
                                                        });
                                                        routeTrafficRef.current = ta;

                                                        const tp = Math.max(1, newRoute.length);
                                                        let tCond = 'LOW';
                                                        if (sc / tp > 0.25) tCond = 'HEAVY';
                                                        else if (sc > 0 || mc / tp > 0.3) tCond = 'MODERATE';

                                                        setRouteInfo({
                                                            distance: (d.distanceMeters || 0) / 1000,
                                                            duration: parseInt(d.duration || '0') / 60,
                                                            businessName: bName,
                                                            trafficCondition: tCond
                                                        });

                                                        // Update navigation steps
                                                        const newSteps = (d.legs?.[0]?.steps || []).map((s: any) => {
                                                            let inst = s.navigationInstruction?.instructions?.replace(/<[^>]*>?/gm, '') || '';
                                                            if (inst && !inst.toLowerCase().includes('destination') && !inst.toLowerCase().startsWith('head '))
                                                                inst = `In 200 meters, ${inst}`;
                                                            return { lat: s.startLocation?.latLng?.latitude, lng: s.startLocation?.latLng?.longitude, instruction: inst };
                                                        }).filter((s: any) => s.instruction);
                                                        if (newSteps.length > 0) {
                                                            navigationStepsRef.current = newSteps;
                                                            lastInstructionSpokenRef.current = '';
                                                        }

                                                        // Draw rerouted path: nothing covered yet on new route
                                                        const destLoc = activeDestRef.current;
                                                        const walkingPaths = { 
                                                            start: [[loc.lng, loc.lat] as [number, number], newRoute[0]], 
                                                            end: destLoc ? [newRoute[newRoute.length - 1], [destLoc.lng, destLoc.lat] as [number, number]] : undefined
                                                        };
                                                        updateRouteVisualization(mapRef.current!, [], newRoute, ta, 0, walkingPaths);
                                                        console.log('🛣️ Route updated. Points:', newRoute.length);
                                                    } catch (e) {
                                                        console.warn('Reroute error:', e);
                                                    } finally {
                                                        isReroutingRef.current = false;
                                                    }
                                                };

                                                // ── GPS watcher ──────────────────────────────────────────────────────
                                                if (navigator.geolocation) {
                                                    if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
                                                    watchIdRef.current = navigator.geolocation.watchPosition(
                                                        (pos) => {
                                                            const lat = pos.coords.latitude;
                                                            const lng = pos.coords.longitude;
                                                            const heading = pos.coords.heading;
                                                            const newLoc = { lat, lng };

                                                            // Gate: ignore if not moved enough
                                                            if (lastLocationRef.current && !hasMoved(lastLocationRef.current, newLoc, 8)) return;
                                                            lastLocationRef.current = newLoc;
                                                            canonicalLocRef.current = newLoc;
                                                            setUserLocation(newLoc);

                                                            const userLngLat: [number, number] = [lng, lat];

                                                            // ── Step 1: Snap to polyline & update grey/green split ──────────
                                                            const poly = routePolylineRef.current;
                                                            if (poly.length >= 2 && mapRef.current) {
                                                                const { index: snapIdx, distanceM } = snapToPolyline(userLngLat, poly);
                                                                console.log(`📍 Snapped at index ${snapIdx}, dist ${distanceM.toFixed(0)}m`);

                                                                const { covered, remaining } = splitRoute(poly, snapIdx);
                                                                const destLoc = activeDestRef.current;
                                                                const walkingPaths = { 
                                                                    start: [userLngLat, poly[snapIdx]], 
                                                                    end: destLoc ? [poly[poly.length - 1], [destLoc.lng, destLoc.lat] as [number, number]] : undefined
                                                                };
                                                                updateRouteVisualization(
                                                                    mapRef.current,
                                                                    covered,
                                                                    remaining,
                                                                    routeTrafficRef.current,
                                                                    snapIdx,
                                                                    walkingPaths
                                                                );

                                                                // ── Step 2: Off-route check (API only when needed) ──────────
                                                                const OFF_ROUTE_THRESHOLD_M = 45;
                                                                const REROUTE_COOLDOWN_MS = 10000;
                                                                const timeSinceReroute = Date.now() - lastRerouteTimeRef.current;

                                                                if (
                                                                    distanceM > OFF_ROUTE_THRESHOLD_M &&
                                                                    timeSinceReroute > REROUTE_COOLDOWN_MS &&
                                                                    !isReroutingRef.current
                                                                ) {
                                                                    console.log(`⚠️ Off-route: ${distanceM.toFixed(0)}m`);
                                                                    doReroute(newLoc);
                                                                }
                                                            }

                                                            // ── Step 3: Voice turn-by-turn instructions ─────────────────────
                                                            if (navigationStepsRef.current.length > 0) {
                                                                const nextStep = navigationStepsRef.current[0];
                                                                // ~150m threshold (more reliable than Manhattan)
                                                                const stepDist = haversineMeters(userLngLat, [nextStep.lng, nextStep.lat]);
                                                                if (stepDist < 150) {
                                                                    if (lastInstructionSpokenRef.current !== nextStep.instruction) {
                                                                        const utterance = new SpeechSynthesisUtterance(nextStep.instruction);
                                                                        utterance.rate = 0.95; utterance.pitch = 1.05;
                                                                        if (!isMutedRef.current) window.speechSynthesis.speak(utterance);
                                                                        lastInstructionSpokenRef.current = nextStep.instruction;
                                                                    }
                                                                    if (stepDist < 30) navigationStepsRef.current.shift();
                                                                }
                                                            }

                                                            // ── Step 4: Map camera follow ────────────────────────────────────
                                                            let mapBearing = mapRef.current?.getBearing() ?? 0;
                                                            if (heading !== null && heading !== undefined && !isNaN(heading)) {
                                                                mapBearing = heading;
                                                            } else if (lastLocationRef.current) {
                                                                const dLng2 = newLoc.lng - lastLocationRef.current.lng;
                                                                const dLat2 = newLoc.lat - lastLocationRef.current.lat;
                                                                if (Math.abs(dLng2) > 0.00001 || Math.abs(dLat2) > 0.00001) {
                                                                    mapBearing = Math.atan2(dLng2, dLat2) * 180 / Math.PI;
                                                                }
                                                            }

                                                            if (autoCenteringRef.current) {
                                                                isProgrammaticMove.current = true;
                                                                mapRef.current?.easeTo({
                                                                    center: [lng, lat],
                                                                    bearing: mapBearing,
                                                                    pitch: 75, zoom: 18,
                                                                    duration: 800,
                                                                    easing: (t) => t
                                                                });
                                                                setTimeout(() => { isProgrammaticMove.current = false; }, 900);
                                                            }

                                                            if (startMarkerRef.current) {
                                                                startMarkerRef.current.setLngLat([lng, lat]);
                                                                const arrowDiv = startMarkerRef.current.getElement().querySelector('div');
                                                                if (arrowDiv) arrowDiv.style.transform = `rotate(${mapBearing}deg)`;
                                                            }
                                                        },
                                                        (err) => console.warn('Watch pos err:', err),
                                                        { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 }
                                                    );
                                                }
                                            }}
                                            className="bg-primary text-white font-black py-3 px-6 rounded-2xl hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-[0_8px_30px_rgba(59,130,246,0.5)] w-full text-xs uppercase tracking-widest border border-white/10"
                                        >
                                            <NavigationIcon size={16} fill="currentColor" /> START NAVIGATION
                                        </button>
                                    ) : (
                                        <div className="flex items-center gap-3 w-full">
                                            <button
                                                onClick={() => {
                                                    const nextMuted = !isMuted;
                                                    setIsMuted(nextMuted);
                                                    isMutedRef.current = nextMuted;
                                                    if (nextMuted) {
                                                        window.speechSynthesis.cancel();
                                                    }
                                                }}
                                                className={`p-2.5 rounded-xl border transition-all flex items-center justify-center ${isMuted ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-white/5 border-white/10 text-white hover:bg-white/10'}`}
                                            >
                                                {isMuted ? <MicOff size={18} /> : <Mic size={18} className="text-primary" />}
                                            </button>
                                            
                                            <AnimatePresence mode="wait">
                                                {!isAutoCentering && (
                                                    <motion.button
                                                        key="recenter"
                                                        initial={{ opacity: 0, x: 20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        exit={{ opacity: 0, x: 20 }}
                                                        onClick={() => {
                                                            setIsAutoCentering(true);
                                                            const loc = canonicalLocRef.current;
                                                            if (loc) {
                                                                isProgrammaticMove.current = true;
                                                                mapRef.current?.flyTo({ center: [loc.lng, loc.lat], zoom: 18, pitch: 75, duration: 1500, essential: true });
                                                                setTimeout(() => { isProgrammaticMove.current = false; }, 1600);
                                                            }
                                                        }}
                                                        className="flex-1 bg-primary text-white font-black py-2.5 px-4 rounded-xl hover:bg-primary/90 transition-all flex items-center justify-center gap-1.5 text-[9px] sm:text-[10px] uppercase tracking-wider shadow-[0_4px_15px_rgba(59,130,246,0.2)] border border-primary/40 active:scale-95"
                                                    >
                                                        <NavigationIcon size={12} fill="currentColor" className="rotate-45" /> RE-CENTER
                                                    </motion.button>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}