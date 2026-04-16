import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LeadershipProposal from "@/components/LeadershipProposal";
import CursorGlow from "@/components/CursorGlow";

import { Globe, Target, Users, Zap, TrendingUp, ShieldCheck, Star, Handshake } from "lucide-react";

export const metadata = {
    title: "Community Zone Head Program | Digital Book of India",
    description: "Manage a cluster of areas. Become a Zone Head to oversee regional growth and category standardization.",
};

const details = {
    level: "Zone" as const,
    title: "Community Zone Head",
    description: "Orchestrate growth across multiple districts. As a Zone Head, you manage the regional cluster of Area Heads, ensuring seamless supply chains and standardized industry quality.",
    visionPoints: [
        { title: "Regional Oversight", desc: "Coordinate between multiple Area Heads to ensure consistent quality and branding.", icon: "Globe" },
        { title: "Standardized Hubs", desc: "Build a regional excellence hub for your category across the entire zone.", icon: "Target" }
    ],
    mentorshipPoints: [
        { title: "Strategic Coaching", desc: "Guide Area Heads in scaling their local lobbies using DBI data tools.", icon: "Star" },
        { title: "Cluster Synergy", desc: "Enable collaboration between distant districts for massive regional projects.", icon: "Handshake" }
    ],
    commercialBenefits: [
        { title: "Regional Warehouse Access", desc: "Manage and utilize shared regional logistics for faster delivery.", icon: "Zap" },
        { title: "Massive Zone-Wise Marketing", desc: "Dominate the region with hyper-local digital ads across the zone.", icon: "TrendingUp" },
        { title: "Exclusive Zone Perks", desc: "Priority access to regional trade fairs and industrial expos.", icon: "ShieldCheck" }
    ],
    roles: [
        { title: "Regional Architect", desc: "Design the zone's long-term commercial strategy.", icon: "Target" },
        { title: "Network Hub", desc: "Connect local heads to state-level resources.", icon: "Globe" },
        { title: "Compliance Lead", desc: "Maintain high quality standards across the zone.", icon: "ShieldCheck" }
    ],
    tableData: [
        { feature: "Scope", member: "District", head: "Regional Cluster" },
        { feature: "Team", member: "Business Members", head: "Area Heads Group" },
        { feature: "Authority", member: "Local Leader", head: "Regional Governor" },
        { feature: "Access", member: "Standard Tools", head: "Regional Dashboard" },
        { feature: "Status", member: "Manager", head: "Strategist" }
    ]
};

export default function ZoneHeadPage() {
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
