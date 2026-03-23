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
        <div className="min-h-screen">
            {/* Single full-site 3D particle background */}
            <ParticleNetworkWrapper className="z-0 opacity-80" />
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
            <FAQSection />
            <CommunityLeader />
            <Testimonial />
            <Footer />
        </div>
    );
}
