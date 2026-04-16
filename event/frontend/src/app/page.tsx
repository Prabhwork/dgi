"use client";

import React, { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { Float, Html } from "@react-three/drei";
import { motion } from "framer-motion";
import {
    Rocket, ShieldCheck, Users, Handshake, Calendar,
    MapPin, Search, Globe, ChevronRight,
    Briefcase, Wallet,
    Activity, Bitcoin, Cpu, Database,
    Network, Sparkles, Zap, Banknote,
    GraduationCap, Microscope, Monitor,
    Palette, Scale, Truck,
    Utensils, Plane, Building2, Heart, ShoppingCart,
    Car, Shirt, Music, Sprout, HardHat, Megaphone,
    Store, Code2, Hotel, Factory, Ship, Phone,
    BarChart3, PenTool, HeartHandshake, UserPlus,
    Camera, Dumbbell, PlaneLanding, Printer,
    Bus, Leaf, Medal, Gamepad2, Brush, Bot, Glasses,
    Cloud, Shield, Sun, BookOpen,
    Tractor, Home, Gavel, FileLineChart, PlaneTakeoff, Atom,
} from "lucide-react";
import Link from "next/link";


const MARQUEE_CATEGORIES = [
    "Food & Beverage", "Travel & Tourism", "Real Estate", "Technology", "Health & Wellness", "Education", "E-commerce", "Finance",
    "Automotive", "Fashion & Apparel", "Entertainment", "Logistics", "Agriculture", "Construction", "IT Services", "Media & PR",
    "Energy & Power", "Retail", "Software Dev", "Hardware", "Hospitality", "Consulting", "Manufacturing", "Import/Export",
    "Telecom", "Legal Services", "Marketing", "Architecture", "Design", "Non-Profit", "HR & Staffing", "Event Management",
    "Photography", "Beauty & Care", "Fitness", "Aviation", "Printing", "Transport", "Environment", "Sports",
    "Gaming", "Art & Crafts", "Web Development", "SEO Services", "AI & Robotics", "VR/AR", "Blockchain", "CyberSecurity",
    "Cloud Computing", "Biotechnology", "SpaceTech", "Defense & Aerospace", "CleanTech", "EdTech", "FinTech", "HealthTech",
    "AgriTech", "PropTech", "LegalTech", "InsurTech", "Data Analytics", "Drones", "IoT", "Nanotechnology"
];

// --- ICON DATA (64 sector mapping) ---
const INVESTMENT_ICONS = [
    Utensils, Plane, Building2, Monitor, Heart, GraduationCap, ShoppingCart, Banknote,
    Car, Shirt, Music, Truck, Sprout, HardHat, Megaphone,
    Zap, Store, Code2, Cpu, Hotel, Briefcase, Factory, Ship,
    Phone, Scale, BarChart3, PenTool, Palette, HeartHandshake, UserPlus, Calendar,
    Camera, Sparkles, Dumbbell, PlaneLanding, Printer, Bus, Leaf, Medal,
    Gamepad2, Brush, Globe, Search, Bot, Glasses, Bitcoin, ShieldCheck,
    Cloud, Microscope, Rocket, Shield, Sun, BookOpen, Wallet, Activity,
    Tractor, Home, Gavel, FileLineChart, PlaneTakeoff, Atom, Network, Database
];

// --- SINGLE ICON IN 3D SPACE ---
function SingleIcon({ icon: Icon, position, idx }: { icon: any, position: [number, number, number], idx: number }) {
    return (
        <Float speed={1.2 + (idx % 5) * 0.2} rotationIntensity={0.2} floatIntensity={0.4}>
            <Html position={position} center zIndexRange={[0, 0]}>
                <div style={{
                    color: idx % 3 === 0 ? '#0ea5e9' : idx % 3 === 1 ? '#2563eb' : '#0369a1',
                    opacity: 0.7,
                    filter: 'drop-shadow(0 0 4px rgba(14,165,233,0.5))'
                }}>
                    <Icon size={16} strokeWidth={1.5} />
                </div>
            </Html>
        </Float>
    );
}

// --- PARTICLE GLOBE SURFACE ---
function GlobeSurface() {
    const groupRef = useRef<THREE.Group>(null!);

    const spherePositions = useMemo(() => {
        const count = 8000;
        const pos = new Float32Array(count * 3);
        const radius = 20;
        for (let i = 0; i < count; i++) {
            const u = Math.random();
            const v = Math.random();
            const phi = Math.acos(2 * u - 1);
            const theta = 2 * Math.PI * v;
            pos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
            pos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            pos[i * 3 + 2] = radius * Math.cos(phi);
        }
        return pos;
    }, []);

    const innerPositions = useMemo(() => {
        const count = 3000;
        const pos = new Float32Array(count * 3);
        const radius = 19.5;
        for (let i = 0; i < count; i++) {
            const u = Math.random();
            const v = Math.random();
            const phi = Math.acos(2 * u - 1);
            const theta = 2 * Math.PI * v;
            pos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
            pos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            pos[i * 3 + 2] = radius * Math.cos(phi);
        }
        return pos;
    }, []);

    useFrame((state, delta) => {
        if (groupRef.current) {
            groupRef.current.rotation.y += delta * 0.1;
            groupRef.current.rotation.x += delta * 0.035;
        }
    });

    return (
        <group ref={groupRef}>
            <points>
                <bufferGeometry>
                    <bufferAttribute attach="attributes-position" args={[spherePositions, 3]} />
                </bufferGeometry>
                <pointsMaterial size={0.18} color="#38bdf8" transparent opacity={0.8} sizeAttenuation />
            </points>
            <points>
                <bufferGeometry>
                    <bufferAttribute attach="attributes-position" args={[innerPositions, 3]} />
                </bufferGeometry>
                <pointsMaterial size={0.25} color="#7dd3fc" transparent opacity={0.25} sizeAttenuation />
            </points>
        </group>
    );
}

// --- ICON GALAXY (orbiting icons around the globe) ---
function IconGalaxy() {
    const groupRef = useRef<THREE.Group>(null!);
    const iconCount = 64;

    const iconData = useMemo(() => {
        return Array.from({ length: iconCount }).map((_, i) => {
            const phi = Math.acos(-1 + (2 * i) / iconCount);
            const theta = Math.sqrt(iconCount * Math.PI) * phi;
            const radius = 30 + (i % 4) * 2; // Icons orbit OUTSIDE the globe (radius 20)
            return {
                icon: INVESTMENT_ICONS[i % INVESTMENT_ICONS.length],
                position: [
                    radius * Math.cos(theta) * Math.sin(phi),
                    radius * Math.sin(theta) * Math.sin(phi),
                    radius * Math.cos(phi)
                ] as [number, number, number],
                idx: i
            };
        });
    }, []);

    useFrame((state, delta) => {
        if (groupRef.current) {
            groupRef.current.rotation.y += delta * 0.1;
            groupRef.current.rotation.x += delta * 0.035;
        }
    });

    return (
        <group ref={groupRef}>
            {iconData.map((data, i) => (
                <SingleIcon key={i} {...data} />
            ))}
            <Html center zIndexRange={[0, 0]}>
                <div style={{
                    color: '#0284c7',
                    opacity: 1,
                    filter: 'drop-shadow(0 0 12px rgba(14,165,233,0.9)) drop-shadow(0 0 30px rgba(14,165,233,0.5))'
                }}>
                    <Handshake size={56} strokeWidth={1.2} />
                </div>
            </Html>
        </group>
    );
}

// --- PARTICLE DOTS ---
function ParticleField() {
    const pointsRef = useRef<THREE.Points>(null!);
    const count = 1500;

    const { positions, colors } = useMemo(() => {
        const pos = new Float32Array(count * 3);
        const col = new Float32Array(count * 3);
        const c1 = new THREE.Color("#0ea5e9");
        const c2 = new THREE.Color("#2563eb");
        for (let i = 0; i < count; i++) {
            pos[i * 3] = (Math.random() - 0.5) * 180;
            pos[i * 3 + 1] = (Math.random() - 0.5) * 180;
            pos[i * 3 + 2] = (Math.random() - 0.5) * 180;
            const c = i % 2 === 0 ? c1 : c2;
            col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
        }
        return { positions: pos, colors: col };
    }, []);

    useFrame((state, delta) => {
        if (pointsRef.current) {
            pointsRef.current.rotation.y += delta * 0.015;
        }
    });

    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" args={[positions, 3]} />
                <bufferAttribute attach="attributes-color" args={[colors, 3]} />
            </bufferGeometry>
            <pointsMaterial size={0.08} vertexColors transparent opacity={0.3} />
        </points>
    );
}

