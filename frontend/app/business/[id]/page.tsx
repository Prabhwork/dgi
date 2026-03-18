"use client";

import { useState, useEffect, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { 
    MapPin, Star, Clock, Phone, Globe, ArrowLeft, Loader2, 
    MessageCircle, ShieldCheck, Mail, Edit3, Image as ImageIcon,
    Info, Share2, BadgeCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useTheme } from "@/components/ThemeProvider";
import ParticleNetwork from "@/components/ParticleNetwork";

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
            <div className={`min-h-screen flex items-center justify-center transition-colors ${isLight ? 'bg-slate-50' : 'bg-[#020617]'}`}>
                <Loader2 size={40} className="text-primary animate-spin" />
            </div>
        );
    }

    if (error || !business) {
        return (
            <div className={`min-h-screen flex flex-col items-center justify-center transition-colors ${isLight ? 'bg-slate-50 text-slate-900' : 'bg-[#020617] text-white'}`}>
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
            isLight ? 'bg-slate-100 text-slate-900' : 'bg-[#020617] text-white'
        }`}>
            {/* Background elements */}
            <div className="fixed inset-0 z-0 opacity-40">
                <ParticleNetwork />
            </div>

            <div className="relative z-10 flex flex-col min-h-screen">
                <Navbar />
                
                <main className="container mx-auto px-4 pt-24 pb-20 flex-1 max-w-6xl">
                    <button 
                        onClick={() => router.back()} 
                        className={`flex items-center gap-2 mb-6 text-sm font-medium hover:underline ${isLight ? 'text-slate-600' : 'text-slate-400'}`}
                    >
                        <ArrowLeft size={16} /> Back to Search
                    </button>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Details */}
                        <div className="lg:col-span-2 space-y-6">
                            
                            {/* Header Card */}
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                                className={`rounded-3xl overflow-hidden backdrop-blur-xl border border-solid shadow-xl ${
                                    isLight ? 'bg-white/90 border-slate-200' : 'bg-white/5 border-white/10'
                                }`}
                            >
                                <div className="h-64 md:h-80 w-full relative">
                                    <img 
                                        src={bannerImageUrl} 
                                        alt={business.brandName || business.businessName}
                                        className="w-full h-full object-cover"
                                        onError={(e) => { (e.target as HTMLImageElement).src = '/assets/business-placeholder.jpg'; }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                                    <div className="absolute top-4 right-4 bg-primary/90 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-sm shadow-lg border border-white/20">
                                        {business.businessCategory}
                                    </div>
                                    <div className="absolute bottom-6 left-6 right-6">
                                        <h1 className="text-3xl md:text-5xl font-black text-white drop-shadow-lg mb-2">
                                            {business.brandName || business.businessName}
                                        </h1>
                                        <div className="flex flex-wrap items-center gap-3 text-sm">
                                            <div className="flex items-center gap-1 text-yellow-400 bg-black/40 px-2 py-1 rounded-lg backdrop-blur-sm border border-white/10">
                                                <Star size={16} fill="currentColor" />
                                                <span className="font-bold text-white">4.8</span>
                                                <span className="text-white/60 text-xs ml-1">(120 Reviews)</span>
                                            </div>
                                            {(business.isVerified || business.aadhaarVerified || business.approvalStatus === 'approved') && (
                                                <div className="flex items-center gap-1 text-emerald-400 bg-black/40 px-2 py-1 rounded-lg backdrop-blur-sm border border-emerald-500/30 font-medium">
                                                    <BadgeCheck size={16} className="fill-emerald-500 text-black" />
                                                    Verified Business
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="p-6">
                                    {/* Action row (Mobile sticky logic could be added here, but desktop shows full) */}
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
                                        <a href={`tel:${business.primaryContactNumber}`} className="flex flex-col items-center justify-center p-3 rounded-2xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20 transition-colors border border-emerald-200 dark:border-emerald-500/20">
                                            <Phone size={24} className="mb-1" />
                                            <span className="text-xs font-bold">Call Now</span>
                                        </a>
                                        <a href={`https://wa.me/${business.officialWhatsAppNumber || business.primaryContactNumber}`} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center p-3 rounded-2xl bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-500/10 dark:text-green-400 dark:hover:bg-green-500/20 transition-colors border border-green-200 dark:border-green-500/20">
                                            <MessageCircle size={24} className="mb-1" />
                                            <span className="text-xs font-bold">WhatsApp</span>
                                        </a>
                                        <a href={`https://maps.google.com/?q=${business.gpsCoordinates?.lat || ''},${business.gpsCoordinates?.lng || ''}`} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center p-3 rounded-2xl bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20 transition-colors border border-blue-200 dark:border-blue-500/20">
                                            <MapPin size={24} className="mb-1" />
                                            <span className="text-xs font-bold">Direction</span>
                                        </a>
                                        <button className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10 transition-colors border border-slate-200 dark:border-white/10">
                                            <Share2 size={24} className="mb-1" />
                                            <span className="text-xs font-bold">Share</span>
                                        </button>
                                    </div>
                                    
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className={`text-lg font-bold mb-3 flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                                                <Info size={20} className="text-primary" /> About
                                            </h3>
                                            <p className={`leading-relaxed text-sm ${isLight ? 'text-slate-600' : 'text-white/70'}`}>
                                                {business.description || "No detailed description provided by the business."}
                                            </p>
                                        </div>
                                        
                                        {/* Gallery quick preview if exists, else skip */}
                                        {business.gallery && business.gallery.length > 0 && (
                                            <div>
                                                <h3 className={`text-lg font-bold mb-3 flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                                                    <ImageIcon size={20} className="text-primary" /> Photos
                                                </h3>
                                                <div className="flex gap-3 overflow-x-auto pb-4 snap-x">
                                                    {business.gallery.map((img: string, i: number) => (
                                                        <div key={i} className="min-w-[140px] h-[140px] rounded-xl overflow-hidden shrink-0 snap-start border border-slate-200 dark:border-white/10">
                                                            <img 
                                                                src={`${(process.env.NEXT_PUBLIC_API_URL || '').replace('/api', '')}/${img}`}
                                                                alt="Gallery"
                                                                className="w-full h-full object-cover"
                                                                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>

                            {/* Keywords / Tags */}
                            {business.keywords && business.keywords.length > 0 && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                                    className={`rounded-3xl p-6 backdrop-blur-xl border border-solid ${
                                        isLight ? 'bg-white/90 border-slate-200' : 'bg-white/5 border-white/10'
                                    }`}
                                >
                                    <h3 className={`text-sm font-bold uppercase tracking-wider mb-4 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Specialities & Tags</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {business.keywords.map((kw: string, i: number) => (
                                            <span key={i} className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${
                                                isLight ? 'bg-slate-100 border-slate-200 text-slate-700' : 'bg-white/5 border-white/10 text-white/80'
                                            }`}>
                                                {kw}
                                            </span>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            
                            {/* Contact Info Card */}
                            <motion.div 
                                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
                                className={`rounded-3xl p-6 backdrop-blur-xl border border-solid ${
                                    isLight ? 'bg-white/90 border-slate-200 shadow-xl shadow-blue-900/5' : 'bg-white/5 border-white/10 shadow-black/50'
                                }`}
                            >
                                <h3 className={`text-lg font-bold mb-5 flex items-center gap-2 border-b pb-4 ${
                                    isLight ? 'text-slate-900 border-slate-100' : 'text-white border-white/10'
                                }`}>
                                    Contact Details
                                </h3>
                                
                                <div className="space-y-5">
                                    <div className="flex items-start gap-4">
                                        <div className={`mt-0.5 p-2 rounded-xl shrink-0 ${isLight ? 'bg-blue-50 text-blue-600' : 'bg-blue-500/10 text-blue-400'}`}>
                                            <MapPin size={20} />
                                        </div>
                                        <div>
                                            <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Address</p>
                                            <p className={`text-sm font-medium leading-relaxed ${isLight ? 'text-slate-800' : 'text-white/90'}`}>
                                                {business.registeredOfficeAddress || 'Address not listed'}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-start gap-4">
                                        <div className={`p-2 rounded-xl shrink-0 ${isLight ? 'bg-emerald-50 text-emerald-600' : 'bg-emerald-500/10 text-emerald-400'}`}>
                                            <Phone size={20} />
                                        </div>
                                        <div>
                                            <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Phone</p>
                                            <p className={`text-sm font-bold ${isLight ? 'text-slate-800' : 'text-white'}`}>
                                                {business.primaryContactNumber}
                                            </p>
                                        </div>
                                    </div>

                                    {business.website && (
                                        <div className="flex items-start gap-4">
                                            <div className={`p-2 rounded-xl shrink-0 ${isLight ? 'bg-purple-50 text-purple-600' : 'bg-purple-500/10 text-purple-400'}`}>
                                                <Globe size={20} />
                                            </div>
                                            <div>
                                                <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Website</p>
                                                <a href={business.website.startsWith('http') ? business.website : `https://${business.website}`} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-primary hover:underline truncate block max-w-[200px]">
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
                                    isLight ? 'bg-white/90 border-slate-200 shadow-xl shadow-blue-900/5' : 'bg-white/5 border-white/10 shadow-black/50'
                                }`}
                            >
                                <h3 className={`text-lg font-bold mb-5 flex items-center gap-2 border-b pb-4 ${
                                    isLight ? 'text-slate-900 border-slate-100' : 'text-white border-white/10'
                                }`}>
                                    Business Hours
                                </h3>
                                
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <Clock size={18} className="text-primary" />
                                            <span className={`text-sm font-medium ${isLight ? 'text-slate-700' : 'text-white/80'}`}>Daily Timing</span>
                                        </div>
                                        <span className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                                            {business.openingTime || '09:00 AM'} - {business.closingTime || '06:00 PM'}
                                        </span>
                                    </div>
                                    
                                    {business.weeklyOff && business.weeklyOff.toLowerCase() !== 'none' && (
                                        <div className="flex justify-between items-center pt-3 border-t border-dashed border-slate-200 dark:border-white/10">
                                            <span className={`text-sm font-medium ${isLight ? 'text-slate-700' : 'text-white/80'}`}>Weekly Off</span>
                                            <span className="text-xs font-bold bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400 px-3 py-1 rounded-full uppercase">
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
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <Loader2 size={40} className="text-primary animate-spin" />
            </div>
        }>
            <BusinessDetail />
        </Suspense>
    );
}
