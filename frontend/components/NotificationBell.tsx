"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, Check, Trash2, X, AlertCircle, ShoppingBag, CreditCard, Users, History } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { requestForToken, onMessageListener } from "../lib/firebase";

interface Notification {
    _id: string;
    title: string;
    message: string;
    type: 'Order' | 'System' | 'Audit' | 'Security' | 'User';
    read: boolean;
    createdAt: string;
}

export default function NotificationBell() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const popoverRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem('userToken') || localStorage.getItem('businessToken');
            if (!token) return;

            const res = await axios.get(`${apiBase}/notifications`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(res.data);
            setUnreadCount(res.data.filter((n: Notification) => !n.read).length);
        } catch (err) {
            console.error("Failed to fetch notifications:", err);
        }
    };

    useEffect(() => {
        fetchNotifications();

        // Register for real-time notifications
        requestForToken();

        // Listen for foreground messages
        onMessageListener().then((payload: any) => {
            console.log("Foreground message in Bell:", payload);
            // Refresh list when notification arrives
            fetchNotifications();
        }).catch(err => console.log("Failed to register message listener", err));

        // Polling every 30 seconds as fallback
        const interval = setInterval(fetchNotifications, 30000);
        
        // Handle click outside to close
        const handleClickOutside = (event: MouseEvent) => {
            if (
                popoverRef.current && 
                !popoverRef.current.contains(event.target as Node) &&
                buttonRef.current &&
                !buttonRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            clearInterval(interval);
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const markAsRead = async (id: string) => {
        try {
            const token = localStorage.getItem('userToken') || localStorage.getItem('businessToken');
            await axios.put(`${apiBase}/notifications/${id}/read`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(notifications.map(n => n._id === id ? { ...n, read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error("Failed to mark as read:", err);
        }
    };

    const markAllRead = async () => {
        try {
            const token = localStorage.getItem('userToken') || localStorage.getItem('businessToken');
            await axios.put(`${apiBase}/notifications/mark-all-read`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(notifications.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (err) {
            console.error("Failed to mark all read:", err);
        }
    };

    const deleteNotification = async (id: string) => {
        try {
            const token = localStorage.getItem('userToken') || localStorage.getItem('businessToken');
            await axios.delete(`${apiBase}/notifications/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(notifications.filter(n => n._id !== id));
            if (!notifications.find(n => n._id === id)?.read) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (err) {
            console.error("Failed to delete notification:", err);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'Order': return <ShoppingBag className="w-4 h-4 text-orange-500" />;
            case 'Security': return <AlertCircle className="w-4 h-4 text-red-500" />;
            case 'User': return <Users className="w-4 h-4 text-blue-500" />;
            case 'Payment': return <CreditCard className="w-4 h-4 text-emerald-500" />;
            default: return <Bell className="w-4 h-4 text-slate-400" />;
        }
    };

    return (
        <div className="relative">
            <button
                ref={buttonRef}
                onClick={() => setIsOpen(!isOpen)}
                className={`relative p-2 rounded-xl transition-all duration-300 ${isOpen ? 'bg-primary/20 text-primary scale-110' : 'text-foreground/60 hover:text-primary hover:bg-primary/10'}`}
            >
                <Bell size={22} />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white animate-in zoom-in">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        ref={popoverRef}
                        initial={{ opacity: 0, y: 12, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 12, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute right-0 mt-3 w-80 sm:w-96 bg-background/95 backdrop-blur-xl rounded-[2rem] border border-border shadow-2xl z-[100] overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-5 border-b border-border bg-foreground/[0.02] flex items-center justify-between">
                            <div>
                                <h4 className="text-sm font-bold tracking-tight">Notifications</h4>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">Community Updates</p>
                            </div>
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllRead}
                                    className="text-[10px] font-bold text-primary hover:underline uppercase tracking-tighter"
                                >
                                    Mark all as read
                                </button>
                            )}
                        </div>

                        {/* List */}
                        <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                            {notifications.length > 0 ? (
                                <div className="py-2">
                                    {notifications.map((notif) => (
                                        <div
                                            key={notif._id}
                                            className={`group relative px-5 py-4 flex gap-4 transition-colors hover:bg-foreground/[0.03] ${!notif.read ? 'bg-primary/[0.02]' : ''}`}
                                        >
                                            <div className={`shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm bg-background border border-border group-hover:scale-110 transition-transform`}>
                                                {getIcon(notif.type)}
                                            </div>
                                            
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className={`text-xs font-bold truncate ${!notif.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                                                        {notif.title}
                                                    </span>
                                                    <span className="text-[9px] text-muted-foreground whitespace-nowrap">
                                                        {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                                <p className="text-[11px] text-muted-foreground leading-snug line-clamp-2 mt-0.5">
                                                    {notif.message}
                                                </p>
                                                
                                                <div className="flex items-center gap-3 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {!notif.read && (
                                                        <button 
                                                            onClick={() => markAsRead(notif._id)}
                                                            className="flex items-center gap-1 text-[9px] font-bold text-primary hover:text-primary/80"
                                                        >
                                                            <Check size={12} /> Mark read
                                                        </button>
                                                    )}
                                                    <button 
                                                        onClick={() => deleteNotification(notif._id)}
                                                        className="flex items-center gap-1 text-[9px] font-bold text-destructive hover:text-destructive/80"
                                                    >
                                                        <Trash2 size={12} /> Delete
                                                    </button>
                                                </div>
                                            </div>

                                            {!notif.read && (
                                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full" />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-12 flex flex-col items-center justify-center text-center opacity-40">
                                    <Bell size={40} className="mb-2" />
                                    <p className="text-xs font-bold uppercase tracking-widest italic">Inbox is clean</p>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-4 bg-foreground/[0.02] border-t border-border mt-auto">
                            <button className="w-full py-3 rounded-2xl bg-background border border-border text-[9px] font-bold uppercase tracking-widest text-muted-foreground hover:bg-foreground/[0.05] transition-colors flex items-center justify-center gap-2">
                                <History size={12} /> Archive History
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
