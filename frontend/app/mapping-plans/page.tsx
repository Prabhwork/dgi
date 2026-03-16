import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MappingPlans from "@/components/MappingPlans";
import PreLaunchOffer from "@/components/PreLaunchOffer";
import CursorGlow from "@/components/CursorGlow";
import ParticleNetworkWrapper from "@/components/ParticleNetworkWrapper";

export default function MappingPlansPage() {
    return (
        <div className="min-h-screen bg-background relative overflow-hidden">
            <ParticleNetworkWrapper className="z-0 opacity-40" />
            <CursorGlow />
            <Navbar />

            <main className="pt-24">
                <MappingPlans />
                <PreLaunchOffer />
            </main>

            <Footer />
        </div>
    );
}
