"use client";

import React, { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { motion } from "framer-motion";
import { Rocket, ShieldCheck, Users, Handshake, TrendingUp, Calendar, MapPin, Search, Globe, ChevronRight } from "lucide-react";
import Link from "next/link";

// --- 3D PARTICLE GLOBE COMPONENT ---
function ParticleGlobe() {
    const pointsRef = useRef<THREE.Points>(null!);
    const count = 10000;
    const [formation, setFormation] = useState(0);

    useEffect(() => {
        const timer = setTimeout(() => setFormation(1), 500);
        return () => clearTimeout(timer);
    }, []);

    const { randomPositions, spherePositions, colors } = useMemo(() => {
        const randomPos = new Float32Array(count * 3);
        const spherePos = new Float32Array(count * 3);
        const colorArray = new Float32Array(count * 3);

        const color1 = new THREE.Color("#0ea5e9");
        const color2 = new THREE.Color("#2563eb");

        for (let i = 0; i < count; i++) {
            randomPos[i * 3] = (Math.random() - 0.5) * 60;
            randomPos[i * 3 + 1] = (Math.random() - 0.5) * 60;
            randomPos[i * 3 + 2] = (Math.random() - 0.5) * 60;

            const phi = Math.acos(-1 + (2 * i) / count);
            const theta = Math.sqrt(count * Math.PI) * phi;
            const radius = 22; // Slightly larger

            spherePos[i * 3] = radius * Math.cos(theta) * Math.sin(phi);
            spherePos[i * 3 + 1] = radius * Math.sin(theta) * Math.sin(phi);
            spherePos[i * 3 + 2] = radius * Math.cos(phi);

            const mixedColor = i % 2 === 0 ? color1 : color2;
            colorArray[i * 3] = mixedColor.r;
            colorArray[i * 3 + 1] = mixedColor.g;
            colorArray[i * 3 + 2] = mixedColor.b;
        }
        return { randomPositions: randomPos, spherePositions: spherePos, colors: colorArray };
    }, []);

    useFrame((state, delta) => {
        const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
        pointsRef.current.rotation.y += delta * 0.15;
        pointsRef.current.rotation.x += delta * 0.08;

        for (let i = 0; i < count; i++) {
            const i3 = i * 3;
            if (formation > 0) {
                positions[i3] += (spherePositions[i3] - positions[i3]) * 0.05;
                positions[i3 + 1] += (spherePositions[i3 + 1] - positions[i3 + 1]) * 0.05;
                positions[i3 + 2] += (spherePositions[i3 + 2] - positions[i3 + 2]) * 0.05;
            }
        }
        pointsRef.current.geometry.attributes.position.needsUpdate = true;
    });

    return (
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[randomPositions, 3]} />
          <bufferAttribute attach="attributes-color" args={[colors, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.07} vertexColors transparent opacity={0.6} sizeAttenuation />
      </points>
    );
}

const FloatingBadge = ({ children, className, delay = 0 }: { children: React.ReactNode, className?: string, delay?: number }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1, y: [0, -10, 0] }}
        transition={{ 
            opacity: { duration: 0.5, delay },
            scale: { duration: 0.5, delay },
            y: { duration: 3, repeat: Infinity, ease: "easeInOut", delay: delay + 0.5 }
        }}
        className={`absolute hidden md:flex items-center gap-2 px-4 py-2 rounded-full border border-sky-100 bg-white/80 backdrop-blur-sm shadow-lg shadow-sky-100/50 z-20 ${className}`}
    >
        {children}
    </motion.div>
);

