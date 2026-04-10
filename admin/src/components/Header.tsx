"use client";

import { Bell, LogOut, Search, Menu, Check, Trash2, ShieldAlert, History } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useRouter } from "next/navigation";
import { requestForToken, onMessageListener } from "../lib/firebase";

interface Notification {
    _id: string;
    type: string;
    title: string;
    message: string;
    read: boolean;
    createdAt: string;
}

export default function Header({ setIsSidebarOpen }: { setIsSidebarOpen: (val: boolean) => void }) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const popoverRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

    const fetchNotifications = useCallback(async () => {
        try {
            const token = localStorage.getItem('adminToken');
            if (!token) return;

            const res = await axios.get(`${apiBase}/notifications`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(res.data);
            setUnreadCount(res.data.filter((n: Notification) => !n.read).length);
        } catch (err) {
            console.error("Failed to fetch notifications:", err);
        }
    }, [apiBase]);

    useEffect(() => {
        fetchNotifications();

        // Register for real-time notifications
        requestForToken();

        // Listen for foreground messages
        onMessageListener().then((payload) => {
            console.log("Foreground message in Main Admin Header:", payload);
            fetchNotifications();
        }).catch(err => console.log("Failed to register message listener", err));

        const interval = setInterval(fetchNotifications, 60000);

        const handleClickOutside = (event: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            clearInterval(interval);
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [fetchNotifications]);

    const markRead = async (id: string) => {
        try {
            const token = localStorage.getItem('adminToken');
            await axios.put(`${apiBase}/notifications/${id}/read`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchNotifications();
        } catch {
            console.error('Failed to mark read');
        }
    };

    const deleteNotification = async (id: string) => {
        try {
            const token = localStorage.getItem('adminToken');
            await axios.delete(`${apiBase}/notifications/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchNotifications();
        } catch {
            console.error('Failed to delete');
        }
    };

    const markAllRead = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            await axios.put(`${apiBase}/notifications/mark-all-read`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchNotifications();
        } catch {
            console.error('Failed to mark all read');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        router.push('/login');
    };

    return (
        <header className="sticky top-0 z-20 flex items-center justify-between h-16 px-6 bg-white border-b border-slate-200 shadow-sm">
            <div className="flex items-center gap-4">
                <button 
                    onClick={() => setIsSidebarOpen(true)}
                    className="p-2 -ml-2 xl:hidden text-slate-500 hover:bg-slate-50 rounded-lg transition-colors"
                >
                    <Menu size={20} />
                </button>
                <div className="relative hidden md:block group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors" size={16} />
                    <input 
                        type="text" 
                        placeholder="Search system..."
                        className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all w-64"
                    />
                </div>
            </div>

            <div className="flex items-center gap-4">
                {/* Notifications */}
                <div className="relative" ref={popoverRef}>
                    <button 
                        onClick={() => setShowNotifications(!showNotifications)}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${showNotifications ? 'bg-teal-50 text-teal-600' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                        <Bell size={20} />
                        {unreadCount > 0 && (
                            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white" />
                        )}
                    </button>

                    <AnimatePresence>
                        {showNotifications && (
                            <motion.div 
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="absolute right-0 mt-3 w-80 bg-white rounded-2xl border border-slate-200 shadow-xl z-40 overflow-hidden"
                            >
                                <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 italic">System Alerts</h4>
                                    <button onClick={markAllRead} className="text-[10px] font-bold text-teal-600 hover:underline px-2 uppercase tracking-tighter">Mark All Read</button>
                                </div>
                                <div className="max-h-80 overflow-y-auto">
                                    {notifications.length > 0 ? notifications.map((notif) => (
                                        <div key={notif._id} className="group relative px-4 py-3 hover:bg-slate-50 transition-all border-b border-slate-50 last:border-0 flex gap-3">
                                            {!notif.read && <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-teal-500" />}
                                            <div className="shrink-0 w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 group-hover:scale-110 transition-transform">
                                                {notif.type === 'Security' ? <ShieldAlert size={14} className="text-red-500" /> : <Bell size={14} />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-0.5">
                                                    <span className={`text-[11px] font-bold truncate ${!notif.read ? 'text-slate-900' : 'text-slate-500'}`}>{notif.title}</span>
                                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        {!notif.read && <button onClick={() => markRead(notif._id)} className="p-1 hover:text-teal-600 text-teal-500"><Check size={12} /></button>}
                                                        <button onClick={() => deleteNotification(notif._id)} className="p-1 hover:text-red-600 text-red-400"><Trash2 size={12} /></button>
                                                    </div>
                                                </div>
                                                <p className="text-[10px] text-slate-500 leading-tight line-clamp-2">{notif.message}</p>
                                                <span className="text-[8px] text-slate-400 mt-1 block uppercase tracking-tighter">{new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="py-10 text-center flex flex-col items-center gap-2">
                                            <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-200">
                                                <Bell size={24} />
                                            </div>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest italic">All caught up!</p>
                                        </div>
                                    )}
                                </div>
                                <div className="p-3 bg-slate-50 border-t border-slate-100">
                                    <button className="w-full py-2.5 text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-slate-200/50 rounded-xl transition-all">
                                        <History size={12} /> View Audit Logs
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Profile */}
                <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                    <div className="flex flex-col items-end hidden sm:flex">
                        <span className="text-xs font-bold text-slate-800">System Admin</span>
                        <span className="text-[10px] text-slate-400 uppercase tracking-tighter">DBI Master Control</span>
                    </div>
                    <button 
                        onClick={handleLogout}
                        className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-500 hover:bg-red-50 hover:text-red-500 transition-all border border-slate-200 shadow-sm"
                    >
                        <LogOut size={18} />
                    </button>
                </div>
            </div>
        </header>
    );
}
