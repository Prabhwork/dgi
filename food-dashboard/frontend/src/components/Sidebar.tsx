"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  UtensilsCrossed, 
  ShoppingBag, 
  CreditCard, 
  Settings,
  X,
  ChevronRight,
  IndianRupee,
  BarChart3,
  MessageSquare,
  Ticket,
  Users,
  HelpCircle,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';

import { LucideIcon } from 'lucide-react';

interface MenuItem {
  name: string;
  icon: LucideIcon;
  path: string;
  external?: boolean;
}

const menuItems: MenuItem[] = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { name: 'Menu', icon: UtensilsCrossed, path: '/menu' },
  { name: 'Orders', icon: ShoppingBag, path: '/orders' },
  { name: 'Payments', icon: CreditCard, path: '/payments' },
  { name: 'Wallet', icon: IndianRupee, path: '/wallet' },
  { name: 'Analytics', icon: BarChart3, path: '/analytics' },
  { name: 'Dineout', icon: Users, path: '/dineout' },
  { name: 'Reviews', icon: MessageSquare, path: '/reviews' },
  { name: 'Team', icon: Users, path: '/team' },
  { name: 'Promotions', icon: Ticket, path: '/promotions' },
  { name: 'Support', icon: HelpCircle, path: '/support' },
  { name: 'Settings', icon: Settings, path: '/settings' },
  { name: 'Moderation', icon: Ticket, path: '/moderation' },
];

export default function Sidebar({ isOpen, setIsOpen }: { isOpen: boolean, setIsOpen: (val: boolean) => void }) {
  const pathname = usePathname();
  const [businessName, setBusinessName] = React.useState('Restaurant Partner');

  React.useEffect(() => {
    const fetchProfile = async () => {
      try {
        const settings = await api.get('/settings');
        setBusinessName(settings.businessName || 'Restaurant Partner');
      } catch (err) {
        console.error('Failed to fetch sidebar profile');
      }
    };
    fetchProfile();
  }, []);

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-100 transition-transform duration-300 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
                <UtensilsCrossed size={22} />
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-800 tracking-tight leading-none">FOOD</h1>
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400">Partner Hub</span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="lg:hidden text-slate-400">
              <X size={20} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto mt-4">
            {menuItems.map((item: MenuItem) => {
              const isActive = pathname === item.path;
              return (
                <Link 
                  key={item.name}
                  href={item.path}
                  target={item.external ? "_blank" : undefined}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center justify-between px-4 py-3.5 rounded-xl transition-all group ${isActive ? 'bg-primary/5 text-primary' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                    <span className={`text-sm ${isActive ? 'font-bold' : 'font-semibold'}`}>{item.name}</span>
                  </div>
                  {isActive && <motion.div layoutId="active" className="w-1.5 h-1.5 bg-primary rounded-full" />}
                  {!isActive && <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />}
                </Link>
              );
            })}
          </nav>

          {/* Business Context */}
          <div className="p-6 border-t border-slate-100 bg-slate-50/50">
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Partner Business</div>
              <div className="text-xs font-bold text-slate-600 truncate">{businessName}</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
