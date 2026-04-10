"use client";

import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';
import { PartnerProvider } from './lib/PartnerContext';
import "./globals.css";

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const router = useRouter();
    const pathname = usePathname();
    const [loading, setLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        // Basic auth check
        const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
        const isLoginPage = pathname === '/login';

        if (!token && !isLoginPage) {
            router.push('/login');
        } else if (token && isLoginPage) {
            router.push('/');
        } else {
            setLoading(false);
        }
    }, [router, pathname]);

    if (loading) {
        return (
            <html lang="en">
                <body className="min-h-screen flex items-center justify-center bg-slate-50">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
                </body>
            </html>
        );
    }

    // Don't show sidebar on login page
    if (pathname === '/login') {
        return (
            <html lang="en">
                <body className="antialiased">
                    {children}
                </body>
            </html>
        );
    }

    return (
        <html lang="en">
            <body className="antialiased flex min-h-screen bg-slate-50 relative">
                <PartnerProvider>
                    {/* Mobile Sidebar Overlay */}
                    {isSidebarOpen && (
                        <div
                            className="fixed inset-0 bg-slate-800/50 z-20 xl:hidden"
                            onClick={() => setIsSidebarOpen(false)}
                        />
                    )}

                    <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

                    <main className="flex-1 flex flex-col xl:ml-64 min-h-screen w-full transition-all duration-300">
                        <Header setIsSidebarOpen={setIsSidebarOpen} />

                        <div className="p-4 md:p-8 flex-1 overflow-x-hidden w-full max-w-[100vw]">
                            <div className="w-full max-w-7xl mx-auto space-y-8">
                                {children}
                            </div>
                        </div>
                    </main>
                </PartnerProvider>
            </body>
        </html>
    );
}
