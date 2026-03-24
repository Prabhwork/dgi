"use client";

import { useState, useEffect, Suspense, useRef } from "react";

import { motion, AnimatePresence } from "framer-motion";
import {
    Building2, MapPin, Clock, ShieldCheck, Image as ImageIcon, Users,
    ChevronRight, ChevronLeft, Upload, CheckCircle2, AlertCircle, X, Map,
    Loader2, CheckCircle, ExternalLink, Fingerprint, Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/Navbar";
import { useRouter, useSearchParams } from "next/navigation";
import Footer from "@/components/Footer";
import CursorGlow from "@/components/CursorGlow";
import ParticleNetworkWrapper from "@/components/ParticleNetworkWrapper";

const loadRazorpayScript = () => {
    return new Promise((resolve) => {
        if (typeof window === "undefined") return resolve(false);
        if ((window as any).Razorpay) return resolve(true);
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

const steps = [
    { id: 1, title: "Identity", icon: Building2 },
    { id: 2, title: "Contact", icon: MapPin },
    { id: 3, title: "Operations", icon: Clock },
    { id: 4, title: "Verification", icon: ShieldCheck },
    { id: 5, title: "Gallery", icon: ImageIcon },
    { id: 6, title: "Community", icon: Users },
];

function RegisterPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const isUpdateMode = searchParams.get("mode") === "update";
    const formContainerRef = useRef<HTMLDivElement>(null);

    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [otpLoading, setOtpLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [rejectionReason, setRejectionReason] = useState<string | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        businessName: "",
        brandName: "",
        businessCategory: "Automobile",
        subcategory: [] as string[],
        description: "",
        keywords: "",
        gpsCoordinates: { lat: 0, lng: 0, address: "" },
        registeredOfficeAddress: "",
        primaryContactNumber: "",
        password: "",
        officialWhatsAppNumber: "",
        officialEmailAddress: "",
        openingTime: "",
        closingTime: "",
        weeklyOff: "None",
        aadhaarNumber: "",
        website: "",
        joinBulkBuying: false,
        joinFraudAlerts: false,
        isCustomCategory: false,
        customCategory: "",
        isCustomSubcategory: false,
        customSubcategory: ""
    });

    // OTP State
    const [otp, setOtp] = useState("");
    const [showOTPField, setShowOTPField] = useState(false);
    const [isEmailVerified, setIsEmailVerified] = useState(false);
    const [isLocating, setIsLocating] = useState(false);
    const [mainCategories, setMainCategories] = useState<{ _id: string, name: string }[]>([]);
    const [mainSubcategories, setMainSubcategories] = useState<{ _id: string, name: string }[]>([]);
    
    // Keyword Suggestions State
    const [keywordInput, setKeywordInput] = useState("");
    const [keywordSuggestions, setKeywordSuggestions] = useState<{ text: string, type: string }[]>([]);
    const [showKeywordSuggestions, setShowKeywordSuggestions] = useState(false);
    const [keywordPage, setKeywordPage] = useState(1);
    const [hasMoreKeywords, setHasMoreKeywords] = useState(false);
    const [isLoadingMoreKeywords, setIsLoadingMoreKeywords] = useState(false);
    const suggestionRef = useRef<HTMLDivElement>(null);

    const fetchKeywordSuggestions = async (query: string, pageNum: number = 1, append: boolean = false) => {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        if (pageNum > 1) setIsLoadingMoreKeywords(true);
        
        try {
            let url = `${API_URL}/business/suggestions?q=${encodeURIComponent(query)}&page=${pageNum}&limit=20`;
            if (formData.businessCategory) {
                url += `&category=${encodeURIComponent(formData.businessCategory)}`;
            }
            if (formData.subcategory.length > 0) {
                url += `&subcategory=${encodeURIComponent(formData.subcategory.join(','))}`;
            }

            const res = await fetch(url);
            const data = await res.json();
            
            if (data.success) {
                if (append) {
                    setKeywordSuggestions(prev => {
                        // Avoid duplicates if any
                        const existingTexts = new Set(prev.map(p => p.text));
                        const newOnes = data.data.filter((d: any) => !existingTexts.has(d.text));
                        return [...prev, ...newOnes];
                    });
                } else {
                    setKeywordSuggestions(data.data);
                    setShowKeywordSuggestions(data.data.length > 0);
                }
                setHasMoreKeywords(data.hasMore);
                setKeywordPage(pageNum);
            }
        } catch (err) {
            console.error("Failed to fetch suggestions:", err);
        } finally {
            setIsLoadingMoreKeywords(false);
        }
    };

    // Keyword debounced fetch (Reset to page 1)
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchKeywordSuggestions(keywordInput, 1, false);
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [keywordInput, formData.businessCategory, formData.subcategory]);

    // Click outside to close suggestions
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (suggestionRef.current && !suggestionRef.current.contains(event.target as Node)) {
                setShowKeywordSuggestions(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Keyword Logic
    const addKeyword = (keyword: string) => {
        const trimmed = keyword.trim().toLowerCase();
        if (!trimmed) return;
        
        const existing = formData.keywords ? formData.keywords.split(',').map(k => k.trim().toLowerCase()) : [];
        if (!existing.includes(trimmed)) {
            const newKeywords = [...existing, trimmed].join(', ');
            setFormData(prev => ({ ...prev, keywords: newKeywords }));
        }
        setKeywordInput("");
        setShowKeywordSuggestions(false);
    };

    const removeKeyword = (keywordToRemove: string) => {
        const existing = formData.keywords ? formData.keywords.split(',').map(k => k.trim().toLowerCase()) : [];
        const filtered = existing.filter(k => k !== keywordToRemove.toLowerCase()).join(', ');
        setFormData(prev => ({ ...prev, keywords: filtered }));
    };

    const handleKeywordScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        if (scrollHeight - scrollTop <= clientHeight + 30 && hasMoreKeywords && !isLoadingMoreKeywords) {
            fetchKeywordSuggestions(keywordInput, keywordPage + 1, true);
        }
    };

    // Subcategory Logic
    const addSubcategory = (sub: string) => {
        if (!sub || sub === "add-new") return;
        if (!formData.subcategory.includes(sub)) {
            setFormData(prev => ({
                ...prev,
                subcategory: [...prev.subcategory, sub]
            }));
        }
    };

    const removeSubcategory = (subToRemove: string) => {
        setFormData(prev => ({
            ...prev,
            subcategory: prev.subcategory.filter(s => s !== subToRemove)
        }));
    };

    // Timings State
    const [timings, setTimings] = useState<{ open: string; close: string }[]>([{ open: "", close: "" }]);

    // Sync timings to formData
    useEffect(() => {
        setFormData(prev => ({
            ...prev,
            openingTime: timings.map(t => t.open).join(','),
            closingTime: timings.map(t => t.close).join(',')
        }));
    }, [timings]);


    useEffect(() => {
        const fetchMainCats = async () => {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
            try {
                const res = await fetch(`${API_URL}/main-categories?limit=100`);
                const data = await res.json();
                if (data.success) setMainCategories(data.data);
            } catch (err) {}
        };
        fetchMainCats();
    }, []);

    useEffect(() => {
        const fetchSubCats = async () => {
            if (!formData.businessCategory || formData.isCustomCategory) {
                setMainSubcategories([]);
                return;
            }
            
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
            try {
                const cat = mainCategories.find(c => c.name === formData.businessCategory);
                if (!cat) return;

                const res = await fetch(`${API_URL}/main-categories/${cat._id}/main-subcategories?limit=100`);
                const data = await res.json();
                if (data.success) setMainSubcategories(data.data);
            } catch (err) {}
        };
        fetchSubCats();
    }, [formData.businessCategory, formData.isCustomCategory, mainCategories]);


    // File State
    const [files, setFiles] = useState<{ [key: string]: File | File[] | null }>({
        aadhaarCard: null,
        ownerIdentityProof: null,
        establishmentProof: null,
        coverImage: null,
        gallery: null,
        catalog: null
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // If email changes, reset verification
        if (name === "officialEmailAddress") {
            setIsEmailVerified(false);
            setShowOTPField(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
        if (e.target.files) {
            if (fieldName === 'gallery') {
                setFiles(prev => ({ ...prev, [fieldName]: Array.from(e.target.files!) }));
            } else {
                setFiles(prev => ({ ...prev, [fieldName]: e.target.files![0] }));
            }
        }
    };

    const handleSendOTP = async () => {
        if (!formData.officialEmailAddress) {
            setError("Please enter an email address first");
            return;
        }
        setOtpLoading(true);
        setError(null);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/business/send-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: formData.officialEmailAddress })
            });
            const data = await res.json();
            if (data.success) {
                setShowOTPField(true);
            } else {
                setError(data.error || "Failed to send OTP");
            }
        } catch (err) {
            setError("Failed to connect to server");
        } finally {
            setOtpLoading(false);
        }
    };

    const handleVerifyOTP = async () => {
        if (!otp) {
            setError("Please enter the OTP");
            return;
        }
        setOtpLoading(true);
        setError(null);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/business/verify-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: formData.officialEmailAddress, otp })
            });
            const data = await res.json();
            if (data.success) {
                setIsEmailVerified(true);
                setShowOTPField(false);
                setOtp("");
            } else {
                setError(data.error || "Invalid OTP");
            }
        } catch (err) {
            setError("Failed to connect to server");
        } finally {
            setOtpLoading(false);
        }
    };

    useEffect(() => {
        const fetchMainCategories = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/main-categories?limit=100`);
                const data = await res.json();
                if (data.success && data.data) {
                    setMainCategories(data.data.filter((c: any) => c.isActive));
                }
            } catch (err) {
                console.error("Failed to fetch main categories", err);
            }
        };
        fetchMainCategories();

        if (isUpdateMode) {
            const fetchBusinessData = async () => {
                const token = localStorage.getItem("businessToken");
                if (!token) {
                    router.push("/community/login");
                    return;
                }
                setLoading(true);
                try {
                    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/business/me`, {
                        headers: { "Authorization": `Bearer ${token}` }
                    });
                    const data = await res.json();
                    if (data.success) {
                        const b = data.data;
                        setFormData({
                            businessName: b.businessName || "",
                            brandName: b.brandName || "",
                            businessCategory: b.businessCategory || "Automobile",
                            subcategory: b.subcategory || [], // Ensure this is an array
                            description: b.description || "",
                            keywords: (b.keywords || []).join(", "),
                            gpsCoordinates: b.gpsCoordinates || { lat: 0, lng: 0, address: "" },
                            registeredOfficeAddress: b.registeredOfficeAddress || "",
                            primaryContactNumber: b.primaryContactNumber || "",
                            password: "", // Keep password empty for security
                            officialWhatsAppNumber: b.officialWhatsAppNumber || "",
                            officialEmailAddress: b.officialEmailAddress || "",
                            openingTime: b.openingTime || "",
                            closingTime: b.closingTime || "",
                            weeklyOff: b.weeklyOff || "None",
                            aadhaarNumber: b.aadhaarNumber || "",
                            website: b.website || "",
                            joinBulkBuying: b.joinBulkBuying || false,
                            joinFraudAlerts: b.joinFraudAlerts || false,
                            isCustomCategory: false, // Reset these for update mode
                            customCategory: "",
                            isCustomSubcategory: false,
                            customSubcategory: ""
                        });
                        
                        // Parse mult-timings
                        if (b.openingTime || b.closingTime) {
                            const opens = (b.openingTime || "").split(",");
                            const closes = (b.closingTime || "").split(",");
                            const len = Math.max(opens.length, closes.length, 1);
                            const newTimings = [];
                            for (let i = 0; i < len; i++) {
                                newTimings.push({ open: opens[i] || "", close: closes[i] || "" });
                            }
                            setTimings(newTimings);
                        }

                        setIsEmailVerified(true);
                        if (b.rejectionReason) setRejectionReason(b.rejectionReason);
                    }
                } catch (err) {
                    console.error("Failed to fetch business data", err);
                } finally {
                    setLoading(false);
                }
            };
            fetchBusinessData();
        }
    }, [isUpdateMode, router]);

    // Removed DigiLocker message listener

    // Removed handleDigiLockerVerify

    const handleLocateMe = () => {
        if (!navigator.geolocation) {
            setError("Geolocation is not supported by your browser");
            return;
        }

        setIsLocating(true);
        setError(null);

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                
                try {
                    // Reverse geocoding using Nominatim (OpenStreetMap)
                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
                    );
                    const data = await response.json();
                    const readableAddress = data.display_name || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;

                    setFormData(prev => ({
                        ...prev,
                        gpsCoordinates: {
                            ...prev.gpsCoordinates,
                            lat: latitude,
                            lng: longitude,
                            address: readableAddress
                        }
                    }));
                } catch (err) {
                    console.error("Reverse geocoding failed:", err);
                    // Fallback to coordinates if address fetch fails
                    setFormData(prev => ({
                        ...prev,
                        gpsCoordinates: {
                            ...prev.gpsCoordinates,
                            lat: latitude,
                            lng: longitude,
                            address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
                        }
                    }));
                } finally {
                    setIsLocating(false);
                }
            },
            (err) => {
                let msg = "Failed to get location";
                if (err.code === 1) msg = "Location permission denied";
                else if (err.code === 2) msg = "Location unavailable";
                else if (err.code === 3) msg = "Location request timed out";
                setError(msg);
                setIsLocating(false);
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    const nextStep = () => {
        if (!isUpdateMode) {
            if (currentStep === 2 && !isEmailVerified) {
                setError("Please verify your email address to continue");
                return;
            }
            if (currentStep === 4 && formData.aadhaarNumber.length !== 12) {
                setError("Please enter a valid 12-digit Aadhaar number");
                return;
            }
            if (currentStep === 4 && !files.aadhaarCard) {
                setError("Please upload your Aadhaar card copy");
                return;
            }
        }
        setError(null);
        setCurrentStep(prev => Math.min(prev + 1, 6));
        setTimeout(() => {
            formContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 50);
    };
    const prevStep = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1));
        setTimeout(() => {
            formContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 50);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (!isUpdateMode && (!formData.joinBulkBuying || !formData.joinFraudAlerts)) {
            setError("You must agree to join Bulk Buying and receive Fraud Alerts to proceed with registration.");
            setLoading(false);
            return;
        }

        const buildApiBody = () => {
            const apiBody = new FormData();
            Object.entries(formData).forEach(([key, value]) => {
                if (key === 'subcategory' && Array.isArray(value)) {
                    value.forEach(item => apiBody.append(key, item));
                } else if (typeof value === 'object' && value !== null) {
                    apiBody.append(key, JSON.stringify(value));
                } else {
                    apiBody.append(key, value.toString());
                }
            });
            Object.entries(files).forEach(([key, value]) => {
                if (value instanceof File) apiBody.append(key, value);
                else if (Array.isArray(value)) value.forEach(file => apiBody.append(key, file));
            });
            return apiBody;
        };

        if (isUpdateMode) {
            const token = localStorage.getItem("businessToken");
            const headers: any = {};
            if (token) headers["Authorization"] = `Bearer ${token}`;
            
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/business/update-details`, {
                    method: "PUT", headers, body: buildApiBody()
                });
                const contentType = res.headers.get("content-type");
                if (contentType && contentType.includes("application/json")) {
                    const data = await res.json();
                    if (data.success) {
                        setSuccess(true);
                    } else {
                        setError(data.error || "Update failed");
                    }
                } else {
                    setError(`Server Error: ${res.status} ${res.statusText}`);
                }
            } catch (err) {
                setError("Network error or server connection failed.");
            } finally {
                setLoading(false);
            }
            return;
        }

        // --- NEW REGISTRATION FLOW ---
        try {
            // 1. Create Payment Order first
            const orderRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/business/create-payment-order`, {
                method: "POST"
            });
            const contentType = orderRes.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                setError(`Server Error while creating order.`);
                setLoading(false);
                return;
            }

            const orderData = await orderRes.json();
            
            if (!orderData.success) {
                setError(orderData.error || "Failed to create payment order");
                setLoading(false);
                return;
            }

            // 2. Open Razorpay Checktout Modal
            const resLoader = await loadRazorpayScript();
            if (!resLoader) {
                setError("Failed to load payment gateway. Please check your internet connection.");
                setLoading(false); 
                return;
            }

            console.log("Order Data received:", orderData);

            const options = {
                key: orderData.keyId,
                amount: orderData.amount * 100,
                currency: orderData.currency,
                name: "Digital Book Of India",
                description: "Business Registration Fee",
                order_id: orderData.orderId,
                handler: async function (paymentResponse: any) {
                    console.log("Payment Success Handler Triggered:", paymentResponse);
                    try {
                        setLoading(true);
                        // 3. Register Business with Payment Details after successful payment
                        const apiBody = buildApiBody();
                        apiBody.append("razorpay_order_id", paymentResponse.razorpay_order_id);
                        apiBody.append("razorpay_payment_id", paymentResponse.razorpay_payment_id);
                        apiBody.append("razorpay_signature", paymentResponse.razorpay_signature);

                        const verifyRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/business/register`, {
                            method: "POST",
                            body: apiBody
                        });
                        const verifyContentType = verifyRes.headers.get("content-type");
                        if (verifyContentType && verifyContentType.includes("application/json")) {
                            const verifyData = await verifyRes.json();
                            if (verifyData.success) {
                                setSuccess(true);
                                setTimeout(() => router.push("/community/login"), 4000);
                            } else {
                                setError(verifyData.error || "Registration failed after payment");
                            }
                        } else {
                            setError(`Registration Server Error: ${verifyRes.status}`);
                        }
                    } catch (err) {
                        setError("Registration submission error. Please contact support.");
                    } finally {
                        setLoading(false);
                    }
                },
                prefill: {
                    name: formData.businessName,
                    email: formData.officialEmailAddress,
                    contact: formData.primaryContactNumber
                },
                theme: { color: "#10b981" },
                modal: {
                    ondismiss: function() {
                        setLoading(false);
                        // Data is preserved - user can try payment again
                    }
                }

            };

            console.log("Initializing Razorpay with options:", options);
            const paymentObject = new (window as any).Razorpay(options);
            paymentObject.on("payment.failed", function (response: any) {
                console.error("Razorpay Payment Failed Object:", response.error);
                setLoading(false);
                setError("Payment failed: " + response.error.description);
            });
            paymentObject.open();

        } catch (err) {
            setError("Failed to initiate payment. Please try again.");
            setLoading(false);
        }
    };

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6 pb-10">
                        <div className="flex items-center gap-3 mb-8">
                            <Building2 className="text-primary w-8 h-8" />
                            <h2 className="text-2xl font-bold text-white">Basic Business Identity</h2>
                        </div>
                        <div className="space-y-4">
                            <div className="grid gap-2">
                                <Label className="text-white/70">Business Name <span className="text-red-500">*</span></Label>
                                <Input name="businessName" value={formData.businessName} onChange={handleInputChange} placeholder="Legal name (GST/License)" className="bg-slate-900/60 border-white/10 text-white focus-visible:ring-primary/50" required />
                            </div>
                            <div className="grid gap-2">
                                <Label className="text-white/70">Brand Name</Label>
                                <Input name="brandName" value={formData.brandName} onChange={handleInputChange} placeholder="Trading name (if different)" className="bg-slate-900/60 border-white/10 text-white focus-visible:ring-primary/50" />
                            </div>
                            <div className="grid gap-2">
                                <Label className="text-white/70">Business Category <span className="text-red-500">*</span></Label>
                                <Select 
                                    value={formData.isCustomCategory ? "OTHER" : formData.businessCategory} 
                                    onValueChange={(val) => {
                                        if (val === "OTHER") {
                                            setFormData(prev => ({ ...prev, isCustomCategory: true, businessCategory: "", isCustomSubcategory: false, subcategory: [] }));
                                        } else {
                                            setFormData(prev => ({ ...prev, isCustomCategory: false, businessCategory: val, isCustomSubcategory: false, subcategory: [] }));
                                        }
                                    }}
                                >
                                    <SelectTrigger className="bg-slate-900/60 border-white/10 text-white focus:ring-primary/50">
                                        <SelectValue placeholder="Select Category" />
                                    </SelectTrigger>
                                    <SelectContent side="bottom" avoidCollisions={false} className="bg-slate-900 border-white/10 text-white max-h-[300px]">
                                        {mainCategories.map((cat) => (
                                            <SelectItem key={cat._id} value={cat.name} className="hover:bg-white/5 focus:bg-white/10 cursor-pointer">
                                                {cat.name}
                                            </SelectItem>
                                        ))}
                                        <SelectItem value="OTHER" className="text-primary font-bold hover:bg-primary/5 focus:bg-primary/10 cursor-pointer">
                                            + Add New Category
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                {formData.isCustomCategory && (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                                        <Input 
                                            placeholder="Enter your custom category name" 
                                            value={formData.customCategory} 
                                            onChange={(e) => {
                                                setFormData(prev => ({ ...prev, customCategory: e.target.value, businessCategory: e.target.value }));
                                            }}
                                            className="mt-2 bg-primary/5 border-primary/20 text-white"
                                        />
                                    </motion.div>
                                )}
                            </div>

                            <div className="space-y-4">
                                <Label className="text-white/70 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                                    <Building2 className="w-3 h-3 text-primary" />
                                    Main Specialties (Subcategories) *
                                </Label>
                                
                                {/* Selected Subcategories Tags */}
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {formData.subcategory.map((sub, idx) => (
                                        <motion.div 
                                            initial={{ scale: 0.8, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            key={idx}
                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-full text-xs font-bold text-primary group"
                                        >
                                            {sub}
                                            <button 
                                                type="button"
                                                onClick={() => removeSubcategory(sub)}
                                                className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </motion.div>
                                    ))}
                                </div>

                                <Select 
                                    value="" 
                                    onValueChange={(val) => {
                                        if (val === "add-new") {
                                            setFormData(prev => ({ ...prev, isCustomSubcategory: true }));
                                        } else {
                                            addSubcategory(val);
                                        }
                                    }}
                                >
                                    <SelectTrigger className="w-full bg-white/5 border-white/10 text-white rounded-xl h-14 focus:ring-primary focus:border-primary transition-all">
                                        <SelectValue placeholder={formData.subcategory.length > 0 ? "Add more specialties..." : "Select specialty..."} />
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-900 border-white/10 text-white !z-[9999] max-h-[300px]" position="popper" sideOffset={5}>
                                        {mainSubcategories.map((sub) => (
                                            <SelectItem 
                                                key={sub._id} 
                                                value={sub.name}
                                                disabled={formData.subcategory.includes(sub.name)}
                                            >
                                                {sub.name} {formData.subcategory.includes(sub.name) && "(Selected)"}
                                            </SelectItem>
                                        ))}
                                        <SelectItem value="add-new" className="text-primary font-bold border-t border-white/5 mt-2">
                                            + Add Your Own Specialty
                                        </SelectItem>
                                    </SelectContent>
                                </Select>

                                {formData.isCustomSubcategory && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: -10 }} 
                                        animate={{ opacity: 1, y: 0 }}
                                        className="space-y-3 p-4 bg-primary/5 rounded-xl border border-primary/10 relative"
                                    >
                                        <button 
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, isCustomSubcategory: false }))}
                                            className="absolute top-2 right-2 text-white/40 hover:text-white"
                                        >
                                            <X size={14} />
                                        </button>
                                        <Label className="text-white/60 text-[10px] font-bold uppercase tracking-wider block mb-1">Enter Your Unique Specialty</Label>
                                        <div className="flex gap-2">
                                            <Input 
                                                placeholder="e.g. Vintage Car Restoration"
                                                value={formData.customSubcategory}
                                                onChange={(e) => setFormData(prev => ({ ...prev, customSubcategory: e.target.value }))}
                                                className="bg-white/5 border-white/10 text-white h-12"
                                            />
                                            <Button 
                                                type="button"
                                                onClick={() => {
                                                    if (formData.customSubcategory.trim()) {
                                                        addSubcategory(formData.customSubcategory);
                                                        setFormData(prev => ({ ...prev, isCustomSubcategory: false, customSubcategory: "" }));
                                                    }
                                                }}
                                                className="h-12 px-4 whitespace-nowrap"
                                            >
                                                Add
                                            </Button>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                            <div className="grid gap-2">
                                <Label className="text-white/70">Business Description</Label>
                                <Textarea name="description" value={formData.description} onChange={handleInputChange} placeholder="Short 'About' section for the community" className="bg-white/5 border-white/10 text-white min-h-[100px]" />
                            </div>
                            <div className="grid gap-2">
                                <Label className="text-white/70">Keywords / Tags</Label>
                                <div className="space-y-3">
                                    {/* Selected Keyword Tags */}
                                    <div className="flex flex-wrap gap-2 min-h-[40px] p-2 rounded-lg bg-white/5 border border-white/10">
                                        {formData.keywords ? (
                                            formData.keywords.split(',').map((tag, idx) => (
                                                <Badge 
                                                    key={idx} 
                                                    variant="secondary" 
                                                    className="bg-primary/20 hover:bg-primary/30 text-primary border-primary/20 flex items-center gap-1 py-1 px-3 group"
                                                >
                                                    {tag.trim()}
                                                    <X 
                                                        className="w-3 h-3 cursor-pointer group-hover:text-red-400 transition-colors" 
                                                        onClick={() => removeKeyword(tag.trim())}
                                                    />
                                                </Badge>
                                            ))
                                        ) : (
                                            <span className="text-white/30 text-xs italic p-1">Add keywords for better reach...</span>
                                        )}
                                    </div>

                                    {/* Keyword Input with Autocomplete */}
                                    <div className="relative" ref={suggestionRef}>
                                        <Input 
                                            value={keywordInput}
                                            onFocus={() => setShowKeywordSuggestions(true)}
                                            onChange={(e) => {
                                                setKeywordInput(e.target.value);
                                                setShowKeywordSuggestions(true);
                                            }}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    addKeyword(keywordInput);
                                                }
                                            }}
                                            placeholder="Type and press Enter (e.g., jewelry, delivery, wholesale)" 
                                            className="bg-slate-900/60 border-white/10 text-white focus-visible:ring-primary/50" 
                                        />
                                        
                                        <AnimatePresence>
                                            {showKeywordSuggestions && keywordSuggestions.length > 0 && (
                                                <motion.div 
                                                    initial={{ opacity: 0, y: -10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -10 }}
                                                    onScroll={handleKeywordScroll}
                                                    className="absolute z-[100] w-full mt-2 bg-slate-900/95 border border-white/10 rounded-lg shadow-2xl backdrop-blur-xl max-h-[300px] overflow-y-auto custom-scrollbar pb-2"
                                                >
                                                    {keywordSuggestions.map((suggestion, idx) => (
                                                        <div 
                                                            key={`${suggestion.text}-${idx}`}
                                                            onClick={() => addKeyword(suggestion.text)}
                                                            className="px-4 py-3 hover:bg-primary/10 transition-colors cursor-pointer flex items-center justify-between border-b border-white/5 last:border-0"
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                                    {suggestion.type === 'recommended' ? (
                                                                        <CheckCircle className="w-4 h-4 text-primary" />
                                                                    ) : suggestion.type === 'place' ? (
                                                                        <MapPin className="w-4 h-4 text-primary" />
                                                                    ) : (
                                                                        <Plus className="w-4 h-4 text-primary" />
                                                                    )}
                                                                </div>
                                                                <div>
                                                                    <span className="text-white font-medium block">{suggestion.text}</span>
                                                                    {suggestion.type === 'recommended' && (
                                                                        <span className="text-[10px] text-primary block">Recommended for {formData.businessCategory}</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <span className="text-[10px] uppercase tracking-wider text-white/40 bg-white/5 px-2 py-0.5 rounded-md">
                                                                {suggestion.type}
                                                            </span>
                                                        </div>
                                                    ))}
                                                    {isLoadingMoreKeywords && (
                                                        <div className="py-4 flex justify-center">
                                                            <Loader2 className="w-5 h-5 animate-spin text-primary" />
                                                        </div>
                                                    )}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                );
            case 2:
                return (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                        <div className="flex items-center gap-3 mb-8">
                            <MapPin className="text-primary w-8 h-8" />
                            <h2 className="text-2xl font-bold text-white">Location & Contact</h2>
                        </div>
                        <div className="space-y-4">
                            <div className="grid gap-2">
                                <Label className="text-white/70">Exact GPS Coordinates <span className="text-red-500">*</span></Label>
                                <div className="flex gap-2">
                                    <Input value={formData.gpsCoordinates.address} readOnly placeholder="Click 'Locate Me' for accuracy" className="bg-white/5 border-white/10 text-white flex-1" />
                                    <Button 
                                        type="button" 
                                        variant="glow" 
                                        size="sm" 
                                        onClick={handleLocateMe}
                                        disabled={isLocating}
                                        className="shrink-0 gap-2"
                                        suppressHydrationWarning
                                    >
                                        {isLocating ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Map className="w-4 h-4" />
                                        )}
                                        {isLocating ? "Locating..." : "Locate Me"}
                                    </Button>
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label className="text-white/70">Registered Office Address <span className="text-red-500">*</span></Label>
                                <Textarea name="registeredOfficeAddress" value={formData.registeredOfficeAddress} onChange={handleInputChange} className="bg-slate-900/60 border-white/10 text-white focus-visible:ring-primary/50" required />
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label className="text-white/70">Primary Contact Number <span className="text-red-500">*</span></Label>
                                    <Input name="primaryContactNumber" value={formData.primaryContactNumber} onChange={handleInputChange} className="bg-slate-900/60 border-white/10 text-white focus-visible:ring-primary/50" required />
                                </div>
                                <div className="grid gap-2">
                                    <Label className="text-white/70">Official WhatsApp Number</Label>
                                    <Input name="officialWhatsAppNumber" value={formData.officialWhatsAppNumber} onChange={handleInputChange} className="bg-slate-900/60 border-white/10 text-white focus-visible:ring-primary/50" />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label className="text-white/70">Official Email Address <span className="text-red-500">*</span></Label>
                                <div className="flex gap-2">
                                    <Input
                                        name="officialEmailAddress"
                                        value={formData.officialEmailAddress}
                                        onChange={handleInputChange}
                                        className="bg-white/5 border-white/10 text-white flex-1"
                                        placeholder="name@business.com"
                                        required
                                        disabled={isEmailVerified}
                                    />
                                    {!isEmailVerified && (
                                        <Button
                                            type="button"
                                            variant="glow"
                                            size="sm"
                                            onClick={handleSendOTP}
                                            disabled={otpLoading || !formData.officialEmailAddress}
                                            className="shrink-0 gap-2"
                                        >
                                            {otpLoading ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    Sending...
                                                </>
                                            ) : (
                                                "Send OTP"
                                            )}
                                        </Button>
                                    )}
                                    {isEmailVerified && (
                                        <div className="flex items-center gap-2 text-green-400 bg-green-400/10 px-3 rounded-xl border border-green-400/20 text-xs font-bold uppercase tracking-widest">
                                            <CheckCircle2 size={14} /> Verified
                                        </div>
                                    )}
                                </div>
                            </div>
                            {showOTPField && !isEmailVerified && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="space-y-4">
                                    <Label className="text-white/70 text-center block">Enter 6-Digit Verification Code</Label>
                                    <div className="flex justify-center gap-2 sm:gap-3">
                                        {[0, 1, 2, 3, 4, 5].map((index) => (
                                            <input
                                                key={index}
                                                id={`otp-input-${index}`}
                                                type="text"
                                                maxLength={1}
                                                value={otp[index] || ""}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    if (!/^\d*$/.test(value)) return;

                                                    const newOtp = otp.split("");
                                                    newOtp[index] = value.substring(value.length - 1);
                                                    const combinedOtp = newOtp.join("");
                                                    setOtp(combinedOtp);

                                                    // Auto-focus next
                                                    if (value && index < 5) {
                                                        const nextInput = document.getElementById(`otp-input-${index + 1}`);
                                                        nextInput?.focus();
                                                    }
                                                }}
                                                onKeyDown={(e) => {
                                                    if (e.key === "Backspace" && !otp[index] && index > 0) {
                                                        const prevInput = document.getElementById(`otp-input-${index - 1}`);
                                                        prevInput?.focus();
                                                    }
                                                }}
                                                className="w-10 h-12 sm:w-12 sm:h-14 bg-slate-900/60 border border-white/10 rounded-xl text-center text-xl sm:text-2xl font-bold text-primary focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all outline-none"
                                            />
                                        ))}
                                    </div>
                                    <div className="flex justify-center mt-4">
                                        <Button
                                            type="button"
                                            variant="glow"
                                            onClick={handleVerifyOTP}
                                            disabled={otpLoading || otp.length !== 6}
                                            className="rounded-xl px-12 font-display uppercase tracking-widest text-xs h-12 gap-2"
                                        >
                                            {otpLoading ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    Verifying...
                                                </>
                                            ) : (
                                                "Verify Code"
                                            )}
                                        </Button>
                                    </div>
                                </motion.div>
                            )}
                            <div className="grid gap-2">
                                <Label className="text-white/70">Password <span className="text-red-500">*</span></Label>
                                <Input type="password" name="password" value={formData.password} onChange={handleInputChange} className="bg-slate-900/60 border-white/10 text-white focus-visible:ring-primary/50" required />
                            </div>
                        </div>
                    </motion.div>
                );
            case 3:
                return (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                        <div className="flex items-center gap-3 mb-8">
                            <Clock className="text-primary w-8 h-8" />
                            <h2 className="text-2xl font-bold text-white">Operations & Status</h2>
                        </div>
                        <div className="space-y-4">
                            {timings.map((timing, index) => (
                                <div key={index} className="flex flex-col sm:flex-row gap-4 items-end bg-white/5 p-4 rounded-xl border border-white/10 relative">
                                    {timings.length > 1 && (
                                        <button 
                                            type="button" 
                                            onClick={() => setTimings(timings.filter((_, i) => i !== index))}
                                            className="absolute top-2 right-2 text-white/40 hover:text-red-400 transition"
                                        >
                                            <X size={16} />
                                        </button>
                                    )}
                                    <div className="grid gap-2 w-full">
                                        <Label className="text-white/70">Opening Time</Label>
                                        <Input 
                                            type="time" 
                                            value={timing.open} 
                                            onChange={(e) => {
                                                const newTimings = [...timings];
                                                newTimings[index].open = e.target.value;
                                                setTimings(newTimings);
                                            }} 
                                            className="bg-slate-900/60 border-white/10 text-white focus-visible:ring-primary/50 [&::-webkit-calendar-picker-indicator]:brightness-0 [&::-webkit-calendar-picker-indicator]:invert-[1] [&::-webkit-calendar-picker-indicator]:opacity-70"
                                            style={{ colorScheme: 'dark' }}
                                        />
                                    </div>
                                    <div className="grid gap-2 w-full">
                                        <Label className="text-white/70">Closing Time</Label>
                                        <Input 
                                            type="time" 
                                            value={timing.close} 
                                            onChange={(e) => {
                                                const newTimings = [...timings];
                                                newTimings[index].close = e.target.value;
                                                setTimings(newTimings);
                                            }} 
                                            className="bg-slate-900/60 border-white/10 text-white focus-visible:ring-primary/50 [&::-webkit-calendar-picker-indicator]:brightness-0 [&::-webkit-calendar-picker-indicator]:invert-[1] [&::-webkit-calendar-picker-indicator]:opacity-70"
                                            style={{ colorScheme: 'dark' }}
                                        />
                                    </div>
                                </div>
                            ))}
                            
                            <Button 
                                type="button" 
                                variant="outline" 
                                onClick={() => setTimings([...timings, { open: "", close: "" }])}
                                className="w-fit border-dashed border-white/20 text-white/70 hover:text-white bg-transparent text-sm h-9 px-4"
                            >
                                <Plus size={16} className="mr-2" /> Add Timing Block
                            </Button>

                            <div className="grid gap-2 pt-2">
                                <Label className="text-white/70">Weekly Off</Label>
                                <Input name="weeklyOff" value={formData.weeklyOff} onChange={handleInputChange} className="bg-slate-900/60 border-white/10 text-white focus-visible:ring-primary/50" />
                            </div>
                        </div>
                    </motion.div>
                );
            case 4:
                return (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                        <div className="flex items-center gap-3 mb-8">
                            <ShieldCheck className="text-primary w-8 h-8" />
                            <h2 className="text-2xl font-bold text-white">Verification & Trust</h2>
                        </div>
                        <div className="space-y-6">
                            <div className="grid gap-4">
                                <Label className="text-white/70">Aadhaar Number <span className="text-red-500">*</span></Label>
                                <Input 
                                    name="aadhaarNumber" 
                                    maxLength={12}
                                    placeholder="12-digit Aadhaar Number"
                                    value={formData.aadhaarNumber} 
                                    onChange={handleInputChange} 
                                    className="bg-white/5 border-white/10 text-white h-12" 
                                    required
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label className="text-white/70">Upload Aadhaar Card <span className="text-red-500">*</span></Label>
                                <Input type="file" onChange={(e) => handleFileChange(e, 'aadhaarCard')} className="bg-white/5 border-white/10 text-white file:bg-primary/20 file:text-primary file:border-0" required />
                                <p className="text-[10px] text-primary/70 uppercase tracking-widest font-bold mt-1 italic">
                                    Note: Our team will check your Aadhaar card manually.
                                </p>
                            </div>

                            <div className="grid gap-2">
                                <Label className="text-white/70">Website Name / URL</Label>
                                <Input name="website" placeholder="e.g. www.mybusiness.com" value={formData.website} onChange={handleInputChange} className="bg-slate-900/60 border-white/10 text-white focus-visible:ring-primary/50" />
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label className="text-white/70">Owner's PAN Card <span className="text-red-500">*</span></Label>
                                    <Input type="file" onChange={(e) => handleFileChange(e, 'ownerIdentityProof')} className="bg-white/5 border-white/10 text-white file:bg-primary/20 file:text-primary file:border-0" required />
                                </div>
                                <div className="grid gap-2">
                                    <Label className="text-white/70">Shop/Establishment Proof <span className="text-red-500">*</span></Label>
                                    <p className="text-[10px] text-white/40 uppercase tracking-tight mb-1">(Partnership deed, Company form, or GST)</p>
                                    <Input type="file" onChange={(e) => handleFileChange(e, 'establishmentProof')} className="bg-white/5 border-white/10 text-white file:bg-primary/20 file:text-primary file:border-0" required />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                );
            case 5:
                return (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                        <div className="flex items-center gap-3 mb-8">
                            <ImageIcon className="text-primary w-8 h-8" />
                            <h2 className="text-2xl font-bold text-white">Gallery & Catalog</h2>
                        </div>
                        <div className="space-y-6">
                            <div className="grid gap-2">
                                <Label className="text-white/70">Cover Image</Label>
                                <Input type="file" onChange={(e) => handleFileChange(e, 'coverImage')} className="bg-white/5 border-white/10 text-white file:bg-primary/20 file:text-primary file:border-0" />
                            </div>
                            <div className="grid gap-2">
                                <Label className="text-white/70">Gallery Uploads (Max 10)</Label>
                                <Input type="file" multiple onChange={(e) => handleFileChange(e, 'gallery')} className="bg-white/5 border-white/10 text-white file:bg-primary/20 file:text-primary file:border-0" />
                            </div>
                            <div className="grid gap-2">
                                <Label className="text-white/70">Pricing/Menu/Catalog</Label>
                                <Input type="file" onChange={(e) => handleFileChange(e, 'catalog')} className="bg-white/5 border-white/10 text-white file:bg-primary/20 file:text-primary file:border-0" />
                            </div>
                        </div>
                    </motion.div>
                );
            case 6:
                return (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                        <div className="flex items-center gap-3 mb-8">
                            <Users className="text-primary w-8 h-8" />
                            <h2 className="text-2xl font-bold text-white">Community & Tenders</h2>
                        </div>
                        <div className="space-y-8 py-4">
                            <div className="flex items-center space-x-3 p-4 glass rounded-xl border border-white/10">
                                <input
                                    type="checkbox"
                                    id="bulkBuying"
                                    checked={formData.joinBulkBuying}
                                    onChange={(e) => setFormData(prev => ({ ...prev, joinBulkBuying: e.target.checked }))}
                                    className="w-5 h-5 rounded border-primary bg-transparent text-primary focus:ring-primary"
                                />
                                <Label htmlFor="bulkBuying" className="text-white cursor-pointer">I would like to join for Bulk Buying.</Label>
                            </div>
                            <div className="flex items-center space-x-3 p-4 glass rounded-xl border border-white/10">
                                <input
                                    type="checkbox"
                                    id="fraudAlerts"
                                    checked={formData.joinFraudAlerts}
                                    onChange={(e) => setFormData(prev => ({ ...prev, joinFraudAlerts: e.target.checked }))}
                                    className="w-5 h-5 rounded border-primary bg-transparent text-primary focus:ring-primary"
                                />
                                <Label htmlFor="fraudAlerts" className="text-white cursor-pointer">I would like to receive Fraud Alerts.</Label>
                            </div>
                        </div>
                        <p className="text-sm text-white/50 italic text-center">By submitting, you agree to join the trusted network of businesses.</p>
                    </motion.div>
                );
            default:
                return null;
        }
    };

    if (success) {
        return (
            <main className="pt-32 pb-24 container mx-auto px-4 max-w-2xl text-center space-y-8 relative z-10">
                <motion.div 
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="space-y-6"
                >
                    <div className="relative inline-block">
                        <CheckCircle2 className="w-24 h-24 text-primary mx-auto" />
                        <motion.div 
                            className="absolute inset-0 bg-primary/20 blur-3xl -z-10 rounded-full"
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-display font-bold uppercase tracking-widest">
                        Registration <span className="text-primary italic">Received</span>
                    </h1>
                </motion.div>

                <div className="glass-strong p-8 rounded-3xl border border-white/10 space-y-6">
                    <p className="text-xl text-white/70 leading-relaxed">
                        Welcome to the DBI Community! Your membership application has been successfully submitted. 
                        <span className="block mt-2 text-primary font-bold">Please Note: Your business listing will be visible to the public only after successful admin approval.</span>
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                            <h3 className="text-primary font-bold uppercase text-xs tracking-widest mb-2 flex items-center gap-2">
                                <Clock size={14} /> Approval Window
                            </h3>
                            <p className="text-sm text-white/50">Our team manually verifies all documents. This typically takes <strong>24 to 48 hours</strong>.</p>
                        </div>
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                            <h3 className="text-primary font-bold uppercase text-xs tracking-widest mb-2 flex items-center gap-2">
                                <ShieldCheck size={14} /> Verification
                            </h3>
                            <p className="text-sm text-white/50">Both manual and automated checks are performed on your legal and identity documents.</p>
                        </div>
                    </div>

                    <div className="p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20 text-center">
                        <p className="text-sm text-blue-300">
                            You will receive an email confirmation once your account is activated.
                        </p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button variant="glow" size="lg" asChild className="rounded-2xl px-12">
                        <a href="/community/login">Go to Login Portal</a>
                    </Button>
                    <Button variant="outline" size="lg" asChild className="rounded-2xl px-12 border-white/10 text-white/50">
                        <a href="/">Back to Home</a>
                    </Button>
                </div>
            </main>
        );
    }

    return (
        <main className="pt-32 pb-24 relative z-10 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8 md:mb-12">
                    <h1 className="text-2xl sm:text-3xl md:text-5xl font-display font-bold uppercase tracking-widest mb-3 md:mb-4 px-2">
                        DBI <span className="text-primary italic">Community</span> Registration
                    </h1>
                    <p className="text-muted-foreground uppercase text-[10px] sm:text-xs md:text-sm tracking-[0.15em] sm:tracking-[0.2em]">Join the trusted network of businesses</p>
                </div>

                {isUpdateMode && rejectionReason && (
                    <div className="max-w-2xl mx-auto mb-8 p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400">
                        <div className="flex items-center gap-3 mb-2">
                            <AlertCircle size={20} />
                            <h3 className="font-bold uppercase tracking-widest text-xs">Rejection Reason</h3>
                        </div>
                        <p className="text-sm font-medium">{rejectionReason}</p>
                        <p className="text-[10px] uppercase tracking-wider mt-4 opacity-50">Please correct the highlighted fields and resubmit.</p>
                    </div>
                )}

                {/* Progress Bar */}
                <div className="max-w-2xl mx-auto mb-12 px-4">
                    <div className="relative flex justify-between items-start isolate">
                        <div className="absolute top-5 left-0 w-full h-[1px] bg-white/10 -translate-y-1/2 z-0" />
                        <motion.div
                            className="absolute top-5 left-0 h-[2px] bg-primary -translate-y-1/2 z-0"
                            initial={{ width: "0%" }}
                            animate={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                        />
                        {steps.map((step) => (
                            <div key={step.id} className="relative z-10 flex flex-col items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => (isUpdateMode || step.id < currentStep) && setCurrentStep(step.id)}
                                    className={`relative w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-500 border-2 ${currentStep === step.id ? "bg-primary border-primary text-white scale-110 glow-sm" :
                                        currentStep > step.id ? "bg-primary/10 border-primary/50 text-primary backdrop-blur-md" : "bg-slate-900 border-white/20 text-white/40"
                                        }`}
                                >
                                    <step.icon size={16} className="sm:w-[18px] sm:h-[18px]" />
                                </button>
                                <span className={`text-[8px] sm:text-[10px] font-bold uppercase tracking-tighter sm:tracking-widest ${currentStep === step.id ? "text-primary" : "text-white/40"}`}>
                                    {step.title}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Form Container */}
                <div ref={formContainerRef} className="max-w-2xl mx-auto glass-strong border-white/10 rounded-[1.5rem] sm:rounded-[2rem] p-4 sm:p-8 md:p-12 shadow-2xl relative overflow-hidden">

                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

                    {error && (
                        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-3">
                            <AlertCircle size={20} />
                            <span className="text-sm font-medium">{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <AnimatePresence mode="wait">
                            {renderStep()}
                        </AnimatePresence>

                        <div className="mt-12 flex items-center justify-between pt-8 border-t border-white/10">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={prevStep}
                                disabled={currentStep === 1 || loading}
                                className="rounded-xl px-4 sm:px-8 border-white/10 text-white/70 hover:bg-white/5 hover:text-white disabled:opacity-30 transition-all font-display uppercase tracking-widest text-[10px] sm:text-xs h-10 sm:h-12"
                            >
                                <ChevronLeft className="mr-1 sm:mr-2 w-3 h-3 sm:w-4 h-4" /> Prev
                            </Button>

                            {currentStep < 6 ? (
                                <Button
                                    type="button"
                                    variant="glow"
                                    onClick={nextStep}
                                    className="rounded-xl px-8 sm:px-12 font-display uppercase tracking-widest text-[10px] sm:text-xs h-10 sm:h-12"
                                >
                                    Next <ChevronRight className="ml-1 sm:ml-2 w-3 h-3 sm:w-4 h-4" />
                                </Button>
                            ) : (
                                <Button
                                    type="submit"
                                    variant="glow"
                                    disabled={loading}
                                    className="rounded-xl px-8 sm:px-12 font-display uppercase tracking-widest text-[10px] sm:text-xs h-10 sm:h-12 bg-primary text-white"
                                >
                                    {loading ? "Registering..." : "Submit"}
                                </Button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </main>
    );
}

export default function RegisterPage() {
    return (
        <div className="min-h-screen bg-background relative overflow-hidden text-white font-sans">
            <ParticleNetworkWrapper className="z-0 opacity-40" />
            <CursorGlow />
            <Navbar />
            
            <Suspense fallback={
                <div className="min-h-screen flex flex-col items-center justify-center text-center p-6">
                    <Loader2 className="w-16 h-16 text-primary animate-spin mx-auto" />
                </div>
            }>
                <RegisterPageContent />
            </Suspense>

            <Footer />
        </div>
    );
}
