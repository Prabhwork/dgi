"use client";

import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Clock, 
  CheckCircle2,
  Package,
  X,
  Phone,
  MapPin,
  CreditCard,
  Printer,
  ArrowRight,
  User,
  Timer
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';

const statusFlow = ['Pending', 'Accepted', 'Preparing', 'Ready', 'Completed'];

const statusColorMap: Record<string, string> = {
  'Pending': 'bg-amber-50 text-amber-600 border-amber-200',
  'Accepted': 'bg-blue-50 text-blue-600 border-blue-200',
  'Preparing': 'bg-indigo-50 text-indigo-600 border-indigo-200',
  'Ready': 'bg-emerald-50 text-emerald-600 border-emerald-200',
  'Completed': 'bg-slate-100 text-slate-500 border-slate-200',
};

const statusStripMap: Record<string, string> = {
  'Pending': 'bg-amber-400',
  'Accepted': 'bg-blue-400',
  'Preparing': 'bg-indigo-500',
  'Ready': 'bg-emerald-500',
  'Completed': 'bg-slate-200',
};

const nextActionMap: Record<string, string> = {
  'Pending': 'Accept Order',
  'Accepted': 'Start Preparing',
  'Preparing': 'Mark as Ready',
  'Ready': 'Mark Completed',
};

const CountdownBadge = ({ order, prepTime, className }: { order: any, prepTime: number, className?: string }) => {
  const calculateRemaining = () => {
      const baseTime = order?.preparingAt || order?.acceptedAt;
      if (!baseTime) return { mins: prepTime, secs: 0 };
      const targetTime = new Date(baseTime).getTime() + (prepTime * 60000);
      const now = new Date().getTime();
      const diff = targetTime - now;
      if (diff <= 0) return { mins: 0, secs: 0 };
      const mins = Math.floor(diff / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      return { mins, secs };
  };

  const [{ mins, secs }, setTime] = useState(calculateRemaining());

  useEffect(() => {
      const interval = setInterval(() => {
          setTime(calculateRemaining());
      }, 1000);
      return () => clearInterval(interval);
  }, [order?.preparingAt, prepTime]);

  const isDone = mins === 0 && secs === 0;

  return (
    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border ${isDone ? 'bg-red-50 text-red-600 border-red-100 animate-pulse' : 'bg-emerald-50 text-emerald-600 border-emerald-100'} ${className}`}>
      <Timer size={12} />
      <span className="text-[10px] font-black uppercase italic">
        {isDone ? 'Ready soon!' : `Ready in: ${mins}:${secs.toString().padStart(2, '0')}`}
      </span>
    </div>
  );
};

const PickupCountdown = ({ readyAt, className }: { readyAt: string, className?: string }) => {
  const calculateRemaining = () => {
      if (!readyAt) return { mins: 3, secs: 0 };
      const targetTime = new Date(readyAt).getTime() + (3 * 60000);
      const now = new Date().getTime();
      const diff = targetTime - now;
      if (diff <= 0) return { mins: 0, secs: 0 };
      const mins = Math.floor(diff / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      return { mins, secs };
  };

  const [{ mins, secs }, setTime] = useState(calculateRemaining());

  useEffect(() => {
      const interval = setInterval(() => {
          setTime(calculateRemaining());
      }, 1000);
      return () => clearInterval(interval);
  }, [readyAt]);

  const isDone = mins === 0 && secs === 0;

  return (
    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border shadow-sm ${isDone ? 'bg-rose-500 text-white border-rose-600 animate-pulse' : 'bg-primary/10 text-primary border-primary/20'} ${className}`}>
      <Clock size={12} className={isDone ? 'animate-spin' : ''} />
      <span className="text-[10px] font-black uppercase italic tracking-wider">
        {isDone ? 'Pickup Overdue!' : `COLLECT IN: ${mins}:${secs.toString().padStart(2, '0')}`}
      </span>
    </div>
  );
};

