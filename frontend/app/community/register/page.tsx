"use client";

import { useState, useEffect, Suspense, useRef } from "react";

import { motion, AnimatePresence } from "framer-motion";
import {
    Building2, MapPin, Clock, ShieldCheck, Image as ImageIcon, Users,
    ChevronRight, ChevronLeft, CheckCircle2, AlertCircle, X, Map,
    Loader2, CheckCircle, Plus, Search, Mic
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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

const TRANSLATIONS = {
    en: {
        registrationTitle: "DBI Community Registration",
        joinNetwork: "Join the trusted network of businesses",
        rejectionReason: "Rejection Reason",
        correctFields: "Please correct the highlighted fields and resubmit.",
        prev: "Prev",
        next: "Next",
        submit: "Submit",
        registering: "Registering...",
        locateMe: "Locate Me",
        locating: "Locating...",
        sendOtp: "Send OTP",
        sending: "Sending...",
        verified: "Verified",
        verifyCode: "Verify Code",
        verifying: "Verifying...",
        enterOtp: "Enter 6-Digit Verification Code",
        steps: {
            identity: "Identity",
            contact: "Contact",
            operations: "Operations",
            verification: "Verification",
            gallery: "Gallery",
            community: "Community"
        },
        stepTitles: {
            identity: "Basic Business Identity",
            contact: "Location & Contact",
            operations: "Operations & Status",
            verification: "Verification & Trust",
            gallery: "Gallery & Catalog",
            community: "Community & Tenders"
        },
        labels: {
            businessName: "Business Name",
            brandName: "Brand Name",
            businessCategory: "Business Category",
            selectedSubcategories: "Selected (Subcategories)",
            businessDescription: "Business Description",
            keywords: "Keywords / Tags",
            gpsCoordinates: "Exact GPS Coordinates",
            officeAddress: "Registered Office Address",
            fullAddress: "Full Address",
            state: "State",
            city: "City",
            pincode: "Pincode",
            landmark: "Nearby Landmark",
            primaryContact: "Primary Contact Number",
            secondaryContact: "Secondary Contact Number (Optional)",
            whatsappNumber: "Official WhatsApp Number",
            emailAddress: "Official Email Address",
            password: "Password",
            confirmPassword: "Re-enter Password",
            openingTime: "Opening Time",
            closingTime: "Closing Time",
            weeklyOff: "Weekly Off",
            aadhaarNumber: "Aadhaar Number",
            uploadAadhaar: "Upload Aadhaar Card",
            website: "Website Name / URL",
            panCard: "Owner's PAN Card",
            establishmentYear: "Establishment Year",
            businessType: "Business Type",
            establishmentProof: "Shop/Establishment Proof",
            coverImage: "Cover Image (Optional)",
            galleryUploads: "Gallery Uploads (Max 10) (Optional)",
            catalog: "Pricing/Menu/Catalog (Optional)",
            bulkBuying: "I would like to join for Bulk Buying. (Optional)",
            fraudAlerts: "I would like to receive Fraud Alerts. (Optional)",
            acceptTerms: "I accept the Terms and Conditions & Privacy Policy",
            serviceBased: "Service Based",
            productBased: "Product Based",
            bothType: "Both (Service & Product)"
        },
        placeholders: {
            legalName: "Legal name (GST/License)",
            tradingName: "Trading name (if different)",
            categorySearch: "Search from 4000+ Categories (e.g. Restaurants, Legal, Marketing)",
            selectSubcategories: "Select subcategories",
            addSubcategories: "Add more specialties...",
            uniqueSpecialty: "e.g. Vintage Car Restoration",
            aboutSection: "Short 'About' section for the community",
            keywordType: "Type and press Enter (e.g., jewelry, delivery, wholesale)",
            locateHelp: "Click 'Locate Me' for accuracy",
            emailHelp: "name@business.com",
            aadhaarHelp: "12-digit Aadhaar Number",
            websiteHelp: "e.g. www.mybusiness.com"
        },
        messages: {
            aadhaarNote: "Note: Our team will check your Aadhaar card manually.",
            establishmentNote: "(Partnership deed, Company form, or GST)",
            agreeNote: "By submitting, you agree to join the trusted network of businesses.",
            emailVerifyError: "Please verify your email address to continue",
            aadhaarError: "Please enter a valid 12-digit Aadhaar number",
            aadhaarUploadError: "Please upload your Aadhaar card copy",
            agreementError: "You must agree to join Bulk Buying and receive Fraud Alerts to proceed with registration.",
            successTitle: "Registration Received",
            successMessage: "Welcome to the DBI Community! Your membership application has been successfully submitted.",
            notificationNote: "Please Note: Your business listing will be visible to the public only after successful admin approval.",
            approvalWindow: "Approval Window",
            approvalText: "Our team manually verifies all documents. This typically takes 24 to 48 hours.",
            verificationTitle: "Verification",
            verificationText: "Both manual and automated checks are performed on your legal and identity documents.",
            emailConfirm: "You will receive an email confirmation once your account is activated.",
            goToLogin: "Go to Login Portal",
            backHome: "Back to Home"
        }
    },
    hi: {
        registrationTitle: "DBI समुदाय पंजीकरण",
        joinNetwork: "व्यवसायों के विश्वसनीय नेटवर्क में शामिल हों",
        rejectionReason: "अस्वीकृति का कारण",
        correctFields: "कृपया हाइलाइट किए गए फ़ील्ड को ठीक करें और पुनः सबमिट करें।",
        prev: "पिछला",
        next: "अगला",
        submit: "सबमिट करें",
        registering: "पंजीकरण हो रहा है...",
        locateMe: "मेरी स्थिति जानें",
        locating: "ढूंढ रहे हैं...",
        sendOtp: "OTP भेजें",
        sending: "भेज रहे हैं...",
        verified: "सत्यापित",
        verifyCode: "कोड सत्यापित करें",
        verifying: "सत्यापित कर रहे हैं...",
        enterOtp: "6-अंकों का सत्यापन कोड दर्ज करें",
        typeHint: "हिंदी में बदलने के लिए अंग्रेजी में टाइप करें और स्पेस दबाएं",
        steps: {
            identity: "पहचान",
            contact: "संपर्क",
            operations: "संचालन",
            verification: "सत्यापन",
            gallery: "गैलरी",
            community: "समुदाय"
        },
        stepTitles: {
            identity: "मूल व्यावसायिक पहचान",
            contact: "स्थान और संपर्क",
            operations: "संचालन और स्थिति",
            verification: "सत्यापन और विश्वास",
            gallery: "गैलरी और कैटलॉग",
            community: "समुदाय और निविदाएं"
        },
        labels: {
            businessName: "व्यवसाय का नाम",
            brandName: "ब्रांड का नाम",
            businessCategory: "व्यवसाय की श्रेणी",
            selectedSubcategories: "चयनित (उपश्रेणियाँ)",
            businessDescription: "व्यवसाय विवरण",
            keywords: "कीवर्ड / टैग",
            gpsCoordinates: "सटीक GPS निर्देशांक",
            officeAddress: "पंजीकृत कार्यालय का पता",
            fullAddress: "पूरा पता",
            state: "राज्य",
            city: "शहर",
            pincode: "पिनकोड",
            landmark: "निकटवर्ती लैंडमार्क",
            primaryContact: "प्राथमिक संपर्क नंबर",
            secondaryContact: "द्वितीयक संपर्क नंबर (वैकल्पिक)",
            whatsappNumber: "आधिकारिक व्हाट्सएप नंबर",
            emailAddress: "आधिकारिक ईमेल पता",
            password: "पासवर्ड",
            confirmPassword: "पासवर्ड पुनः दर्ज करें",
            openingTime: "खुलने का समय",
            closingTime: "बंद होने का समय",
            weeklyOff: "साप्ताहिक अवकाश",
            aadhaarNumber: "आधार नंबर",
            uploadAadhaar: "आधार कार्ड अपलोड करें",
            website: "वेबसाइट का नाम / URL",
            panCard: "मालिक का पैन कार्ड",
            establishmentYear: "स्थापना वर्ष",
            businessType: "व्यवसाय का प्रकार",
            establishmentProof: "दुकान/प्रतिष्ठान का प्रमाण",
            coverImage: "कवर इमेज (वैकल्पिक)",
            galleryUploads: "गैलरी अपलोड (अधिकतम 10) (वैकल्पिक)",
            catalog: "मूल्य निर्धारण/मेन्यू/कैटलॉग (वैकल्पिक)",
            bulkBuying: "मैं थोक खरीदारी (Bulk Buying) के लिए शामिल होना चाहता हूँ। (वैकल्पिक)",
            fraudAlerts: "मैं धोखाधड़ी अलर्ट (Fraud Alerts) प्राप्त करना चाहता हूँ। (वैकल्पिक)",
            acceptTerms: "मैं नियम और शर्तें तथा गोपनीयता नीति स्वीकार करता हूँ",
            serviceBased: "सेवा आधारित",
            productBased: "उत्पाद आधारित",
            bothType: "दोनों (सेवा और उत्पाद)"
        },
        placeholders: {
            legalName: "कानूनी नाम (GST/लाइसेंस)",
            tradingName: "व्यापारिक नाम (यदि अलग हो)",
            categorySearch: "4000+ श्रेणियों में से खोजें (जैसे रेस्टोरेंट, कानूनी, मार्केटिंग)",
            selectSubcategories: "उपश्रेणियाँ चुनें",
            addSubcategories: "अधिक विशेषताएं जोड़ें...",
            uniqueSpecialty: "जैसे विंटेज कार बहाली",
            aboutSection: "समुदाय के लिए संक्षिप्त 'अबाउट' खंड",
            keywordType: "टाइप करें और एंटर दबाएं (जैसे गहने, डिलीवरी, थोक)",
            locateHelp: "सटीकता के लिए 'मेरी स्थिति जानें' पर क्लिक करें",
            emailHelp: "name@business.com",
            aadhaarHelp: "12-अंकों का आधार नंबर",
            websiteHelp: "जैसे www.mybusiness.com"
        },
        messages: {
            aadhaarNote: "नोट: हमारी टीम आपके आधार कार्ड की मैन्युअल रूप से जाँच करेगी।",
            establishmentNote: "(साझेदारी विलेख, कंपनी फॉर्म, या GST)",
            agreeNote: "सबमिट करके, आप व्यवसायों के विश्वसनीय नेटवर्क में शामिल होने के लिए सहमत हैं।",
            emailVerifyError: "जारी रखने के लिए कृपया अपना ईमेल पता सत्यापित करें",
            aadhaarError: "कृपया एक वैध 12-अंकों का आधार नंबर दर्ज करें",
            aadhaarUploadError: "कृपया अपने आधार कार्ड की प्रति अपलोड करें",
            agreementError: "पंजीकरण के साथ आगे बढ़ने के लिए आपको थोक खरीदारी में शामिल होने और धोखाधड़ी अलर्ट प्राप्त करने के लिए सहमत होना होगा।",
            successTitle: "पंजीकरण प्राप्त हुआ",
            successMessage: "DBI समुदाय में आपका स्वागत है! आपकी सदस्यता का आवेदन सफलतापूर्वक सबमिट कर दिया गया है।",
            notificationNote: "कृपया ध्यान दें: आपकी व्यावसायिक सूची सफल एडमिन अनुमोदन के बाद ही जनता को दिखाई देगी।",
            approvalWindow: "अनुमोदन विंडो",
            approvalText: "हमारी टीम मैन्युअल रूप से सभी दस्तावेजों की पुष्टि करती है। इसमें आमतौर पर 24 से 48 घंटे लगते हैं।",
            verificationTitle: "सत्यापन",
            verificationText: "आपके कानूनी और पहचान दस्तावेजों पर मैन्युअल और स्वचालित दोनों जांच की जाती है।",
            emailConfirm: "आपका खाता सक्रिय होने के बाद आपको एक पुष्टिकरण ईमेल प्राप्त होगा।",
            goToLogin: "लॉगिन पोर्टल पर जाएं",
            backHome: "होम पर वापस जाएं"
        },
        categoryNames: {
            "All Nightlife": "सभी नाइटलाइफ़",
            "Arts & Entertainment": "कला और मनोरंजन",
            "Automotive": "ऑटोमोटिव",
            "Beauty & Spas": "सौंदर्य और स्पा",
            "Education": "शिक्षा",
            "Event Planning & Services": "इवेंट प्लानिंग और सेवाएं",
            "Financial Services": "वित्तीय सेवाएं",
            "Food": "भोजन",
            "Health & Medical": "स्वास्थ्य और चिकित्सा",
            "Home Services": "होम सर्विसेज",
            "Hotels & Travel": "होटल और यात्रा",
            "Local Services Mix": "स्थानीय सेवाएं मिक्स",
            "Mass Media": "मास मीडिया",
            "Nightlife": "नाइटलाइफ़",
            "Pets": "पालतू जानवर",
            "Professional Services": "पेशेवर सेवाएं",
            "Public Services & Government": "सार्वजनिक सेवाएं और सरकार",
            "Real Estate": "रियल एस्टेट",
            "Religious Organizations": "धार्मिक संगठन",
            "Restaurants": "रेस्टोरेंट",
            "Shopping": "शॉपिंग",
            "Local Flavor": "स्थानीय स्वाद",
            "Reservations": "आरक्षण",
            "Services": "सेवाएं",
            "Legal": "कानूनी",
            "Marketing": "मार्केटिंग",
            "Jewelry": "गहने",
            "Delivery": "डिलीवरी",
            "Wholesale": "थोक",
            "Construction": "निर्माण",
            "Manufacturing": "विनिर्माण",
            "Retail": "रिटेल"
        }
    }
};

const steps = [
    { id: 1, title: "identity", icon: Building2 },
    { id: 2, title: "contact", icon: MapPin },
    { id: 3, title: "operations", icon: Clock },
    { id: 4, title: "verification", icon: ShieldCheck },
    { id: 5, title: "gallery", icon: ImageIcon },
    { id: 6, title: "community", icon: Users },
];

function RegisterPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const isUpdateMode = searchParams.get("mode") === "update";
    const formContainerRef = useRef<HTMLDivElement>(null);

    const [currentStep, setCurrentStep] = useState(1);
    const [language, setLanguage] = useState<'en' | 'hi'>('en');
    const t = (path: string) => {
        const keys = path.split('.');
        let result: any = TRANSLATIONS[language];
        for (const key of keys) {
            if (result[key] === undefined) return path;
            result = result[key];
        }
        return result;
    };

    const tc = (name: string) => {
        if (language === 'en') return name;
        // Check static dictionary first, then dynamic cache
        return (TRANSLATIONS.hi as any).categoryNames[name] || categoryTranslationCache[name] || name;
    };

    const [isListening, setIsListening] = useState(false);
    const [listeningField, setListeningField] = useState<string | null>(null);
    const recognitionRef = useRef<any>(null);

    const toggleVoiceInput = (fieldName: string) => {
        // If already listening to THIS field, stop it.
        if (isListening && listeningField === fieldName) {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
            setIsListening(false);
            setListeningField(null);
            return;
        }

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert(language === 'hi' ? "इस ब्राउज़र में वॉयस इनपुट समर्थित नहीं है। कृपया गूगल क्रोम का उपयोग करें।" : "Voice input is not supported in this browser. Please use Chrome.");
            return;
        }

        // Stop any existing session
        if (recognitionRef.current) {
            try {
                recognitionRef.current.abort();
            } catch (e) { }
        }

        // SET IMMEDIATELY FOR UI FEEDBACK (Pulse)
        setIsListening(true);
        setListeningField(fieldName);

        // Small delay to ensure previous session is cleared and UI updates
        setTimeout(() => {
            try {
                const recognition = new SpeechRecognition();
                recognitionRef.current = recognition;

                recognition.lang = language === 'hi' ? 'hi-IN' : 'en-US';
                recognition.interimResults = true;
                recognition.continuous = false;
                recognition.maxAlternatives = 1;

                recognition.onstart = () => {
                    console.log("Voice Input: Started for", fieldName);
                };

                recognition.onresult = (event: any) => {
                    let currentTranscript = '';
                    for (let i = event.resultIndex; i < event.results.length; i++) {
                        currentTranscript += event.results[i][0].transcript;
                    }

                    if (fieldName === 'keywordInput') {
                        setKeywordInput(currentTranscript);
                    } else if (fieldName === 'catSearchTerm') {
                        setCatSearchTerm(currentTranscript);
                        setFormData(prev => ({ ...prev, businessCategory: currentTranscript }));
                    } else {
                        setFormData(prev => ({ ...prev, [fieldName]: currentTranscript }));
                    }
                };

                recognition.onerror = (event: any) => {
                    console.error("Voice Input Error:", event.error);
                    if (event.error === 'not-allowed') {
                        alert(language === 'hi' ? "कृपया माइक्रोफ़ोन एक्सेस की अनुमति दें!" : "Please allow microphone access!");
                    } else if (event.error === 'network') {
                        alert(language === 'hi' ? "नेटवर्क समस्या - कृपया इंटरनेट चेक करें।" : "Network error - please check internet connection.");
                    } else if (event.error === 'no-speech') {
                        alert(language === 'hi' ? "कोई आवाज़ नहीं सुनी गई। कृपया जोर से बोलें या पुनः प्रयास करें।" : "No speech detected. Please speak louder or try again.");
                    } else if (event.error === 'audio-capture') {
                        alert(language === 'hi' ? "माइक्रोफ़ोन नहीं मिला। कृपया अपना माइक्रोफ़ोन जांचें।" : "No microphone found. Please check your microphone.");
                    }
                    setIsListening(false);
                    setListeningField(null);
                };

                recognition.onend = () => {
                    console.log("Voice Input: Ended.");
                    setIsListening(false);
                    setListeningField(null);
                };

                recognition.start();
            } catch (err) {
                console.error("Critical Speech Recognition Error:", err);
                setIsListening(false);
                setListeningField(null);
            }
        }, 150);
    };

    const autoTranslateCategories = async (names: string[]) => {
        if (language !== 'hi') return;

        const toTranslate = names.filter(name =>
            !(TRANSLATIONS.hi as any).categoryNames[name] && !categoryTranslationCache[name]
        );

        if (toTranslate.length === 0) return;

        // Fetch translations in batches or individually if needed
        // For efficiency, we can batch them if the API allows, or fetch sequentially
        for (const name of toTranslate) {
            try {
                // Using the same Input Tools API for translation/transliteration
                const url = `https://inputtools.google.com/request?text=${encodeURIComponent(name)}&itc=hi-t-i0-und&num=1&cp=0&cs=1&ie=utf-8&oe=utf-8&app=test`;
                const res = await fetch(url);
                const data = await res.json();
                if (data[0] === 'SUCCESS' && data[1] && data[1][0] && data[1][0][1]) {
                    const translated = data[1][0][1][0];
                    setCategoryTranslationCache(prev => ({ ...prev, [name]: translated }));
                }
            } catch (err) {
                console.error("Auto-translation failed for:", name, err);
            }
        }
    };
    const [loading, setLoading] = useState(false);
    const [otpLoading, setOtpLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [rejectionReason, setRejectionReason] = useState<string | null>(null);

    // Dynamic Translation Cache
    const [categoryTranslationCache, setCategoryTranslationCache] = useState<{ [key: string]: string }>({});

    const initialBusinessHours = {
        monday: { isOpen: true, slots: [{ open: "09:00", close: "18:00" }] },
        tuesday: { isOpen: true, slots: [{ open: "09:00", close: "18:00" }] },
        wednesday: { isOpen: true, slots: [{ open: "09:00", close: "18:00" }] },
        thursday: { isOpen: true, slots: [{ open: "09:00", close: "18:00" }] },
        friday: { isOpen: true, slots: [{ open: "09:00", close: "18:00" }] },
        saturday: { isOpen: true, slots: [{ open: "09:00", close: "13:00" }] },
        sunday: { isOpen: false, slots: [{ open: "00:00", close: "00:00" }] },
    };

    // Form State
    const [formData, setFormData] = useState({
        businessName: "",
        brandName: "",
        establishmentYear: "",
        businessType: "Service Based",
        businessCategory: "Automobile",
        subcategory: [] as string[],
        description: "",
        keywords: "",
        gpsCoordinates: { lat: 0, lng: 0, address: "" },
        registeredOfficeAddress: "",
        state: "",
        city: "",
        pincode: "",
        landmark: "",
        fullAddress: "",
        primaryContactNumber: "",
        secondaryContactNumber: "",
        password: "",
        confirmPassword: "",
        officialWhatsAppNumber: "",
        officialEmailAddress: "",
        businessHours: initialBusinessHours,
        aadhaarNumber: "",
        website: "",
        joinBulkBuying: false,
        joinFraudAlerts: false,
        isCustomCategory: false,
        customCategory: "",
        isCustomSubcategory: false,
        customSubcategory: "",
        acceptTerms: false
    });

    // OTP State
    const [otp, setOtp] = useState("");
    const [showOTPField, setShowOTPField] = useState(false);
    const [isEmailVerified, setIsEmailVerified] = useState(false);
    const [isLocating, setIsLocating] = useState(false);
    const [mainCategories, setMainCategories] = useState<{ _id: string, name: string }[]>([]);
    const [mainSubcategories, setMainSubcategories] = useState<{ _id: string, name: string }[]>([]);

    // Google Categories Search State
    const [googleCategories, setGoogleCategories] = useState<{ _id: string, name: string }[]>([]);
    const [catSearchTerm, setCatSearchTerm] = useState("");
    const [showCatSuggestions, setShowCatSuggestions] = useState(false);
    const [isCatLoading, setIsCatLoading] = useState(false);
    const catSuggestionRef = useRef<HTMLDivElement>(null);

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

    // Initialize search term when businessCategory changes (for update mode/auto-fill)
    useEffect(() => {
        if (formData.businessCategory && !catSearchTerm) {
            setCatSearchTerm(formData.businessCategory);
        }
    }, [formData.businessCategory]);

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
            if (catSuggestionRef.current && !catSuggestionRef.current.contains(event.target as Node)) {
                setShowCatSuggestions(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Google Categories Debounced Fetch
    useEffect(() => {
        const fetchGoogleCats = async () => {
            if (catSearchTerm.length < 1) { // 1 char instead of 2
                setGoogleCategories([]);
                return;
            }
            setIsCatLoading(true);
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'; // 5001 as default
            try {
                const res = await fetch(`${API_URL}/google-categories?search=${encodeURIComponent(catSearchTerm)}&limit=15`);
                const data = await res.json();
                if (data.success) {
                    setGoogleCategories(data.data);
                    // Trigger auto-translation for google categories if Hindi
                    if (language === 'hi') {
                        autoTranslateCategories(data.data.map((c: any) => c.name));
                    }
                }
            } catch (err) {
                console.error("Failed to fetch google categories:", err);
            } finally {
                setIsCatLoading(false);
            }
        };

        const timeoutId = setTimeout(fetchGoogleCats, 400);
        return () => clearTimeout(timeoutId);
    }, [catSearchTerm]);

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

    const handleToggleDay = (day: string) => {
        setFormData(prev => ({
            ...prev,
            businessHours: {
                ...prev.businessHours,
                [day]: {
                    ...prev.businessHours[day as keyof typeof prev.businessHours],
                    isOpen: !prev.businessHours[day as keyof typeof prev.businessHours].isOpen
                }
            }
        }));
    };

    const handleSlotChange = (day: string, index: number, field: 'open' | 'close', value: string) => {
        const newSlots = [...formData.businessHours[day as keyof typeof formData.businessHours].slots];
        newSlots[index] = { ...newSlots[index], [field]: value };
        setFormData(prev => ({
            ...prev,
            businessHours: {
                ...prev.businessHours,
                [day]: { ...prev.businessHours[day as keyof typeof prev.businessHours], slots: newSlots }
            }
        }));
    };

    const addSlot = (day: string) => {
        setFormData(prev => ({
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
        const currentSlots = formData.businessHours[day as keyof typeof formData.businessHours].slots;
        if (currentSlots.length <= 1) return;
        setFormData(prev => ({
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

    const copyToAllHours = (sourceDay: string) => {
        const sourceData = formData.businessHours[sourceDay as keyof typeof formData.businessHours];
        setFormData(prev => {
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


    useEffect(() => {
        const fetchMainCats = async () => {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
            try {
                const res = await fetch(`${API_URL}/main-categories?limit=100`);
                const data = await res.json();
                if (data.success) setMainCategories(data.data);
            } catch (err) { }
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
            let combinedSubs: any[] = [];

            try {
                const cat = mainCategories.find(c => c.name === formData.businessCategory);
                if (cat) {
                    const res = await fetch(`${API_URL}/main-categories/${cat._id}/main-subcategories?limit=30`);
                    const data = await res.json();
                    if (data.success) {
                        combinedSubs = [...data.data];
                    }
                }
            } catch (err) { console.error(err); }

            // Wikipedia Fetch for extra rich keywords (for both DB and Google Categories)
            try {
                // Fetch using OpenSearch (exact prefixes) AND Query Search (related topics) to guarantee abundant results
                const searchStr = encodeURIComponent(formData.businessCategory);
                const [wikiOpenRes, wikiQueryRes] = await Promise.all([
                    fetch(`https://en.wikipedia.org/w/api.php?action=opensearch&search=${searchStr}&limit=30&namespace=0&format=json&origin=*`),
                    fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${searchStr}&srlimit=30&format=json&origin=*`)
                ]);
                
                const wikiOpenData = await wikiOpenRes.json();
                const wikiQueryData = await wikiQueryRes.json();
                
                let collectedWikiTerms: string[] = [];

                if (wikiOpenData && wikiOpenData[1] && Array.isArray(wikiOpenData[1])) {
                    collectedWikiTerms = [...collectedWikiTerms, ...wikiOpenData[1]];
                }

                if (wikiQueryData && wikiQueryData.query && wikiQueryData.query.search) {
                    const relatedTitles = wikiQueryData.query.search.map((item: any) => item.title);
                    collectedWikiTerms = [...collectedWikiTerms, ...relatedTitles];
                }

                // Deduplicate and filter out the exact category name
                const uniqueTerms = Array.from(new Set(collectedWikiTerms)).filter(w => w.toLowerCase() !== formData.businessCategory.toLowerCase());
                
                const wikiKeywords = uniqueTerms.map((term: string, idx: number) => ({
                    _id: `wiki_${idx}`,
                    name: term
                }));
                
                // Filter out any that exactly match local DB names
                const existingNames = combinedSubs.map(s => s.name.toLowerCase());
                const uniqueWiki = wikiKeywords.filter((w: any) => !existingNames.includes(w.name.toLowerCase()));
                
                combinedSubs = [...combinedSubs, ...uniqueWiki];
                
                // If it's still way too massive, cap at 60 to prevent browser lag, but ensure at least 30 if possible
                if (combinedSubs.length > 60) {
                    combinedSubs = combinedSubs.slice(0, 60);
                }
            } catch (err) { console.error("Wiki fetch error on frontend:", err); }

            setMainSubcategories(combinedSubs);
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

    const transliterateWord = async (word: string) => {
        if (!word || word.trim() === "" || language !== 'hi') return word;
        // Skip if already contains Devanagari or is a number/special char
        if (!/[a-zA-Z]/.test(word)) return word;

        try {
            const url = `https://inputtools.google.com/request?text=${encodeURIComponent(word)}&itc=hi-t-i0-und&num=1&cp=0&cs=1&ie=utf-8&oe=utf-8&app=test`;
            const res = await fetch(url);
            const data = await res.json();
            if (data[0] === 'SUCCESS' && data[1] && data[1][0] && data[1][0][1]) {
                return data[1][0][1][0];
            }
        } catch (err) {
            console.error("Transliteration failed:", err);
        }
        return word;
    };

    const handleKeyUp = async (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (language !== 'hi') return;

        const target = e.target as HTMLInputElement;
        const name = target.name;
        const value = target.value;

        const transliterateFields = ['businessName', 'brandName', 'registeredOfficeAddress', 'description', 'customCategory', 'customSubcategory', 'keywordInput', 'catSearchTerm', 'weeklyOff'];

        if (e.key === ' ' && transliterateFields.includes(name)) {
            const words = value.split(' ');
            if (words.length < 2) return;

            const lastWord = words[words.length - 2];
            if (!lastWord) return;

            const transliterated = await transliterateWord(lastWord);
            if (transliterated !== lastWord) {
                words[words.length - 2] = transliterated;
                const newValue = words.join(' ');

                if (name === 'keywordInput') {
                    setKeywordInput(newValue);
                } else if (name === 'catSearchTerm') {
                    setCatSearchTerm(newValue);
                    setFormData(prev => ({ ...prev, businessCategory: newValue }));
                } else {
                    setFormData(prev => ({ ...prev, [name]: newValue }));
                }
            }
        }
    };

    const handleBlur = async (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (language !== 'hi') return;

        const target = e.target as HTMLInputElement;
        const name = target.name;
        const value = target.value;

        const transliterateFields = ['businessName', 'brandName', 'registeredOfficeAddress', 'description', 'customCategory', 'customSubcategory', 'keywordInput', 'catSearchTerm', 'weeklyOff'];

        if (transliterateFields.includes(name)) {
            const words = value.split(' ');
            let hasChanged = false;
            const newWords = await Promise.all(words.map(async (word) => {
                if (/[a-zA-Z]/.test(word)) {
                    const translated = await transliterateWord(word);
                    if (translated !== word) {
                        hasChanged = true;
                        return translated;
                    }
                }
                return word;
            }));

            if (hasChanged) {
                const newValue = newWords.join(' ');
                if (name === 'keywordInput') {
                    setKeywordInput(newValue);
                } else if (name === 'catSearchTerm') {
                    setCatSearchTerm(newValue);
                    setFormData(prev => ({ ...prev, businessCategory: newValue }));
                } else {
                    setFormData(prev => ({ ...prev, [name]: newValue }));
                }
            }
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        // --- MOBILE NUMBER VALIDATION (+91 Logic) ---
        if (name === "primaryContactNumber" || name === "secondaryContactNumber" || name === "officialWhatsAppNumber") {
            const digits = value.replace(/\D/g, "").slice(0, 10);
            // Must start with 6, 7, 8, or 9
            if (digits.length > 0 && !["6", "7", "8", "9"].includes(digits[0])) {
                return; // Ignore invalid start digit
            }
            setFormData(prev => ({ ...prev, [name]: digits }));
            return;
        }

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
                    const activeCats = data.data.filter((c: any) => c.isActive);
                    setMainCategories(activeCats);
                    // Trigger auto-translation for main categories if Hindi
                    if (language === 'hi') {
                        autoTranslateCategories(activeCats.map((c: any) => c.name));
                    }
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
                        setFormData(prev => ({
                            ...prev,
                            businessName: b.businessName || "",
                            brandName: b.brandName || "",
                            establishmentYear: b.establishmentYear || "",
                            businessType: b.businessType || "Service Based",
                            businessCategory: b.businessCategory || "Automotive",
                            subcategory: b.subcategory || [],
                            description: b.description || "",
                            keywords: (b.keywords || []).join(", "),
                            gpsCoordinates: b.gpsCoordinates || { lat: 0, lng: 0, address: "" },
                            registeredOfficeAddress: b.registeredOfficeAddress || "",
                            state: b.state || "",
                            city: b.city || "",
                            pincode: b.pincode || "",
                            landmark: b.landmark || "",
                            fullAddress: b.fullAddress || "",
                            primaryContactNumber: b.primaryContactNumber || "",
                            secondaryContactNumber: b.secondaryContactNumber || "",
                            password: "",
                            confirmPassword: "",
                            officialWhatsAppNumber: b.officialWhatsAppNumber || "",
                            officialEmailAddress: b.officialEmailAddress || "",
                            businessHours: b.businessHours || initialBusinessHours,
                            aadhaarNumber: b.aadhaarNumber || "",
                            website: b.website || "",
                            joinBulkBuying: b.joinBulkBuying || false,
                            joinFraudAlerts: b.joinFraudAlerts || false,
                            isCustomCategory: false,
                            customCategory: "",
                            isCustomSubcategory: false,
                            customSubcategory: "",
                            acceptTerms: false
                        }));

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
                    const response = await fetch(
                        `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`
                    );
                    const data = await response.json();
                    
                    let city = "";
                    let state = "";
                    let pincode = "";
                    const fullAddressObj = data.features && data.features[0];
                    const readableAddress = fullAddressObj ? fullAddressObj.place_name : `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;

                    if (data.features) {
                        data.features.forEach((f: any) => {
                            if (f.place_type.includes('place') || f.place_type.includes('locality')) {
                                city = city || f.text;
                            }
                            if (f.place_type.includes('region')) {
                                state = state || f.text;
                            }
                            if (f.place_type.includes('postcode')) {
                                pincode = pincode || f.text;
                            }
                            if (f.context) {
                                f.context.forEach((c: any) => {
                                    if (c.id.startsWith('place') || c.id.startsWith('locality')) city = city || c.text;
                                    if (c.id.startsWith('region')) state = state || c.text;
                                    if (c.id.startsWith('postcode')) pincode = pincode || c.text;
                                });
                            }
                        });
                    }

                    setFormData(prev => ({
                        ...prev,
                        city: city || prev.city,
                        state: state || prev.state,
                        pincode: pincode || prev.pincode,
                        fullAddress: readableAddress || prev.fullAddress,
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
            if (currentStep === 1) {
                if (!formData.establishmentYear) {
                    setError(language === 'hi' ? "कृपया स्थापना वर्ष दर्ज करें" : "Please enter establishment year");
                    return;
                }
            }
            if (currentStep === 2 && !isEmailVerified) {
                setError("Please verify your email address to continue");
                return;
            }
            if (currentStep === 2) {
                if (formData.primaryContactNumber.length !== 10) {
                    setError(language === 'hi' ? "कृपया 10 अंकों का मोबाइल नंबर दर्ज करें" : "Please enter a 10-digit mobile number");
                    return;
                }
                if (formData.password !== formData.confirmPassword) {
                    setError(language === 'hi' ? "पासवर्ड मेल नहीं खाते!" : "Passwords do not match!");
                    return;
                }
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

        if (!isUpdateMode && (!formData.acceptTerms)) {
            setError(language === 'hi' ? "पंजीकरण के साथ आगे बढ़ने के लिए आपको नियम और शर्तें तथा गोपनीयता नीति स्वीकार करनी होगी।" : "You must accept the Terms and Conditions & Privacy Policy to proceed with registration.");
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
                    ondismiss: function () {
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
                            <h2 className="text-2xl font-bold text-white pr-24 sm:pr-0">{t('stepTitles.identity')}</h2>
                        </div>
                        <div className="space-y-4">
                            <div className="grid gap-2">
                                <Label className="text-white/70">{t('labels.businessName')} <span className="text-red-500">*</span></Label>
                                <div className="relative group/mic">
                                    <Input name="businessName" value={formData.businessName} onChange={handleInputChange} onKeyUp={handleKeyUp} onBlur={handleBlur} placeholder={t('placeholders.legalName')} className="bg-slate-900/60 border-white/10 text-white focus-visible:ring-primary/50 pr-10 h-14" required />
                                    <button
                                        type="button"
                                        onClick={() => toggleVoiceInput('businessName')}
                                        className={`absolute right-3 top-1/2 -translate-y-1/2 transition-colors ${isListening && listeningField === 'businessName' ? 'text-primary animate-pulse scale-110' : 'text-white/20 hover:text-primary'}`}
                                    >
                                        <Mic size={18} />
                                    </button>
                                </div>
                                {language === 'hi' && (
                                    <p className="text-[10px] text-primary/70 font-bold uppercase tracking-widest">{t('typeHint')}</p>
                                )}
                            </div>
                            <div className="grid gap-2">
                                <Label className="text-white/70">{t('labels.brandName')}</Label>
                                <div className="relative group/mic">
                                    <Input name="brandName" value={formData.brandName} onChange={handleInputChange} onKeyUp={handleKeyUp} onBlur={handleBlur} placeholder={t('placeholders.tradingName')} className="bg-slate-900/60 border-white/10 text-white focus-visible:ring-primary/50 pr-10 h-14" />
                                    <button
                                        type="button"
                                        onClick={() => toggleVoiceInput('brandName')}
                                        className={`absolute right-3 top-1/2 -translate-y-1/2 transition-colors ${isListening && listeningField === 'brandName' ? 'text-primary animate-pulse scale-110' : 'text-white/20 hover:text-primary'}`}
                                    >
                                        <Mic size={18} />
                                    </button>
                                </div>
                            </div>
                            
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label className="text-white/70">{t('labels.establishmentYear')} <span className="text-red-500">*</span></Label>
                                    <Input 
                                        name="establishmentYear" 
                                        type="number"
                                        value={formData.establishmentYear} 
                                        onChange={handleInputChange} 
                                        placeholder="e.g. 2015" 
                                        className="bg-slate-900/60 border-white/10 text-white focus-visible:ring-primary/50 h-14" 
                                        required 
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label className="text-white/70">{t('labels.businessType')} <span className="text-red-500">*</span></Label>
                                    <Select 
                                        value={formData.businessType} 
                                        onValueChange={(val) => setFormData(prev => ({ ...prev, businessType: val }))}
                                    >
                                        <SelectTrigger className="bg-slate-900/60 border-white/10 text-white focus:ring-primary/50 h-14 rounded-md">
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-900 border-white/10 text-white z-[110]">
                                            <SelectItem value="Service Based">{t('labels.serviceBased')}</SelectItem>
                                            <SelectItem value="Product Based">{t('labels.productBased')}</SelectItem>
                                            <SelectItem value="Both">{t('labels.bothType')}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label className="text-white/70">{t('labels.businessCategory')} <span className="text-red-500">*</span></Label>

                                <div className="relative" ref={catSuggestionRef}>
                                    <div className="relative group/mic">
                                        <Input
                                            value={catSearchTerm}
                                            onChange={(e) => {
                                                setCatSearchTerm(e.target.value);
                                                setShowCatSuggestions(true);
                                                // Always sync to businessCategory so validation and custom mode work
                                                setFormData(prev => ({ ...prev, businessCategory: e.target.value }));
                                            }}
                                            onKeyUp={handleKeyUp}
                                            onBlur={handleBlur}
                                            name="catSearchTerm"
                                            onFocus={() => setShowCatSuggestions(true)}
                                            placeholder={t('placeholders.categorySearch')}
                                            className="bg-slate-900/60 border-white/10 text-white focus-visible:ring-primary/50 pr-20 h-12"
                                        />
                                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 gap-2">
                                            <button
                                                type="button"
                                                onClick={() => toggleVoiceInput('catSearchTerm')}
                                                className={`transition-colors ${isListening && listeningField === 'catSearchTerm' ? 'text-primary animate-pulse' : 'text-white/20 hover:text-primary'}`}
                                            >
                                                <Mic className="w-4 h-4" />
                                            </button>
                                            <div className="w-[1px] h-4 bg-white/10" />
                                            {isCatLoading ? <Loader2 className="w-4 h-4 animate-spin text-primary" /> : <Search className="w-4 h-4 text-white/30" />}
                                        </div>
                                    </div>

                                    <AnimatePresence>
                                        {showCatSuggestions && (catSearchTerm.length > 0 || mainCategories.length > 0) && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                className="absolute z-[100] w-full mt-2 bg-slate-900 border border-white/10 rounded-xl shadow-2xl backdrop-blur-xl max-h-[400px] overflow-y-auto custom-scrollbar overflow-x-hidden"
                                            >
                                                {/* Google Categories Section - MOVE TO TOP IF SEARCHING */}
                                                {(googleCategories.length > 0 || isCatLoading) && (
                                                    <div className="p-2 border-b border-white/5">
                                                        <div className="px-3 py-1 text-[10px] font-black uppercase tracking-widest text-primary flex justify-between items-center">
                                                            <span>{language === 'hi' ? 'गूगल श्रेणियां' : 'Google Categories'}</span>
                                                            {isCatLoading && <Loader2 className="w-3 h-3 animate-spin" />}
                                                        </div>
                                                        {googleCategories.map((cat) => (
                                                            <div
                                                                key={cat._id}
                                                                onClick={() => {
                                                                    setFormData(prev => ({ ...prev, isCustomCategory: false, businessCategory: cat.name, subcategory: [] }));
                                                                    setCatSearchTerm(cat.name);
                                                                    setShowCatSuggestions(false);
                                                                }}
                                                                className={`px-4 py-3 hover:bg-white/5 transition-colors cursor-pointer flex items-center gap-3 rounded-lg ${formData.businessCategory === cat.name ? 'bg-white/10' : ''}`}
                                                            >
                                                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-all">
                                                                    <Plus className="w-4 h-4" />
                                                                </div>
                                                                <span className="text-white font-medium">{tc(cat.name)}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* Popular / Main Categories Section */}
                                                {(catSearchTerm === "" || mainCategories.some(c => c.name.toLowerCase().includes(catSearchTerm.toLowerCase()))) && (
                                                    <div className="p-2">
                                                        <div className="px-3 py-1 text-[10px] font-black uppercase tracking-widest text-primary flex justify-between items-center">
                                                            <span>{language === 'hi' ? 'मुख्य श्रेणियां' : 'MAIN CATEGORIES'}</span>
                                                        </div>
                                                        {mainCategories
                                                            .filter(c => c.name.toLowerCase().includes(catSearchTerm.toLowerCase()))
                                                            .slice(0, 20) // Show up to 20
                                                            .map((cat) => (
                                                                <div
                                                                    key={cat._id}
                                                                    onClick={() => {
                                                                        setFormData(prev => ({ ...prev, isCustomCategory: false, businessCategory: cat.name, subcategory: [] }));
                                                                        setCatSearchTerm(cat.name);
                                                                        setShowCatSuggestions(false);
                                                                    }}
                                                                    className={`px-4 py-3 hover:bg-white/5 transition-colors cursor-pointer flex items-center gap-3 rounded-lg group ${formData.businessCategory === cat.name ? 'bg-white/5' : ''}`}
                                                                >
                                                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-all">
                                                                        <Plus className="w-4 h-4" />
                                                                    </div>
                                                                    <span className="text-white/90 font-medium">{tc(cat.name)}</span>
                                                                </div>
                                                            ))}
                                                    </div>
                                                )}

                                                {/* No Results Fallback */}
                                                {!isCatLoading && catSearchTerm.length > 0 && googleCategories.length === 0 && !mainCategories.some(c => c.name.toLowerCase().includes(catSearchTerm.toLowerCase())) && (
                                                    <div
                                                        onClick={() => {
                                                            setFormData(prev => ({ ...prev, isCustomCategory: true, businessCategory: catSearchTerm, subcategory: [] }));
                                                            setShowCatSuggestions(false);
                                                        }}
                                                        className="p-6 text-center cursor-pointer hover:bg-primary/5 transition-colors"
                                                    >
                                                        <Plus className="w-8 h-8 text-primary mx-auto mb-2 opacity-40" />
                                                        <p className="text-white/60 text-sm italic">"{catSearchTerm}" {language === 'hi' ? 'नहीं मिला' : 'not found'}.</p>
                                                        <p className="text-primary text-xs font-bold uppercase tracking-widest mt-1">{language === 'hi' ? 'कस्टम श्रेणी के रूप में जोड़ने के लिए क्लिक करें' : 'Click to add as Custom Category'}</p>
                                                    </div>
                                                )}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>


                            <div className="grid gap-2">
                                <Label className="text-white/70">{t('labels.businessDescription')}</Label>
                                <div className="relative group/mic">
                                    <Textarea name="description" value={formData.description} onChange={handleInputChange} onKeyUp={handleKeyUp} onBlur={handleBlur} placeholder={t('placeholders.aboutSection')} className="bg-white/5 border-white/10 text-white min-h-[100px] pr-10" />
                                    <button
                                        type="button"
                                        onClick={() => toggleVoiceInput('description')}
                                        className={`absolute right-3 top-4 transition-colors ${isListening && listeningField === 'description' ? 'text-primary animate-pulse' : 'text-white/20 hover:text-primary'}`}
                                    >
                                        <Mic size={18} />
                                    </button>
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label className="text-white/70">{t('labels.keywords')}</Label>
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
                                            <span className="text-white/30 text-xs italic p-1">{language === 'hi' ? 'बेहतर पहुंच के लिए कीवर्ड जोड़ें...' : 'Add keywords for better reach...'}</span>
                                        )}
                                    </div>

                                    {/* Recommended Keywords (from Main Subcategories) */}
                                    {mainSubcategories.length > 0 && (
                                        <div className="space-y-2 mt-2">
                                            <Label className="text-primary/70 text-[10px] uppercase font-bold tracking-widest">{language === 'hi' ? 'अनुशंसित कीवर्ड' : 'Recommended Keywords'}</Label>
                                            <div className="flex flex-wrap gap-2 max-h-[150px] overflow-y-auto custom-scrollbar pr-2">
                                                {mainSubcategories.map((sub: any, idx) => {
                                                    const existing = formData.keywords ? formData.keywords.toLowerCase() : "";
                                                    if (existing.includes(sub.name.toLowerCase())) return null;

                                                    return (
                                                        <Badge
                                                            key={idx}
                                                            variant="outline"
                                                            className="border-white/10 bg-white/5 text-white/70 hover:bg-primary/20 hover:text-primary hover:border-primary/30 cursor-pointer transition-colors py-1 px-3"
                                                            onClick={() => addKeyword(sub.name)}
                                                        >
                                                            <Plus className="w-3 h-3 mr-1 opacity-50" />
                                                            {tc(sub.name)}
                                                        </Badge>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* Keyword Input with Autocomplete */}
                                    <div className="relative" ref={suggestionRef}>
                                        <div className="relative group/mic">
                                            <Input
                                                value={keywordInput}
                                                name="keywordInput"
                                                onFocus={() => setShowKeywordSuggestions(true)}
                                                onChange={(e) => {
                                                    setKeywordInput(e.target.value);
                                                    setShowKeywordSuggestions(true);
                                                }}
                                                onKeyUp={handleKeyUp}
                                                onBlur={handleBlur}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        addKeyword(keywordInput);
                                                    }
                                                }}
                                                placeholder={t('placeholders.keywordType')}
                                                className="bg-slate-900/60 border-white/10 text-white focus-visible:ring-primary/50 pr-10"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => toggleVoiceInput('keywordInput')}
                                                className={`absolute right-3 top-1/2 -translate-y-1/2 transition-colors ${isListening && listeningField === 'keywordInput' ? 'text-primary animate-pulse' : 'text-white/20 hover:text-primary'}`}
                                            >
                                                <Mic size={16} />
                                            </button>
                                        </div>

                                        {/* Keyword Suggestions Dropdown */}
                                        <AnimatePresence>
                                            {showKeywordSuggestions && (keywordInput.trim().length > 0 || keywordSuggestions.length > 0) && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: -10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -10 }}
                                                    className="absolute z-[100] w-full mt-2 bg-slate-900 border border-white/10 rounded-xl shadow-2xl backdrop-blur-xl max-h-[250px] overflow-y-auto custom-scrollbar"
                                                    onScroll={handleKeywordScroll}
                                                >
                                                    <div className="p-2 space-y-1">
                                                        {keywordInput.trim() && !keywordSuggestions.some(s => s.text.toLowerCase() === keywordInput.trim().toLowerCase()) && (
                                                            <div
                                                                onClick={() => addKeyword(keywordInput)}
                                                                className="px-4 py-2 hover:bg-primary/10 rounded-lg cursor-pointer flex items-center justify-between group transition-colors border-b border-white/5 pb-2 mb-1"
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    <div className="bg-primary/20 p-1 rounded-full group-hover:scale-110 transition-transform">
                                                                        <Plus size={12} className="text-primary" />
                                                                    </div>
                                                                    <span className="text-sm font-bold text-white">Add "{keywordInput.trim()}"</span>
                                                                </div>
                                                                <span className="text-[10px] uppercase tracking-widest text-primary font-bold">Custom</span>
                                                            </div>
                                                        )}
                                                        {keywordSuggestions.filter(s => s.text.toLowerCase() !== keywordInput.trim().toLowerCase()).map((suggestion, idx) => (
                                                            <div
                                                                key={idx}
                                                                onClick={() => addKeyword(suggestion.text)}
                                                                className="px-4 py-2 hover:bg-white/5 rounded-lg cursor-pointer flex items-center justify-between group transition-colors"
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    <Search size={14} className="text-white/20 group-hover:text-primary transition-colors" />
                                                                    <span className="text-sm text-white/70 group-hover:text-white">{suggestion.text}</span>
                                                                </div>
                                                                <span className="text-[10px] uppercase tracking-widest text-white/20 group-hover:text-primary/50 font-bold">{suggestion.type}</span>
                                                            </div>
                                                        ))}
                                                        {isLoadingMoreKeywords && (
                                                            <div className="py-2 text-center text-primary animate-pulse">
                                                                <Loader2 size={16} className="mx-auto animate-spin" />
                                                            </div>
                                                        )}
                                                    </div>
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
                            <h2 className="text-2xl font-bold text-white pr-24 sm:pr-0">{t('stepTitles.contact')}</h2>
                        </div>
                        <div className="space-y-4">
                            <div className="grid gap-2">
                                <Label className="text-white/70">{t('labels.gpsCoordinates')} <span className="text-red-500">*</span></Label>
                                <div className="flex gap-2">
                                    <Input value={formData.gpsCoordinates.address} readOnly placeholder={t('placeholders.locateHelp')} className="bg-white/5 border-white/10 text-white flex-1" />
                                    <Button
                                        type="button"
                                        size="sm"
                                        onClick={handleLocateMe}
                                        disabled={isLocating}
                                        className="shrink-0 gap-2 font-bold border-none transition-all duration-300 rounded-xl px-5 h-10 shadow-lg bg-primary text-white hover:bg-primary/90 shadow-primary/20"
                                        suppressHydrationWarning
                                    >
                                        {isLocating ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Map className="w-4 h-4" />
                                        )}
                                        {isLocating ? t('locating') : t('locateMe')}
                                    </Button>
                                </div>
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label className="text-white/70">{t('labels.state')} <span className="text-red-500">*</span></Label>
                                    <div className="relative group/mic">
                                        <Input name="state" value={formData.state} onChange={handleInputChange} onKeyUp={handleKeyUp} onBlur={handleBlur} className="bg-slate-900/60 border-white/10 text-white focus-visible:ring-primary/50 pr-10" required />
                                        <button type="button" onClick={() => toggleVoiceInput('state')} className={`absolute right-3 top-1/2 -translate-y-1/2 transition-colors ${isListening && listeningField === 'state' ? 'text-primary animate-pulse' : 'text-white/20 hover:text-primary'}`}><Mic size={16} /></button>
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label className="text-white/70">{t('labels.city')} <span className="text-red-500">*</span></Label>
                                    <div className="relative group/mic">
                                        <Input name="city" value={formData.city} onChange={handleInputChange} onKeyUp={handleKeyUp} onBlur={handleBlur} className="bg-slate-900/60 border-white/10 text-white focus-visible:ring-primary/50 pr-10" required />
                                        <button type="button" onClick={() => toggleVoiceInput('city')} className={`absolute right-3 top-1/2 -translate-y-1/2 transition-colors ${isListening && listeningField === 'city' ? 'text-primary animate-pulse' : 'text-white/20 hover:text-primary'}`}><Mic size={16} /></button>
                                    </div>
                                </div>
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label className="text-white/70">{t('labels.pincode')} <span className="text-red-500">*</span></Label>
                                    <Input name="pincode" value={formData.pincode} onChange={handleInputChange} maxLength={6} className="bg-slate-900/60 border-white/10 text-white focus-visible:ring-primary/50" required />
                                </div>
                                <div className="grid gap-2">
                                    <Label className="text-white/70">{t('labels.landmark')}</Label>
                                    <div className="relative group/mic">
                                        <Input name="landmark" value={formData.landmark} onChange={handleInputChange} onKeyUp={handleKeyUp} onBlur={handleBlur} className="bg-slate-900/60 border-white/10 text-white focus-visible:ring-primary/50 pr-10" />
                                        <button type="button" onClick={() => toggleVoiceInput('landmark')} className={`absolute right-3 top-1/2 -translate-y-1/2 transition-colors ${isListening && listeningField === 'landmark' ? 'text-primary animate-pulse' : 'text-white/20 hover:text-primary'}`}><Mic size={16} /></button>
                                    </div>
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label className="text-white/70">{t('labels.fullAddress')} <span className="text-red-500">*</span></Label>
                                <div className="relative group/mic">
                                    <Textarea name="fullAddress" value={formData.fullAddress} onChange={handleInputChange} onKeyUp={handleKeyUp} onBlur={handleBlur} className="bg-slate-900/60 border-white/10 text-white focus-visible:ring-primary/50 min-h-[80px] pr-10" required />
                                    <button
                                        type="button"
                                        onClick={() => toggleVoiceInput('fullAddress')}
                                        className={`absolute right-3 top-4 transition-colors ${isListening && listeningField === 'fullAddress' ? 'text-primary animate-pulse' : 'text-white/20 hover:text-primary'}`}
                                    >
                                        <Mic size={18} />
                                    </button>
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label className="text-white/70">{t('labels.officeAddress')} <span className="text-red-500">*</span></Label>
                                <div className="relative group/mic">
                                    <Textarea name="registeredOfficeAddress" value={formData.registeredOfficeAddress} onChange={handleInputChange} onKeyUp={handleKeyUp} onBlur={handleBlur} className="bg-slate-900/60 border-white/10 text-white focus-visible:ring-primary/50 min-h-[80px] pr-10" required />
                                    <button
                                        type="button"
                                        onClick={() => toggleVoiceInput('registeredOfficeAddress')}
                                        className={`absolute right-3 top-4 transition-colors ${isListening && listeningField === 'registeredOfficeAddress' ? 'text-primary animate-pulse' : 'text-white/20 hover:text-primary'}`}
                                    >
                                        <Mic size={18} />
                                    </button>
                                </div>
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label className="text-white/70">{t('labels.primaryContact')} <span className="text-red-500">*</span></Label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 font-bold text-sm tracking-tighter">+91</span>
                                        <Input name="primaryContactNumber" value={formData.primaryContactNumber} onChange={handleInputChange} className="bg-slate-900/60 border-white/10 text-white focus-visible:ring-primary/50 pl-12" placeholder="9876543210" required />
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label className="text-white/70">{t('labels.secondaryContact')}</Label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 font-bold text-sm tracking-tighter">+91</span>
                                        <Input name="secondaryContactNumber" value={formData.secondaryContactNumber} onChange={handleInputChange} className="bg-slate-900/60 border-white/10 text-white focus-visible:ring-primary/50 pl-12" placeholder="9876543210" />
                                    </div>
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label className="text-white/70">{t('labels.whatsappNumber')}</Label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 font-bold text-sm tracking-tighter">+91</span>
                                    <Input name="officialWhatsAppNumber" value={formData.officialWhatsAppNumber} onChange={handleInputChange} className="bg-slate-900/60 border-white/10 text-white focus-visible:ring-primary/50 pl-12" placeholder="9876543210" />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label className="text-white/70">{t('labels.emailAddress')} <span className="text-red-500">*</span></Label>
                                <div className="flex gap-2">
                                    <Input
                                        name="officialEmailAddress"
                                        value={formData.officialEmailAddress}
                                        onChange={handleInputChange}
                                        className="bg-white/5 border-white/10 text-white flex-1"
                                        placeholder={t('placeholders.emailHelp')}
                                        required
                                        disabled={isEmailVerified}
                                    />
                                    {!isEmailVerified && (
                                        <Button
                                            type="button"
                                            size="sm"
                                            onClick={handleSendOTP}
                                            disabled={otpLoading || !formData.officialEmailAddress}
                                            className="shrink-0 gap-2 font-bold border-none transition-all duration-300 rounded-xl px-5 h-10 shadow-lg bg-primary text-white hover:bg-primary/90 shadow-primary/20"
                                        >
                                            {otpLoading ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    {t('sending')}
                                                </>
                                            ) : (
                                                t('sendOtp')
                                            )}
                                        </Button>
                                    )}
                                    {isEmailVerified && (
                                        <div className="flex items-center gap-2 text-green-400 bg-green-400/10 px-3 rounded-xl border border-green-400/20 text-xs font-bold uppercase tracking-widest">
                                            <CheckCircle2 size={14} /> {t('verified')}
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
                                            onClick={handleVerifyOTP}
                                            disabled={otpLoading || otp.length !== 6}
                                            className="font-bold border-none transition-all duration-300 rounded-xl px-12 h-12 shadow-lg bg-primary text-white hover:bg-primary/90 shadow-primary/20 font-display uppercase tracking-widest text-xs gap-2"
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
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label className="text-white/70">{t('labels.password')} <span className="text-red-500">*</span></Label>
                                    <Input type="password" name="password" value={formData.password} onChange={handleInputChange} className="bg-slate-900/60 border-white/10 text-white focus-visible:ring-primary/50" required />
                                </div>
                                <div className="grid gap-2">
                                    <Label className="text-white/70">{t('labels.confirmPassword')} <span className="text-red-500">*</span></Label>
                                    <Input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} className="bg-slate-900/60 border-white/10 text-white focus-visible:ring-primary/50" required />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                );
            case 3:
                return (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                        <div className="flex items-center gap-3 mb-6">
                            <Clock className="text-primary w-8 h-8" />
                            <h2 className="text-2xl font-bold text-white pr-24 sm:pr-0">Operations & Status</h2>
                        </div>

                        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar pb-10">
                            {Object.entries(formData.businessHours).map(([day, data]) => (
                                <div key={day} className={`p-4 rounded-xl border transition-all ${data.isOpen ? 'bg-white/5 border-white/10' : 'bg-black/20 border-white/5 opacity-40'}`}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-1.5 h-1.5 rounded-full ${data.isOpen ? 'bg-primary animate-pulse' : 'bg-white/10'}`} />
                                            <Label className={`text-sm font-bold capitalize ${data.isOpen ? 'text-white' : 'text-white/40'}`}>{day}</Label>
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
                                                <span className="text-[9px] font-bold uppercase tracking-tight text-white/20">
                                                    {data.isOpen ? (language === 'hi' ? 'खुला है' : 'Open') : (language === 'hi' ? 'बंद है' : 'Closed')}
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
                                                        <div className="relative">
                                                            <Input
                                                                type="time"
                                                                value={slot.open}
                                                                onChange={(e) => handleSlotChange(day, idx, 'open', e.target.value)}
                                                                className="bg-transparent border-white/10 text-white h-9 text-xs focus:ring-primary/30 pl-3"
                                                                style={{ colorScheme: 'dark' }}
                                                            />
                                                        </div>
                                                        <div className="relative">
                                                            <Input
                                                                type="time"
                                                                value={slot.close}
                                                                onChange={(e) => handleSlotChange(day, idx, 'close', e.target.value)}
                                                                className="bg-transparent border-white/10 text-white h-9 text-xs focus:ring-primary/30 pl-3"
                                                                style={{ colorScheme: 'dark' }}
                                                            />
                                                        </div>
                                                    </div>
                                                    {data.slots.length > 1 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => removeSlot(day, idx)}
                                                            className="p-2 text-white/20 hover:text-red-400 transition-all"
                                                        >
                                                            <X size={14} />
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                            <button
                                                type="button"
                                                onClick={() => addSlot(day)}
                                                className="text-[10px] text-primary/70 hover:text-primary font-bold uppercase tracking-widest flex items-center gap-1 mt-1 px-1"
                                            >
                                                <Plus size={12} /> Add Shift
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </motion.div>
                );
            case 4:
                return (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                        <div className="flex items-center gap-3 mb-8">
                            <ShieldCheck className="text-primary w-8 h-8" />
                            <h2 className="text-2xl font-bold text-white pr-24 sm:pr-0">{t('stepTitles.verification')}</h2>
                        </div>
                        <div className="space-y-6">
                            <div className="grid gap-4">
                                <Label className="text-white/70">{t('labels.aadhaarNumber')} <span className="text-red-500">*</span></Label>
                                <Input
                                    name="aadhaarNumber"
                                    maxLength={12}
                                    placeholder={t('placeholders.aadhaarHelp')}
                                    value={formData.aadhaarNumber}
                                    onChange={handleInputChange}
                                    onKeyUp={handleKeyUp}
                                    onBlur={handleBlur}
                                    className="bg-white/5 border-white/10 text-white h-12"
                                    required
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label className="text-white/70">{t('labels.uploadAadhaar')} <span className="text-red-500">*</span></Label>
                                <Input type="file" onChange={(e) => handleFileChange(e, 'aadhaarCard')} className="bg-white/5 border-white/10 text-white file:bg-primary/20 file:text-primary file:border-0" required />
                                <p className="text-[10px] text-primary/70 uppercase tracking-widest font-bold mt-1 italic">
                                    {t('messages.aadhaarNote')}
                                </p>
                            </div>

                            <div className="grid gap-2">
                                <Label className="text-white/70">{t('labels.website')}</Label>
                                <Input name="website" placeholder={t('placeholders.websiteHelp')} value={formData.website} onChange={handleInputChange} className="bg-slate-900/60 border-white/10 text-white focus-visible:ring-primary/50" />
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label className="text-white/70">{t('labels.panCard')} <span className="text-red-500">*</span></Label>
                                    <Input type="file" onChange={(e) => handleFileChange(e, 'ownerIdentityProof')} className="bg-white/5 border-white/10 text-white file:bg-primary/20 file:text-primary file:border-0" required />
                                </div>
                                <div className="grid gap-2">
                                    <Label className="text-white/70">{t('labels.establishmentProof')} <span className="text-red-500">*</span></Label>
                                    <p className="text-[10px] text-white/40 uppercase tracking-tight mb-1">{t('messages.establishmentNote')}</p>
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
                            <h2 className="text-2xl font-bold text-white pr-24 sm:pr-0">{t('stepTitles.gallery')}</h2>
                        </div>
                        <div className="space-y-6">
                            <div className="grid gap-2">
                                <Label className="text-white/70">{t('labels.coverImage')}</Label>
                                <Input type="file" onChange={(e) => handleFileChange(e, 'coverImage')} className="bg-white/5 border-white/10 text-white file:bg-primary/20 file:text-primary file:border-0" />
                            </div>
                            <div className="grid gap-2">
                                <Label className="text-white/70">{t('labels.galleryUploads')}</Label>
                                <Input type="file" multiple onChange={(e) => handleFileChange(e, 'gallery')} className="bg-white/5 border-white/10 text-white file:bg-primary/20 file:text-primary file:border-0" />
                            </div>
                            <div className="grid gap-2">
                                <Label className="text-white/70">{t('labels.catalog')}</Label>
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
                            <h2 className="text-2xl font-bold text-white pr-24 sm:pr-0">{t('stepTitles.community')}</h2>
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
                                <Label htmlFor="bulkBuying" className="text-white cursor-pointer">{t('labels.bulkBuying')}</Label>
                            </div>
                            <div className="flex items-center space-x-3 p-4 glass rounded-xl border border-white/10">
                                <input
                                    type="checkbox"
                                    id="fraudAlerts"
                                    checked={formData.joinFraudAlerts}
                                    onChange={(e) => setFormData(prev => ({ ...prev, joinFraudAlerts: e.target.checked }))}
                                    className="w-5 h-5 rounded border-primary bg-transparent text-primary focus:ring-primary"
                                />
                                <Label htmlFor="fraudAlerts" className="text-white cursor-pointer">{t('labels.fraudAlerts')}</Label>
                            </div>
                            <div className="flex items-center space-x-3 p-4 glass rounded-xl border border-white/10">
                                <input
                                    type="checkbox"
                                    id="acceptTerms"
                                    checked={formData.acceptTerms}
                                    onChange={(e) => setFormData(prev => ({ ...prev, acceptTerms: e.target.checked }))}
                                    className="w-5 h-5 rounded border-primary bg-transparent text-primary focus:ring-primary"
                                />
                                <Label htmlFor="acceptTerms" className="text-white cursor-pointer">{t('labels.acceptTerms')} <span className="text-red-500">*</span></Label>
                            </div>
                        </div>
                        <p className="text-sm text-white/50 italic text-center">{t('messages.agreeNote')}</p>
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
                        {language === 'hi' ? (
                            <>पंजीकरण <span className="text-primary italic">प्राप्त हुआ</span></>
                        ) : (
                            <>Registration <span className="text-primary italic">Received</span></>
                        )}
                    </h1>
                </motion.div>

                <div className="glass-strong p-8 rounded-3xl border border-white/10 space-y-6">
                    <p className="text-xl text-white/70 leading-relaxed">
                        {t('messages.successMessage')}
                        <span className="block mt-2 text-primary font-bold">{t('messages.notificationNote')}</span>
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                            <h3 className="text-primary font-bold uppercase text-xs tracking-widest mb-2 flex items-center gap-2">
                                <Clock size={14} /> {t('messages.approvalWindow')}
                            </h3>
                            <p className="text-sm text-white/50">{t('messages.approvalText')}</p>
                        </div>
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                            <h3 className="text-primary font-bold uppercase text-xs tracking-widest mb-2 flex items-center gap-2">
                                <ShieldCheck size={14} /> {t('messages.verificationTitle')}
                            </h3>
                            <p className="text-sm text-white/50">{t('messages.verificationText')}</p>
                        </div>
                    </div>

                    <div className="p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20 text-center">
                        <p className="text-sm text-blue-300">
                            {t('messages.emailConfirm')}
                        </p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button variant="glow" size="lg" asChild className="rounded-2xl px-12">
                        <a href="/community/login">{t('messages.goToLogin')}</a>
                    </Button>
                    <Button variant="outline" size="lg" asChild className="rounded-2xl px-12 border-white/10 text-white/50">
                        <a href="/">{t('messages.backHome')}</a>
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
                        {language === 'en' ? (
                            <>DBI <span className="text-primary italic">Community</span> Registration</>
                        ) : (
                            <>DBI <span className="text-primary italic">समुदाय</span> पंजीकरण</>
                        )}
                    </h1>
                    <p className="text-muted-foreground uppercase text-[10px] sm:text-xs md:text-sm tracking-[0.15em] sm:tracking-[0.2em]">{t('joinNetwork')}</p>
                </div>

                {isUpdateMode && rejectionReason && (
                    <div className="max-w-4xl mx-auto mb-8 p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400">
                        <div className="flex items-center gap-3 mb-2">
                            <AlertCircle size={20} />
                            <h3 className="font-bold uppercase tracking-widest text-xs">{t('rejectionReason')}</h3>
                        </div>
                        <p className="text-sm font-medium">{rejectionReason}</p>
                        <p className="text-[10px] uppercase tracking-wider mt-4 opacity-50">{t('correctFields')}</p>
                    </div>
                )}

                {/* Progress Bar */}
                <div className="max-w-4xl mx-auto mb-12 px-4">
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
                                    suppressHydrationWarning
                                    className={`relative w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-500 border-2 ${currentStep === step.id ? "bg-primary border-primary text-white scale-110 glow-sm" :
                                        currentStep > step.id ? "bg-primary/10 border-primary/50 text-primary backdrop-blur-md" : "bg-slate-900 border-white/20 text-white/40"
                                        }`}
                                >
                                    <step.icon size={16} className="sm:w-[18px] sm:h-[18px]" suppressHydrationWarning />
                                </button>
                                <span className={`text-[8px] sm:text-[10px] font-bold uppercase tracking-tighter sm:tracking-widest ${currentStep === step.id ? "text-primary" : "text-white/40"}`}>
                                    {step.title}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Form Container */}
                <div ref={formContainerRef} className="max-w-4xl mx-auto glass-strong border-white/10 rounded-[1.5rem] sm:rounded-[2rem] p-4 sm:p-8 md:p-12 shadow-2xl relative overflow-hidden">

                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

                    <div className="absolute top-4 right-4 sm:top-6 sm:right-8 z-[20] scale-90 sm:scale-100 origin-top-right">
                        <div className="flex bg-white/5 border border-white/10 rounded-full p-1 backdrop-blur-md">
                            <button
                                type="button"
                                onClick={() => setLanguage('en')}
                                className={`px-3 py-1 sm:px-4 sm:py-1.5 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-widest transition-all ${language === 'en' ? 'bg-primary text-white shadow-lg' : 'text-white/40 hover:text-white/70'}`}
                            >
                                English
                            </button>
                            <button
                                type="button"
                                onClick={() => setLanguage('hi')}
                                className={`px-3 py-1 sm:px-4 sm:py-1.5 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-widest transition-all ${language === 'hi' ? 'bg-primary text-white shadow-lg' : 'text-white/40 hover:text-white/70'}`}
                            >
                                हिंदी
                            </button>
                        </div>
                    </div>

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
                                <ChevronLeft className="mr-1 sm:mr-2 w-3 h-3 sm:w-4 h-4" /> {t('prev')}
                            </Button>

                            {currentStep < 6 ? (
                                <Button
                                    type="button"
                                    onClick={nextStep}
                                    className="font-bold border-none transition-all duration-300 rounded-xl px-8 sm:px-12 h-10 sm:h-12 shadow-lg bg-primary text-white hover:bg-primary/90 shadow-primary/20 font-display uppercase tracking-widest text-[10px] sm:text-xs"
                                >
                                    {t('next')} <ChevronRight className="ml-1 sm:ml-2 w-3 h-3 sm:w-4 h-4" />
                                </Button>
                            ) : (
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="font-bold border-none transition-all duration-300 rounded-xl px-8 sm:px-12 h-10 sm:h-12 shadow-lg bg-primary text-white hover:bg-primary/90 shadow-primary/20 font-display uppercase tracking-widest text-[10px] sm:text-xs"
                                >
                                    {loading ? t('registering') : t('submit')}
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
        <div className="min-h-screen bg-[#020631] relative overflow-hidden text-white font-sans">
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