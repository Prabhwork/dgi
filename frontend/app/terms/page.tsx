"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ParticleNetwork from "@/components/ParticleNetwork";
import { useTheme } from "@/components/ThemeProvider";

export default function TermsPage() {
    const { theme } = useTheme();
    const isLight = theme === 'light';

    return (
        <div className={`min-h-screen relative overflow-hidden transition-colors ${isLight ? 'bg-slate-50' : 'bg-[#020631]'}`}>
            <div className="fixed inset-0 z-0"><ParticleNetwork /></div>

            <div className="relative z-10 flex flex-col min-h-screen">
                <Navbar />

                <main className="container mx-auto px-4 pt-32 pb-20 flex-1 max-w-4xl">
                    <div className={`rounded-3xl p-8 md:p-12 border backdrop-blur-xl shadow-xl ${isLight ? 'bg-white/90 border-slate-200' : 'bg-white/5 border-white/10'}`}>
                        <h1 className="text-3xl md:text-5xl font-black mb-6 text-foreground">Terms of Service</h1>
                        <p className="text-sm font-medium text-primary mb-8">Last Updated: March 2026</p>
                        
                        <div className="space-y-6 text-muted-foreground leading-relaxed text-sm md:text-base">
                            <p>
                                Welcome to Digital Book of India (DBI). These Terms of Service dictate your use of our platform. By accessing or using DBI, you agree to be bound by these terms.
                            </p>
                            
                            <h2 className="text-xl font-bold text-foreground mt-8 mb-3">1. Use of the Platform</h2>
                            <p>
                                DBI is an online aggregator and verifier of local businesses in India. Users may browse our directory freely. Businesses wishing to list must register and undergo verification. You agree to use the platform only for lawful purposes.
                            </p>

                            <h2 className="text-xl font-bold text-foreground mt-8 mb-3">2. Business Verification</h2>
                            <p>
                                We require identification and establishment proofs for businesses. You agree that all information provided during registration (Aadhaar, PAN, Licenses) is accurate and legally owned by you. Submitting fraudulent documents will result in an immediate ban and potential legal action.
                            </p>

                            <h2 className="text-xl font-bold text-foreground mt-8 mb-3">3. User Generated Content</h2>
                            <p>
                                Reviews, questions, and other content submitted by consumers must remain respectful and factual. We reserve the right to remove non-compliant content and revoke user privileges without warning.
                            </p>

                            <h2 className="text-xl font-bold text-foreground mt-8 mb-3">4. Disclaimer of Warranties</h2>
                            <p>
                                While we employ our Accuracy Shield, we cannot guarantee 100% accuracy of business data at all times (e.g., if a business closes without notifying us). The service is provided "AS IS".
                            </p>
                        </div>
                    </div>
                </main>

                <Footer />
            </div>
        </div>
    );
}
