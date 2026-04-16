import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LeadershipProposal from "@/components/LeadershipProposal";
import CursorGlow from "@/components/CursorGlow";

import { Heart, Target, Users, Zap, TrendingUp, ShieldCheck, Star, Handshake, Globe } from "lucide-react";

export const metadata = {
    title: "Community India Head Program | Digital Book of India",
    description: "The ultimate leadership tier. Become a National Visionary to define the future of India's digital commerce.",
};

const details = {
    level: "India" as const,
    title: "National Visionary Head",
    description: "The architect of India's digital future. National Visionaries define the country's category landscape, orchestrating inter-state commercial harmony and defining the global hallmark of Indian craftsmanship.",
    visionPoints: [
        { title: "National Digital Strategy", desc: "Formulate the nationwide roadmap for your category's digital dominance.", icon: "Star" },
        { title: "Global Export Lobby", desc: "Represent Indian businesses in international trade and global commercial arenas.", icon: "Globe" }
    ],
    mentorshipPoints: [
        { title: "Guild Supreme Mentor", desc: "Mentor State Heads to build a national-scale elite industrial leadership guild.", icon: "Heart" },
        { title: "National Impact Projects", desc: "Spearhead infrastructure-grade initiatives that redefine India's economic landscape.", icon: "Handshake" }
    ],
    commercialBenefits: [
        { title: "National Logistics Grid", desc: "Highest-level access to DBI's nationwide supply chain and global hubs.", icon: "Zap" },
        { title: "Prime National Exposure", desc: "Top-tier visibility in DBI's national campaigns, TV spots, and global events.", icon: "TrendingUp" },
        { title: "Policy Leadership", desc: "Chief advisor to DBI's national industrial council board.", icon: "ShieldCheck" }
    ],
    roles: [
        { title: "National Guardian", desc: "The final authority on India's industrial category legacy and digital future.", icon: "Heart" },
        { title: "Economic Catalyst", desc: "Harness India's collective industrial power for global dominance.", icon: "Zap" },
        { title: "Quality Commissioner", desc: "Define the absolute national benchmark for category excellence.", icon: "ShieldCheck" }
    ],
    tableData: [
        { feature: "Scope", member: "State", head: "Whole Nation" },
        { feature: "Team", member: "State Heads", head: "National Council" },
        { feature: "Authority", member: "State Patriarch", head: "National Visionary" },
        { feature: "Impact", member: "Regional Scaling", head: "Nation-Wide Transformation" },
        { feature: "Status", member: "State Visionary", head: "Industrial Sovereign" }
    ]
};

export default function IndiaHeadPage() {
    return (
        <div className="min-h-screen pt-20">
          
            <CursorGlow />
            <Navbar />
            <main className="relative z-10">
                <LeadershipProposal {...details} />
            </main>
            <Footer />
        </div>
    );
}
