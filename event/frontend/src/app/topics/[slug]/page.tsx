"use client";

import React from "react";
import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import { Users, Handshake, TrendingUp, Briefcase, Calendar, MapPin, Target } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function TopicPage() {
    const params = useParams();
    const slug = (params.slug as string) || "topic";

    // Format slug to readable title
    const title = slug
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
        .replace(' And ', ' & ');
        
    const getCategoryImage = (s: string) => {
        if (s.includes('food') || s.includes('beverage')) return '1504674900247-0877df9cc836';
        if (s.includes('travel') || s.includes('tourism') || s.includes('aviation')) return '1436491865332-7a6baeb5220f';
        if (s.includes('real') || s.includes('prop') || s.includes('architect') || s.includes('construct')) return '1512917774080-9991f1c4c750';
        if (s.includes('health') || s.includes('medical') || s.includes('bio')) return '1505751172876-fa1923c5c528';
        if (s.includes('edu')) return '1523050854058-8df90110c9f1';
        if (s.includes('commerce') || s.includes('retail')) return '1472851294608-061145a8e0e4';
        if (s.includes('financ') || s.includes('insur')) return '1590283603385-17ffb3a7f29f';
        if (s.includes('auto') || s.includes('transport')) return '1492144534655-ae79c964c9d7';
        if (s.includes('fashion') || s.includes('beauty')) return '1445205170230-053b83016050';
        if (s.includes('enter') || s.includes('gaming') || s.includes('media') || s.includes('pr')) return '1511512578047-dfb367046420';
        if (s.includes('logistics') || s.includes('import')) return '1566576912321-573007545eb1'; // boxes/warehouse
        if (s.includes('agri')) return '1500937386664-56d1dfef3854'; // farming tractor
        if (s.includes('energy') || s.includes('clean') || s.includes('environ')) return '1466611653911-95081537e5b7';
        if (s.includes('manu') || s.includes('hard')) return '1581091226825-a6a2a5aee158';
        if (s.includes('art') || s.includes('design') || s.includes('photo')) return '1499892477393-f675841bc283';
        if (s.includes('sport') || s.includes('fitness')) return '1517836357463-d25dfeac3438';
        if (s.includes('cloud') || s.includes('data')) return '1558485984-5f11cc7c50a1';
        if (s.includes('ai') || s.includes('robotic')) return '1485827404703-89b55fcc595e';
        if (s.includes('tech') || s.includes('software') || s.includes('web')) return '1518770660439-4636190af475';
        if (s.includes('event')) return '1505373877841-8d25f7d46678';
        
        // Solid professional fallbacks
        const fallbacks = ['1556761175-5973dc0f32d7', '1454165804606-c3d57bc86b40', '1522202176988-66273c2fd55f'];
        return fallbacks[s.split('').reduce((a, b) => a + b.charCodeAt(0), 0) % fallbacks.length];
    };

    const imageUrl = `https://images.unsplash.com/photo-${getCategoryImage(slug.toLowerCase())}?q=80&w=1200&h=800&auto=format&fit=crop`;

    return (
        <div className="bg-[#f8fafc] min-h-screen text-slate-900 selection:bg-sky-500/30 font-sans pb-24">
            <Navbar />

            <main className="pt-32 px-4 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Left Column: Image and Content */}
                <div className="lg:col-span-2 space-y-10">
                    {/* Hero Image */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full h-[400px] rounded-3xl overflow-hidden shadow-2xl shadow-slate-200/50 bg-slate-100 relative"
                    >
                        {/* Loading placeholder skeleton */}
                        <div className="absolute inset-0 animate-pulse bg-slate-200" />
                        <img 
                            src={imageUrl} 
                            alt={title}
                            className="w-full h-full object-cover relative z-10 transition-opacity duration-500"
                            onLoad={(e) => e.currentTarget.style.opacity = '1'}
                            style={{ opacity: 0 }}
                            onError={(e) => {
                                // Ultimate fallback
                                e.currentTarget.src = "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1200&h=800&auto=format&fit=crop";
                                e.currentTarget.style.opacity = '1';
                            }}
                        />
                    </motion.div>

                    {/* Topic Content */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter text-slate-900 mb-6 uppercase">
                            {title}
                        </h1>

                        <div className="prose prose-lg text-slate-600 prose-headings:font-black prose-headings:text-slate-900 max-w-none">
                            <p className="lead font-medium text-xl text-slate-700 mb-6">
                                Connect, innovate, and lead the transformation in the <strong>{title}</strong> sector at India&apos;s most exclusive hybrid summit.
                            </p>
                            
                            <h3 className="text-2xl font-black italic tracking-tighter text-sky-600 uppercase mt-10 mb-4">Why This Event Matters?</h3>
                            
                            <p className="mb-4">
                                The <strong>{title}</strong> industry is undergoing a massive shift driven by emergent technologies, global supply chain restructuring, and an immense infusion of strategic capital. Engage with industry leaders, policymakers, top-tier institutional investors, and early-stage innovators who are actively redefining growth, scaling resilient infrastructures, and building the future of this sector.
                            </p>
                            <p className="mb-4">
                                Whether you are a business leader, tech startup, angel investor, or policymaker, the BharatNivesh Summit enables you to <strong>collaborate, scale impact, and drive meaningful partnerships.</strong> Turn immediate industry challenges into high-yield economic opportunities on a platform built entirely on trust and verified participant data.
                            </p>
                            <p>
                                Gain exclusive insights into emerging market trends, evolving regulations, and massive un-tapped investment opportunities that are accelerating the digital and physical evolution of the {title} ecosystem across India and the globe.
                            </p>
                        </div>
                    </motion.div>

                    {/* Why Attend Grid */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="pt-8"
                    >
                        <h2 className="text-3xl font-black italic tracking-tighter text-slate-900 mb-8 uppercase">Why Attend?</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                                { title: "Networking", icon: <Users size={20} className="text-indigo-600" />, color: "bg-indigo-50" },
                                { title: "Partnership Opportunities", icon: <Handshake size={20} className="text-sky-600" />, color: "bg-sky-50" },
                                { title: "Latest Industry Trends", icon: <TrendingUp size={20} className="text-amber-500" />, color: "bg-amber-50" },
                                { title: "Business Development", icon: <Briefcase size={20} className="text-emerald-600" />, color: "bg-emerald-50" }
                            ].map((item, idx) => (
                                <div key={idx} className="flex items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                                    <div className={`w-12 h-12 rounded-full ${item.color} flex items-center justify-center shrink-0`}>
                                        {item.icon}
                                    </div>
                                    <h4 className="font-bold text-slate-800 text-lg">{item.title}</h4>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* Right Column: Sticky Event Details Card */}
                <div className="lg:col-span-1">
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 sticky top-32"
                    >
                        <div className="text-center mb-8 border-b border-slate-100 pb-8">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-sky-600 mb-2">BharatNivesh Summit</h3>
                            <h2 className="text-xl font-black italic text-slate-900 tracking-tighter uppercase mb-4">1st Edition Hybrid Event 2026</h2>
                            
                            <img 
                                src="/assets/DLOGO1.png" 
                                alt="DBI Logo" 
                                className="h-12 object-contain mx-auto opacity-80" 
                            />
                        </div>

                        <div className="space-y-6 mb-10">
                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-slate-50 rounded-lg text-slate-400">
                                    <Target size={18} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Focus Topic</p>
                                    <p className="font-semibold text-slate-800">{title}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-slate-50 rounded-lg text-slate-400">
                                    <Calendar size={18} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Date</p>
                                    <p className="font-semibold text-slate-800">To Be Announced</p>
                                    <p className="text-xs text-sky-600 font-medium mt-1">Pre-registrations Open</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-slate-50 rounded-lg text-slate-400">
                                    <MapPin size={18} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Location</p>
                                    <p className="font-semibold text-slate-800">To Be Announced</p>
                                    <p className="text-xs text-slate-500 font-medium mt-1">Hybrid Event (Offline + Online)</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            <Link href="/apply/business">
                                <button className="w-full bg-sky-600 hover:bg-sky-500 text-white font-black text-lg py-4 rounded-xl shadow-lg shadow-sky-200 transition-all hover:-translate-y-1">
                                    Enquire Now (Business)
                                </button>
                            </Link>
                            <Link href="/apply/investor">
                                <button className="w-full bg-white hover:bg-slate-50 text-slate-700 border-2 border-slate-200 font-bold text-sm py-3 rounded-xl transition-colors">
                                    Sponsorship / Investor
                                </button>
                            </Link>
                        </div>
                    </motion.div>
                </div>
                
            </main>
        </div>
    );
}
