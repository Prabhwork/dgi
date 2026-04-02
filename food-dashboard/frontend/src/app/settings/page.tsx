"use client";

import React, { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Clock, 
  Camera, 
  Save, 
  Power, 
  Bell, 
  CheckCircle2,
  ShieldCheck,
  Smartphone,
  Globe,
  Lock,
  MessageSquare,
  ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function SettingsPage() {
  const [isLive, setIsLive] = useState(true);

  return (
    <div className="space-y-10 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight italic uppercase italic">Business Configuration</h2>
          <p className="text-sm font-semibold text-slate-400 mt-1 uppercase tracking-tighter italic font-bold">Manage your shop profile, operations and automation</p>
        </div>
        <button className="bg-primary text-white px-8 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-primary/90 transition-all flex items-center gap-2 shadow-lg shadow-primary/20 active:scale-95">
          <Save size={18} /> Sync Account
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Column: Forms */}
        <div className="lg:col-span-2 space-y-8">
          {/* Basic Profile Section */}
          <section className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-slate-100 shadow-sm space-y-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                 <Building2 size={20} />
              </div>
              <h3 className="text-xl font-black text-slate-800 tracking-tight italic uppercase">Shop Identity</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1 italic font-bold">Business Trade Name</label>
                <input type="text" defaultValue="Suman Lata Bhadola Marg Restaurant" className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs font-bold focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1 italic font-bold">Official Contact</label>
                <div className="relative">
                  <Phone size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="text" defaultValue="+91 98765 43210" className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 pl-12 text-xs font-bold focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all" />
                </div>
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1 italic font-bold">Base Location / Address</label>
                <div className="relative">
                  <MapPin size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="text" defaultValue="Main Market, Suman Lata Bhadola Marg, New Delhi" className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 pl-12 text-xs font-bold focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all" />
                </div>
              </div>
            </div>
          </section>

          {/* New: Advanced Notifications */}
          <section className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-slate-100 shadow-sm space-y-8">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-600">
                  <Bell size={20} />
               </div>
               <h3 className="text-xl font-black text-slate-800 tracking-tight italic uppercase font-bold">Push & Alerts</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {[
                 { title: 'New Order Alerts', desc: 'Instant desktop & mobile ping', icon: Bell, status: true },
                 { title: 'WhatsApp Updates', desc: 'Daily settlement reports', icon: MessageSquare, status: true },
                 { title: 'SMS Backup', desc: 'Critical order failure alerts', icon: Smartphone, status: false },
                 { title: 'Email Invoices', desc: 'Monthly taxable statements', icon: Globe, status: true },
               ].map((item) => (
                 <div key={item.title} className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex items-center justify-between group hover:border-emerald-100 transition-colors">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-emerald-500 shadow-sm transition-colors border border-slate-50"><item.icon size={18} /></div>
                       <div>
                          <p className="text-xs font-black text-slate-800 tracking-tight">{item.title}</p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{item.desc}</p>
                       </div>
                    </div>
                    <button className={`w-10 h-5 rounded-full p-1 transition-all ${item.status ? 'bg-emerald-500 shadow-lg shadow-emerald-500/20' : 'bg-slate-200'}`}>
                       <div className={`w-3 h-3 bg-white rounded-full ${item.status ? 'translate-x-5' : 'translate-x-0'} transition-transform`} />
                    </button>
                 </div>
               ))}
            </div>
          </section>
        </div>

        {/* Right Column: Profile & Security */}
        <div className="space-y-8">
           <section className="bg-slate-900 rounded-[2.5rem] p-10 text-white text-center space-y-6 relative overflow-hidden group shadow-2xl">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-emerald-500" />
              <div className="relative mx-auto w-32 h-32 rounded-3xl bg-white/5 border-2 border-dashed border-white/10 flex items-center justify-center group-hover:border-primary/40 transition-colors">
                 <div className="w-full h-full bg-gradient-to-tr from-primary/20 to-primary/40 flex items-center justify-center text-primary font-black text-4xl italic">DB</div>
                 <button className="absolute -bottom-2 -right-2 w-10 h-10 bg-white shadow-xl rounded-xl flex items-center justify-center text-slate-900 hover:text-primary transition-all">
                    <Camera size={18} />
                 </button>
              </div>
              <div className="space-y-1">
                 <h4 className="text-lg font-black tracking-tight italic">Partner Brand Logo</h4>
                 <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 italic">Identifies you on the main DBI App</p>
              </div>
              <button className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white/60 hover:bg-white hover:text-slate-900 transition-all">Upload New Assets</button>
           </section>

           <section className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm space-y-8">
              <div className="flex items-center gap-2">
                 <Lock className="text-primary" size={18} />
                 <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 italic">Security Layer</h3>
              </div>
              <div className="space-y-6">
                 <div className="flex items-center justify-between group cursor-pointer">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors border border-slate-100"><ShieldCheck size={18} /></div>
                       <span className="text-xs font-black text-slate-800 uppercase tracking-tighter">Account Password</span>
                    </div>
                    <ChevronRight size={16} className="text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                 </div>
                 <div className="pt-6 border-t border-slate-50 text-center">
                    <div className="bg-emerald-500/10 p-4 rounded-3xl border border-dashed border-emerald-500/20">
                       <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest leading-relaxed italic">Two-Factor Authentication is currently protecting your wallet withdrawals.</p>
                    </div>
                 </div>
              </div>
           </section>

           {/* Quick Action: Shop Live Status */}
           <div className={`p-8 rounded-[2.5rem] border flex items-center justify-between transition-all ${isLive ? 'bg-primary/5 border-primary/20' : 'bg-slate-50 border-slate-200 opacity-60'}`}>
              <div>
                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Global Presence</p>
                 <h4 className={`text-sm font-black italic uppercase ${isLive ? 'text-primary' : 'text-slate-400'}`}>{isLive ? 'Live on Map' : 'Hidden from Map'}</h4>
              </div>
              <button 
                onClick={() => setIsLive(!isLive)}
                className={`relative w-12 h-6 rounded-full transition-all duration-300 p-1 flex items-center ${isLive ? 'bg-primary' : 'bg-slate-300'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full shadow-lg ${isLive ? 'translate-x-6' : 'translate-x-0'} transition-transform`} />
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