// --- FLOATING BADGE ---
const FloatingBadge = ({ children, className, delay = 0 }: { children: React.ReactNode, className?: string, delay?: number }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1, y: [0, -8, 0] }}
        transition={{
            opacity: { duration: 0.5, delay },
            scale: { duration: 0.5, delay },
            y: { duration: 4, repeat: Infinity, ease: "easeInOut", delay: delay + 0.5 }
        }}
        className={`absolute hidden md:flex items-center gap-2 px-4 py-2 rounded-full border border-sky-100 bg-white/80 backdrop-blur-sm shadow-lg shadow-sky-100/50 z-20 ${className}`}
    >
        {children}
    </motion.div>
);

// --- COUNT UP ---
function CountUp({ end, duration = 2, suffix = "", prefix = "" }: { end: number, duration?: number, suffix?: string, prefix?: string }) {
    const [count, setCount] = useState(0);
    const nodeRef = useRef(null);
    const [hasAnimated, setHasAnimated] = useState(false);

    useEffect(() => {
        if (hasAnimated) return;
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                let current = 0;
                const increment = Math.ceil(end / (duration * 60));
                const timer = setInterval(() => {
                    current += increment;
                    if (current >= end) { setCount(end); clearInterval(timer); }
                    else setCount(current);
                }, 16);
                setHasAnimated(true);
            }
        }, { threshold: 0.1 });
        if (nodeRef.current) observer.observe(nodeRef.current);
        return () => observer.disconnect();
    }, [end, duration, hasAnimated]);

    return <span ref={nodeRef}>{prefix}{count.toLocaleString()}{suffix}</span>;
}

