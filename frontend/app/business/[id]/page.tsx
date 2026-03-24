"use client";

import { useState, useEffect, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { 
    MapPin, Star, Clock, Phone, Globe, ArrowLeft, Loader2, 
    MessageCircle, ShieldCheck, Mail, Edit3, Image as ImageIcon,
    Info, Share2, BadgeCheck, Briefcase, Package,
    ShoppingBag
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
                        <ArrowLeft size={16} /> Back
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

                                    <div className="absolute bottom-8 left-8 right-8">
                                        <h1 className="text-4xl md:text-6xl font-black text-white drop-shadow-2xl mb-4 font-display leading-tight">
                                            {business.brandName || business.businessName}
                                        </h1>
                                        <div className="flex flex-wrap items-center gap-4">
                                            
                                            {(business.isVerified || business.aadhaarVerified || business.approvalStatus === 'approved') && (
                                                <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl backdrop-blur-md border border-emerald-500/20 font-black uppercase text-[10px] tracking-widest shadow-[0_0_20px_rgba(16,185,129,0.15)]">
                                                    <BadgeCheck size={18} className="fill-emerald-500 text-black" />
                                                    Verified
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="p-8">
                                    {/* Action row */}
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                                        <a 
                                            href={`tel:${business.primaryContactNumber}`} 
                                            className="flex items-center justify-center gap-2 p-3 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 transition-all hover:-translate-y-1 shadow-md shadow-emerald-500/20 group h-14"
                                        >
                                            <Phone size={20} className="group-hover:scale-110 transition-transform" />
                                            <span className="text-[10px] font-black uppercase tracking-[0.05em]">Call Now</span>
                                        </a>
                                        <a 
                                            href={`https://wa.me/${business.officialWhatsAppNumber || business.primaryContactNumber}`} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            className="flex items-center justify-center gap-2 p-3 rounded-xl bg-[#25D366] text-white hover:bg-[#22c35e] transition-all hover:-translate-y-1 shadow-md shadow-[#25D366]/20 group h-14"
                                        >
                                            <MessageCircle size={20} className="group-hover:scale-110 transition-transform" />
                                            <span className="text-[10px] font-black uppercase tracking-[0.05em]">WhatsApp</span>
                                        </a>
                                        <a 
                                            href={`/nearby-map?id=${business._id || id}`}
                                            className="flex items-center justify-center gap-2 p-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-all hover:-translate-y-1 shadow-md shadow-blue-600/20 group h-14"
                                        >
                                            <MapPin size={20} className="group-hover:scale-110 transition-transform" />
                                            <span className="text-[10px] font-black uppercase tracking-[0.05em]">Direction</span>
                                        </a>
                                        <button 
                                            onClick={handleShare}
                                            className={`flex items-center justify-center gap-2 p-3 rounded-xl transition-all hover:-translate-y-1 shadow-md group h-14 ${
                                                isLight 
                                                    ? 'bg-slate-800 text-white hover:bg-slate-900 shadow-slate-900/10' 
                                                    : 'bg-slate-700 text-white hover:bg-slate-600 shadow-black/20'
                                            }`}
                                        >
                                            <Share2 size={20} className="group-hover:scale-110 transition-transform" />
                                            <span className="text-[10px] font-black uppercase tracking-[0.05em]">Share</span>
                                        </button>
                                    </div>
                                    
                                    <div className="space-y-8">
                                        <div>
                                            <h3 className={`text-2xl font-black mb-5 flex items-center gap-3 font-display ${isLight ? 'text-slate-900' : 'text-white'}`}>
                                                <div className="p-2.5 rounded-2xl bg-primary/10 text-primary">
                                                    <Info size={24} />
                                                </div>
                                                About Business
                                            </h3>
                                            <div className={`leading-relaxed text-base font-medium mb-6 ${isLight ? 'text-slate-600' : 'text-white/80'}`}>
                                                {business.description || "No detailed description provided by the business."}
                                            </div>
                                            
                                            {/* Integrated Keywords */}
                                            {business.keywords && business.keywords.length > 0 && (
                                                <div className="flex flex-wrap gap-2.5 mt-6">
                                                    {business.keywords.map((kw: string, i: number) => (
                                                        <span key={i} className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all hover:scale-105 cursor-default ${
                                                            isLight ? 'bg-slate-50 border-slate-200 text-slate-500 hover:border-primary/30' : 'bg-white/5 border-white/5 text-white/50 hover:border-white/20'
                                                        }`}>
                                                            #{kw.replace(/^#/, '')}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
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
                                
                                <div className="space-y-1">
                                    {(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']).map((day) => {
                                        const isOff = business.weeklyOff?.toLowerCase() === day.toLowerCase();
                                        const opens = (business.openingTime || "09:00").split(',');
                                        const closes = (business.closingTime || "18:00").split(',');
                                        const openFmt = format12Hour(opens[0]) || '09:00 AM';
                                        const closeFmt = format12Hour(closes[0]) || '07:00 PM';

                                        return (
                                            <div key={day} className="flex justify-between items-center py-1">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-1 h-1 rounded-full ${isOff ? 'bg-red-500' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'}`} />
                                                    <span className={`text-[13px] font-bold ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>{day}</span>
                                                </div>
                                                <div className="text-right">
                                                    {isOff ? (
                                                        <span className="text-[10px] font-black text-red-500 uppercase tracking-widest px-2 py-0.5 rounded-md bg-red-500/10 border border-red-500/10">
                                                            Closed
                                                        </span>
                                                    ) : (
                                                        <span className={`text-[11px] font-black tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                                                            {openFmt} - {closeFmt}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
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
                                <Button 
                                    onClick={() => setIsClaimModalOpen(true)}
                                    className="w-full bg-primary text-white hover:bg-primary/90 rounded-xl"
                                >
                                    Claim Business
                                </Button>
                            </motion.div>

                        </div>
                    </div>

                    {/* Services & Products - Full Width Below Info */}
                    <div className="mt-10 space-y-10">
                         {/* Services */}
                         {business.services && business.services.length > 0 && (
                             <motion.div 
                                initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                                className={`rounded-3xl p-6 backdrop-blur-3xl border border-solid shadow-xl relative overflow-hidden ${
                                    isLight ? 'bg-white/95 border-slate-200' : 'bg-slate-900/90 border-white/10'
                                }`}
                            >
                                <div className={`absolute -top-16 -right-16 w-40 h-40 rounded-full blur-[80px] opacity-20 pointer-events-none ${isLight ? 'bg-primary/30' : 'bg-primary/20'}`} />
                                
                                <div className="flex items-center justify-between gap-4 mb-6">
                                    <h3 className={`text-xl font-black flex items-center gap-3 font-display tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                                        <div className="p-2.5 rounded-2xl bg-primary/10 text-primary">
                                            <Briefcase size={20} />
                                        </div>
                                        Professional Services
                                    </h3>

                                </div>

                                <div className="grid gap-4 lg:grid-cols-3">
                                    {business.services.map((svc: any, i: number) => (
                                        <div key={i} className={`flex flex-col rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl group/card overflow-hidden ${
                                            isLight 
                                                ? 'bg-white border-slate-100 hover:border-primary/40 shadow-sm' 
                                                : 'bg-slate-800/40 border-white/5 hover:border-primary/30'
                                        }`}>
                                            <div className="w-full h-40 overflow-hidden relative">
                                                <img 
                                                    src={svc.image ? (svc.image.startsWith('http') ? svc.image : `${(process.env.NEXT_PUBLIC_API_URL || '').replace('/api', '')}/${svc.image}`) : `https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800`} 
                                                    alt={svc.name} 
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-105" 
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                            </div>
                                            
                                            <div className="flex flex-col flex-1 p-4">
                                                <h4 className={`font-black text-base font-display leading-tight mb-1.5 group-hover/card:text-primary transition-colors ${isLight ? 'text-slate-900' : 'text-white'}`}>
                                                    {svc.name}
                                                </h4>
                                                
                                                <p className={`text-xs leading-relaxed mb-4 ${isLight ? 'text-slate-500' : 'text-slate-400/90'}`}>
                                                    {svc.description}
                                                </p>
                                                
                                                <div className="mt-auto pt-3 border-t border-dashed border-slate-200 dark:border-white/10 flex items-center justify-between gap-3">
                                                    <div className="flex flex-col">
                                                        <span className="text-[9px] uppercase tracking-widest font-black opacity-50">Starting From</span>
                                                        <span className={`text-base font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>₹{svc.price}</span>
                                                    </div>
                                                    
                                                    <button 
                                                        onClick={() => window.open(`https://wa.me/${business.whatsapp || ''}?text=I'm interested in ${svc.name}`, '_blank')}
                                                        className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 ${
                                                            isLight 
                                                            ? 'bg-primary text-white hover:bg-primary/90' 
                                                            : 'bg-primary text-black hover:bg-primary/90'
                                                        }`}
                                                    >
                                                        <MessageCircle size={13} />
                                                        Enquire Now
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                         )}

                        {/* Products */}
                        {business.products && business.products.length > 0 && (
                            <motion.div 
                                initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                                className={`rounded-3xl p-6 backdrop-blur-3xl border border-solid shadow-xl relative overflow-hidden ${
                                    isLight ? 'bg-white/95 border-slate-200' : 'bg-slate-900/90 border-white/10'
                                }`}
                            >
                                <div className={`absolute -top-16 -right-16 w-40 h-40 rounded-full blur-[80px] opacity-20 pointer-events-none ${isLight ? 'bg-amber-500/30' : 'bg-amber-500/20'}`} />

                                <div className="flex items-center justify-between gap-4 mb-6">
                                    <h3 className={`text-xl font-black flex items-center gap-3 font-display tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                                        <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-500">
                                            <Package size={20} />
                                        </div>
                                        Available Products
                                    </h3>
                                </div>

                                <div className="grid gap-4 lg:grid-cols-3">
                                    {business.products.map((prod: any, i: number) => (
                                        <div key={i} className={`flex flex-col rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl group/card overflow-hidden ${
                                            isLight 
                                                ? 'bg-white border-slate-100 hover:border-amber-500/40 shadow-sm' 
                                                : 'bg-slate-800/40 border-white/5 hover:border-amber-500/30'
                                        }`}>
                                            <div className="w-full h-40 overflow-hidden relative">
                                                <img 
                                                    src={prod.image ? (prod.image.startsWith('http') ? prod.image : `${(process.env.NEXT_PUBLIC_API_URL || '').replace('/api', '')}/${prod.image}`) : `https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800`} 
                                                    alt={prod.name} 
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-105" 
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                            </div>
                                            
                                            <div className="flex flex-col flex-1 p-4">
                                                <h4 className={`font-black text-base font-display leading-tight mb-1.5 group-hover/card:text-amber-500 transition-colors ${isLight ? 'text-slate-900' : 'text-white'}`}>
                                                    {prod.name}
                                                </h4>
                                                <p className={`text-xs leading-relaxed mb-4 ${isLight ? 'text-slate-500' : 'text-slate-400/90'}`}>
                                                    {prod.description}
                                                </p>
                                                
                                                <div className="mt-auto pt-3 border-t border-dashed border-slate-200 dark:border-white/10 flex items-center justify-between gap-3">
                                                    <div className="flex flex-col">
                                                        <span className="text-[9px] uppercase tracking-widest font-black opacity-50">Price</span>
                                                        <span className={`text-base font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>₹{prod.price}</span>
                                                    </div>
                                                    
                                                    <button 
                                                        onClick={() => window.open(`https://wa.me/${business.whatsapp || ''}?text=I'm interested in buying ${prod.name}`, '_blank')}
                                                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 bg-amber-500 text-white hover:bg-amber-600"
                                                    >
                                                        <ShoppingBag size={13} />
                                                       cart
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
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
                            className={`relative w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl border ${
                                isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-white/10'
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
                                        onChange={(e) => setClaimForm({...claimForm, fullName: e.target.value})}
                                        className={`w-full p-4 rounded-2xl border text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all ${
                                            isLight ? 'bg-slate-50 border-slate-200 focus:border-primary' : 'bg-white/5 border-white/10 focus:border-primary text-white'
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
                                            onChange={(e) => setClaimForm({...claimForm, phoneNumber: e.target.value})}
                                            className={`w-full p-4 rounded-2xl border text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all ${
                                                isLight ? 'bg-slate-50 border-slate-200 focus:border-primary' : 'bg-white/5 border-white/10 focus:border-primary text-white'
                                            }`}
                                            placeholder="Phone"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest opacity-50 block mb-1.5 ml-1">Email ID</label>
                                        <input 
                                            type="email" required
                                            value={claimForm.email}
                                            onChange={(e) => setClaimForm({...claimForm, email: e.target.value})}
                                            className={`w-full p-4 rounded-2xl border text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all ${
                                                isLight ? 'bg-slate-50 border-slate-200 focus:border-primary' : 'bg-white/5 border-white/10 focus:border-primary text-white'
                                            }`}
                                            placeholder="Email"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest opacity-50 block mb-1.5 ml-1">Owner Proof (PDF/Image)</label>
                                    <input 
                                        type="file" required accept="image/*,application/pdf"
                                        onChange={(e) => setClaimForm({...claimForm, ownerProof: e.target.files?.[0] || null})}
                                        className={`w-full p-4 rounded-2xl border text-sm file:mr-4 file:py-1.5 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-primary/10 file:text-primary hover:file:bg-primary/20 ${
                                            isLight ? 'bg-slate-50 border-slate-200 text-slate-500' : 'bg-white/5 border-white/10 text-slate-400'
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
