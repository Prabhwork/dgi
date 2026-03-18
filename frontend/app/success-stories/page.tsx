"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ParticleNetwork from "@/components/ParticleNetwork";
import { useTheme } from "@/components/ThemeProvider";

export default function SuccessStoriesPage() {
    const { theme } = useTheme();
    const isLight = theme === 'light';

    return (
        <div className={`min-h-screen relative overflow-hidden transition-colors ${isLight ? 'bg-slate-50' : 'bg-[#020631]'}`}>
            <div className="fixed inset-0 z-0"><ParticleNetwork /></div>

            <div className="relative z-10 flex flex-col min-h-screen">
                <Navbar />

                <main className="container mx-auto px-4 pt-32 pb-20 flex-1 max-w-6xl">
                    <div className="text-center mb-16">
                        <h1 className="text-4xl md:text-6xl font-black mb-4 text-foreground">Success Stories</h1>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            Discover how businesses across India are leveraging Digital Book of India to build trust and grow their customer base.
                        </p>
                    </div>
                    
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Story 1 */}
                        <div className={`rounded-3xl p-6 md:p-8 border backdrop-blur-xl shadow-xl flex flex-col h-full ${isLight ? 'bg-white/90 border-slate-200' : 'bg-white/5 border-white/10'}`}>
                            <div className="text-primary text-4xl mb-4">"</div>
                            <p className="text-foreground text-lg italic flex-1 mb-6">
                                Since getting our Verified badge on DBI, our foot traffic has increased by 40%. Customers repeatedly tell us they chose our clinic because they saw our verified proof here.
                            </p>
                            <div className="flex items-center gap-4 border-t border-border pt-4">
                                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold">SM</div>
                                <div>
                                    <h4 className="font-bold text-foreground">Sharma Medicals</h4>
                                    <p className="text-xs text-muted-foreground">Healthcare & Pharmacy</p>
                                </div>
                            </div>
                        </div>

                        {/* Story 2 */}
                        <div className={`rounded-3xl p-6 md:p-8 border backdrop-blur-xl shadow-xl flex flex-col h-full ${isLight ? 'bg-white/90 border-slate-200' : 'bg-white/5 border-white/10'}`}>
                            <div className="text-primary text-4xl mb-4">"</div>
                            <p className="text-foreground text-lg italic flex-1 mb-6">
                                The Fraud Alerts community feature saved us from a coordinated bulk-buying scam. Being part of this network isn't just about marketing; it's about business security.
                            </p>
                            <div className="flex items-center gap-4 border-t border-border pt-4">
                                <div className="w-12 h-12 bg-teal-500/20 rounded-full flex items-center justify-center text-teal-500 font-bold">TE</div>
                                <div>
                                    <h4 className="font-bold text-foreground">Techtronics Electronics</h4>
                                    <p className="text-xs text-muted-foreground">Retail Electronics</p>
                                </div>
                            </div>
                        </div>

                        {/* Story 3 */}
                        <div className={`rounded-3xl p-6 md:p-8 border backdrop-blur-xl shadow-xl flex flex-col h-full ${isLight ? 'bg-white/90 border-slate-200' : 'bg-white/5 border-white/10'}`}>
                            <div className="text-primary text-4xl mb-4">"</div>
                            <p className="text-foreground text-lg italic flex-1 mb-6">
                                We struggled with online visibility until we claimed our listing. Now, when people in Delhi search for architectural services, they find our accurate details immediately.
                            </p>
                            <div className="flex items-center gap-4 border-t border-border pt-4">
                                <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center text-purple-500 font-bold">DB</div>
                                <div>
                                    <h4 className="font-bold text-foreground">DB Designs & Architecture</h4>
                                    <p className="text-xs text-muted-foreground">Professional Services</p>
                                </div>
                            </div>
                        </div>

                    </div>
                    
                    <div className="mt-16 text-center">
                        <div className="inline-block p-8 bg-primary/10 border border-primary/20 rounded-3xl">
                            <h3 className="text-2xl font-bold text-foreground mb-3">Ready to write your own story?</h3>
                            <p className="text-muted-foreground mb-6">Join thousands of verified businesses to build trust and scale.</p>
                            <a href="/auth" className="inline-block px-8 py-3 bg-primary text-white rounded-xl font-bold hover:shadow-lg hover:shadow-primary/30 transition-all">
                                Add Your Business
                            </a>
                        </div>
                    </div>

                </main>

                <Footer />
            </div>
        </div>
    );
}
