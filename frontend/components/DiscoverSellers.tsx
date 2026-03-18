"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { MapPin, Users, Database, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/ThemeProvider";
import Link from "next/link";

const features = [
    { icon: MapPin, title: "Easy Business Listing", desc: "List your business effortlessly on our platform, making it easily discoverable by potential customers through our digital map.", href: "/listing-benefits" },
    { icon: Users, title: "Customer Connectivity", desc: "Connect customers directly to their final destination with ease, enhancing their experience and increasing your business's visibility.", href: "/customer-connectivity" },
    { icon: Database, title: "Comprehensive Information", desc: "Access detailed and accurate information about services and products from all sectors, ensuring you find exactly what you need.", href: "/comprehensive-information" },
    { icon: ShieldCheck, title: "Reliable Source", desc: "Trust in our accuracy and reliability for all your service needs, with up-to-date information that you can depend on.", href: "/reliable-source" },
];

export default function DiscoverSellers() {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: "-100px" });
    const { theme } = useTheme();

    return (
        <section className="pt-6 pb-20 relative z-10 mt-4" ref={ref}>
            <div className="container mx-auto px-4">
                <motion.div initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} className="text-center mb-16">
                    <span className={`rounded-full px-5 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] relative overflow-hidden backdrop-blur-2xl border border-solid transition-all duration-300 ${theme === 'light'
                        ? 'bg-white/80 border-blue-600 text-primary shadow-none'
                        : 'bg-white/10 border-white/30 text-white'
                        }`}>
                        Our Platform
                    </span>
                    <h2 className="text-4xl sm:text-6xl font-display font-black text-foreground mt-4 tracking-tight">
                        Discover Local Sellers<br />
                        <span className="gradient-text">with Digital Book of India</span>
                    </h2>
                    <p className="mt-4 text-muted-foreground max-w-3xl mx-auto text-sm sm:text-base">
                        Digital Book of India is your go-to digital directory, designed to connect you with local businesses effortlessly.
                    </p>
                </motion.div>

                <div className="grid sm:grid-cols-2 gap-6">
                    {features.map((f, i) => (
                        <motion.div
                            key={f.title}
                            initial={{ opacity: 0, y: 30 }}
                            animate={inView ? { opacity: 1, y: 0 } : {}}
                            transition={{ delay: i * 0.1 }}
                            className={`rounded-xl p-8 hover:-translate-y-1 transition-all duration-500 group relative overflow-hidden backdrop-blur-md border border-solid ${theme === 'light'
                                ? 'bg-white/60 border-slate-200 shadow-none hover:shadow-[0_8px_32px_rgba(37,99,235,0.06)] hover:border-primary/30'
                                : 'bg-white/[0.01] border-white/20 shadow-[0_4px_24px_rgba(0,0,0,0.2)] hover:shadow-[0_8px_32px_rgba(255,255,255,0.15)] hover:border-white/40'
                                }`}
                        >
                            {/* Inner shiny highlight */}
                            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                            <div className="w-12 h-12 rounded-lg bg-foreground/90 flex items-center justify-center mb-4">
                                <f.icon size={24} className="text-primary" />
                            </div>
                            <h3 className="font-display font-bold text-lg text-foreground">{f.title}</h3>
                            <p className="text-sm text-muted-foreground mt-2">{f.desc}</p>
                            <Button
                                variant={theme === 'light' ? 'default' : 'outline-glow'}
                                size="sm"
                                className={`mt-4 ${theme === 'light' ? 'bg-primary text-white hover:bg-primary/90' : ''}`}
                                asChild
                            >
                                <Link href={f.href || "#"}>Read More</Link>
                            </Button>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
