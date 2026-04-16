"use client";

import { useEffect, useState } from "react";
import { 
    Clock, ShieldAlert, CheckCircle2, ChevronRight, 
    AlertCircle, FileText, Send, Building2 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

import { useRouter } from "next/navigation";

export default function StatusPage() {
    const router = useRouter();
    const [business, setBusiness] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMe = async () => {
            const token = localStorage.getItem('businessToken');
            if (!token) {
                router.push("/community/login");
                return;
            }

            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/business/me`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();
                if (data.success) {
                    setBusiness(data.data);
                    // If approved, go to dashboard
                    if (data.data.approvalStatus === 'approved') {
                        router.push("/");
                    }
                } else {
                    router.push("/community/login");
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchMe();
    }, [router]);

    if (loading) return null;

    const renderContent = () => {
        if (business?.approvalStatus === 'pending') {
            return (
                <div className="space-y-8 animate-in fade-in duration-700">
                    <div className="w-20 h-20 bg-amber-500/10 rounded-3xl flex items-center justify-center mx-auto border border-amber-500/20">
                        <Clock className="text-amber-500 w-10 h-10 animate-pulse" />
                    </div>
                    <div className="space-y-4">
                        <h1 className="text-3xl font-display font-bold uppercase tracking-widest">
                            Verification <span className="text-amber-500 italic">Pending</span>
                        </h1>
                        <p className="text-white/60 max-w-md mx-auto leading-relaxed">
                            Your application is currently being reviewed by our board. This process typically takes <strong>24-48 hours</strong>.
                        </p>
                    </div>
                    <div className="glass-strong p-6 rounded-2xl border border-white/5 text-left max-w-md mx-auto">
                        <div className="flex items-center gap-3 mb-4">
                            <ShieldAlert className="text-amber-500 w-5 h-5" />
                            <span className="text-xs font-bold uppercase tracking-widest text-white/80">Next Steps</span>
                        </div>
                        <ul className="space-y-3">
                            <li className="flex gap-3 text-xs text-white/50">
                                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1" />
                                Our team will verify your establishment and identity proofs.
                            </li>
                            <li className="flex gap-3 text-xs text-white/50">
                                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1" />
                                You will receive an email once the decision is made.
                            </li>
                        </ul>
                    </div>
                    <Button variant="outline" className="rounded-xl border-white/10" asChild>
                        <a href="/">Back to Website</a>
                    </Button>
                </div>
            );
        }

        if (business?.approvalStatus === 'rejected') {
            return (
                <div className="space-y-8 animate-in zoom-in-95 duration-500">
                    <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center mx-auto border border-red-500/20">
                        <ShieldAlert className="text-red-500 w-10 h-10" />
                    </div>
                    <div className="space-y-4">
                        <h1 className="text-3xl font-display font-bold uppercase tracking-widest">
                            Application <span className="text-red-500 italic">Rejected</span>
                        </h1>
                        <p className="text-white/60 max-w-md mx-auto">
                            We were unable to approve your application at this time.
                        </p>
                    </div>

                    <div className="glass-strong p-8 rounded-3xl border border-red-500/20 text-left max-w-md mx-auto space-y-4 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <FileText size={80} />
                        </div>
                        <div className="text-[10px] font-bold text-red-500 uppercase tracking-[0.2em]">Rejection Reason</div>
                        <p className="text-sm text-white/80 leading-relaxed italic">
                            "{business.rejectionReason || "Please verify your uploaded documents and resubmit."}"
                        </p>
                    </div>

                    <div className="flex flex-col gap-3">
                        <Button 
                            variant="glow" 
                            className="rounded-xl h-12 px-12 uppercase tracking-widest text-xs font-bold"
                            onClick={() => router.push("/community/register?mode=update")}
                        >
                            Update & Resubmit
                        </Button>
                        <p className="text-[10px] text-white/30 uppercase tracking-widest">Please contact support for immediate assistance</p>
                    </div>
                </div>
            );
        }

        return null;
    };

    return (
        <div className="min-h-screen bg-background relative overflow-hidden text-foreground">
           
            <Navbar />
            <main className="pt-32 pb-24 relative z-10 px-4 flex items-center justify-center text-center">
                <div className="max-w-xl w-full">
                    {renderContent()}
                </div>
            </main>
            <Footer />
        </div>
    );
}
