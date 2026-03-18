"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Search, Star, RefreshCw, BarChart3, ShieldCheck, Zap, Layout } from "lucide-react";
import { useTheme } from "./ThemeProvider";

const features = [
    {
        title: "Digital Map",
        desc: "Our interactive map enables users to explore businesses in their vicinity, providing a visual representation of your establishment's location.",
        icon: Layout,
        color: "text-blue-400"
    },
    {
        title: "Search Engine Optimization (SEO)",
        desc: "Our platform is optimized for search engines, ensuring your business appears in relevant search results.",
        icon: Search,
        color: "text-purple-400"
    },
    {
        title: "Customer Reviews",
        desc: "Encourage satisfied customers to leave reviews, building credibility and attracting new patrons.",
        icon: Star,
        color: "text-yellow-400"
    },
    {
        title: "Real-time Updates",
        desc: "Easily update your listing to reflect changes in hours, promotions, or services.",
        icon: RefreshCw,
        color: "text-green-400"
    }
];

const benefits = [
    { title: "Increased Exposure", desc: "Reach a broader audience and attract new customers.", icon: Zap },
    { title: "Improved Credibility", desc: "Establish trust with potential customers through reviews and accurate listings.", icon: ShieldCheck },
    { title: "Competitive Advantage", desc: "Stand out from competitors with a comprehensive and up-to-date profile.", icon: Layout },
    { title: "Valuable Insights", desc: "Access analytics and feedback to refine your business strategy.", icon: BarChart3 }
];

export default function BusinessListingSection() {
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
                        Effortlessly List Your Business and <span className="gradient-text">Boost Visibility</span>
                    </motion.h2>
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-muted-foreground text-lg leading-relaxed"
                    >
                        In today's digital age, having a strong online presence is crucial for businesses to thrive. 
                        Our platform offers a seamless solution for entrepreneurs to list their establishments, 
                        making them easily discoverable via our intuitive digital map.
                    </motion.p>
                </div>

                <div className="grid lg:grid-cols-2 gap-12 items-center mb-24">
                    <motion.div 
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        className={`p-8 md:p-12 rounded-[2.5rem] border border-solid backdrop-blur-xl ${isLight ? 'bg-white border-blue-100 shadow-xl shadow-blue-500/5' : 'bg-white/5 border-white/10 shadow-2xl'}`}
                    >
                        <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-black italic">1</span>
                            Streamlined Listing Process
                        </h3>
                        <p className="text-muted-foreground mb-8 leading-relaxed">
                            Our platform is designed to simplify the process of listing your business. With just a few clicks, 
                            you can create a comprehensive profile showcasing your unique offerings, services, and contact information.
                        </p>
                        
                        <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-black italic">2</span>
                            Enhanced Visibility
                        </h3>
                        <p className="text-muted-foreground leading-relaxed">
                            Gain increased visibility among potential customers actively searching for products or services like yours. 
                            Our digital map allows users to filter results based on location, category, and ratings.
                        </p>
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
                        <h3 className="text-2xl md:text-3xl font-display font-black uppercase tracking-wider">Benefits for Business Owners</h3>
                        <div className="h-1 w-20 bg-primary mx-auto mt-4 rounded-full" />
                    </div>
                    
                    <div className="grid md:grid-cols-4 gap-6">
                        {benefits.map((benefit, i) => (
                            <motion.div
                                key={benefit.title}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.1 }}
                                className="text-center group"
                            >
                                <div className={`w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center transition-all duration-500 ${isLight ? 'bg-blue-50 text-primary group-hover:bg-primary group-hover:text-white' : 'bg-white/5 text-primary group-hover:bg-primary group-hover:text-white group-hover:shadow-[0_0_20px_rgba(59,130,246,0.4)]'}`}>
                                    <benefit.icon size={30} />
                                </div>
                                <h4 className="font-bold text-sm mb-1">{benefit.title}</h4>
                                <p className="text-[11px] text-muted-foreground px-4 italic leading-tight">{benefit.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
