"use client";

import React, { useState } from 'react';
import { 
  UserPlus, 
  Users, 
  Shield, 
  Trash2, 
  Edit3, 
  MoreVertical, 
  Mail, 
  Phone, 
  X, 
  CheckCircle2, 
  Circle,
  Clock,
  Briefcase
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MOCK_TEAM = [
  { id: 1, name: 'Amit Kumar', role: 'Store Manager', status: 'Active', phone: '+91 98765 43210', email: 'amit@partner.com' },
  { id: 2, name: 'Suresh Rana', role: 'Head Chef', status: 'Active', phone: '+91 98765 11111', email: 'suresh@partner.com' },
  { id: 3, name: 'Vivek Singh', role: 'Kitchen Staff', status: 'Offline', phone: '+91 98765 22222', email: 'vivek@partner.com' },
  { id: 4, name: 'Rajesh Mehra', role: 'Delivery Lead', status: 'Active', phone: '+91 98765 33333', email: 'rajesh@partner.com' },
];

export default function TeamPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-10 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight italic uppercase italic">Team & Permissions</h2>
          <p className="text-sm font-semibold text-slate-400 mt-1 uppercase tracking-tighter italic font-bold">Manage staff accounts and operational access levels</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary text-white px-8 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-primary/90 transition-all flex items-center gap-2 shadow-lg shadow-primary/20"
        >
          <UserPlus size={18} /> Add Staff Member
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Analytics Card for Team */}
        <div className="lg:col-span-1 space-y-6">
           <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm space-y-8">
              <div className="text-center space-y-4">
                 <div className="w-20 h-20 bg-primary/5 rounded-[2rem] flex items-center justify-center text-primary mx-auto border-2 border-primary/10 shadow-xl shadow-primary/5"><Users size={32} /></div>
                 <div>
                    <h4 className="text-3xl font-black text-slate-800 tracking-tight">04/10</h4>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Total Staff Members</p>
                 </div>
              </div>
              
              <div className="space-y-4 pt-6 border-t border-slate-50">
                 <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-800 italic">Access by Role</h5>
                 {[
                   { role: 'Managers', count: 1, color: 'bg-primary' },
                   { role: 'Kitchen', count: 2, color: 'bg-emerald-500' },
                   { role: 'Delivery', count: 1, color: 'bg-blue-500' },
                 ].map(role => (
                   <div key={role.role} className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                      <span className="text-slate-400">{role.role}</span>
                      <span className={`${role.color} text-white px-2 py-0.5 rounded-md`}>{role.count}</span>
                   </div>
                 ))}
              </div>
           </div>

           <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white space-y-4 overflow-hidden relative">
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl opacity-50" />
              <Shield className="text-primary" size={24} />
              <h3 className="text-sm font-black italic uppercase italic">Enterprise Security</h3>
              <p className="text-[10px] font-bold text-white/40 leading-relaxed uppercase">2FA and biometric auth are available for all sub-manager accounts.</p>
           </div>
        </div>

        {/* Staff Management Table */}
        <div className="lg:col-span-3 space-y-6">
           <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 italic">Active Roster</h3>
                <div className="relative group">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" />
                  <input type="text" placeholder="Search staff..." className="bg-slate-50 border border-slate-100 rounded-xl py-2 px-10 text-[10px] font-black focus:outline-none transition-all" />
                </div>
              </div>

              <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead>
                       <tr className="bg-slate-50/50 text-[10px] font-black uppercase tracking-widest text-slate-400 italic">
                          <th className="px-8 py-6">Member Identity</th>
                          <th className="px-8 py-6">Operational Role</th>
                          <th className="px-8 py-6">Primary Contact</th>
                          <th className="px-8 py-6">Operational Status</th>
                          <th className="px-8 py-6 text-right">Actions</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                       {MOCK_TEAM.map((member, idx) => (
                          <motion.tr 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.05 }}
                            key={member.id} className="hover:bg-slate-50/50 transition-all group"
                          >
                             <td className="px-8 py-6">
                                <div className="flex items-center gap-4">
                                   <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-xs italic text-slate-500 uppercase">{member.name.split(' ').map(n => n[0]).join('')}</div>
                                   <div>
                                      <p className="text-sm font-black text-slate-800 tracking-tight italic uppercase">{member.name}</p>
                                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest italic">{member.email}</p>
                                   </div>
                                </div>
                             </td>
                             <td className="px-8 py-6">
                                <span className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest italic border ${
                                   member.role === 'Store Manager' ? 'bg-primary/5 text-primary border-primary/20' : 
                                   member.role === 'Head Chef' ? 'bg-emerald-50 text-emerald-500 border-emerald-100' : 
                                   'bg-blue-50 text-blue-500 border-blue-100'
                                }`}>
                                   {member.role}
                                </span>
                             </td>
                             <td className="px-8 py-6">
                                <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                                   <Phone size={14} className="text-slate-300" />
                                   {member.phone}
                                </div>
                             </td>
                             <td className="px-8 py-6">
                                <div className="flex items-center gap-2">
                                   <Circle size={8} fill={member.status === 'Active' ? "#10b981" : "#cbd5e1"} className={member.status === 'Active' ? "text-emerald-500 animate-pulse" : "text-slate-300"} />
                                   <span className={`text-[10px] font-black uppercase tracking-widest ${member.status === 'Active' ? 'text-emerald-500' : 'text-slate-400'}`}>{member.status}</span>
                                </div>
                             </td>
                             <td className="px-8 py-6 text-right">
                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                   <button className="p-2 border border-slate-100 rounded-xl text-slate-400 hover:text-primary transition-all shadow-sm"><Edit3 size={16} /></button>
                                   <button className="p-2 border border-slate-100 rounded-xl text-slate-400 hover:text-red-500 transition-all shadow-sm"><Trash2 size={16} /></button>
                                </div>
                             </td>
                          </motion.tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>
        </div>
      </div>

      {/* Modern Add Staff Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
             <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 30 }}
                className="relative bg-white w-full max-w-xl rounded-[3rem] p-10 shadow-2xl overflow-hidden"
             >
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-blue-500" />
                <div className="flex justify-between items-center mb-10">
                   <div>
                      <h3 className="text-2xl font-black text-slate-800 italic uppercase">Onboard New Team Member</h3>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Staff will receive login credentials via SMS</p>
                   </div>
                   <button onClick={() => setIsModalOpen(false)} className="p-2.5 border border-slate-100 rounded-2xl text-slate-400 hover:bg-slate-50"><X size={20} /></button>
                </div>

                <form className="space-y-8">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Full Operational Name</label>
                      <input type="text" placeholder="e.g., Rohit Sharma" className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs font-black focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all" />
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                         <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">System Role</label>
                         <select className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs font-black focus:outline-none transition-all">
                            <option>Store Manager (Admin Support)</option>
                            <option>Head Chef (Menu Support)</option>
                            <option>Kitchen Staff (Order Support)</option>
                            <option>Delivery Fleet (Logistics Support)</option>
                         </select>
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Primary Phone</label>
                         <input type="tel" placeholder="+91 00000 00000" className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs font-black focus:outline-none transition-all" />
                      </div>
                   </div>

                   <div className="pt-6">
                      <button className="w-full py-6 bg-slate-900 text-white rounded-[2.5rem] text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-slate-900/20 active:scale-95 transition-all flex items-center justify-center gap-3">
                         <UserPlus size={18} className="text-primary" /> Confirm Onboarding
                      </button>
                   </div>
                </form>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
