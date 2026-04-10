"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { Suspense } from "react";

const NearbyMap = dynamic(() => import("@/components/NearbyMap"), { 
    ssr: false,
    loading: () => (
        <div className="fixed inset-0 bg-[#020631] flex flex-col items-center justify-center gap-6">
            <div className="w-24 h-24 rounded-full border-4 border-primary/20 animate-ping" />
            <p className="text-white/60 font-medium animate-pulse">Initializing 3D Map View...</p>
        </div>
    )
});

export default function NearbyMapPage() {
    const router = useRouter();

    return (
        <Suspense fallback={
            <div className="fixed inset-0 bg-[#020631] flex flex-col items-center justify-center gap-6">
                <div className="w-24 h-24 rounded-full border-4 border-primary/20 animate-ping" />
                <p className="text-white/60 font-medium animate-pulse">Loading Map Infrastructure...</p>
            </div>
        }>
            <div className="min-h-screen bg-[#020631] overflow-hidden">
                <NearbyMap onClose={() => router.back()} />
            </div>
        </Suspense>
    );
}
