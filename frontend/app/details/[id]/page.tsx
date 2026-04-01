"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CursorGlow from "@/components/CursorGlow";
import ParticleNetworkWrapper from "@/components/ParticleNetworkWrapper";
import BusinessGrowthFunnel from "@/components/BusinessGrowthFunnel";
import { Loader2, ArrowRight, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface PageDetail {
    _id: string;
    description: string;
    image: string;
    category: { name: string; icon?: string };
    subcategory?: { name: string };
}

export default function DetailPage() {
    const { id } = useParams();
    const [detail, setDetail] = useState<PageDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchDetail = async () => {
            const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
            try {
                const res = await fetch(`${API}/page-details/${id}`);
                const data = await res.json();
                if (data.success && data.data) {
                    setDetail(data.data);
                } else {
                    setError(true);
                }
            } catch (err) {
                console.error("Failed to fetch detail:", err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchDetail();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#010638] flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
            </div>
        );
    }

    if (error || !detail) {
        return (
            <div className="min-h-screen bg-[#010638] flex flex-col items-center justify-center text-white p-4">
                <h1 className="text-4xl font-display font-bold mb-4">404</h1>
                <p className="text-white/60 mb-8">Information not found.</p>
                <Link href="/" className="bg-primary px-8 py-3 rounded-xl font-bold hover:opacity-90 transition-all">
                    Return Home
                </Link>
            </div>
        );
    }

    const title = detail.subcategory?.name || detail.category.name;
    const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5001';

    let imageUrl = null;
    if (detail.image && detail.image !== 'no-photo.jpg') {
        imageUrl = `${API_BASE}/uploads/${detail.image}`;
    } else if (detail.category.icon && detail.category.icon !== 'no-photo.jpg') {
        imageUrl = `${API_BASE}/uploads/${detail.category.icon}`;
    }

    return (
        <div className="min-h-screen bg-[#010638] text-white selection:bg-primary/30 selection:text-white">
            <ParticleNetworkWrapper className="z-0 opacity-80" />
            <CursorGlow />
            <Navbar />

            <main className="pt-20 pb-12 relative z-10 overflow-hidden">
                {/* Master Digital Background Layer - Synchronized Digital Aesthetic */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600/15 via-transparent to-cyan-500/15 opacity-70" />
                    <div className="absolute inset-0 digital-grid opacity-[0.10] scale-110" />
                    
                    {/* Synchronized Cyber Glows */}
                    <div className="absolute -top-[10%] -left-[10%] w-[70%] h-[60%] bg-blue-600/25 rounded-full blur-[140px] animate-pulse-glow" style={{ animationDuration: '8s' }} />
                    <div className="absolute top-[20%] -right-[10%] w-[60%] h-[50%] bg-cyan-500/20 rounded-full blur-[120px] animate-pulse-glow" style={{ animationDuration: '10s', animationDelay: '2s' }} />
                </div>

                <div className="container mx-auto px-4 relative z-20">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="max-w-6xl mx-auto mb-10 px-4"
                    >
                        <Link
                            href="/"
                            className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full glass border-white/10 text-white/70 hover:text-white hover:border-primary/50 transition-all group backdrop-blur-xl shadow-lg hover:shadow-primary/20"
                        >
                            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                            <span className="text-xs font-black uppercase tracking-[0.2em] mt-0.5">Back</span>
                        </Link>
                    </motion.div>

                    <div className="max-w-6xl mx-auto text-center mb-10 px-4">
                        <motion.h1
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl md:text-7xl font-display font-black leading-tight tracking-tighter mb-8"
                        >
                            <span className="text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.3)] block md:inline">{title.split(' ')[0]} </span>
                            <span className="gradient-text brightness-150 saturate-150 inline-block">
                                {title.split(' ').slice(1).join(' ')}
                            </span>
                        </motion.h1>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="flex flex-wrap justify-center gap-4"
                        >
                            {['Solutions', 'Verified Data', 'High Intensity'].map((tag) => (
                                <span key={tag} className="px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.3em] border border-primary/30 bg-primary/10 text-white backdrop-blur-2xl shadow-xl shadow-primary/5">
                                    {tag}
                                </span>
                            ))}
                        </motion.div>
                    </div>

                    {/* Featured Image - WIDTH SYNC to max-w-[1400px] */}
                    {imageUrl && (
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="max-w-[1400px] mx-auto mb-10 px-4"
                        >
                            <div className="relative group rounded-[3rem] overflow-hidden p-2">
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-cyan-400 to-purple-500 rounded-[3rem] p-[2px] opacity-40 group-hover:opacity-100 transition-opacity duration-700 blur-[1px]">
                                    <div className="w-full h-full bg-[#010638] rounded-[2.9rem]" />
                                </div>
                                <div className="absolute -inset-8 bg-blue-500/20 blur-[80px] opacity-0 group-hover:opacity-60 transition-opacity duration-1000" />
                                
                                <div className="relative rounded-[2.7rem] overflow-hidden shadow-2xl border border-white/10">
                                    <div className="scan-line opacity-60 pointer-events-none" />
                                    <Image
                                        src={imageUrl}
                                        alt={title}
                                        width={1400}
                                        height={800}
                                        className="w-full h-auto object-cover transform scale-100 group-hover:scale-105 transition-transform duration-[2s]"
                                        priority
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#010638] via-transparent to-transparent opacity-60" />
                                    <div className="absolute inset-0 bg-blue-500/5 mix-blend-overlay" />
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* High-Tech Main Content Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="max-w-[1400px] mx-auto px-4"
                    >
                        <div className="relative group border border-white/10 rounded-[3rem] overflow-hidden glass shadow-2xl">
                            {/* Synced Content Card Background Layer */}
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/15 via-transparent to-cyan-500/15 opacity-60 pointer-events-none" />
                            <div className="absolute inset-0 digital-grid opacity-[0.08] pointer-events-none" />

                            <div className="relative p-6 md:p-8 lg:p-12 overflow-hidden">
                                {/* Floating Tech Accents inside card */}
                                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-[100px] pointer-events-none mix-blend-screen" />
                                <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/20 rounded-full blur-[100px] pointer-events-none mix-blend-screen" />

                                <div className="relative">
                                    <div
                                        className="prose prose-invert prose-lg md:prose-xl max-w-none text-white/90 font-medium leading-snug text-left
                                            prose-headings:font-display prose-headings:font-black prose-headings:tracking-tight prose-headings:text-white prose-headings:mt-4 prose-headings:mb-1
                                            prose-h2:text-3xl md:text-5xl prose-h2:text-cyber-multi
                                            prose-h3:text-2xl md:text-3xl prose-h3:text-cyber-yellow
                                            prose-p:text-lg md:text-xl prose-p:mb-4
                                            prose-strong:font-black prose-strong:text-xl md:prose-strong:text-2xl
                                            prose-a:text-cyan-400 prose-a:underline-offset-4 hover:prose-a:text-white transition-all
                                            prose-li:marker:text-primary prose-li:my-1 prose-li:text-lg md:text-xl
                                            prose-hr:border-white/10 prose-hr:my-6
                                        "
                                        dangerouslySetInnerHTML={{ 
                                            __html: (() => {
                                                const colors = ['text-cyber-red', 'text-cyber-green', 'text-cyber-yellow', 'text-cyber-purple', 'text-cyber-multi'];
                                                let count = 0;
                                                return detail.description.replace(/<strong>(.*?)<\/strong>|<h3>(.*?)<\/h3>/g, (match, strongContent, h3Content) => {
                                                    if (strongContent) {
                                                        const color = colors[count % colors.length];
                                                        count++;
                                                        return `<strong class="${color}">${strongContent}</strong>`;
                                                    }
                                                    if (h3Content) {
                                                        return `<h3 class="text-cyber-multi">${h3Content}</h3>`;
                                                    }
                                                    return match;
                                                });
                                            })() 
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Interactive Lead Generation Funnel - Integrated directly with page layout */}
                    <div className="mt-16">
                        <BusinessGrowthFunnel />
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
