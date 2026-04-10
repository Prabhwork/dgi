"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogIn, ShieldCheck, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem("businessToken");
    if (token) {
      router.push("/");
      return;
    }

    // Auto-redirect timer
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleExternalLogin();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  const handleExternalLogin = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_MAIN_APP_URL}/community/login`;
  };

  return (
    <div className="h-screen w-full bg-[#020631] flex flex-col items-center justify-center relative overflow-hidden p-4">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary/10 rounded-full blur-[150px] animate-pulse" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-600/5 rounded-full blur-[150px] animate-pulse delay-1000" />

      {/* Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

      <div className="relative z-10 w-full max-w-md">
        {/* Glass Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl space-y-8 relative overflow-hidden group">
          {/* Top Cyber Line */}
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 mb-4 animate-bounce">
              <ShieldCheck className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">Protected Portal</h1>
            <p className="text-white/50 text-sm">Restaurant Management Interface</p>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleExternalLogin}
              className="w-full group/btn bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 shadow-lg shadow-primary/20 active:scale-[0.98]"
            >
              <LogIn className="w-5 h-5" />
              <span>Login via Swadeshi Platform</span>
              <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
            </button>

            <div className="text-center pt-4">
              <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest">
                Automatic redirect in <span className="text-primary font-black">{countdown}s</span>
              </p>
            </div>
          </div>

          {/* Footer Branding */}
          <div className="pt-6 border-t border-white/5 text-center">
            <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">Digital Book of India</p>
          </div>
        </div>

        {/* Support Link */}
        <div className="text-center mt-6">
          <a href="#" className="text-white/40 hover:text-white/60 text-xs transition-colors underline decoration-white/20 underline-offset-4">
            Need help accessing your partner account?
          </a>
        </div>
      </div>
    </div>
  );
}
