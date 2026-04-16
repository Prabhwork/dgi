"use client";

import { useState, useEffect, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
    MapPin, Star, Clock, Phone, Globe, ArrowLeft, Loader2,
    MessageCircle, ShieldCheck, Mail, Edit3, Image as ImageIcon,
    Info, Share2, BadgeCheck, Briefcase, Package,
    ShoppingBag, Layers, HelpCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useTheme } from "@/components/ThemeProvider";

import RestaurantMenu from "@/components/RestaurantMenu";
import { useCart } from "@/context/CartContext";

function format12Hour(time24: string) {
    if (!time24) return "";
    const parts = time24.split(":");
    if (parts.length < 2) return time24;
    const hoursStr = parts[0];
    const minutesStr = parts[1];
    let hours = parseInt(hoursStr, 10);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    return `${hours.toString().padStart(2, '0')}:${minutesStr} ${ampm}`;
}

function BusinessDetail() {
    const params = useParams();
    const router = useRouter();
    const { theme } = useTheme();
    const { cart } = useCart();
    const id = params.id as string;

    const [business, setBusiness] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
    const [claimLoading, setClaimLoading] = useState(false);
    const [claimForm, setClaimForm] = useState({
        fullName: "",
        phoneNumber: "",
        email: "",
        ownerProof: null as File | null
    });

    const handleShare = async () => {
        const shareData = {
            title: business?.brandName || business?.businessName || "Digital Book of India",
            text: business?.description || "Check out this business on Digital Book of India",
            url: window.location.href,
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(window.location.href);
                alert("Link copied to clipboard!");
            }
        } catch (err) {
            console.error("Error sharing:", err);
        }
    };

    const handleSubmitClaim = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!claimForm.ownerProof) {
            alert("Please upload proof of ownership");
            return;
        }

        setClaimLoading(true);
        const formData = new FormData();
        formData.append("fullName", claimForm.fullName);
        formData.append("phoneNumber", claimForm.phoneNumber);
        formData.append("email", claimForm.email);
        formData.append("ownerProof", claimForm.ownerProof);

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/business/claim/${id}`, {
                method: "POST",
                body: formData
            });
            const data = await res.json();
            if (data.success) {
                alert("Claim submitted successfully! Admin will review it.");
                setIsClaimModalOpen(false);
                setClaimForm({ fullName: "", phoneNumber: "", email: "", ownerProof: null });
            } else {
                alert(data.error || "Failed to submit claim");
            }
        } catch (err) {
            alert("Something went wrong");
        } finally {
            setClaimLoading(false);
        }
    };

    useEffect(() => {
        const checkAuth = () => {
            const uToken = localStorage.getItem("userToken");
            const bToken = localStorage.getItem("businessToken");
            if (!uToken && !bToken) {
                router.push(`/login?redirect=/business/${id}`);
            }
        };
        checkAuth();
    }, [id, router]);

    useEffect(() => {
        const fetchBusiness = async () => {
            try {
                // Fetch using admin route for full details (or search public route)
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/business/search?q=${id}`); // Simple workaround to get public details or we just fetch from a public info route.
                // Wait, /api/business/:id is private/admin currently. Let's see if we can fetch it?
                // Actually, the user can just get it if we open a public /api/business/public/:id route or use search.
                // Let's assume there is a public way, or we just fetch the data. 
                // Let's fetch using the search api with id text or similar, but the exact ID needs a route.
                // Looking at businessRoutes.js, `router.get('/:id', protect, authorize('admin'), getBusinessById);`
                // I might need to make a public endpoint for by ID, or just fetch all and find. 
                // Let's modify businessRoutes.js to add a public getBusinessById route later if needed.
                // For now, let's fetch from the search endpoint using the name or something? No, we need ID.
                // I will add a public route for this in a moment. Let's assume `/api/business/public/${id}` exists.

                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/business/public/${id}`);
                const data = await response.json();

                if (data.success) {
                    setBusiness(data.data);
                } else {
                    setError(data.error || "Failed to load business details");
                }
            } catch (err) {
                setError("Something went wrong");
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchBusiness();
    }, [id]);

    const isLight = theme === 'light';

    if (loading) {
        return (
            <div className={`min-h-screen flex items-center justify-center transition-colors bg-background text-foreground`}>
                <Loader2 size={40} className="text-primary animate-spin" />
            </div>
        );
    }

    if (error || !business) {
        return (
            <div className={`min-h-screen flex flex-col items-center justify-center transition-colors bg-background text-foreground`}>
                <h2 className="text-2xl font-bold mb-4">{error || "Business not found"}</h2>
                <Button onClick={() => router.back()} variant="outline-glow">Go Back</Button>
            </div>
        );
    }

    const bannerImageUrl = business.bannerImage
        ? `${(process.env.NEXT_PUBLIC_API_URL || '').replace('/api', '')}/${business.bannerImage}`
        : business.coverImage
            ? `${(process.env.NEXT_PUBLIC_API_URL || '').replace('/api', '')}/${business.coverImage}`
            : '/assets/business-placeholder.jpg';

    return (
        <div className={`min-h-screen relative transition-colors duration-500 overflow-x-hidden bg-background text-foreground`}>
            {/* Background elements */}
            <div className={`absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b opacity-50 pointer-events-none transition-colors duration-500 ${isLight ? 'from-blue-100/50 to-transparent' : 'from-[#1a3a8f]/20 to-transparent'
                }`} />

            <div className="relative z-[2] flex flex-col min-h-screen">
                <Navbar />

                <main className="flex-1 pt-16">
                    {/* Immersive Backdrop Container */}
                    <div className="relative h-[300px] md:h-[400px] w-full overflow-hidden">
                        <motion.img
                            initial={{ scale: 1.2 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 2, ease: "easeOut" }}
                            src={bannerImageUrl}
                            alt={business.brandName || business.businessName}
                            className="absolute inset-0 w-full h-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).src = '/assets/business-placeholder.jpg'; }}
                        />
                        {/* Soft bottom gradient so text is readable, removed heavy black shadows */}
                        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-slate-950 to-transparent z-[1]" />

                        {/* Back to Results - Float over image */}
                        <div className="container mx-auto px-4 relative z-10 pt-8">
                            <motion.button
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                onClick={() => router.back()}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/50 backdrop-blur-md border border-white/10 text-white hover:bg-cyan-500 hover:text-slate-950 transition-all font-black uppercase tracking-widest text-[10px]"
                            >
                                <ArrowLeft size={14} />
                                <span>Back</span>
                            </motion.button>
                        </div>

                        {/* Floating Identity Card */}
                        <div className="container mx-auto px-4 absolute bottom-4 md:bottom-6 left-0 right-0 z-20">
                            <motion.div
                                initial={{ opacity: 0, y: 40 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`w-fit max-w-full md:max-w-lg p-3.5 md:p-5 rounded-2xl md:rounded-[1.5rem] backdrop-blur-3xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] ${
                                    isLight ? 'bg-slate-900/80' : 'bg-slate-950/80'
                                }`}
                            >
                                <div className="flex flex-wrap items-center gap-3 mb-2">
                                    <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 font-bold uppercase text-[8px] tracking-[0.15em]">
                                        <BadgeCheck size={12} className="fill-cyan-500 text-slate-950" />
                                        Verified
                                    </div>
                                    <span className="text-white/30 font-bold uppercase text-[9px] tracking-[0.15em]">
                                        {business.category || business.type || "Global Enterprise"}
                                    </span>
                                </div>

                                <h1 className="text-xl md:text-3xl font-black text-white mb-0 tracking-tight leading-tight font-display">
                                    {business.brandName || business.businessName}
                                </h1>

               
                            </motion.div>
                        </div>
                    </div>

                    <div className="container mx-auto px-4 py-12 max-w-7xl">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                            {/* Main Details Column */}
                            <div className="lg:col-span-2 space-y-16">
                                {/* Action Bar - Futuristic Line Row */}
                                <div className="flex flex-wrap gap-4">
                                    <motion.a
                                        whileHover={{ y: -3, scale: 1.02 }}
                                        href={`tel:${business.primaryContactNumber}`}
                                        className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-cyan-400 text-slate-950 font-black uppercase tracking-widest text-[11px] hover:bg-white transition-all shadow-lg shadow-cyan-400/20"
                                    >
                                        <Phone size={18} />
                                        Call Now
                                    </motion.a>
                                    
                                    <motion.a
                                        whileHover={{ y: -3, scale: 1.02 }}
                                        href={`https://wa.me/${business.officialWhatsAppNumber || business.primaryContactNumber}`}
                                        className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-emerald-400 font-black uppercase tracking-widest text-[11px] hover:bg-[#25D366] hover:text-white transition-all"
                                    >
                                        <MessageCircle size={18} />
                                        WhatsApp
                                    </motion.a>
                                    
                                    <motion.a
                                        whileHover={{ y: -3, scale: 1.02 }}
                                        href={`/nearby-map?id=${business._id || id}`}
                                        className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-blue-400 font-black uppercase tracking-widest text-[11px] hover:bg-blue-600 hover:text-white transition-all"
                                    >
                                        <MapPin size={18} />
                                        Get Direction
                                    </motion.a>
                                    
                                    <motion.button
                                        whileHover={{ y: -3, scale: 1.02 }}
                                        onClick={handleShare}
                                        className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-white/60 font-black uppercase tracking-widest text-[11px] hover:bg-white hover:text-slate-900 transition-all"
                                    >
                                        <Share2 size={18} />
                                        Share
                                    </motion.button>
                                </div>

                                    <div className="space-y-16">
                                        <section>
                                            <div className="flex items-center gap-4 mb-8">
                                                <div className="h-[2px] w-12 bg-cyan-400" />
                                                <h3 className="text-xl font-black uppercase tracking-[0.3em] text-white">About Business</h3>
                                            </div>
                                            <div className={`leading-[1.8] text-lg font-medium opacity-80 max-w-none ${isLight ? 'text-slate-300' : 'text-slate-400'}`}>
                                                {business.description || "Synthesizing complex enterprise solutions for the digital age."}
                                            </div>

                                            {business.keywords && business.keywords.length > 0 && (
                                                <div className="flex flex-wrap gap-2 mt-8">
                                                    {business.keywords.map((kw: string, i: number) => (
                                                        <span key={i} className="px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border border-white/5 bg-white/5 text-cyan-400/60">
                                                            #{kw.replace(/^#/, '')}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </section>

                                        {/* Core Specializations - Screenshot Style */}
                                        <section>
                                            <div className="flex items-center gap-4 mb-8">
                                                <div className="h-[2px] w-12 bg-cyan-400" />
                                                <h3 className="text-xl font-black uppercase tracking-[0.3em] text-white">Core Specializations</h3>
                                            </div>
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {business.services && business.services.length > 0 ? (
                                                    business.services.map((service: any, i: number) => (
                                                        <motion.div
                                                            key={i}
                                                            whileHover={{ scale: 1.02 }}
                                                            className="p-6 rounded-2xl bg-white/5 border border-white/10 group cursor-pointer"
                                                        >
                                                            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 mb-6 group-hover:bg-cyan-500 group-hover:text-slate-950 transition-all">
                                                                <Layers size={24} />
                                                            </div>
                                                            <h4 className="text-white font-black text-lg mb-2">{typeof service === 'string' ? service : service.name || `Service Module ${i+1}`}</h4>
                                                            <p className="text-white/40 text-sm leading-relaxed">
                                                                {typeof service === 'string' ? 'Specialized service offered by this entity.' : service.description || 'High-performance integration for regional markets and digital ecosystems.'}
                                                            </p>
                                                        </motion.div>
                                                    ))
                                                ) : (
                                                    <div className="col-span-full p-8 rounded-2xl bg-white/5 border border-white/10 text-center border-dashed">
                                                        <p className="text-white/40 font-bold uppercase tracking-widest text-[11px]">No Core Specializations Added</p>
                                                        <p className="text-white/20 text-[10px] mt-2">Verified Owner can update this intel from the Command Center.</p>
                                                    </div>
                                                )}
                                            </div>
                                        </section>

                                        {/* Image Gallery */}
                                        <section>
                                            <div className="flex items-center gap-4 mb-8">
                                                <div className="h-[2px] w-12 bg-cyan-400" />
                                                <h3 className="text-xl font-black uppercase tracking-[0.3em] text-white">Visual Intelligence</h3>
                                            </div>
                                            <div className="flex overflow-x-auto gap-4 pb-6 custom-scrollbar snap-x snap-mandatory">
                                                {business.gallery && business.gallery.filter((img: string) => img && img.trim() !== "").length > 0 ? (
                                                    business.gallery.filter((img: string) => img && img.trim() !== "").map((img: string, i: number) => (
                                                        <motion.div
                                                            key={i}
                                                            whileHover={{ scale: 1.02 }}
                                                            className="relative w-[75vw] sm:w-[300px] shrink-0 aspect-[4/3] rounded-2xl overflow-hidden border border-white/10 group snap-center shadow-lg"
                                                        >
                                                            <img 
                                                                src={img} 
                                                                alt={`Gallery Intel ${i+1}`} 
                                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                                                                onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/600x400/0f172a/38bdf8?text=Image+Not+Available'; }}
                                                            />
                                                            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-slate-950 flex items-end p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                                                                <span className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em]">{business.brandName || business.businessName} • {i+1}/10</span>
                                                            </div>
                                                        </motion.div>
                                                    ))
                                                ) : (
                                                    <div className="col-span-full p-8 rounded-2xl bg-white/5 border border-white/10 text-center border-dashed">
                                                        <p className="text-white/40 font-bold uppercase tracking-widest text-[11px]">No Visual Data Available</p>
                                                        <p className="text-white/20 text-[10px] mt-2">Verified Owner can upload gallery assets upon login.</p>
                                                    </div>
                                                )}
                                            </div>
                                        </section>
                                    </div>
                                </div>

                            {/* Sidebar Column */}
                            <div className="space-y-8">
                                {/* Reach Us Card - Clone of Screenshot */}
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="rounded-[2.5rem] bg-slate-900/40 backdrop-blur-3xl border border-white/10 overflow-hidden shadow-2xl"
                                >
                                    <div className="p-10 space-y-10">
                                        <h3 className="text-xl font-black text-white flex items-center gap-3">
                                            <HelpCircle size={22} className="text-cyan-400" />
                                            Reach Us
                                        </h3>

                                        <div className="space-y-10">
                                            <div className="flex items-start gap-6">
                                                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                                                    <Phone size={24} />
                                                </div>
                                                <div>
                                                    <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">Encrypted Line</p>
                                                    <p className="text-lg font-black text-white tracking-tight">{business.primaryContactNumber}</p>
                                                </div>
                                            </div>

                                            {business.website && (
                                                <div className="flex items-start gap-6">
                                                    <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                                                        <Globe size={24} />
                                                    </div>
                                                    <div>
                                                        <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">Global Terminal</p>
                                                        <a href={business.website.startsWith('http') ? business.website : `https://${business.website}`} target="_blank" rel="noopener noreferrer" className="text-base font-black text-cyan-400 hover:text-white transition-colors truncate block max-w-[180px]">
                                                            {business.website.replace('https://', '').replace('http://', '')}
                                                        </a>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="flex items-start gap-6">
                                                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                                                    <MapPin size={24} />
                                                </div>
                                                <div>
                                                    <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">Physical Coordinates</p>
                                                    <p className="text-sm font-bold text-white/70 leading-relaxed">
                                                        {business.registeredOfficeAddress || 'Coordinates Classified'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Operational Cycles (Business Hours) */}
                                        <div className="pt-6 border-t border-white/10 space-y-4">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                                                    <Clock size={16} />
                                                </div>
                                                <p className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em]">Operational Cycles</p>
                                            </div>
                                            <div className="grid grid-cols-1 gap-2">
                                                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => {
                                                    const schedule = business.businessHours?.[day.toLowerCase()];
                                                    const isOff = !schedule || !schedule.isOpen;
                                                    const openFmt = schedule?.slots?.[0]?.open ? new Date(`1970-01-01T${schedule.slots[0].open}:00`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
                                                    const closeFmt = schedule?.slots?.[0]?.close ? new Date(`1970-01-01T${schedule.slots[0].close}:00`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

                                                    return (
                                                        <div key={day} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0 hover:bg-white/5 px-2 rounded-lg transition-colors">
                                                            <span className="text-[11px] font-bold text-white/60 uppercase tracking-widest">{day.substring(0, 3)}</span>
                                                            {isOff ? (
                                                                <span className="text-[9px] font-black text-red-500 uppercase tracking-widest px-2 py-0.5 rounded-md bg-red-500/10 border border-red-500/20">
                                                                    Offline
                                                                </span>
                                                            ) : (
                                                                <span className="text-[11px] font-black text-white tracking-widest">
                                                                    {openFmt} <span className="text-white/30 mx-1">-</span> {closeFmt}
                                                                </span>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>


                                    </div>
                                </motion.div>

                                {/* Claim Portal */}
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 text-center"
                                >
                                    <ShieldCheck size={40} className="text-cyan-400 mx-auto mb-4" />
                                    <h4 className="text-lg font-black text-white mb-2 uppercase tracking-widest">Ownership Proxy</h4>
                                    <p className="text-[11px] text-white/40 mb-6 leading-relaxed px-4">
                                        Establish direct uplink to manage this entity's digital presence.
                                    </p>
                                    <Button
                                        onClick={() => setIsClaimModalOpen(true)}
                                        className="w-full bg-cyan-400 text-slate-950 hover:bg-white rounded-xl h-14 font-black uppercase tracking-widest text-[11px] shadow-lg shadow-cyan-400/10"
                                    >
                                        Claim Terminal
                                    </Button>
                                </motion.div>
                            </div>
                        </div>

                        {/* Specializations / Menu Section - Full Width Below info grid */}
                        <div className="mt-20">
                            <RestaurantMenu 
                                partnerId={id} 
                                businessName={business.brandName || business.businessName}
                                isLight={isLight}
                            />
                        </div>
                    </div>
                </main>

                <Footer />

                {/* Claim Business Modal */}
                {isClaimModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => setIsClaimModalOpen(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }}
                            className={`relative w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl border ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-white/10'
                                }`}
                        >
                            <h3 className={`text-2xl font-black mb-2 font-display ${isLight ? 'text-slate-900' : 'text-white'}`}>Claim Business</h3>
                            <p className={`text-xs mb-6 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                                Provide your details and ownership proof for verification.
                            </p>

                            <form onSubmit={handleSubmitClaim} className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest opacity-50 block mb-1.5 ml-1">Full Name</label>
                                    <input
                                        type="text" required
                                        value={claimForm.fullName}
                                        onChange={(e) => setClaimForm({ ...claimForm, fullName: e.target.value })}
                                        className={`w-full p-4 rounded-2xl border text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all ${isLight ? 'bg-slate-50 border-slate-200 focus:border-primary' : 'bg-white/5 border-white/10 focus:border-primary text-white'
                                            }`}
                                        placeholder="Enter your full name"
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest opacity-50 block mb-1.5 ml-1">Phone Number</label>
                                        <input
                                            type="tel" required
                                            value={claimForm.phoneNumber}
                                            onChange={(e) => setClaimForm({ ...claimForm, phoneNumber: e.target.value })}
                                            className={`w-full p-4 rounded-2xl border text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all ${isLight ? 'bg-slate-50 border-slate-200 focus:border-primary' : 'bg-white/5 border-white/10 focus:border-primary text-white'
                                                }`}
                                            placeholder="Phone"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest opacity-50 block mb-1.5 ml-1">Email ID</label>
                                        <input
                                            type="email" required
                                            value={claimForm.email}
                                            onChange={(e) => setClaimForm({ ...claimForm, email: e.target.value })}
                                            className={`w-full p-4 rounded-2xl border text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all ${isLight ? 'bg-slate-50 border-slate-200 focus:border-primary' : 'bg-white/5 border-white/10 focus:border-primary text-white'
                                                }`}
                                            placeholder="Email"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest opacity-50 block mb-1.5 ml-1">Owner Proof (PDF/Image)</label>
                                    <input
                                        type="file" required accept="image/*,application/pdf"
                                        onChange={(e) => setClaimForm({ ...claimForm, ownerProof: e.target.files?.[0] || null })}
                                        className={`w-full p-4 rounded-2xl border text-sm file:mr-4 file:py-1.5 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-primary/10 file:text-primary hover:file:bg-primary/20 ${isLight ? 'bg-slate-50 border-slate-200 text-slate-500' : 'bg-white/5 border-white/10 text-slate-400'
                                            }`}
                                    />
                                </div>

                                <div className="pt-2 flex gap-3">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setIsClaimModalOpen(false)}
                                        className="flex-1 rounded-xl py-6"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={claimLoading}
                                        className="flex-1 rounded-xl py-6 bg-primary text-white hover:bg-primary/90"
                                    >
                                        {claimLoading ? <Loader2 className="animate-spin" size={18} /> : "Submit Claim"}
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function BusinessDetailPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#020631] flex items-center justify-center text-white">
                <Loader2 size={40} className="text-primary animate-spin" />
            </div>
        }>
            <BusinessDetail />
        </Suspense>
    );
}
