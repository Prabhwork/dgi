"use strict";

import React from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CursorGlow from "@/components/CursorGlow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import ParticleNetwork from "@/components/ParticleNetwork";

export default function ContactPage() {
    return (
        <div className="min-h-screen bg-[#020617] text-white relative overflow-hidden font-sans">
            {/* Background elements */}
            <ParticleNetwork />
            <CursorGlow />
            <Navbar />

            <main className="pt-32 pb-24 relative z-10 px-4">
                <div className="container mx-auto max-w-4xl text-center">
                    
                    {/* Contact Us Pill Badge */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-8"
                    >
                        <span className="text-sm font-medium tracking-wider uppercase text-white/80">
                            Contact Us
                        </span>
                    </motion.div>

                    {/* Main Heading */}
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl md:text-7xl font-display font-black leading-tight tracking-tight mb-6"
                    >
                        We&apos;re Here to <span className="text-[#0066ff]">Help You</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-lg text-white/60 mb-12 max-w-2xl mx-auto"
                    >
                        Feel free to reach out to us with any inquiries or concerns. We&apos;re dedicated to helping you find the best local businesses and services in India.
                    </motion.p>

                    {/* Glassmorphism Form Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="relative group"
                    >
                        {/* Background glow effect */}
                        <div className="absolute -inset-1 bg-[#0066ff]/20 rounded-[2.5rem] blur-3xl opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>
                        
                        <div className="relative glass-strong border border-white/5 rounded-[2rem] p-8 md:p-12 bg-[#020631]/40 backdrop-blur-3xl shadow-2xl">
                            <form className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-white/70 ml-1">Your Name</label>
                                        <Input 
                                            placeholder="Enter your name" 
                                            className="h-14 bg-white/5 border-white/10 rounded-xl focus:ring-[#0066ff] focus:border-[#0066ff] placeholder:text-white/20"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-white/70 ml-1">Your Email</label>
                                        <Input 
                                            placeholder="Enter your email" 
                                            type="email"
                                            className="h-14 bg-white/5 border-white/10 rounded-xl focus:ring-[#0066ff] focus:border-[#0066ff] placeholder:text-white/20"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2 text-left">
                                    <label className="text-sm font-medium text-white/70 ml-1">Subject</label>
                                    <Input 
                                        placeholder="How can we help?" 
                                        className="h-14 bg-white/5 border-white/10 rounded-xl focus:ring-[#0066ff] focus:border-[#0066ff] placeholder:text-white/20"
                                    />
                                </div>
                                <div className="space-y-2 text-left">
                                    <label className="text-sm font-medium text-white/70 ml-1">Message</label>
                                    <Textarea 
                                        placeholder="Type your message here..." 
                                        className="min-h-[180px] bg-white/5 border-white/10 rounded-xl focus:ring-[#0066ff] focus:border-[#0066ff] placeholder:text-white/20 resize-none p-4"
                                    />
                                </div>

                                <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <Button 
                                        variant="glow"
                                        className="w-full h-16 rounded-xl text-white font-black text-xl tracking-wider uppercase transition-all duration-300 shadow-[0_0_30px_rgba(0,102,255,0.4)]"
                                    >
                                        SUBMIT
                                    </Button>
                                </motion.div>
                            </form>
                        </div>
                    </motion.div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
