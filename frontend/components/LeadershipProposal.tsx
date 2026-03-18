"use client";

import { motion } from "framer-motion";
import { 
    MapPin, Users, Zap, ShieldCheck, Star, Target, 
    TrendingUp, Handshake, ChevronRight, CheckCircle2, 
    Globe, Flag, Heart, LucideIcon 
} from "lucide-react";
import { useTheme } from "./ThemeProvider";
import Link from "next/link";

const ICON_MAP: Record<string, LucideIcon> = {
    Globe, Target, Users, Zap, TrendingUp, ShieldCheck, 
    Star, Handshake, MapPin, CheckCircle2, Flag, Heart
};

interface LeadershipProposalProps {
    level: "Area" | "Zone" | "City" | "State" | "India";
    title: string;
    description: string;
    visionPoints: { title: string; desc: string; icon: string }[];
    mentorshipPoints: { title: string; desc: string; icon: string }[];
    commercialBenefits: { title: string; desc: string; icon: string }[];
    roles: { title: string; desc: string; icon: string }[];
    tableData: { feature: string; member: string; head: string }[];
}

export default function LeadershipProposal({
    level,
    title,
    description,
    visionPoints,
    mentorshipPoints,
    commercialBenefits,
    roles,
    tableData
}: LeadershipProposalProps) {
    const { theme } = useTheme();
    const isLight = theme === "light";

    const DynamicIcon = ({ name, ...props }: { name: string, [key: string]: any }) => {
        const Icon = ICON_MAP[name] || Target;
        return <Icon {...props} />;
    };

    const getLevelIconName = () => {
        switch (level) {
            case "Area": return "MapPin";
            case "Zone": return "Globe";
            case "City": return "Users";
            case "State": return "Flag";
            case "India": return "Heart";
            default: return "Target";
        }
    };

    const MainIcon = ICON_MAP[getLevelIconName()] || Target;

    return (
        <section className={`py-24 relative overflow-hidden ${isLight ? 'bg-slate-50/50' : 'bg-transparent'}`}>
            <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-4xl mx-auto text-center mb-20">
                    <motion.span 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest mb-6"
                    >
                        {level} Leadership Program
                    </motion.span>
                    <motion.h2 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-6xl font-display font-black mb-6 leading-tight flex items-center justify-center gap-4 flex-wrap"
                    >
                        Become a <span className="gradient-text">{title}</span>
                        <MainIcon size={40} className="text-primary animate-pulse" />
                    </motion.h2>
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-muted-foreground text-lg leading-relaxed max-w-2xl mx-auto"
                    >
                        {description}
                    </motion.p>
                </div>

                {/* Strategy Sections */}
                <div className="grid lg:grid-cols-2 gap-8 mb-24">
                    <motion.div 
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        className={`p-10 rounded-[3rem] border border-solid ${isLight ? 'bg-white border-blue-100 shadow-xl' : 'bg-white/5 border-white/10 shadow-2xl'}`}
                    >
                        <h3 className="text-2xl font-bold mb-8 flex items-center gap-3 italic text-primary">
                            1. The Vision: Leading the Lobby
                        </h3>
                        <div className="space-y-8">
                            {visionPoints.map((point) => (
                                <div key={point.title} className="flex gap-5">
                                    <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center shrink-0 text-primary">
                                        <DynamicIcon name={point.icon} size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold mb-2">{point.title}</h4>
                                        <p className="text-sm text-muted-foreground leading-relaxed">{point.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        className={`p-10 rounded-[3rem] border border-solid ${isLight ? 'bg-blue-600 text-white border-transparent shadow-xl' : 'bg-primary/10 border-primary/20 shadow-2xl'}`}
                    >
                        <h3 className="text-2xl font-bold mb-8 flex items-center gap-3 italic text-white">
                            2. Power of "Tiered Mentorship"
                        </h3>
                        <div className="space-y-8">
                            {mentorshipPoints.map((point) => (
                                <div key={point.title} className="flex gap-5">
                                    <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0 text-white">
                                        <DynamicIcon name={point.icon} size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold mb-2 text-white">{point.title}</h4>
                                        <p className={`text-sm leading-relaxed ${isLight ? 'text-blue-50' : 'text-muted-foreground'}`}>{point.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* Benefits */}
                <div className="mb-24">
                    <div className="text-center mb-16">
                        <h3 className="text-3xl font-display font-black uppercase tracking-wider">3. Scale-specific Commercial Benefits</h3>
                        <div className="h-1.5 w-24 bg-primary mx-auto mt-4 rounded-full" />
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-8">
                        {commercialBenefits.map((benefit, i) => (
                            <motion.div
                                key={benefit.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className={`p-8 rounded-[2rem] border border-solid hover:-translate-y-2 transition-all duration-500 ${isLight ? 'bg-white border-slate-100 shadow-lg' : 'bg-white/[0.03] border-white/10'}`}
                            >
                                <div className="w-16 h-16 rounded-3xl mx-auto mb-6 flex items-center justify-center bg-primary/10 text-primary">
                                    <DynamicIcon name={benefit.icon} size={30} />
                                </div>
                                <h4 className="font-bold text-lg mb-3">{benefit.title}</h4>
                                <p className="text-sm text-muted-foreground leading-relaxed">{benefit.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Table Comparison */}
                <div className="grid lg:grid-cols-2 gap-16 items-center mb-24">
                    <div>
                        <h3 className="text-3xl font-display font-black mb-8 italic">4. Strategic Responsibilities</h3>
                        <div className="space-y-4">
                            {roles.map((role) => (
                                <div key={role.title} className={`p-5 rounded-2xl flex items-center gap-5 border border-solid ${isLight ? 'bg-white border-slate-100' : 'bg-white/[0.02] border-white/10'}`}>
                                    <DynamicIcon name={role.icon} className="text-primary" size={24} />
                                    <div>
                                        <h4 className="font-bold text-sm">{role.title}</h4>
                                        <p className="text-xs text-muted-foreground">{role.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-[2rem] border border-solid border-white/10 shadow-2xl backdrop-blur-3xl">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className={`${isLight ? 'bg-slate-100' : 'bg-white/5'} border-b border-white/10`}>
                                    <th className="p-5 text-sm font-bold uppercase tracking-wider">Tier Advantage</th>
                                    <th className="p-5 text-sm font-bold uppercase tracking-wider text-muted-foreground">Standard Head</th>
                                    <th className="p-5 text-sm font-bold uppercase tracking-wider text-primary">{level} Leader</th>
                                </tr>
                            </thead>
                            <tbody className={`${isLight ? 'bg-white' : 'bg-white/[0.02]'}`}>
                                {tableData.map((row, i) => (
                                    <tr key={row.feature} className="border-b border-white/5 last:border-0 hover:bg-white/[0.03] transition-colors">
                                        <td className="p-5 text-sm font-medium">{row.feature}</td>
                                        <td className="p-5 text-xs text-muted-foreground">{row.member}</td>
                                        <td className="p-5 text-xs font-bold text-primary flex items-center gap-2">
                                            <CheckCircle2 size={14} /> {row.head}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Final CTA */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    className={`p-12 rounded-[4rem] text-center border border-solid relative overflow-hidden ${isLight ? 'bg-white border-blue-200 shadow-2xl' : 'bg-gradient-to-br from-primary/20 via-primary/5 to-transparent border-primary/20 shadow-3xl'}`}
                >
                    <div className="relative z-10">
                        <h3 className="text-3xl md:text-5xl font-display font-black mb-8 italic">Evolving the National Ecosystem</h3>
                        <p className="text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
                            {level} Leadership is a strategic appointment for high-qualified industry veterans. 
                            You represent the top 1% of the DBI Guild, driving regional growth and industrial standards.
                        </p>
                        
                        <div className="flex flex-wrap justify-center gap-4">
                            <Link href="/contact">
                                <button className="px-10 py-4 bg-primary text-white rounded-full font-bold hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 flex items-center gap-2 text-sm sm:text-base cursor-pointer">
                                    Become a {title} <ChevronRight size={18} />
                                </button>
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
