import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import PlatformIntro from "@/components/PlatformIntro";
import BrowseByNeed from "@/components/BrowseByNeed";
import ExistingCustomers from "@/components/ExistingCustomers";
import MissionDigitalBharat from "@/components/MissionDigitalBharat";
import DiscoverSellers from "@/components/DiscoverSellers";
import UpcomingFeatures from "@/components/UpcomingFeatures";
import FAQSection from "@/components/FAQSection";
import CommunityLeader from "@/components/CommunityLeader";
import Testimonial from "@/components/Testimonial";
import Footer from "@/components/Footer";
import ScrollProgress from "@/components/ScrollProgress";
import CursorGlow from "@/components/CursorGlow";
import ParticleNetworkWrapper from "@/components/ParticleNetworkWrapper";

export default function Home() {
    return (
        <div className="min-h-screen bg-background text-foreground transition-colors duration-500">
            {/* Restrict 3D particle background to the Hero section */}
            <div className="absolute inset-x-0 top-0 h-[85vh] md:h-[100vh] overflow-hidden pointer-events-none z-0">
                <ParticleNetworkWrapper isFixed={false} className="opacity-80" />
            </div>
            <CursorGlow />
            <ScrollProgress />
            <Navbar />
            <HeroSection />
            <PlatformIntro />
            {/* <ExistingCustomers /> */}
            <BrowseByNeed />

            <DiscoverSellers />
            <MissionDigitalBharat />
            <UpcomingFeatures />
           
            <CommunityLeader />
            <FAQSection />
            <Testimonial />
            <Footer />
        </div>
    );
}
