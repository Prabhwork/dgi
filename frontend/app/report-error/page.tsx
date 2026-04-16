"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

import { useTheme } from "@/components/ThemeProvider";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function ReportErrorPage() {
    const { theme } = useTheme();
    const isLight = theme === 'light';
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);
    };

    return (
        <div className={`min-h-screen relative overflow-hidden transition-colors bg-background text-foreground`}>
            

            <div className="relative z-10 flex flex-col min-h-screen">
                <Navbar />

                <main className="container mx-auto px-4 pt-32 pb-20 flex-1 max-w-2xl">
                    <div className={`rounded-3xl p-8 md:p-12 border backdrop-blur-xl shadow-xl ${isLight ? 'bg-white/90 border-slate-200' : 'bg-white/5 border-white/10'}`}>
                        <h1 className="text-3xl font-black mb-4 text-foreground">Report a Data Error</h1>
                        <p className="text-muted-foreground mb-8">
                            Help us keep our business listings accurate. If you found incorrect information, please let us know.
                        </p>

                        {submitted ? (
                            <div className="p-6 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-center">
                                <div className="text-4xl mb-4">✅</div>
                                <h2 className="text-xl font-bold text-emerald-600 mb-2">Thank you!</h2>
                                <p className="text-sm text-emerald-600/80">
                                    Your report has been submitted successfully. Our team will verify and correct the information shortly.
                                </p>
                                <Button onClick={() => setSubmitted(false)} className="mt-6" variant="outline">Report Another Issue</Button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1.5">Business Name or URL</label>
                                    <input 
                                        type="text" 
                                        required
                                        placeholder="e.g. Business Name or URL of the page" 
                                        className={`w-full rounded-lg border px-4 py-2 text-sm outline-none transition-colors ${
                                            isLight ? 'bg-white border-slate-300 focus:border-primary text-slate-900' : 'bg-white/5 border-white/10 focus:border-primary/50 text-white'
                                        }`} 
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1.5">What is incorrect?</label>
                                    <select 
                                        required
                                        className={`w-full rounded-lg border px-4 py-2 text-sm outline-none transition-colors ${
                                            isLight ? 'bg-white border-slate-300 focus:border-primary text-slate-900' : 'bg-[#020631] border-white/10 focus:border-primary/50 text-white'
                                        }`}
                                    >
                                        <option value="">Select an option...</option>
                                        <option value="phone">Incorrect Phone Number</option>
                                        <option value="address">Wrong Address</option>
                                        <option value="closed">Business is Permanently Closed</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1.5">Additional Details</label>
                                    <textarea 
                                        rows={4} 
                                        placeholder="Provide more details to help us verify the correction..." 
                                        className={`w-full rounded-lg border px-4 py-2 text-sm outline-none resize-none transition-colors ${
                                            isLight ? 'bg-white border-slate-300 focus:border-primary text-slate-900' : 'bg-white/5 border-white/10 focus:border-primary/50 text-white'
                                        }`} 
                                    />
                                </div>
                                <Button type="submit" className="w-full h-12 rounded-xl text-base font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40">
                                    Submit Report
                                </Button>
                            </form>
                        )}
                    </div>
                </main>

                <Footer />
            </div>
        </div>
    );
}
