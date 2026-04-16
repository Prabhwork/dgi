"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

import { useTheme } from "@/components/ThemeProvider";

export default function CookiesPage() {
    const { theme } = useTheme();
    const isLight = theme === 'light';

    return (
        <div className={`min-h-screen relative overflow-hidden transition-colors bg-background text-foreground`}>
          

            <div className="relative z-10 flex flex-col min-h-screen">
                <Navbar />

                <main className="container mx-auto px-4 pt-32 pb-20 flex-1 max-w-4xl">
                    <div className={`rounded-3xl p-8 md:p-12 border backdrop-blur-xl shadow-xl ${isLight ? 'bg-white/90 border-slate-200' : 'bg-white/5 border-white/10'}`}>
                        <h1 className="text-3xl md:text-5xl font-black mb-6 text-foreground">Cookie Policy</h1>
                        
                        <div className="space-y-6 text-muted-foreground leading-relaxed text-sm md:text-base">
                            <p>
                                At Digital Book of India, we use cookies to improve your user experience and ensure the platform functions properly.
                            </p>
                            
                            <h2 className="text-xl font-bold text-foreground mt-8 mb-3">What Are Cookies?</h2>
                            <p>
                                Cookies are small text files placed on your device by your browser. They help us remember your preferences, keep you logged in securely, and understand how you interact with our website.
                            </p>

                            <h2 className="text-xl font-bold text-foreground mt-8 mb-3">Types of Cookies We Use</h2>
                            <ul className="list-disc pl-5 space-y-2">
                                <li><strong>Essential Cookies:</strong> Necessary for core site functionality (e.g., login tokens, theme preferences).</li>
                                <li><strong>Analytics Cookies:</strong> Used anonymously to track which pages are most popular and how users navigate the site, so we can improve the platform.</li>
                                <li><strong>Preference Cookies:</strong> Remember your settings, such as Language or Location preferences for business searches.</li>
                            </ul>

                            <h2 className="text-xl font-bold text-foreground mt-8 mb-3">Managing Your Cookies</h2>
                            <p>
                                You can control and/or delete cookies as you wish. You can delete all cookies that are already on your computer and you can set most browsers to prevent them from being placed. If you do this, however, you may have to manually adjust some preferences every time you visit, and certain services (like staying logged in) will not work.
                            </p>
                        </div>
                    </div>
                </main>

                <Footer />
            </div>
        </div>
    );
}
