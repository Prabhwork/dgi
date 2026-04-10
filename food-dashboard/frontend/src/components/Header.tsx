"use client";

import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Search, 
  Menu, 
  ChevronDown, 
  Power,
  Wallet,
  Zap,
  Coffee,
  Volume2,
  VolumeX,
  ShoppingBag,
  CreditCard,
  AlertTriangle,
  History,
  Users,
  Check,
  Trash2
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';
import { requestForToken, onMessageListener } from '@/lib/firebase';

export default function Header({ setIsSidebarOpenAction }: { setIsSidebarOpenAction: (val: boolean) => void }) {
  const [isOpen, setIsOpen] = useState(true);
  const [isBusy, setIsBusy] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchBox, setShowSearchBox] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [businessName, setBusinessName] = useState('Partner');

  // Fetch initial state
  useEffect(() => {
    fetchStatus();
    fetchWallet();
    fetchNotifications();
    fetchProfile();

    // Register for real-time notifications
    requestForToken();

    // Listen for foreground messages
    onMessageListener().then((payload: any) => {
        console.log("Foreground message in Food Header:", payload);
        // Refresh list when notification arrives
        fetchNotifications();
    }).catch(err => console.log("Failed to register message listener", err));
  }, []);

  const fetchStatus = async () => {
    try {
      const status = await api.get('/store-status');
      setIsOpen(status.isOpen);
      setIsBusy(status.isBusy);
      setIsMuted(status.isMuted);
    } catch (err) {
      console.error('Failed to fetch store status');
    }
  };

  const fetchWallet = async () => {
    try {
      const data = await api.get('/settlements/meta/wallet');
      setWalletBalance(data.redeemableBalance || 0);
    } catch (err) {
      console.error('Failed to fetch wallet balance');
    }
  };

  const fetchNotifications = async () => {
    try {
      const data = await api.get('/notifications');
      setNotifications(data);
    } catch (err) {
      console.error('Failed to fetch notifications');
    }
  };

  const fetchProfile = async () => {
    try {
      const settings = await api.get('/settings');
      if (settings?.businessName) {
        setBusinessName(settings.businessName);
      }
    } catch (err) {
      console.error('Failed to fetch business profile');
    }
  };

  const toggleStatus = async (type: 'open' | 'busy' | 'mute') => {
    try {
      const endpoint = {
        open: '/store-status/toggle-open',
        busy: '/store-status/toggle-busy',
        mute: '/store-status/toggle-mute'
      }[type];
      
      const res = await api.put(endpoint);
      if (type === 'open') setIsOpen(res.isOpen);
      if (type === 'busy') setIsBusy(res.isBusy);
      if (type === 'mute') setIsMuted(res.isMuted);
    } catch (err) {
      console.error(`Failed to toggle ${type}`);
    }
  };

  const handleSearch = async (q: string) => {
    setSearchQuery(q);
    if (!q.trim()) {
      setSearchResults([]);
      setShowSearchBox(false);
      return;
    }
    try {
      const data = await api.get(`/search?q=${q}`);
      setSearchResults(data.results || []);
      setShowSearchBox(true);
    } catch (err) {
      console.error('Search failed');
    }
  };

  const markRead = async (id: string) => {
    try {
      await api.put(`/notifications/${id}/read`);
      fetchNotifications();
    } catch (err) {
      console.error('Failed to mark read');
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await api.delete(`/notifications/${id}`);
      fetchNotifications();
    } catch (err) {
      console.error('Failed to delete notification');
    }
  };

  const markAllRead = async () => {
    try {
      await api.put('/notifications/mark-all-read');
      fetchNotifications();
    } catch (err) {
      console.error('Failed to mark all read');
    }
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-6 bg-white border-b border-slate-100 shadow-sm backdrop-blur-md bg-white/90">
      {/* Search & Toggle Area */}
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <button 
          onClick={() => setIsSidebarOpenAction(true)}
          className="p-2 -ml-2 lg:hidden text-slate-500"
        >
          <Menu size={24} />
        </button>
        
        <div className="relative flex-1 hidden sm:block group">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() => searchQuery && setShowSearchBox(true)}
            placeholder="Search orders, menu, payments..." 
            className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2.5 pl-10 pr-4 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
          />
          
          <AnimatePresence>
            {showSearchBox && searchResults.length > 0 && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowSearchBox(false)} />
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-100 shadow-2xl z-50 overflow-hidden"
                >
                  <div className="p-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Quick Search Results</span>
                    <span className="text-[10px] font-bold text-primary">{searchResults.length} Results Found</span>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {searchResults.map((res, i) => (
                      <Link 
                        key={i} 
                        href={res.link || '#'} 
                        onClick={() => setShowSearchBox(false)}
                        className="flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-all border-b border-slate-50 last:border-0 group"
                      >
                        <div className="flex flex-col">
                           <span className="text-[11px] font-black text-slate-800 tracking-tight flex items-center gap-2 group-hover:text-primary transition-colors">
                              {res.type === 'Order' ? '#' : ''}{res.id || res.name}
                              <span className="text-[8px] font-bold bg-slate-100 px-1.5 py-0.5 rounded uppercase text-slate-400 group-hover:bg-primary/10 group-hover:text-primary">{res.type}</span>
                           </span>
                           <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter truncate max-w-[200px]">{res.items || res.category || res.role}</span>
                        </div>
                        <ChevronDown size={14} className="text-slate-300 -rotate-90 group-hover:text-primary transition-all" />
                      </Link>
                    ))}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Action Area */}
      <div className="flex items-center gap-3">
        {/* Wallet Display */}
        <Link 
          href="/wallet"
          className="hidden md:flex items-center gap-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 rounded-xl px-4 py-2 transition-all group"
        >
          <div className="w-7 h-7 bg-emerald-500 rounded-lg flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
             <Wallet size={16} />
          </div>
          <div className="flex flex-col">
             <span className="text-[8px] font-black uppercase tracking-widest text-emerald-600 leading-none mb-0.5 whitespace-nowrap">Wallet Balance</span>
             <span className="text-xs font-black text-slate-800 leading-none">₹{walletBalance.toLocaleString('en-IN')}.00</span>
          </div>
        </Link>
        
        {/* Store Status Toggle */}
        <div className="flex items-center gap-2 mr-2 border-r border-slate-100 pr-4">
          <div className="hidden md:block text-right mr-2">
            <div className={`text-[9px] font-black uppercase tracking-widest ${isOpen ? 'text-primary' : 'text-slate-400'}`}>Store Status</div>
            <div className="text-[10px] font-bold text-slate-500 uppercase">{isOpen ? 'Accepting Orders' : 'Offline'}</div>
          </div>
          <button 
            onClick={() => toggleStatus('open')}
            className={`relative w-12 h-6 rounded-full transition-all duration-300 p-1 flex items-center ${isOpen ? 'bg-primary' : 'bg-slate-200'}`}
          >
            <motion.div 
              layout
              className="w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-lg"
              animate={{ x: isOpen ? 24 : 0 }}
            >
              {isOpen ? <Power size={8} className="text-primary font-bold" /> : <div className="w-1.5 h-1.5 bg-slate-300 rounded-full" />}
            </motion.div>
            {isOpen && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-primary rounded-full animate-ping border border-white" />
            )}
          </button>
        </div>

        {/* Busy Mode Toggle */}
        <div className="flex items-center gap-2 mr-2 border-r border-slate-100 pr-4 ml-1">
          <div className="hidden lg:block text-right mr-2">
            <div className={`text-[9px] font-black uppercase tracking-widest ${isBusy ? 'text-amber-500' : 'text-emerald-500'}`}>{isBusy ? 'Busy Mode' : 'Standard'}</div>
            <div className="text-[10px] font-bold text-slate-500 uppercase">{isBusy ? 'Slower Prep' : 'Fast Prep'}</div>
          </div>
          <button 
            onClick={() => toggleStatus('busy')}
            className={`relative w-12 h-6 rounded-full transition-all duration-300 p-1 flex items-center group ${isBusy ? 'bg-amber-500 shadow-lg shadow-amber-500/20' : 'bg-emerald-500 shadow-lg shadow-emerald-500/20'}`}
          >
            <motion.div 
              layout
              className="w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-lg"
              animate={{ x: isBusy ? 24 : 0 }}
            >
              {isBusy ? <Zap size={8} className="text-amber-500 font-bold" /> : <Coffee size={8} className="text-emerald-500 font-bold" />}
            </motion.div>
          </button>
        </div>

        {/* Sound Alert Toggle */}
        <div className="flex items-center gap-2 mr-4 ml-1">
          <button 
            onClick={() => toggleStatus('mute')}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isMuted ? 'bg-red-50 text-red-500 border border-red-100' : 'bg-emerald-50 text-emerald-500 border border-emerald-100'} hover:scale-105 active:scale-95`}
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
        </div>

        {/* Notifications Dropdown */}
        <div className="relative mr-4">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-all group ${showNotifications ? 'bg-primary/20 text-primary' : 'bg-slate-50 text-slate-500 hover:text-primary hover:bg-primary/5'}`}
          >
            <Bell size={20} className={showNotifications ? '' : 'group-hover:animate-bounce'} />
            {notifications.some(n => !n.read) && (
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white ring-2 ring-red-500/20" />
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                <motion.div 
                  initial={{ opacity: 0, y: 15, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 15, scale: 0.95 }}
                  className="absolute right-0 mt-3 w-80 bg-white/95 backdrop-blur-xl rounded-[2rem] border border-slate-100 shadow-2xl z-50 overflow-hidden"
                >
                  <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-800 italic">Notification Center</h4>
                    <button onClick={markAllRead} className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">Mark All Read</button>
                  </div>
                  <div className="max-h-[400px] overflow-y-auto py-2">
                    {notifications.length > 0 ? notifications.map((notif) => {
                      type NotifType = 'Order' | 'Payment' | 'Staff' | 'System';
                      const type = (notif.type || 'System') as NotifType;
                      
                      const IconMap: Record<NotifType, any> = { 
                        Order: ShoppingBag, 
                        Payment: CreditCard, 
                        Staff: Users, 
                        System: AlertTriangle 
                      };
                      
                      const ColorMap: Record<NotifType, string> = { 
                        Order: 'text-primary bg-primary/10', 
                        Payment: 'text-emerald-500 bg-emerald-500/10', 
                        Staff: 'text-blue-500 bg-blue-500/10',
                        System: 'text-amber-500 bg-amber-500/10' 
                      };
                      
                      const Icon = IconMap[type] || AlertTriangle;
                      const color = ColorMap[type] || ColorMap.System;
                      
                      return (
                        <div key={notif._id} className="relative px-6 py-4 hover:bg-slate-50 transition-all cursor-pointer group flex gap-4">
                          {!notif.read && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-10 bg-primary rounded-full shadow-[0_0_10px_rgba(255,107,0,0.5)]" />}
                          <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 ${color}`}>
                            <Icon size={18} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                                <span className="text-[10px] font-black text-slate-800 uppercase tracking-tight italic truncate">{notif.title}</span>
                                <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {!notif.read && (
                                        <button onClick={(e) => { e.stopPropagation(); markRead(notif._id); }} className="p-1 hover:bg-primary/10 rounded-md text-primary transition-colors">
                                            <Check size={12} />
                                        </button>
                                    )}
                                    <button onClick={(e) => { e.stopPropagation(); deleteNotification(notif._id); }} className="p-1 hover:bg-red-50 rounded-md text-red-500 transition-colors">
                                        <Trash2 size={12} />
                                    </button>
                                </div>
                            </div>
                            <p className="text-[10px] font-bold text-slate-500 leading-tight line-clamp-2">{notif.message}</p>
                            <span className="text-[8px] font-black text-slate-400 mt-1 uppercase tracking-widest">{new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </div>
                      );
                    }) : (
                      <div className="py-10 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">No new notifications</div>
                    )}
                    <div className="p-4 px-6 border-t border-slate-50 mt-2">
                       <button className="w-full py-4 bg-slate-900/5 hover:bg-slate-900/10 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center justify-center gap-2 transition-all">
                          <History size={12} /> View Notification Archive
                       </button>
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Profile */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-100 ml-1 group cursor-pointer hover:bg-slate-50 p-1 px-2 rounded-xl transition-all">
          <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden">
            <div className="w-full h-full bg-gradient-to-tr from-primary/10 to-primary/40 flex items-center justify-center text-primary font-black text-xs italic">
              {businessName.slice(0, 2).toUpperCase()}
            </div>
          </div>
          <div className="hidden sm:block text-left">
            <h4 className="text-xs font-black text-slate-800 leading-none">{businessName}</h4>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Digital Book of India</span>
          </div>
          <ChevronDown size={14} className="text-slate-400 group-hover:rotate-180 transition-transform" />
        </div>
      </div>
    </header>
  );
}
