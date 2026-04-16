"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Sun, Moon, ChevronDown, ChevronRight, Rocket, Map, ShieldCheck, PieChart, Search, Building2, Store, Handshake, Briefcase, Globe, Zap, Target, Sparkles, Circle, User, Settings, LogOut, Utensils, CreditCard } from "lucide-react";
import Link from "next/link";
import { useTheme } from "@/components/ThemeProvider";
import NotificationBell from "./NotificationBell";

const navItems = [
    { name: "Why DBI", href: "/why-dbi" },
    { name: "Join Community", href: "/join-community" },
    { name: "Mapping Plans", href: "/mapping-plans" },
];

const FEATURE_ICONS = [Building2, Map, ShieldCheck, PieChart, Search, Globe, Zap, Target, Sparkles, Rocket];
const SOLUTION_ICONS = [Rocket, Store, Handshake, Briefcase, Globe, Zap, Target, Sparkles, Building2, Map];

interface NavDropdownProps {
    title: string;
    items: NavItem[];
    isOpen: boolean;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
    expandedCat: string | null;
    setExpandedCat: (id: string | null) => void;
    isLight: boolean;
    flyoutY: number;
    setFlyoutY: (y: number) => void;
}

const NavDropdown = ({
    title,
    items,
    isOpen,
    onMouseEnter,
    onMouseLeave,
    expandedCat,
    setExpandedCat,
    isLight,
    flyoutY,
    setFlyoutY
}: NavDropdownProps) => {
    const activeItem = items.find(i => i.categoryId === expandedCat);

    return (
        <div
            className="relative py-2"
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            <button
                type="button"
                className={`flex items-center gap-1 text-sm font-medium transition-colors duration-300 cursor-pointer ${isOpen ? 'text-primary' : 'text-foreground/80 hover:text-primary'}`}
            >
                {title}
                <ChevronDown size={14} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {isOpen && items.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-0 mt-1 z-50 flex"
                    >
                        {/* Left Panel — Categories */}
                        <div className={`w-80 p-2 rounded-2xl border border-solid shadow-[0_8px_32px_rgba(0,0,0,0.1)] backdrop-blur-2xl ${isLight
                            ? 'bg-[#FCF8EB]/95 border-slate-900/10'
                            : 'bg-slate-900/80 border-white/10 shadow-black/40'
                            }`}>
                            <div className="max-h-[65vh] overflow-y-auto custom-scrollbar relative">
                                {items.map((item) => {
                                    const isActive = expandedCat === item.categoryId;
                                    const hasSubs = item.subcategories.length > 0;

                                    return (
                                        <Link
                                            key={item.name}
                                            href={hasSubs ? '#' : (item.directPageId ? `/details/${item.directPageId}` : '#')}
                                            onClick={(e) => {
                                                if (hasSubs) {
                                                    e.preventDefault();
                                                    setExpandedCat(isActive ? null : item.categoryId);
                                                }
                                            }}
                                            onMouseEnter={(e) => {
                                                setExpandedCat(hasSubs ? item.categoryId : null);
                                                if (hasSubs) {
                                                    const parent = e.currentTarget.offsetParent as HTMLElement;
                                                    if (parent) {
                                                        setFlyoutY(e.currentTarget.offsetTop);
                                                    }
                                                }
                                            }}
                                            className={`flex items-center gap-2 p-1.5 rounded-xl transition-all duration-200 cursor-pointer ${isActive
                                                ? isLight ? 'bg-primary/20' : 'bg-white/10'
                                                : isLight ? 'hover:bg-slate-900/5' : 'hover:bg-transparent'
                                                }`}
                                        >
                                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all duration-300 ${isActive
                                                ? 'bg-primary text-white scale-110 shadow-lg shadow-primary/20'
                                                : isLight ? 'bg-black/5 text-black/60' : 'bg-slate-800/50 text-slate-400'
                                                }`}>
                                                <item.icon size={15} />
                                            </div>
                                            <div className={`flex-1 text-[12px] font-bold tracking-tight transition-colors ${isActive
                                                ? 'text-primary'
                                                : isLight ? 'text-black' : 'text-slate-300'
                                                }`}>
                                                {item.name}
                                            </div>
                                            {hasSubs && (
                                                <ChevronRight size={14} className={`transition-all duration-300 ${isActive ? 'translate-x-1 text-primary' : 'text-slate-500'}`} />
                                            )}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Right Panel — Subcategories flyout */}
                        <div className="relative pointer-events-none">
                            <AnimatePresence>
                                {activeItem && activeItem.subcategories.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0, y: flyoutY }}
                                        exit={{ opacity: 0, x: -10 }}
                                        transition={{
                                            opacity: { duration: 0.2 },
                                            x: { duration: 0.2 },
                                            y: { type: "spring", stiffness: 300, damping: 30 }
                                        }}
                                        className={`w-72 ml-2 p-2 rounded-2xl border border-solid shadow-[0_8px_32px_rgba(0,0,0,0.1)] h-fit backdrop-blur-2xl pointer-events-auto ${isLight
                                            ? 'bg-[#FCF8EB]/95 border-slate-900/10'
                                            : 'bg-slate-900/80 border-white/10 shadow-black/40'
                                            }`}
                                    >
                                        <div className={`px-3 py-2 text-[10px] font-black uppercase tracking-[0.2em] opacity-40 ${isLight ? 'text-black' : 'text-white'}`}>
                                            {activeItem.name}
                                        </div>
                                        <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
                                            {activeItem.subcategories.map((sub) => (
                                                <Link
                                                    key={sub.id}
                                                    href={`/details/${sub.id}`}
                                                    className={`flex items-center gap-2 p-1 rounded-xl transition-all duration-200 ${isLight
                                                        ? 'text-black hover:text-primary hover:bg-primary/5'
                                                        : 'text-slate-300 hover:text-white hover:bg-white/5'
                                                        }`}
                                                >
                                                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${isLight ? 'bg-black/5 text-black/40' : 'bg-slate-800/50 text-slate-500'
                                                        }`}>
                                                        <Circle size={5} fill="currentColor" />
                                                    </div>
                                                    <div className="flex-1 text-[11px] font-medium transition-colors">
                                                        {sub.name}
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

interface NavItem {
    name: string;
    subcategories: { name: string; id: string }[];
    icon: any;
    categoryId: string;
    directPageId?: string;
}

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const { theme, toggle } = useTheme();
    const isLight = theme === "light";
    const [features, setFeatures] = useState<NavItem[]>([]);
    const [solutions, setSolutions] = useState<NavItem[]>([]);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [expandedCat, setExpandedCat] = useState<string | null>(null);
    const [flyoutY, setFlyoutY] = useState(0);
    const [mobileExpandedCat, setMobileExpandedCat] = useState<string | null>(null);
    const [mobileSectionOpen, setMobileSectionOpen] = useState<string | null>(null);

    // Auth State
    const [businessUser, setBusinessUser] = useState<any>(null);
    const [regularUser, setRegularUser] = useState<any>(null);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [foodCategoryNames, setFoodCategoryNames] = useState<Set<string>>(new Set());

    const isFoodCategory = (cat: string) => {
        if (!cat) return false;
        return foodCategoryNames.has(cat.trim());
    };

    useEffect(() => {
        const handler = () => setScrolled(window.scrollY > 50);
        handler();
        window.addEventListener("scroll", handler);
        return () => window.removeEventListener("scroll", handler);
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setOpenDropdown(null);
                setUserMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        const API = process.env.NEXT_PUBLIC_API_URL;

        const fetchData = async () => {
            try {
                const [featRes, solRes, pageRes] = await Promise.all([
                    fetch(`${API}/features`).then(r => r.json()),
                    fetch(`${API}/solutions`).then(r => r.json()),
                    fetch(`${API}/page-details`).then(r => r.json()),
                ]);

                // Map data structures for lookup
                const subcatMap: Record<string, { name: string, id: string }[]> = {};
                const directCatMap: Record<string, string> = {}; // categoryId -> pageDetailId

                if (pageRes.success && pageRes.data) {
                    pageRes.data
                        .filter((p: any) => p.isActive && p.category)
                        .forEach((p: any) => {
                            const catId = p.category._id;
                            if (p.subcategory && p.subcategory.name && p.subcategory.name !== 'N/A') {
                                if (!subcatMap[catId]) subcatMap[catId] = [];
                                if (!subcatMap[catId].some(s => s.name === p.subcategory.name)) {
                                    subcatMap[catId].push({ name: p.subcategory.name, id: p._id });
                                }
                            } else {
                                // Direct category data
                                directCatMap[catId] = p._id;
                            }
                        });
                }

                if (featRes.success && featRes.data?.length > 0) {
                    setFeatures(featRes.data
                        .filter((f: any) => f.isActive && f.category)
                        .reverse() // Reverse to put Business Core listings at the top
                        .map((f: any, i: number) => ({
                            name: f.category.name,
                            categoryId: f.category._id,
                            subcategories: subcatMap[f.category._id] || [],
                            directPageId: directCatMap[f.category._id],
                            icon: FEATURE_ICONS[i % FEATURE_ICONS.length],
                        }))
                    );
                }

                if (solRes.success && solRes.data?.length > 0) {
                    setSolutions(solRes.data
                        .filter((s: any) => s.isActive && s.category)
                        .map((s: any, i: number) => ({
                            name: s.category.name,
                            categoryId: s.category._id,
                            subcategories: subcatMap[s.category._id] || [],
                            directPageId: directCatMap[s.category._id],
                            icon: SOLUTION_ICONS[i % SOLUTION_ICONS.length],
                        }))
                    );
                }
            } catch (err) {
                console.error('Failed to fetch nav data:', err);
            }
        };

        // Fetch food-related categories from main + google category APIs
        const fetchFoodCategories = async () => {
            const foodKeywords = ['restaurant', 'cafe', 'dining', 'food', 'bakery', 'bar', 'grill', 'bistro', 'pizzeria', 'steakhouse', 'caterer', 'diner', 'canteen', 'dhaba', 'kitchen', 'eatery', 'buffet', 'takeaway', 'delivery', 'hotel', 'resort', 'sweets', 'snacks', 'juice', 'tea', 'coffee', 'burger', 'biryani', 'chinese', 'italian', 'thai', 'sushi', 'seafood', 'kebab', 'tiffin', 'mess'];
            try {
                const [mainRes, googleRes] = await Promise.all([
                    fetch(`${API}/main-categories?limit=5000`).then(r => r.json()),
                    fetch(`${API}/google-categories?limit=5000`).then(r => r.json()),
                ]);
                const allNames: string[] = [];
                if (mainRes.success && mainRes.data) allNames.push(...mainRes.data.map((c: any) => c.name));
                if (googleRes.success && googleRes.data) allNames.push(...googleRes.data.map((c: any) => c.name));
                const foodSet = new Set(
                    allNames.filter(name =>
                        foodKeywords.some(kw => name.toLowerCase().includes(kw))
                    )
                );
                setFoodCategoryNames(foodSet);
            } catch (err) {
                console.error('Failed to fetch food categories:', err);
            }
        };

        const fetchUser = async () => {
            const bToken = localStorage.getItem("businessToken");
            const uToken = localStorage.getItem("userToken");

            if (bToken) {
                try {
                    const res = await fetch(`${API}/business/me`, {
                        headers: { Authorization: `Bearer ${bToken}` }
                    });
                    const data = await res.json();
                    if (data.success) {
                        setBusinessUser(data.data);
                        return; // Business user takes precedence for now or we can show both
                    } else {
                        localStorage.removeItem("businessToken");
                    }
                } catch (err) {
                    console.error("Failed to fetch business user:", err);
                }
            }

            if (uToken) {
                try {
                    const res = await fetch(`${API}/auth/me`, {
                        headers: { Authorization: `Bearer ${uToken}` }
                    });
                    const data = await res.json();
                    if (data.success) {
                        setRegularUser(data.data);
                    } else {
                        localStorage.removeItem("userToken");
                    }
                } catch (err) {
                    console.error("Failed to fetch regular user:", err);
                }
            }
        };

        fetchData();
        fetchUser();
        fetchFoodCategories();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("businessToken");
        localStorage.removeItem("userToken");
        setBusinessUser(null);
        setRegularUser(null);
        window.location.href = '/';
    };

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.6 }}
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled
                ? "bg-background/80 border-b border-border/20 backdrop-blur-xl shadow-lg"
                : "bg-transparent border-b border-white/0"
                }`}
        >
            <div className="container mx-auto flex items-center justify-between h-16 px-4">
                <Link href="/" className="flex items-center gap-3 min-w-0 flex-shrink hover:opacity-80 transition-opacity">
                    <div className="relative w-20 h-10 sm:w-28 sm:h-12 shrink-0 flex items-center justify-center overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={isLight ? "/assets/DLOGO1.png" : "/assets/DLOGO.png"}
                            alt="Logo"
                            className="w-full h-full object-contain"
                        />
                    </div>
                    <span className={`font-display font-bold text-lg sm:text-xl hidden sm:block tracking-tight truncate transition-colors ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        Digital Book Of India
                    </span>
                </Link>

                <div className="hidden lg:flex items-center gap-6">
                    {navItems.slice(0, 1).map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`text-sm font-medium transition-colors duration-300 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-primary hover:after:w-full after:transition-all after:duration-300 ${isLight ? 'text-slate-700 hover:text-primary' : 'text-foreground/80 hover:text-primary'}`}
                        >
                            {item.name}
                        </Link>
                    ))}
                    <NavDropdown
                        title="Features"
                        items={features}
                        isOpen={openDropdown === "Features"}
                        onMouseEnter={() => { setOpenDropdown("Features"); setExpandedCat(null); }}
                        onMouseLeave={() => { setOpenDropdown(null); setExpandedCat(null); }}
                        expandedCat={expandedCat}
                        setExpandedCat={setExpandedCat}
                        isLight={isLight}
                        flyoutY={flyoutY}
                        setFlyoutY={setFlyoutY}
                    />
                    <NavDropdown
                        title="Solutions"
                        items={solutions}
                        isOpen={openDropdown === "Solutions"}
                        onMouseEnter={() => { setOpenDropdown("Solutions"); setExpandedCat(null); setFlyoutY(0); }}
                        onMouseLeave={() => { setOpenDropdown(null); setExpandedCat(null); setFlyoutY(0); }}
                        expandedCat={expandedCat}
                        setExpandedCat={setExpandedCat}
                        isLight={isLight}
                        flyoutY={flyoutY}
                        setFlyoutY={setFlyoutY}
                    />
                    {navItems.slice(1).map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`text-sm font-medium transition-colors duration-300 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-primary hover:after:w-full after:transition-all after:duration-300 ${isLight ? 'text-slate-700 hover:text-primary' : 'text-foreground/80 hover:text-primary'}`}
                        >
                            {item.name}
                        </Link>
                    ))}
                </div>

                <div className="hidden lg:flex items-center gap-3">
                    {/* Theme Toggle - Hidden for now */}
                    {/* 
                    <button
                        onClick={toggle}
                        aria-label="Toggle theme"
                        suppressHydrationWarning
                        className={`relative w-14 h-7 rounded-full border border-solid transition-all duration-300 flex items-center px-1 cursor-pointer ${isLight ? 'border-blue-300 bg-blue-50/50 shadow-inner' : 'border-border/50 bg-slate-900'}`}
                        style={{
                            boxShadow: theme === "dark"
                                ? "0 0 12px rgba(59,130,246,0.3)"
                                : "0 0 12px rgba(100,150,255,0.15)",
                        }}
                    >
                        <motion.div
                            layout
                            transition={{ type: "spring", stiffness: 500, damping: 35 }}
                            className="w-5 h-5 rounded-full flex items-center justify-center shadow-md bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600"
                            style={{
                                marginLeft: isLight ? "28px" : "0px",
                            }}
                        >
                            {theme === "dark"
                                ? <Moon size={11} className="text-blue-400" />
                                : <Sun size={11} className="text-yellow-600" />
                            }
                        </motion.div>
                    </button>
                    */}

                    <NotificationBell />
                    {businessUser || regularUser ? (
                        <div className="relative isolate" ref={dropdownRef}>
                            <button
                                onClick={() => setUserMenuOpen(!userMenuOpen)}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all border ${isLight ? 'bg-[#FFFFF0] border-slate-200 hover:border-primary/50 text-slate-900 shadow-sm' : 'bg-white/5 border-white/10 hover:border-white/30 text-white'}`}
                            >
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${isLight ? 'bg-primary/10 text-primary' : 'bg-primary/20 text-white'}`}>
                                    {(businessUser ? (businessUser.brandName || businessUser.businessName) : (regularUser?.name || 'U')).charAt(0).toUpperCase()}
                                </div>
                                <div className="flex flex-col items-start leading-none gap-0.5 max-w-[120px]">
                                    <span className="text-[11px] font-bold truncate w-full">
                                        {businessUser ? (businessUser.brandName || businessUser.businessName) : regularUser?.name}
                                    </span>
                                    <span className="text-[8px] uppercase tracking-widest opacity-40 font-black">
                                        {businessUser ? 'Business' : 'User'}
                                    </span>
                                </div>
                                <ChevronDown size={14} className={`transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                            </button>

                            <AnimatePresence>
                                {userMenuOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className={`absolute right-0 top-full mt-2 w-56 p-2 rounded-2xl border backdrop-blur-xl shadow-2xl z-[100] ${isLight ? 'bg-[#FFFFF0]/90 border-slate-200' : 'bg-slate-900/90 border-white/10'}`}
                                    >
                                        <div className="px-3 py-2 border-b border-solid mb-2 pb-3 pt-1">
                                            <p className={`text-xs uppercase tracking-wider font-bold opacity-50 ${isLight ? 'text-slate-500 border-slate-100' : 'text-slate-400 border-white/10'}`}>Signed in as</p>
                                            <p className={`text-sm font-bold truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>{businessUser ? businessUser.officialEmailAddress : regularUser?.email}</p>
                                        </div>

                                        <div className="space-y-1">
                                            <Link
                                                href={businessUser ? "/profile" : "/user-profile"}
                                                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${isLight ? 'text-slate-700 hover:bg-slate-100 hover:text-primary' : 'text-slate-300 hover:bg-white/10 hover:text-white'}`}
                                            >
                                                <User size={16} /> {businessUser ? 'Business Profile' : 'User Profile'}
                                            </Link>
                                            {regularUser && (
                                                <Link
                                                    href="/wallet"
                                                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-bold transition-colors ${isLight ? 'bg-blue-500/10 text-blue-600 hover:bg-blue-500/20' : 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20'}`}
                                                >
                                                    <CreditCard size={16} /> Digital Wallet
                                                </Link>
                                            )}
                                            {businessUser && isFoodCategory(businessUser.businessCategory) && (
                                                <a
                                                    href={`${process.env.NEXT_PUBLIC_FOOD_DASHBOARD_URL}/?sso_token=${typeof window !== 'undefined' ? localStorage.getItem('businessToken') : ''}&partner_id=${businessUser._id}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-bold transition-colors ${isLight ? 'bg-primary/10 text-primary hover:bg-primary/20' : 'bg-primary/20 text-primary hover:bg-primary/30'}`}
                                                >
                                                    <Utensils size={16} /> Food Dashboard
                                                </a>
                                            )}
                                            <Link
                                                href="#"
                                                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${isLight ? 'text-slate-700 hover:bg-slate-100 hover:text-primary' : 'text-slate-300 hover:bg-white/10 hover:text-white'}`}
                                            >
                                                <Settings size={16} /> Settings
                                            </Link>
                                            <Link
                                                href={businessUser ? "/settings/2fa" : "/user-settings/2fa"}
                                                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${isLight ? 'text-slate-700 hover:bg-slate-100 hover:text-primary' : 'text-slate-300 hover:bg-white/10 hover:text-white'}`}
                                            >
                                                <ShieldCheck size={16} /> 2-Step Verification
                                            </Link>
                                        </div>

                                        <div className={`mt-2 pt-2 border-t border-solid ${isLight ? 'border-slate-100' : 'border-white/10'}`}>
                                            <button
                                                onClick={handleLogout}
                                                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-bold text-red-500 hover:bg-red-500/10 transition-colors"
                                            >
                                                <LogOut size={16} /> Logout
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <div className={`flex items-center rounded-full p-1 border transition-all ${isLight ? 'bg-[#FFFFF0]/30 border-black/10' : 'bg-white/5 border-white/10'}`}>
                                <Link
                                    href="/login"
                                    className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-full transition-all hover:text-primary ${isLight ? 'text-slate-900/80 hover:bg-black/5' : 'text-white/70 hover:bg-white/5'}`}
                                >
                                    Login
                                </Link>
                                <div className={`w-px h-4 ${isLight ? 'bg-black/10' : 'bg-white/10'}`} />
                                <Link
                                    href="/register"
                                    className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-full transition-all hover:text-primary ${isLight ? 'text-slate-900/80 hover:bg-black/5' : 'text-white/70 hover:bg-white/5'}`}
                                >
                                    Sign Up
                                </Link>
                            </div>

                            <Button
                                variant="default"
                                size="sm"
                                className={`font-bold border-none transition-all duration-300 rounded-xl px-5 h-10 shadow-lg ${isLight
                                        ? "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-600/20"
                                        : "bg-primary text-white hover:bg-primary/90 shadow-primary/20"
                                    }`}
                                asChild
                            >
                                <Link href="/community/register" className="flex items-center gap-2">
                                    <Building2 size={14} />
                                    <span>Business Portal</span>
                                </Link>
                            </Button>
                        </div>
                    )}
                </div>

                <div className="flex lg:hidden items-center gap-3">
                    {/* Mobile Theme Toggle - Hidden */}
                    {/* 
                    <button
                        onClick={toggle}
                        aria-label="Toggle theme"
                        suppressHydrationWarning
                        className={`w-8 h-8 rounded-full border border-solid flex items-center justify-center transition-all ${isLight ? 'bg-blue-50 border-primary/20' : 'bg-slate-900 border-border/50'}`}
                    >
                        {theme === "dark"
                            ? <Moon size={14} className="text-blue-400" />
                            : <Sun size={14} className="text-yellow-500" />
                        }
                    </button>
                    */}
                    <NotificationBell />
                    <button className={isLight ? 'text-slate-900' : 'text-foreground'} onClick={() => setMobileOpen(!mobileOpen)}>
                        {mobileOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className={`lg:hidden border-t border-solid transition-colors duration-500 px-4 pb-10 overflow-y-auto max-h-[85vh] ${isLight ? 'bg-[#FFFFF0]/95 border-blue-50 shadow-xl backdrop-blur-xl' : 'bg-slate-900/95 border-white/5 shadow-2xl backdrop-blur-xl'}`}
                    >
                        <div className="pt-4 grid gap-1">
                            {/* Mobile Sections */}
                            {[
                                { title: "Features", data: features },
                                { title: "Solutions", data: solutions }
                            ].map((section) => {
                                const isSectionOpen = mobileSectionOpen === section.title;
                                return (
                                    <div key={section.title} className="space-y-0">
                                        <button
                                            onClick={() => setMobileSectionOpen(isSectionOpen ? null : section.title)}
                                            className={`w-full flex items-center justify-between py-2.5 px-2 text-[11px] font-black uppercase tracking-[0.2em] transition-colors ${isSectionOpen ? 'text-white' : 'text-white/60'}`}
                                        >
                                            {section.title}
                                            <ChevronDown size={14} className={`transition-transform duration-300 ${isSectionOpen ? 'rotate-180' : ''}`} />
                                        </button>

                                        <AnimatePresence>
                                            {isSectionOpen && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.3, ease: "easeInOut" }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="grid gap-1 pb-2">
                                                        {section.data.map((item) => {
                                                            const isExpanded = mobileExpandedCat === item.categoryId;
                                                            const hasSubs = item.subcategories.length > 0;

                                                            return (
                                                                <div key={item.name} className="overflow-hidden">
                                                                    <Link
                                                                        href={hasSubs ? '#' : (item.directPageId ? `/details/${item.directPageId}` : '#')}
                                                                        onClick={(e) => {
                                                                            if (hasSubs) {
                                                                                e.preventDefault();
                                                                                setMobileExpandedCat(isExpanded ? null : item.categoryId);
                                                                            } else if (!item.directPageId) {
                                                                                e.preventDefault();
                                                                            } else {
                                                                                setMobileOpen(false);
                                                                            }
                                                                        }}
                                                                        className={`w-full flex items-center justify-between p-2 rounded-2xl transition-all duration-300 ${isExpanded
                                                                            ? isLight ? 'bg-primary/5' : 'bg-white/5'
                                                                            : 'hover:bg-transparent'
                                                                            }`}
                                                                    >
                                                                        <div className="flex items-center gap-2">
                                                                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all duration-300 ${isExpanded
                                                                                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                                                                : isLight ? 'bg-slate-100/50 text-slate-500' : 'bg-slate-800/50 text-slate-400'
                                                                                }`}>
                                                                                <item.icon size={14} />
                                                                            </div>
                                                                            <span className={`text-sm font-bold tracking-tight transition-colors ${isExpanded
                                                                                ? 'text-primary'
                                                                                : isLight ? 'text-black' : 'text-slate-300'
                                                                                }`}>
                                                                                {item.name}
                                                                            </span>
                                                                        </div>
                                                                        {hasSubs && (
                                                                            <ChevronRight size={14} className={`transition-transform duration-300 ${isExpanded ? 'rotate-90 text-primary' : 'text-slate-400'}`} />
                                                                        )}
                                                                    </Link>

                                                                    <AnimatePresence>
                                                                        {isExpanded && hasSubs && (
                                                                            <motion.div
                                                                                initial={{ height: 0, opacity: 0 }}
                                                                                animate={{ height: 'auto', opacity: 1 }}
                                                                                exit={{ height: 0, opacity: 0 }}
                                                                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                                                                className="overflow-hidden"
                                                                            >
                                                                                <div className="mt-1 ml-5 pl-4 border-l border-solid border-primary/10 grid gap-1 py-1">
                                                                                    {item.subcategories.map((sub) => (
                                                                                        <Link
                                                                                            key={sub.id}
                                                                                            href={`/details/${sub.id}`}
                                                                                            onClick={() => {
                                                                                                setMobileOpen(false);
                                                                                                setMobileExpandedCat(null);
                                                                                            }}
                                                                                            className={`flex items-center gap-3 p-2.5 rounded-xl transition-all duration-200 ${isLight
                                                                                                ? 'text-slate-600 active:bg-primary/5'
                                                                                                : 'text-slate-300 active:bg-white/5'
                                                                                                }`}
                                                                                        >
                                                                                            <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${isLight ? 'bg-slate-100/50 text-slate-400' : 'bg-slate-800/50 text-slate-500'
                                                                                                }`}>
                                                                                                <Circle size={6} fill="currentColor" />
                                                                                            </div>
                                                                                            <span className="text-[11px] font-medium">{sub.name}</span>
                                                                                        </Link>
                                                                                    ))}
                                                                                </div>
                                                                            </motion.div>
                                                                        )}
                                                                    </AnimatePresence>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                );
                            })}

                            <div className="h-px bg-border/5 my-1" />

                            <div className="grid gap-0">
                                {navItems.map((item) => (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={`block py-2 px-4 text-[15px] font-bold tracking-tight rounded-2xl transition-colors ${isLight ? 'text-slate-700 hover:text-primary active:bg-primary/5' : 'text-slate-300 hover:text-white active:bg-white/5'}`}
                                        onClick={() => setMobileOpen(false)}
                                    >
                                        {item.name}
                                    </Link>
                                ))}
                            </div>
                            <div className="flex flex-col gap-3 mt-4 w-full">
                                {businessUser || regularUser ? (
                                    <div className="w-full flex flex-col gap-2 mt-2">
                                        <div className={`p-4 rounded-2xl flex items-center gap-3 border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/10'}`}>
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold shrink-0 ${isLight ? 'bg-primary/10 text-primary' : 'bg-primary/20 text-white'}`}>
                                                {(businessUser ? (businessUser.brandName || businessUser.businessName) : (regularUser?.name || 'U')).charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex flex-col overflow-hidden">
                                                <span className={`text-sm font-bold truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
                                                    {businessUser ? (businessUser.brandName || businessUser.businessName) : regularUser?.name}
                                                </span>
                                                <span className={`text-[11px] truncate ${isLight ? 'text-slate-500' : 'text-white/50'}`}>
                                                    {businessUser ? businessUser.officialEmailAddress : regularUser?.email}
                                                </span>
                                            </div>
                                        </div>

                                        <div className={`grid ${businessUser && isFoodCategory(businessUser.businessCategory) ? 'grid-cols-4' : 'grid-cols-3'} gap-2`}>
                                            <Link href={businessUser ? "/profile" : "/user-profile"} onClick={() => setMobileOpen(false)} className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border text-center transition-colors ${isLight ? 'bg-white border-slate-200 text-slate-700 hover:border-primary/50' : 'bg-white/5 border-white/10 text-slate-300 hover:border-white/30'}`}>
                                                <User size={18} className={isLight ? "text-primary" : "text-white/80"} />
                                                <span className="text-[10px] font-bold leading-tight">{businessUser ? 'Business Profile' : 'User Profile'}</span>
                                            </Link>
                                            {regularUser && (
                                                <Link href="/wallet" onClick={() => setMobileOpen(false)} className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border text-center transition-colors ${isLight ? 'bg-blue-500/5 border-blue-200 text-blue-600 hover:border-blue-400' : 'bg-blue-500/10 border-blue-500/20 text-blue-400 hover:border-blue-500/40'}`}>
                                                    <CreditCard size={18} />
                                                    <span className="text-[10px] font-bold leading-tight uppercase">Wallet</span>
                                                </Link>
                                            )}
                                            <Link href="#" onClick={() => setMobileOpen(false)} className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border text-center transition-colors ${isLight ? 'bg-white border-slate-200 text-slate-700 hover:border-primary/50' : 'bg-white/5 border-white/10 text-slate-300 hover:border-white/30'}`}>
                                                <Settings size={18} className={isLight ? "text-primary" : "text-white/80"} />
                                                <span className="text-[10px] font-bold leading-tight">Settings</span>
                                            </Link>
                                            <Link href={businessUser ? "/settings/2fa" : "/user-settings/2fa"} onClick={() => setMobileOpen(false)} className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border text-center transition-colors ${isLight ? 'bg-white border-slate-200 text-slate-700 hover:border-primary/50' : 'bg-white/5 border-white/10 text-slate-300 hover:border-white/30'}`}>
                                                <ShieldCheck size={18} className={isLight ? "text-primary" : "text-white/80"} />
                                                <span className="text-[10px] font-bold leading-tight">2FA<br />Security</span>
                                            </Link>
                                            {businessUser && isFoodCategory(businessUser.businessCategory) && (
                                                <a href={`${process.env.NEXT_PUBLIC_FOOD_DASHBOARD_URL}/?sso_token=${typeof window !== 'undefined' ? localStorage.getItem('businessToken') : ''}&partner_id=${businessUser._id}`} target="_blank" rel="noopener noreferrer" onClick={() => setMobileOpen(false)} className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border text-center transition-colors ${isLight ? 'bg-primary/10 border-primary/20 text-primary hover:border-primary/50' : 'bg-primary/20 border-primary/30 text-primary hover:border-primary/50'}`}>
                                                    <Utensils size={18} className="text-primary" />
                                                    <span className="text-[10px] font-bold leading-tight">Food<br />Dash</span>
                                                </a>
                                            )}
                                        </div>

                                        <button
                                            onClick={handleLogout}
                                            className={`w-full mt-1 flex items-center justify-center gap-2 p-3 rounded-xl font-bold text-sm transition-colors border ${isLight
                                                    ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                                                    : 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20'
                                                }`}
                                        >
                                            <LogOut size={16} /> Logout
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <div className="grid grid-cols-2 gap-3">
                                            <Button variant="outline-glow" size="lg" className="w-full" asChild onClick={() => setMobileOpen(false)}>
                                                <Link href="/login">User Login</Link>
                                            </Button>
                                            <Button variant="outline-glow" size="lg" className="w-full" asChild onClick={() => setMobileOpen(false)}>
                                                <Link href="/register">Sign Up</Link>
                                            </Button>
                                        </div>
                                        <Button
                                            variant={isLight ? 'default' : 'glow'}
                                            size="lg"
                                            className={`w-full h-14 ${isLight ? "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20 font-bold" : ""}`}
                                            asChild
                                            onClick={() => setMobileOpen(false)}
                                        >
                                            <Link href="/community/login" className="flex items-center justify-center gap-2">
                                                <Building2 size={18} />
                                                <span className="uppercase tracking-widest font-black text-xs">Business Login</span>
                                            </Link>
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.nav>
    );
}
