"use client";

import React from 'react';
import { 
  ShoppingBag, 
  IndianRupee, 
  Clock, 
  CheckCircle2, 
  ArrowUpRight, 
  MoreHorizontal,
  ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import Link from 'next/link';

const iconMap: Record<string, any> = {
  orders: ShoppingBag,
  revenue: IndianRupee,
  pending: Clock,
  completed: CheckCircle2,
};

const colorMap: Record<string, string> = {
  primary: 'bg-primary/10 text-primary border-primary/20',
  emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  amber: 'bg-amber-50 text-amber-600 border-amber-100',
  blue: 'bg-blue-50 text-blue-600 border-blue-100',
};

const statusColors: Record<string, string> = {
  'Pending': 'bg-amber-50 text-amber-600',
  'Accepted': 'bg-blue-50 text-blue-600',
  'Preparing': 'bg-primary/5 text-primary',
  'Ready': 'bg-emerald-50 text-emerald-600 border border-emerald-200',
  'Completed': 'bg-slate-100 text-slate-500',
};

export default function Dashboard() {
  const [stats, setStats] = React.useState<any[]>([]);
  const [orders, setOrders] = React.useState<any[]>([]);
  const [categories, setCategories] = React.useState<any[]>([]);
  const [businessName, setBusinessName] = React.useState('Restaurant Partner');
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const [dashData, ordersData, catData, settingsData] = await Promise.all([
          api.get('/analytics/dashboard'),
          api.get('/orders'),
          api.get('/analytics/category-performance'),
          api.get('/settings')
        ]);
        setStats(dashData.stats || []);
        setOrders(ordersData.slice(0, 5) || []); 
        setCategories(catData || []);
        setBusinessName(settingsData.businessName || 'Restaurant Partner');
      } catch (err) {
        console.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      {/* Title Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Dashboard Overview</h2>
          <p className="text-sm font-semibold text-slate-400 mt-1">Real-time business performance for {businessName}</p>
        </div>
        <button className="bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm">
          Export Report <ArrowUpRight size={14} />
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((stat, idx) => {
          const Icon = iconMap[stat.icon] || ShoppingBag;
          return (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              key={stat.label}
              className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${colorMap[stat.color] || colorMap.primary}`}>
                  <Icon size={24} />
                </div>
                <MoreHorizontal size={18} className="text-slate-300 group-hover:text-slate-400 cursor-pointer" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest leading-none">{stat.label}</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-slate-800">{stat.value}</span>
                  <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded uppercase">{stat.sub?.split(' ')[0]}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Main Grid: Orders & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-slate-800 tracking-tight">Recent Orders</h3>
            <Link href="/orders" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
              View All <ChevronRight size={14} />
            </Link>
          </div>
          
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Order ID</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Items</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Total</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4 text-xs font-black text-slate-800 tracking-tight group-hover:text-primary transition-colors">{order.id}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-700">{order.customer}</span>
                          <span className="text-[10px] font-semibold text-slate-400">{order.time || new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-medium text-slate-500 truncate max-w-[180px] block">
                          {Array.isArray(order.items) ? order.items.map((it: any) => it.name).join(", ") : order.items}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs font-bold text-slate-800">₹{Number(order.total).toFixed(2)}</td>
                      <td className="px-6 py-4 text-right">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${statusColors[order.status] || 'bg-slate-100 text-slate-500'}`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {orders.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-20 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">No recent orders</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Categories Performance Mini-Card */}
        <div className="space-y-4">
          <h3 className="text-xl font-black text-slate-800 tracking-tight">Best Categories</h3>
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
            {categories.length > 0 ? categories.map((cat) => (
              <div key={cat.name} className="space-y-2">
                <div className="flex justify-between items-end">
                  <div>
                    <h4 className="text-sm font-bold text-slate-700">{cat.name}</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{cat.count}</p>
                  </div>
                  <span className="text-xs font-black text-slate-800">{cat.percentage}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${cat.percentage}%` }}
                    className="h-full rounded-full bg-primary" 
                  />
                </div>
              </div>
            )) : (
              <div className="py-10 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">No data available</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

