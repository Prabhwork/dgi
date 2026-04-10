"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function LogoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Clear the Food Dashboard's storage
    localStorage.removeItem("businessToken");
    
    // Redirect to login page
    window.location.href = "/login";
  }, [router, searchParams]);

  return (
    <div className="flex items-center justify-center h-screen bg-slate-900">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-white font-bold tracking-widest uppercase text-xs">Logging out from Food Portal...</p>
      </div>
    </div>
  );
}

export default function LogoutPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen bg-slate-900">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    }>
      <LogoutContent />
    </Suspense>
  );
}