const PreparationLockBadge = ({ time, className }: { time: string, className?: string }) => {
  const calculateDelta = () => {
    if (!time) return 0;
    const [t, period] = time.split(' ');
    let [hours, minutes] = t.split(':').map(Number);
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    const arrival = new Date();
    arrival.setHours(hours, minutes, 0, 0);
    const now = new Date();
    return Math.floor((arrival.getTime() - now.getTime()) / 60000);
  };

  const [minsRemaining, setMinsRemaining] = useState(calculateDelta());

  useEffect(() => {
    const interval = setInterval(() => {
      setMinsRemaining(calculateDelta());
    }, 10000);
    return () => clearInterval(interval);
  }, [time]);

  const isLocked = minsRemaining > 30;
  if (!isLocked) return null;

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border bg-rose-50/50 text-rose-500 border-rose-100 animate-pulse ${className}`}>
      <Timer size={14} className="opacity-70" />
      <span className="text-[10px] font-black uppercase italic tracking-[0.1em]">
        Prep starts in {minsRemaining - 30}m
      </span>
    </div>
  );
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('Active');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [confirmModal, setConfirmModal] = useState<any>({ isOpen: false, order: null, nextStatus: '', prepTime: 20 });

  const fetchOrders = async () => {
    try {
      const data = await api.get('/orders');
      setOrders(data);
    } catch (err) {
      console.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  const isOrderLocked = (order: any) => {
    if (order.status !== 'Accepted' || order.orderType !== 'Dine-in' || !order.time) return false;
    const [t, p] = order.time.split(' ');
    let [h, m] = t.split(':').map(Number);
    if (p === 'PM' && h !== 12) h += 12;
    if (p === 'AM' && h === 12) h = 0;
    const arrival = new Date();
    arrival.setHours(h, m, 0, 0);
    return Math.floor((arrival.getTime() - new Date().getTime()) / 60000) > 30;
  };

  const updateStatus = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const order = orders.find(o => o.id === id);
    if (!order) return;

    if (order.status === 'Accepted' && order.orderType === 'Dine-in' && order.time) {
        const [t, period] = order.time.split(' ');
        let [hours, minutes] = t.split(':').map(Number);
        if (period === 'PM' && hours !== 12) hours += 12;
        if (period === 'AM' && hours === 12) hours = 0;
        const arrival = new Date();
        arrival.setHours(hours, minutes, 0, 0);
        const diffMins = Math.floor((arrival.getTime() - new Date().getTime()) / 60000);
        if (diffMins > 30) return;
    }

    const currentIndex = statusFlow.indexOf(order.status);
    if (currentIndex === statusFlow.length - 1) return;

    const nextStatus = statusFlow[currentIndex + 1];
    setConfirmModal({ isOpen: true, order, nextStatus, prepTime: order.prepTime || 15 });
  };

  const handleConfirmUpdate = async () => {
    const { order, nextStatus } = confirmModal;
    if (!order) return;

    try {
      setOrders(prev => prev.map(o => o.id === order.id ? { 
        ...o, 
        status: nextStatus, 
        readyAt: nextStatus === 'Ready' ? new Date().toISOString() : o.readyAt,
        preparingAt: nextStatus === 'Preparing' ? new Date().toISOString() : o.preparingAt,
        prepTime: (nextStatus === 'Preparing' ? confirmModal.prepTime : o.prepTime) 
      } : o));
      if (selectedOrder?.id === order.id) setSelectedOrder({ 
        ...selectedOrder, 
        status: nextStatus, 
        readyAt: nextStatus === 'Ready' ? new Date().toISOString() : selectedOrder.readyAt,
        preparingAt: nextStatus === 'Preparing' ? new Date().toISOString() : selectedOrder.preparingAt,
        prepTime: (nextStatus === 'Preparing' ? confirmModal.prepTime : selectedOrder.prepTime) 
      });
      setConfirmModal({ isOpen: false, order: null, nextStatus: '', prepTime: 20 });

      await api.put(`/orders/${order.id}/status`, { 
        status: nextStatus,
        prepTime: nextStatus === 'Accepted' ? confirmModal.prepTime : undefined
      });
    } catch (err) {
      console.error('Failed to update order status');
      fetchOrders();
    }
  };

  if (loading) {
     return (
       <div className="flex items-center justify-center h-[80vh]">
         <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
       </div>
     );
  }

  const filteredOrders = activeTab === 'Active' 
    ? orders.filter(o => o.status !== 'Completed')
    : orders.filter(o => o.status === 'Completed');

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-800 tracking-tight italic uppercase">Orders Console</h2>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1 border-l-2 border-primary pl-4">Live Operational Queue &amp; Fulfillment</p>
        </div>
        <div className="flex bg-white p-1.5 rounded-[1.5rem] border border-slate-100 shadow-sm overflow-hidden">
          {['Active', 'History'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/10' : 'text-slate-400 hover:text-slate-600'}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <div className="grid grid-cols-1 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredOrders.map((order, idx) => (
            <motion.div
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              key={order.id}
              onClick={() => setSelectedOrder(order)}
              className="bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all group relative cursor-pointer overflow-hidden"
            >
              {/* Top colored status strip */}
              <div className={`h-1 w-full ${statusStripMap[order.status] || 'bg-slate-200'}`} />

              <div className="p-5 md:p-6 space-y-4">
                {/* Row 1: Customer info + Price + Action */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  {/* Left: icon + name + badges */}
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className={`w-11 h-11 rounded-2xl border flex items-center justify-center shrink-0 ${statusColorMap[order.status]}`}>
                      <Package size={20} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5 mb-1">
                        <span className="text-[9px] font-black text-slate-300 tracking-[0.15em] uppercase">#{order.id}</span>
                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase border ${order.payment === 'Paid' ? 'border-emerald-100 text-emerald-600 bg-emerald-50' : 'border-amber-100 text-amber-600 bg-amber-50'}`}>
                          {order.payment}
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase border border-primary/20 text-primary bg-primary/5">
                          {order.orderType || 'Takeaway'}
                        </span>
                        {order.orderType === 'Dine-in' && order.time && (
                          <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase border border-rose-100 text-rose-500 bg-rose-50 animate-pulse">
                            Arriving @ {order.time}
                          </span>
                        )}
                      </div>
                      <h3 className="text-xl font-black text-slate-900 tracking-tight italic uppercase leading-none group-hover:text-primary transition-colors truncate">
                        {order.customer}
                      </h3>
                    </div>
                  </div>

                  {/* Right: price + status pill + CTA */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <div className="text-2xl font-black text-slate-900 italic leading-none">₹{Number(order.total).toFixed(0)}</div>
                      <div className={`mt-1.5 px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest border w-fit ml-auto ${statusColorMap[order.status]}`}>
                        {order.status}
                      </div>
                    </div>
                    {order.status !== 'Completed' && (
                      <button
                        onClick={(e) => updateStatus(order.id, e)}
                        className={`px-5 py-3 rounded-2xl transition-all active:scale-95 flex items-center gap-2 shrink-0 group/btn ${
                          isOrderLocked(order)
                            ? 'bg-slate-50 text-slate-300 border border-slate-100 cursor-not-allowed'
                            : 'bg-slate-900 text-white hover:bg-primary shadow-lg shadow-slate-900/10'
                        }`}
                      >
                        <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
                          {isOrderLocked(order) ? 'Locked' : (nextActionMap[order.status] || 'Update')}
                        </span>
                        <ArrowRight size={14} className={`${isOrderLocked(order) ? 'opacity-30' : 'group-hover/btn:translate-x-1'} transition-transform`} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Row 2: Time chips + Countdowns + Items */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                      <Clock size={12} className="text-primary/70" />
                      <span className="text-[10px] font-black uppercase tracking-tight text-slate-500">
                        {order.time || (order.createdAt ? new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just Now')}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                      <ShoppingBag size={12} className="text-primary/70" />
                      <span className="text-[10px] font-black uppercase tracking-tight text-slate-500">
                        {order.itemsArray?.length || (Array.isArray(order.items) ? order.items.length : order.items?.split(',').length || 0)} Items
                      </span>
                    </div>
                    {order.status === 'Preparing' && (order.prepTime > 0 || order.preparingAt) && (
                      <CountdownBadge order={order} prepTime={order.prepTime || 20} />
                    )}
                    {order.status === 'Ready' && (
                      <PickupCountdown readyAt={order.readyAt} />
                    )}
                    {order.status === 'Accepted' && order.orderType === 'Dine-in' && (
                      <PreparationLockBadge time={order.time} />
                    )}
                  </div>

                  {/* Items pill list */}
                  <div className="flex-1 bg-slate-50 px-4 py-2.5 rounded-xl border border-dashed border-slate-100 min-w-0">
                    {order.itemsArray && order.itemsArray.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {order.itemsArray.map((item: any, i: number) => (
                          <span key={i} className="px-2.5 py-1 bg-white border border-slate-100 rounded-lg text-[9px] font-black uppercase italic text-slate-600 shadow-sm whitespace-nowrap">
                            {item.quantity}× {item.name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[11px] font-bold text-slate-500 italic leading-relaxed truncate">
                        {Array.isArray(order.items) ? order.items.map((it: any) => it.name).join(', ') : order.items}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredOrders.length === 0 && (
           <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-6">
                <ShoppingBag size={40} />
              </div>
              <h3 className="text-xl font-black text-slate-400 uppercase tracking-[0.2em] italic">No Queue</h3>
              <p className="text-[10px] font-black text-slate-300 mt-2 uppercase tracking-widest">Awaiting incoming orders from DB platform</p>
           </div>
        )}
      </div>

      {/* Order Detail Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedOrder(null)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div 
               initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
               className="relative bg-white w-full max-w-2xl rounded-[3rem] p-0 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
               <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
                  <div className="flex items-center gap-4">
                     <div className={`w-12 h-12 rounded-xl flex items-center justify-center border shadow-lg ${statusColorMap[selectedOrder.status]}`}>
                        <Package size={24} />
                     </div>
                     <div>
                        <h3 className="text-xl font-black text-slate-800 italic uppercase leading-none">ORDER {selectedOrder.id}</h3>
                        <div className="flex items-center gap-2 mt-1">
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status: <span className="text-primary italic">{selectedOrder.status}</span></p>
                            {(selectedOrder.status === 'Preparing') && (selectedOrder.prepTime > 0 || selectedOrder.preparingAt) && (
                              <CountdownBadge order={selectedOrder} prepTime={selectedOrder.prepTime || 20} className="!bg-transparent !border-0 !p-0 !animate-none" />
                           )}
                        </div>
                     </div>
                  </div>
                  <div className="flex gap-2 no-print">
                     <button 
                        onClick={() => window.print()}
                        className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-primary transition-all shadow-sm"
                     >
                        <Printer size={20} />
                     </button>
                     <button onClick={() => setSelectedOrder(null)} className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:bg-slate-50 transition-all shadow-sm"><X size={20} /></button>
                  </div>
               </div>

               <div className="overflow-y-auto p-8 custom-scrollbar">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                     {/* Left: Customer & Delivery */}
                     <div className="space-y-8">
                        <div>
                           <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic mb-4 block">Customer Details</label>
                           <div className="p-6 bg-slate-50 rounded-3xl space-y-4">
                              <div className="flex items-center gap-4 text-slate-700">
                                 <User size={18} className="text-primary" />
                                 <p className="text-sm font-black uppercase italic">{selectedOrder.customer}</p>
                              </div>
                              <div className="flex items-center gap-4 text-slate-700">
                                 <Phone size={18} className="text-primary" />
                                 <p className="text-sm font-bold tracking-widest">{selectedOrder.customerPhone || '+91 98XXX-XX742'}</p>
                              </div>
                              {selectedOrder.address && (
                                <div className="flex items-start gap-4 text-slate-700">
                                   <MapPin size={18} className="text-primary shrink-0 mt-0.5" />
                                   <p className="text-xs font-bold leading-relaxed">{selectedOrder.address}</p>
                                </div>
                              )}
                           </div>
                        </div>

                        <div>
                           <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic mb-4 block">Payment Mode</label>
                           <div className={`flex items-center gap-4 p-6 rounded-3xl border ${selectedOrder.payment === 'Paid' ? 'bg-emerald-50 border-emerald-100' : 'bg-amber-50 border-amber-100'}`}>
                              <div className={`w-10 h-10 rounded-xl text-white flex items-center justify-center shadow-lg ${selectedOrder.payment === 'Paid' ? 'bg-emerald-500 shadow-emerald-500/20' : 'bg-amber-500 shadow-amber-500/20'}`}><CreditCard size={20} /></div>
                              <div>
                                 <p className={`text-sm font-black italic uppercase ${selectedOrder.payment === 'Paid' ? 'text-emerald-600' : 'text-amber-600'}`}>{selectedOrder.payment === 'Paid' ? 'PREPAID (Online)' : 'CASH ON DELIVERY'}</p>
                                 <p className={`text-[10px] font-bold leading-none mt-0.5 uppercase ${selectedOrder.payment === 'Paid' ? 'text-emerald-400' : 'text-amber-400'}`}>Order #{selectedOrder.id}</p>
                              </div>
                           </div>
                        </div>
                     </div>

                     {/* Right: Bill Summary */}
                     <div className="space-y-6">
                        <div className="print-kot">
                           <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic mb-2 block no-print">Itemized Invoice</label>
                           <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden print:bg-white print:text-black print:rounded-none print:border print:border-slate-200">
                              <div className="hidden print:block mb-8 border-b-2 border-slate-900 pb-4">
                                 <h1 className="text-2xl font-black italic uppercase">KITCHEN ORDER TICKET</h1>
                                 <p className="text-xs font-bold uppercase mt-1">Order: {selectedOrder.id} | {selectedOrder.customer}</p>
                              </div>
                              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl print:hidden" />
                              <div className="space-y-4 relative z-10">
                                 {selectedOrder.itemsArray && selectedOrder.itemsArray.length > 0 ? (
                                    selectedOrder.itemsArray.map((item: any, i: number) => (
                                       <div key={i} className="flex justify-between items-center border-b border-white/5 pb-2 print:border-slate-100">
                                          <p className="text-xs font-bold uppercase tracking-tight italic">{item.quantity}x {item.name}</p>
                                          <p className="text-xs font-black">₹{(item.price * item.quantity).toFixed(2)}</p>
                                       </div>
                                    ))
                                 ) : (
                                    (Array.isArray(selectedOrder.items) ? selectedOrder.items : selectedOrder.items?.split(',') || []).map((item: any, i: number) => (
                                       <div key={i} className="flex justify-between items-center border-b border-white/5 pb-2 print:border-slate-100">
                                          <p className="text-xs font-bold uppercase tracking-tight italic">{typeof item === 'string' ? item.trim() : `${item.quantity}x ${item.name}`}</p>
                                          <p className="text-xs font-black">₹{typeof item === 'string' ? (i === 0 ? Number(selectedOrder.total).toFixed(2) : '-') : (item.price * item.quantity).toFixed(2)}</p>
                                       </div>
                                    ))
                                 )}
                                 <div className="pt-6 space-y-2 border-t border-white/10 mt-4 print:border-slate-900">
                                    <div className="flex justify-between text-[10px] font-bold text-white/40 uppercase print:text-slate-400">
                                       <span>Subtotal</span>
                                       <span>₹{Number(selectedOrder.subtotal || selectedOrder.total).toFixed(2)}</span>
                                    </div>
                                    {selectedOrder.tax > 0 && (
                                       <div className="flex justify-between text-[10px] font-bold text-white/40 uppercase print:text-slate-400">
                                          <span>Tax</span>
                                          <span>₹{Number(selectedOrder.tax).toFixed(2)}</span>
                                       </div>
                                    )}
                                    {selectedOrder.restaurantCharges > 0 && (
                                       <div className="flex justify-between text-[10px] font-bold text-white/40 uppercase print:text-slate-400">
                                          <span>Restaurant Charges</span>
                                          <span>₹{Number(selectedOrder.restaurantCharges).toFixed(2)}</span>
                                       </div>
                                    )}
                                    {selectedOrder.discount > 0 && (
                                       <div className="flex justify-between text-[10px] font-bold text-emerald-400 uppercase">
                                          <span>Discount</span>
                                          <span>-₹{Number(selectedOrder.discount).toFixed(2)}</span>
                                       </div>
                                    )}
                                    <div className="flex justify-between items-center pt-4 border-t border-white/5 print:border-slate-900">
                                       <span className="text-[11px] font-black text-primary uppercase italic tracking-[0.2em]">Total Amount</span>
                                       <span className="text-2xl font-black italic uppercase">₹{Number(selectedOrder.total).toFixed(2)}</span>
                                    </div>
                                 </div>
                              </div>
                           </div>
                        </div>
                        <button 
                           onClick={() => window.print()}
                           className="w-full py-5 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 no-print"
                        >
                           <Printer size={16} /> Print Kitchen Order Ticket (KOT)
                        </button>
                     </div>
                  </div>
               </div>

               <div className="p-8 border-t border-slate-50 bg-slate-50/50 flex flex-col md:flex-row gap-4 shrink-0">
                  {selectedOrder.status !== 'Completed' && (
                     <button 
                        onClick={() => { updateStatus(selectedOrder.id); setSelectedOrder(null); }}
                        className="flex-[2] py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-900/20 active:scale-95 transition-all"
                     >
                        {nextActionMap[selectedOrder.status]}
                     </button>
                  )}
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {confirmModal.isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
               onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })} 
               className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" 
            />
            <motion.div 
               initial={{ opacity: 0, scale: 0.9, y: 20 }} 
               animate={{ opacity: 1, scale: 1, y: 0 }} 
               exit={{ opacity: 0, scale: 0.9, y: 20 }}
               className="relative bg-white w-full max-w-sm rounded-[3rem] p-10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] overflow-hidden text-center"
            >
               <div className="absolute top-0 left-0 w-full h-2 bg-primary" />
               
               <div className="mb-8 flex justify-center">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-primary relative">
                     <div className="absolute inset-0 bg-primary/10 rounded-full animate-ping" />
                     <Package size={40} className="relative z-10" />
                  </div>
               </div>

               <h3 className="text-2xl font-black text-slate-800 italic uppercase leading-tight mb-4">
                  {confirmModal.nextStatus === 'Completed' ? 'Verify Pickup' : 'Update status?'}
               </h3>
               
               <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-relaxed mb-6">
                  {confirmModal.nextStatus === 'Completed' 
                    ? "Please verify the customer's identity before completing the order."
                    : <>Are you sure you want to change <span className="text-slate-800">Order #{confirmModal.order?.id}</span> to <span className="text-primary italic">"{confirmModal.nextStatus}"</span>?</>}
               </p>

               {confirmModal.nextStatus === 'Completed' && (
                 <div className="mb-8 p-6 bg-slate-50 rounded-[2rem] border border-slate-100 flex flex-col gap-4 text-left">
                    <div className="space-y-1">
                       <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] block">Customer Name</span>
                       <span className="text-lg font-black text-slate-800 italic uppercase leading-none">{confirmModal.order?.customer}</span>
                    </div>
                    <div className="space-y-1 pt-4 border-t border-slate-200/50">
                       <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] block">Contact Number</span>
                       <div className="flex items-center gap-2 text-primary font-black">
                          <Phone size={14} />
                          <span className="text-lg">{confirmModal.order?.customerPhone || 'Not Provided'}</span>
                       </div>
                    </div>
                 </div>
               )}

               {confirmModal.nextStatus === 'Accepted' && (
                 <div className="mb-8 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Adjust Preparation Time</p>
                    <div className="flex items-center justify-center gap-6">
                       <button 
                         type="button"
                         onClick={() => setConfirmModal((prev: any) => ({ ...prev, prepTime: Math.max(5, prev.prepTime - 5) }))}
                         className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:border-primary hover:text-primary transition-all shadow-sm"
                       >
                         -
                       </button>
                       <div className="text-center">
                          <span className="text-2xl font-black italic text-slate-800">{confirmModal.prepTime}</span>
                          <span className="text-[10px] font-bold text-slate-400 ml-1 uppercase">MINS</span>
                       </div>
                       <button 
                         type="button"
                         onClick={() => setConfirmModal((prev: any) => ({ ...prev, prepTime: prev.prepTime + 5 }))}
                         className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:border-primary hover:text-primary transition-all shadow-sm"
                       >
                         +
                       </button>
                    </div>
                 </div>
               )}

               <div className="flex flex-col gap-3">
                  <button 
                     onClick={handleConfirmUpdate}
                     className={`w-full py-5 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl transition-all active:scale-95 ${confirmModal.nextStatus === 'Completed' ? 'bg-emerald-500 shadow-emerald-500/20' : 'bg-slate-900 shadow-slate-900/20 hover:bg-primary'}`}
                  >
                     {confirmModal.nextStatus === 'Completed' ? 'Handover & Complete' : 'Confirm Action'}
                  </button>
                  <button 
                     onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                     className="w-full py-5 bg-white border-2 border-slate-100 text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95"
                  >
                     Cancel
                  </button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Quick Stats Overlay (Floating on desktop) */}
      <div className="hidden xl:flex fixed bottom-8 left-1/2 -translate-x-1/2 z-40 bg-slate-900 text-white rounded-[2rem] px-10 py-5 shadow-2xl items-center gap-12 border border-white/10 backdrop-blur-3xl">
         <div className="flex items-center gap-4 border-r border-white/10 pr-12">
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary border border-primary/20 animate-pulse"><ShoppingBag size={24} /></div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-slate-900" />
            </div>
            <div>
               <div className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40">Queue Matrix</div>
               <div className="text-xl font-black italic uppercase tracking-wider">{orders.filter(o => o.status !== 'Completed').length} Active Orders</div>
            </div>
         </div>
         <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400 border border-emerald-500/20"><Package size={20} /></div>
            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400 italic">Kitchen is Live &amp; Streaming</div>
         </div>
      </div>
    </div>
  );
}
