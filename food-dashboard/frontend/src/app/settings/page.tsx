"use client";

import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Clock, 
  Camera, 
  Save, 
  Bell, 
  ShieldCheck,
  Smartphone,
  Globe,
  Lock,
  MessageSquare,
  ChevronRight,
  Printer,
  Plus,
  X
} from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<any>(null);
  const [isLive, setIsLive] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await api.get('/settings');
      setSettings(data);
      setIsLive(data.storeDetails?.isLive ?? true);
    } catch (err) {
      console.error('Failed to fetch settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put('/settings', settings);
      alert('Settings saved successfully!');
    } catch (err) {
      console.error('Failed to save settings');
    }
  };

  const handleToggleAutomation = async (key: string) => {
    try {
      const newSettings = {
        ...settings,
        automation: {
          ...settings.automation,
          [key]: !settings.automation[key]
        }
      };
      setSettings(newSettings);
      await api.put('/settings', newSettings);
    } catch (err) {
      console.error('Failed to toggle automation');
      fetchData();
    }
  };

  if (loading) {
    return (
       <div className="flex items-center justify-center h-[80vh]">
         <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
       </div>
    );
  }

  return (
    <div className="space-y-10 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight italic uppercase">Business Configuration</h2>
          <p className="text-sm font-semibold text-slate-400 mt-1 uppercase tracking-tighter italic font-bold">Manage your shop profile, operations and automation</p>
        </div>
        <button 
          onClick={handleSave}
          className="bg-primary text-white px-8 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-primary/90 transition-all flex items-center gap-2 shadow-lg shadow-primary/20 active:scale-95"
        >
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
                <input 
                  type="text" 
                  value={settings?.businessName || ""} 
                  onChange={(e) => setSettings({ ...settings, businessName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs font-bold focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1 italic font-bold">Official Contact</label>
                <div className="relative">
                  <Phone size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text" 
                    value={settings?.contact || ""} 
                    onChange={(e) => setSettings({ ...settings, contact: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 pl-12 text-xs font-bold focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all" 
                  />
                </div>
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1 italic font-bold">Base Location / Address</label>
                <div className="relative">
                  <MapPin size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text" 
                    value={settings?.address || ""} 
                    onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 pl-12 text-xs font-bold focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all" 
                  />
                </div>
              </div>
            </div>
          </section>

          {/* New: Advanced Kitchen Controls & Automation */}
          <section className="bg-slate-900 rounded-[2.5rem] p-8 md:p-10 text-white shadow-2xl space-y-8 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
             <div className="flex items-center gap-3 relative z-10">
                <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary border border-primary/20">
                   <Clock size={20} />
                </div>
                <h3 className="text-xl font-black italic uppercase tracking-tight">Kitchen Operations</h3>
             </div>

             <div className="grid grid-cols-1 gap-8 relative z-10 w-full">
                {/* Business Hours */}
                <div className="space-y-4">
                   <div className="flex items-center justify-between">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 italic font-bold">Daily Operation Matrix</p>
                      <div className="flex items-center gap-2 text-[8px] font-black uppercase text-primary bg-primary/10 px-2 py-1 rounded-lg">
                        <Plus size={10} /> Shift Synced from DBI
                      </div>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                      {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => {
                         const shifts = settings?.businessHours?.[day] || [];
                         return (
                         <div key={day} className="bg-white/5 p-4 rounded-3xl border border-white/5 hover:border-primary/20 transition-all group space-y-3">
                            <div className="flex items-center justify-between">
                               <span className="text-[10px] font-black text-white/80 uppercase tracking-widest">{day}</span>
                               <button type="button" onClick={() => {
                                  const newSettings = { ...settings };
                                  if (!newSettings.businessHours) newSettings.businessHours = {};
                                  if (!newSettings.businessHours[day]) newSettings.businessHours[day] = [];
                                  newSettings.businessHours[day].push({ from: '09:00 AM', to: '05:00 PM' });
                                  setSettings(newSettings);
                               }} className="text-[8px] font-black text-primary uppercase tracking-widest flex items-center gap-1 hover:bg-white/10 px-2 py-1 rounded-lg transition-all border border-primary/20">
                                  <Plus size={10} /> Add Shift
                               </button>
                            </div>
                            <div className="flex flex-col gap-3">
                               {shifts.length === 0 ? (
                                  <div className="text-[10px] font-black uppercase tracking-widest text-red-400 bg-red-500/10 px-3 py-2 rounded-xl text-center">Closed</div>
                               ) : shifts.map((shift: any, idx: number) => (
                                 <div key={idx} className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                                    <span className="text-[8px] font-black text-white/30 uppercase">Shift {idx + 1}</span>
                                    <input type="text" value={shift.from} onChange={(e) => {
                                        const newSettings = {...settings};
                                        newSettings.businessHours[day][idx].from = e.target.value;
                                        setSettings(newSettings);
                                    }} className="bg-transparent border-b border-white/10 w-20 text-[9px] font-black text-center focus:border-primary outline-none text-primary" />
                                    <span className="text-white/20 text-[8px] font-black">TO</span>
                                    <input type="text" value={shift.to} onChange={(e) => {
                                        const newSettings = {...settings};
                                        newSettings.businessHours[day][idx].to = e.target.value;
                                        setSettings(newSettings);
                                    }} className="bg-transparent border-b border-white/20 w-20 text-[9px] font-black text-center focus:border-primary outline-none text-primary" />
                                    <button onClick={() => {
                                        const newSettings = {...settings};
                                        newSettings.businessHours[day].splice(idx, 1);
                                        setSettings(newSettings);
                                    }} className="text-white/20 hover:text-red-400 transition-colors ml-auto"><X size={12} /></button>
                                 </div>
                               ))}
                            </div>
                         </div>
                      )})}
                   </div>
                </div>
             </div>
          </section>

          {/* Compliance & Tax */}
          <section className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-slate-100 shadow-sm space-y-8">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-600">
                   <ShieldCheck size={20} />
                </div>
                <h3 className="text-xl font-black text-slate-800 tracking-tight italic uppercase font-bold">Compliance & Returns</h3>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic font-bold">GSTIN Number</label>
                   <input 
                     type="text" 
                     value={settings?.gstin || ""} 
                     onChange={(e) => setSettings({ ...settings, gstin: e.target.value })}
                     placeholder="07XXXXX1234F1Z5" 
                     className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs font-bold focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all" 
                   />
                 </div>
                 <div className="space-y-2 relative">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic font-bold flex justify-between">
                     FSSAI License ID
                   </label>
                   {settings?.fssai ? (
                     <div className="flex items-center gap-2 w-full bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-2xl p-4 text-xs font-black tracking-widest">
                        <ShieldCheck size={16} /> FSSAI: {settings.fssai}
                     </div>
                   ) : (
                     <input 
                       type="text" 
                       value={settings?.fssai || ""} 
                       disabled
                       placeholder="Submit via Popup to verify" 
                       className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs font-bold focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all opacity-70" 
                     />
                   )}
                 </div>
                 <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-[#E03546] italic font-bold">GST Percentage (%)</label>
                   <input 
                     type="number" 
                     value={settings?.taxPercentage ?? ""} 
                     onChange={(e) => {
                        const val = e.target.value === "" ? 0 : parseFloat(e.target.value);
                        setSettings({ ...settings, taxPercentage: val });
                     }}
                     className="w-full bg-[#E03546]/5 border border-[#E03546]/10 rounded-2xl p-4 text-xs font-black text-[#E03546] focus:outline-none focus:ring-4 focus:ring-[#E03546]/5 transition-all" 
                   />
                 </div>
                 <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-[#E03546] italic font-bold">Res. Charges (₹)</label>
                   <input 
                     type="number" 
                     value={settings?.restaurantCharges ?? ""} 
                     onChange={(e) => {
                        const val = e.target.value === "" ? 0 : parseFloat(e.target.value);
                        setSettings({ ...settings, restaurantCharges: val });
                     }}
                     className="w-full bg-[#E03546]/5 border border-[#E03546]/10 rounded-2xl p-4 text-xs font-black text-[#E03546] focus:outline-none focus:ring-4 focus:ring-[#E03546]/5 transition-all" 
                   />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-emerald-500 italic font-bold">Booking Fee (₹ / Person)</label>
                    <input 
                      type="number" 
                      value={settings?.dineoutBookingFee ?? ""} 
                      onChange={(e) => {
                         const val = e.target.value === "" ? 0 : parseFloat(e.target.value);
                         setSettings({ ...settings, dineoutBookingFee: val });
                      }}
                      className="w-full bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-4 text-xs font-black text-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all" 
                    />
                 </div>
             </div>

             <div className="flex justify-end pt-4">
                <button 
                  onClick={handleSave}
                  className="bg-[#E03546] text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#c32d3d] transition-all flex items-center gap-2 shadow-lg shadow-red-500/10 active:scale-95"
                >
                  <Save size={14} /> Update Tax & Charges
                </button>
             </div>
          </section>
        </div>

        {/* Right Column Profile */}
        <div className="space-y-8">
           <section className="bg-slate-900 rounded-[2.5rem] p-10 text-white text-center space-y-6 relative overflow-hidden group shadow-2xl">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-emerald-500" />
              <div className="relative mx-auto w-32 h-32 rounded-3xl bg-white/5 border-2 border-dashed border-white/10 flex items-center justify-center overflow-hidden">
                 {settings?.coverPhotoUrl ? (
                   <img src={settings.coverPhotoUrl} alt="Cover" className="w-full h-full object-cover" />
                 ) : (
                   <div className="w-full h-full bg-gradient-to-tr from-primary/20 to-primary/40 flex items-center justify-center text-primary font-black text-4xl italic">
                     {settings?.businessName?.slice(0, 2).toUpperCase() || 'DB'}
                   </div>
                 )}
                 <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white/10 backdrop-blur-md shadow-xl rounded-xl flex items-center justify-center text-slate-400">
                    <ShieldCheck size={18} />
                 </div>
              </div>
              <div className="space-y-1">
                 <h4 className="text-lg font-black tracking-tight italic">Partner Brand Logo</h4>
                 <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400 italic">Synced via Main DBI App</p>
              </div>
              <div className="block w-full py-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-[10px] font-black uppercase tracking-widest text-emerald-500 text-center">
                 Externally Managed
              </div>
           </section>
        </div>
      </div>
    </div>
  );
}
