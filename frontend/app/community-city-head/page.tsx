import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LeadershipProposal from "@/components/LeadershipProposal";
import CursorGlow from "@/components/CursorGlow";
import ParticleNetworkWrapper from "@/components/ParticleNetworkWrapper";
import { Users, Target, Globe, Zap, TrendingUp, ShieldCheck, Star, Handshake } from "lucide-react";

export const metadata = {
    title: "Community City Head Program | Digital Book of India",
    description: "Lead your entire city. Become a City Head to influence metropolitan-scale commercial policies and growth.",
};

const details = {
    level: "City" as const,
    title: "Community City Head",
    description: "The architect of metropolitan growth. City Heads govern the entire city's category landscape, representing thousands of businesses and multiple industrial zones.",
    visionPoints: [
        { title: "Metropolitan Policy", desc: "Influence the commercial pulse of the city by setting high-level industry standards.", icon: "Users" },
        { title: "Industrial Lobbying", desc: "Represent the city's businesses in large-scale commercial negotiations.", icon: "Globe" }
    ],
    mentorshipPoints: [
        { title: "Leadership Hub", desc: "Mentor Zone Heads to build the city's premier commercial leadership guild.", icon: "Star" },
        { title: "City-Wide Ventures", desc: "Initiate massive projects that spanning across the entire metropolitan area.", icon: "Handshake" }
    ],
    commercialBenefits: [
        { title: "City Logistics Network", desc: "Exclusive access to city-wide delivery fleets and smart storage hubs.", icon: "Zap" },
        { title: "High-Traffic Exposure", desc: "Priority placement on city-wide DBI billboards and digital campaigns.", icon: "TrendingUp" },
        { title: "City Council Access", desc: "Direct representation in metropolitan business development councils.", icon: "ShieldCheck" }
    ],
    roles: [
        { title: "City Governor", desc: "Oversee the city's commercial and digital transformation.", icon: "Target" },
        { title: "Lobby Powerhouse", desc: "Mobilize the city's collective bargaining power.", icon: "Users" },
        { title: "Quality Anchor", desc: "Ensure the city becomes a benchmark for category excellence.", icon: "ShieldCheck" }
    ],
    tableData: [
        { feature: "Scope", member: "Zone", head: "Whole Metropolis" },
        { feature: "Team", member: "Zone Heads", head: "City-Wide Guild" },
        { feature: "Authority", member: "Regional Leader", head: "City Governor" },
        { feature: "Lead Gen", member: "Zonal Priority", head: "Metric-Based Routing" },
        { feature: "Status", member: "Strategist", head: "City Architect" }
    ]
};

export default function CityHeadPage() {
    return (
        <div className="min-h-screen pt-20">
            <ParticleNetworkWrapper className="z-0 opacity-80" />
            <CursorGlow />
            <Navbar />
            <main className="relative z-10">
                <LeadershipProposal {...details} />
            </main>
            <Footer />
        </div>
    );
}
