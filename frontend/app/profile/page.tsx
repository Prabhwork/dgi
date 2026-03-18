"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ParticleNetwork from "@/components/ParticleNetwork";
import { useTheme } from "@/components/ThemeProvider";
import { motion } from "framer-motion";
import {
    User, Building2, MapPin, Phone, Mail, Globe, Clock, Camera, Upload, Save,
    CheckCircle2, AlertCircle, Loader2, Tag, Image as ImageIcon, FileText,
    Shield, BadgeCheck, Edit3, ChevronDown, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const BASE_URL = (API_URL || '').replace('/api', '');

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'None'];
const CATEGORIES = ['Tech', 'Retail', 'Food', 'Fashion', 'Automobile', 'Salon', 'Restaurant', 'Logistics', 'Health', 'Education', 'Finance', 'Real Estate', 'Other'];

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
        openingTime: '',
        closingTime: '',
        weeklyOff: 'None',
        joinBulkBuying: false,
        joinFraudAlerts: false,
    });

    // File states
    const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
    const [coverImagePreview, setCoverImagePreview] = useState<string>('');
    const [bannerImageFile, setBannerImageFile] = useState<File | null>(null);
    const [bannerImagePreview, setBannerImagePreview] = useState<string>('');
    const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
    const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
    const [catalogFile, setCatalogFile] = useState<File | null>(null);
    const [aadhaarFile, setAadhaarFile] = useState<File | null>(null);
    const [panFile, setPanFile] = useState<File | null>(null);
    const [estabFile, setEstabFile] = useState<File | null>(null);

    const coverRef = useRef<HTMLInputElement>(null);
    const bannerRef = useRef<HTMLInputElement>(null);
    const galleryRef = useRef<HTMLInputElement>(null);
    const catalogRef = useRef<HTMLInputElement>(null);
    const aadhaarRef = useRef<HTMLInputElement>(null);
    const panRef = useRef<HTMLInputElement>(null);
    const estabRef = useRef<HTMLInputElement>(null);

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
                        openingTime: b.openingTime || '',
                        closingTime: b.closingTime || '',
                        weeklyOff: b.weeklyOff || 'None',
                        joinBulkBuying: b.joinBulkBuying || false,
                        joinFraudAlerts: b.joinFraudAlerts || false,
                    });
                    if (b.coverImage) setCoverImagePreview(`${BASE_URL}/${b.coverImage}`);
                    if (b.bannerImage) setBannerImagePreview(`${BASE_URL}/${b.bannerImage}`);
                    if (b.gallery && b.gallery.length) setGalleryPreviews(b.gallery.map((g: string) => `${BASE_URL}/${g}`));
                } else {
                    router.push('/community/login');
                }
            })
            .catch(() => router.push('/community/login'))
            .finally(() => setLoading(false));
    }, []);

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
        setGalleryFiles(arr);
        const previews: string[] = [];
        arr.forEach(f => {
            const reader = new FileReader();
            reader.onload = e => {
                previews.push(e.target?.result as string);
                if (previews.length === arr.length) setGalleryPreviews(previews);
            };
            reader.readAsDataURL(f);
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setSuccess("");
        setError("");

        const token = localStorage.getItem('businessToken');
        const fd = new FormData();

        Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)));
        if (coverImageFile) fd.append('coverImage', coverImageFile);
        if (bannerImageFile) fd.append('bannerImage', bannerImageFile);
        galleryFiles.forEach(f => fd.append('gallery', f));
        if (catalogFile) fd.append('catalog', catalogFile);
        if (aadhaarFile) fd.append('aadhaarCard', aadhaarFile);
        if (panFile) fd.append('ownerIdentityProof', panFile);
        if (estabFile) fd.append('establishmentProof', estabFile);

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
        { id: 'documents', label: 'Documents', icon: FileText },
        { id: 'community', label: 'Community', icon: Shield },
    ];

    const cardClass = isLight
        ? 'bg-white/80 border-slate-200 shadow-sm'
        : 'bg-white/5 border-white/10';

    const inputClass = isLight
        ? 'bg-white border-slate-300 text-slate-900 focus:border-primary'
        : 'bg-white/5 border-white/10 text-white focus:border-primary/50 [color-scheme:dark] [&::-webkit-calendar-picker-indicator]:invert-[1] [&::-webkit-calendar-picker-indicator]:brightness-200';

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
                                            onClick={() => coverRef.current?.click()}
                                            className="absolute -bottom-2 -right-2 bg-primary text-white p-1.5 rounded-lg shadow-lg hover:bg-primary/80 transition"
                                        >
                                            <Camera size={14} />
                                        </button>
                                        <input ref={coverRef} type="file" accept="image/*" className="hidden"
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
                                                <div>
                                                    <label className="block text-sm font-medium text-muted-foreground mb-1.5">Category *</label>
                                                    <select value={form.businessCategory} onChange={e => setForm({ ...form, businessCategory: e.target.value })}
                                                        className={`w-full rounded-lg border px-3 py-2 text-sm transition-colors ${inputClass}`} required>
                                                        <option value="" className={isLight ? '' : 'bg-[#020631] text-white'}>Select category</option>
                                                        {CATEGORIES.map(c => <option key={c} value={c} className={isLight ? '' : 'bg-[#020631] text-white'}>{c}</option>)}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-muted-foreground mb-1.5">Website</label>
                                                    <Input value={form.website} onChange={e => setForm({ ...form, website: e.target.value })} className={inputClass} placeholder="example.com" />
                                                </div>
                                            </div>
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
                                            <h2 className="text-lg font-bold text-foreground flex items-center gap-2"><Clock size={18} />Business Hours</h2>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-muted-foreground mb-1.5">Opening Time</label>
                                                    <Input type="time" value={form.openingTime} onChange={e => setForm({ ...form, openingTime: e.target.value })} className={inputClass} />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-muted-foreground mb-1.5">Closing Time</label>
                                                    <Input type="time" value={form.closingTime} onChange={e => setForm({ ...form, closingTime: e.target.value })} className={inputClass} />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-muted-foreground mb-1.5">Weekly Off</label>
                                                    <select value={form.weeklyOff} onChange={e => setForm({ ...form, weeklyOff: e.target.value })}
                                                        className={`w-full rounded-lg border px-3 py-2 text-sm transition-colors ${inputClass}`}>
                                                        {DAYS.map(d => <option key={d} value={d} className={isLight ? '' : 'bg-[#020631] text-white'}>{d}</option>)}
                                                    </select>
                                                </div>
                                            </div>
                                            <div className={`rounded-xl border p-4 ${isLight ? 'bg-blue-50 border-blue-200' : 'bg-blue-500/10 border-blue-500/20'}`}>
                                                <p className="text-sm text-muted-foreground">Preview: <span className="font-medium text-foreground">
                                                    {form.openingTime || '--:--'} – {form.closingTime || '--:--'}
                                                    {form.weeklyOff && form.weeklyOff !== 'None' ? ` • Closed on ${form.weeklyOff}` : ''}
                                                </span></p>
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
                                                <label className="block text-sm font-medium text-muted-foreground mb-3">Gallery <span className="text-xs opacity-60">(up to 10 photos)</span></label>
                                                <div className="flex flex-wrap gap-3 mb-3">
                                                    {galleryPreviews.map((p, i) => (
                                                        <div key={i} className="relative">
                                                            <img src={p} className="w-24 h-20 object-cover rounded-xl" alt={`gallery-${i}`} />
                                                        </div>
                                                    ))}
                                                    <button type="button" onClick={() => galleryRef.current?.click()}
                                                        className={`w-24 h-20 flex flex-col items-center justify-center rounded-xl border-2 border-dashed text-muted-foreground transition hover:text-primary hover:border-primary ${isLight ? 'border-slate-300' : 'border-white/10'}`}>
                                                        <Upload size={18} />
                                                        <span className="text-xs mt-1">Add</span>
                                                    </button>
                                                    <input ref={galleryRef} type="file" accept="image/*" multiple className="hidden"
                                                        onChange={e => handleGalleryChange(e.target.files)} />
                                                </div>
                                                {galleryFiles.length > 0 && <p className="text-xs text-primary">{galleryFiles.length} new photos selected</p>}
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

                                    {/* ─── Documents ─── */}
                                    {activeTab === 'documents' && (
                                        <div className="space-y-6">
                                            <h2 className="text-lg font-bold text-foreground flex items-center gap-2"><FileText size={18} />Identity & Documents</h2>
                                            <div className={`rounded-xl border p-4 ${isLight ? 'bg-amber-50 border-amber-200' : 'bg-amber-500/10 border-amber-500/20'}`}>
                                                <p className="text-sm text-amber-600 dark:text-amber-400">⚠️ Updating documents will reset your verification status. Our team will re-verify your new documents within 24–48 hours.</p>
                                            </div>

                                            {[
                                                { label: 'Aadhaar Card', sublabel: 'Upload photo of Aadhaar Card', ref: aadhaarRef, file: aadhaarFile, setter: setAadhaarFile, existing: business?.aadhaarCard, accept: 'image/*' },
                                                { label: 'PAN Card (Owner Identity Proof)', sublabel: 'Upload owner PAN card', ref: panRef, file: panFile, setter: setPanFile, existing: business?.ownerIdentityProof, accept: 'image/*,.pdf' },
                                                { label: 'Establishment Proof', sublabel: 'Partnership deed, GST certificate, any other proof', ref: estabRef, file: estabFile, setter: setEstabFile, existing: business?.establishmentProof, accept: 'image/*,.pdf' },
                                            ].map(doc => (
                                                <div key={doc.label}>
                                                    <label className="block text-sm font-medium text-muted-foreground mb-1">{doc.label}</label>
                                                    <p className="text-xs text-muted-foreground/70 mb-2">{doc.sublabel}</p>
                                                    <div className="flex items-center gap-4">
                                                        {doc.existing && (
                                                            <a href={`${BASE_URL}/${doc.existing}`} target="_blank" rel="noopener noreferrer"
                                                                className="text-xs text-primary underline flex items-center gap-1"><FileText size={12} />View current</a>
                                                        )}
                                                        <button type="button" onClick={() => doc.ref.current?.click()}
                                                            className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition ${isLight ? 'border-slate-300 hover:bg-slate-100 text-slate-700' : 'border-white/10 hover:bg-white/10 text-white'}`}>
                                                            <Upload size={16} /> {doc.file ? doc.file.name : 'Upload New'}
                                                        </button>
                                                        <input ref={doc.ref} type="file" accept={doc.accept} className="hidden"
                                                            onChange={e => doc.setter(e.target.files?.[0] || null)} />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* ─── Community ─── */}
                                    {activeTab === 'community' && (
                                        <div className="space-y-6">
                                            <h2 className="text-lg font-bold text-foreground flex items-center gap-2"><Shield size={18} />Community Preferences</h2>
                                            <div className="space-y-4">
                                                {[
                                                    { key: 'joinBulkBuying', label: 'Join Bulk Buying Network', desc: 'Get access to wholesale deals and group purchase opportunities.' },
                                                    { key: 'joinFraudAlerts', label: 'Join Fraud Alerts Network', desc: 'Receive alerts about fraudulent activities in your sector.' },
                                                ].map(opt => (
                                                    <div key={opt.key}
                                                        className={`flex items-start gap-4 p-4 rounded-2xl border cursor-pointer transition ${
                                                            (form as any)[opt.key]
                                                                ? 'border-primary/50 bg-primary/5'
                                                                : isLight ? 'border-slate-200 hover:border-slate-300' : 'border-white/10 hover:border-white/20'
                                                        }`}
                                                        onClick={() => setForm({ ...form, [opt.key]: !(form as any)[opt.key] })}>
                                                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 transition ${
                                                            (form as any)[opt.key] ? 'bg-primary border-primary' : isLight ? 'border-slate-300' : 'border-white/30'
                                                        }`}>
                                                            {(form as any)[opt.key] && <CheckCircle2 size={12} className="text-white" />}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-foreground text-sm">{opt.label}</p>
                                                            <p className="text-xs text-muted-foreground mt-0.5">{opt.desc}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

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
