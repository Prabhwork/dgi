"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ParticleNetwork from "@/components/ParticleNetwork";
import { useTheme } from "@/components/ThemeProvider";

export default function CareersPage() {
    const { theme } = useTheme();
    const isLight = theme === 'light';

    return (
        <div className={`min-h-screen relative overflow-hidden transition-colors ${isLight ? 'bg-slate-50' : 'bg-[#020631]'}`}>
            <div className="fixed inset-0 z-0"><ParticleNetwork /></div>

            <div className="relative z-10 flex flex-col min-h-screen">
                <Navbar />

                <main className="container mx-auto px-4 pt-32 pb-20 flex-1 max-w-4xl">
                    <div className={`rounded-3xl p-8 md:p-12 border backdrop-blur-xl shadow-xl ${isLight ? 'bg-white/90 border-slate-200' : 'bg-white/5 border-white/10'}`}>
                        <h1 className="text-3xl md:text-5xl font-black mb-6 text-foreground">Careers at DBI</h1>
                        
                        <div className="space-y-6 text-muted-foreground leading-relaxed">
                            <p className="text-lg font-medium text-foreground">
                                Join us in reshaping the digital face of businesses across India.
                            </p>
                            
                            <p>
                                At Digital Book of India, we are always looking for passionate individuals who want to build products that create impact. From software engineers and data scientists to support specialists and community managers, we believe that every team member plays a critical role in bringing our vision to life.
                            </p>

                            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Why Work With Us?</h2>
                            <ul className="list-disc pl-5 space-y-2 mb-8">
                                <li>✨ **Impact-Driven Work:** Build tools that help millions of users and small businesses connect.</li>
                                <li>🚀 **Fast-Paced Growth:** A dynamic environment where your ideas get implemented fast.</li>
                                <li>💡 **Innovation First:** We encourage creative problem solving and learning.</li>
                                <li>❤️ **Inclusive Culture:** A diverse team that supports and learns from each other.</li>
                            </ul>

                            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Current Openings</h2>
                            <div className="p-6 bg-primary/10 border border-primary/20 rounded-2xl">
                                <p className="text-foreground text-center font-medium">
                                    We currently have no open positions, but we're always eager to meet talented people!
                                </p>
                                <p className="text-center text-sm mt-3">
                                    Send your resume and a brief introduction to<br/>
                                    <a href="mailto:careers@digitalbookofindia.com" className="text-primary font-bold hover:underline">careers@digitalbookofindia.com</a>
                                </p>
                            </div>
                        </div>
                    </div>
                </main>

                <Footer />
            </div>
        </div>
    );
}
