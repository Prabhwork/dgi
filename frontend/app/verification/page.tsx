"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ParticleNetwork from "@/components/ParticleNetwork";
import { useTheme } from "@/components/ThemeProvider";

export default function VerificationPage() {
    const { theme } = useTheme();
    const isLight = theme === 'light';

    return (
        <div className={`min-h-screen relative overflow-hidden transition-colors ${isLight ? 'bg-slate-50' : 'bg-[#020631]'}`}>
            <div className="fixed inset-0 z-0"><ParticleNetwork /></div>

            <div className="relative z-10 flex flex-col min-h-screen">
                <Navbar />

                <main className="container mx-auto px-4 pt-32 pb-20 flex-1 max-w-4xl">
                    <div className={`rounded-3xl p-8 md:p-12 border backdrop-blur-xl shadow-xl ${isLight ? 'bg-white/90 border-slate-200' : 'bg-white/5 border-white/10'}`}>
                        <h1 className="text-3xl md:text-5xl font-black mb-6 text-foreground">How Verification Works</h1>
                        
                        <div className="space-y-6 text-muted-foreground leading-relaxed">
                            <p className="text-lg font-medium text-foreground">
                                Trust is the foundation of digital business. At Digital Book of India, our verification process is designed to ensure that every business profile is attached to a real, legally operating entity.
                            </p>
                            
                            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Step 1: Identity Verification</h2>
                            <p>
                                Upon registering, every business owner is required to verify their personal identity. We utilize industry-standard checks including Aadhaar verification and Owner Identity Proof (e.g., PAN Card) submissions to ensure that a real person stands behind the profile.
                            </p>

                            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Step 2: Business Authenticity</h2>
                            <p>
                                After identity is confirmed, the business entity itself must be authenticated. Users upload an Establishment Proof, such as a Shop License, GST Certificate, or any other government-recognized document.
                            </p>

                            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Step 3: Manual Review Phase</h2>
                            <p>
                                Our dedicated trust and safety team manually reviews every document submitted. We cross-reference the details provided on the profile (address, brand name, category) against the physical documents. This robust check prevents bad actors and ensures that consumers only see legitimate businesses.
                            </p>

                            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Step 4: The Verification Badge</h2>
                            <p>
                                Once a business passes these checks, they receive a 'Verified' badge on their public profile. This badge signals to consumers that the business has successfully met DBI's stringent trust criteria and can be engaged with confidence.
                            </p>
                            
                            <div className="mt-8 p-6 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-start gap-4">
                                <span className="text-3xl text-emerald-500">🛡️</span>
                                <div>
                                    <h3 className="text-emerald-700 font-bold mb-1">Continual Monitoring</h3>
                                    <p className="text-sm text-emerald-600/80">
                                        Verification is not a one-time process. If a business changes critical information such as their registered address or category, their profile is temporarily flagged for re-verification to maintain standard data integrity.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>

                <Footer />
            </div>
        </div>
    );
}
