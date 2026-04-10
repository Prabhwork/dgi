"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ParticleNetwork from "@/components/ParticleNetwork";
import { useTheme } from "@/components/ThemeProvider";
import { motion, AnimatePresence } from "framer-motion";
import {
    User, Building2, MapPin, Phone, Mail, Globe, Clock, Camera, Upload, Save,
    CheckCircle2, AlertCircle, Loader2, Tag, Image as ImageIcon, FileText,
    Shield, BadgeCheck, Edit3, ChevronDown, X, Plus, Briefcase, Package,
    Search, Utensils, ExternalLink, ShoppingBag, Calendar, Heart, Star, ChevronRight,
    PackageIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const BASE_URL = (API_URL || '').replace('/api', '');

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'None'];

const STATUS_COLORS: Record<string, string> = {
    'Pending': 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    'Confirmed': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    'Preparing': 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    'Ready': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    'Completed': 'bg-white/10 text-white/40 border-white/10',
    'Cancelled': 'bg-red-500/10 text-red-500 border-red-500/20'
};

const BOOKING_STATUS_COLORS: Record<string, string> = {
    'Confirmed': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    'Pending': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    'Cancelled': 'bg-red-500/10 text-red-400 border-red-500/20',
    'Completed': 'bg-white/10 text-white/40 border-white/10'
};

function ImagePreview({ src, alt, className }: { src: string; alt: string; className?: string }) {
    const [error, setError] = useState(false);
    if (!src || error) return (
        <div className={`bg-white/10 border border-white/10 rounded-xl flex items-center justify-center text-muted-foreground text-xs ${className}`}>
            No image
        </div>
    );
    return <img src={src} alt={alt} className={`object-cover rounded-xl ${className}`} onError={() => setError(true)} />;
}

