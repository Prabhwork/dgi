import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LeadershipProposal from "@/components/LeadershipProposal";
import CursorGlow from "@/components/CursorGlow";

import { Flag, Target, Users, Zap, TrendingUp, ShieldCheck, Star, Handshake, Globe } from "lucide-react";

export const metadata = {
    title: "Community State Head Program | Digital Book of India",
    description: "Represent your entire state. Become a State Head to lead statewide industrial policy and digital expansion.",
};

const details = {
    level: "State" as const,
    title: "Community State Head",
    description: "Command the statewide industrial landscape. State Heads are the ultimate jurisdictional authorities, governing the harmony between cities and orchestrating state-level digital dominance.",
    visionPoints: [
        { title: "Statewide Harmony", desc: "Ensure balanced commercial growth across all major cities and rural zones.", icon: "Flag" },
        { title: "Industrial Standard", desc: "Define the state's hallmark of quality for your specific business category.", icon: "Star" }
    ],
    mentorshipPoints: [
        { title: "Executive Coaching", desc: "Coach City Heads reach executive excellence and statewide scaling.", icon: "Target" },
        { title: "State-Level Ventures", desc: "Drive massive infrastructure-grade projects that redefine the state's economy.", icon: "Handshake" }
    ],
    commercialBenefits: [
        { title: "State Logistics Grid", desc: "Master access to inter-city transport and state-level warehousing.", icon: "Globe" },
        { title: "High-Impact Branding", desc: "Massive exposure through state-wide television and news integrations.", icon: "TrendingUp" },
        { title: "Policy Influence", desc: "Direct channel to state-level business boards and commerce departments.", icon: "ShieldCheck" }
    ],
    roles: [
        { title: "State Patriarch", desc: "Guardian of the state's category legacy and digital future.", icon: "Flag" },
        { title: "Economic Driver", desc: "Direct the state's collective commercial energy.", icon: "Zap" },
        { title: "Standards Commissioner", desc: "Final authority on statewide category quality.", icon: "ShieldCheck" }
    ],
    tableData: [
        { feature: "Scope", member: "City", head: "Entire State" },
        { feature: "Team", member: "City Heads", head: "State Leadership Board" },
        { feature: "Authority", member: "City Governor", head: "State Patriarch" },
        { feature: "Access", member: "Metadata Hub", head: "State Command Center" },
        { feature: "Status", member: "City Architect", head: "State Visionary" }
    ]
};

export default function StateHeadPage() {
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
