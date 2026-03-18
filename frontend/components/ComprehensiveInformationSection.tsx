"use client";

import { motion } from "framer-motion";
import { Database, ShieldCheck, CheckCircle2, Clock, BarChart3, Briefcase, Heart, Home, Laptop, Star, Search, Layout } from "lucide-react";
import { useTheme } from "./ThemeProvider";

const features = [
    {
        title: "Up-to-date Listings",
        desc: "Ensure you have the latest information on services, including all recent changes.",
        icon: Clock,
        color: "text-blue-400"
    },
    {
        title: "Verified Details",
        desc: "Trust that service information is accurate, complete, and fully reliable.",
        icon: ShieldCheck,
        color: "text-green-400"
    },
    {
        title: "Consistent Monitoring",
        desc: "Our team continuously reviews information to maintain the highest standards.",
        icon: Search,
        color: "text-purple-400"
    },
    {
        title: "Expert Curation",
        desc: "Meticulously curated content focused on providing pertinent info for your needs.",
        icon: Star,
        color: "text-yellow-400"
    }
];

const serviceSectors = [
    { title: "Home & Maintenance", icon: Home },
    { title: "Health & Wellness", icon: Heart },
    { title: "Financial & Legal", icon: Briefcase },
    { title: "Technology & IT", icon: Laptop }
];

const trustBenefits = [
    { title: "Informed Decisions", desc: "Make choices with confidence, knowing you have accurate data.", icon: CheckCircle2 },
    { title: "Time Savings", desc: "Avoid wasted time due to incorrect or outdated information.", icon: Clock },
    { title: "Reduced Stress", desc: "Rely on our platform for consistent, trustworthy information.", icon: Heart }
];

export default function ComprehensiveInformationSection() {
    const { theme } = useTheme();
    const isLight = theme === "light";

    return (
        <section className={`py-24 relative overflow-hidden ${isLight ? 'bg-slate-50/50' : 'bg-transparent'}`}>
            <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-4xl mx-auto text-center mb-20">
                    <motion.h2 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="text-3xl md:text-5xl font-display font-black mb-6 leading-tight"
                    >
                        Experience Unwavering Trust: <span className="gradient-text">Reliable Information</span>
                    </motion.h2>
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-muted-foreground text-lg leading-relaxed"
                    >
                        In today's fast-paced world, relying on accurate and up-to-date information is crucial 
                        for making informed decisions. Our platform is dedicated to providing unwavering accuracy, 
                        ensuring you have the confidence to make decisions with precision.
                    </motion.p>
                </div>

                <div className="grid lg:grid-cols-2 gap-12 items-center mb-24">
                    <motion.div 
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        className={`p-8 md:p-12 rounded-[2.5rem] border border-solid backdrop-blur-xl ${isLight ? 'bg-white border-blue-100 shadow-xl shadow-blue-500/5' : 'bg-white/5 border-white/10 shadow-2xl'}`}
                    >
                        <h3 className="text-2xl font-bold mb-6">Reliability That Sets Us Apart</h3>
                        <p className="text-muted-foreground mb-8 leading-relaxed">
                            We understand the importance of dependability. That's why we've implemented robust 
                            verification processes, regular maintenance, and a culture of transparency and 
                            accountability to ensure highest accuracy across all listings.
                        </p>
                        
                        <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-solid border-white/5">
                            {serviceSectors.map((sector) => (
                                <div key={sector.title} className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/10">
                                    <sector.icon size={18} className="text-primary" />
                                    <span className="text-xs font-bold">{sector.title}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    <div className="grid sm:grid-cols-2 gap-4">
                        {features.map((feature, i) => (
                            <motion.div
                                key={feature.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className={`p-6 rounded-3xl border border-solid transition-all duration-500 group ${isLight ? 'bg-white border-slate-100 hover:border-primary/30 hover:shadow-lg' : 'bg-white/[0.02] border-white/10 hover:bg-white/[0.05] hover:border-white/20'}`}
                            >
                                <feature.icon className={`w-10 h-10 mb-4 ${feature.color}`} />
                                <h4 className="font-bold mb-2">{feature.title}</h4>
                                <p className="text-xs text-muted-foreground leading-relaxed">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>

                <div className="mt-20">
                    <div className="text-center mb-12">
                        <h3 className="text-2xl md:text-3xl font-display font-black uppercase tracking-wider">Benefits of Unwavering Trust</h3>
                        <div className="h-1 w-20 bg-primary mx-auto mt-4 rounded-full" />
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-8">
                        {trustBenefits.map((benefit, i) => (
                            <motion.div
                                key={benefit.title}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.1 }}
                                className={`p-8 rounded-[2rem] text-center border border-solid ${isLight ? 'bg-white border-slate-100 shadow-lg' : 'bg-white/[0.03] border-white/10'}`}
                            >
                                <div className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center bg-primary/10 text-primary">
                                    <benefit.icon size={30} />
                                </div>
                                <h4 className="font-bold text-lg mb-3">{benefit.title}</h4>
                                <p className="text-sm text-muted-foreground leading-relaxed">{benefit.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
