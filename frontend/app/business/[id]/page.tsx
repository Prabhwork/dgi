"use client";

import { useState, useEffect, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { 
    MapPin, Star, Clock, Phone, Globe, ArrowLeft, Loader2, 
    MessageCircle, ShieldCheck, Mail, Edit3, Image as ImageIcon,
    Info, Share2, BadgeCheck, Briefcase, Package
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useTheme } from "@/components/ThemeProvider";
import ParticleNetwork from "@/components/ParticleNetwork";

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
    const id = params.id as string;
    
    const [business, setBusiness] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

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
            <div className={`min-h-screen flex items-center justify-center transition-colors ${isLight ? 'bg-slate-50' : 'bg-[#020631]'}`}>
                <Loader2 size={40} className="text-primary animate-spin" />
            </div>
        );
    }

    if (error || !business) {
        return (
            <div className={`min-h-screen flex flex-col items-center justify-center transition-colors ${isLight ? 'bg-slate-50 text-slate-900' : 'bg-[#020631] text-white'}`}>
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
        <div className={`min-h-screen relative transition-colors duration-500 overflow-x-hidden ${
            isLight ? 'bg-slate-100 text-slate-900' : 'bg-[#020631] text-white'
        }`}>
            {/* Background elements */}
            <div className={`absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b opacity-50 pointer-events-none transition-colors duration-500 ${
                isLight ? 'from-blue-100/50 to-transparent' : 'from-[#1a3a8f]/20 to-transparent'
            }`} />
            
            <div className="fixed inset-0 z-0">
                <ParticleNetwork />
            </div>
            
            {/* Subtle overlay to soften particles behind content */}
            <div className={`fixed inset-0 z-[1] pointer-events-none ${isLight ? 'bg-slate-100/40' : 'bg-[#020631]/40'}`} />

            <div className="relative z-[2] flex flex-col min-h-screen">
                <Navbar />
                
                <main className="container mx-auto px-4 pt-24 pb-20 flex-1 max-w-6xl">
                    <button 
                        onClick={() => router.back()} 
                        className={`flex items-center gap-2 mb-8 text-sm font-black uppercase tracking-widest transition-all hover:gap-3 ${isLight ? 'text-slate-500 hover:text-primary' : 'text-slate-400 hover:text-primary'}`}
                    >
                        <ArrowLeft size={16} /> Back to Search
                    </button>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Details */}
                        <div className="lg:col-span-2 space-y-8">
                            
                            {/* Header Card */}
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                                className={`rounded-[2.5rem] overflow-hidden backdrop-blur-3xl border border-solid shadow-2xl ${
                                    isLight ? 'bg-white/95 border-slate-200' : 'bg-slate-900/90 border-white/10'
                                }`}
                            >
                                <div className="h-72 md:h-96 w-full relative">
                                    <img 
                                        src={bannerImageUrl} 
                                        alt={business.brandName || business.businessName}
                                        className="w-full h-full object-cover"
                                        onError={(e) => { (e.target as HTMLImageElement).src = '/assets/business-placeholder.jpg'; }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                                    <div className="absolute top-6 right-6 bg-primary/20 backdrop-blur-xl text-primary-foreground px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-primary/30 shadow-2xl">
                                        {business.businessCategory}
                                    </div>
                                    <div className="absolute bottom-8 left-8 right-8">
                                        <h1 className="text-4xl md:text-6xl font-black text-white drop-shadow-2xl mb-4 font-display leading-tight">
                                            {business.brandName || business.businessName}
                                        </h1>
                                        <div className="flex flex-wrap items-center gap-4">
                                            <div className="flex items-center gap-1.5 text-yellow-400 bg-black/50 px-3 py-1.5 rounded-xl backdrop-blur-md border border-white/10">
                                                <Star size={18} fill="currentColor" />
                                                <span className="font-black text-white">4.8</span>
                                                <span className="text-white/60 text-xs ml-1">(120 Reviews)</span>
                                            </div>
                                            {(business.isVerified || business.aadhaarVerified || business.approvalStatus === 'approved') && (
                                                <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl backdrop-blur-md border border-emerald-500/20 font-black uppercase text-[10px] tracking-widest shadow-[0_0_20px_rgba(16,185,129,0.15)]">
                                                    <BadgeCheck size={18} className="fill-emerald-500 text-black" />
                                                    Verified Business
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="p-8">
                                    {/* Action row */}
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
                                        <a href={`tel:${business.primaryContactNumber}`} className="flex flex-col items-center justify-center p-4 rounded-3xl bg-emerald-500/5 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all border border-emerald-500/20 group">
                                            <Phone size={24} className="mb-2 group-hover:scale-110 transition-transform" />
                                            <span className="text-[10px] font-black uppercase tracking-wider">Call Now</span>
                                        </a>
                                        <a href={`https://wa.me/${business.officialWhatsAppNumber || business.primaryContactNumber}`} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center p-4 rounded-3xl bg-green-500/5 text-green-500 hover:bg-green-500 hover:text-white transition-all border border-green-500/20 group">
                                            <MessageCircle size={24} className="mb-2 group-hover:scale-110 transition-transform" />
                                            <span className="text-[10px] font-black uppercase tracking-wider">WhatsApp</span>
                                        </a>
                                        <a href={`https://maps.google.com/?q=${business.gpsCoordinates?.lat || ''},${business.gpsCoordinates?.lng || ''}`} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center p-4 rounded-3xl bg-blue-500/5 text-blue-500 hover:bg-blue-500 hover:text-white transition-all border border-blue-500/20 group">
                                            <MapPin size={24} className="mb-2 group-hover:scale-110 transition-transform" />
                                            <span className="text-[10px] font-black uppercase tracking-wider">Direction</span>
                                        </a>
                                        <button className={`flex flex-col items-center justify-center p-4 rounded-3xl transition-all border group ${isLight ? 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-900 hover:text-white' : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/20 hover:text-white'}`}>
                                            <Share2 size={24} className="mb-2 group-hover:scale-110 transition-transform" />
                                            <span className="text-[10px] font-black uppercase tracking-wider">Share</span>
                                        </button>
                                    </div>
                                    
                                    <div className="space-y-8">
                                        <div>
                                            <h3 className={`text-xl font-black mb-4 flex items-center gap-3 font-display ${isLight ? 'text-slate-900' : 'text-white'}`}>
                                                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                                                    <Info size={22} />
                                                </div>
                                                About Business
                                            </h3>
                                            <p className={`leading-loose text-sm font-medium ${isLight ? 'text-slate-600' : 'text-white/70'} italic`}>
                                                "{business.description || "No detailed description provided by the business."}"
                                            </p>
                                        </div>
                                        
                                        {/* Gallery */}
                                        {business.gallery && business.gallery.length > 0 && (
                                            <div>
                                                <h3 className={`text-xl font-black mb-4 flex items-center gap-3 font-display ${isLight ? 'text-slate-900' : 'text-white'}`}>
                                                    <div className="p-2 rounded-xl bg-primary/10 text-primary">
                                                        <ImageIcon size={22} />
                                                    </div>
                                                    Photo Gallery
                                                </h3>
                                                <div className="flex gap-4 overflow-x-auto pb-6 snap-x scrollbar-hide">
                                                    {business.gallery.map((img: string, i: number) => (
                                                        <motion.div 
                                                            key={i} 
                                                            whileHover={{ scale: 1.05 }}
                                                            className="min-w-[180px] h-[180px] rounded-3xl overflow-hidden shrink-0 snap-start border border-slate-200 dark:border-white/10 shadow-lg"
                                                        >
                                                            <img 
                                                                src={`${(process.env.NEXT_PUBLIC_API_URL || '').replace('/api', '')}/${img}`}
                                                                alt="Gallery"
                                                                className="w-full h-full object-cover"
                                                                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                                            />
                                                        </motion.div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>

                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                                    className={`rounded-[2.5rem] p-8 backdrop-blur-3xl border border-solid shadow-2xl ${
                                        isLight ? 'bg-white/95 border-slate-200' : 'bg-slate-900/90 border-white/10'
                                    }`}
                                >
                                    <h3 className={`text-2xl font-black mb-8 flex items-center gap-4 font-display ${isLight ? 'text-slate-900' : 'text-white'}`}>
                                        <div className="p-2.5 rounded-2xl bg-blue-500/10 text-blue-500">
                                            <Briefcase size={24} />
                                        </div>
                                        Professional Services
                                    </h3>
                                    <div className="grid gap-6 sm:grid-cols-2">
                                        {business.services.map((svc: any, i: number) => (
                                            <div key={i} className={`flex gap-5 p-5 rounded-3xl border transition-all hover:-translate-y-1 hover:shadow-xl ${isLight ? 'bg-white border-slate-100 hover:border-primary/30 shadow-sm' : 'bg-slate-800/80 border-white/5 hover:border-white/20'}`}>
                                                <div className="w-24 h-24 shrink-0 rounded-2xl overflow-hidden bg-primary/5 flex items-center justify-center border border-white/5">
                                                    {svc.image ? (
                                                        <img src={`${(process.env.NEXT_PUBLIC_API_URL || '').replace('/api', '')}/${svc.image}`} alt={svc.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Briefcase size={32} className="text-primary/30" />
                                                    )}
                                                </div>
                                                <div className="flex flex-col flex-1 justify-center">
                                                    <h4 className={`font-black text-lg mb-1 line-clamp-1 font-display ${isLight ? 'text-slate-900' : 'text-white'}`}>{svc.name}</h4>
                                                    <p className={`text-[11px] leading-relaxed line-clamp-2 mb-3 font-medium ${isLight ? 'text-slate-500' : 'text-white/50'}`}>{svc.description}</p>
                                                    <div className="font-black text-primary text-base flex items-center gap-1">
                                                        <span className="text-xs opacity-60">Starting from</span>
                                                        ₹{svc.price}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>

                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                                    className={`rounded-[2.5rem] p-8 backdrop-blur-3xl border border-solid shadow-2xl ${
                                        isLight ? 'bg-white/95 border-slate-200' : 'bg-slate-900/90 border-white/10'
                                    }`}
                                >
                                    <h3 className={`text-2xl font-black mb-8 flex items-center gap-4 font-display ${isLight ? 'text-slate-900' : 'text-white'}`}>
                                        <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-500">
                                            <Package size={24} />
                                        </div>
                                        Available Products
                                    </h3>
                                    <div className="grid gap-6 sm:grid-cols-2">
                                        {business.products.map((prod: any, i: number) => (
                                            <div key={i} className={`flex gap-5 p-5 rounded-3xl border transition-all hover:-translate-y-1 hover:shadow-xl ${isLight ? 'bg-white border-slate-100 hover:border-primary/30 shadow-sm' : 'bg-slate-800/80 border-white/5 hover:border-white/20'}`}>
                                                <div className="w-24 h-24 shrink-0 rounded-2xl overflow-hidden bg-primary/5 flex items-center justify-center border border-white/5">
                                                    {prod.image ? (
                                                        <img src={`${(process.env.NEXT_PUBLIC_API_URL || '').replace('/api', '')}/${prod.image}`} alt={prod.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Package size={32} className="text-primary/30" />
                                                    )}
                                                </div>
                                                <div className="flex flex-col flex-1 justify-center">
                                                    <h4 className={`font-black text-lg mb-1 line-clamp-1 font-display ${isLight ? 'text-slate-900' : 'text-white'}`}>{prod.name}</h4>
                                                    <p className={`text-[11px] leading-relaxed line-clamp-2 mb-3 font-medium ${isLight ? 'text-slate-500' : 'text-white/50'}`}>{prod.description}</p>
                                                    <div className="font-black text-primary text-base flex items-center gap-1">
                                                        ₹{prod.price}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>

                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                                    className={`rounded-[2rem] p-8 backdrop-blur-3xl border border-solid ${
                                        isLight ? 'bg-white/95 border-slate-200 shadow-xl shadow-blue-900/5' : 'bg-slate-900/90 border-white/10'
                                    }`}
                                >
                                    <h3 className={`text-xs font-black uppercase tracking-[0.2em] mb-6 flex items-center gap-2 ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
                                        Specialities & Tags
                                    </h3>
                                    <div className="flex flex-wrap gap-3">
                                        {business.keywords.map((kw: string, i: number) => (
                                            <span key={i} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all hover:scale-105 cursor-default ${
                                                isLight ? 'bg-slate-50 border-slate-200 text-slate-600 hover:border-primary/30' : 'bg-white/5 border-white/5 text-white/60 hover:border-white/20'
                                            }`}>
                                                {kw}
                                            </span>
                                        ))}
                                    </div>
                                </motion.div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            
                            {/* Contact Info Card */}
                            <motion.div 
                                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
                                className={`rounded-3xl p-6 backdrop-blur-xl border border-solid ${
                                    isLight ? 'bg-white/95 border-slate-200 shadow-xl shadow-blue-900/5' : 'bg-slate-900/90 border-white/10 shadow-black/50'
                                }`}
                            >
                                <h3 className={`text-lg font-bold mb-5 flex items-center gap-2 border-b pb-4 ${
                                    isLight ? 'text-slate-900 border-slate-100' : 'text-white border-white/10'
                                }`}>
                                    Contact Details
                                </h3>
                                
                                <div className="space-y-6">
                                    <div className="flex items-start gap-5">
                                        <div className={`mt-0.5 p-3 rounded-2xl shrink-0 transition-transform hover:rotate-12 ${isLight ? 'bg-blue-50 text-blue-600 shadow-sm' : 'bg-blue-500/10 text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.1)]'}`}>
                                            <MapPin size={22} />
                                        </div>
                                        <div>
                                            <p className={`text-[10px] font-black uppercase tracking-[0.15em] mb-1.5 ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>Registered Office</p>
                                            <p className={`text-sm font-bold leading-relaxed ${isLight ? 'text-slate-800' : 'text-white/90'}`}>
                                                {business.registeredOfficeAddress || 'Address not listed'}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-start gap-5">
                                        <div className={`p-3 rounded-2xl shrink-0 transition-transform hover:rotate-12 ${isLight ? 'bg-emerald-50 text-emerald-600 shadow-sm' : 'bg-emerald-500/10 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.1)]'}`}>
                                            <Phone size={22} />
                                        </div>
                                        <div>
                                            <p className={`text-[10px] font-black uppercase tracking-[0.15em] mb-1.5 ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>Official Hotline</p>
                                            <p className={`text-base font-black tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                                                {business.primaryContactNumber}
                                            </p>
                                        </div>
                                    </div>

                                    {business.officialWhatsAppNumber && (
                                        <div className="flex items-start gap-5">
                                            <div className={`p-3 rounded-2xl shrink-0 transition-transform hover:rotate-12 ${isLight ? 'bg-green-50 text-green-600 shadow-sm' : 'bg-green-500/10 text-green-400 shadow-[0_0_20px_rgba(34,197,94,0.1)]'}`}>
                                                <MessageCircle size={22} />
                                            </div>
                                            <div>
                                                <p className={`text-[10px] font-black uppercase tracking-[0.15em] mb-1.5 ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>WhatsApp Support</p>
                                                <p className={`text-base font-black tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                                                    {business.officialWhatsAppNumber}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {business.website && (
                                        <div className="flex items-start gap-5">
                                            <div className={`p-3 rounded-2xl shrink-0 transition-transform hover:rotate-12 ${isLight ? 'bg-purple-50 text-purple-600 shadow-sm' : 'bg-purple-500/10 text-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.1)]'}`}>
                                                <Globe size={22} />
                                            </div>
                                            <div>
                                                <p className={`text-[10px] font-black uppercase tracking-[0.15em] mb-1.5 ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>Digital Portal</p>
                                                <a href={business.website.startsWith('http') ? business.website : `https://${business.website}`} target="_blank" rel="noopener noreferrer" className="text-sm font-black text-primary hover:underline hover:text-primary/80 truncate block max-w-[180px]">
                                                    {business.website}
                                                </a>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </motion.div>

                            {/* Timings Card */}
                            <motion.div 
                                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
                                className={`rounded-3xl p-6 backdrop-blur-xl border border-solid ${
                                    isLight ? 'bg-white/95 border-slate-200 shadow-xl shadow-blue-900/5' : 'bg-slate-900/90 border-white/10 shadow-black/50'
                                }`}
                            >
                                <h3 className={`text-lg font-bold mb-5 flex items-center gap-2 border-b pb-4 ${
                                    isLight ? 'text-slate-900 border-slate-100' : 'text-white border-white/10'
                                }`}>
                                    Business Hours
                                </h3>
                                
                                <div className="space-y-6">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-2.5 rounded-2xl ${isLight ? 'bg-slate-100 text-slate-500' : 'bg-white/5 text-slate-400'}`}>
                                                <Clock size={20} />
                                            </div>
                                            <span className={`text-sm font-bold ${isLight ? 'text-slate-700' : 'text-white/80'}`}>Operations</span>
                                        </div>
                                        <div className="text-right pt-1">
                                            {(() => {
                                                const opens = (business.openingTime || "09:00").split(',');
                                                const closes = (business.closingTime || "18:00").split(',');
                                                const len = Math.max(opens.length, closes.length, 1);
                                                const blocks = [];
                                                for (let i = 0; i < len; i++) {
                                                    const openFmt = format12Hour(opens[i]) || '--:--';
                                                    const closeFmt = format12Hour(closes[i]) || '--:--';
                                                    blocks.push(
                                                        <div key={i} className={`text-sm font-black ${isLight ? 'text-slate-900' : 'text-white'} ${i > 0 ? 'mt-1.5 text-xs opacity-70' : ''}`}>
                                                            {openFmt} - {closeFmt}
                                                        </div>
                                                    );
                                                }
                                                return blocks;
                                            })()}
                                        </div>
                                    </div>
                                    
                                    {business.weeklyOff && business.weeklyOff.toLowerCase() !== 'none' && (
                                        <div className="flex justify-between items-center pt-5 border-t border-dashed border-slate-200 dark:border-white/10">
                                            <span className={`text-sm font-bold ${isLight ? 'text-slate-700' : 'text-white/80'}`}>Weekly Holiday</span>
                                            <span className="text-[10px] font-black bg-red-500/10 text-red-500 dark:bg-red-500/20 px-4 py-1.5 rounded-xl uppercase tracking-widest border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]">
                                                {business.weeklyOff}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </motion.div>

                            <motion.div 
                                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}
                                className={`rounded-3xl p-6 backdrop-blur-xl border border-solid text-center ${
                                    isLight ? 'bg-primary/5 border-primary/20' : 'bg-primary/10 border-primary/20'
                                }`}
                            >
                                <ShieldCheck size={36} className="text-primary mx-auto mb-3" />
                                <h4 className={`font-bold mb-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>Is this your business?</h4>
                                <p className={`text-xs mb-4 ${isLight ? 'text-slate-600' : 'text-white/60'}`}>
                                    Claim this listing to update information, respond to reviews, and reach more customers.
                                </p>
                                <Button className="w-full bg-primary text-white hover:bg-primary/90 rounded-xl">
                                    Claim Business
                                </Button>
                            </motion.div>

                        </div>
                    </div>
                </main>
                
                <Footer />
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
