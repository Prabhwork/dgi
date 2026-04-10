"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Search, X, MapPin, Phone, Star, Filter, Loader2, Navigation as NavigationIcon, SlidersHorizontal, Circle, ChevronDown, Globe, MessageCircle, Share2, ExternalLink, Octagon, Mic, MicOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

const MAPPLS_KEY = "kycwcidjksumwgnzfqkcipivnbvtprgzuzpz";
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
        do { b = encoded.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
        lat += ((result & 1) ? ~(result >> 1) : (result >> 1));
        shift = 0; result = 0;
        do { b = encoded.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
        lng += ((result & 1) ? ~(result >> 1) : (result >> 1));
        points.push([lng / 1e5, lat / 1e5]);
    }
    return points;
}

function haversineMeters(a: [number, number], b: [number, number]): number {
    const R = 6371000;
    const dLat = (b[1] - a[1]) * Math.PI / 180;
    const dLng = (b[0] - a[0]) * Math.PI / 180;
    const aa = Math.sin(dLat / 2) ** 2 + Math.cos(a[1] * Math.PI / 180) * Math.cos(b[1] * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(aa), Math.sqrt(1 - aa));
}

/** Calculate total distance of a polyline in meters */
function calcPolylineDistance(polyline: [number, number][]): number {
    let d = 0;
    for (let i = 0; i < polyline.length - 1; i++) {
        d += haversineMeters(polyline[i], polyline[i + 1]);
    }
    return d;
}

function snapToPolyline(user: [number, number], polyline: [number, number][]): { index: number; distanceM: number } {
    let bestIdx = 0, bestDist = Infinity;
    for (let i = 0; i < polyline.length - 1; i++) {
        const a = polyline[i], b = polyline[i + 1];
        const dx = b[0] - a[0], dy = b[1] - a[1];
        if (dx === 0 && dy === 0) { const d = haversineMeters(user, a); if (d < bestDist) { bestDist = d; bestIdx = i; } continue; }
        let t = ((user[0] - a[0]) * dx + (user[1] - a[1]) * dy) / (dx * dx + dy * dy);
        t = Math.max(0, Math.min(1, t));
        const d = haversineMeters(user, [a[0] + t * dx, a[1] + t * dy]);
        if (d < bestDist) { bestDist = d; bestIdx = i; }
    }
    return { index: bestIdx, distanceM: bestDist };
}

interface Business {
    _id: string; businessName: string; brandName?: string; businessCategory: string;
    description?: string; registeredOfficeAddress?: string;
    gpsCoordinates: { lat: number; lng: number };
    primaryContactNumber?: string; officialWhatsAppNumber?: string; website?: string;
    openingTime?: string; closingTime?: string; coverImage?: string;
    aadhaarVerified?: boolean; distanceKm?: number | null; durationMins?: number | null;
}

declare global { interface Window { mappls: any; } }

