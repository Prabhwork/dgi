"use client";

import React from "react";
import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import { Search, ChevronRight } from "lucide-react";
import Link from "next/link";

const TOPICS_LIST = [
    "Food & Beverage", "Travel & Tourism", "Real Estate", "Technology", "Health & Wellness", "Education", "E-commerce", "Finance",
    "Automotive", "Fashion & Apparel", "Entertainment", "Logistics", "Agriculture", "Construction", "IT Services", "Media & PR",
    "Energy & Power", "Retail", "Software Dev", "Hardware", "Hospitality", "Consulting", "Manufacturing", "Import/Export",
    "Telecom", "Legal Services", "Marketing", "Architecture", "Design", "Non-Profit", "HR & Staffing", "Event Management",
    "Photography", "Beauty & Care", "Fitness", "Aviation", "Printing", "Transport", "Environment", "Sports",
    "Gaming", "Art & Crafts", "Web Development", "SEO Services", "AI & Robotics", "VR/AR", "Blockchain", "CyberSecurity",
    "Cloud Computing", "Biotechnology", "SpaceTech", "Defense & Aerospace", "CleanTech", "EdTech", "FinTech", "HealthTech",
    "AgriTech", "PropTech", "LegalTech", "InsurTech", "Data Analytics", "Drones", "IoT", "Nanotechnology"
];

export default function TopicsDirectory() {
    return (
        <div className="bg-[#f8fafc] min-h-screen text-slate-900 font-poppins selection:bg-sky-500/30">
            <Navbar />
            <main className="pt-32 pb-24 px-4 max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-50 text-sky-600 text-[10px] font-black uppercase tracking-[0.3em] mb-6 border border-sky-100"
                    >
                        <Search size={12} /> Industry Directory
                    </motion.div>
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl md:text-7xl font-black text-slate-900 mb-6 italic tracking-tighter uppercase"
                    >
                        Explore <span className="text-sky-600">60+ Sectors.</span>
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-slate-500 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed italic"
                    >
                        Discover verified businesses and hyper-focused investment portfolios across 64 specialized business categories shaping the future.
                    </motion.p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-10">
                    {TOPICS_LIST.map((topic, i) => {
                        const slug = topic.toLowerCase().replace(/ & /g, '-').replace(/\//g, '-').replace(/ /g, '-');
                        return (
                            <Link key={i} href={`/topics/${slug}`} className="block h-full">
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: (i % 8) * 0.05 }}
                                    className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-sky-200 transition-all duration-300 group flex items-center justify-between h-full"
                                >
                                    <span className="font-black italic uppercase tracking-tighter text-slate-700 group-hover:text-sky-600 transition-colors">
                                        {topic}
                                    </span>
                                    <ChevronRight size={16} className="text-slate-300 group-hover:text-sky-600 group-hover:translate-x-1 transition-all" />
                                </motion.div>
                            </Link>
                        );
                    })}
                </div>
            </main>
        </div>
    );
}
