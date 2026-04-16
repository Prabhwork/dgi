"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

import { useTheme } from "@/components/ThemeProvider";

export default function PrivacyPage() {
    const { theme } = useTheme();
    const isLight = theme === 'light';

    return (
        <div className={`min-h-screen relative overflow-hidden transition-colors bg-background text-foreground`}>
      

            <div className="relative z-10 flex flex-col min-h-screen">
                <Navbar />

                <main className="container mx-auto px-4 pt-32 pb-20 flex-1 max-w-4xl">
                    <div className={`rounded-3xl p-8 md:p-12 border backdrop-blur-xl shadow-xl ${isLight ? 'bg-white border-slate-300 shadow-sm' : 'bg-white/5 border-white/10'}`}>
                        <h1 className={`text-3xl md:text-5xl font-black mb-6 ${isLight ? 'text-slate-900' : 'text-white'}`}>Privacy Policy</h1>
                        <p className="text-sm font-medium text-primary mb-8">Last Updated: March 2026</p>
                        
                        <div className={`space-y-6 leading-relaxed text-sm md:text-base ${isLight ? 'text-slate-600' : 'text-white/70'}`}>
                            <p>
                                At Digital Book of India, your privacy is our priority. This Privacy Policy details the types of personal data we collect and how it is used and protected.
                            </p>
                            
                            <h2 className="text-xl font-bold text-foreground mt-8 mb-3">1. Information We Collect</h2>
                            <p>
                                <strong>From Users:</strong> Account creation data (name, email), browsing history on our site, and review content.<br/>
                                <strong>From Businesses:</strong> Verification documents including Aadhaar (which we encrypt), PAN, establishment proofs, business contact numbers, and office addresses.
                            </p>

                            <h2 className="text-xl font-bold text-foreground mt-8 mb-3">2. How We Use Your Data</h2>
                            <p>
                                We use your data strictly to operate our platform. Business data (except sensitive KYC docs) is displayed publicly to connect you with customers. User data is used to authenticate reviews and manage accounts. We do NOT sell your data to third-party data brokers.
                            </p>

                            <h2 className="text-xl font-bold text-foreground mt-8 mb-3">3. Data Security & Encryption</h2>
                            <p>
                                We implement state-of-the-art encryption (AES-256) for highly sensitive fields such as Aadhaar numbers. Verification documents are stored securely and are only accessed by our trust and safety team during the approval process.
                            </p>

                            <h2 className="text-xl font-bold text-foreground mt-8 mb-3">4. Your Rights</h2>
                            <p>
                                You have the right to request access to the data we hold, and the right to request deletion. Please note that deleting a business account removes your public listing entirely.
                            </p>
                        </div>
                    </div>
                </main>

                <Footer />
            </div>
        </div>
    );
}
