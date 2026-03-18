"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Search, Globe, FileText, Filter, Zap, Layout, Star, Tag, UserCheck, BarChart4 } from "lucide-react";
import { useTheme } from "./ThemeProvider";

const profileFeatures = [
    { title: "In-depth Descriptions", desc: "Comprehensive information about features and benefits.", icon: FileText },
    { title: "Specs & Features", desc: "Technical details and unique attributes of every listing.", icon: Tag },
    { title: "Pricing & Packages", desc: "Clear information on costs and available options.", icon: BarChart4 },
    { title: "Reviews & Ratings", desc: "Insights from other users to help you choose wisely.", icon: Star },
    { title: "Provider Credentials", desc: "Verify the reliability and qualifications of experts.", icon: UserCheck }
];

const userBenefits = [
    { title: "Saves Time", desc: "Find what you need quickly and efficiently.", icon: Zap, color: "text-yellow-400" },
    { title: "Informed Decisions", desc: "Make choices with confidence, backed by data.", icon: ShieldCheck, color: "text-green-400" },
    { title: "Increased Productivity", desc: "Streamline your search and focus on what matters.", icon: Layout, color: "text-blue-400" },
    { title: "Competitive Edge", desc: "Stay ahead with access to latest products.", icon: BarChart4, color: "text-purple-400" }
];

export default function ReliableSourceSection() {
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
                        Unlock a World of Information: <span className="gradient-text">One-Stop Resource</span>
                    </motion.h2>
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-muted-foreground text-lg leading-relaxed"
                    >
                        In today's fast-paced world, finding the right products and services can be daunting. 
                        Our platform is a comprehensive resource designed to provide you with detailed 
                        and accurate information from all sectors.
                    </motion.p>
                </div>

                <div className="grid lg:grid-cols-2 gap-12 items-center mb-24">
                    <motion.div 
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        className={`p-8 md:p-12 rounded-[2.5rem] border border-solid backdrop-blur-xl ${isLight ? 'bg-white border-blue-100 shadow-xl shadow-blue-500/5' : 'bg-white/5 border-white/10 shadow-2xl'}`}
                    >
                        <h3 className="text-2xl font-bold mb-6">Comprehensive Coverage</h3>
                        <p className="text-muted-foreground mb-8 leading-relaxed">
                            Our platform is an exhaustive repository covering industries from healthcare and finance 
                            to technology and entertainment. Whether you're a consumer or a business, 
                            we are the ultimate destination for finding exactly what you need.
                        </p>
                        
                        <div className="flex gap-4 p-6 rounded-2xl bg-primary/10 border border-primary/20">
                            <Search className="text-primary mt-1 shrink-0" size={24} />
                            <div>
                                <h4 className="font-bold text-sm mb-1">Advanced Search & Filtering</h4>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    Intuitive functionality allows you to narrow down results based on location, 
                                    category, price range, and more.
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    <div className="space-y-4">
                        <h3 className="text-xl font-bold px-4 mb-2">Detailed Profiles Include</h3>
                        {profileFeatures.map((feature, i) => (
                            <motion.div
                                key={feature.title}
                                initial={{ opacity: 0, x: 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className={`flex items-center gap-4 p-4 rounded-2xl border border-solid transition-all duration-300 ${isLight ? 'bg-white border-slate-100 shadow-sm hover:border-primary/20' : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.06]'}`}
                            >
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                    <feature.icon size={20} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm">{feature.title}</h4>
                                    <p className="text-[10px] text-muted-foreground">{feature.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                <div className="mt-20">
                    <div className="text-center mb-12">
                        <h3 className="text-2xl md:text-3xl font-display font-black uppercase tracking-wider">Benefits for Users</h3>
                        <div className="h-1 w-20 bg-primary mx-auto mt-4 rounded-full" />
                    </div>
                    
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {userBenefits.map((benefit, i) => (
                            <motion.div
                                key={benefit.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className={`p-8 rounded-3xl text-center border border-solid group hover:-translate-y-2 transition-all duration-500 ${isLight ? 'bg-white border-slate-100 shadow-lg' : 'bg-white/[0.02] border-white/10 hover:bg-white/[0.04]'}`}
                            >
                                <div className={`w-14 h-14 rounded-2xl mx-auto mb-6 flex items-center justify-center bg-foreground/5 ${benefit.color}`}>
                                    <benefit.icon size={28} />
                                </div>
                                <h4 className="font-bold mb-3">{benefit.title}</h4>
                                <p className="text-xs text-muted-foreground leading-relaxed">{benefit.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
