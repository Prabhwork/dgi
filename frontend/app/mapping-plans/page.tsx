import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MappingPlans from "@/components/MappingPlans";

import CursorGlow from "@/components/CursorGlow";


export default function MappingPlansPage() {
    return (
        <div className="min-h-screen bg-background relative overflow-hidden">
           
            <CursorGlow />
            <Navbar />

            <main className="pt-24">
                <MappingPlans />

            </main>

            <Footer />
        </div>
    );
}
