"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

import { useTheme } from "@/components/ThemeProvider";

export default function AdvertisingPage() {
    const { theme } = useTheme();
    const isLight = theme === 'light';

    return (
        <div className={`min-h-screen relative overflow-hidden transition-colors bg-background text-foreground`}>
  

            <div className="relative z-10 flex flex-col min-h-screen">
                <Navbar />

                <main className="container mx-auto px-4 pt-32 pb-20 flex-1 max-w-4xl">
                    <div className={`rounded-3xl p-8 md:p-12 border backdrop-blur-xl shadow-xl ${isLight ? 'bg-white/90 border-slate-200' : 'bg-white/5 border-white/10'}`}>
                        <h1 className="text-3xl md:text-5xl font-black mb-6 text-foreground">Advertising Solutions</h1>
                        
                        <div className="space-y-6 text-muted-foreground leading-relaxed text-sm md:text-base">
                            <p className="text-lg font-medium text-foreground">
                                Reach thousands of engaged customers actively looking for businesses like yours.
                            </p>
                            
                            <h2 className="text-xl font-bold text-foreground mt-8 mb-3">Why Advertise with DBI?</h2>
                            <ul className="list-disc pl-5 space-y-2">
                                <li><strong>Targeted Audience:</strong> Our users come to DBI specifically to find and verify businesses. Put your brand in front of high-intent buyers.</li>
                                <li><strong>Boosted Visibility:</strong> Appear at the top of category searches in your city.</li>
                                <li><strong>Trust Factor:</strong> Combine advertising with your Verified badge to dramatically increase conversion rates.</li>
                            </ul>

                            <h2 className="text-xl font-bold text-foreground mt-8 mb-3">Promotional Options</h2>
                            <div className="grid md:grid-cols-2 gap-4 my-6">
                                <div className="p-6 bg-primary/10 border border-primary/20 rounded-2xl">
                                    <h3 className="text-foreground font-bold mb-2">Featured Listings</h3>
                                    <p className="text-sm">Pin your business profile to the top of relevant search results for maximum exposure.</p>
                                </div>
                                <div className="p-6 bg-teal-500/10 border border-teal-500/20 rounded-2xl">
                                    <h3 className="text-foreground font-bold mb-2">Homepage Spotlight</h3>
                                    <p className="text-sm">Get featured directly on the DBI homepage as a recommended trending business.</p>
                                </div>
                            </div>

                            <div className="mt-8 p-6 bg-slate-100 dark:bg-white/5 rounded-2xl text-center">
                                <h3 className="text-lg font-bold text-foreground mb-2">Ready to grow?</h3>
                                <p className="mb-4 text-sm">Contact our advertising team to discuss a custom plan for your business.</p>
                                <a href="mailto:ads@digitalbookofindia.com" className="inline-block px-6 py-3 bg-primary text-white rounded-xl font-bold hover:opacity-90 transition">
                                    Contact Advertising Team
                                </a>
                            </div>
                        </div>
                    </div>
                </main>

                <Footer />
            </div>
        </div>
    );
}
