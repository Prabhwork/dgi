"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { api } from "@/lib/api";
import FSSAIPopup from "./FSSAIPopup";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  // Guard: prevents the SSO token from being processed more than once
  const processingRef = useRef(false);

  // FSSAI State
  const [showFssaiPopup, setShowFssaiPopup] = useState(false);
  const [fssaiPending, setFssaiPending] = useState(false);
  const [businessName, setBusinessName] = useState('');

  useEffect(() => {
    // Skip if already processing SSO
    if (processingRef.current) return;

    const handleInit = async () => {
      const ssoToken = searchParams.get('sso_token');
      const partnerIdParam = searchParams.get('partner_id');

      if (ssoToken) {
        // Lock: only process SSO token once
        processingRef.current = true;
        localStorage.setItem('businessToken', ssoToken);
        if (partnerIdParam) {
          localStorage.setItem('partnerId', partnerIdParam);
        }
        // Clean URL: remove sso_token and partner_id from address bar
        router.replace(pathname);
        // Give router.replace time to settle, then show UI
        await new Promise(resolve => setTimeout(resolve, 300));
        processingRef.current = false;
        setIsInitializing(false);
        return;
      }

      // Auth Guard: If no token and not on an auth page, redirect to login
      const token = localStorage.getItem('businessToken');
      const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/logout');

      if (!token && !isAuthPage) {
        router.push('/login');
        setIsInitializing(false);
        return;
      }

      // Fetch settings to check FSSAI
      if (token && !isAuthPage) {
         try {
            const settings = await api.get('/settings');
            if (settings?.businessName) {
               setBusinessName(settings.businessName);
            }
            // Show popup if FSSAI is missing
            if (!settings?.fssai) {
               setShowFssaiPopup(true);
               setFssaiPending(!!settings?.fssaiSubmissionPending);
            }
         } catch (e) {
            console.error('Failed to fetch settings for FSSAI check', e);
         }
      }

      setIsInitializing(false);
    };

    handleInit();
  // Only re-run when search params change (i.e. when SSO token arrives).
  // router and pathname are intentionally excluded to prevent loops.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Use pathname hook (SSR-safe, no hydration mismatch)
  const isLogoutPage = pathname.startsWith('/logout');
  const isLoginPage = pathname.startsWith('/login');

  // Loading Screen — shown during SSO init OR on the logout route
  if (isInitializing || isLogoutPage) {
    const loadingText = isLogoutPage
      ? 'Terminating Session...'
      : 'Authenticating Secure Portal...';

    return (
      <div className="h-screen w-full bg-[#020631] flex flex-col items-center justify-center relative overflow-hidden">
        {/*
          IMPORTANT: Only render children hidden on the /logout route.
          The logout page needs its useEffect to run (to clear localStorage & redirect).
          For ALL other routes during init, do NOT render children — that would cause
          the dashboard's useEffects to fire API calls before the SSO token is stored.
        */}
        {isLogoutPage && <div className="hidden">{children}</div>}

        {/* Background Decorative Blobs */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse delay-700" />

        <div className="relative z-10 text-center space-y-6">
          <div className="relative mx-auto w-20 h-20">
            <div className="absolute inset-0 border-4 border-white/5 rounded-full" />
            <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
               <div className="w-2 h-2 bg-white rounded-full animate-ping" />
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-white font-black tracking-[0.3em] uppercase text-sm">Digital Book of India</h2>
            <p className="text-white/40 text-[10px] font-bold tracking-[0.2em] uppercase italic animate-pulse">
              {loadingText}
            </p>
          </div>
        </div>

        {/* Cyber-Line Decorative */}
        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      </div>
    );
  }

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50/50">
      {/* Sidebar - Fixed on large screens, Drawer on mobile */}
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0 transition-all duration-300 lg:pl-72 relative">
        <Header setIsSidebarOpenAction={setIsSidebarOpen} />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {showFssaiPopup && (
        <FSSAIPopup 
          businessName={businessName} 
          initialPending={fssaiPending}
          onSuccess={() => {
             // If submitted newly, it goes to pending state. We lock the screen instead of closing.
             setFssaiPending(true);
          }} 
        />
      )}
    </div>
  );
}
