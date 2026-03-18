"use client";

import LeadershipProposal from "./LeadershipProposal";

const details = {
    level: "Area" as const,
    title: "Community Area Head",
    description: "Evolve from a member to a Market Architect. Build a powerful business lobby and dominate your local industry region with the DBI Guild.",
    visionPoints: [
        { title: "Primary Authority", desc: "Become the main point of authority for your specific category in your district.", icon: "Target" },
        { title: "Lead the Lobby", desc: "Ensure collective growth and standardize quality across your local industry.", icon: "Users" }
    ],
    mentorshipPoints: [
        { title: "Access to Veterans", desc: "Junior members get mentorship from higher qualified community leaders.", icon: "Star" },
        { title: "Project Collaboration", desc: "Scale massive projects with the tools and guidance of an Area Head.", icon: "Handshake" }
    ],
    commercialBenefits: [
        { title: "Direct Factory Pricing", desc: "Negotiate with manufacturers for 'Power Buy' rates that beat the market.", icon: "Zap" },
        { title: "Massive Marketing Reach", desc: "Amplify your lobby's visibility through combined DBI marketing efforts.", icon: "TrendingUp" },
        { title: "Operational Ease", desc: "Shared logistics and storage tools to make business cheaper and faster.", icon: "ShieldCheck" }
    ],
    roles: [
        { title: "Market Guardian", desc: "First line of defense against industry fraud.", icon: "ShieldCheck" },
        { title: "Growth Mentor", desc: "Scale newer members using DBI digital tools.", icon: "TrendingUp" },
        { title: "Lobby Rep", desc: "Represent interests in collective bargaining.", icon: "Users" }
    ],
    tableData: [
        { feature: "Pricing", member: "Wholesale", head: "Direct Factory" },
        { feature: "Authority", member: "Verified Badge", head: "Gold Leader Badge" },
        { feature: "Network", member: "General Access", head: "High-Level Access" },
        { feature: "Leads", member: "Standard", head: "Priority Referrals" },
        { feature: "Status", member: "Participant", head: "Decision Maker" }
    ]
};

export default function AreaHeadProposal() {
    return <LeadershipProposal {...details} />;
}
