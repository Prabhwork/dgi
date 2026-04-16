import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AreaHeadProposal from "@/components/AreaHeadProposal";
import CursorGlow from "@/components/CursorGlow";


export const metadata = {
    title: "Community Area Head Program | Digital Book of India",
    description: "Join the DBI Leadership Layer. Become an Area Head for your specific category and region, building a powerful business lobby.",
};

export default function CommunityAreaHeadPage() {
    return (
        <div className="min-h-screen pt-20">
          
            <CursorGlow />
            <Navbar />
            
            <main className="relative z-10">
                <AreaHeadProposal />
            </main>

            <Footer />
        </div>
    );
}
