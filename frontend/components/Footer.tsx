"use client";
import { useState, useEffect } from "react";
import { Twitter, Facebook, Youtube, Instagram, Linkedin, ChevronRight } from "lucide-react";
import Link from "next/link";

const staticColumns = [
    {
        title: "Search & browse",
        links: [],
    },
    {
        title: "For Business Owners",
        links: ["Claim Your Listing", "Add Your Business", "Advertising Solutions", "success stories"],
    },
    {
        title: "Trust & Company",
        links: ["About DBI", "Careers", "support", "How Verification Works", "The Accuracy Shield", "Press & News"],
    },
    {
        title: "Support & Legal",
        links: ["Contact Support", "Report a Data Error", "Terms of Service & Privacy Policy", "Cookiers Preference– GDPR/CCPA Compliance"],
    },
];

const socials = [
    { Icon: Twitter, href: "#" },
    { Icon: Facebook, href: "#" },
    { Icon: Youtube, href: "#" },
    { Icon: Instagram, href: "#" },
    { Icon: Linkedin, href: "#" },
];

export default function Footer() {
    const [solutions, setSolutions] = useState<string[]>([]);

    useEffect(() => {
        const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        fetch(`${API}/solutions`)
            .then(r => r.json())
            .then(res => {
                if (res.success && res.data) {
                    setSolutions(res.data
                        .filter((s: any) => s.isActive && s.category)
                        .map((s: any) => s.category.name)
                    );
                }
            })
            .catch(err => console.error('Footer solutions fetch failed:', err));
    }, []);

    const columns = staticColumns.map((col, idx) => {
        if (idx === 0) {
            return {
                ...col,
                links: [...col.links, ...solutions]
            };
        }
        return col;
    });

    return (
        <footer className="border-t border-border/20 pt-8 pb-8">
            <div className="container mx-auto px-4">

                {/* Main grid: 2 cols on mobile → 3 on md → 4 on lg */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mb-8">

                    {columns.map((col) => (
                        <div key={col.title}>
                            <h4 className="font-display font-semibold text-sm text-foreground mb-2">{col.title}</h4>
                            <ul className="space-y-1">
                                {col.links.map((link) => (
                                    <li key={link}>
                                        <Link
                                            href={link === "Contact Support" ? "/contact" : "#"}
                                            className="flex items-start gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors group"
                                        >
                                            <ChevronRight size={11} className="text-muted-foreground/40 group-hover:text-primary transition-colors mt-0.5 shrink-0" />
                                            {link}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Bottom bar */}
                <div className="border-t border-border/20 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
                    <p className="text-xs text-muted-foreground">
                        copyright ©2026{" "}
                        <span className="text-primary">Digital Book of India</span>
                        , All Rights Reserved.
                    </p>
                    <div className="flex items-center gap-2 flex-wrap justify-center">
                        {socials.map(({ Icon, href }, i) => (
                            <a
                                key={i}
                                href={href}
                                className="w-8 h-8 rounded-full glass flex items-center justify-center text-muted-foreground hover:text-primary transition-all duration-300"
                            >
                                <Icon size={14} />
                            </a>
                        ))}
                    </div>
                </div>

            </div>
        </footer>
    );
}
