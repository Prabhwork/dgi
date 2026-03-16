import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import GlobeHeroSection from "@/components/GlobeHeroSection";
import PreLaunchOffer from "@/components/PreLaunchOffer";
import CursorGlow from "@/components/CursorGlow";

export default function PreLaunchPage() {
    return (
        <div className="min-h-screen bg-background relative overflow-hidden">
            <CursorGlow />
            <Navbar />

            <main>
                <GlobeHeroSection />
                <PreLaunchOffer />
            </main>

            <Footer />
        </div>
    );
}
