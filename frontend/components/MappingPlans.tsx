"use client";

import { motion } from "framer-motion";
import { Check, MapPin, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState } from "react";
import { useTheme } from "@/components/ThemeProvider";

const plans = [
    {
        id: "mini",
        name: "Mini Mapping",
        tagline: "Perfect for Solo Traders",
        price: "₹99",
        period: "/month",
        color: "from-slate-500/20 to-slate-700/10",
        border: "border-white/10",
        badge: null,
        features: [
            "1 Business Listing",
            "Basic Profile Page",
            "Location Pin on Map",
            "Customer Contact Info",
            "DBI Verified Badge",
            "Email Support",
        ],
    },
    {
        id: "micro",
        name: "Micro",
        tagline: "For Small Local Shops",
        price: "₹249",
        period: "/month",
        color: "from-blue-500/20 to-blue-900/10",
        border: "border-primary/30",
        badge: null,
        features: [
            "Up to 3 Business Listings",
            "Enhanced Profile with Photos",
            "Live Open/Closed Status",
            "Location Mapping + Route Guide",
            "DBI Verified Badge",
            "Community Broadcast Access",
            "Priority Email Support",
        ],
    },
    {
        id: "small",
        name: "Small",
        tagline: "For Growing Businesses",
        price: "₹599",
        period: "/month",
        color: "from-indigo-500/20 to-indigo-900/10",
        border: "border-indigo-400/40",
        badge: "Most Popular",
        features: [
            "Up to 10 Business Listings",
            "Premium Profile + Gallery",
            "Live Active / Inactive Pulse",
            "Tender Alerts (Domain-Specific)",
            "Inter-Member Flash Sale Access",
            "Analytics Dashboard",
            "DBI Verified Badge",
            "Fraud Protection Shield",
            "Priority Chat Support",
        ],
    },
    {
        id: "medium",
        name: "Medium",
        tagline: "For Established Enterprises",
        price: "₹1,299",
        period: "/month",
        color: "from-violet-500/20 to-violet-900/10",
        border: "border-violet-400/40",
        badge: "Best Value",
        features: [
            "Unlimited Business Listings",
            "Full Suite Profile & Branding",
            "Live Status + Hyper-Local Boost",
            "All Tender Categories Access",
            "Community Broadcast Priority",
            "Advanced Analytics + Reports",
            "DBI Business Certification",
            "Dedicated Account Manager",
            "API Access (Business Suite)",
            "24/7 Priority Support",
        ],
    },
];

export default function MappingPlans() {
    const [hovered, setHovered] = useState<string | null>(null);
    const { theme } = useTheme();

    return (
        <section className="py-20 relative z-10 overflow-hidden" id="mapping-plans">
            {/* Section Header */}
            <div className="container mx-auto px-4">
                <div className="text-center mb-12 space-y-3">
                    <motion.span
                        initial={{ opacity: 0, y: -10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <span className={`rounded-full px-5 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] relative overflow-hidden backdrop-blur-2xl border border-solid transition-all duration-300 ${theme === 'light'
                            ? 'bg-[#FFFFF0]/80 border-blue-600 text-primary shadow-none'
                            : 'bg-white/10 border-white/30 text-primary'
                            }`}>
                            Our Plans
                        </span>
                    </motion.span>
                    <motion.h2
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-3xl sm:text-5xl font-display font-bold text-white tracking-tight"
                    >
                        Explore Our <span className="gradient-text italic">Mapping Plans</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-muted-foreground text-sm max-w-xl mx-auto"
                    >
                        Choose the plan that fits your business size. Every plan includes DBI Verification and Map Listing.
                    </motion.p>
                </div>

                {/* Plan Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-7xl mx-auto">
                    {plans.map((plan, i) => (
                        <motion.div
                            key={plan.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.08 }}
                            onMouseEnter={() => setHovered(plan.id)}
                            onMouseLeave={() => setHovered(null)}
                            className={`relative flex flex-col rounded-2xl border ${plan.border} bg-gradient-to-b ${plan.color} backdrop-blur-sm p-5 transition-all duration-300 ${hovered === plan.id
                                ? (theme === 'light' ? 'scale-[1.02] border-blue-600/40' : 'scale-[1.02] shadow-[0_0_30px_rgba(59,130,246,0.2)]')
                                : ''
                                }`}
                        >
                            {/* Popular Badge */}
                            {plan.badge && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                    <span className={`flex items-center gap-1 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${plan.badge === "Most Popular" ? "bg-primary text-white" : "bg-violet-500 text-white"}`}>
                                        <Star size={9} fill="currentColor" /> {plan.badge}
                                    </span>
                                </div>
                            )}

                            {/* Plan Title */}
                            <div className="mb-4 pt-2">
                                <div className="flex items-center gap-2 mb-1">
                                    <MapPin size={14} className="text-primary shrink-0" />
                                    <h3 className="text-base font-display font-bold text-white uppercase tracking-wider">
                                        {plan.name}
                                    </h3>
                                </div>
                                <p className="text-xs text-muted-foreground ml-5">{plan.tagline}</p>
                            </div>

                            {/* Price */}
                            <div className="border-t border-white/10 pt-4 mb-5">
                                <div className="flex items-end gap-1">
                                    <span className="text-3xl font-display font-bold text-white">{plan.price}</span>
                                    <span className="text-xs text-muted-foreground mb-1">{plan.period}</span>
                                </div>
                            </div>

                            {/* Features */}
                            <ul className="flex-1 space-y-2.5 mb-6">
                                {plan.features.map((f, fi) => (
                                    <li key={fi} className="flex items-start gap-2 text-xs text-white/70">
                                        <Check size={13} className="text-primary shrink-0 mt-0.5" />
                                        {f}
                                    </li>
                                ))}
                            </ul>

                            {/* CTA */}
                            <Button
                                className={`w-full h-9 text-xs font-semibold uppercase tracking-widest rounded-xl transition-all ${plan.badge === "Most Popular" || plan.badge === "Best Value" ? "bg-primary hover:bg-primary/80 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]" : "bg-white/10 hover:bg-white/20 text-white"}`}
                                asChild
                            >
                                <Link href="/community/register">Get Started</Link>
                            </Button>
                        </motion.div>
                    ))}
                </div>

                {/* Bottom Note */}
                <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="text-center text-xs text-muted-foreground mt-8"
                >
                    All plans include a free 14-day trial. No credit card required. &nbsp;
                    <Link href="/community/register" className="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors">
                        Apply now →
                    </Link>
                </motion.p>
            </div>
        </section>
    );
}
