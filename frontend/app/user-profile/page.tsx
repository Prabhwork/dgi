"use client";

import { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    User, Mail, Phone, ShieldCheck, Camera, Save, Loader2, CheckCircle2, AlertCircle, Edit2,
    ShoppingBag, Calendar, Package, ChevronRight, Clock, Star, ArrowLeft, Utensils,
    ChevronDown, Navigation, MessageSquare, X, Heart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import CursorGlow from "@/components/CursorGlow";

import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";

const FOOD_API = process.env.NEXT_PUBLIC_FOOD_API_URL || "";

const STATUS_COLORS: Record<string, string> = {
    Pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    Accepted: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    Preparing: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    Ready: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    Completed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    Cancelled: "bg-red-500/10 text-red-400 border-red-500/20",
    Confirmed: "bg-blue-500/10 text-blue-400 border-blue-500/20",
};

const BOOKING_STATUS_COLORS: Record<string, string> = {
    Pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    Confirmed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    Cancelled: "bg-red-500/10 text-red-400 border-red-500/20",
    Completed: "bg-slate-500/10 text-slate-400 border-slate-500/20",
};

type SidebarTab = "profile" | "orders" | "bookings";
const CountdownBadge = ({ order, prepTime }: { order: any, prepTime: number }) => {
    const calculateRemaining = () => {
        const baseTime = order?.preparingAt || order?.acceptedAt;
        if (!baseTime) return { mins: prepTime, secs: 0 };
        const targetTime = new Date(baseTime).getTime() + (prepTime * 60000);
        const now = new Date().getTime();
        const diff = targetTime - now;
        
        if (diff <= 0) return { mins: 0, secs: 0 };
        
        const mins = Math.floor(diff / 60000);
        const secs = Math.floor((diff % 60000) / 1000);
        return { mins, secs };
    };

    const [{ mins, secs }, setTime] = useState(calculateRemaining());

    useEffect(() => {
        const interval = setInterval(() => {
            setTime(calculateRemaining());
        }, 1000); // Update every second
        return () => clearInterval(interval);
    }, [order?.preparingAt, order?.acceptedAt, prepTime]);

    const isDone = mins === 0 && secs === 0;

    return (
        <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border animate-pulse ${isDone ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
            {isDone ? "Ready soon!" : `Ready in: ${mins}:${secs.toString().padStart(2, '0')}`}
        </span>
    );
};

const PickupCountdownBadge = ({ readyAt }: { readyAt: string }) => {
    const calculateRemaining = () => {
        if (!readyAt) return { mins: 3, secs: 0 };
        const targetTime = new Date(readyAt).getTime() + (3 * 60000);
        const now = new Date().getTime();
        const diff = targetTime - now;
        
        if (diff <= 0) return { mins: 0, secs: 0 };
        
        const mins = Math.floor(diff / 60000);
        const secs = Math.floor((diff % 60000) / 1000);
        return { mins, secs };
    };

    const [{ mins, secs }, setTime] = useState(calculateRemaining());

    useEffect(() => {
        const interval = setInterval(() => {
            setTime(calculateRemaining());
        }, 1000);
        return () => clearInterval(interval);
    }, [readyAt]);

    const isDone = mins === 0 && secs === 0;

    return (
        <span className={`text-[9px] font-black uppercase tracking-wider px-3 py-1 rounded-full border transition-all ${isDone ? 'bg-red-500/20 text-red-500 border-red-500/40 animate-pulse' : 'bg-primary/20 text-primary border-primary/40'}`}>
            {isDone ? "OVERDUE" : `COLLECT IN: ${mins}:${secs.toString().padStart(2, '0')}`}
        </span>
    );
};

const ReviewModal = ({ order, isOpen, onClose, onSubmit }: any) => {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [submitting, setSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            await onSubmit({ rating, comment, orderId: order.id, partnerId: order.partnerId });
            setRating(5);
            setComment("");
            onClose();
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="bg-[#0f172a] border border-white/10 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl shadow-primary/20"
                >
                    <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/3">
                        <h3 className="text-lg font-black text-white italic uppercase">Rate your Experience</h3>
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors"><X size={20} className="text-white/40" /></button>
                    </div>
                    <div className="p-6 space-y-6">
                        <div className="text-center space-y-2">
                            <p className="text-xs font-bold text-white/40 uppercase tracking-widest italic">{order.storeName || 'Restaurant'}</p>
                            <div className="flex justify-center gap-2">
                                {[1, 2, 3, 4, 5].map((s) => (
                                    <button 
                                        key={s} 
                                        onClick={() => setRating(s)}
                                        className="p-1 transition-transform active:scale-95"
                                    >
                                        <Star 
                                            size={32} 
                                            className={`${s <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-white/10'} transition-colors`} 
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>
                        <textarea 
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Share your feedback here..."
                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-sm focus:border-primary/50 outline-none h-32 resize-none transition-colors"
                        />
                        <button 
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="w-full py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2"
                        >
                            {submitting ? <Loader2 className="animate-spin" size={20} /> : "Submit Review"}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

// ... (rest of the file)


function UserProfileContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const tabParam = searchParams.get("tab") as SidebarTab;
    
    // States
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [reviewOrder, setReviewOrder] = useState<any>(null);
    const [ordersLoading, setOrdersLoading] = useState(false);
    const [bookingsLoading, setBookingsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [user, setUser] = useState<any>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [avatarFile, setAvatarFile] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<SidebarTab>(() => {
        if (tabParam && ["profile", "orders", "bookings"].includes(tabParam)) {
            return tabParam;
        }
        return "profile";
    });

    // Handle tab change from URL later if needed
    useEffect(() => {
        if (tabParam && ["profile", "orders", "bookings"].includes(tabParam) && tabParam !== activeTab) {
            setActiveTab(tabParam);
        }
    }, [tabParam]);

    // Orders
    const [orders, setOrders] = useState<any[]>([]);
    const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

    // Bookings
    const [bookings, setBookings] = useState<any[]>([]);
    const [orderSubTab, setOrderSubTab] = useState<'Takeaway' | 'Dine-in'>('Takeaway');

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: ""
    });

    const displayedOrders = orders.filter(o => {
        if (orderSubTab === 'Takeaway') return !o.orderType || o.orderType === 'Takeaway';
        if (orderSubTab === 'Dine-in') return o.orderType === 'Dine-in';
        return false;
    });

    useEffect(() => {
        fetchUserData();
    }, []);

    useEffect(() => {
        if (user && activeTab === "orders" && orders.length === 0) {
            fetchOrders();
        }
        if (user && activeTab === "bookings" && bookings.length === 0) {
            fetchBookings();
        }
    }, [activeTab, user]);

    const fetchUserData = async () => {
        const token = localStorage.getItem("userToken");
        const businessToken = localStorage.getItem("businessToken");

        if (token) {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                const data = await res.json();
                if (data.success) {
                    const userData = data.data;
                    const cleanPhone = userData.phone && userData.phone.startsWith("PENDING_") ? "" : userData.phone;
                    setUser(userData);
                    setFormData({ name: userData.name, email: userData.email, phone: cleanPhone || "" });
                } else {
                    localStorage.removeItem("userToken");
                    router.push("/login");
                }
            } catch (err) {
                setError("Failed to fetch user profile.");
            } finally {
                setLoading(false);
            }
        } else if (businessToken) {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/business/me`, {
                    headers: { "Authorization": `Bearer ${businessToken}` }
                });
                const data = await res.json();
                if (data.success) {
                    const bUser = data.data;
                    setUser({
                        _id: bUser._id,
                        name: bUser.brandName || bUser.businessName,
                        email: bUser.officialEmailAddress,
                        phone: bUser.primaryContactNumber,
                        profileType: "Business"
                    });
                    setFormData({
                        name: bUser.brandName || bUser.businessName,
                        email: bUser.officialEmailAddress,
                        phone: bUser.primaryContactNumber || ""
                    });
                } else {
                    localStorage.removeItem("businessToken");
                    router.push("/login");
                }
            } catch (err) {
                setError("Failed to fetch business profile for orders.");
            } finally {
                setLoading(false);
            }
        } else {
            router.push("/login");
        }
    };

    const fetchOrders = async () => {
        if (!user?._id) return;
        setOrdersLoading(true);
        try {
            const res = await fetch(`${FOOD_API}/orders/user/${user._id}`);
            if (res.ok) {
                const data = await res.json();
                setOrders(Array.isArray(data) ? data : []);
            }
        } catch (err) {
            console.error("Failed to fetch orders", err);
        } finally {
            setOrdersLoading(false);
        }
    };

    const fetchBookings = async () => {
        if (!user?._id) return;
        setBookingsLoading(true);
        try {
            const res = await fetch(`${FOOD_API}/dineout/reservations/user/${user._id}`);
            if (res.ok) {
                const data = await res.json();
                setBookings(Array.isArray(data.data) ? data.data : []);
            }
        } catch (err) {
            console.error("Failed to fetch bookings", err);
        } finally {
            setBookingsLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleReviewSubmit = async (reviewData: any) => {
        try {
            const res = await fetch(`${FOOD_API}/reviews/public`, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "x-partner-id": reviewData.partnerId 
                },
                body: JSON.stringify({
                    ...reviewData,
                    customer: user.name || "Customer"
                })
            });
            if (res.ok) {
                toast.success("Thank you for your review!");
                // Update local orders state to mark this order as reviewed
                setOrders(prev => prev.map(o => 
                    o.id === reviewData.orderId ? { ...o, isReviewed: true } : o
                ));
            } else {
                toast.error("Failed to submit review.");
            }
        } catch (err) {
            console.error("Review error:", err);
            toast.error("Something went wrong.");
        }
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);

        const token = localStorage.getItem("userToken");
        try {
            const body = { ...formData, avatar: avatarFile || user.avatar };
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/update-me`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify(body)
            });
            const data = await res.json();
            if (data.success) {
                const updatedUser = data.data;
                const cleanPhone = updatedUser.phone && updatedUser.phone.startsWith("PENDING_") ? "" : updatedUser.phone;
                setUser(updatedUser);
                setFormData(prev => ({ ...prev, phone: cleanPhone || "" }));
                setIsEditing(false);
                toast.success("Profile updated successfully!");
            } else {
                setError(data.error || "Update failed.");
                toast.error(data.error || "Update failed.");
            }
        } catch (err) {
            setError("Something went wrong. Please try again.");
            toast.error("Something went wrong.");
        } finally {
            setSaving(false);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) { toast.error("Image size should be less than 2MB"); return; }
            const reader = new FileReader();
            reader.onloadend = () => { setAvatarFile(reader.result as string); setIsEditing(true); };
            reader.readAsDataURL(file);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
            </div>
        );
    }

    const tabs: { id: SidebarTab; label: string; icon: any; badge?: number }[] = [
        { id: "profile", label: "My Profile", icon: User },
        { id: "orders", label: "My Orders", icon: ShoppingBag, badge: orders.length || undefined },
        { id: "bookings", label: "Dineout Bookings", icon: Calendar, badge: bookings.length || undefined },
    ];

    return (
        <div className="min-h-screen bg-background relative overflow-hidden text-foreground">

            <CursorGlow />
            <Navbar />

            <main className="pt-28 pb-24 relative z-10 px-4">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8 flex flex-col sm:flex-row items-center gap-6 p-6 rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-xl"
                    >
                        <div className="relative group shrink-0">
                            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/30 to-primary/5 border border-white/10 flex items-center justify-center overflow-hidden shadow-xl">
                                {avatarFile || user?.avatar ? (
                                    <img src={avatarFile || user.avatar} alt={user.name} className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-10 h-10 text-primary" />
                                )}
                                <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer rounded-2xl">
                                    <Camera className="text-white w-5 h-5" />
                                    <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                                </label>
                            </div>
                        </div>
                        <div className="flex-1 text-center sm:text-left">
                            <h1 className="text-2xl font-bold text-white">{user?.name}</h1>
                            <p className="text-white/50 text-sm mt-1">{user?.email}</p>
                            <div className="flex items-center gap-2 mt-2 justify-center sm:justify-start">
                                <span className="text-[10px] bg-primary/20 text-primary px-3 py-1 rounded-full border border-primary/20 font-bold uppercase tracking-widest">User Account</span>
                                {user?.isEmailVerified && (
                                    <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/20 font-bold uppercase tracking-widest flex items-center gap-1">
                                        <CheckCircle2 size={10} /> Verified
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="text-center sm:text-right shrink-0">
                            <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold">Member Since</p>
                            <p className="text-white font-bold mt-1">{new Date(user?.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short' })}</p>
                        </div>
                    </motion.div>

                    {/* Main Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        {/* Sidebar */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="lg:col-span-1"
                        >
                            <div className="rounded-[1.5rem] border border-white/10 bg-white/5 backdrop-blur-xl p-2 space-y-1 sticky top-24">
                                {tabs.map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`w-full flex items-center justify-between gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all ${
                                            activeTab === tab.id
                                                ? "bg-primary text-white shadow-lg shadow-primary/20"
                                                : "text-white/50 hover:text-white hover:bg-white/5"
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <tab.icon size={16} />
                                            {tab.label}
                                        </div>
                                        {tab.badge !== undefined && tab.badge > 0 && (
                                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-primary/20 text-primary'}`}>
                                                {tab.badge}
                                            </span>
                                        )}
                                    </button>
                                ))}

                                <div className="pt-4 border-t border-white/10 mt-2 px-2 pb-2">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-3">Account Security</p>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-[11px]">
                                            <span className="text-white/40">2FA Status</span>
                                            <span className={`font-bold px-2 py-0.5 rounded-full border text-[9px] ${user?.isTwoFactorEnabled ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                                                {user?.isTwoFactorEnabled ? 'ON' : 'OFF'}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between text-[11px]">
                                            <span className="text-white/40">Phone</span>
                                            <span className={`font-bold px-2 py-0.5 rounded-full border text-[9px] ${user?.phone && !user.phone.startsWith("PENDING_") ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'}`}>
                                                {user?.phone && !user.phone.startsWith("PENDING_") ? 'ADDED' : 'PENDING'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Content Panel */}
                        <div className="lg:col-span-3">
                            <AnimatePresence mode="wait">
                                {/* ─── Profile Tab ─── */}
                                {activeTab === "profile" && (
                                    <motion.div
                                        key="profile"
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -15 }}
                                        className="rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-xl p-8 relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
                                        <div className="flex items-center justify-between mb-8">
                                            <h2 className="text-xl font-bold text-white flex items-center gap-3">
                                                <User size={20} className="text-primary" /> {user?.profileType === "Business" ? "Business Profile Details" : "Profile Details"}
                                            </h2>
                                            {user?.profileType !== "Business" && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="rounded-xl border-white/10 hover:bg-white/5 text-[10px] uppercase font-bold tracking-widest"
                                                    onClick={() => setIsEditing(!isEditing)}
                                                >
                                                    {isEditing ? <><ArrowLeft className="mr-2 w-3 h-3" /> Cancel</> : <><Edit2 className="mr-2 w-3 h-3" /> Edit Profile</>}
                                                </Button>
                                            )}
                                        </div>

                                        {isEditing ? (
                                            <form onSubmit={handleUpdateProfile} className="space-y-5">
                                                <div className="space-y-2">
                                                    <Label className="text-white/70 text-[10px] uppercase tracking-widest">Full Name</Label>
                                                    <div className="relative">
                                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                                                        <Input name="name" value={formData.name} onChange={handleInputChange} className="bg-white/5 border-white/10 text-white pl-11 h-12 rounded-xl" required />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-white/70 text-[10px] uppercase tracking-widest">Email (Read-Only)</Label>
                                                    <div className="relative">
                                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                                                        <Input name="email" type="email" value={formData.email} readOnly className="bg-white/5 border-white/10 text-white/40 cursor-not-allowed pl-11 h-12 rounded-xl" />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-white/70 text-[10px] uppercase tracking-widest">Phone Number</Label>
                                                    <div className="relative">
                                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                                                        <Input name="phone" type="tel" value={formData.phone} onChange={handleInputChange} className="bg-white/5 border-white/10 text-white pl-11 h-12 rounded-xl" />
                                                    </div>
                                                </div>
                                                {error && (
                                                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-3">
                                                        <AlertCircle size={16} />
                                                        <span className="text-xs font-medium">{error}</span>
                                                    </div>
                                                )}
                                                <Button type="submit" disabled={saving} className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 font-bold uppercase tracking-widest text-xs">
                                                    {saving ? <><Loader2 className="mr-2 w-4 h-4 animate-spin" /> Saving...</> : <><Save className="mr-2 w-4 h-4" /> Save Changes</>}
                                                </Button>
                                            </form>
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {[
                                                    { label: "Full Name", value: user?.name, icon: User },
                                                    { label: "Email Address", value: user?.email, icon: Mail },
                                                    { label: "Phone Number", value: user?.phone && !user.phone.startsWith("PENDING_") ? user.phone : "Not provided", icon: Phone },
                                                    { label: "Account Type", value: user?.profileType || "User", icon: ShieldCheck },
                                                ].map(({ label, value, icon: Icon }) => (
                                                    <div key={label} className="p-5 rounded-2xl bg-white/5 border border-white/5">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <Icon size={12} className="text-primary" />
                                                            <span className="text-[10px] font-black uppercase tracking-widest text-primary">{label}</span>
                                                        </div>
                                                        <p className="text-base font-semibold text-white">{value}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </motion.div>
                                )}

                                {/* ─── Orders Tab ─── */}
                                {activeTab === "orders" && (
                                    <motion.div
                                        key="orders"
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -15 }}
                                        className="rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-xl p-8 relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
                                        <div className="flex items-center justify-between mb-8">
                                            <h2 className="text-xl font-bold text-white flex items-center gap-3">
                                                <ShoppingBag size={20} className="text-primary" /> My Tracked Activites
                                            </h2>
                                            <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 shrink-0">
                                                {(['Takeaway', 'Dine-in'] as const).map((tab) => (
                                                    <button
                                                        key={tab}
                                                        onClick={() => setOrderSubTab(tab)}
                                                        className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${orderSubTab === tab ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-white/30 hover:text-white/50'}`}
                                                    >
                                                        {tab}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="mb-6 flex items-center justify-between">
                                            <p className="text-[10px] font-black uppercase text-white/20 tracking-[0.2em]">
                                                Viewing {orderSubTab} history
                                            </p>
                                            <button onClick={fetchOrders} className="text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-primary transition-colors">
                                                Refresh Queue
                                            </button>
                                        </div>

                                        {ordersLoading ? (
                                            <div className="flex flex-col items-center justify-center py-16 gap-4">
                                                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                                                <p className="text-white/30 text-sm font-medium">Fetching your orders...</p>
                                            </div>
                                        ) : orders.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
                                                <div className="w-20 h-20 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                                                    <Package size={32} className="text-primary/50" />
                                                </div>
                                                <div>
                                                    <p className="text-white font-bold text-lg">No Orders Found</p>
                                                    <p className="text-white/40 text-[13px] mt-1.5 font-medium">Please do any order to see your history here.</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {displayedOrders.length === 0 ? (
                                                    <div className="flex flex-col items-center justify-center py-16 gap-4 text-center opacity-40">
                                                        <Package size={32} />
                                                        <p className="text-xs font-bold uppercase tracking-widest">No {orderSubTab} found</p>
                                                    </div>
                                                ) : (
                                                    displayedOrders.map((order) => (
                                                        <motion.div
                                                            key={order._id}
                                                            layout
                                                            className="border border-white/10 rounded-2xl overflow-hidden bg-white/3 hover:bg-white/5 transition-colors"
                                                        >
                                                            {/* Order Header */}
                                                            <button
                                                                onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
                                                                className="w-full flex items-center gap-4 p-5 text-left"
                                                            >
                                                                <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                                                                    <Utensils size={18} className="text-primary" />
                                                                </div>
                                                                 <div className="flex-1 min-w-0">
                                                                    <div className="flex items-center gap-2 flex-wrap">
                                                                        <p className="text-sm font-black text-white">{order.id}</p>
                                                                        <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${STATUS_COLORS[order.status] || "bg-white/10 text-white/40 border-white/10"}`}>
                                                                            {order.status}
                                                                        </span>
                                                                        {order.orderType && (
                                                                            <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border bg-white/5 text-white/30 border-white/10">
                                                                                {order.orderType} {order.orderType === 'Dine-in' && order.time && `@ ${order.time}`}
                                                                            </span>
                                                                        )}
                                                                        {order.status === 'Preparing' && (order.prepTime > 0 || order.preparingAt) && (
                                                                            <CountdownBadge order={order} prepTime={order.prepTime || 20} />
                                                                        )}
                                                                        {order.status === 'Ready' && (
                                                                            <PickupCountdownBadge readyAt={order.readyAt} />
                                                                        )}
                                                                    </div>
                                                                    <div className="flex flex-col mt-0.5">
                                                                        {order.restaurantName && (
                                                                            <p className="text-[10px] font-black text-primary uppercase tracking-widest italic">
                                                                                {order.restaurantName}
                                                                            </p>
                                                                        )}
                                                                        <p className="text-[11px] text-white/40 truncate">
                                                                            {Array.isArray(order.items) ? order.items.map((it: any) => it.name).join(", ") : order.items}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                <div className="text-right shrink-0 ml-2">
                                                                    <p className="text-base font-black text-white">₹{order.total?.toFixed(2)}</p>
                                                                    <p className="text-[9px] text-white/30 mt-0.5">
                                                                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                                                                    </p>
                                                                </div>
                                                                <ChevronDown size={16} className={`text-white/30 shrink-0 transition-transform ml-2 ${expandedOrder === order._id ? 'rotate-180' : ''}`} />
                                                            </button>

                                                            {/* Expanded Detail */}
                                                            <AnimatePresence>
                                                                {expandedOrder === order._id && (
                                                                    <motion.div
                                                                        initial={{ height: 0, opacity: 0 }}
                                                                        animate={{ height: 'auto', opacity: 1 }}
                                                                        exit={{ height: 0, opacity: 0 }}
                                                                        transition={{ duration: 0.25 }}
                                                                        className="overflow-hidden border-t border-white/5"
                                                                    >
                                                                        <div className="p-5 space-y-4">
                                                                            {/* Pickup Alert */}
                                                                            {order.status === 'Ready' && (
                                                                                <motion.div
                                                                                    initial={{ scale: 0.95, opacity: 0 }}
                                                                                    animate={{ scale: 1, opacity: 1 }}
                                                                                    className="bg-primary/10 border border-primary/20 rounded-2xl p-4 flex items-center gap-4 relative overflow-hidden mb-2"
                                                                                >
                                                                                    <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                                                                                    <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                                                                                        <Utensils size={20} className="text-primary animate-bounce" />
                                                                                    </div>
                                                                                    <div>
                                                                                        <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] leading-tight">Order is Ready!</h4>
                                                                                        <p className="text-[12px] font-bold text-white tracking-tight leading-tight mt-0.5">Please take your order from restaurant, order is ready.</p>
                                                                                    </div>
                                                                                </motion.div>
                                                                            )}

                                                                            {/* Items */}
                                                                            {Array.isArray(order.itemsArray) && order.itemsArray.length > 0 && (
                                                                                <div>
                                                                                    <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-3">Items Ordered</p>
                                                                                    <div className="space-y-2">
                                                                                        {order.itemsArray.map((item: any, i: number) => (
                                                                                            <div key={i} className="flex items-center justify-between">
                                                                                                <div className="flex items-center gap-2">
                                                                                                    <span className="w-5 h-5 rounded bg-primary/10 text-primary text-[10px] font-black flex items-center justify-center">
                                                                                                        {item.quantity}x
                                                                                                    </span>
                                                                                                    <span className="text-sm text-white/80 font-medium">{item.name}</span>
                                                                                                </div>
                                                                                                <span className="text-sm font-bold text-white">₹{(item.price * item.quantity).toFixed(2)}</span>
                                                                                            </div>
                                                                                        ))}
                                                                                    </div>
                                                                                </div>
                                                                            )}

                                                                            {/* Bill Summary */}
                                                                            <div className="bg-white/5 rounded-xl p-4 space-y-2 border border-white/5">
                                                                                {order.subtotal && (
                                                                                    <div className="flex justify-between text-xs text-white/40">
                                                                                        <span>Subtotal</span><span>₹{Number(order.subtotal).toFixed(2)}</span>
                                                                                    </div>
                                                                                )}
                                                                                {order.tax && (
                                                                                    <div className="flex justify-between text-xs text-white/40">
                                                                                        <span>Tax</span><span>₹{order.tax?.toFixed(2)}</span>
                                                                                    </div>
                                                                                )}
                                                                                {order.restaurantCharges > 0 && (
                                                                                    <div className="flex justify-between text-xs text-white/40">
                                                                                        <span>Restaurant Charges</span><span>₹{Number(order.restaurantCharges).toFixed(2)}</span>
                                                                                    </div>
                                                                                )}
                                                                                {order.discount > 0 && (
                                                                                    <div className="flex justify-between text-xs text-emerald-400">
                                                                                        <span>Discount {order.couponCode ? `(${order.couponCode})` : ''}</span><span>-₹{order.discount?.toFixed(2)}</span>
                                                                                    </div>
                                                                                )}
                                                                                <div className="flex justify-between text-sm font-black text-white border-t border-white/10 pt-2 mt-1">
                                                                                    <span>Total Paid</span><span>₹{Number(order.total).toFixed(2)}</span>
                                                                                </div>
                                                                            </div>

                                                                            {/* Review Details */}
                                                                            {order.review && (
                                                                                <motion.div 
                                                                                    initial={{ opacity: 0, y: 10 }}
                                                                                    animate={{ opacity: 1, y: 0 }}
                                                                                    className="bg-primary/5 rounded-2xl p-5 border border-primary/10 relative overflow-hidden group"
                                                                                >
                                                                                    <div className="absolute top-0 right-0 p-3">
                                                                                        {order.review.isLikedByPartner && (
                                                                                            <motion.div
                                                                                                animate={{ scale: [1, 1.2, 1] }}
                                                                                                transition={{ repeat: Infinity, duration: 2 }}
                                                                                            >
                                                                                                <Heart size={16} className="text-red-500 fill-red-500" />
                                                                                            </motion.div>
                                                                                        )}
                                                                                    </div>
                                                                                    
                                                                                    <div className="flex items-center gap-1 mb-2">
                                                                                        {[...Array(5)].map((_, i) => (
                                                                                            <Star 
                                                                                                key={i} 
                                                                                                size={12} 
                                                                                                className={`${i < order.review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-white/10'}`} 
                                                                                            />
                                                                                        ))}
                                                                                    </div>
                                                                                    
                                                                                    {order.review.comment && (
                                                                                        <p className="text-sm text-white/80 leading-relaxed italic">
                                                                                            {order.review.comment}
                                                                                        </p>
                                                                                    )}
                                                                                    
                                                                                    {order.review.reply && (
                                                                                        <div className="mt-4 pt-4 border-t border-white/5">
                                                                                            <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-2">
                                                                                                Response from {order.storeName || 'Restaurant'}
                                                                                            </p>
                                                                                            <div className="bg-white/5 rounded-xl p-3 text-xs text-white/60 border-l-2 border-primary/30">
                                                                                                {order.review.reply}
                                                                                            </div>
                                                                                        </div>
                                                                                    )}
                                                                                </motion.div>
                                                                            )}

                                                                            <div className="flex items-center gap-3 flex-wrap">
                                                                                <span className={`text-[10px] font-bold px-3 py-1.5 rounded-full border ${order.payment === 'Paid' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'}`}>
                                                                                    {order.payment === 'Paid' ? '✓ Paid Online' : 'Cash on Delivery'}
                                                                                </span>
                                                                                <Link 
                                                                                    href={`/nearby-map?id=${order.partnerId}`}
                                                                                    onClick={(e) => e.stopPropagation()}
                                                                                    className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full flex items-center justify-center gap-1.5 transition-all text-white/60 group"
                                                                                >
                                                                                    <Navigation size={10} className="text-primary group-hover:scale-110 transition-transform" />
                                                                                    <span className="text-[10px] font-black uppercase tracking-wider">Map View</span>
                                                                                </Link>
                                                                                {order.status === 'Completed' && !order.isReviewed && (
                                                                                    <button 
                                                                                        onClick={(e) => { e.stopPropagation(); setReviewOrder(order); }}
                                                                                        className="flex-1 max-w-[150px] py-1.5 bg-primary/10 border border-primary/20 hover:bg-primary/20 rounded-full flex items-center justify-center gap-2 transition-all active:scale-95 group"
                                                                                    >
                                                                                        <MessageSquare size={12} className="text-primary group-hover:scale-110 transition-transform" />
                                                                                        <span className="text-[10px] font-black text-primary uppercase tracking-widest">Rate & Review</span>
                                                                                    </button>
                                                                                )}
                                                                                {order.tableNumber && (
                                                                                    <span className="text-[10px] font-bold px-3 py-1.5 rounded-full border bg-white/5 text-white/40 border-white/10">
                                                                                        Table #{order.tableNumber}
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    </motion.div>
                                                                )}
                                                            </AnimatePresence>
                                                        </motion.div>
                                                    ))
                                                )}
                                            </div>
                                        )}
                                    </motion.div>
                                )}

                                {/* ─── Bookings Tab ─── */}
                                {activeTab === "bookings" && (
                                    <motion.div
                                        key="bookings"
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -15 }}
                                        className="rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-xl p-8 relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#E03546]/50 to-transparent" />
                                        <div className="flex items-center justify-between mb-8">
                                            <h2 className="text-xl font-bold text-white flex items-center gap-3">
                                                <Calendar size={20} className="text-[#E03546]" /> Dineout Bookings
                                            </h2>
                                            <button onClick={fetchBookings} className="text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-primary transition-colors">
                                                Refresh
                                            </button>
                                        </div>

                                        {bookingsLoading ? (
                                            <div className="flex flex-col items-center justify-center py-16 gap-4">
                                                <Loader2 className="w-8 h-8 text-[#E03546] animate-spin" />
                                                <p className="text-white/30 text-sm font-medium">Fetching your reservations...</p>
                                            </div>
                                        ) : bookings.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
                                                <div className="w-20 h-20 rounded-3xl bg-[#E03546]/10 border border-[#E03546]/20 flex items-center justify-center">
                                                    <Calendar size={32} className="text-[#E03546]/50" />
                                                </div>
                                                <div>
                                                    <p className="text-white font-bold text-lg">No Reservations Found</p>
                                                    <p className="text-white/40 text-[13px] mt-1.5 font-medium">Please do any booking to see your history here.</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {bookings.map((booking) => (
                                                    <motion.div
                                                        key={booking._id}
                                                        whileHover={{ y: -2 }}
                                                        className="p-6 rounded-2xl border border-white/10 bg-white/3 hover:bg-white/5 transition-all"
                                                    >
                                                        <div className="flex items-start justify-between mb-4">
                                                            <div className="w-10 h-10 rounded-xl bg-[#E03546]/10 border border-[#E03546]/20 flex items-center justify-center">
                                                                <Utensils size={16} className="text-[#E03546]" />
                                                            </div>
                                                            <span className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${BOOKING_STATUS_COLORS[booking.status] || "bg-white/10 text-white/40 border-white/10"}`}>
                                                                {booking.status}
                                                            </span>
                                                        </div>

                                                        <h3 className="font-black text-white text-base">{booking.bookingId}</h3>
                                                        <p className="text-white/50 text-xs mt-1">{booking.customerName} · {booking.customerPhone}</p>

                                                        <div className="mt-4 space-y-2.5">
                                                            <div className="flex items-center gap-2.5 text-[11px]">
                                                                <Calendar size={12} className="text-[#E03546] shrink-0" />
                                                                <span className="text-white/60">
                                                                    {booking.date ? new Date(booking.date).toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }) : '—'}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-2.5 text-[11px]">
                                                                <Clock size={12} className="text-[#E03546] shrink-0" />
                                                                <span className="text-white/60">{booking.timeSlot}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2.5 text-[11px]">
                                                                <User size={12} className="text-[#E03546] shrink-0" />
                                                                <span className="text-white/60">{booking.guests} {booking.guests === 1 ? 'Guest' : 'Guests'}</span>
                                                            </div>
                                                        </div>

                                                        {booking.feeAmount > 0 && (
                                                            <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                                                                <span className="text-[10px] text-white/30 font-bold uppercase tracking-widest">Booking Fee</span>
                                                                <span className="text-sm font-black text-emerald-400">₹{booking.feeAmount} Paid</span>
                                                            </div>
                                                        )}
                                                    </motion.div>
                                                ))}
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </main>

                <ReviewModal 
                    isOpen={!!reviewOrder} 
                    order={reviewOrder} 
                    onClose={() => setReviewOrder(null)} 
                    onSubmit={handleReviewSubmit} 
                />

            <Footer />
        </div>
    );
}

export default function UserProfilePage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
            </div>
        }>
            <UserProfileContent />
        </Suspense>
    );
}
