"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CursorGlow from "@/components/CursorGlow";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Clock, ShieldCheck, Mail, Send, ArrowRight, Loader2 } from "lucide-react";

export default function BecomeAPartPage() {
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        businessName: "",
        primaryContactNumber: "",
        officialEmailAddress: "",
        brandName: "",
        businessCategory: "",
        registeredOfficeAddress: "",
        description: "",
        password: "DefaultPassword123" // In a real app, we'd have a password field. For this simplified form, we'll set a default or use OTP logic.
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleCategoryChange = (value: string) => {
        setFormData({ ...formData, businessCategory: value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/business/register`, {
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
                alert(data.error || "Something went wrong. Please try again.");
            }
        } catch (error) {
            console.error("Submission error:", error);
            alert("Connection error. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background relative overflow-hidden">
            <CursorGlow />
            <Navbar />

            <main className="pt-28 pb-16 relative z-10">
                <div className="container mx-auto px-4 max-w-2xl">

                    <AnimatePresence mode="wait">
                        {!isSubmitted ? (
                            <motion.div
                                key="form"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.4 }}
                            >
                                {/* Page Header */}
                                <div className="text-center mb-10 space-y-3">
                                    <motion.span
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-primary/20 text-primary px-4 py-1 rounded-full inline-block text-[10px] font-bold tracking-[0.2em] uppercase border border-primary/30"
                                    >
                                        Membership Application
                                    </motion.span>
                                    <h1 className="text-4xl sm:text-5xl font-display font-bold text-white tracking-tight">
                                        Become a Part <span className="text-primary italic">of DBI</span>
                                    </h1>
                                    <p className="text-muted-foreground text-sm max-w-md mx-auto leading-relaxed">
                                        Join India's most trusted network of verified businesses. Fill out the details below to start your journey.
                                    </p>
                                </div>

                                {/* Form Card */}
                                <form onSubmit={handleSubmit} className="glass-strong border border-white/10 rounded-[2rem] p-8 sm:p-10 space-y-6 shadow-2xl relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
                                    
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="businessName" className="text-white/60 text-[10px] font-bold uppercase tracking-widest ml-1">Business Name</Label>
                                            <Input 
                                                id="businessName" 
                                                required
                                                value={formData.businessName}
                                                onChange={handleChange}
                                                placeholder="Legal Business Name" 
                                                className="h-12 bg-white/5 border-white/10 rounded-xl text-white placeholder:text-white/20 focus:border-primary/50 transition-all" 
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="brandName" className="text-white/60 text-[10px] font-bold uppercase tracking-widest ml-1">Brand Name (Optional)</Label>
                                            <Input 
                                                id="brandName" 
                                                value={formData.brandName}
                                                onChange={handleChange}
                                                placeholder="Public Brand Name" 
                                                className="h-12 bg-white/5 border-white/10 rounded-xl text-white placeholder:text-white/20 focus:border-primary/50 transition-all" 
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="officialEmailAddress" className="text-white/60 text-[10px] font-bold uppercase tracking-widest ml-1">Official Email</Label>
                                            <Input 
                                                id="officialEmailAddress" 
                                                type="email" 
                                                required
                                                value={formData.officialEmailAddress}
                                                onChange={handleChange}
                                                placeholder="business@example.com" 
                                                className="h-12 bg-white/5 border-white/10 rounded-xl text-white placeholder:text-white/20 focus:border-primary/50 transition-all" 
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="primaryContactNumber" className="text-white/60 text-[10px] font-bold uppercase tracking-widest ml-1">Contact Number</Label>
                                            <Input 
                                                id="primaryContactNumber" 
                                                required
                                                value={formData.primaryContactNumber}
                                                onChange={handleChange}
                                                placeholder="+91 XXXXX XXXXX" 
                                                className="h-12 bg-white/5 border-white/10 rounded-xl text-white placeholder:text-white/20 focus:border-primary/50 transition-all" 
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="businessCategory" className="text-white/60 text-[10px] font-bold uppercase tracking-widest ml-1">Business Category</Label>
                                            <Select onValueChange={handleCategoryChange} required>
                                                <SelectTrigger id="businessCategory" className="h-12 bg-white/5 border-white/10 rounded-xl text-white focus:border-primary/50 transition-all">
                                                    <SelectValue placeholder="Select Category" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-[#111] border-white/10 text-white rounded-xl">
                                                    <SelectItem value="retail">Retail</SelectItem>
                                                    <SelectItem value="wholesale">Wholesale</SelectItem>
                                                    <SelectItem value="service">Service Provider</SelectItem>
                                                    <SelectItem value="manufacturing">Manufacturing</SelectItem>
                                                    <SelectItem value="technology">Technology</SelectItem>
                                                    <SelectItem value="other">Other</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="registeredOfficeAddress" className="text-white/60 text-[10px] font-bold uppercase tracking-widest ml-1">Office City / Address</Label>
                                            <Input 
                                                id="registeredOfficeAddress" 
                                                required
                                                value={formData.registeredOfficeAddress}
                                                onChange={handleChange}
                                                placeholder="City, State" 
                                                className="h-12 bg-white/5 border-white/10 rounded-xl text-white placeholder:text-white/20 focus:border-primary/50 transition-all" 
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="description" className="text-white/60 text-[10px] font-bold uppercase tracking-widest ml-1">About Your Business</Label>
                                        <Textarea
                                            id="description"
                                            required
                                            value={formData.description}
                                            onChange={handleChange}
                                            placeholder="Tell us briefly about your products or services..."
                                            className="min-h-[120px] bg-white/5 border-white/10 rounded-2xl text-white placeholder:text-white/20 focus:border-primary/50 resize-none transition-all p-4"
                                        />
                                    </div>

                                    <div className="pt-4">
                                        <Button 
                                            type="submit"
                                            disabled={isLoading}
                                            className="w-full h-14 text-sm font-black uppercase tracking-[0.2em] rounded-2xl bg-primary hover:bg-primary/80 text-white shadow-[0_8px_30px_rgba(59,130,246,0.3)] hover:shadow-[0_8px_35px_rgba(59,130,246,0.5)] transition-all duration-300 disabled:opacity-70 flex items-center justify-center gap-3"
                                        >
                                            {isLoading ? (
                                                <Loader2 className="animate-spin" size={20} />
                                            ) : (
                                                <>
                                                    Submit Application <Send size={18} />
                                                </>
                                            )}
                                        </Button>
                                    </div>

                                    {/* Verification Notice */}
                                    <div className="mt-8 pt-6 border-t border-white/5">
                                        <div className="flex gap-4 items-start">
                                            <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center shrink-0 border border-yellow-500/20">
                                                <ShieldCheck className="text-yellow-500" size={20} />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-xs font-bold text-white uppercase tracking-wider">Verification Protocol</p>
                                                <p className="text-[11px] text-muted-foreground leading-relaxed">
                                                    Your documents and business details will undergo <span className="text-white font-semibold">manual and automatic verification</span> to ensure DBI's integrity. Please ensure all uploaded information is accurate to avoid rejection.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="glass-strong border border-primary/30 rounded-[3rem] p-12 text-center space-y-8 relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 pointer-events-none" />
                                
                                <div className="relative">
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: "spring", damping: 10, stiffness: 100, delay: 0.2 }}
                                        className="w-24 h-24 bg-primary rounded-full mx-auto flex items-center justify-center shadow-[0_0_50px_rgba(59,130,246,0.5)]"
                                    >
                                        <CheckCircle2 size={48} className="text-white" />
                                    </motion.div>
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-2 border-dashed border-primary/20 rounded-full"
                                    />
                                </div>

                                <div className="space-y-4">
                                    <h2 className="text-3xl font-display font-bold text-white">Application Submitted!</h2>
                                    <p className="text-muted-foreground leading-relaxed">
                                        Thank you for choosing <strong>DBI Community</strong>. Your business application has been successfully registered in our queue.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
                                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-left space-y-2">
                                        <Clock className="text-primary mb-2" size={24} />
                                        <p className="text-xs font-bold text-white uppercase tracking-widest">Approval Window</p>
                                        <p className="text-sm text-muted-foreground">Verification usually takes <strong>24 to 48 hours</strong>.</p>
                                    </div>
                                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-left space-y-2">
                                        <Mail className="text-primary mb-2" size={24} />
                                        <p className="text-xs font-bold text-white uppercase tracking-widest">Check Your Email</p>
                                        <p className="text-sm text-muted-foreground">We've sent a confirmation to your <span className="text-white">official email</span>.</p>
                                    </div>
                                </div>

                                <div className="pt-6">
                                    <Button variant="outline-glow" className="rounded-xl h-12 px-8" onClick={() => window.location.href = "/"}>
                                        Return to Home <ArrowRight className="ml-2" size={16} />
                                    </Button>
                                </div>

                                <p className="text-[10px] text-muted-foreground/60 italic">
                                    Our executive may contact you for further document verification if required.
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>

            <Footer />
        </div>
    );
}
