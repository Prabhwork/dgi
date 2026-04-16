import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ComprehensiveInformationSection from "@/components/ComprehensiveInformationSection";
import CursorGlow from "@/components/CursorGlow";


export const metadata = {
    title: "Comprehensive Service Information | Digital Book of India",
    description: "Experience unwavering trust with accurate and reliable service information curated by experts.",
};

export default function ComprehensiveInformationPage() {
    return (
        <div className="min-h-screen pt-20">
         
            <CursorGlow />
            <Navbar />
            
            <main className="relative z-10">
                <ComprehensiveInformationSection />
            </main>

            <Footer />
        </div>
    );
}
