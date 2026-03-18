"use client";

import { motion } from "framer-motion";
import { Users, Zap, ShieldCheck, Layout, Clock, Heart, BarChart3, Globe } from "lucide-react";
import { useTheme } from "./ThemeProvider";

const features = [
    {
        title: "Intuitive Navigation",
        desc: "User-friendly interfaces guide customers to their destination with ease.",
        icon: Layout,
        color: "text-blue-400"
    },
    {
        title: "Real-time Updates",
        desc: "Provide accurate, up-to-the-minute information to ensure smooth connections.",
        icon: Globe,
        color: "text-purple-400"
    },
    {
        title: "Personalized Experiences",
        desc: "Tailor the journey to individual preferences and needs for maximum impact.",
        icon: Heart,
        color: "text-pink-400"
    },
    {
        title: "Direct Access",
        desc: "Eliminate detours and streamline the process of reaching your business.",
        icon: Zap,
        color: "text-yellow-400"
    }
];

const businessBenefits = [
    { title: "Competitive Advantage", desc: "Differentiate your business by offering a superior customer experience.", icon: Layout },
    { title: "Customer Loyalty", desc: "Foster long-term relationships through convenient, hassle-free connections.", icon: Heart },
    { title: "Valuable Insights", desc: "Access analytics and feedback to refine your business strategy.", icon: BarChart3 }
];

const customerBenefits = [
    { title: "Convenience", desc: "Enjoy a streamlined, efficient journey to their final destination.", icon: Zap },
    { title: "Time Savings", desc: "Quickly reach their endpoint with minimal delays or unnecessary detours.", icon: Clock },
    { title: "Reduced Stress", desc: "Experience a seamless connection, minimizing frustration and friction.", icon: ShieldCheck }
];

export default function CustomerConnectivitySection() {
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
                        Streamline Customer Journeys: <span className="gradient-text">Direct Connections</span>
                    </motion.h2>
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-muted-foreground text-lg leading-relaxed"
                    >
                        Our platform revolutionizes the way customers connect with their final destinations, 
                        simplifying the journey and amplifying your business's visibility. 
                        Deliver a seamless experience that fosters positive associations with your brand.
                    </motion.p>
                </div>

                <div className="grid lg:grid-cols-2 gap-12 items-center mb-24">
                    <motion.div 
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        className={`p-8 md:p-12 rounded-[2.5rem] border border-solid backdrop-blur-xl ${isLight ? 'bg-white border-blue-100 shadow-xl shadow-blue-500/5' : 'bg-white/5 border-white/10 shadow-2xl'}`}
                    >
                        <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                            Direct Connections for Hassle-Free Experience
                        </h3>
                        <p className="text-muted-foreground mb-8 leading-relaxed">
                            Our innovative solution enables customers to effortlessly reach their desired endpoint, 
                            eliminating detours and streamlining the process. Reduce friction, save time, and enhance satisfaction.
                        </p>
                        
                        <h3 className="text-2xl font-bold mb-6 flex items-center gap-3 border-t border-solid pt-8 border-white/5">
                            Increased Visibility for Your Business
                        </h3>
                        <p className="text-muted-foreground leading-relaxed">
                            Heightened exposure reach a broader audience, improved discoverability make it easy for customers to find you, 
                            and enhanced credibility demonstrates your commitment to user convenience.
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

                <div className="grid md:grid-cols-2 gap-12">
                    <div>
                        <div className="mb-12">
                            <h3 className="text-2xl font-display font-black uppercase tracking-wider">Benefits for Businesses</h3>
                            <div className="h-1 w-20 bg-primary mt-4 rounded-full" />
                        </div>
                        <div className="space-y-6">
                            {businessBenefits.map((benefit, i) => (
                                <motion.div 
                                    key={benefit.title}
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="flex gap-4"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 text-primary">
                                        <benefit.icon size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm">{benefit.title}</h4>
                                        <p className="text-xs text-muted-foreground">{benefit.desc}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <div className="mb-12">
                            <h3 className="text-2xl font-display font-black uppercase tracking-wider">Benefits for Customers</h3>
                            <div className="h-1 w-20 bg-blue-400 mt-4 rounded-full" />
                        </div>
                        <div className="space-y-6">
                            {customerBenefits.map((benefit, i) => (
                                <motion.div 
                                    key={benefit.title}
                                    initial={{ opacity: 0, x: 20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="flex gap-4"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-blue-400/10 flex items-center justify-center shrink-0 text-blue-400">
                                        <benefit.icon size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm">{benefit.title}</h4>
                                        <p className="text-xs text-muted-foreground">{benefit.desc}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