export default function NearbyMap({ onClose }: { onClose: () => void }) {
    const mapContainer = useRef<HTMLDivElement>(null);
    const mapRef = useRef<any>(null);
    const markersRef = useRef<any[]>([]);
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => { setIsMounted(true); }, []);
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
    const [routeInfo, setRouteInfo] = useState<{ distance: number; duration: number; businessName: string; trafficCondition: string } | null>(null);
    const [isNavigating, setIsNavigating] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef<any>(null);
    const watchIdRef = useRef<number | null>(null);
    const userMarkerRef = useRef<any>(null);
    const startMarkerRef = useRef<any>(null);
    const [isAutoCentering, setIsAutoCentering] = useState(true);
    const autoCenteringRef = useRef(true);
    useEffect(() => { autoCenteringRef.current = isAutoCentering; }, [isAutoCentering]);
    const isProgrammaticMove = useRef(false);
    const lastLocationRef = useRef<{ lat: number; lng: number } | null>(null);
    const activeDestRef = useRef<{ lat: number; lng: number } | null>(null);
    const [isMuted, setIsMuted] = useState(false);
    const isMutedRef = useRef(false);
    const canonicalLocRef = useRef<{ lat: number; lng: number } | null>(null);
    const routeOriginRef = useRef<{ lat: number; lng: number } | null>(null);
    const gpsReadyRef = useRef<boolean>(false);
    const [gpsReady, setGpsReady] = useState(false);
    const navigationStepsRef = useRef<any[]>([]);
    const lastInstructionSpokenRef = useRef<string>("");
    const routePolylineRef = useRef<[number, number][]>([]);
    const lastRerouteTimeRef = useRef<number>(0);
    const isReroutingRef = useRef<boolean>(false);
    const routeLayerRef = useRef<any>(null);
    const routeCoveredLayerRef = useRef<any>(null);
    const sdkLoadedRef = useRef(false);

    const API = process.env.NEXT_PUBLIC_API_URL;

    const hasMoved = (a: { lat: number; lng: number }, b: { lat: number; lng: number }, thresholdM = 15): boolean => {
        const R = 6371000;
        const dLat = (b.lat - a.lat) * Math.PI / 180;
        const dLng = (b.lng - a.lng) * Math.PI / 180;
        const aa = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * Math.PI / 180) * Math.cos(b.lat * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
        return R * 2 * Math.atan2(Math.sqrt(aa), Math.sqrt(1 - aa)) > thresholdM;
    };

    const getFreshLocation = (): Promise<{ lat: number; lng: number }> => {
        return new Promise((resolve) => {
            if (canonicalLocRef.current && gpsReadyRef.current) { resolve(canonicalLocRef.current); return; }
            if (navigator.geolocation) {
                const timeout = setTimeout(() => {
                    const fallback = canonicalLocRef.current || lastLocationRef.current;
                    resolve(fallback || { lat: 28.6139, lng: 77.2090 });
                }, 8000);
                navigator.geolocation.getCurrentPosition(
                    (pos) => { clearTimeout(timeout); const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude }; canonicalLocRef.current = loc; gpsReadyRef.current = true; lastLocationRef.current = loc; setUserLocation(loc); resolve(loc); },
                    () => { clearTimeout(timeout); resolve(canonicalLocRef.current || lastLocationRef.current || { lat: 28.6139, lng: 77.2090 }); },
                    { enableHighAccuracy: true, timeout: 7000, maximumAge: 0 }
                );
            } else { resolve(canonicalLocRef.current || { lat: 28.6139, lng: 77.2090 }); }
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
        } catch (e) { console.error("Failed to fetch nearby businesses:", e); }
        finally { setLoading(false); }
    }, [API]);

    const debouncedFetch = useCallback(
        debounce((lat: number, lng: number, cat: string, rad: number) => { fetchNearbyBusinesses(lat, lng, cat, rad); }, 600),
        [fetchNearbyBusinesses]
    );

    // ── Load Mappls SDK Script (sequential: SDK first, then plugins) ─────────
    useEffect(() => {
        if (sdkLoadedRef.current) return;
        if (document.getElementById('mappls-sdk')) {
            // Script tag already exists — check if SDK loaded
            if (window.mappls) { sdkLoadedRef.current = true; }
            return;
        }

        const script = document.createElement('script');
        script.id = 'mappls-sdk';
        script.src = `https://apis.mappls.com/advancedmaps/api/${MAPPLS_KEY}/map_sdk?layer=vector&v=3.0`;
        script.async = true;
        script.onerror = () => { console.error('Failed to load Mappls SDK script'); };
        script.onload = () => {
            console.log('✅ Mappls SDK loaded');
            // Load plugins AFTER main SDK is ready
            if (!document.getElementById('mappls-plugins')) {
                const pluginScript = document.createElement('script');
                pluginScript.id = 'mappls-plugins';
                pluginScript.src = `https://apis.mappls.com/advancedmaps/api/${MAPPLS_KEY}/map_sdk_plugins?v=3.0`;
                pluginScript.async = true;
                pluginScript.onload = () => { console.log('✅ Mappls Plugins loaded'); sdkLoadedRef.current = true; };
                pluginScript.onerror = () => { console.warn('Plugins failed, SDK still usable'); sdkLoadedRef.current = true; };
                document.head.appendChild(pluginScript);
            } else {
                sdkLoadedRef.current = true;
            }
        };
        document.head.appendChild(script);
    }, []);

    const searchParams = useSearchParams();
    const paramLat = searchParams.get("lat");
    const paramLng = searchParams.get("lng");
    const paramId = searchParams.get("id");

    // ── GPS Acquisition ──────────────────────────────────────────────────────
    useEffect(() => {
        if (paramLat && paramLng) {
            setMapInitialCenter({ lat: parseFloat(paramLat), lng: parseFloat(paramLng) });
        }
        if (navigator.geolocation) {
            setLocating(true);
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                    canonicalLocRef.current = loc; lastLocationRef.current = loc; gpsReadyRef.current = true;
                    setUserLocation(loc); setGpsReady(true); setLocating(false);
                    if (!paramLat || !paramLng) setMapInitialCenter(loc);
                },
                () => {
                    if (!paramLat || !paramLng) { const d = { lat: 28.6139, lng: 77.2090 }; setMapInitialCenter(d); setUserLocation(d); }
                    setLocating(false);
                },
                { enableHighAccuracy: false, timeout: 5000, maximumAge: 10000 }
            );
            const wId = navigator.geolocation.watchPosition(
                (p) => {
                    const loc = { lat: p.coords.latitude, lng: p.coords.longitude };
                    // If we already have a location, only update if it move significantly (> 5m)
                    if (lastLocationRef.current && !hasMoved(lastLocationRef.current, loc, 5)) return;
                    
                    canonicalLocRef.current = loc; lastLocationRef.current = loc; gpsReadyRef.current = true; setGpsReady(true);
                    if (userMarkerRef.current && window.mappls) {
                        userMarkerRef.current.setPosition({ lat: loc.lat, lng: loc.lng });
                    }
                },
                () => {},
                { enableHighAccuracy: true, maximumAge: 5000 }
            );
            watchIdRef.current = wId;
        } else {
            if (!paramLat || !paramLng) { const d = { lat: 28.6139, lng: 77.2090 }; setMapInitialCenter(d); setUserLocation(d); }
            setLocating(false);
        }
        if (paramId) {
            const fetchTarget = async () => { try { await fetch(`${API}/business/public/${paramId}`); } catch (e) { console.error("Failed target fetch:", e); } };
            fetchTarget();
        }
        return () => { if (watchIdRef.current !== null) { navigator.geolocation.clearWatch(watchIdRef.current); watchIdRef.current = null; } };
    }, [paramLat, paramLng, paramId, API]);

    // ── Map Init ─────────────────────────────────────────────────────────────
    useEffect(() => {
        const initial = mapInitialCenter || userLocation;
        if (!initial || !mapContainer.current || mapRef.current) return;

        // Assign a stable ID to the container div for Mappls (requires string ID)
        const containerId = 'mappls-map-container';
        mapContainer.current.id = containerId;

        const tryInit = () => {
            if (!window.mappls || typeof window.mappls.Map !== 'function') {
                console.log('⏳ Waiting for Mappls SDK...');
                setTimeout(tryInit, 300);
                return;
            }
            const mapplsSDK = window.mappls;
            console.log('🗺️ Initializing Mappls Map at', initial);

            // Mappls.Map expects a STRING container ID
            const map = new mapplsSDK.Map(containerId, {
                center: [initial.lat, initial.lng],
                zoom: 15,
                search: false,
                zoomControl: true,
                location: false,
            });

            mapRef.current = map;

            map.addListener('load', () => {
                console.log('✅ Mappls Map loaded successfully');
                setMapLoaded(true);

                // 3D tilt
                try {
                    if (typeof map.setTilt === 'function') map.setTilt(45);
                } catch (e) { console.warn('Tilt not supported:', e); }

                // User marker — using html parameter (Mappls does not support element)
                const markerLoc = canonicalLocRef.current || initial;
                const userMarkerHtml = `<div style="position:relative;width:24px;height:24px;"><div style="position:absolute;inset:0;border-radius:50%;background:#0ea5e9;opacity:0.3;animation:pulse 2s infinite;"></div><div style="position:absolute;inset:4px;border-radius:50%;background:white;border:3px solid #0ea5e9;box-shadow:0 0 15px #0ea5e9;"></div></div>`;
                try {
                    userMarkerRef.current = new mapplsSDK.Marker({
                        map: map,
                        position: { lat: markerLoc.lat, lng: markerLoc.lng },
                        html: userMarkerHtml,
                    });
                } catch (e) {
                    // Fallback: default marker without custom HTML
                    console.warn('Custom marker failed, using default:', e);
                    userMarkerRef.current = new mapplsSDK.Marker({
                        map: map,
                        position: { lat: markerLoc.lat, lng: markerLoc.lng },
                    });
                }
            });

            fetchNearbyBusinesses(initial.lat, initial.lng, category, radius);

            map.addListener('idle', () => {
                const center = map.getCenter();
                if (center) {
                    const lat = typeof center.lat === 'function' ? center.lat() : center.lat;
                    const lng = typeof center.lng === 'function' ? center.lng() : center.lng;
                    debouncedFetch(lat, lng, category, radius);
                    if (!canonicalLocRef.current) canonicalLocRef.current = { lat, lng };
                }
            });

            map.addListener('drag', () => {
                if (autoCenteringRef.current) { setIsAutoCentering(false); autoCenteringRef.current = false; }
            });
        };

        tryInit();

        return () => {
            if (mapRef.current) {
                try { mapRef.current.remove(); } catch (e) {}
                mapRef.current = null;
            }
        };
    }, [mapInitialCenter !== null || userLocation !== null]);

    // ── Business Markers ─────────────────────────────────────────────────────
    useEffect(() => {
        if (!mapLoaded || !window.mappls) return;
        const mappls = window.mappls;
        const map = mapRef.current;
        if (!map) return;

        markersRef.current.forEach(m => { try { mappls.remove({ map, layer: m }); } catch (e) {} });
        markersRef.current = [];

        const filtered = businesses.filter(b =>
            (b.brandName || b.businessName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
            (b.businessCategory || "").toLowerCase().includes(searchQuery.toLowerCase())
        );

        filtered.forEach(biz => {
            if (!biz.gpsCoordinates?.lat || !biz.gpsCoordinates?.lng) return;
            const c = (biz.businessCategory || "").toLowerCase();
            let color = "#60a5fa", symbol = "📍";
            if (c.includes("food") || c.includes("rest") || c.includes("cafe")) { color = "#34d399"; symbol = "🍔"; }
            else if (c.includes("health") || c.includes("hospi")) { color = "#f87171"; symbol = "🏥"; }
            else if (c.includes("shop") || c.includes("retail")) { color = "#f472b6"; symbol = "🛒"; }
            else if (c.includes("tech") || c.includes("it") || c.includes("software")) { color = "#a78bfa"; symbol = "💻"; }
            else if (c.includes("edu") || c.includes("school") || c.includes("college")) { color = "#fbbf24"; symbol = "🎓"; }

            const markerHtml = `<div style="width:48px;height:48px;border-radius:50%;background:rgba(10,15,35,0.85);backdrop-filter:blur(8px);border:2.5px solid ${color};display:flex;align-items:center;justify-content:center;font-size:24px;box-shadow:inset 0 0 12px ${color}66,0 6px 15px rgba(0,0,0,0.6);cursor:pointer;">${symbol}</div>`;
            try {
                const marker = new mappls.Marker({
                    map: map,
                    position: { lat: biz.gpsCoordinates.lat, lng: biz.gpsCoordinates.lng },
                    html: markerHtml,
                });
                marker.addListener('click', () => {
                    setSelectedBusiness(biz);
                    map.setCenter([biz.gpsCoordinates.lat, biz.gpsCoordinates.lng]);
                    if (typeof map.setZoom === 'function') map.setZoom(17);
                });
                markersRef.current.push(marker);
            } catch (e) { console.warn('Marker creation failed:', e); }
        });
    }, [businesses, mapLoaded, searchQuery]);

    // ── Search ───────────────────────────────────────────────────────────────
    useEffect(() => {
        if (searchQuery.trim().length === 0) { setSearchResults([]); return; }
        const haversineKm = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
            const R = 6371; const dLat = (lat2 - lat1) * Math.PI / 180; const dLng = (lng2 - lng1) * Math.PI / 180;
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
                const res = await fetch(url); const data = await res.json();
                if (data.success && data.data) {
                    let results = data.data;
                    if (searchLoc) {
                        results = results.map((b: any) => ({ ...b, distanceKm: haversineKm(searchLoc.lat, searchLoc.lng, b.gpsCoordinates.lat, b.gpsCoordinates.lng), durationMins: null }));
                        results.sort((a: any, b: any) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));
                    }
                    setSearchResults(results.slice(0, 20));
                }
            } catch (e) { console.error("Search failed:", e); }
            finally { setLoading(false); }
        };
        const timer = setTimeout(fetchSearchResults, 300);
        return () => clearTimeout(timer);
    }, [searchQuery, API]);

    const initialSelectPerformed = useRef(false);
    useEffect(() => {
        if (paramId && businesses.length > 0 && !initialSelectPerformed.current) {
            const biz = businesses.find(b => b._id === paramId);
            if (biz) { initialSelectPerformed.current = true; setSelectedBusiness(biz); mapRef.current?.setCenter([biz.gpsCoordinates.lat, biz.gpsCoordinates.lng]); }
        }
    }, [businesses, mapLoaded, paramId]);

    const formatTime = (t: string) => { if (!t) return ""; const [h, m] = t.split(":"); const hr = parseInt(h); return `${(hr % 12 || 12).toString().padStart(2, "0")}:${m} ${hr >= 12 ? "PM" : "AM"}`; };

    const handleShare = async (biz: Business) => {
        const shareData = { title: biz.brandName || biz.businessName, text: `Check out ${biz.brandName || biz.businessName} on DBI!`, url: `${window.location.origin}/business/${biz._id}` };
        try { if (navigator.share) await navigator.share(shareData); else { await navigator.clipboard.writeText(shareData.url); alert("Link copied!"); } } catch (e) { console.error(e); }
    };

    const zoomIn = () => { if (mapRef.current?.setZoom) { const z = mapRef.current.getZoom(); mapRef.current.setZoom(z + 1); } };
    const zoomOut = () => { if (mapRef.current?.setZoom) { const z = mapRef.current.getZoom(); mapRef.current.setZoom(z - 1); } };

    const toggleVoiceInput = () => {
        if (isListening) { if (recognitionRef.current) recognitionRef.current.stop(); setIsListening(false); return; }
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) { alert("Voice not supported. Try Chrome."); return; }
        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US'; recognition.interimResults = false; recognition.maxAlternatives = 1;
        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onerror = () => setIsListening(false);
        recognition.onresult = async (event: any) => {
            const transcript = event.results[0][0].transcript;
            setSearchQuery(transcript); setIsListening(false);
            if (recognitionRef.current) recognitionRef.current.stop();
            try {
                const voiceLoc = canonicalLocRef.current;
                let url = `${API}/business/search?q=${encodeURIComponent(transcript)}`;
                if (voiceLoc) url += `&lat=${voiceLoc.lat}&lng=${voiceLoc.lng}`;
                const res = await fetch(url); const data = await res.json();
                if (data.success && data.data && data.data.length > 0) {
                    const topBiz = data.data[0]; setSelectedBusiness(topBiz);
                    setBusinesses(prev => prev.some(b => b._id === topBiz._id) ? prev : [...prev, topBiz]);
                    mapRef.current?.setCenter([topBiz.gpsCoordinates.lat, topBiz.gpsCoordinates.lng]);
                    if (typeof mapRef.current?.setZoom === 'function') mapRef.current.setZoom(18);
                }
            } catch (err) { console.error("Voice search failed:", err); }
        };
        recognitionRef.current = recognition; recognition.start();
    };

    // ── Clear Route ──────────────────────────────────────────────────────────
    const clearRoute = () => {
        const map = mapRef.current;
        const mappls = window.mappls;
        if (!map || !mappls) return;
        if (routeLayerRef.current) { try { mappls.remove({ map, layer: routeLayerRef.current }); } catch (e) {} routeLayerRef.current = null; }
        if (routeCoveredLayerRef.current) { try { mappls.remove({ map, layer: routeCoveredLayerRef.current }); } catch (e) {} routeCoveredLayerRef.current = null; }
        if (startMarkerRef.current) { try { mappls.remove({ map, layer: startMarkerRef.current }); } catch (e) {} startMarkerRef.current = null; }
    };

    // ── SHOW ROUTE ───────────────────────────────────────────────────────────
    const handleShowRoute = async () => {
        if (!mapRef.current || !selectedBusiness || !window.mappls) return;
        const mappls = window.mappls;
        const map = mapRef.current;

        const freshUserLoc = await getFreshLocation();
        const distCheck = Math.abs(freshUserLoc.lat - selectedBusiness.gpsCoordinates.lat) + Math.abs(freshUserLoc.lng - selectedBusiness.gpsCoordinates.lng);
        if (distCheck < 0.0001) { alert(!gpsReadyRef.current ? 'Please enable GPS/Location access to get turn-by-turn directions.' : 'You appear to be at this location already!'); return; }

        activeDestRef.current = selectedBusiness.gpsCoordinates;

        try {
            const originStr = `${freshUserLoc.lat},${freshUserLoc.lng}`;
            const destStr = `${selectedBusiness.gpsCoordinates.lat},${selectedBusiness.gpsCoordinates.lng}`;
            const json = await fetch(`/api/directions?origin=${originStr}&destination=${destStr}`).then(r => r.json());

            if (!json.routes?.length) { alert('No route found for this destination.'); return; }

            const data = json.routes[0];
            const route: [number, number][] = decodePolyline(data.geometry || '');
            if (route.length < 2) { alert('Route could not be decoded.'); return; }

            routePolylineRef.current = route;
            lastRerouteTimeRef.current = Date.now();

            const distKm = (data.distance || 0) / 1000;
            const durMin = (data.duration || 0) / 60;

            // Extract steps for voice
            const processedSteps = (data.legs?.[0]?.steps || []).map((s: any) => {
                let inst = s.name || '';
                const maneuver = s.maneuver;
                if (maneuver) {
                    const dir = maneuver.modifier ? ` ${maneuver.modifier}` : '';
                    inst = `${maneuver.type}${dir}${inst ? ' onto ' + inst : ''}`;
                }
                return { lat: maneuver?.location?.[1] || 0, lng: maneuver?.location?.[0] || 0, instruction: inst };
            }).filter((s: any) => s.instruction);

            navigationStepsRef.current = processedSteps;
            lastInstructionSpokenRef.current = '';
            routeOriginRef.current = freshUserLoc;
            canonicalLocRef.current = freshUserLoc;
            lastLocationRef.current = freshUserLoc;

            setIsNavigating(false);
            setRouteInfo({ distance: distKm, duration: durMin, businessName: selectedBusiness.brandName || selectedBusiness.businessName, trafficCondition: 'TRAFFIC' });

            // Clear old route
            clearRoute();

            // Draw route as polyline
            const routePath = route.map(([lng, lat]) => ({ lat, lng }));
            routeLayerRef.current = new mappls.polyline({
                map: map,
                path: routePath,
                strokeColor: '#22c55e',
                strokeOpacity: 0.9,
                strokeWeight: 7,
                fitbounds: true,
                fitboundOptions: { padding: { top: 150, bottom: 350, left: 50, right: 50 }, duration: 1500 },
            });

            // Start marker (arrow)
            const startCoord = route[0];
            const nextCoord = route[1] || route[0];
            const bearing = Math.atan2(nextCoord[0] - startCoord[0], nextCoord[1] - startCoord[1]) * 180 / Math.PI;
            const arrowHtml = `<div style="transform:rotate(${bearing}deg);filter:drop-shadow(0 0 15px rgba(14,165,233,0.8));"><svg width="56" height="56" viewBox="0 0 24 24" fill="none"><path d="M12 2L19 21L12 17L5 21L12 2Z" fill="#0ea5e9" stroke="white" stroke-width="2" stroke-linejoin="round"/><circle cx="12" cy="14" r="2" fill="white" opacity="0.5"/></svg></div>`;
            startMarkerRef.current = new mappls.Marker({
                map: map,
                position: { lat: startCoord[1], lng: startCoord[0] },
                html: arrowHtml,
            });

            setSelectedBusiness(null);
        } catch (err) { console.error('Could not fetch directions:', err); alert('Could not fetch route. Please try again.'); }
    };

    const siteBackground = { backgroundImage: `radial-gradient(at 0% 0%, hsla(210, 100%, 56%, 0.15) 0px, transparent 50%), radial-gradient(at 100% 0%, hsla(255, 60%, 69%, 0.1) 0px, transparent 50%)`, backgroundColor: "#020631" };

    return (
        <div className="relative w-full h-[100dvh] bg-[#020617] overflow-hidden font-display">
            {/* Map Container with dark filter */}
            <div style={{ filter: 'invert(1) hue-rotate(180deg)', width: '100%', height: '100%', position: 'absolute', inset: 0 }}>
                <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
            </div>

            {/* GPS Loading */}
            <AnimatePresence>
                {locating && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute top-20 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 px-4 py-2 bg-black/60 backdrop-blur-xl border border-primary/30 rounded-full text-primary text-xs font-bold">
                        <Loader2 size={14} className="animate-spin" /> Getting your location...
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Active Navigation Header - Notch Safe */}
            <AnimatePresence>
                {isNavigating && (
                    <motion.div initial={{ y: -100 }} animate={{ y: 0 }} exit={{ y: -100 }} className="absolute top-0 left-0 right-0 z-40 bg-[#081121]/80 backdrop-blur-3xl p-4 rounded-b-[2rem] flex items-center justify-between shadow-[0_10px_60px_rgba(0,0,0,0.7)] border-b border-white/10 w-full px-6">
                        <div className="flex items-center gap-2 sm:gap-3">
                            <div className="relative">
                                <div className="absolute inset-0 bg-primary/20 blur-lg rounded-full animate-pulse" />
                                <NavigationIcon size={18} className="text-primary relative z-10 animate-bounce" />
                            </div>
                            <div><h2 className="text-white font-black text-lg sm:text-xl tracking-tighter leading-tight">NAVIGATING</h2></div>
                        </div>
                        <button
                            onClick={() => {
                                setIsNavigating(false); setIsAutoCentering(true);
                                if (watchIdRef.current !== null) { navigator.geolocation.clearWatch(watchIdRef.current); watchIdRef.current = null; }
                                clearRoute();
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
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="absolute top-0 left-0 right-0 z-20 p-3 md:p-6 flex flex-col md:flex-row items-stretch md:items-start gap-3 max-w-7xl mx-auto pointer-events-none">
                        <div className="flex-1 flex flex-col gap-2 relative pointer-events-auto order-2 md:order-1">
                            <div className="h-12 md:h-14 flex items-center gap-3 bg-black/40 backdrop-blur-3xl border border-white/20 rounded-2xl md:rounded-3xl px-4 md:px-6 shadow-[0_8px_32px_rgba(0,0,0,0.5)] transition-all focus-within:bg-black/60 focus-within:border-primary/50">
                                <Search size={18} className="text-primary animate-pulse shrink-0" />
                                <input type="text" placeholder={isListening ? "Listening..." : "Search for businesses..."} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} suppressHydrationWarning className="bg-transparent border-none outline-none text-white text-sm md:text-base font-semibold flex-1 placeholder:text-white/50" />
                                <button onClick={toggleVoiceInput} suppressHydrationWarning className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 pointer-events-auto shrink-0 relative ${isListening ? 'bg-primary text-white' : 'text-primary/60 hover:text-primary'}`}>
                                    {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                                </button>
                                {loading && <Loader2 size={18} className="text-primary animate-spin shrink-0" />}
                            </div>

                            <AnimatePresence>
                                {searchQuery.trim().length > 0 && searchResults.length > 0 && (
                                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute top-[60px] md:top-[64px] left-0 right-0 bg-black/80 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] overflow-hidden max-h-[60vh] overflow-y-auto">
                                        <div className="p-2 flex flex-col gap-1">
                                            {searchResults.slice(0, 10).map((biz) => (
                                                <button key={biz._id} onClick={() => { setSelectedBusiness(biz); setSearchQuery(''); if (!businesses.find(b => b._id === biz._id)) setBusinesses(prev => [...prev, biz]); mapRef.current?.setCenter([biz.gpsCoordinates.lat, biz.gpsCoordinates.lng]); }} className="flex items-center gap-3 w-full p-3 md:p-4 hover:bg-white/10 transition-colors rounded-xl text-left">
                                                    <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0"><MapPin size={16} className="text-primary" /></div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="text-white font-bold text-sm truncate">{biz.brandName || biz.businessName}</h4>
                                                        <p className="text-white/50 text-xs truncate">{biz.registeredOfficeAddress}</p>
                                                    </div>
                                                    {(biz.distanceKm != null) && (
                                                        <span className="flex items-center gap-1 text-primary font-black whitespace-nowrap bg-primary/10 px-2 py-1 rounded-lg border border-primary/30 text-[10px]">
                                                            {biz.distanceKm.toFixed(1)} KM
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
                            <button onClick={onClose} className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-3xl bg-black/40 backdrop-blur-3xl border border-white/20 flex items-center justify-center text-white/90 hover:text-red-400 transition-all"><X size={18} /></button>
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
                @keyframes pulse { 0%, 100% { transform: scale(1); opacity: 0.3; } 50% { transform: scale(1.5); opacity: 0.1; } }
            `}</style>

            {/* Business Detail Card */}
            <AnimatePresence>
                {selectedBusiness && (
                    <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }} className="absolute bottom-6 md:bottom-8 left-0 right-0 z-20 px-4 flex justify-center pointer-events-none">
                        <div className="relative bg-black/40 backdrop-blur-3xl border border-white/20 rounded-[2rem] md:rounded-[2.5rem] p-6 shadow-[0_15px_60px_rgba(0,0,0,0.8)] w-full max-w-sm pointer-events-auto">
                            <button onClick={() => setSelectedBusiness(null)} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/20 transition-all"><X size={14} /></button>
                            <h3 className="text-white font-black text-xl mb-1 truncate pr-8">{selectedBusiness.brandName || selectedBusiness.businessName}</h3>
                            <span className="text-primary text-[10px] md:text-xs font-bold uppercase mb-4 block tracking-[0.2em]">{selectedBusiness.businessCategory}</span>
                            <p className="text-white/40 text-[11px] md:text-xs mb-6 leading-relaxed flex items-start gap-2"><MapPin size={14} className="text-primary shrink-0 mt-0.5" />{selectedBusiness?.registeredOfficeAddress}</p>

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

                            <button onClick={handleShowRoute} className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] uppercase font-black tracking-widest mt-6 hover:bg-blue-500/20 transition-all cursor-pointer">
                                <NavigationIcon size={14} /> SHOW ROUTE
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Route Info Card */}
            <AnimatePresence>
                {routeInfo && !selectedBusiness && (
                    <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }} className={`absolute z-30 px-4 flex justify-center pointer-events-auto transition-all duration-700 w-full left-0 right-0 bottom-12 h-min`}>
                        <div className={`relative bg-[#081121]/90 backdrop-blur-[40px] border ${isNavigating ? 'border-primary/40' : 'border-primary/20'} shadow-[0_25px_100px_rgba(0,0,0,0.9)] overflow-hidden transition-all duration-500
                            rounded-[1.8rem] p-3 sm:p-5 w-full max-w-[340px] sm:max-w-[400px]`}>
                            <motion.div animate={{ y: ['100%', '-100%'] }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/10 to-transparent h-1/2 pointer-events-none opacity-40" />

                            {!isNavigating && (
                                <button onClick={() => { setRouteInfo(null); clearRoute(); if (userLocation) mapRef.current?.setCenter([userLocation.lat, userLocation.lng]); }} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/5 border border-white/10 text-white flex items-center justify-center z-20 hover:bg-white/10 transition-colors"><X size={14} /></button>
                            )}

                            <div className={`flex relative z-10 w-full ${isNavigating ? 'flex-row items-center justify-between gap-3' : 'flex-col'}`}>
                                <div className="flex flex-col min-w-[85px]">
                                    <div className="flex items-center gap-1.5 mb-1.5 font-black uppercase tracking-[0.2em] text-[10px]">
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                        <span className="text-primary text-[10px] font-black uppercase tracking-[0.2em]">LIVE</span>
                                    </div>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-white text-3xl font-black tracking-tighter leading-none">
                                            {Math.round(routeInfo.duration)}
                                        </span>
                                        <span className="text-white/60 text-[10px] font-bold uppercase">MIN</span>
                                    </div>
                                </div>

                                <div className="flex-1 flex flex-col justify-center border-l border-white/10 pl-2 sm:pl-6 gap-2">
                                    <div className="flex flex-col">
                                        <span className="text-white/30 text-[9px] font-black uppercase tracking-widest leading-none mb-1">Distance Left</span>
                                        <span className="text-white text-xl font-black leading-none uppercase">
                                            {routeInfo.distance.toFixed(1)}<span className="text-xs ml-1 text-white/50">KM</span>
                                        </span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-white/30 text-[9px] font-black uppercase tracking-widest leading-none mb-1">Arrival Time</span>
                                        <span className="text-primary text-base font-black leading-none whitespace-nowrap">
                                            {isMounted && routeInfo && (() => {
                                                const d = new Date();
                                                d.setMinutes(d.getMinutes() + routeInfo.duration);
                                                const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
                                                const parts = timeStr.split(' ');
                                                const time = parts[0];
                                                const period = parts[1] || '';
                                                return (
                                                    <>
                                                        {time} <span className="text-[9px] opacity-70 ml-0.5">{period}</span>
                                                    </>
                                                );
                                            })()}
                                        </span>
                                    </div>
                                </div>

                                <div className={`flex items-center ${isNavigating ? 'flex-shrink-0' : 'w-full mt-4 pt-4 border-t border-white/5'}`}>
                                    {!isNavigating ? (
                                        <button
                                            onClick={() => {
                                                setIsNavigating(true); setIsAutoCentering(true);
                                                const navLoc = routeOriginRef.current || canonicalLocRef.current;
                                                if (navLoc) { mapRef.current?.setCenter([navLoc.lat, navLoc.lng]); if (typeof mapRef.current?.setZoom === 'function') mapRef.current.setZoom(18); }
                                                if (navigationStepsRef.current.length > 0) {
                                                    const firstStep = navigationStepsRef.current[0];
                                                    const utterance = new SpeechSynthesisUtterance('Starting navigation. ' + firstStep.instruction);
                                                    utterance.rate = 0.95; utterance.pitch = 1.05;
                                                    if (!isMutedRef.current) window.speechSynthesis.speak(utterance);
                                                    lastInstructionSpokenRef.current = firstStep.instruction;
                                                }

                                                // GPS watcher for live navigation
                                                if (navigator.geolocation) {
                                                    if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
                                                    watchIdRef.current = navigator.geolocation.watchPosition(
                                                        (pos) => {
                                                            const lat = pos.coords.latitude, lng = pos.coords.longitude;
                                                            const speed = pos.coords.speed || 0; // speed in meters/second
                                                            const newLoc = { lat, lng };
                                                            
                                                            // Filter for jitter: tighter threshold for "PRO" accuracy (3m if slow, 1.5m if driving)
                                                            const threshold = speed < 1.0 ? 3 : 1.5;
                                                            if (lastLocationRef.current && !hasMoved(lastLocationRef.current, newLoc, threshold)) return;
                                                            lastLocationRef.current = newLoc; canonicalLocRef.current = newLoc; setUserLocation(newLoc);
                                                            const userLngLat: [number, number] = [lng, lat];

                                                            // Snap + off-route check
                                                            const poly = routePolylineRef.current;
                                                            if (poly.length >= 2) {
                                                                const { index: snapIdx, distanceM } = snapToPolyline(userLngLat, poly);
                                                                
                                                                // ✅ Real-time Progress Update
                                                                if (routeInfo) {
                                                                    const remaining = poly.slice(snapIdx);
                                                                    const remainingDistM = calcPolylineDistance(remaining);
                                                                    const totalDistM = calcPolylineDistance(poly) || 1;
                                                                    const ratio = remainingDistM / totalDistM;
                                                                    const newDuration = (routeInfo.duration > 0) ? (ratio * routeInfo.duration) : (remainingDistM / 1000 * 5);

                                                                    setRouteInfo(prev => prev ? {
                                                                        ...prev,
                                                                        distance: remainingDistM / 1000,
                                                                        duration: newDuration
                                                                    } : prev);
                                                                }

                                                                if (distanceM > 45 && Date.now() - lastRerouteTimeRef.current > 10000 && !isReroutingRef.current) {
                                                                    isReroutingRef.current = true; lastRerouteTimeRef.current = Date.now();
                                                                    const dest = activeDestRef.current;
                                                                    if (dest) {
                                                                        fetch(`/api/directions?origin=${lat},${lng}&destination=${dest.lat},${dest.lng}`)
                                                                            .then(r => r.json()).then(js => {
                                                                                if (!js.routes?.length) return;
                                                                                const d = js.routes[0];
                                                                                const newRoute = decodePolyline(d.geometry || '');
                                                                                if (newRoute.length < 2) return;
                                                                                routePolylineRef.current = newRoute;
                                                                                setRouteInfo(prev => prev ? { ...prev, distance: (d.distance || 0) / 1000, duration: (d.duration || 0) / 60 } : prev);
                                                                                // Redraw
                                                                                clearRoute();
                                                                                const routePath = newRoute.map(([lng, lat]) => ({ lat, lng }));
                                                                                routeLayerRef.current = new window.mappls.polyline({ map: mapRef.current, path: routePath, strokeColor: '#22c55e', strokeOpacity: 0.9, strokeWeight: 7 });
                                                                            }).catch(e => console.warn('Reroute error:', e))
                                                                            .finally(() => { isReroutingRef.current = false; });
                                                                    }
                                                                }
                                                            }

                                                            // Voice instructions
                                                            if (navigationStepsRef.current.length > 0) {
                                                                const nextStep = navigationStepsRef.current[0];
                                                                const stepDist = haversineMeters(userLngLat, [nextStep.lng, nextStep.lat]);
                                                                if (stepDist < 150) {
                                                                    if (lastInstructionSpokenRef.current !== nextStep.instruction) {
                                                                        const u = new SpeechSynthesisUtterance(nextStep.instruction);
                                                                        u.rate = 0.95; u.pitch = 1.05;
                                                                        if (!isMutedRef.current) window.speechSynthesis.speak(u);
                                                                        lastInstructionSpokenRef.current = nextStep.instruction;
                                                                    }
                                                                    if (stepDist < 30) navigationStepsRef.current.shift();
                                                                }
                                                            }

                                                            // Camera follow
                                                            if (autoCenteringRef.current && mapRef.current) {
                                                                isProgrammaticMove.current = true;
                                                                const map = mapRef.current;
                                                                map.setCenter([lat, lng]);
                                                                // Calculate movement bearing for rotation
                                                                if (lastLocationRef.current) {
                                                                    const dLng = lng - lastLocationRef.current.lng;
                                                                    const dLat = lat - lastLocationRef.current.lat;
                                                                    if (Math.abs(dLng) > 0.00001 || Math.abs(dLat) > 0.00001) {
                                                                        const b = Math.atan2(dLng, dLat) * 180 / Math.PI;
                                                                        if (typeof map.setBearing === 'function') map.setBearing(b);
                                                                        // Balanced zoom and tilt for mobile navigation
                                                                        if (typeof map.setTilt === 'function') map.setTilt(55.0);
                                                                        if (typeof map.setZoom === 'function') map.setZoom(19.3);
                                                                    }
                                                                }
                                                                setTimeout(() => { isProgrammaticMove.current = false; }, 900);
                                                            }
                                                            if (userMarkerRef.current) userMarkerRef.current.setPosition({ lat, lng });
                                                            if (startMarkerRef.current) startMarkerRef.current.setPosition({ lat, lng });
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
                                                onClick={() => { const nextMuted = !isMuted; setIsMuted(nextMuted); isMutedRef.current = nextMuted; if (nextMuted) window.speechSynthesis.cancel(); }}
                                                className={`p-2.5 rounded-xl border transition-all flex items-center justify-center ${isMuted ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-white/5 border-white/10 text-white hover:bg-white/10'}`}
                                            >
                                                {isMuted ? <MicOff size={18} /> : <Mic size={18} className="text-primary" />}
                                            </button>
                                            <AnimatePresence mode="wait">
                                                {!isAutoCentering && (
                                                    <motion.button key="recenter" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                                                        onClick={() => { setIsAutoCentering(true); const loc = canonicalLocRef.current; if (loc) { isProgrammaticMove.current = true; mapRef.current?.setCenter([loc.lat, loc.lng]); if (typeof mapRef.current?.setZoom === 'function') mapRef.current.setZoom(18); setTimeout(() => { isProgrammaticMove.current = false; }, 1600); } }}
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