// --- FAQ ACCORDION ---
const FAQ_ITEMS = [
    {
        q: "What is BharatNivesh Summit 2026?",
        a: "BharatNivesh Summit is India's first hybrid investment summit, connecting verified investors directly with GST-registered, high-growth businesses — both in-person and online simultaneously. It is DBI's flagship event, launching its 1st edition in 2026."
    },
    {
        q: "Who should attend this summit?",
        a: "The summit is ideal for: serious investors looking for verified deal flow, business owners seeking capital and strategic partnerships, industry leaders, policymakers, VCs, angel investors, and startup founders across all sectors."
    },
    {
        q: "How can I register as a Business or Investor?",
        a: "Click the 'Apply as Business' or 'Apply as Investor' button anywhere on this page. Fill in the pre-registration form with your details. Our team will verify your profile and onboard you into the BharatNivesh ecosystem."
    },
    {
        q: "Is the summit online, offline, or both?",
        a: "BharatNivesh Summit 2026 is fully hybrid — meaning investor-business meetings, panel sessions, and keynotes happen both in-person at our physical venue AND streamed live online, so participants from anywhere in India can join."
    },
    {
        q: "What sectors are covered at the summit?",
        a: "We cover 64+ sectors including Technology, FinTech, AgriTech, Real Estate, Healthcare, Manufacturing, Clean Energy, EdTech, Logistics, Retail, and more. Any GST-verified business across India can apply to participate."
    },
    {
        q: "When and where will the summit take place?",
        a: "Dates and venue are to be announced (TBA) — Season 1, 2026. The event will be Pan-India accessible. Register now to get early-bird notifications, priority seating, and exclusive pre-summit investor networking access."
    },
];

