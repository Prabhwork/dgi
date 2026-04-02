"use client";

import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { useTheme } from "./ThemeProvider";

interface TestimonialData {
    _id?: string;
    quote: string;
    name: string;
    role: string;
    initial: string;
    rating?: number;
}

const fallbackTestimonials: TestimonialData[] = [
    {
        quote: "Indore mein mera kirana store hai. Digital Book of India se judne ke baad orders 40% badh gaye hain. Log ab mujhe online dhoondh lete hain, bohot suvidha ho gayi hai!",
        name: "Rajesh Khandelwal",
        role: "Kirana Store Owner, Indore",
        initial: "R",
    },
    {
        quote: "Jaipur ki humari boutique ke liye ye platform vardaan hai. Pehle hum sirf local bechte the, ab Digital Book of India ki wajah se poore Bharat se orders aate hain. Sapna sach ho gaya!",
        name: "Sunita Sharma",
        role: "Boutique Owner, Jaipur",
        initial: "S",
    },
    {
        quote: "Main Chandigarh mein electrician hoon. Is platform ne mujhe verified leads dilwayi hain. Ab customer ko mujh par bharosa hai aur kaam bhi lagatar mil raha hai. Best tool for small workers!",
        name: "Gurpreet Singh",
        role: "Professional Electrician, Chandigarh",
        initial: "G",
    },
];

export default function Testimonial() {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: "-100px" });
    const [current, setCurrent] = useState(0);
    const [testimonials, setTestimonials] = useState<TestimonialData[]>(fallbackTestimonials);
    const { theme } = useTheme();



    useEffect(() => {
        const fetchTestimonials = async () => {
            try {
                const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
                const res = await fetch(`${API}/testimonials`);
                const data = await res.json();
                if (data.success && data.data.length > 0) {
                    const formatted = data.data.map((t: any) => ({
                        _id: t._id,
                        quote: t.quote,
                        name: t.name,
                        role: t.role,
                        initial: t.name.charAt(0).toUpperCase(),
                        rating: t.rating
                    }));
                    setTestimonials(formatted);
                }
            } catch (err) {
                console.error("Failed to fetch testimonials:", err);
            }
        };
        fetchTestimonials();
    }, []);

    useEffect(() => {
        if (testimonials.length === 0) return;
        const timer = setInterval(() => {
            setCurrent((prev) => (prev + 1) % testimonials.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [testimonials.length]);


    return (
        <section className="pt-0 pb-20 relative z-10 mt-4 overflow-hidden" id="testimonials" ref={ref}>
            <div className="container mx-auto px-4">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    {/* Left Side */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={inView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.6 }}
                    >
                        <span className={`rounded-full px-5 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] relative overflow-hidden backdrop-blur-2xl border border-solid transition-all duration-300 ${theme === 'light'
                            ? 'bg-white/80 border-blue-600 text-primary shadow-none'
                            : 'bg-white/10 border-white/30 text-primary uppercase tracking-[0.2em]'
                            }`}>
                            Testimonials
                        </span>
                        <h2 className="text-4xl sm:text-6xl font-display font-black text-foreground mt-4 tracking-tight leading-[1.1]">
                            What Our <br />
                            <span className="gradient-text">Users Say</span>
                        </h2>
                        <p className="mt-6 text-base text-muted-foreground leading-relaxed max-w-lg">
                            Digital Book of India has helped countless local businesses connect with customers across the
                            nation. Here&apos;s what some of our users have to say about their experience.
                        </p>
                        <div className="mt-10">
                            <Link href="/review">
                                <button
                                    className={`px-8 py-4 rounded-xl font-bold transition-all duration-300 border-none shadow-lg ${theme === 'light'
                                        ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-600/20 hover:-translate-y-1'
                                        : 'bg-primary text-white hover:bg-primary/90 shadow-primary/20 hover:-translate-y-1'
                                        }`}>
                                    Give Your Review
                                </button>
                            </Link>
                        </div>
                    </motion.div>

                    {/* Right Side - Testimonial Carousel */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={inView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="relative"
                    >
                        {/* Decorative Background Glows for Testimonial Area */}
                        <div className="absolute inset-0 z-0 pointer-events-none">
                            <motion.div
                                animate={{
                                    scale: [1, 1.2, 1],
                                    opacity: [0.1, 0.2, 0.1],
                                    x: [0, 20, 0],
                                    y: [0, -20, 0]
                                }}
                                transition={{ duration: 8, repeat: Infinity }}
                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-primary/20 rounded-full blur-[100px]"
                            />
                            <motion.div
                                animate={{
                                    scale: [1, 1.3, 1],
                                    opacity: [0.1, 0.15, 0.1],
                                    x: [0, -30, 0],
                                    y: [0, 30, 0]
                                }}
                                transition={{ duration: 10, repeat: Infinity, delay: 1 }}
                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-accent/10 rounded-full blur-[80px]"
                            />
                        </div>

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={current}
                                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 1.05, y: -10 }}
                                transition={{ duration: 0.5, ease: "easeOut" }}
                                className={`rounded-[2rem] min-h-[350px] p-8 sm:p-12 relative border border-solid transition-all duration-300 backdrop-blur-3xl z-10 ${theme === 'light'
                                    ? 'bg-white border-slate-200 shadow-[0_10px_40px_rgba(0,0,0,0.06)]'
                                    : 'bg-white/[0.03] border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.3)]'
                                    }`}
                            >
                                {/* Internal card highlight */}
                                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

                                <div className="flex justify-between items-start mb-6">
                                </div>

                                <p className="text-xl sm:text-2xl text-foreground font-medium leading-relaxed mb-10 tracking-tight italic">
                                    &quot;{testimonials[current]?.quote}&quot;
                                </p>

                                <div className="flex items-center gap-5 pt-6 border-t border-white/10 mt-auto">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/30 to-accent/10 flex items-center justify-center font-display font-black text-xl text-white shadow-[0_0_20px_rgba(var(--primary),0.3)] border border-white/20 backdrop-blur-md">
                                        {testimonials[current]?.initial}
                                    </div>
                                    <div className="text-left">
                                        <p className="text-lg font-bold text-foreground leading-none">{testimonials[current]?.name}</p>
                                        <p className="text-xs text-primary font-bold uppercase tracking-widest mt-1.5">{testimonials[current]?.role}</p>
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </motion.div>
                </div>
            </div>


        </section>
    );
}
