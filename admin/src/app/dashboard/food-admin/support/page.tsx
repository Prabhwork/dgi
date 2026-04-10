"use client";

import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Clock, 
  CheckCircle2, 
  Search, 
  Filter, 
  ArrowRight,
  AlertTriangle,
  MessageSquare,
  User,
  Package
} from 'lucide-react';

interface SupportTicket {
  _id?: string;
  id: string;
  status: string;
  subject: string;
  customerName: string;
  description: string;
  priority: string;
  category: string;
  date: string;
  resolvedAt?: string;
}

export default function AdminSupportManagement() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const FOOD_API = process.env.NEXT_PUBLIC_FOOD_API_URL;
      const response = await fetch(`${FOOD_API}/support/tickets`);
      const data = await response.json();
      setTickets(data);
    } catch {
      console.error('Failed to fetch tickets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleResolve = async (id: string) => {
    try {
      const FOOD_API = process.env.NEXT_PUBLIC_FOOD_API_URL;
      const response = await fetch(`${FOOD_API}/support/tickets/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Solved' })
      });
      if (response.ok) {
        fetchTickets();
      }
    } catch {
      console.error('Failed to resolve ticket');
    }
  };

  const filteredTickets = tickets.filter(tkt => {
    const matchesFilter = filter === 'All' || tkt.status === filter;
    const matchesSearch = tkt.id?.toLowerCase().includes(search.toLowerCase()) || 
                          tkt.subject?.toLowerCase().includes(search.toLowerCase()) ||
                          tkt.customerName?.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const stats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'Open').length,
    solved: tickets.filter(t => t.status === 'Solved').length
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 font-bold uppercase italic">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3 italic">
            <ShieldAlert size={36} className="text-teal-500" />
            Incident Response Hub
          </h1>
          <p className="text-slate-500 mt-1 uppercase font-black text-xs tracking-widest">Administrative Control for Food Ecosystem Support Tickets</p>
        </div>
        <div className="flex items-center gap-4">
            <div className="bg-teal-50 text-teal-700 px-6 py-2 rounded-2xl border border-teal-100 flex items-center gap-2">
                <CheckCircle2 size={18} />
                <span className="text-sm">{stats.solved} Resolved</span>
            </div>
            <div className="bg-amber-50 text-amber-700 px-6 py-2 rounded-2xl border border-amber-100 flex items-center gap-2">
                <Clock size={18} />
                <span className="text-sm font-black italic">{stats.open} Awaiting Logic</span>
            </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 flex flex-col md:flex-row gap-6 shadow-sm">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by ID, Subject or Partner Name..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all font-black uppercase italic"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-slate-400" />
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-black outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer uppercase italic"
          >
            <option>All</option>
            <option>Open</option>
            <option>In Progress</option>
            <option>Solved</option>
          </select>
        </div>
      </div>

      {/* Ticket List */}
      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          <div className="h-64 flex items-center justify-center bg-white rounded-3xl border-2 border-dashed border-slate-100">
            <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center bg-white rounded-3xl border-2 border-dashed border-slate-100 space-y-4">
             <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300"><MessageSquare size={32} /></div>
             <p className="text-slate-400 text-sm font-black uppercase tracking-widest italic">No active incidents found matching your query</p>
          </div>
        ) : (
          filteredTickets.map(tkt => (
            <div 
              key={tkt._id} 
              className={`bg-white rounded-3xl border ${tkt.status === 'Open' ? 'border-amber-200 bg-amber-50/10' : 'border-slate-100'} p-8 shadow-sm hover:shadow-md transition-all group`}
            >
              <div className="flex flex-col lg:flex-row gap-8">
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="bg-slate-900 text-white px-4 py-1 rounded-lg text-[10px] font-black tracking-widest italic">ID: {tkt.id}</span>
                    <span className={`text-[10px] font-black px-4 py-1 rounded-lg border ${
                      tkt.priority?.includes('CRITICAL') ? 'bg-red-50 text-red-600 border-red-100' : 'bg-blue-50 text-blue-600 border-blue-100'
                    }`}>
                      {tkt.priority}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-auto">{tkt.date}</span>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-xl font-black text-slate-800 italic uppercase leading-none">{tkt.subject}</h3>
                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                       <User size={12} className="text-teal-500" /> LOGGED BY: <span className="text-slate-900 italic font-black">{tkt.customerName}</span> 
                       <span className="mx-2 opacity-30">•</span>
                       <Package size={12} className="text-teal-500" /> CATEGORY: <span className="text-slate-900 italic font-black">{tkt.category}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 font-bold leading-relaxed italic uppercase opacity-70">
                    {tkt.description}
                  </p>
                </div>

                <div className="flex lg:flex-col items-center justify-center gap-4 lg:pl-10 lg:border-l border-slate-100">
                  <div className={`p-4 rounded-2xl ${tkt.status === 'Solved' ? 'bg-teal-50 text-teal-600' : 'bg-amber-50 text-amber-500'}`}>
                    {tkt.status === 'Solved' ? <CheckCircle2 size={28} /> : <AlertTriangle size={28} />}
                  </div>
                  <div className="text-center lg:w-full">
                    <span className={`text-[9px] font-black uppercase tracking-widest block mb-2 ${tkt.status === 'Solved' ? 'text-teal-600' : 'text-amber-500'}`}>
                      STATUS: {tkt.status}
                    </span>
                    {tkt.status !== 'Solved' && (
                      <button 
                        onClick={() => handleResolve(tkt.id)}
                        className="bg-teal-500 hover:bg-teal-600 text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-teal-500/20 active:scale-95 transition-all flex items-center gap-2"
                      >
                         Mark Resolved <ArrowRight size={14} />
                      </button>
                    )}
                    {tkt.status === 'Solved' && (
                      <div className="text-[8px] font-bold text-slate-400 mt-1 uppercase tracking-widest">
                         Resolved At: {tkt.resolvedAt ? new Date(tkt.resolvedAt).toLocaleTimeString() : tkt.date}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
