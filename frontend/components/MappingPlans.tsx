"use client";

import { motion } from "framer-motion";
import { Check, MapPin, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState } from "react";
import { useTheme } from "@/components/ThemeProvider";

const plans = [
    {
        id: "micro",
        name: "Micro (Starter Plan)",
        tagline: "Perfect for starting online presence",
        price: "₹365",
        period: "/year",
        color: "from-slate-500/20 to-slate-700/10",
        border: "border-white/10",
        badge: "₹1/day",
        isComingSoon: false,
        features: [
            "Listed on Map",
            "Basic Business Profile",
            "Personalized Page (Photos, Posts)",
            "Business Timings",
            "Direction (Map Navigation)",
            "Basic Ratings",
            "1 Category Listing",
            "Limited Updates",
        ],
    },
    {
        id: "small",
        name: "Small (Growth Plan)",
        tagline: "Best for growing local businesses",
        price: "₹3,650",
        period: "/year",
        color: "from-blue-500/20 to-blue-900/10",
        border: "border-primary/30",
        badge: "Coming Soon",
        isComingSoon: true,
        features: [
            "Everything in Micro +",
            "Reviews (Customer Feedback)",
            "Gallery (Unlimited Photos)",
            "Multiple Categories",
            "Merchant Panel Access",
            "Status Control (Open/Close)",
            "Receiving Orders",
            "Priority Listing on Map",
            "Basic Analytics",
        ],
    },
    {
        id: "medium",
        name: "Medium (Pro Plan)",
        tagline: "For serious business scaling",
        price: "₹9,999",
        period: "/year",
        color: "from-indigo-500/20 to-indigo-900/10",
        border: "border-indigo-400/40",
        badge: "Coming Soon",
        isComingSoon: true,
        features: [
            "Everything in Small +",
            "Featured Listing (Top Placement)",
            "Advertisement Access",
            "Advanced Analytics (Views, Clicks, Leads)",
            "Custom Branding (Logo, Theme)",
            "Customer Inquiry System",
            "Social Media Integration",
            "Faster Support",
        ],
    },
    {
        id: "premium",
        name: "Premium (Business Suite 🚀)",
        tagline: "The absolute growth engine",
        price: "₹19,999",
        period: "/year",
        color: "from-violet-500/20 to-violet-900/10",
        border: "border-violet-400/40",
        badge: "Coming Soon",
        isComingSoon: true,
        features: [
            "Everything in Medium +",
            "Top Priority Map Placement",
            "Sponsored Listings Boost",
            "Advanced Business Insights & Reports",
            "Smart Recommendations (Growth Tips)",
            "Ad Campaign Management",
            "Full Order Management System",
            "Invoice & Billing System",
            "Dedicated Support",
            "Early Access Features",
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
                        className={`text-3xl sm:text-5xl font-display font-bold tracking-tight ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}
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
                            className={`relative flex flex-col rounded-2xl border backdrop-blur-sm p-5 transition-all duration-300 ${
                                theme === 'light'
                                    ? `bg-white border-slate-300 shadow-sm`
                                    : `${plan.border} bg-gradient-to-b ${plan.color}`
                            } ${hovered === plan.id
                                ? (theme === 'light' ? 'scale-[1.02] border-blue-500 shadow-md' : 'scale-[1.02] shadow-[0_0_30px_rgba(59,130,246,0.2)]')
                                : ''
                                }`}
                        >
                            {/* Popular Badge */}
                            {plan.badge && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                    <span className={`flex items-center gap-1 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${plan.isComingSoon ? "bg-slate-500/50 text-white" : "bg-primary text-white"}`}>
                                        {plan.id === "micro" ? <Check size={9} fill="currentColor" /> : <Star size={9} fill="currentColor" />} {plan.badge}
                                    </span>
                                </div>
                            )}

                            {/* Plan Title */}
                            <div className="mb-4 pt-2">
                                <div className="flex items-center gap-2 mb-1">
                                    <MapPin size={14} className={plan.isComingSoon ? "text-slate-500" : "text-primary shrink-0"} />
                                    <h3 className={`text-base font-display font-bold uppercase tracking-wider ${plan.isComingSoon ? "text-slate-400" : (theme === 'light' ? "text-slate-900" : "text-white")}`}>
                                        {plan.name}
                                    </h3>
                                </div>
                                <p className="text-xs text-muted-foreground ml-5">{plan.tagline}</p>
                            </div>

                            {/* Price */}
                            <div className={`border-t pt-4 mb-5 ${theme === 'light' ? 'border-slate-200' : 'border-white/10'}`}>
                                <div className="flex items-end gap-1">
                                    <span className={`text-3xl font-display font-bold ${plan.isComingSoon ? "text-slate-400" : (theme === 'light' ? "text-slate-900" : "text-white")}`}>{plan.price}</span>
                                    <span className="text-xs text-muted-foreground mb-1">{plan.period}</span>
                                </div>
                            </div>

                            {/* Features */}
                            <ul className="flex-1 space-y-2.5 mb-6">
                                {plan.features.map((f, fi) => (
                                    <li key={fi} className={`flex items-start gap-2 text-xs ${plan.isComingSoon ? "text-slate-500" : (theme === 'light' ? "text-slate-700" : "text-white/70")}`}>
                                        <Check size={13} className={plan.isComingSoon ? "text-slate-400" : "text-primary shrink-0 mt-0.5"} />
                                        {f}
                                    </li>
                                ))}
                            </ul>

                            {/* CTA */}
                            <Button
                                className={`w-full h-9 text-xs font-semibold uppercase tracking-widest rounded-xl transition-all border ${plan.isComingSoon
                                        ? (theme === 'light' ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed" : "bg-white/5 text-slate-500 cursor-not-allowed border-white/5")
                                        : (theme === 'light' ? "bg-primary hover:bg-primary/90 text-white shadow-md border-transparent" : "bg-primary hover:bg-primary/90 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)] border-transparent")
                                    }`}
                                asChild={!plan.isComingSoon}
                                disabled={plan.isComingSoon}
                            >
                                {plan.isComingSoon ? (
                                    <span>Coming Soon</span>
                                ) : (
                                    <Link href="/community/register">Get Started</Link>
                                )}
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
        
                </motion.p>
            </div>
        </section>
    );
}
