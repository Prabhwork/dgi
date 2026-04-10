"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
    LayoutDashboard, 
    ShieldCheck, 
    Users, 
    ShieldAlert, 
    LogOut, 
    X,
    Building2,
    Store,
    Banknote
} from 'lucide-react';
import { useEffect, useState } from 'react';
import PartnerSwitcher from './PartnerSwitcher';

interface SidebarProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleLogout = () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('adminToken');
            router.push('/login');
        }
    };

    const routes = [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard },
        { name: 'FSSAI Approvals', path: '/fssai', icon: ShieldCheck },
        { name: 'Bank Approvals', path: '/bank-approvals', icon: ShieldCheck },
        { name: 'Partner Directory', path: '/partners', icon: Building2 },
        { name: 'Settlement Requests', path: '/settlements', icon: Banknote },
        { name: 'Content Moderation', path: '/moderation', icon: ShieldAlert },
    ];

    if (!mounted) return null;

    return (
        <aside className={`w-64 h-screen max-w-xs bg-white text-slate-800 flex flex-col fixed left-0 top-0 border-r border-slate-200 shadow-sm z-30 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} xl:translate-x-0`}>
            {/* Logo */}
            <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100">
                <div className="font-bold text-xl tracking-tight text-slate-800 flex items-center gap-2">
                    <span className="w-8 h-8 rounded bg-teal-500 flex items-center justify-center text-sm text-white shadow-sm">DBI</span>
                    Admin Panel
                </div>
                <button
                    onClick={() => setIsOpen(false)}
                    className="xl:hidden p-1 text-slate-500 hover:bg-slate-100 rounded-md transition-colors"
                >
                    <X size={20} />
                </button>
            </div>
            
            {/* Added: Partner Switcher */}
            <PartnerSwitcher />

            {/* Nav Links */}
            <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
                {routes.map((route) => {
                    const isActive = pathname === route.path || (route.path !== '/' && pathname?.startsWith(route.path));
                    return (
                        <Link
                            key={route.path}
                            href={route.path}
                            onClick={() => setIsOpen(false)}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isActive
                                ? 'bg-teal-500 text-white font-medium shadow-sm'
                                : 'text-slate-600 hover:bg-teal-50 hover:text-teal-600'
                                }`}
                        >
                            <route.icon size={18} />
                            {route.name}
                        </Link>
                    )
                })}
            </nav>

            {/* Partner Portal Shortcut */}
            <div className="px-4 mb-2">
                <Link 
                    href={process.env.NEXT_PUBLIC_FOOD_DASHBOARD_URL || "#"} 
                    target="_blank"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-500 hover:bg-slate-50 transition-colors text-sm"
                >
                    <Store size={16} />
                    Partner Portal
                </Link>
            </div>

            {/* Logout */}
            <div className="p-4 border-t border-slate-100">
                <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors font-medium"
                >
                    <LogOut size={18} />
                    Logout
                </button>
            </div>
        </aside>
    );
}
