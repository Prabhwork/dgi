"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

import { useTheme } from "@/components/ThemeProvider";

export default function AboutPage() {
    const { theme } = useTheme();
    const isLight = theme === 'light';

    return (
        <div className={`min-h-screen relative overflow-hidden transition-colors bg-background text-foreground`}>

            <div className="relative z-10 flex flex-col min-h-screen">
                <Navbar />

                <main className="container mx-auto px-4 pt-32 pb-20 flex-1 max-w-4xl">
                    <div className={`rounded-3xl p-8 md:p-12 border backdrop-blur-xl shadow-xl ${isLight ? 'bg-white border-slate-300 shadow-sm' : 'bg-white/5 border-white/10'}`}>
                        <h1 className={`text-3xl md:text-5xl font-black mb-6 ${isLight ? 'text-slate-900' : 'text-white'}`}>About Digital Book of India</h1>
                        
                        <div className={`space-y-6 leading-relaxed ${isLight ? 'text-slate-600' : 'text-white/70'}`}>
                            <p className={`text-lg font-medium ${isLight ? 'text-slate-800' : 'text-white/90'}`}>
                                Welcome to Digital Book of India (DBI) – your trusted destination for discovering, verifying, and connecting with businesses across the country.
                            </p>
                            
                            <p>
                                At DBI, our mission is to build a transparent and reliable bridge between consumers and business owners. In an era where information is abundant but trust is scarce, we ensure that every business listed on our platform undergoes a rigorous verification process. From Aadhaar verification to establishment proofs, we take the extra step so you don’t have to.
                            </p>

                            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Our Vision</h2>
                            <p>
                                We envision a digital ecosystem where every search leads to a genuine connection. Whether you are a consumer looking for reliable services or a business owner aiming to establish a credible online presence, Digital Book of India is designed to empower you.
                            </p>

                            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Why Choose DBI?</h2>
                            <ul className="list-disc pl-5 space-y-2">
                                <li><strong>Verified Listings:</strong> Every business is thoroughly vetted through official documents.</li>
                                <li><strong>Community Driven:</strong> Authentic reviews and ratings from real users.</li>
                                <li><strong>Business Empowerment:</strong> Providing local businesses with the tools they need to shine digitally.</li>
                                <li><strong>Security First:</strong> Your data and privacy are our top priorities.</li>
                            </ul>

                            <p className="mt-8 pt-6 border-t border-border">
                                Join us in revolutionizing how India discovers local businesses. Experience the confidence of knowing exactly who you are doing business with.
                            </p>
                        </div>
                    </div>
                </main>

                <Footer />
            </div>
        </div>
    );
}
