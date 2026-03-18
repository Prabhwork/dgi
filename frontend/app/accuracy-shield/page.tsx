"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ParticleNetwork from "@/components/ParticleNetwork";
import { useTheme } from "@/components/ThemeProvider";

export default function AccuracyShieldPage() {
    const { theme } = useTheme();
    const isLight = theme === 'light';

    return (
        <div className={`min-h-screen relative overflow-hidden transition-colors ${isLight ? 'bg-slate-50' : 'bg-[#020631]'}`}>
            <div className="fixed inset-0 z-0"><ParticleNetwork /></div>

            <div className="relative z-10 flex flex-col min-h-screen">
                <Navbar />

                <main className="container mx-auto px-4 pt-32 pb-20 flex-1 max-w-4xl">
                    <div className={`rounded-3xl p-8 md:p-12 border backdrop-blur-xl shadow-xl ${isLight ? 'bg-white/90 border-slate-200' : 'bg-white/5 border-white/10'}`}>
                        <h1 className="text-3xl md:text-5xl font-black mb-6 text-foreground">The Accuracy Shield</h1>
                        
                        <div className="space-y-6 text-muted-foreground leading-relaxed">
                            <p className="text-lg font-medium text-foreground">
                                What is the DBI Accuracy Shield? It is our commitment to maintaining the highest standard of data integrity on the internet.
                            </p>
                            
                            <p>
                                We believe that consumers deserve to find exactly what they are looking for without being misled by outdated addresses, incorrect phone numbers, or fake reviews. The Accuracy Shield is a multi-layered system designed to protect our users.
                            </p>

                            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">How We Protect Data</h2>
                            <ul className="list-disc pl-5 space-y-2 mb-8">
                                <li><strong>Community Reporting:</strong> Users can flag data errors directly from a business profile. These reports are prioritized and investigated by our team.</li>
                                <li><strong>Automated Checks:</strong> We employ algorithms to detect anomalies, such as sudden spikes in reviews or drastic changes in business details.</li>
                                <li><strong>Mandatory Updates:</strong> Businesses are prompted periodically to confirm that their operating hours, contact details, and locations remain accurate.</li>
                            </ul>

                            <div className="p-6 bg-blue-500/10 border border-blue-500/30 rounded-2xl">
                                <h3 className="text-blue-700 font-bold mb-2">Notice a mistake?</h3>
                                <p className="text-sm text-blue-600/80 mb-4">
                                    Help us keep the shield strong. If you see a business listing with incorrect information, please report it immediately so our team can rectify the error.
                                </p>
                                <a href="/report-error" className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors">
                                    Report a Data Error
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
