import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BusinessListingSection from "@/components/BusinessListingSection";
import CursorGlow from "@/components/CursorGlow";
import ParticleNetworkWrapper from "@/components/ParticleNetworkWrapper";

export const metadata = {
    title: "Easy Business Listing | Digital Book of India",
    description: "Effortlessly list your business on India's #1 digital directory and boost your online visibility.",
};

export default function ListingBenefitsPage() {
    return (
        <div className="min-h-screen pt-20">
            <ParticleNetworkWrapper className="z-0 opacity-80" />
            <CursorGlow />
            <Navbar />
            
            <main className="relative z-10">
                <BusinessListingSection />
            </main>

            <Footer />
        </div>
    );
}
