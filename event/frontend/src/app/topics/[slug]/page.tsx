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
        
    // Exact slug → unique Unsplash photo ID mapping (no fallbacks needed)
    const PHOTO_MAP: Record<string, string> = {
        // Food & Beverage
        'food-beverage':         '1414235077428-338989a2e8c0', // restaurant kitchen
        'food':                  '1414235077428-338989a2e8c0',
        'beverage':              '1558618666-fcd25c85cd64', // coffee drinks
        // Travel & Tourism
        'travel-tourism':        '1469854523086-cc02b6f0cdbb', // airplane window
        'travel':                '1469854523086-cc02b6f0cdbb',
        'tourism':               '1506905925346-21bde3fa0e7f', // mountain landscape
        // Real Estate
        'real-estate':           '1560518883-ce09059eeffa', // luxury house
        'proptech':              '1570129477492-45c003edd2be', // smart home
        'architecture':          '1487958449943-2429e8be8625', // modern architecture
        'construction':          '1504307651254-35680f356dfd', // construction site
        // Technology
        'technology':            '1518770660439-4636190af475', // dark tech circuit
        'it-services':           '1451187580459-43490279c0fa', // server room
        'software-dev':          '1461749280684-dccba630e2f6', // code on screen
        'web-development':       '1547658719-da2b51169166', // web design
        'seo-services':          '1432888622747-4eb9a8f5a07d', // analytics charts
        // Health & Wellness
        'health-wellness':       '1559757148-5c350d0d3c56', // medical modern
        'healthtech':            '1576091160399-112ba8d25d1d', // health tech
        'biotechnology':         '1530026405845-9a81c1e1bb91', // lab biotech
        // Education
        'education':             '1523050854058-8df90110c9f1', // university campus
        'edtech':                '1584697964190-b7a7e82b3e9d', // online learning
        // E-commerce & Retail
        'e-commerce':            '1472851294608-061145a8e0e4', // shopping bags
        'retail':                '1555529669-e69b28c5a89f', // retail store
        // Finance
        'finance':               '1611974789855-9c2a0a7236a3', // stock market
        'fintech':               '1563013544-824ae1b704d3', // fintech app
        'insurance':             '1450101499163-c8848c66ca85', // insurance docs
        'insurtech':             '1565514020179-026b92b84bb6', // digital insurance
        // Automotive & Transport
        'automotive':            '1492144534655-ae79c964c9d7', // luxury car
        'transport':             '1544620347-c4fd4a3d5957', // transport highway
        'aviation':              '1436491865332-7a6baeb5220f', // airplane in sky
        // Fashion & Apparel
        'fashion-apparel':       '1445205170230-053b83016050', // fashion runway
        'fashion':               '1445205170230-053b83016050',
        'beauty-care':           '1522335789203-aabd1fc54bc9', // beauty makeup
        'beauty':                '1522335789203-aabd1fc54bc9',
        // Entertainment & Media
        'entertainment':         '1511512578047-dfb367046420', // concert stage
        'media-pr':              '1557804506-669a67965ba0', // media broadcast
        'gaming':                '1542751371-adc38448a05e', // gaming setup
        // Logistics & Import/Export
        'logistics':             '1566576912321-573007545eb1', // warehouse
        'import-export':         '1578575437130-527eed3abbec', // shipping containers port
        // Agriculture
        'agriculture':           '1500937386664-56d1dfef3854', // farming tractor field
        'agritech':              '1574943320219-553eb213f72d', // smart farming drone
        // Energy & Environment
        'energy-power':          '1473341304170-971dccb5ac1e', // wind turbines
        'cleantech':             '1466611653911-95081537e5b7', // solar panels green
        'environment':           '1441974231531-c6227db76b6e', // green nature forest
        // Manufacturing & Hardware
        'manufacturing':         '1581091226825-a6a2a5aee158', // factory robots
        'hardware':              '1518770660439-4636190af475', // computer hardware
        // Hospitality
        'hospitality':           '1542314831-068cd1dbfeeb', // luxury hotel lobby
        // Consulting & Marketing
        'consulting':            '1454165804606-c3d57bc86b40', // business meeting
        'marketing':             '1533750349088-cd871a92f312', // marketing campaign
        // HR & Staffing
        'hr-staffing':           '1521737604893-d14cc237f11d', // team people working
        // Event Management
        'event-management':      '1505373877841-8d25f7d46678', // event conference
        // Photography
        'photography':           '1516035069371-29a1b244cc32', // camera photography
        // Fitness
        'fitness':               '1517836357463-d25dfeac3438', // gym workout
        // Printing
        'printing':              '1558618048-b3b3f0f3a7e4', // printing press
        // Sports
        'sports':                '1461896836374-6e5cfc5ba8ac', // sports stadium
        // Art & Crafts
        'art-crafts':            '1499892477393-f675841bc283', // painting art studio
        'design':                '1541746972996-4e0b0f43e02a', // design workspace
        // AI & Advanced Tech
        'ai-robotics':           '1485827404703-89b55fcc595e', // robot AI
        'vr-ar':                 '1593508512255-86ab42a8e620', // VR headset
        'blockchain':            '1639762681485-074b7f938ba0', // blockchain crypto
        'cybersecurity':         '1550751827-4bd374c3f58b', // cybersecurity lock
        'cloud-computing':       '1544197150-b99a580bb7a8', // cloud data center
        // Other Tech
        'spacetech':             '1451187580459-43490279c0fa', // space satellite
        'defense-aerospace':     '1541185933-ef5d3c7b7f29', // aerospace jet
        'data-analytics':        '1551288049-bebda4e38f71', // data dashboard
        'drones':                '1473968512647-3e447244af8f', // drone flying
        'iot':                   '1558618048-b3b3f0f3a7e4', // connected devices iot
        'nanotechnology':        '1504711434489-ff32f4a8b1f3', // science nano lab
        // Legal
        'legal-services':        '1589829545856-d10d557cf95f', // law books gavel
        'legaltech':             '1450101499163-c8848c66ca85', // legal tech
        // Non-profit
        'non-profit':            '1469571486292-0ba58a3f068b', // community helping hands
        // Telecom
        'telecom':               '1516321318423-f06f85e504b3', // telecom towers
    };

    const getCategoryImage = (s: string): string => {
        // Try exact slug match first
        if (PHOTO_MAP[s]) return PHOTO_MAP[s];
        
        // Try partial slug match
        for (const [key, val] of Object.entries(PHOTO_MAP)) {
            const keyParts = key.split('-');
            if (keyParts.some(part => part.length > 3 && s.includes(part))) {
                return val;
            }
        }
        
        // Category-specific unique fallbacks (no generic business man!)
        const uniqueFallbacks = [
            '1551288049-bebda4e38f71', // data charts
            '1533750349088-cd871a92f312', // colorful marketing
            '1521737604893-d14cc237f11d', // collaborative team
            '1486312338219-ce68d2c6f44d', // person typing laptop
            '1454165804606-c3d57bc86b40', // professional meeting
        ];
        return uniqueFallbacks[s.split('').reduce((a, b) => a + b.charCodeAt(0), 0) % uniqueFallbacks.length];
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
