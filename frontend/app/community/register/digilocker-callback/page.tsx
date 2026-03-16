"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";

import { Suspense } from "react";

function DigiLockerCallbackContent() {
    const searchParams = useSearchParams();
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const verifyCode = async () => {
            const code = searchParams.get("code");
            const state = searchParams.get("state");

            if (!code) {
                setStatus("error");
                setError("Authorization code is missing");
                return;
            }

            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/business/digilocker/callback`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ code, state })
                });
                const data = await res.json();

                if (data.success) {
                    setStatus("success");
                    // Send message to parent window
                    if (window.opener) {
                        window.opener.postMessage({ 
                            type: "DIGILOCKER_SUCCESS", 
                            data: data.data 
                        }, "*");
                        // Close this popup after a brief delay
                        setTimeout(() => window.close(), 1500);
                    }
                } else {
                    setStatus("error");
                    setError(data.error || "Verification failed");
                }
            } catch (err) {
                setStatus("error");
                setError("Failed to connect to verification server");
            }
        };

        verifyCode();
    }, [searchParams]);

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
            <div className="max-w-md w-full glass p-10 rounded-[2.5rem] border border-white/10">
                {status === "loading" && (
                    <div className="space-y-6">
                        <Loader2 className="w-16 h-16 text-primary animate-spin mx-auto" />
                        <h1 className="text-2xl font-bold text-white">Verifying with DigiLocker</h1>
                        <p className="text-white/60">Please wait while we securely retrieve your information...</p>
                    </div>
                )}

                {status === "success" && (
                    <div className="space-y-6 animate-in zoom-in-95 duration-500">
                        <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto text-emerald-500">
                            <CheckCircle2 size={48} />
                        </div>
                        <h1 className="text-2xl font-bold text-white">Verification Successful!</h1>
                        <p className="text-white/60">Your identity has been verified. This window will close automatically.</p>
                    </div>
                )}

                {status === "error" && (
                    <div className="space-y-6 animate-in fade-in duration-500">
                        <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto text-red-500">
                            <AlertCircle size={48} />
                        </div>
                        <h1 className="text-2xl font-bold text-white">Verification Failed</h1>
                        <p className="text-red-400 font-medium">{error}</p>
                        <button 
                            onClick={() => window.close()}
                            className="mt-4 px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all"
                        >
                            Close Window
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function DigiLockerCallback() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-center p-6">
                <Loader2 className="w-16 h-16 text-primary animate-spin mx-auto" />
            </div>
        }>
            <DigiLockerCallbackContent />
        </Suspense>
    );
}
