"use client";

import Sidebar from '@/components/Sidebar';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Menu } from 'lucide-react';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        // Basic auth check
        const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
        if (!token) {
            router.push('/login');
        } else {
            setLoading(false);
        }
    }, [router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-slate-50 relative">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-800/50 z-20 xl:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

            <main className="flex-1 flex flex-col xl:ml-64 min-h-screen w-full transition-all duration-300">
                {/* Mobile Header */}
                <header className="xl:hidden flex items-center justify-between px-4 h-16 bg-white border-b border-slate-200 sticky top-0 z-10 w-full">
                    <div className="flex items-center gap-2 font-bold text-lg text-slate-800">
                        <span className="w-8 h-8 rounded bg-teal-500 flex items-center justify-center text-sm text-white shadow-sm">DBI</span>
                        Admin
                    </div>
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="p-2 text-slate-600 hover:bg-slate-100 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-inset"
                    >
                        <Menu size={24} />
                    </button>
                </header>

                <div className="p-4 md:p-8 flex-1 overflow-x-hidden w-full max-w-[100vw]">
                    <div className="w-full max-w-7xl mx-auto space-y-8">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}
