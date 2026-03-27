"use client";

import React from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CursorGlow from "@/components/CursorGlow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import ParticleNetwork from "@/components/ParticleNetwork";
import { useTheme } from "@/components/ThemeProvider";
import { CheckCircle2, Loader2, Send } from "lucide-react";

export default function ContactPage() {
    const { theme } = useTheme();
    const isLight = theme === "light";
    const [isLoading, setIsLoading] = React.useState(false);
    const [isSubmitted, setIsSubmitted] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [formData, setFormData] = React.useState({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: ""
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/contact`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (data.success) {
                setIsSubmitted(true);
            } else {
                setError(data.error || "Something went wrong. Please try again.");
            }
        } catch (err) {
            setError("Connection error. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={`min-h-screen relative overflow-hidden font-sans transition-colors duration-500 ${isLight ? 'bg-slate-50' : 'bg-[#020631]'}`}>
            {/* Background elements */}
            <ParticleNetwork className="z-0 opacity-80" />
            <CursorGlow />
            <Navbar />

            <main className="pt-32 pb-24 relative z-10 px-2 md:px-4">
                <div className="container mx-auto max-w-4xl text-center">
                    
                    {/* Contact Us Pill Badge */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`inline-flex items-center px-4 py-1.5 rounded-full border backdrop-blur-md mb-8 ${
                            isLight ? 'bg-primary/10 border-primary/20' : 'bg-white/5 border-white/10'
                        }`}
                    >
                        <span className={`text-sm font-medium tracking-wider uppercase ${isLight ? 'text-primary' : 'text-white/80'}`}>
                            Contact Us
                        </span>
                    </motion.div>

                    {/* Main Heading */}
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`text-5xl md:text-7xl font-display font-black leading-tight tracking-tight mb-6 ${isLight ? 'text-slate-900' : 'text-white'}`}
                    >
                        We&apos;re Here to <span className="text-primary italic">Help You</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className={`text-lg mb-12 max-w-2xl mx-auto ${isLight ? 'text-slate-600' : 'text-white/60'}`}
                    >
                        Feel free to reach out to us with any inquiries or concerns. We&apos;re dedicated to helping you find the best local businesses and services in India.
                    </motion.p>

                    {/* Glassmorphism Form Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="relative group w-full max-w-3xl mx-auto"
                    >
                        {/* Background glow effect */}
                        <div className="absolute -inset-1 bg-[#0066ff]/20 rounded-[2.5rem] blur-3xl opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>
                        
                        <div className={`relative glass-strong border rounded-[2rem] p-5 md:p-12 backdrop-blur-3xl shadow-2xl transition-all duration-500 ${
                            isLight ? 'bg-white border-slate-300 shadow-sm' : 'bg-[#020631]/40 border-white/5'
                        }`}>
                            {!isSubmitted ? (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                                        <div className="space-y-2">
                                            <label className={`text-sm font-medium ml-1 ${isLight ? 'text-slate-700' : 'text-white/70'}`}>Your Name</label>
                                            <Input 
                                                name="name"
                                                required
                                                value={formData.name}
                                                onChange={handleChange}
                                                placeholder="Enter your name" 
                                                className={`h-14 rounded-xl focus:ring-[#0066ff] focus:border-[#0066ff] transition-all ${
                                                    isLight 
                                                    ? 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400' 
                                                    : 'bg-white/5 border-white/10 text-white placeholder:text-white/20'
                                                }`}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className={`text-sm font-medium ml-1 ${isLight ? 'text-slate-700' : 'text-white/70'}`}>Your Email</label>
                                            <Input 
                                                name="email"
                                                required
                                                value={formData.email}
                                                onChange={handleChange}
                                                placeholder="Enter your email" 
                                                type="email"
                                                className={`h-14 rounded-xl focus:ring-[#0066ff] focus:border-[#0066ff] transition-all ${
                                                    isLight 
                                                    ? 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400' 
                                                    : 'bg-white/5 border-white/10 text-white placeholder:text-white/20'
                                                }`}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                                        <div className="space-y-2">
                                            <label className={`text-sm font-medium ml-1 ${isLight ? 'text-slate-700' : 'text-white/70'}`}>Phone Number</label>
                                            <Input 
                                                name="phone"
                                                required
                                                value={formData.phone}
                                                onChange={handleChange}
                                                placeholder="Enter your phone number" 
                                                className={`h-14 rounded-xl focus:ring-[#0066ff] focus:border-[#0066ff] transition-all ${
                                                    isLight 
                                                    ? 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400' 
                                                    : 'bg-white/5 border-white/10 text-white placeholder:text-white/20'
                                                }`}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className={`text-sm font-medium ml-1 ${isLight ? 'text-slate-700' : 'text-white/70'}`}>Subject</label>
                                            <Input 
                                                name="subject"
                                                required
                                                value={formData.subject}
                                                onChange={handleChange}
                                                placeholder="How can we help?" 
                                                className={`h-14 rounded-xl focus:ring-[#0066ff] focus:border-[#0066ff] transition-all ${
                                                    isLight 
                                                    ? 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400' 
                                                    : 'bg-white/5 border-white/10 text-white placeholder:text-white/20'
                                                }`}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2 text-left">
                                        <label className={`text-sm font-medium ml-1 ${isLight ? 'text-slate-700' : 'text-white/70'}`}>Message</label>
                                        <Textarea 
                                            name="message"
                                            required
                                            value={formData.message}
                                            onChange={handleChange}
                                            placeholder="Type your message here..." 
                                            className={`min-h-[180px] rounded-xl focus:ring-[#0066ff] focus:border-[#0066ff] resize-none p-4 transition-all ${
                                                isLight 
                                                ? 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400' 
                                                : 'bg-white/5 border-white/10 text-white placeholder:text-white/20'
                                            }`}
                                        />
                                    </div>

                                    {error && (
                                        <p className="text-red-400 text-sm font-medium">{error}</p>
                                    )}

                                    <motion.div
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <Button 
                                            type="submit"
                                            disabled={isLoading}
                                            variant={isLight ? "default" : "glow"}
                                            className={`w-full h-16 rounded-xl font-black text-xl tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-3 ${
                                                isLight ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-600/20' : ''
                                            }`}
                                        >
                                            {isLoading ? (
                                                <>
                                                    <Loader2 className="animate-spin" size={24} />
                                                    SUBMITTING...
                                                </>
                                            ) : (
                                                <>
                                                    SUBMIT
                                                </>
                                            )}
                                        </Button>
                                    </motion.div>
                                </form>
                            ) : (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="py-12 flex flex-col items-center gap-6"
                                >
                                    <div className={`w-20 h-20 rounded-full flex items-center justify-center border ${
                                        isLight ? 'bg-green-50 border-green-200' : 'bg-green-500/20 border-green-500/30'
                                    }`}>
                                        <CheckCircle2 size={40} className="text-green-500" />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className={`text-3xl font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>Message Sent!</h3>
                                        <p className={`${isLight ? 'text-slate-600' : 'text-white/60'}`}>Thank you for reaching out. We&apos;ll get back to you shortly.</p>
                                    </div>
                                    <Button 
                                        variant="outline" 
                                        className={`mt-4 ${isLight ? 'border-slate-200 text-slate-700 hover:bg-slate-50' : 'border-white/10 text-white'}`}
                                        onClick={() => setIsSubmitted(false)}
                                    >
                                        Send Another Message
                                    </Button>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