function FAQAccordion() {
    const [openIdx, setOpenIdx] = useState<number | null>(0);
    return (
        <div className="space-y-4">
            {FAQ_ITEMS.map((item, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.07 }}
                    className={`rounded-2xl border transition-all duration-300 overflow-hidden ${openIdx === i ? 'border-sky-400/50 shadow-lg shadow-sky-100/60 bg-white' : 'border-slate-200 bg-white hover:border-sky-200'}`}
                >
                    <button
                        onClick={() => setOpenIdx(openIdx === i ? null : i)}
                        className="w-full flex items-center justify-between px-7 py-6 text-left group"
                    >
                        <span className={`font-black text-base italic uppercase tracking-tight transition-colors ${openIdx === i ? 'text-sky-600' : 'text-slate-900 group-hover:text-sky-600'}`}>
                            {item.q}
                        </span>
                        <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ml-4 transition-all duration-300 ${openIdx === i ? 'bg-sky-600 rotate-45' : 'bg-slate-100 group-hover:bg-sky-50'}`}>
                            <span className={`text-xl font-black leading-none transition-colors ${openIdx === i ? 'text-white' : 'text-slate-500'}`}>+</span>
                        </div>
                    </button>
                    {openIdx === i && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="px-7 pb-6"
                        >
                            <div className="border-t border-slate-100 pt-4">
                                <p className="text-slate-500 leading-relaxed font-medium italic text-[15px]">{item.a}</p>
                            </div>
                        </motion.div>
                    )}
                </motion.div>
            ))}
        </div>
    );
}

// --- RESPONSIVE CAMERA ---
function ResponsiveCamera() {
    const { camera, size } = useThree();
    useEffect(() => {
        if (size.width < 768) {
            camera.position.set(0, 0, 100);
        } else {
            camera.position.set(0, 0, 65);
        }
        camera.updateProjectionMatrix();
    }, [size.width, camera]);
    return null;
}

// --- MAIN PAGE ---
export default function EventLandingPage() {
    return (
        <div className="bg-[#f8fafc] text-slate-900 selection:bg-sky-500/30 overflow-x-hidden min-h-screen">

            {/* Hero Section */}
            <section className="relative flex flex-col justify-start pt-[80px] lg:pt-[100px] pb-10 overflow-hidden min-h-screen">

                {/* Background dot grid */}
                <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:40px_40px]" />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/60 to-white" />
                </div>


                {/* 2-Column Grid Layout */}
                <div className="relative z-10 max-w-7xl mx-auto w-full px-8 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">

                    {/* LEFT: Text Content */}
                    <div className="flex flex-col items-start lg:-mt-12 xl:-mt-20">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-8 px-5 py-2 rounded-full border border-sky-100 bg-sky-50/80 backdrop-blur-md shadow-sm flex items-center gap-3"
                        >
                            <div className="flex -space-x-2">
                                {[
                                    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&h=100&auto=format&fit=crop",
                                    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&h=100&auto=format&fit=crop",
                                    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=100&h=100&auto=format&fit=crop"
                                ].map((src, i) => (
                                    <div key={i} className="w-7 h-7 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
                                        <img src={src} alt="User" className="w-full h-full object-cover" />
                                    </div>
                                ))}
                            </div>
                            <span className="text-[9px] sm:text-[10px] font-black text-sky-700 uppercase tracking-widest sm:tracking-[0.2em]">🇮🇳 &nbsp;India&apos;s First Hybrid Investment Summit</span>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                            className="text-[2.25rem] sm:text-5xl md:text-6xl lg:text-[68px] font-black tracking-tighter text-slate-900 mb-6 leading-tight uppercase italic"
                        >
                            <span className="block opacity-80 mb-2">BharatNivesh</span>
                            <span className="text-transparent bg-clip-text bg-gradient-to-br from-sky-500 via-blue-600 to-sky-400 inline-block pb-4 pr-4">
                                Summit 2026
                            </span>
                        </motion.h1>

                        <div className="flex items-center gap-2 sm:gap-4 mb-6">
                            <div className="h-[2px] w-8 sm:w-16 bg-gradient-to-r from-sky-400 to-transparent" />
                            <p className="text-[10px] sm:text-sm text-slate-500 font-bold uppercase tracking-widest sm:tracking-[0.3em] italic whitespace-nowrap">1st Edition · Hybrid · 2026</p>
                            <div className="h-[2px] w-8 sm:w-16 bg-gradient-to-l from-sky-400 to-transparent" />
                        </div>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5, duration: 1 }}
                            className="text-slate-400 font-medium text-lg max-w-lg mb-10 italic leading-relaxed"
                        >
                            India&apos;s first hybrid investment summit — meet verified investors and high-growth businesses in-person and online, at the same time.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8 }}
                        >
                            <Link href="/apply/business">
                                <button className="group relative bg-sky-600 text-white font-black text-lg sm:text-xl px-10 sm:px-14 py-4 sm:py-5 rounded-full overflow-hidden transition-all hover:scale-105 active:scale-95 duration-300 shadow-2xl shadow-sky-200 flex items-center gap-3">
                                    <span className="relative z-10">GET STARTED</span>
                                    <ChevronRight className="relative z-10 group-hover:translate-x-1 transition-transform" />
                                    <div className="absolute inset-0 bg-gradient-to-r from-sky-500 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </button>
                            </Link>
                        </motion.div>
                    </div>

                    <div className="w-full h-[350px] sm:h-[450px] md:h-[500px] lg:h-[550px] xl:h-[600px] relative z-20 mt-4 md:mt-0">
                        <Canvas camera={{ position: [0, 0, 65], fov: 42 }}>
                            <ResponsiveCamera />
                            <ambientLight intensity={1} />
                            <pointLight position={[10, 10, 10]} intensity={200} color="#0ea5e9" />
                            <pointLight position={[-10, -10, 10]} intensity={100} color="#2563eb" />
                            <GlobeSurface />
                            <IconGalaxy />
                            <ParticleField />
                        </Canvas>
                    </div>

                </div>
            </section>

            {/* Marquee Section */}
            <div className="relative flex overflow-hidden w-full bg-slate-900 py-6 border-y border-slate-800 z-10">
                <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-slate-900 to-transparent z-20 pointer-events-none" />
                <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-slate-900 to-transparent z-20 pointer-events-none" />

                <motion.div
                    animate={{ x: ["0%", "-50%"] }}
                    transition={{ repeat: Infinity, ease: "linear", duration: 80 }}
                    className="flex whitespace-nowrap min-w-max"
                >
                    {[...MARQUEE_CATEGORIES, ...MARQUEE_CATEGORIES].map((cat, i) => (
                        <div key={i} className="px-6 flex items-center gap-3">
                            <span className="text-sky-500">•</span>
                            <span className="text-slate-300 font-bold uppercase tracking-widest text-[10px] hover:text-white transition-colors cursor-default">
                                {cat}
                            </span>
                        </div>
                    ))}
                </motion.div>
            </div>

            {/* Stats */}
            <section className="py-20 px-4 bg-white relative z-10">
                <div className="max-w-6xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { label: "Expected Investors", val: 500, suffix: "+" },
                        { label: "Businesses Onboarding", val: 200, suffix: "+" },
                        { label: "Hybrid Reach (Cities)", val: 50, suffix: "+" },
                        { label: "1st Edition", val: 2026, suffix: "" }
                    ].map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="text-center p-8 rounded-[2.5rem] bg-slate-50 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all group"
                        >
                            <h3 className="text-4xl font-black text-slate-900 mb-2 italic tracking-tighter group-hover:text-sky-600 transition-colors">
                                <CountUp end={stat.val} prefix={(stat as any).prefix || ""} suffix={stat.suffix} />
                            </h3>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* About Section */}
            <section className="py-10 px-4 bg-[#f8fafc] relative overflow-hidden">
                <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                    <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-50 text-sky-600 text-[10px] font-black uppercase tracking-widest mb-8">
                            <div className="w-1.5 h-1.5 rounded-full bg-sky-600 animate-pulse" />
                            Pre-Registration Open
                        </div>
                        <h2 className="text-5xl md:text-7xl font-black mb-8 text-slate-900 leading-[0.85] italic uppercase tracking-tighter">
                            Where Capital <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-600">Meets Vision.</span>
                        </h2>
                        <p className="text-slate-500 text-xl mb-12 leading-relaxed font-medium italic max-w-lg">
                            BharatNivesh Summit is DBI&apos;s flagship hybrid investment event — connecting serious investors directly with verified, GST-registered businesses across India. First edition. Happening 2026.
                        </p>
                        <div className="grid grid-cols-2 gap-8">
                            <div className="flex gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center shrink-0">
                                    <Calendar className="text-slate-900" size={22} />
                                </div>
                                <div>
                                    <p className="font-black text-slate-900 italic uppercase">Dates TBA</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Season 1 · 2026</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center shrink-0">
                                    <MapPin className="text-slate-900" size={22} />
                                </div>
                                <div>
                                    <p className="font-black text-slate-900 italic uppercase">Pan-India</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Online + Offline Hybrid</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <div className="relative">
                        <div className="absolute -inset-10 bg-sky-200/20 rounded-full blur-[100px] z-0" />
                        <div className="relative z-10 grid grid-cols-2 gap-5">
                            {[
                                { icon: Users, label: "Verified\nInvestors", path: "verified-investors", dark: true },
                                { icon: Rocket, label: "High\nGrowth", path: "high-growth", blue: true, offset: true },
                                { icon: Globe, label: "Hybrid\nFormat", path: "hybrid-format", light: true },
                                { icon: Handshake, label: "Direct\nDeals", path: "direct-deals", dark: true, offset: true }
                            ].map((card, i) => (
                                <Link key={i} href={`/${card.path}`}>
                                    <div className={`h-full aspect-square rounded-[2.5rem] p-7 flex flex-col justify-end hover:scale-105 transition-transform cursor-pointer shadow-xl
                                        ${card.dark ? "bg-slate-900 text-white" : card.blue ? "bg-sky-600 text-white" : "bg-sky-50 border border-sky-100 text-slate-900"}
                                        ${card.offset ? "translate-y-10" : ""}
                                    `}>
                                        <card.icon size={28} className={`mb-3 ${card.dark || card.blue ? "text-sky-400" : "text-sky-600"}`} />
                                        <p className="text-xl font-black italic uppercase tracking-tighter leading-none whitespace-pre-line">{card.label}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Core Features */}
            <section className="py-10 px-4 bg-white relative">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-20">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-50 text-sky-600 text-[10px] font-black uppercase tracking-[0.3em] mb-6">
                            <Rocket size={11} /> Innovation Engine
                        </div>
                        <h2 className="text-5xl md:text-7xl font-black text-slate-900 italic uppercase tracking-tighter leading-none">
                            The <span className="text-sky-600">Features.</span>
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { icon: Search, title: "Discovery", desc: "Advanced filtering to find highest potential enterprises.", color: "from-blue-500 to-sky-400" },
                            { icon: ShieldCheck, title: "Verification", desc: "Rigorous Aadhaar & GST checks for total ecosystem trust.", color: "from-sky-600 to-blue-500" },
                            { icon: Rocket, title: "Growth", desc: "Direct access to high-impact enterprises ready for investment.", color: "from-blue-600 to-indigo-500" },
                            { icon: Handshake, title: "Networking", desc: "Meaningful connections without intermediaries.", color: "from-slate-900 to-slate-800" }
                        ].map((item, i) => (
                            <Link key={i} href={`/${item.title.toLowerCase()}`} className="block focus:outline-none h-full">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    whileHover={{ y: -10 }}
                                    className="group bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 cursor-pointer h-full"
                                >
                                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-7 shadow-lg group-hover:scale-110 transition-transform`}>
                                        <item.icon size={24} className="text-white" />
                                    </div>
                                    <h3 className="text-xl font-black mb-3 text-slate-900 italic uppercase tracking-tighter">{item.title}</h3>
                                    <p className="text-slate-500 text-sm leading-relaxed italic font-medium">{item.desc}</p>
                                </motion.div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Key Speakers */}
            <section className="py-10 px-4 bg-slate-900 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#0ea5e920_0%,transparent_60%)] pointer-events-none" />
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-20">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-[10px] font-black uppercase tracking-[0.3em] mb-6">
                            <Users size={11} /> Keynote Leaders
                        </div>
                        <h2 className="text-5xl md:text-7xl font-black text-white italic uppercase tracking-tighter leading-none">
                            Key <span className="text-sky-400">Speakers.</span>
                        </h2>
                        <p className="text-slate-400 mt-4 text-lg italic font-medium">Visionaries shaping India&apos;s investment landscape</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            {
                                name: "Roop Rashi Mahapatra, IAS",
                                role: "CEO, Khadi and Village Industries Commission",
                                org: "Government of India, Ministry of MSME",
                                img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400&h=500&auto=format&fit=crop"
                            },
                            {
                                name: "Srinivasulu, IFS",
                                role: "Principal Secretary, Forest, Ecology and Environment Department",
                                org: "Govt. of Karnataka",
                                img: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=400&h=500&auto=format&fit=crop"
                            },
                            {
                                name: "Dr. Arun Kumar",
                                role: "Director General, SIDBI",
                                org: "Small Industries Development Bank of India",
                                img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=400&h=500&auto=format&fit=crop"
                            },
                        ].map((speaker, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="group bg-slate-800/60 border border-slate-700/50 rounded-[2rem] overflow-hidden hover:border-sky-500/40 hover:-translate-y-2 transition-all duration-500 shadow-xl"
                            >
                                <div className="relative overflow-hidden bg-[#c8b89a] h-72">
                                    <img src={speaker.img} alt={speaker.name} className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
                                </div>
                                <div className="p-6">
                                    <p className="font-black text-white text-lg italic uppercase tracking-tight">{speaker.name}</p>
                                    <p className="text-sky-400 text-sm font-bold mt-1">{speaker.role}</p>
                                    <p className="text-slate-500 text-xs mt-1 font-medium">{speaker.org}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Speakers & Panelists */}
            <section className="py-10 px-4 bg-[#1e3a5f] relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,#0ea5e915_0%,transparent_60%)] pointer-events-none" />
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-20">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-[10px] font-black uppercase tracking-[0.3em] mb-6">
                            <Sparkles size={11} /> Expert Panel
                        </div>
                        <h2 className="text-5xl md:text-7xl font-black text-white italic uppercase tracking-tighter leading-none">
                            Speakers & <span className="text-sky-400">Panelists.</span>
                        </h2>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                        {[
                            { name: "Aditya Narayan Mishra", role: "MD & CEO", org: "CIEL HR Services Limited", img: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=300&h=350&auto=format&fit=crop" },
                            { name: "Anjali Taneja", role: "Regulatory Affairs Leader", org: "Inter IKEA Group", img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=300&h=350&auto=format&fit=crop" },
                            { name: "Arun K. Balasubramanian", role: "Chief Sustainability Officer", org: "Elfonze Technologies Pvt Ltd.", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&h=350&auto=format&fit=crop" },
                            { name: "Ashwin Varma", role: "Chief Operating Officer", org: "Ohmium International", img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=300&h=350&auto=format&fit=crop" },
                            { name: "Deepak Sharma", role: "VP, Strategy & Innovation", org: "Tata Capital Limited", img: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=300&h=350&auto=format&fit=crop" },
                            { name: "Priya Nair", role: "Director, ESG & Sustainability", org: "Hindustan Unilever", img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=300&h=350&auto=format&fit=crop" },
                            { name: "Rajiv Mehta", role: "Managing Partner", org: "Sequoia Capital India", img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=300&h=350&auto=format&fit=crop" },
                            { name: "Sunita Rao", role: "Chief Investment Officer", org: "National Investment & Infra Fund", img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=300&h=350&auto=format&fit=crop" },
                        ].map((p, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.07 }}
                                className="group bg-[#c8b89a]/20 border border-[#c8b89a]/20 rounded-[1.5rem] overflow-hidden hover:border-sky-400/40 hover:-translate-y-2 transition-all duration-500"
                            >
                                <div className="bg-[#c8b89a] h-48 overflow-hidden">
                                    <img src={p.img} alt={p.name} className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-700" />
                                </div>
                                <div className="p-4">
                                    <p className="font-black text-white text-sm italic">{p.name}</p>
                                    <p className="text-sky-400 text-[11px] font-bold mt-0.5">{p.role}</p>
                                    <p className="text-slate-400 text-[10px] mt-0.5">{p.org}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>



            {/* Advisory Board */}
            <section className="py-10 px-4 bg-[#1e3a5f] relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,#0ea5e915_0%,transparent_60%)] pointer-events-none" />
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-20">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-[10px] font-black uppercase tracking-[0.3em] mb-6">
                            <ShieldCheck size={11} /> Strategic Guidance
                        </div>
                        <h2 className="text-5xl md:text-7xl font-black text-white italic uppercase tracking-tighter leading-none">
                            Advisory <span className="text-sky-400">Board.</span>
                        </h2>
                        <p className="text-slate-400 mt-4 text-lg italic font-medium">Distinguished leaders guiding the summit&apos;s vision</p>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                        {[
                            { name: "Dr. Sandip Chatterjee", role: "Senior Advisor", org: "SERI", img: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=300&h=350&auto=format&fit=crop" },
                            { name: "Sujeet Samaddar", role: "Founder & Adviser", org: "SAMDeS | MRAI", img: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=300&h=350&auto=format&fit=crop" },
                            { name: "Prabhjot Sodhi", role: "Senior Programme Director", org: "Centre for Environment Education; MRAI", img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=300&h=350&auto=format&fit=crop" },
                            { name: "D B Prabhu", role: "CEO", org: "Respose India Pvt Ltd", img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=300&h=350&auto=format&fit=crop" },
                            { name: "Anand Verma", role: "Director", org: "Invest India", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&h=350&auto=format&fit=crop" },
                            { name: "Meera Krishnan", role: "Partner", org: "Deloitte India", img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=300&h=350&auto=format&fit=crop" },
                            { name: "Vikram Bose", role: "Managing Director", org: "SIDBI Venture Capital Ltd.", img: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=300&h=350&auto=format&fit=crop" },
                            { name: "Nandita Sharma", role: "Chief Strategy Officer", org: "NASSCOM Foundation", img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=300&h=350&auto=format&fit=crop" },
                        ].map((a, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.08 }}
                                className="group bg-white/5 border border-white/10 rounded-[1.5rem] overflow-hidden hover:border-sky-400/40 hover:-translate-y-2 transition-all duration-500"
                            >
                                <div className="bg-[#c8b89a] h-48 overflow-hidden">
                                    <img src={a.img} alt={a.name} className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-700" />
                                </div>
                                <div className="p-4">
                                    <p className="font-black text-white text-sm italic">{a.name}</p>
                                    <p className="text-sky-400 text-[11px] font-bold mt-0.5">{a.role}</p>
                                    <p className="text-slate-400 text-[10px] mt-0.5">{a.org}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-10 px-4 bg-[#f8fafc] relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:40px_40px] opacity-30 pointer-events-none" />
                <div className="max-w-4xl mx-auto relative z-10">
                    <div className="text-center mb-20">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-50 text-sky-600 text-[10px] font-black uppercase tracking-[0.3em] mb-6">
                            <Search size={11} /> Quick Answers
                        </div>
                        <h2 className="text-5xl md:text-7xl font-black text-slate-900 italic uppercase tracking-tighter leading-none">
                            Frequently <span className="text-sky-600">Asked.</span>
                        </h2>
                        <p className="text-slate-400 mt-4 text-lg italic font-medium">Everything you need to know about BharatNivesh Summit 2026</p>
                    </div>
                    <FAQAccordion />
                </div>
            </section>

            {/* CTA */}
            <section className="py-10 px-2 bg-[#f8fafc] flex flex-col items-center text-center">
                <p className="text-slate-400 font-bold italic mb-8 uppercase tracking-widest text-xs">Ready to grow your enterprise?</p>
                <div className="flex flex-col sm:flex-row gap-6">
                    <Link href="/apply/business">
                        <button className="bg-sky-600 text-white font-black text-lg px-12 py-5 rounded-full shadow-xl shadow-sky-200 hover:scale-105 active:scale-95 transition-all">
                            APPLY AS BUSINESS
                        </button>
                    </Link>
                    <Link href="/apply/investor">
                        <button className="bg-slate-900 text-white font-black text-lg px-12 py-5 rounded-full shadow-xl shadow-slate-200 hover:scale-105 active:scale-95 transition-all">
                            APPLY AS INVESTOR
                        </button>
                    </Link>
                </div>
            </section>

        </div>
    );
}