export default function ProfilePage() {
    const { theme } = useTheme();
    const router = useRouter();
    const isLight = theme === 'light';

    const [business, setBusiness] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");
    const [activeTab, setActiveTab] = useState("basic");
    const [categories, setCategories] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isCatOpen, setIsCatOpen] = useState(false);
    const catRef = useRef<HTMLDivElement>(null);

    const isFoodRelatedLocal = (cat: string) => {
        if (!cat) return false;
        const keywords = ['Restaurant', 'Cafe', 'Dining', 'Food', 'Bakery', 'Bar', 'Grill', 'Bistro', 'Kitchen', 'Hotel', 'Resort', 'Sweets', 'Snacks', 'Pizzeria', 'Steakhouse', 'Caterer', 'Diner', 'Canteen', 'Dhabba'];
        const lower = cat.toLowerCase();
        return keywords.some(k => lower.includes(k.toLowerCase()));
    };

    // Form fields
    const [form, setForm] = useState({
        businessName: '',
        brandName: '',
        businessCategory: '',
        description: '',
        keywords: '',
        registeredOfficeAddress: '',
        primaryContactNumber: '',
        officialWhatsAppNumber: '',
        officialEmailAddress: '',
        website: '',
        businessHours: {
            monday: { isOpen: true, slots: [{ open: "09:00", close: "18:00" }] },
            tuesday: { isOpen: true, slots: [{ open: "09:00", close: "18:00" }] },
            wednesday: { isOpen: true, slots: [{ open: "09:00", close: "18:00" }] },
            thursday: { isOpen: true, slots: [{ open: "09:00", close: "18:00" }] },
            friday: { isOpen: true, slots: [{ open: "09:00", close: "18:00" }] },
            saturday: { isOpen: true, slots: [{ open: "09:00", close: "18:00" }] },
            sunday: { isOpen: false, slots: [{ open: "09:00", close: "18:00" }] },
        },
        joinBulkBuying: false,
        joinFraudAlerts: false,
    });

    // Services & Products State
    const [services, setServices] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);

    // NEW: Orders & Bookings State
    const [orders, setOrders] = useState<any[]>([]);
    const [bookings, setBookings] = useState<any[]>([]);
    const [ordersLoading, setOrdersLoading] = useState(false);
    const [bookingsLoading, setBookingsLoading] = useState(false);
    const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

    const copyToAllHours = (sourceDay: string) => {
        const sourceData = form.businessHours[sourceDay as keyof typeof form.businessHours];
        setForm(prev => {
            const newHours = { ...prev.businessHours };
            Object.keys(newHours).forEach(day => {
                if (day !== sourceDay && newHours[day as keyof typeof newHours].isOpen) {
                    newHours[day as keyof typeof newHours] = {
                        ...newHours[day as keyof typeof newHours],
                        slots: JSON.parse(JSON.stringify(sourceData.slots))
                    };
                }
            });
            return { ...prev, businessHours: newHours };
        });
    };

    const handleToggleDay = (day: string) => {
        setForm(prev => ({
            ...prev,
            businessHours: {
                ...prev.businessHours,
                [day]: { ...prev.businessHours[day as keyof typeof prev.businessHours], isOpen: !prev.businessHours[day as keyof typeof prev.businessHours].isOpen }
            }
        }));
    };

    const handleSlotChange = (day: string, index: number, field: 'open' | 'close', value: string) => {
        const newSlots = [...form.businessHours[day as keyof typeof form.businessHours].slots];
        newSlots[index] = { ...newSlots[index], [field]: value };
        setForm(prev => ({
            ...prev,
            businessHours: {
                ...prev.businessHours,
                [day]: { ...prev.businessHours[day as keyof typeof prev.businessHours], slots: newSlots }
            }
        }));
    };

    const addSlot = (day: string) => {
        setForm(prev => ({
            ...prev,
            businessHours: {
                ...prev.businessHours,
                [day]: {
                    ...prev.businessHours[day as keyof typeof prev.businessHours],
                    slots: [...prev.businessHours[day as keyof typeof prev.businessHours].slots, { open: "09:00", close: "18:00" }]
                }
            }
        }));
    };

    const removeSlot = (day: string, index: number) => {
        const currentSlots = form.businessHours[day as keyof typeof form.businessHours].slots;
        if (currentSlots.length <= 1) return;
        setForm(prev => ({
            ...prev,
            businessHours: {
                ...prev.businessHours,
                [day]: {
                    ...prev.businessHours[day as keyof typeof prev.businessHours],
                    slots: currentSlots.filter((_, i) => i !== index)
                }
            }
        }));
    };

    const fetchBusinessOrders = async () => {
        const token = localStorage.getItem('businessToken');
        if (!token) return;
        setOrdersLoading(true);
        try {
            // Using the food dashboard API specifically for real-time orders
            const res = await fetch(`${process.env.NEXT_PUBLIC_FOOD_API_URL}/orders`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                // Filter for relevant business if needed, but endpoint protected by protectPartner usually returns own orders
                setOrders(data.data.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
            }
        } catch (err) {
            console.error("Error fetching business orders:", err);
        } finally {
            setOrdersLoading(false);
        }
    };

    const fetchBusinessBookings = async () => {
        const token = localStorage.getItem('businessToken');
        if (!token) return;
        setBookingsLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_FOOD_API_URL}/dineout/reservations`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setBookings(data.data.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()));
            }
        } catch (err) {
            console.error("Error fetching business bookings:", err);
        } finally {
            setBookingsLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'orders') fetchBusinessOrders();
        if (activeTab === 'bookings') fetchBusinessBookings();
    }, [activeTab]);

    // File states
    const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
    const [coverImagePreview, setCoverImagePreview] = useState<string>('');
    const [bannerImageFile, setBannerImageFile] = useState<File | null>(null);
    const [bannerImagePreview, setBannerImagePreview] = useState<string>('');
    const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
    const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
    const [existingGallery, setExistingGallery] = useState<string[]>([]);
    const [catalogFile, setCatalogFile] = useState<File | null>(null);
    const [aadhaarFile, setAadhaarFile] = useState<File | null>(null);
    const [panFile, setPanFile] = useState<File | null>(null);
    const [estabFile, setEstabFile] = useState<File | null>(null);

    const headerCoverRef = useRef<HTMLInputElement>(null);
    const coverRef = useRef<HTMLInputElement>(null);
    const bannerRef = useRef<HTMLInputElement>(null);
    const galleryRef = useRef<HTMLInputElement>(null);
    const catalogRef = useRef<HTMLInputElement>(null);
    const aadhaarRef = useRef<HTMLInputElement>(null);
    const panRef = useRef<HTMLInputElement>(null);
    const estabRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetch(`${API_URL}/google-categories`)
            .then(r => r.json())
            .then(data => {
                if (data.success) {
                    setCategories(data.data.map((c: any) => c.name));
                }
            })
            .catch(err => console.error("Error fetching categories:", err));
    }, []);

    useEffect(() => {
        const token = localStorage.getItem('businessToken');
        if (!token) { router.push('/community/login'); return; }
        fetch(`${API_URL}/business/me`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(r => r.json())
            .then(data => {
                if (data.success) {
                    const b = data.data;
                    setBusiness(b);
                    
                    const defaultHours = {
                        monday: { isOpen: true, slots: [{ open: "09:00", close: "18:00" }] },
                        tuesday: { isOpen: true, slots: [{ open: "09:00", close: "18:00" }] },
                        wednesday: { isOpen: true, slots: [{ open: "09:00", close: "18:00" }] },
                        thursday: { isOpen: true, slots: [{ open: "09:00", close: "18:00" }] },
                        friday: { isOpen: true, slots: [{ open: "09:00", close: "18:00" }] },
                        saturday: { isOpen: true, slots: [{ open: "09:00", close: "18:00" }] },
                        sunday: { isOpen: false, slots: [{ open: "09:00", close: "18:00" }] },
                    };

                    let businessHours = b.businessHours || defaultHours;
                    
                    // If it is a string (legacy/saved as string), parse it
                    if (typeof businessHours === 'string') {
                        try {
                            businessHours = JSON.parse(businessHours);
                        } catch (e) {
                            businessHours = defaultHours;
                        }
                    }

                    // Ensure all days have slots to avoid empty display
                    const finalHours = { ...defaultHours, ...businessHours };
                    Object.keys(finalHours).forEach(day => {
                        if (!finalHours[day as keyof typeof finalHours].slots || finalHours[day as keyof typeof finalHours].slots.length === 0) {
                            finalHours[day as keyof typeof finalHours].slots = [{ open: "09:00", close: "18:00" }];
                        }
                    });

                    // Support legacy data migration (if businessHours was missing but openingTime existed)
                    if (!b.businessHours && (b.openingTime || b.closingTime)) {
                        const opens = (b.openingTime || "09:00").split(",");
                        const closes = (b.closingTime || "18:00").split(",");
                        const slots = opens.map((o: string, i: number) => ({ open: o || "09:00", close: closes[i] || "18:00" }));
                        
                        Object.keys(finalHours).forEach(day => {
                            finalHours[day as keyof typeof finalHours].slots = JSON.parse(JSON.stringify(slots));
                            if (b.weeklyOff && b.weeklyOff.toLowerCase() === day) {
                                finalHours[day as keyof typeof finalHours].isOpen = false;
                            }
                        });
                    }
                    businessHours = finalHours;

                    setForm({
                        businessName: b.businessName || '',
                        brandName: b.brandName || '',
                        businessCategory: b.businessCategory || '',
                        description: b.description || '',
                        keywords: Array.isArray(b.keywords) ? b.keywords.join(', ') : b.keywords || '',
                        registeredOfficeAddress: b.registeredOfficeAddress || '',
                        primaryContactNumber: b.primaryContactNumber || '',
                        officialWhatsAppNumber: b.officialWhatsAppNumber || '',
                        officialEmailAddress: b.officialEmailAddress || '',
                        website: b.website || '',
                        businessHours: businessHours,
                        joinBulkBuying: b.joinBulkBuying || false,
                        joinFraudAlerts: b.joinFraudAlerts || false,
                    });

                    if (b.coverImage) setCoverImagePreview(`${BASE_URL}/${b.coverImage}`);
                    if (b.bannerImage) setBannerImagePreview(`${BASE_URL}/${b.bannerImage}`);
                    if (b.gallery && b.gallery.length) {
                        setExistingGallery(b.gallery);
                    }

                    if (b.services) {
                        setServices(b.services.map((s: any) => ({ ...s, imagePreview: s.image ? `${BASE_URL}/${s.image}` : '' })));
                    } else {
                        setServices([]);
                    }

                    if (b.products) {
                        setProducts(b.products.map((p: any) => ({ ...p, imagePreview: p.image ? `${BASE_URL}/${p.image}` : '' })));
                    } else {
                        setProducts([]);
                    }
                } else {
                    router.push('/community/login');
                }
            })
            .catch(() => router.push('/community/login'))
            .finally(() => setLoading(false));

        const handleClickOutside = (e: MouseEvent) => {
            if (catRef.current && !catRef.current.contains(e.target as Node)) {
                setIsCatOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // NEW: Server-side search for categories (Merged Main + Google)
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            const query = `search=${searchTerm}&limit=5000&sort=name`;
            
            Promise.all([
                fetch(`${API_URL}/main-categories?${query}`).then(r => r.json()),
                fetch(`${API_URL}/google-categories?${query}`).then(r => r.json())
            ])
            .then(([resMain, resGoogle]) => {
                let combined: string[] = [];
                if (resMain.success) combined.push(...resMain.data.map((c: any) => c.name));
                if (resGoogle.success) combined.push(...resGoogle.data.map((c: any) => c.name));
                
                // Remove duplicates and sort
                const unique = Array.from(new Set(combined)).sort();
                setCategories(unique);
            })
            .catch(err => console.error("Error searching categories:", err));
        }, 300); // 300ms debounce
        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    const filteredCategories = categories; // Now filtered by server

    const handleFileChange = (file: File | null, setter: any, previewSetter?: any) => {
        setter(file);
        if (file && previewSetter) {
            const reader = new FileReader();
            reader.onload = e => previewSetter(e.target?.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleGalleryChange = (files: FileList | null) => {
        if (!files) return;
        const arr = Array.from(files);
        
        // Prevent exceeding limit
        const totalCount = existingGallery.length + galleryFiles.length + arr.length;
        if (totalCount > 10) {
            setError("You can only upload up to 10 photos total in the gallery.");
            return;
        }

        const newFiles = [...galleryFiles, ...arr];
        setGalleryFiles(newFiles);

        const newPreviews: string[] = [...galleryPreviews];
        let loadedCount = 0;
        
        arr.forEach(f => {
            const reader = new FileReader();
            reader.onload = e => {
                newPreviews.push(e.target?.result as string);
                loadedCount++;
                if (loadedCount === arr.length) {
                    setGalleryPreviews(newPreviews);
                }
            };
            reader.readAsDataURL(f);
        });
    };

    const removeGalleryImage = (index: number) => {
        // Index is in combined view: [existingGallery, galleryPreviews]
        if (index < existingGallery.length) {
            setExistingGallery(prev => prev.filter((_, i) => i !== index));
        } else {
            const adjustedIndex = index - existingGallery.length;
            setGalleryFiles(prev => prev.filter((_, i) => i !== adjustedIndex));
            setGalleryPreviews(prev => prev.filter((_, i) => i !== adjustedIndex));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setSuccess("");
        setError("");

        const token = localStorage.getItem('businessToken');
        const fd = new FormData();

        Object.entries(form).forEach(([k, v]) => {
            if (k === 'businessHours') {
                fd.append(k, JSON.stringify(v));
            } else {
                fd.append(k, String(v));
            }
        });
        if (coverImageFile) fd.append('coverImage', coverImageFile);
        if (bannerImageFile) fd.append('bannerImage', bannerImageFile);
        
        // Send existing gallery paths to keep
        fd.append('existingGallery', JSON.stringify(existingGallery));
        
        // Append new files
        galleryFiles.forEach(f => fd.append('gallery', f));
        if (catalogFile) fd.append('catalog', catalogFile);
        if (aadhaarFile) fd.append('aadhaarCard', aadhaarFile);
        if (panFile) fd.append('ownerIdentityProof', panFile);
        if (estabFile) fd.append('establishmentProof', estabFile);

        let serviceFileIndex = 0;
        const mappedServices = services.map(s => {
            let imageStr = s.imagePreview ? s.imagePreview.replace(`${BASE_URL}/`, '') : '';
            if (s.imageFile) {
                fd.append('serviceImages', s.imageFile);
                imageStr = `new_file_${serviceFileIndex}`;
                serviceFileIndex++;
            }
            return { name: s.name, description: s.description, price: s.price, image: imageStr };
        });
        fd.append('servicesData', JSON.stringify(mappedServices));

        let productFileIndex = 0;
        const mappedProducts = products.map(p => {
            let imageStr = p.imagePreview ? p.imagePreview.replace(`${BASE_URL}/`, '') : '';
            if (p.imageFile) {
                fd.append('productImages', p.imageFile);
                imageStr = `new_file_${productFileIndex}`;
                productFileIndex++;
            }
            return { name: p.name, description: p.description, price: p.price, image: imageStr };
        });
        fd.append('productsData', JSON.stringify(mappedProducts));

        try {
            const res = await fetch(`${API_URL}/business/update-details`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${token}` },
                body: fd,
            });
            const data = await res.json();
            if (data.success) {
                const isApproved = data.data?.approvalStatus === 'approved';
                setSuccess(isApproved
                    ? "✅ Profile updated successfully! Your listing stays live. Our team has been notified of the changes."
                    : "✅ Profile updated! It will be reviewed by our team within 24–48 hours."
                );
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                setError(data.error || "Failed to update profile.");
            }
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    const tabs = [
        { id: 'basic', label: 'Basic Info', icon: Building2 },
        { id: 'contact', label: 'Contact', icon: Phone },
        { id: 'hours', label: 'Hours & Status', icon: Clock },
        { id: 'media', label: 'Photos & Media', icon: ImageIcon },
        ...(isFoodRelatedLocal(form.businessCategory) ? [
            { id: 'orders', label: 'Incoming Orders', icon: ShoppingBag },
            { id: 'bookings', label: 'Dine-in Bookings', icon: Calendar }
        ] : [])
    ];

    const cardClass = isLight
        ? 'bg-white/80 border-slate-200 shadow-sm'
        : 'bg-white/5 border-white/10';

    const inputClass = isLight
        ? 'bg-white border-slate-300 text-slate-900 focus:border-primary'
        : 'bg-white/5 border-white/10 text-white focus:border-primary/50 [&::-webkit-calendar-picker-indicator]:brightness-0 [&::-webkit-calendar-picker-indicator]:invert';

    if (loading) return (
        <div className="min-h-screen bg-[#020631] flex items-center justify-center">
            <Loader2 size={48} className="text-primary animate-spin" />
        </div>
    );

    return (
        <div className={`min-h-screen relative overflow-hidden transition-colors ${isLight ? 'bg-slate-50' : 'bg-[#020631]'}`}>
            <div className="fixed inset-0 z-0"><ParticleNetwork /></div>

            <div className="relative z-10 flex flex-col min-h-screen">
                <Navbar />

                <main className="container mx-auto px-4 pt-32 pb-20">
                    {/* Header */}
                    <div className="mb-8">
                        <div className={`relative rounded-3xl overflow-hidden border p-8 ${cardClass} backdrop-blur-xl`}>
                            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                                {/* Top row on mobile: photo + member since */}
                                <div className="flex flex-row items-start justify-between w-full md:w-auto md:justify-start md:gap-0">
                                    {/* Cover Image / Avatar */}
                                    <div className="relative shrink-0">
                                        <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-primary/30">
                                            {coverImagePreview
                                                ? <img src={coverImagePreview} className="w-full h-full object-cover" alt="cover" />
                                                : <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                                                    <Building2 size={36} className="text-primary/50" />
                                                </div>
                                            }
                                        </div>
                                        <button
                                            onClick={() => headerCoverRef.current?.click()}
                                            className="absolute -bottom-2 -right-2 bg-primary text-white p-1.5 rounded-lg shadow-lg hover:bg-primary/80 transition"
                                        >
                                            <Camera size={14} />
                                        </button>
                                        <input ref={headerCoverRef} type="file" accept="image/*" className="hidden"
                                            onChange={e => handleFileChange(e.target.files?.[0] || null, setCoverImageFile, setCoverImagePreview)} />
                                    </div>

                                    {/* Member since — visible only on mobile, right of photo */}
                                    <div className="text-right md:hidden">
                                        <p className="text-xs text-muted-foreground">Member since</p>
                                        <p className="text-sm font-medium text-foreground">
                                            {business?.createdAt ? new Date(business.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short' }) : '—'}
                                        </p>
                                    </div>
                                </div>

                                {/* Names & Status */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 flex-wrap mb-1">
                                        <h1 className="text-2xl font-bold text-foreground">{business?.businessName}</h1>
                                        {business?.isVerified && (
                                            <span className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                                                <BadgeCheck size={12} /> Verified
                                            </span>
                                        )}
                                        <span className={`text-xs px-2 py-0.5 rounded-full border ${
                                            business?.approvalStatus === 'approved'
                                                ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                                                : business?.approvalStatus === 'pending'
                                                ? 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20'
                                                : 'text-red-400 bg-red-500/10 border-red-500/20'
                                        }`}>
                                            {business?.approvalStatus || 'pending'}
                                        </span>
                                    </div>
                                    <p className="text-muted-foreground text-sm">{business?.registeredOfficeAddress}</p>
                                </div>

                                {/* Member since — desktop only (far right) */}
                                <div className="text-right shrink-0 hidden md:block">
                                    <p className="text-xs text-muted-foreground">Member since</p>
                                    <p className="text-sm font-medium text-foreground">
                                        {business?.createdAt ? new Date(business.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short' }) : '—'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Success / Error banners */}
                    {success && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                            className="mb-6 flex items-start gap-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-3 rounded-2xl">
                            <CheckCircle2 size={20} className="shrink-0 mt-0.5" />
                            <p className="text-sm">{success}</p>
                        </motion.div>
                    )}
                    {error && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                            className="mb-6 flex items-start gap-3 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-2xl">
                            <AlertCircle size={20} className="shrink-0 mt-0.5" />
                            <p className="text-sm">{error}</p>
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="flex flex-col lg:flex-row gap-6">
                            {/* Sidebar tabs */}
                            <div className="lg:w-56 shrink-0">
                                <div className={`rounded-2xl border p-2 backdrop-blur-xl ${cardClass}`}>
                                    {tabs.map(t => (
                                        <button key={t.id} type="button"
                                            onClick={() => setActiveTab(t.id)}
                                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                                                activeTab === t.id
                                                    ? 'bg-primary text-white shadow-md'
                                                    : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                                            }`}>
                                            <t.icon size={16} />
                                            {t.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Content panel */}
                            <div className="flex-1 min-w-0">
                                <div className={`rounded-2xl border p-6 md:p-8 backdrop-blur-xl ${cardClass}`}>

                                    {/* ─── Basic Info ─── */}
                                    {activeTab === 'basic' && (
                                        <div className="space-y-6">
                                            <h2 className="text-lg font-bold text-foreground flex items-center gap-2"><Building2 size={18} />Basic Information</h2>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-muted-foreground mb-1.5">Business Name *</label>
                                                    <Input value={form.businessName} onChange={e => setForm({ ...form, businessName: e.target.value })} className={inputClass} required />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-muted-foreground mb-1.5">Brand Name</label>
                                                    <Input value={form.brandName} onChange={e => setForm({ ...form, brandName: e.target.value })} className={inputClass} />
                                                </div>
                                                <div className="relative" ref={catRef}>
                                                    <label className="block text-sm font-medium text-muted-foreground mb-1.5">Category *</label>
                                                    <div 
                                                        onClick={() => setIsCatOpen(!isCatOpen)}
                                                        className={`w-full rounded-lg border px-3 py-2 text-sm transition-colors cursor-pointer flex items-center justify-between ${inputClass}`}
                                                    >
                                                        <span className={form.businessCategory ? 'text-foreground' : 'text-muted-foreground'}>
                                                            {form.businessCategory || 'Select category'}
                                                        </span>
                                                        <ChevronDown size={14} className={`transition-transform ${isCatOpen ? 'rotate-180' : ''}`} />
                                                    </div>

                                                    {isCatOpen && (
                                                        <div className={`absolute z-[100] mt-2 w-full rounded-xl border shadow-2xl backdrop-blur-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-white/10'}`}>
                                                            <div className="p-2 border-b border-white/5">
                                                                <div className="relative">
                                                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
                                                                    <input 
                                                                        type="text"
                                                                        autoFocus
                                                                        placeholder="Search categories..."
                                                                        value={searchTerm}
                                                                        onChange={(e) => setSearchTerm(e.target.value)}
                                                                        className={`w-full bg-white/5 border-none rounded-lg py-2 pl-9 pr-4 text-xs focus:ring-1 focus:ring-primary outline-none ${isLight ? 'text-slate-900' : 'text-white'}`}
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="max-h-60 overflow-y-auto custom-scrollbar">
                                                                {filteredCategories.length > 0 ? (
                                                                    filteredCategories.map(c => (
                                                                        <div 
                                                                            key={c}
                                                                            onClick={() => {
                                                                                setForm({ ...form, businessCategory: c });
                                                                                setIsCatOpen(false);
                                                                                setSearchTerm("");
                                                                            }}
                                                                            className={`px-4 py-2.5 text-sm cursor-pointer transition-colors flex items-center justify-between group ${
                                                                                form.businessCategory === c 
                                                                                    ? 'bg-primary text-white' 
                                                                                    : 'hover:bg-primary/10'
                                                                            }`}
                                                                        >
                                                                            {c}
                                                                            {form.businessCategory === c && <CheckCircle2 size={14} />}
                                                                        </div>
                                                                    ))
                                                                ) : (
                                                                    <div className="px-4 py-8 text-center text-xs text-muted-foreground">
                                                                        No categories found
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-muted-foreground mb-1.5">Website</label>
                                                    <Input value={form.website} onChange={e => setForm({ ...form, website: e.target.value })} className={inputClass} placeholder="example.com" />
                                                </div>
                                            </div>

                                            {/* Restaurant SSO Link */}
                                            {isFoodRelatedLocal(form.businessCategory) && (
                                                <motion.div 
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    className="p-4 rounded-xl bg-primary/10 border border-primary/20 flex flex-col md:flex-row items-center justify-between gap-4 mt-2"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                                                            <Utensils size={20} />
                                                        </div>
                                                        <div>
                                                            <h4 className="text-sm font-bold text-foreground">Restaurant Dashboard Ready</h4>
                                                            <p className="text-xs text-muted-foreground line-clamp-1">Manage your menu, bookings, and dine-in settings instantly.</p>
                                                        </div>
                                                    </div>
                                                    <a 
                                                        href={`${process.env.NEXT_PUBLIC_FOOD_DASHBOARD_URL}/?sso_token=${typeof window !== 'undefined' ? localStorage.getItem('businessToken') : ''}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg shadow-lg hover:scale-105 transition-transform"
                                                    >
                                                        Go to Food Dashboard <ExternalLink size={14} />
                                                    </a>
                                                </motion.div>
                                            )}
                                            <div>
                                                <label className="block text-sm font-medium text-muted-foreground mb-1.5">Description</label>
                                                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={4}
                                                    className={`w-full rounded-lg border px-3 py-2 text-sm resize-none transition-colors ${inputClass}`}
                                                    placeholder="Tell customers about your business..." />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-muted-foreground mb-1.5">Keywords <span className="text-xs opacity-60">(comma separated)</span></label>
                                                <Input value={form.keywords} onChange={e => setForm({ ...form, keywords: e.target.value })} className={inputClass} placeholder="e.g. IT services, software, web design" />
                                            </div>
                                        </div>
                                    )}

                                    {/* ─── Contact ─── */}
                                    {activeTab === 'contact' && (
                                        <div className="space-y-6">
                                            <h2 className="text-lg font-bold text-foreground flex items-center gap-2"><Phone size={18} />Contact Details</h2>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-muted-foreground mb-1.5">Primary Contact *</label>
                                                    <Input value={form.primaryContactNumber} onChange={e => setForm({ ...form, primaryContactNumber: e.target.value })} className={inputClass} required />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-muted-foreground mb-1.5">WhatsApp Number</label>
                                                    <Input value={form.officialWhatsAppNumber} onChange={e => setForm({ ...form, officialWhatsAppNumber: e.target.value })} className={inputClass} />
                                                </div>
                                                <div className="md:col-span-2">
                                                    <label className="block text-sm font-medium text-muted-foreground mb-1.5">Official Email *</label>
                                                    <Input value={form.officialEmailAddress} type="email" onChange={e => setForm({ ...form, officialEmailAddress: e.target.value })} className={inputClass} required />
                                                </div>
                                                <div className="md:col-span-2">
                                                    <label className="block text-sm font-medium text-muted-foreground mb-1.5">Registered Office Address *</label>
                                                    <textarea value={form.registeredOfficeAddress} onChange={e => setForm({ ...form, registeredOfficeAddress: e.target.value })} rows={3}
                                                        className={`w-full rounded-lg border px-3 py-2 text-sm resize-none transition-colors ${inputClass}`}
                                                        required placeholder="Full business address..." />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* ─── Hours ─── */}
                                    {activeTab === 'hours' && (
                                        <div className="space-y-6">
                                            <div className="flex items-center justify-between">
                                                <h2 className="text-lg font-bold text-foreground flex items-center gap-2"><Clock size={18} />Business Hours</h2>
                                            </div>
                                            
                                            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar pb-4">
                                                {Object.entries(form.businessHours).map(([day, data]) => (
                                                    <div key={day} className={`p-4 rounded-xl border transition-all ${data.isOpen ? (isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/10') : (isLight ? 'bg-slate-100 border-slate-200 opacity-60' : 'bg-black/20 border-white/5 opacity-40')}`}>
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-3">
                                                                <div className={`w-1.5 h-1.5 rounded-full ${data.isOpen ? 'bg-primary' : (isLight ? 'bg-slate-300' : 'bg-white/10')}`} />
                                                                <Label className={`text-sm font-bold capitalize ${data.isOpen ? 'text-foreground' : 'text-muted-foreground'}`}>{day}</Label>
                                                            </div>
                                                            <div className="flex items-center gap-4">
                                                                {data.isOpen && (
                                                                    <button 
                                                                        type="button" 
                                                                        onClick={() => copyToAllHours(day)}
                                                                        className="text-[10px] uppercase tracking-widest font-bold text-primary/60 hover:text-primary transition-colors flex items-center gap-1"
                                                                    >
                                                                        <Plus size={10} /> Copy to all
                                                                    </button>
                                                                )}
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">
                                                                        {data.isOpen ? 'Open' : 'Closed'}
                                                                    </span>
                                                                    <Switch 
                                                                        checked={data.isOpen} 
                                                                        onCheckedChange={() => handleToggleDay(day)}
                                                                        className="scale-75 data-[state=checked]:bg-primary"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {data.isOpen && (
                                                            <div className="mt-4 pt-4 border-t border-white/5 space-y-3">
                                                                {data.slots.map((slot, idx) => (
                                                                    <div key={idx} className="flex items-center gap-2">
                                                                        <div className="flex-1 grid grid-cols-2 gap-2">
                                                                            <Input 
                                                                                type="time" 
                                                                                value={slot.open} 
                                                                                onChange={(e) => handleSlotChange(day, idx, 'open', e.target.value)}
                                                                                className={inputClass}
                                                                                style={{ colorScheme: isLight ? 'light' : 'dark' }}
                                                                            />
                                                                            <Input 
                                                                                type="time" 
                                                                                value={slot.close} 
                                                                                onChange={(e) => handleSlotChange(day, idx, 'close', e.target.value)}
                                                                                className={inputClass}
                                                                                style={{ colorScheme: isLight ? 'light' : 'dark' }}
                                                                            />
                                                                        </div>
                                                                        {data.slots.length > 1 && (
                                                                            <button 
                                                                                type="button" 
                                                                                onClick={() => removeSlot(day, idx)}
                                                                                className="p-2 text-muted-foreground hover:text-red-400 transition-all"
                                                                            >
                                                                                <X size={14} />
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                                <button 
                                                                    type="button" 
                                                                    onClick={() => addSlot(day)}
                                                                    className="text-[10px] text-primary hover:text-primary/80 font-bold uppercase tracking-widest flex items-center gap-1 mt-1"
                                                                >
                                                                    <Plus size={12} /> Add Shift
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>

                                            <div className={`rounded-xl border p-4 ${isLight ? 'bg-blue-50 border-blue-200' : 'bg-blue-500/10 border-blue-500/20'}`}>
                                                <p className="text-sm text-muted-foreground">Tip: <span className="text-foreground">Use the "Copy to all" button to quickly apply timings to all other open days.</span></p>
                                            </div>
                                        </div>
                                    )}

                                    {/* ─── Media ─── */}
                                    {activeTab === 'media' && (
                                        <div className="space-y-6">
                                            <h2 className="text-lg font-bold text-foreground flex items-center gap-2"><ImageIcon size={18} />Photos & Media</h2>

                                            {/* Cover Photo */}
                                            <div>
                                                <label className="block text-sm font-medium text-muted-foreground mb-3">Cover Photo</label>
                                                <div className="flex items-start gap-4">
                                                    <ImagePreview src={coverImagePreview} alt="Cover" className="w-40 h-28" />
                                                    <button type="button" onClick={() => coverRef.current?.click()}
                                                        className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition ${isLight ? 'border-slate-300 hover:bg-slate-100 text-slate-700' : 'border-white/10 hover:bg-white/10 text-white'}`}>
                                                        <Upload size={16} /> {coverImagePreview ? 'Change Photo' : 'Upload Photo'}
                                                    </button>
                                                    <input ref={coverRef} type="file" accept="image/*" className="hidden"
                                                        onChange={e => handleFileChange(e.target.files?.[0] || null, setCoverImageFile, setCoverImagePreview)} />
                                                </div>
                                            </div>

                                            {/* Banner Photo */}
                                            <div>
                                                <label className="block text-sm font-medium text-muted-foreground mb-3">Banner Photo</label>
                                                <div className="flex flex-col sm:flex-row items-start gap-4">
                                                    <ImagePreview src={bannerImagePreview} alt="Banner" className="w-full sm:w-64 h-28" />
                                                    <div className="flex flex-col gap-2">
                                                        <button type="button" onClick={() => bannerRef.current?.click()}
                                                            className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition ${isLight ? 'border-slate-300 hover:bg-slate-100 text-slate-700' : 'border-white/10 hover:bg-white/10 text-white'}`}>
                                                            <Upload size={16} /> {bannerImagePreview ? 'Change Banner' : 'Upload Banner'}
                                                        </button>
                                                        <p className="text-xs text-muted-foreground">Optimal ratio: 3:1 or 4:1 (e.g. 1200x400).</p>
                                                    </div>
                                                    <input ref={bannerRef} type="file" accept="image/*" className="hidden"
                                                        onChange={e => handleFileChange(e.target.files?.[0] || null, setBannerImageFile, setBannerImagePreview)} />
                                                </div>
                                            </div>

                                            {/* Gallery */}
                                            <div>
                                                <div className="flex items-center justify-between mb-3">
                                                    <label className="block text-sm font-medium text-muted-foreground">Gallery <span className="text-xs opacity-60">(up to 10 photos)</span></label>
                                                    <span className="text-[10px] font-bold text-muted-foreground uppercase">{existingGallery.length + galleryPreviews.length} / 10</span>
                                                </div>
                                                <div className="flex flex-wrap gap-3 mb-3">
                                                    {/* Existing Images */}
                                                    {existingGallery.map((p, i) => (
                                                        <div key={`exist-${i}`} className="relative group overflow-hidden rounded-xl bg-white/5 border border-white/10">
                                                            <img src={`${BASE_URL}/${p}`} className="w-24 h-20 object-cover" alt={`gallery-exist-${i}`} />
                                                            <button 
                                                                type="button"
                                                                onClick={() => removeGalleryImage(i)}
                                                                className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                                                            >
                                                                <X size={12} />
                                                            </button>
                                                        </div>
                                                    ))}

                                                    {/* New Selection Previews */}
                                                    {galleryPreviews.map((p, i) => (
                                                        <div key={`new-${i}`} className="relative group overflow-hidden rounded-xl ring-2 ring-primary/30 shadow-lg shadow-primary/10">
                                                            <img src={p} className="w-24 h-20 object-cover" alt={`gallery-new-${i}`} />
                                                            <button 
                                                                type="button"
                                                                onClick={() => removeGalleryImage(existingGallery.length + i)}
                                                                className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity font-bold shadow-xl"
                                                            >
                                                                <X size={12} />
                                                            </button>
                                                            <div className="absolute inset-x-0 bottom-0 bg-primary/80 py-0.5 text-center">
                                                                <span className="text-[7px] font-bold text-white uppercase tracking-tighter">New Selection</span>
                                                            </div>
                                                        </div>
                                                    ))}

                                                    {(existingGallery.length + galleryPreviews.length) < 10 && (
                                                        <button 
                                                            type="button" 
                                                            onClick={() => {
                                                                if (galleryRef.current) {
                                                                    galleryRef.current.value = ""; 
                                                                    galleryRef.current.click();
                                                                }
                                                            }}
                                                            className={`w-24 h-20 flex flex-col items-center justify-center rounded-xl border-2 border-dashed text-muted-foreground transition hover:text-primary hover:border-primary ${isLight ? 'border-slate-300' : 'border-white/10'}`}
                                                        >
                                                            <Plus size={18} />
                                                            <span className="text-xs mt-1">Add</span>
                                                        </button>
                                                    )}
                                                    <input ref={galleryRef} type="file" accept="image/*" multiple className="hidden"
                                                        onChange={e => handleGalleryChange(e.target.files)} />
                                                </div>
                                                {galleryFiles.length > 0 && <p className="text-xs text-primary font-bold">{galleryFiles.length} new photos pending upload</p>}
                                            </div>

                                            {/* Catalog */}
                                            <div>
                                                <label className="block text-sm font-medium text-muted-foreground mb-3">Catalog / Menu / Pricing</label>
                                                <div className="flex items-center gap-4">
                                                    {business?.catalog && (
                                                        <a href={`${BASE_URL}/${business.catalog}`} target="_blank" rel="noopener noreferrer"
                                                            className="text-xs text-primary underline">View current catalog</a>
                                                    )}
                                                    <button type="button" onClick={() => catalogRef.current?.click()}
                                                        className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition ${isLight ? 'border-slate-300 hover:bg-slate-100 text-slate-700' : 'border-white/10 hover:bg-white/10 text-white'}`}>
                                                        <Upload size={16} /> {catalogFile ? catalogFile.name : 'Upload Catalog'}
                                                    </button>
                                                    <input ref={catalogRef} type="file" accept=".pdf,image/*" className="hidden"
                                                        onChange={e => setCatalogFile(e.target.files?.[0] || null)} />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <AnimatePresence mode="wait">
                                        {activeTab === 'orders' && (
                                            <motion.div 
                                                key="orders"
                                                initial={{ opacity: 0, y: 10 }} 
                                                animate={{ opacity: 1, y: 0 }} 
                                                exit={{ opacity: 0, y: -10 }}
                                                className="space-y-6"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <h2 className="text-xl font-bold flex items-center gap-3">
                                                        <ShoppingBag className="text-primary" /> Incoming Orders
                                                    </h2>
                                                    <div className="flex items-center gap-3">
                                                        <button 
                                                            onClick={fetchBusinessOrders}
                                                            className="text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-primary transition-colors"
                                                        >
                                                            Refresh Queue
                                                        </button>
                                                        <Button 
                                                            onClick={() => window.open(`${process.env.NEXT_PUBLIC_FOOD_DASHBOARD_URL}/?sso_token=${localStorage.getItem('businessToken')}`, '_blank')}
                                                            variant="outline"
                                                            className="rounded-xl border-primary/20 text-primary hover:bg-primary/5 text-xs font-bold"
                                                        >
                                                            Full Console <ExternalLink className="ml-2 w-3 h-3" />
                                                        </Button>
                                                    </div>
                                                </div>

                                                {ordersLoading ? (
                                                    <div className="flex flex-col items-center justify-center py-16 gap-4">
                                                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                                                        <p className="text-white/30 text-sm font-medium">Fetching real-time orders...</p>
                                                    </div>
                                                ) : orders.length === 0 ? (
                                                    <div className={`rounded-3xl p-12 text-center border ${isLight ? 'bg-white border-slate-200' : 'bg-white/5 border-white/10'}`}>
                                                        <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                                            <PackageIcon className="text-primary/50" size={40} />
                                                        </div>
                                                        <h3 className="text-lg font-bold text-foreground mb-2">Manage your sales here</h3>
                                                        <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-8">
                                                            Track incoming takeaway and dine-in orders from your customers in real-time.
                                                        </p>
                                                        <Button 
                                                            onClick={() => window.open(`${process.env.NEXT_PUBLIC_FOOD_DASHBOARD_URL}/?sso_token=${localStorage.getItem('businessToken')}`, '_blank')}
                                                            className="bg-primary hover:bg-primary/90 rounded-2xl px-10 h-14 font-bold uppercase tracking-widest text-xs shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95 text-white"
                                                        >
                                                            Open Live Order Queue
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-4">
                                                        {orders.map((order) => (
                                                            <motion.div
                                                                key={order._id}
                                                                layout
                                                                className={`border rounded-2xl overflow-hidden transition-colors ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/3 border-white/10 hover:bg-white/5'}`}
                                                            >
                                                                <button
                                                                    onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
                                                                    className="w-full flex items-center gap-4 p-5 text-left"
                                                                >
                                                                    <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                                                                        <Utensils size={18} className="text-primary" />
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <div className="flex items-center gap-2 flex-wrap">
                                                                            <p className="text-sm font-black text-foreground">{order.orderId || order.id}</p>
                                                                            <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${STATUS_COLORS[order.status] || "bg-white/10 text-white/40 border-white/10"}`}>
                                                                                {order.status}
                                                                            </span>
                                                                            <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border bg-white/5 text-muted-foreground border-white/10">
                                                                                {order.orderType}
                                                                            </span>
                                                                        </div>
                                                                        <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                                                                            {order.customerName} · {Array.isArray(order.items) ? order.items.map((it: any) => it.name).join(", ") : order.items}
                                                                        </p>
                                                                    </div>
                                                                    <div className="text-right shrink-0 ml-2">
                                                                        <p className="text-base font-black text-foreground">₹{order.totalAmount?.toFixed(2) || order.total?.toFixed(2)}</p>
                                                                        <p className="text-[9px] text-muted-foreground mt-0.5">
                                                                            {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '—'}
                                                                        </p>
                                                                    </div>
                                                                    <ChevronDown size={16} className={`text-muted-foreground shrink-0 transition-transform ml-2 ${expandedOrder === order._id ? 'rotate-180' : ''}`} />
                                                                </button>

                                                                <AnimatePresence>
                                                                    {expandedOrder === order._id && (
                                                                        <motion.div
                                                                            initial={{ height: 0, opacity: 0 }}
                                                                            animate={{ height: 'auto', opacity: 1 }}
                                                                            exit={{ height: 0, opacity: 0 }}
                                                                            className="overflow-hidden border-t border-white/5"
                                                                        >
                                                                            <div className="p-5 space-y-4">
                                                                                <div>
                                                                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">Items Ordered</p>
                                                                                    <div className="space-y-2">
                                                                                        {order.itemsArray?.map((item: any, i: number) => (
                                                                                            <div key={i} className="flex items-center justify-between">
                                                                                                <div className="flex items-center gap-2">
                                                                                                    <span className="w-5 h-5 rounded bg-primary/10 text-primary text-[10px] font-black flex items-center justify-center">
                                                                                                        {item.quantity}x
                                                                                                    </span>
                                                                                                    <span className="text-sm font-medium">{item.name}</span>
                                                                                                </div>
                                                                                                <span className="text-sm font-bold">₹{(item.price * item.quantity).toFixed(2)}</span>
                                                                                            </div>
                                                                                        ))}
                                                                                    </div>
                                                                                </div>
                                                                                <div className={`p-4 rounded-xl space-y-2 border ${isLight ? 'bg-white border-slate-200' : 'bg-white/5 border-white/5'}`}>
                                                                                    <div className="flex justify-between text-xs text-muted-foreground">
                                                                                        <span>Total Paid</span>
                                                                                        <span className="font-black text-foreground text-sm">₹{Number(order.totalAmount || order.total).toFixed(2)}</span>
                                                                                    </div>
                                                                                </div>
                                                                                <div className="flex items-center gap-3">
                                                                                    {order.tableNumber && (
                                                                                        <span className="text-[10px] font-bold px-3 py-1.5 rounded-full border bg-primary/5 text-primary border-primary/10">
                                                                                            Table #{order.tableNumber}
                                                                                        </span>
                                                                                    )}
                                                                                    <span className={`text-[10px] font-bold px-3 py-1.5 rounded-full border ${order.payment === 'Paid' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'}`}>
                                                                                        {order.payment === 'Paid' ? '✓ Paid Online' : 'Cash on Delivery'}
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                        </motion.div>
                                                                    )}
                                                                </AnimatePresence>
                                                            </motion.div>
                                                        ))}
                                                    </div>
                                                )}
                                            </motion.div>
                                        )}

                                        {activeTab === 'bookings' && (
                                            <motion.div 
                                                key="bookings"
                                                initial={{ opacity: 0, y: 10 }} 
                                                animate={{ opacity: 1, y: 0 }} 
                                                exit={{ opacity: 0, y: -10 }}
                                                className="space-y-6"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <h2 className="text-xl font-bold flex items-center gap-3">
                                                        <Calendar className="text-primary" /> Dine-in Bookings
                                                    </h2>
                                                    <div className="flex items-center gap-3">
                                                        <button 
                                                            onClick={fetchBusinessBookings}
                                                            className="text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-primary transition-colors"
                                                        >
                                                            Refresh
                                                        </button>
                                                        <Button 
                                                            onClick={() => window.open(`${process.env.NEXT_PUBLIC_FOOD_DASHBOARD_URL}/dineout`, '_blank')}
                                                            variant="outline"
                                                            className="rounded-xl border-primary/20 text-primary hover:bg-primary/5 text-xs font-bold"
                                                        >
                                                            Full Console <ExternalLink className="ml-2 w-3 h-3" />
                                                        </Button>
                                                    </div>
                                                </div>

                                                {bookingsLoading ? (
                                                    <div className="flex flex-col items-center justify-center py-16 gap-4">
                                                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                                                        <p className="text-white/30 text-sm font-medium">Loading reservations...</p>
                                                    </div>
                                                ) : bookings.length === 0 ? (
                                                    <div className={`rounded-3xl p-12 text-center border ${isLight ? 'bg-white border-slate-200' : 'bg-white/5 border-white/10'}`}>
                                                        <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                                            <Utensils className="text-primary/50" size={40} />
                                                        </div>
                                                        <h3 className="text-lg font-bold text-foreground mb-2">Reservation Center</h3>
                                                        <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-8">
                                                            Keep track of your table reservations and customer arrival times.
                                                        </p>
                                                        <Button 
                                                            onClick={() => window.open(`${process.env.NEXT_PUBLIC_FOOD_DASHBOARD_URL}/dineout`, '_blank')}
                                                            className="bg-primary hover:bg-primary/90 rounded-2xl px-10 h-14 font-bold uppercase tracking-widest text-xs shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95 text-white"
                                                        >
                                                            Open Booking System
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        {bookings.map((booking) => (
                                                            <motion.div
                                                                key={booking._id}
                                                                whileHover={{ y: -2 }}
                                                                className={`p-6 rounded-2xl border transition-all ${isLight ? 'bg-white border-slate-200' : 'bg-white/3 border-white/10 hover:bg-white/5'}`}
                                                            >
                                                                <div className="flex items-start justify-between mb-4">
                                                                    <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center font-black text-primary text-xs">
                                                                        ID
                                                                    </div>
                                                                    <span className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${BOOKING_STATUS_COLORS[booking.status] || "bg-white/10 text-white/40 border-white/10"}`}>
                                                                        {booking.status}
                                                                    </span>
                                                                </div>

                                                                <h3 className="font-black text-foreground text-base">{booking.bookingId || booking._id.slice(-6).toUpperCase()}</h3>
                                                                <p className="text-muted-foreground text-xs mt-1">{booking.customerName} · {booking.customerPhone}</p>

                                                                <div className="mt-4 space-y-2.5">
                                                                    <div className="flex items-center gap-2.5 text-[11px]">
                                                                        <Calendar size={12} className="text-primary shrink-0" />
                                                                        <span className="text-muted-foreground">
                                                                            {booking.date ? new Date(booking.date).toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'long' }) : '—'}
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex items-center gap-2.5 text-[11px]">
                                                                        <Clock size={12} className="text-primary shrink-0" />
                                                                        <span className="text-muted-foreground">{booking.timeSlot}</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-2.5 text-[11px]">
                                                                        <User size={12} className="text-primary shrink-0" />
                                                                        <span className="text-muted-foreground">{booking.guests} {booking.guests === 1 ? 'Guest' : 'Guests'}</span>
                                                                    </div>
                                                                </div>

                                                                {booking.feeAmount > 0 && (
                                                                    <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                                                                        <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Booking Fee</span>
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

                                    {/* Save Button */}
                                    <div className="mt-8 pt-6 border-t border-white/10 flex justify-end">
                                        <Button type="submit" disabled={saving}
                                            className="bg-primary hover:bg-primary/80 text-white px-8 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg">
                                            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                            {saving ? 'Saving...' : 'Save Changes'}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </main>

                <Footer />
            </div>
        </div>
    );
}
