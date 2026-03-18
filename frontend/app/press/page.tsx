"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ParticleNetwork from "@/components/ParticleNetwork";
import { useTheme } from "@/components/ThemeProvider";

export default function PressPage() {
    const { theme } = useTheme();
    const isLight = theme === 'light';

    return (
        <div className={`min-h-screen relative overflow-hidden transition-colors ${isLight ? 'bg-slate-50' : 'bg-[#020631]'}`}>
            <div className="fixed inset-0 z-0"><ParticleNetwork /></div>

            <div className="relative z-10 flex flex-col min-h-screen">
                <Navbar />

                <main className="container mx-auto px-4 pt-32 pb-20 flex-1 max-w-4xl">
                    <div className={`rounded-3xl p-8 md:p-12 border backdrop-blur-xl shadow-xl ${isLight ? 'bg-white/90 border-slate-200' : 'bg-white/5 border-white/10'}`}>
                        <h1 className="text-3xl md:text-5xl font-black mb-6 text-foreground">Press & News</h1>
                        
                        <div className="space-y-6 text-muted-foreground leading-relaxed">
                            <p className="text-lg font-medium text-foreground">
                                Stay up to date with the latest from Digital Book of India.
                            </p>
                            
                            <p>
                                Welcome to our press room. Here you will find the latest announcements, feature rollouts, and stories about how DBI is helping businesses across the country.
                            </p>

                            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Latest Announcements</h2>
                            <div className="space-y-4">
                                <article className="p-6 bg-slate-100/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl">
                                    <p className="text-xs text-primary font-bold mb-2">MARCH 2026</p>
                                    <h3 className="text-lg font-bold text-foreground mb-2">DBI Launches New Accuracy Shield</h3>
                                    <p className="text-sm">We are thrilled to announce the rollout of our new Accuracy Shield—a multi-layered verification process designed to make digital business listings safer and more reliable than ever.</p>
                                </article>

                                <article className="p-6 bg-slate-100/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl">
                                    <p className="text-xs text-primary font-bold mb-2">FEBRUARY 2026</p>
                                    <h3 className="text-lg font-bold text-foreground mb-2">Reaching 10,000 Verified Businesses</h3>
                                    <p className="text-sm">A major milestone! Digital Book of India has officially verified over 10,000 local businesses, creating a safer digital marketplace for consumers.</p>
                                </article>
                            </div>

                            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Media Inquiries</h2>
                            <p>
                                If you are a member of the press and need to get in touch with our media relations team, please contact us at: <br/>
                                <a href="mailto:press@digitalbookofindia.com" className="text-primary font-bold hover:underline">press@digitalbookofindia.com</a>
                            </p>

                        </div>
                    </div>
                </main>

                <Footer />
            </div>
        </div>
    );
}
