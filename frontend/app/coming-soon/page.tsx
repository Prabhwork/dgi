import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ComingSoonSection from "@/components/ComingSoonSection";
import CursorGlow from "@/components/CursorGlow";
import ParticleNetworkWrapper from "@/components/ParticleNetworkWrapper";

export default function ComingSoonPage() {
    return (
        <div className="min-h-screen bg-background relative overflow-hidden">
            <ParticleNetworkWrapper className="z-0 opacity-40" />
            <CursorGlow />
            <Navbar />

            <main className="pt-20">
                <ComingSoonSection />
            </main>

            <Footer />
        </div>
    );
}
