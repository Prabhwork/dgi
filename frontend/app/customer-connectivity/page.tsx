import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CustomerConnectivitySection from "@/components/CustomerConnectivitySection";
import CursorGlow from "@/components/CursorGlow";


export const metadata = {
    title: "Customer Connectivity | Digital Book of India",
    description: "Connect customers directly to their final destination with ease, enhancing their experience and increasing your business's visibility.",
};

export default function CustomerConnectivityPage() {
    return (
        <div className="min-h-screen pt-20">
   
            <CursorGlow />
            <Navbar />
            
            <main className="relative z-10">
                <CustomerConnectivitySection />
            </main>

            <Footer />
        </div>
    );
}
