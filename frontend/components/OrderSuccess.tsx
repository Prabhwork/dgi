"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    CheckCircle2, Clock, Timer, 
    ArrowLeft, MapPin, Phone, 
    ShoppingBag, Star, Info,
    ChevronRight, Loader2, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface OrderSuccessProps {
    order: any;
    onOrderMore: () => void;
    partnerId: string;
    onClose?: () => void;
}

const FOOD_BACKEND = process.env.NEXT_PUBLIC_FOOD_API_URL;

export default function OrderSuccess({ order, onOrderMore, partnerId, onClose }: OrderSuccessProps) {
    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Countdown Timer Logic
    useEffect(() => {
        if (!order.acceptedAt || order.status === 'Completed') {
            setTimeLeft(null);
            return;
        }

        const tick = () => {
            const acceptedTime = new Date(order.acceptedAt).getTime();
            const prepMinutes = order.prepTime || 15;
            const expiryTime = acceptedTime + (prepMinutes * 60 * 1000);
            const now = new Date().getTime();
            const remain = Math.max(0, Math.floor((expiryTime - now) / 1000));
            setTimeLeft(remain);
        };

        tick();
        const timer = setInterval(tick, 1000);
        return () => clearInterval(timer);
    }, [order.acceptedAt, order.prepTime, order.status]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const statusSteps = [
        { id: 'Pending', label: 'Placed', icon: <CheckCircle2 size={16}/> },
        { id: 'Accepted', label: 'Accepted', icon: <Clock size={16}/> },
        { id: 'Preparing', label: 'Cooking', icon: <Timer size={16}/> },
        { id: 'Ready', label: 'Ready', icon: <ShoppingBag size={16}/> },
        { 
            id: 'Completed', 
            label: order.orderType === 'Dine-in' ? 'Served' : 'Picked Up', 
            icon: <Star size={16}/> 
        }
    ];

    const currentStepIndex = statusSteps.findIndex(s => s.id === order.status);

    return (
        <div className="bg-white text-slate-900 font-sans pb-32 h-full">
            {/* Success Header */}
            <div className="relative h-[35vh] bg-[#E03546] overflow-hidden flex flex-col items-center justify-center text-white px-6">
                {onClose && (
                    <button 
                        onClick={onClose} 
                        className="absolute top-6 right-6 p-3 bg-white/20 hover:bg-white/30 backdrop-blur-3xl rounded-full transition-all border border-white/30 text-white"
                    >
                        <ArrowLeft size={20} />
                    </button>
                )}
                
                <motion.div 
                    initial={{ scale: 0, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    className="w-16 h-16 bg-white/20 backdrop-blur-3xl rounded-[1.5rem] flex items-center justify-center mb-6 border border-white/30 shadow-2xl"
                >
                    <CheckCircle2 size={32} className="text-white fill-emerald-500" />
                </motion.div>
                
                <h1 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter mb-2 text-center">Order Confirmed!</h1>
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-80 mb-1">Order ID: {order.id}</p>
                
                {/* Status Animated Pills */}
                <div className="mt-8 flex items-center gap-2 overflow-x-auto scrollbar-hide py-2 px-4 w-full justify-center">
                    {statusSteps.map((step, idx) => {
                        const isDone = idx <= currentStepIndex;
                        const isCurrent = idx === currentStepIndex;
                        
                        return (
                            <div key={idx} className="flex items-center">
                                <div className="flex flex-col items-center gap-1.5">
                                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-500 ${isCurrent ? 'bg-white text-[#E03546] scale-110 shadow-xl shadow-black/20' : isDone ? 'bg-emerald-500 text-white' : 'bg-white/10 text-white/30'}`}>
                                        {step.icon}
                                    </div>
                                    <span className={`text-[7px] font-black uppercase tracking-widest ${isDone ? 'opacity-100' : 'opacity-30'}`}>{step.label}</span>
                                </div>
                                {idx < statusSteps.length - 1 && (
                                    <div className={`h-[1px] w-3 md:w-6 mx-1 rounded-full mb-4 ${idx < currentStepIndex ? 'bg-emerald-500' : 'bg-white/10'}`} />
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Main Info Shell */}
            <div className="max-w-xl mx-auto -translate-y-12 px-6">
                {/* High Priority Tracker Card */}
                <div className="bg-white rounded-[3rem] p-8 shadow-[0_40px_80px_rgba(0,0,0,0.1)] border border-slate-100 mb-8 overflow-hidden relative">
                    {order.status === 'Pending' ? (
                        <div className="flex flex-col items-center text-center py-6">
                            <Loader2 className="text-[#E03546] animate-spin mb-4" size={32} />
                            <h2 className="text-2xl font-black italic uppercase text-slate-400">Waiting for Acceptance</h2>
                            <p className="text-sm opacity-50 mt-2">Partner is reviewing your order details...</p>
                        </div>
                    ) : timeLeft !== null ? (
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-[#E03546] mb-1">Estimated Arrival</p>
                                <h2 className="text-5xl font-black italic text-slate-900 tracking-tighter">{formatTime(timeLeft)}</h2>
                                <p className="text-xs font-bold opacity-30 mt-1 uppercase">Cooking with magic...</p>
                            </div>
                            <div className="w-20 h-20 bg-slate-50 rounded-[2rem] border border-slate-100 flex items-center justify-center shadow-inner">
                                <Sparkles className="text-[#E03546] animate-pulse" size={32} />
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center text-center py-6">
                            <ShoppingBag className="text-emerald-500 mb-4" size={40} />
                            <h2 className="text-3xl font-black italic uppercase text-slate-900">
                                {order.orderType === 'Dine-in' ? 'Order Served!' : 'Ready for Pickup!'}
                            </h2>
                            <p className="text-sm opacity-50 mt-2">
                                {order.orderType === 'Dine-in' 
                                    ? `Enjoy your meal at Table ${order.tableNumber || '---'}` 
                                    : "Grab your order from the counter."}
                            </p>
                        </div>
                    )}
                </div>

                {/* Items Summary */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between border-b pb-4 border-slate-100">
                        <h3 className="font-black italic uppercase tracking-wider text-slate-400 text-xs">{order.orderType || 'Takeaway'} Breakdown</h3>
                        <span className="text-[10px] bg-slate-50 px-3 py-1 rounded-full font-bold">
                            {order.orderType === 'Dine-in' ? `Table ${order.tableNumber || '---'}` : 'Counter Pickup'}
                        </span>
                    </div>
                    
                    <div className="space-y-6">
                        {order.itemsArray?.map((item: any, idx: number) => (
                            <div key={idx} className="flex justify-between items-center group">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-xs font-black text-[#E03546] group-hover:bg-[#E03546] group-hover:text-white transition-colors">
                                        {item.quantity}x
                                    </div>
                                    <div className="flex flex-col">
                                        <h5 className="font-black text-slate-900 uppercase text-sm leading-none mb-1">{item.name}</h5>
                                        <p className="text-[10px] font-bold opacity-30 tracking-widest">₹{item.price} PER UNIT</p>
                                    </div>
                                </div>
                                <span className="font-black text-slate-900">₹{item.price * item.quantity}</span>
                            </div>
                        ))}
                    </div>

                    <div className="pt-8 border-t border-slate-100 mt-8 space-y-4">
                        <div className="flex justify-between items-center opacity-40 text-sm font-bold">
                            <span>Subtotal</span>
                            <span>₹{order.subtotal || order.total - (order.tax || 0)}</span>
                        </div>
                        <div className="flex justify-between items-center opacity-40 text-sm font-bold">
                            <span>Gst (5%)</span>
                            <span>₹{order.tax || (order.total * 0.05).toFixed(0)}</span>
                        </div>
                        {order.discount > 0 && (
                            <div className="flex justify-between items-center text-emerald-600 text-sm font-black italic">
                                <span>Promo Discount {order.couponCode ? `(${order.couponCode})` : ''}</span>
                                <span>-₹{order.discount}</span>
                            </div>
                        )}
                        <div className="flex justify-between items-end pt-4">
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-30 mb-2">Total Amount Settlement</span>
                            <span className="text-4xl font-black italic text-slate-900">₹{order.total?.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="mt-16 flex flex-col gap-4">
                    <Button 
                        onClick={onOrderMore}
                        className="w-full py-8 rounded-3xl bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-widest text-sm shadow-2xl transition-all active:scale-95"
                    >
                        Order More Happiness
                    </Button>
                    <p className="text-center text-[9px] font-black uppercase tracking-[0.4em] opacity-20">Safe & Healthy Dining Guaranteed</p>
                </div>
            </div>
        </div>
    );
}
