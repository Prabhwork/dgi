"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CursorGlow from "@/components/CursorGlow";
import ParticleNetworkWrapper from "@/components/ParticleNetworkWrapper";
import {
    Loader2, ArrowLeft
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface UpcomingDetail {
    _id: string;
    title: string;
    icon: string;
    description?: string;
    image?: string;
    category?: { _id: string; name: string };
    order: number;
    isActive: boolean;
}

export default function UpcomingDetailPage() {
    const { id } = useParams();
    const [detail, setDetail] = useState<UpcomingDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchDetail = async () => {
            const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
            try {
                const res = await fetch(`${API}/upcoming-categories/${id}`);
                const data = await res.json();
                if (data.success && data.data) {
                    setDetail(data.data);
                } else {
                    setError(true);
                }
            } catch (err) {
                console.error("Failed to fetch upcoming category:", err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchDetail();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#020631] flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
            </div>
        );
    }

    if (error || !detail) {
        return (
            <div className="min-h-screen bg-[#020631] flex flex-col items-center justify-center text-white p-4">
                <h1 className="text-4xl font-display font-bold mb-4">404</h1>
                <p className="text-white/60 mb-8">Upcoming category not found.</p>
                <Link href="/" className="bg-primary px-8 py-3 rounded-xl font-bold hover:opacity-90 transition-all">
                    Return Home
                </Link>
            </div>
        );
    }

    const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5001';
    const hasImage = detail.image && detail.image !== 'no-photo.jpg';
    const imageUrl = hasImage ? `${API_BASE}/uploads/${detail.image}` : null;

    return (
        <div className="min-h-screen bg-[#020631] text-white">
            <ParticleNetworkWrapper className="z-0 opacity-40" />
            <CursorGlow />
            <Navbar />

            <main className="pt-20 pb-16 relative z-10">
                <div className="container mx-auto px-4 flex flex-col items-center">

                    {/* Back Button */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="w-full max-w-7xl mt-8 mb-8"
                    >
                        <Link
                            href="/#upcoming"
                            className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors group text-sm"
                        >
                            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                            Back
                        </Link>
                    </motion.div>

                    {/* Hero Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-12 px-4"
                    >
                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-black leading-tight tracking-tight text-foreground py-2">
                            {(() => {
                                const words = detail.title.split(' ');
                                if (words.length <= 1) return <span className="gradient-text">{detail.title}</span>;
                                const firstWord = words[0];
                                const remaining = words.slice(1).join(' ');
                                return (
                                    <>
                                        {firstWord} <span className="gradient-text">{remaining}</span>
                                    </>
                                );
                            })()}
                        </h1>
                    </motion.div>

                    {/* Image Section */}
                    {imageUrl && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.15 }}
                            className="w-full max-w-4xl mb-12"
                        >
                            <div className="relative group rounded-2xl overflow-hidden border border-white/5 shadow-2xl">
                                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-cyan-500/20 rounded-2xl blur-xl opacity-40" />
                                <div className="relative rounded-2xl overflow-hidden">
                                    <Image
                                        src={imageUrl}
                                        alt={detail.title}
                                        width={1200}
                                        height={600}
                                        className="w-full h-auto object-cover"
                                    />
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Content Card */}
                    {detail.description && (
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="w-full max-w-7xl mx-auto px-2 md:px-6"
                        >
                            <div className="relative group">
                                 {/* Transparent Blur Background */}
                                 <div className="absolute -inset-2 bg-white/[0.02] backdrop-blur-3xl rounded-[1.5rem] md:rounded-[3rem] -z-10" />

                                 <div className="relative p-6 md:p-10 lg:p-12">
                                     <div className="overflow-x-auto custom-scrollbar-horizontal">
                                        <div
                                            className="prose prose-invert prose-sm md:prose-lg lg:prose-xl max-w-5xl mx-auto text-white/90 leading-relaxed
                                                prose-headings:text-white prose-headings:font-display prose-headings:font-bold prose-headings:mb-0 prose-headings:mt-6
                                                prose-p:my-2 prose-p:py-0
                                                prose-hr:border-white/40 prose-hr:my-4 prose-hr:border-t-[1px]
                                                prose-ul:my-2 prose-li:my-1
                                                prose-table:w-full prose-table:my-1 prose-table:border-collapse prose-table:border prose-table:border-white/40
                                                prose-th:text-white prose-th:font-bold prose-th:text-base md:text-xl prose-th:p-1 prose-th:border prose-th:border-white/40 prose-th:bg-white/10 prose-th:text-center
                                                prose-td:text-white prose-td:p-1 prose-td:border prose-td:border-white/40 prose-td:align-middle prose-td:text-center text-sm md:text-lg
                                                [&_td:first-child]:font-bold [&_td:first-child]:text-white [&_td:first-child]:whitespace-nowrap [&_td:first-child]:text-left
                                                [&_thead_th]:text-center [&_th]:text-center [&_table]:overflow-visible
                                                [&_h1]:border-t [&_h1]:border-white/30 [&_h1]:pt-4 [&_h1]:mt-8 [&_h1:first-child]:border-t-0 [&_h1:first-child]:pt-0 [&_h1:first-child]:mt-0
                                                [&_h2]:border-t [&_h2]:border-white/30 [&_h2]:pt-4 [&_h2]:mt-8 [&_h2:first-child]:border-t-0 [&_h2:first-child]:pt-0 [&_h2:first-child]:mt-0
                                                [&_h3]:border-t [&_h3]:border-white/30 [&_h3]:pt-4 [&_h3]:mt-8 [&_h3:first-child]:border-t-0 [&_h3:first-child]:pt-0 [&_h3:first-child]:mt-0
                                            "
                                            dangerouslySetInnerHTML={{ __html: detail.description }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Join Community CTA */}
                    <motion.section
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="mt-16 md:mt-24 text-center w-full max-w-6xl px-4"
                    >
                        <h2 className="text-3xl md:text-5xl font-display font-bold mb-6 text-[#00ccff]">
                            Stay Updated
                        </h2>
                        <p className="text-sm md:text-xl text-white/70 mb-10 max-w-5xl mx-auto leading-relaxed">
                            Be the first to know when this feature goes live. Join our community and get exclusive early access to all our upcoming tools and directories.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href="/join-community"
                                className="group/btn relative h-12 sm:h-14 px-8 sm:px-12 bg-primary text-white font-bold rounded-2xl overflow-hidden active:scale-95 transition-all text-sm sm:text-base inline-flex items-center justify-center gap-2 shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5"
                            >
                                Join Community
                            </Link>
                        </div>
                    </motion.section>
                </div>
            </main>

            <Footer />
        </div>
    );
}
