"use client";

import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Search, 
  ChevronRight, 
  Clock, 
  MoreVertical,
  CheckCircle2,
  Package,
  Bike
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { INITIAL_ORDERS } from '@/lib/mockData';

const statusFlow = ['Pending', 'Accepted', 'Preparing', 'Ready', 'Completed'];

const statusColorMap: Record<string, string> = {
  'Pending': 'bg-amber-50 text-amber-600 border-amber-200',
  'Accepted': 'bg-blue-50 text-blue-600 border-blue-200',
  'Preparing': 'bg-primary/5 text-primary border-primary/20',
  'Ready': 'bg-emerald-50 text-emerald-600 border-emerald-200',
  'Completed': 'bg-slate-100 text-slate-500 border-slate-200',
};

export default function OrdersPage() {
  const [orders, setOrders] = useState(INITIAL_ORDERS);
  const [activeTab, setActiveTab] = useState('Active');

  const updateStatus = (id: string) => {
    setOrders(prev => prev.map(order => {
      if (order.id === id) {
        const currentIndex = statusFlow.indexOf(order.status);
        const nextIndex = Math.min(currentIndex + 1, statusFlow.length - 1);
        return { ...order, status: statusFlow[nextIndex] };
      }
      return order;
    }));
  };

  const filteredOrders = activeTab === 'Active' 
    ? orders.filter(o => o.status !== 'Completed')
    : orders.filter(o => o.status === 'Completed');

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Order Management</h2>
          <p className="text-sm font-semibold text-slate-400 mt-1">Accept and track your incoming orders</p>
        </div>
        <div className="flex bg-white p-1 rounded-2xl border border-slate-100 shadow-sm">
          {['Active', 'History'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:text-slate-600'}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {filteredOrders.map((order, idx) => (
            <motion.div
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              key={order.id}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 hover:shadow-md transition-all group"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                {/* Order Meta */}
                <div className="flex items-start gap-4">
                  <div className={`p-4 rounded-2xl border flex items-center justify-center shrink-0 ${statusColorMap[order.status]}`}>
                    <Package size={24} />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                       <span className="text-sm font-black text-slate-800 tracking-tight">{order.id}</span>
                       <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest border border-emerald-200 text-emerald-500 bg-emerald-50`}>{order.payment}</span>
                    </div>
                    <h3 className="text-base font-bold text-slate-700">{order.customer}</h3>
                    <div className="flex items-center gap-4 pt-1">
                        <div className="flex items-center gap-1 text-slate-400">
                            <Clock size={14} />
                            <span className="text-xs font-semibold">{order.time}</span>
                        </div>
                        <div className="flex items-center gap-1 text-slate-400 border-l border-slate-100 pl-4">
                            <ShoppingBag size={14} />
                            <span className="text-xs font-semibold">{order.items.split(',').length} Items</span>
                        </div>
                    </div>
                  </div>
                </div>

                {/* Items Detail */}
                <div className="flex-1 lg:px-8">
                    <div className="bg-slate-50/50 p-4 rounded-xl border border-dashed border-slate-200">
                        <p className="text-xs font-semibold text-slate-500 leading-relaxed italic">{order.items}</p>
                    </div>
                </div>

                {/* Actions & Price */}
                <div className="flex items-center justify-between lg:flex-col lg:items-end gap-2 lg:min-w-[200px]">
                   <div className="text-xl font-black text-slate-800">₹{order.total}</div>
                   <div className="flex items-center gap-3">
                      <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-200 ${statusColorMap[order.status]}`}>
                        {order.status}
                      </div>
                      {order.status !== 'Completed' && (
                        <button 
                          onClick={() => updateStatus(order.id)}
                          className="bg-primary text-white p-2.5 rounded-xl hover:bg-primary/90 transition-all shadow-md shadow-primary/10 group-active:scale-95"
                          title="Update Status"
                        >
                          <ChevronRight size={20} />
                        </button>
                      )}
                      {order.status === 'Completed' && (
                        <div className="p-2.5 text-emerald-500 bg-emerald-50 rounded-xl border border-emerald-100 shadow-sm">
                           <CheckCircle2 size={20} />
                        </div>
                      )}
                   </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredOrders.length === 0 && (
           <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border-2 border-dashed border-slate-100">
              <ShoppingBag size={48} className="text-slate-200 mb-4" />
              <h3 className="text-xl font-black text-slate-400 uppercase tracking-widest">No Recent Orders</h3>
              <p className="text-sm font-bold text-slate-300 mt-1 uppercase tracking-tighter">Orders will appear here once customers place them</p>
           </div>
        )}
      </div>

      {/* Quick Stats Overlay (Floating on desktop) */}
      <div className="hidden xl:flex fixed bottom-8 left-1/2 -translate-x-1/2 z-40 bg-slate-900 text-white rounded-2xl px-8 py-4 shadow-2xl items-center gap-10 border border-white/10 backdrop-blur-xl">
         <div className="flex items-center gap-3 border-r border-white/10 pr-10">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary"><ShoppingBag size={20} /></div>
            <div>
               <div className="text-[10px] font-black uppercase tracking-widest text-white/40">Active Orders</div>
               <div className="text-lg font-black">{orders.filter(o => o.status !== 'Completed').length}</div>
            </div>
         </div>
         <div className="flex items-center gap-3">
            <Bike size={24} className="text-emerald-400" />
            <div className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Shop is Live</div>
         </div>
      </div>
    </div>
  );
}
