"use client";

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Clock, 
  Calendar, 
  ChevronRight, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  Settings as SettingsIcon,
  LayoutGrid,
  Search,
  Timer
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';

export default function DineoutPage() {
  const [activeTab, setActiveTab] = useState<'bookings' | 'settings'>('bookings');
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<any>(null);
  const [reservations, setReservations] = useState<any[]>([]);
  const [newSlot, setNewSlot] = useState('');
  const [newTable, setNewTable] = useState({ capacity: '', count: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [settingsRes, reservationsRes] = await Promise.all([
        api.get('/dineout/settings'),
        api.get('/dineout/reservations')
      ]);
      setSettings(settingsRes.data || settingsRes); // Fallback for safety
      setReservations(reservationsRes.data || []);
    } catch (err) {
      console.error('Failed to fetch dineout data');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSettings = async (updatedSettings: any) => {
    try {
      const res = await api.put('/dineout/settings', updatedSettings);
      setSettings(res.data || res);
    } catch (err) {
      console.error('Failed to update settings');
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await api.patch(`/dineout/reservations/${id}`, { status });
      setReservations(prev => prev.map(r => r._id === id ? { ...r, status } : r));
    } catch (err) {
      console.error('Failed to update reservation status');
    }
  };

  const timeToMinutes = (timeStr: string) => {
    if (!timeStr) return 0;
    const clean = timeStr.trim().toUpperCase();
    if (clean.includes('AM') || clean.includes('PM')) {
      const parts = clean.split(/\s+/);
      let [hours, minutes] = parts[0].split(':').map(Number);
      const period = parts[1];
      if (period === 'PM' && hours < 12) hours += 12;
      if (period === 'AM' && hours === 12) hours = 0;
      return hours * 60 + (minutes || 0);
    }
    let [hours, minutes] = clean.split(':').map(Number);
    return hours * 60 + (minutes || 0);
  };

  const format24to12 = (time24: string) => {
    if (!time24) return '';
    let [hours, minutes] = time24.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    if (hours > 12) hours -= 12;
    if (hours === 0) hours = 12;
    return `${hours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  const isValidSlot = (time24: string, startStr: string, endStr: string) => {
    const slotMins = timeToMinutes(time24);
    const startMins = timeToMinutes(startStr);
    let endMins = timeToMinutes(endStr);
    if (endMins === 0) endMins = 1440;
    return slotMins >= startMins && slotMins <= endMins;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Dine-in Reservations</h1>
          <p className="text-slate-500 font-medium mt-1">Manage guest bookings and table availability</p>
        </div>
        
        <div className="flex bg-slate-100 p-1 rounded-2xl w-fit">
          <button 
            onClick={() => setActiveTab('bookings')}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'bookings' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Live Bookings
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'settings' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Pricing & Slots
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'bookings' ? (
          <motion.div 
            key="bookings"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { label: 'Total Reservations', value: reservations.length, icon: Calendar, color: 'text-primary bg-primary/5' },
                { label: 'Confirmed Guests', value: reservations.filter(r => r.status === 'Confirmed').reduce((acc, r) => acc + r.guests, 0), icon: Users, color: 'text-emerald-500 bg-emerald-50' },
                { label: 'Pending Requests', value: reservations.filter(r => r.status === 'Pending').length, icon: Timer, color: 'text-amber-500 bg-amber-50' }
              ].map((stat, i) => (
                <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${stat.color}`}>
                    <stat.icon size={24} />
                  </div>
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.label}</div>
                    <div className="text-2xl font-black text-slate-800">{stat.value}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* List */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                <h2 className="font-bold text-slate-800">Recent Guest Bookings</h2>
                <div className="relative">
                  <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Search guests..." 
                    className="bg-slate-50 border-none rounded-xl py-2 pl-10 pr-4 text-sm font-medium w-64 focus:ring-2 focus:ring-primary/10 transition-all"
                  />
                </div>
              </div>

              <div className="divide-y divide-slate-50">
                {reservations.length === 0 ? (
                  <div className="p-12 text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                      <Calendar size={32} />
                    </div>
                    <h3 className="font-bold text-slate-800">No Reservations Yet</h3>
                    <p className="text-slate-500 text-sm mt-1">Bookings from users will appear here</p>
                  </div>
                ) : (
                  reservations.map((booking) => (
                    <div key={booking._id} className="p-6 hover:bg-slate-50/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center font-black text-slate-400">
                          {booking.customerName.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-800">{booking.customerName}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider ${
                              booking.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-600' :
                              booking.status === 'Cancelled' ? 'bg-rose-100 text-rose-600' :
                              'bg-amber-100 text-amber-600'
                            }`}>
                              {booking.status}
                            </span>
                          </div>
                          <div className="text-xs text-slate-500 font-medium mt-0.5 flex items-center gap-3">
                            <span className="flex items-center gap-1"><Users size={12} /> {booking.guests} Guests</span>
                            <span className="flex items-center gap-1"><Clock size={12} /> {booking.timeSlot}</span>
                            <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(booking.date).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {booking.status === 'Pending' && (
                          <>
                            <button 
                              onClick={() => updateStatus(booking._id, 'Confirmed')}
                              className="p-2.5 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors"
                              title="Confirm Booking"
                            >
                              <CheckCircle2 size={18} />
                            </button>
                            <button 
                              onClick={() => updateStatus(booking._id, 'Cancelled')}
                              className="p-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors"
                              title="Decline"
                            >
                              <XCircle size={18} />
                            </button>
                          </>
                        )}
                        <button className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
                          Details
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="settings"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            {/* Shift Operations */}
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6 lg:col-span-2">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-500">
                  <Timer size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">Shift Timings</h3>
                  <p className="text-xs text-slate-500 font-medium">Define your Lunch and Dinner operational windows</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Lunch Shift */}
                <div className="space-y-4 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500" /> Lunch Shift (Before 4 PM)
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between ml-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Opening</label>
                        <span className="text-[8px] font-black uppercase text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded-md border border-emerald-500/20">Synced</span>
                      </div>
                      <input 
                        type="text" 
                        value={settings?.lunchOpening || "11:00 AM"}
                        onChange={(e) => handleUpdateSettings({ ...settings, lunchOpening: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs font-bold focus:ring-2 focus:ring-primary/10 transition-all outline-none"
                        placeholder="11:00 AM"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Closing</label>
                      <input 
                        type="text" 
                        value={settings?.lunchClosing || "04:00 PM"}
                        onChange={(e) => handleUpdateSettings({ ...settings, lunchClosing: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs font-bold focus:ring-2 focus:ring-primary/10 transition-all outline-none"
                        placeholder="04:00 PM"
                      />
                    </div>
                  </div>
                </div>

                {/* Dinner Shift */}
                <div className="space-y-4 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-500" /> Dinner Shift (After 6 PM)
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Opening</label>
                      <input 
                        type="text" 
                        value={settings?.dinnerOpening || "06:00 PM"}
                        onChange={(e) => handleUpdateSettings({ ...settings, dinnerOpening: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs font-bold focus:ring-2 focus:ring-primary/10 transition-all outline-none"
                        placeholder="06:00 PM"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between ml-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Closing</label>
                        <span className="text-[8px] font-black uppercase text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded-md border border-emerald-500/20">Synced</span>
                      </div>
                      <input 
                        type="text" 
                        value={settings?.dinnerClosing || "11:00 PM"}
                        onChange={(e) => handleUpdateSettings({ ...settings, dinnerClosing: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs font-bold focus:ring-2 focus:ring-primary/10 transition-all outline-none"
                        placeholder="11:00 PM"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Slots Management */}
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-8 lg:col-span-2">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center text-primary">
                  <Clock size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">Time Slots Management</h3>
                  <p className="text-xs text-slate-500 font-medium">Define dining sessions for each shift</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Lunch Slots */}
                <div className="space-y-6">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-amber-500 bg-amber-50 px-3 py-1.5 rounded-lg w-fit">Lunch Sessions</h4>
                  
                  <div className="flex gap-2">
                    <input 
                      type="time" 
                      id="lunch_slot_input"
                      className="flex-1 bg-slate-50 border-none rounded-xl p-3 text-sm font-medium focus:ring-2 focus:ring-primary/10"
                    />
                    <button 
                      onClick={() => {
                        const input = document.getElementById('lunch_slot_input') as HTMLInputElement;
                        if (!input.value) return;
                        
                        if (!isValidSlot(input.value, settings.lunchOpening, settings.lunchClosing)) {
                          alert(`Lunch slots must be between ${settings.lunchOpening} and ${settings.lunchClosing}`);
                          return;
                        }

                        const formatted = format24to12(input.value);
                        if (settings.lunchSlots?.includes(formatted)) {
                           alert("Slot already exists");
                           return;
                        }

                        handleUpdateSettings({ ...settings, lunchSlots: [...(settings.lunchSlots || []), formatted] });
                        input.value = '';
                      }}
                      className="bg-amber-500 text-white p-3 rounded-xl hover:bg-amber-600 transition-colors"
                    >
                      <Plus size={20} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[...(settings?.lunchSlots || [])]
                      .sort((a, b) => timeToMinutes(a) - timeToMinutes(b))
                      .map((slot: string, i: number) => (
                        <div key={i} className="bg-slate-50 p-3 rounded-xl flex items-center justify-between group">
                          <span className="text-sm font-bold text-slate-700">{slot}</span>
                          <button 
                            onClick={() => {
                              const updated = settings.lunchSlots.filter((s: string) => s !== slot);
                              handleUpdateSettings({ ...settings, lunchSlots: updated });
                            }}
                            className="text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Dinner Slots */}
                <div className="space-y-6">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-500 bg-indigo-50 px-3 py-1.5 rounded-lg w-fit">Dinner Sessions</h4>
                  
                  <div className="flex gap-2">
                    <input 
                      type="time" 
                      id="dinner_slot_input"
                      className="flex-1 bg-slate-50 border-none rounded-xl p-3 text-sm font-medium focus:ring-2 focus:ring-primary/10"
                    />
                    <button 
                      onClick={() => {
                        const input = document.getElementById('dinner_slot_input') as HTMLInputElement;
                        if (!input.value) return;

                        if (!isValidSlot(input.value, settings.dinnerOpening, settings.dinnerClosing)) {
                          alert(`Dinner slots must be between ${settings.dinnerOpening} and ${settings.dinnerClosing}`);
                          return;
                        }

                        const formatted = format24to12(input.value);
                        if (settings.dinnerSlots?.includes(formatted)) {
                           alert("Slot already exists");
                           return;
                        }

                        handleUpdateSettings({ ...settings, dinnerSlots: [...(settings.dinnerSlots || []), formatted] });
                        input.value = '';
                      }}
                      className="bg-indigo-500 text-white p-3 rounded-xl hover:bg-indigo-600 transition-colors"
                    >
                      <Plus size={20} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[...(settings?.dinnerSlots || [])]
                      .sort((a, b) => timeToMinutes(a) - timeToMinutes(b))
                      .map((slot: string, i: number) => (
                        <div key={i} className="bg-slate-50 p-3 rounded-xl flex items-center justify-between group">
                          <span className="text-sm font-bold text-slate-700">{slot}</span>
                          <button 
                            onClick={() => {
                              const updated = settings.dinnerSlots.filter((s: string) => s !== slot);
                              handleUpdateSettings({ ...settings, dinnerSlots: updated });
                            }}
                            className="text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>

            {/* General Policy */}
            <div className="lg:col-span-2 bg-slate-900 p-8 rounded-[2rem] text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <SettingsIcon size={120} />
              </div>
              <div className="relative z-10 max-w-lg">
                <h3 className="text-xl font-bold mb-2">Booking Policy</h3>
                <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                  {settings?.autoConfirm 
                    ? "Bookings are automatically confirmed for available slots by default. You can manually decline requests from the Live Bookings panel if the store is busy."
                    : "Bookings will remain 'Pending' until you manually confirm them from the Live Bookings panel. Use this for strict crowd management."
                  }
                </p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${settings?.autoConfirm ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                    <span className="text-xs font-bold">
                      {settings?.autoConfirm ? 'Auto-Confirmation Active' : 'Manual Confirmation Required'}
                    </span>
                  </div>
                  <button 
                    onClick={() => handleUpdateSettings({ ...settings, autoConfirm: !settings?.autoConfirm })}
                    className="text-xs font-black uppercase tracking-widest text-primary hover:text-primary/80 transition-colors"
                  >
                    Change Policy
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
