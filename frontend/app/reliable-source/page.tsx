import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ReliableSourceSection from "@/components/ReliableSourceSection";
import CursorGlow from "@/components/CursorGlow";


export const metadata = {
    title: "Reliable Service Source | Digital Book of India",
    description: "Unlock a world of information with our one-stop resource for detailed and accurate products and services.",
};

export default function ReliableSourcePage() {
    return (
        <div className="min-h-screen pt-20">
       
            <CursorGlow />
            <Navbar />
            
            <main className="relative z-10">
                <ReliableSourceSection />
            </main>

            <Footer />
        </div>
    );
}