// --- COUNTER COMPONENT ---
function CountUp({ end, duration = 2, suffix = "", prefix = "" }: { end: number, duration?: number, suffix?: string, prefix?: string }) {
    const [count, setCount] = useState(0);
    const nodeRef = useRef(null);
    const [hasAnimated, setHasAnimated] = useState(false);

    useEffect(() => {
        if (hasAnimated) return;
        
        // Simple intersection observer to start animation when in view
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                let start = 0;
                const endVal = end;
                const stepTime = Math.abs(Math.floor(duration * 1000 / endVal));
                
                const timer = setInterval(() => {
                    start += 1;
                    setCount(start);
                    if (start >= endVal) {
                        clearInterval(timer);
                        setCount(endVal); // Ensure it lands exactly
                    }
                }, Math.max(stepTime, 10)); // Min 10ms for smooth animate
                
                setHasAnimated(true);
            }
        }, { threshold: 0.1 });

        if (nodeRef.current) observer.observe(nodeRef.current);
        return () => observer.disconnect();
    }, [end, duration, hasAnimated]);

    return <span ref={nodeRef}>{prefix}{count}{suffix}</span>;
}

export default function EventLandingPage() {
    return (
        <div className="bg-[#f8fafc] text-slate-900 selection:bg-sky-500/30 overflow-x-hidden min-h-screen">
            {/* Background Decorations */}
            <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.4]">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:40px_40px]" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/80 to-white" />
            </div>

            {/* Hero Section */}
            <section className="relative min-h-screen flex flex-col items-center justify-center pt-20 pb-32 overflow-hidden">
                {/* 3D Canvas Container */}
                <div className="absolute inset-0 z-0 scale-125 md:scale-100">
                    <Canvas camera={{ position: [0, 0, 60], fov: 45 }}>
                        <color attach="background" args={["#f8fafc"]} />
                        <ambientLight intensity={1} />
                        <pointLight position={[10, 10, 10]} intensity={2} color="#0ea5e9" />
                        <ParticleGlobe />
                    </Canvas>
                </div>

                {/* Floating Elements */}
                <FloatingBadge className="top-[25%] left-[10%]" delay={1}>
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">250+ Active Investors</span>
                </FloatingBadge>
                <FloatingBadge className="top-[35%] right-[8%] shadow-blue-100" delay={1.2}>
                    <ShieldCheck className="text-sky-500" size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">GST Verified Profiles</span>
                </FloatingBadge>
                <FloatingBadge className="bottom-[40%] left-[8%] shadow-blue-100" delay={1.4}>
                    <TrendingUp className="text-blue-600" size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">High Deal Flow</span>
                </FloatingBadge>
                <FloatingBadge className="bottom-[30%] right-[15%]" delay={1.6}>
                    <Handshake className="text-sky-600" size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Direct Networking</span>
                </FloatingBadge>

                {/* Hero Content */}
                <div className="relative z-10 flex flex-col items-center max-w-6xl w-full px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8 px-6 py-2 rounded-full border border-sky-100 bg-sky-50/50 backdrop-blur-md shadow-sm flex items-center gap-3"
                    >
                        <div className="flex -space-x-2">
                            {[
                                "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&h=100&auto=format&fit=crop",
                                "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&h=100&auto=format&fit=crop",
                                "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=100&h=100&auto=format&fit=crop"
                            ].map((src, i) => (
                                <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
                                     <img src={src} alt="Decision Maker" className="w-full h-full object-cover" />
                                </div>
                            ))}
                        </div>
                        <span className="text-[10px] font-black text-sky-700 uppercase tracking-[0.2em]">Join 10k+ Decision Makers</span>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        className="text-center w-full"
                    >
                        <h1 className="text-5xl md:text-7xl lg:text-[90px] font-black tracking-tighter text-slate-900 mb-6 leading-[0.85] uppercase italic break-words pr-4">
                            <span className="block opacity-80">Empowering</span>
                            <span className="text-transparent bg-clip-text bg-gradient-to-br from-sky-500 via-blue-600 to-sky-400 drop-shadow-sm pr-2">
                                Businesses
                            </span>
                        </h1>
                        <div className="flex items-center justify-center gap-4 md:gap-8 mb-6">
                           <div className="h-[2px] w-12 md:w-32 bg-gradient-to-l from-sky-400 to-transparent" />
                           <p className="text-sm md:text-xl text-slate-500 font-bold uppercase tracking-[0.4em] italic leading-none">Invest Connect 2026</p>
                           <div className="h-[2px] w-12 md:w-32 bg-gradient-to-r from-sky-400 to-transparent" />
                        </div>
                    </motion.div>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5, duration: 1 }}
                        className="text-slate-400 font-medium text-lg md:text-xl max-w-2xl text-center mb-12 italic"
                    >
                        The ultimate destination for India's high-potential enterprises to meet strategic capital.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                        className="flex flex-col sm:flex-row gap-6 items-center"
                    >
                        <Link href="/apply/business">
                            <button className="group relative bg-sky-600 text-white font-black text-xl px-16 py-6 rounded-full overflow-hidden transition-all hover:scale-105 active:scale-95 duration-300 shadow-2xl shadow-sky-200 flex items-center gap-3">
                                <span className="relative z-10">GET STARTED</span>
                                <ChevronRight className="relative z-10 group-hover:translate-x-1 transition-transform" />
                                <div className="absolute inset-0 bg-gradient-to-r from-sky-500 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </button>
                        </Link>
                    </motion.div>

                    {/* Trust Indicators */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        className="mt-24 pt-12 border-t border-slate-100 w-full flex flex-col items-center"
                    >
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] mb-10">Supported by Verified Ecosystems</p>
                        <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20 opacity-30 grayscale hover:grayscale-0 transition-all duration-700">
                             {/* Placeholder generic partner look */}
                             <div className="flex items-center gap-2 font-black text-2xl italic tracking-tighter">
                                <ShieldCheck size={32} /> VERIFY-ID
                             </div>
                             <div className="flex items-center gap-2 font-black text-2xl italic tracking-tighter">
                                <Globe size={32} /> BHARAT-HUB
                             </div>
                             <div className="flex items-center gap-2 font-black text-2xl italic tracking-tighter">
                                <Users size={32} /> ANGEL-NET
                             </div>
                             <div className="flex items-center gap-2 font-black text-2xl italic tracking-tighter">
                                <Rocket size={32} /> SCALE-X
                             </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Rest of the original sections... */}
            {/* Keeping the content but refining it for higher density */}

            {/* Stats Overview */}
            <section className="py-20 px-4 relative z-10">
                <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8">
                    <div className="text-center p-10 rounded-[3rem] bg-white border border-slate-100 shadow-sm transition-all hover:shadow-xl hover:-translate-y-2 group">
                        <h3 className="text-4xl font-black text-slate-900 mb-2 italic tracking-tighter group-hover:text-sky-600 transition-colors">
                            <CountUp end={500} prefix="₹" suffix="Cr+" />
                        </h3>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Valuation</p>
                    </div>
                    <div className="text-center p-10 rounded-[3rem] bg-white border border-slate-100 shadow-sm transition-all hover:shadow-xl hover:-translate-y-2 group">
                        <h3 className="text-4xl font-black text-slate-900 mb-2 italic tracking-tighter group-hover:text-sky-600 transition-colors">
                            <CountUp end={250} suffix="+" />
                        </h3>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Investors</p>
                    </div>
                    <div className="text-center p-10 rounded-[3rem] bg-white border border-slate-100 shadow-sm transition-all hover:shadow-xl hover:-translate-y-2 group">
                        <h3 className="text-4xl font-black text-slate-900 mb-2 italic tracking-tighter group-hover:text-sky-600 transition-colors">
                            <CountUp end={1200} suffix="+" />
                        </h3>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Business Listed</p>
                    </div>
                    <div className="text-center p-10 rounded-[3rem] bg-white border border-slate-100 shadow-sm transition-all hover:shadow-xl hover:-translate-y-2 group">
                        <h3 className="text-4xl font-black text-slate-900 mb-2 italic tracking-tighter group-hover:text-sky-600 transition-colors">
                            <CountUp end={92} suffix="%" />
                        </h3>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Success Rate</p>
                    </div>
                </div>
            </section>

            {/* About Section - Refined */}
            <section className="pt-12 pb-40 px-4 bg-white relative z-10">
                <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-50 text-sky-600 text-[10px] font-black uppercase tracking-widest mb-8">
                            <div className="w-1.5 h-1.5 rounded-full bg-sky-600 animate-pulse" />
                            Phase 1: Registration & Listing
                        </div>
                        <h2 className="text-5xl md:text-7xl font-black mb-8 text-slate-900 leading-[0.85] italic uppercase tracking-tighter pr-4">
                            Bridging the <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-600 pr-2">Trust Gap.</span>
                        </h2>
                        <p className="text-slate-500 text-xl mb-12 leading-relaxed font-medium italic max-w-lg">
                            We are currently in the pre-launch phase, onboarding India's most innovative startups and verified investors for a high-intensity confluence.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="flex gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shrink-0 border border-slate-200 shadow-sm">
                                    <Calendar className="text-slate-900" size={24} />
                                </div>
                                <div>
                                    <p className="font-black text-slate-900 italic uppercase">Dates TBA</p>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none mt-1">Announcing Soon</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shrink-0 border border-slate-200 shadow-sm">
                                    <MapPin className="text-slate-900" size={24} />
                                </div>
                                <div>
                                    <p className="font-black text-slate-900 italic uppercase">Venue TBA</p>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none mt-1">Discovery Phase</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <div className="relative">
                        <div className="absolute -inset-10 bg-sky-200/20 rounded-full blur-[100px] z-0" />
                        <div className="relative z-10 grid grid-cols-2 gap-4 md:gap-6">
                             <div className="aspect-square bg-slate-900 rounded-[2.5rem] md:rounded-[3rem] p-6 md:p-8 flex flex-col justify-end text-white hover:scale-105 transition-transform cursor-pointer shadow-xl shadow-slate-200">
                                <Users size={28} className="mb-4 text-sky-400" />
                                <p className="text-xl md:text-2xl font-black italic mb-2 uppercase tracking-tighter leading-none">Global <br/>Leaders</p>
                             </div>
                             <div className="aspect-square bg-sky-600 rounded-[2.5rem] md:rounded-[3rem] p-6 md:p-8 flex flex-col justify-end text-white translate-y-8 md:translate-y-12 hover:scale-105 transition-transform cursor-pointer shadow-xl shadow-sky-200">
                                <Rocket size={28} className="mb-4 text-sky-100" />
                                <p className="text-xl md:text-2xl font-black italic mb-2 uppercase tracking-tighter leading-none">Speed <br/>Funding</p>
                             </div>
                             <div className="aspect-square bg-sky-50 border border-sky-100 rounded-[2.5rem] md:rounded-[3rem] p-6 md:p-8 flex flex-col justify-end text-slate-900 hover:scale-105 transition-transform cursor-pointer shadow-xl shadow-sky-100/30">
                                <ShieldCheck size={28} className="mb-4 text-sky-600" />
                                <p className="text-xl md:text-2xl font-black italic mb-2 uppercase tracking-tighter leading-none text-sky-900">Expert <br/>Mentors</p>
                             </div>
                             <div className="aspect-square bg-slate-800 rounded-[2.5rem] md:rounded-[3rem] p-6 md:p-8 flex flex-col justify-end text-white translate-y-8 md:translate-y-12 hover:scale-105 transition-transform cursor-pointer shadow-xl shadow-slate-900/20">
                                <Handshake size={28} className="mb-4 text-sky-400" />
                                <p className="text-xl md:text-2xl font-black italic mb-2 uppercase tracking-tighter leading-none">Strategic <br/>Partners</p>
                             </div>
                        </div>
                    </div>
                </div>
            </section>

             {/* Core Highlights - Premium Redesign */}
             <section className="pt-8 pb-10 px-4 bg-[#f8fafc] relative overflow-hidden">
                {/* Background decorative element */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-sky-100/30 rounded-full blur-[120px] -z-10" />

                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
                        <div className="max-w-2xl">
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-sky-100 text-sky-600 text-[10px] font-black uppercase tracking-[0.3em] mb-6 shadow-sm"
                            >
                                <Rocket size={12} />
                                Innovation Engine
                            </motion.div>
                            <h2 className="text-6xl md:text-8xl font-black mb-6 text-slate-900 italic uppercase tracking-tighter leading-none pr-4">
                                The <span className="text-sky-600">Core.</span>
                            </h2>
                            <p className="text-slate-400 text-xl italic font-semibold max-w-md leading-relaxed">
                                Precision matchmaking designed for India's high-performance stakeholders.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            { 
                                icon: Search, 
                                title: "Discovery", 
                                desc: "Advanced algorithmic filtering to find the highest potential enterprises instantly.",
                                color: "from-blue-500 to-sky-400"
                            },
                            { 
                                icon: ShieldCheck, 
                                title: "Verification", 
                                desc: "Every profile undergoes rigorous Aadhaar and GST checks for total ecosystem trust.",
                                color: "from-sky-600 to-blue-500"
                            },
                            { 
                                icon: Rocket, 
                                title: "Core Business", 
                                desc: "Direct access to high-impact Indian enterprises ready for strategic investment.",
                                color: "from-blue-600 to-indigo-500"
                            },
                            { 
                                icon: Handshake, 
                                title: "Networking", 
                                desc: "Direct, meaningful connections without intermediaries. Speed up your deal flow.",
                                color: "from-slate-900 to-slate-800"
                            }
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                whileHover={{ y: -12 }}
                                className="group relative bg-white p-10 rounded-[4rem] border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.03)] hover:shadow-[0_40px_80px_rgba(14,165,233,0.1)] transition-all duration-500 overflow-hidden"
                            >
                                {/* Decorative Gradient Blobs */}
                                <div className={`absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-10 rounded-full blur-3xl transition-opacity duration-500`} />
                                
                                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-8 shadow-lg shadow-sky-100 group-hover:scale-110 transition-transform duration-500`}>
                                    <item.icon size={28} className="text-white" />
                                </div>
                                
                                <h3 className="text-2xl font-black mb-4 text-slate-900 italic uppercase tracking-tighter leading-none">{item.title}</h3>
                                <p className="text-slate-500 text-sm leading-relaxed italic font-medium mb-6">
                                    {item.desc}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Why Choose Us Section */}
            <section className="pt-10 pb-40 px-4 bg-white relative">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-24">
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-50 text-sky-600 text-[10px] font-black uppercase tracking-[0.3em] mb-6"
                        >
                            The DBI Advantage
                        </motion.div>
                        <h2 className="text-5xl md:text-8xl font-black text-slate-900 italic uppercase tracking-tighter leading-none pr-4">
                            Why Choose <span className="text-sky-600">Us.</span>
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        {[
                            {
                                title: "Direct Verified Access",
                                desc: "Connect directly with GST & Aadhaar verified enterprises and investors. No intermediaries, no hidden fees, just pure business.",
                                icon: ShieldCheck
                            },
                            {
                                title: "Premium Deal Flow",
                                desc: "Gain access to a curated selection of high-potential Indian businesses across multiple sectors, vetted for strategic growth.",
                                icon: TrendingUp
                            },
                            {
                                title: "Real-time Networking",
                                desc: "Engage in live digital networking phases designed to accelerate discovery and funding cycles for startups.",
                                icon: Users
                            },
                            {
                                title: "Trusted Ecosystem",
                                desc: "Join a community built on transparency and verified performance metrics, supported by the Digital Bharat Initiative.",
                                icon: Handshake
                            }
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                className="flex gap-8 items-start p-10 rounded-[3rem] bg-[#f8fafc] border border-slate-100 hover:border-sky-200 transition-all hover:shadow-2xl hover:shadow-sky-100 group"
                            >
                                <div className="w-16 h-16 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shrink-0 group-hover:bg-sky-600 transition-all duration-500 shadow-sm">
                                    <item.icon size={28} className="text-sky-600 group-hover:text-white transition-colors" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black mb-4 text-slate-900 italic uppercase tracking-tighter leading-none group-hover:text-sky-700 transition-colors">{item.title}</h3>
                                    <p className="text-slate-500 leading-relaxed italic font-medium">
                                        {item.desc}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Final Minimal CTA */}
                    <div className="mt-32 flex flex-col items-center">
                        <p className="text-slate-400 font-bold italic mb-10 text-center uppercase tracking-widest text-xs">Ready to grow your enterprise?</p>
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
                    </div>
                </div>
            </section>
        </div>
    );
}
