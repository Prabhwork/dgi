"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
    const router = useRouter();

    useEffect(() => {
        // Redirect to login after a brief moment
        const timer = setTimeout(() => {
            router.push('/login');
        }, 3000);
        return () => clearTimeout(timer);
    }, [router]);

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
            <div className="text-center">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-4">Registration Disabled</h1>
                <p className="text-slate-500">New admin registrations are currently disabled for security reasons.</p>
                <p className="text-sm text-slate-400 mt-2">Redirecting to login...</p>
            </div>
        </div>
    );
}
