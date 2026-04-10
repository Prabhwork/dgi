"use client";

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  CheckCircle2,
  IndianRupee, 
  Plus, 
  Search, 
  ChevronRight,
  X,
  User,
  ShieldCheck,
  Wallet,
  TrendingDown,
  TrendingUp,
  Clock,
  Edit3,
  Trash2,
  Check,
  Ban,
  CreditCard,
  Banknote,
  Hash,
  AtSign,
  CalendarDays,
  AlertTriangle,
  FileText,
  Briefcase,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';

export default function TeamPage() {
  const [staff, setStaff] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSettleModalOpen, setIsSettleModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<any>(null);
  const [editingStaff, setEditingStaff] = useState<any>(null);
  const [settlingStaff, setSettlingStaff] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [attendanceHistory, setAttendanceHistory] = useState<any[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Online'>('Cash');
  const [utr, setUtr] = useState('');

  // New Staff State
  const [newStaff, setNewStaff] = useState({
    name: '',
    role: '',
    salary: '',
    phone: '',
    joined: new Date().toISOString().split('T')[0],
    allowedLeaves: '2',
    bankAccount: '',
    upiId: '',
    advance: '0'
  });

  // Period Selection
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const fetchStaffAndStats = async () => {
    try {
      setLoading(true);
      const data = await api.get(`/staff/meta/payroll?month=${selectedMonth}&year=${selectedYear}`);
      setStats(data);
      setStaff(data.staff || []);
    } catch (err) {
      console.error('Failed to fetch staff data');
    } finally {
      setLoading(false);
    }
  };

  const fetchStaffHistory = async (staffId: string) => {
    try {
      const data = await api.get(`/staff/${staffId}/attendance?month=${selectedMonth}&year=${selectedYear}`);
      setAttendanceHistory(data);
    } catch (err) {
      console.error('Failed to fetch history');
    }
  };

  useEffect(() => {
    fetchStaffAndStats();
  }, [selectedMonth, selectedYear]);

  const updateAttendance = async (id: string, status: string) => {
    try {
      await api.put(`/staff/${id}/attendance`, { status });
      fetchStaffAndStats();
    } catch (err) {
      console.error('Update failed');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/staff', {
        ...newStaff,
        salary: Number(newStaff.salary),
        allowedLeaves: Number(newStaff.allowedLeaves),
        advance: Number(newStaff.advance)
      });
      setIsAddModalOpen(false);
      setNewStaff({ name: '', role: '', salary: '', phone: '', joined: new Date().toISOString().split('T')[0], allowedLeaves: '2', bankAccount: '', upiId: '', advance: '0' });
      fetchStaffAndStats();
    } catch (err) {
      console.error('Registration failed');
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put(`/staff/${editingStaff._id}`, {
        ...editingStaff,
        salary: Number(editingStaff.salary),
        allowedLeaves: Number(editingStaff.allowedLeaves),
        advance: Number(editingStaff.advance || 0)
      });
      setIsEditModalOpen(false);
      fetchStaffAndStats();
    } catch (err) {
      console.error('Edit failed');
    }
  };

  const handleSuspend = async (staffId: string) => {
    if (!window.confirm("Suspend Member? This will preserve their history but remove them from active duties.")) return;
    try {
      await api.delete(`/staff/${staffId}`);
      fetchStaffAndStats();
    } catch (err) {
      console.error('Suspend failed');
    }
  };

  const handleSettlement = async () => {
    if (paymentMethod === 'Online' && !utr) {
      alert('Please enter Transaction ID / UTR for online payment.');
      return;
    }
    try {
      await api.post(`/staff/${settlingStaff._id}/settle`, {
        amount: settlingStaff.netSalary,
        month: selectedMonth,
        year: selectedYear,
        paymentMethod,
        absences: settlingStaff.paidLeaves,
        deduction: (settlingStaff.earnings - settlingStaff.netSalary),
        transactionId: utr
      });
      setIsSettleModalOpen(false);
      setSettlingStaff(null);
      setUtr('');
      alert('Salary Disbursed & Record Locked!');
      fetchStaffAndStats();
    } catch (err: any) {
      alert(err.message || 'Settlement failed');
    }
  };

  const getDaysInMonth = (month: number, year: number) => {
    return new Array(new Date(year, month, 0).getDate()).fill(null).map((_, i) => i + 1);
  };

  const isPeriodValid = (staffObj: any) => {
    if (!staffObj.joined) return true;
    const joinedDate = new Date(staffObj.joined);
    const selectedDate = new Date(selectedYear, selectedMonth - 1, 1);
    return selectedDate >= new Date(joinedDate.getFullYear(), joinedDate.getMonth(), 1);
  };

  if (loading && !stats) {
    return <div className="flex items-center justify-center h-[80vh]"><div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-800 tracking-tight italic uppercase">Team Console</h2>
          <div className="flex items-center gap-3 mt-1">
             <p className="text-[10px] font-black text-slate-800 uppercase tracking-[0.2em] border-l-2 border-primary pl-4">Earned-Salary Audit & Reconciliation</p>
          </div>
        </div>
        <div className="flex gap-3">
          <div className="flex items-center bg-white border border-slate-100 rounded-2xl p-1 shadow-sm shrink-0">
             <select value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))} className="bg-transparent text-[10px] font-black uppercase tracking-widest px-4 py-3 focus:outline-none cursor-pointer border-r border-slate-50">
                {months.map((m, i) => <option key={m} value={i+1}>{m}</option>)}
             </select>
             <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))} className="bg-transparent text-[10px] font-black uppercase tracking-widest px-4 py-3 focus:outline-none cursor-pointer">
                <option>2026</option>
                <option>2025</option>
             </select>
          </div>
          <button onClick={() => setIsAddModalOpen(true)} className="bg-slate-900 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-900/10 hover:bg-primary transition-all flex items-center gap-3 active:scale-95">
            <Plus size={18} /> Register Staff
          </button>
        </div>
      </div>

      {/* Roster Table */}
      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-50/30">
           <div className="flex items-center gap-4">
              <h3 className="text-xl font-black text-slate-800 italic uppercase">Payroll Journal - {months[selectedMonth-1]}</h3>
              <div className="bg-primary/10 text-primary text-[9px] font-black px-3 py-1 rounded-full uppercase">Pay-By-Work Policy</div>
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-white">
                <th className="text-left py-6 px-8 text-[10px] font-black uppercase tracking-widest text-slate-800 border-b border-slate-50">Personnel</th>
                <th className="text-left py-6 px-8 text-[10px) font-black uppercase tracking-widest text-slate-800 border-b border-slate-50">Daily Logic</th>
                <th className="text-left py-6 px-8 text-[10px] font-black uppercase tracking-widest text-slate-800 border-b border-slate-50">Earned Days</th>
                <th className="text-left py-6 px-8 text-[10px] font-black uppercase tracking-widest text-slate-800 border-b border-slate-50">Net Pay Due</th>
                <th className="text-left py-6 px-8 text-[10px] font-black uppercase tracking-widest text-slate-800 border-b border-slate-50">Status</th>
                <th className="text-right py-6 px-8 text-[10px] font-black uppercase tracking-widest text-slate-800 border-b border-slate-50">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {staff.map((member) => (
                <tr key={member._id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="py-6 px-8">
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-800 font-black text-xs uppercase">{member.name.substring(0, 2)}</div>
                        <div>
                           <p className="text-sm font-black text-slate-800 uppercase italic leading-none">{member.name}</p>
                           <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase">{member.role}</p>
                        </div>
                     </div>
                  </td>
                  <td className="py-6 px-8">
                     <select 
                       value={member.status} 
                       onChange={(e) => updateAttendance(member._id, e.target.value)}
                       className={`text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-xl focus:outline-none cursor-pointer border-2
                        ${member.status === 'Present' ? 'bg-emerald-500 text-white border-emerald-600' : 
                          member.status === 'Leave' ? 'bg-slate-800 text-white border-slate-900' : 
                          member.status === 'Uninformed' ? 'bg-red-500 text-white border-red-600' : 
                          'bg-white text-slate-400 border-slate-100'}`}
                     >
                        <option value="None">No Selection</option>
                        <option value="Present">Present</option>
                        <option value="Leave">Leave (Excused)</option>
                        <option value="Uninformed">Absent (Direct Cut)</option>
                     </select>
                  </td>
                  <td className="py-6 px-8">
                     <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-black text-slate-800 uppercase">
                           {member.totalPaidDays || 0} / {new Date(selectedYear, selectedMonth, 0).getDate()} Days
                        </span>
                        <div className="flex gap-2">
                           <span className="text-[8px] font-black text-emerald-600 uppercase">W: {member.presentDays || 0}</span>
                           <span className="text-[8px] font-black text-primary uppercase">PL: {member.paidLeaves || 0}</span>
                        </div>
                     </div>
                  </td>
                  <td className="py-6 px-8">
                      <p className="text-sm font-black text-slate-800">₹{(member.netSalary || 0).toLocaleString()}</p>
                  </td>
                  <td className="py-6 px-8">
                      {member.isSettled ? (
                        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 text-emerald-600 px-3 py-1 rounded-lg w-fit">
                           <CheckCircle2 size={12} />
                           <span className="text-[10px] font-black uppercase">Settled</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 bg-slate-100 text-slate-700 px-3 py-1 rounded-lg w-fit">
                           <Clock size={12} />
                           <span className="text-[10px] font-black uppercase italic">Pending</span>
                        </div>
                      )}
                  </td>
                  <td className="py-6 px-8 text-right">
                      <div className="flex items-center justify-end gap-2 text-slate-800">
                         <button onClick={() => { setEditingStaff({ ...member, salary: member.salary.toString(), allowedLeaves: (member.allowedLeaves || 2).toString(), advance: (member.advance || 0).toString() }); setIsEditModalOpen(true); }} className="p-2.5 hover:text-primary transition-all shadow-sm bg-white border border-slate-50 rounded-lg"><Edit3 size={16} /></button>
                         <button onClick={() => handleSuspend(member._id)} className="p-2.5 hover:text-red-500 transition-all shadow-sm bg-white border border-slate-50 rounded-lg"><Ban size={16} /></button>
                         <button 
                            onClick={() => { setSelectedStaff(member); fetchStaffHistory(member._id); }} 
                            className={`p-2.5 transition-all shadow-sm border border-slate-50 rounded-lg ${member.isSettled ? 'bg-emerald-50 text-emerald-500' : 'bg-white hover:text-primary'}`}
                         >
                            <ChevronRight size={18} />
                         </button>
                      </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail / Settle Modal */}
      <AnimatePresence>
        {selectedStaff && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedStaff(null)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div 
               initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
               className="relative bg-white w-full max-w-6xl rounded-[3rem] p-0 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
               <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                  <div className="flex items-center gap-6">
                     <div className="w-16 h-16 bg-primary rounded-3xl flex items-center justify-center text-white"><Briefcase size={32} /></div>
                     <div>
                        <h3 className="text-2xl font-black text-slate-800 italic uppercase leading-none">{selectedStaff.name}</h3>
                        <p className="text-[10px] font-black text-slate-800 uppercase tracking-widest mt-1">Audit Record • <span className="text-primary">{selectedStaff._id}</span></p>
                     </div>
                  </div>
                  <X className="text-slate-400 cursor-pointer" onClick={() => setSelectedStaff(null)} />
               </div>

               <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
                  {/* Settlement Panel */}
                  <div className="w-full lg:w-96 bg-slate-50 p-10 border-r border-slate-100 overflow-y-auto">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-800 italic mb-8 block font-black">Earning Audit ({months[selectedMonth-1]})</label>
                     
                     <div className="space-y-8">
                        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden text-center">
                           <p className="text-[9px] font-black text-slate-400 uppercase italic">Net Accrued Income</p>
                           <h4 className="text-4xl font-black text-slate-800 italic uppercase mt-2">₹{(selectedStaff.netSalary || 0).toLocaleString()}</h4>
                           <div className="mt-4 flex justify-center items-center gap-2 text-[10px] font-black text-emerald-600 bg-emerald-50 py-2 px-4 rounded-xl w-fit mx-auto uppercase">
                             <Zap size={12} /> {selectedStaff.totalPaidDays} Paid Days
                           </div>
                        </div>

                        {!selectedStaff.isSettled ? (
                           <>
                             {!isPeriodValid(selectedStaff) ? (
                               <div className="p-6 bg-red-50 border border-red-100 rounded-3xl text-center">
                                  <Ban className="text-red-500 mx-auto mb-2" size={24} />
                                  <p className="text-[10px] font-black text-red-500 uppercase">Invalid Data</p>
                                  <p className="text-[9px] text-red-400 mt-1 uppercase italic leading-tight font-black">Audit failed: Prior to join date.</p>
                                </div>
                             ) : (
                               <>
                                 <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase text-slate-800 italic font-black">Authorize Method</label>
                                    <div className="grid grid-cols-2 gap-4">
                                       <button onClick={() => setPaymentMethod('Cash')} className={`p-6 rounded-3xl border transition-all flex flex-col items-center gap-3 ${paymentMethod === 'Cash' ? 'bg-primary text-white border-primary shadow-xl shadow-primary/20 scale-[1.02]' : 'bg-white text-slate-800 border-slate-100 opacity-60'}`}>
                                          <Banknote size={24} /><span className="text-[9px] font-black uppercase">Cash</span>
                                       </button>
                                       <button onClick={() => setPaymentMethod('Online')} className={`p-6 rounded-3xl border transition-all flex flex-col items-center gap-3 ${paymentMethod === 'Online' ? 'bg-primary text-white border-primary shadow-xl shadow-primary/20 scale-[1.02]' : 'bg-white text-slate-800 border-slate-100 opacity-60'}`}>
                                          <CreditCard size={24} /><span className="text-[9px] font-black uppercase">Online</span>
                                       </button>
                                    </div>
                                 </div>

                                 {/* Beneficiary Info */}
                                 {paymentMethod === 'Online' && (
                                    <div className="space-y-6">
                                       <div className="bg-slate-900 p-6 rounded-3xl text-white shadow-xl">
                                          <label className="text-[9px] font-black uppercase text-primary/70 mb-3 block italic tracking-widest underline decoration-primary/30 underline-offset-4 font-black italic font-black">Verified Payout Target</label>
                                          <div className="space-y-4">
                                             <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-primary"><Hash size={14} /></div>
                                                <div className="flex-1">
                                                   <p className="text-[8px] font-black text-white/40 uppercase">Account</p>
                                                   <p className="text-xs font-black tracking-widest">{selectedStaff.bankAccount || 'ST-SYSTEM: NULL'}</p>
                                                </div>
                                             </div>
                                             <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-emerald-400"><AtSign size={14} /></div>
                                                <div className="flex-1">
                                                   <p className="text-[8px] font-black text-white/40 uppercase">UPI Index</p>
                                                   <p className="text-xs font-black tracking-widest">{selectedStaff.upiId || 'ST-SYSTEM: NULL'}</p>
                                                </div>
                                             </div>
                                          </div>
                                       </div>
                                       <div className="space-y-2">
                                          <label className="text-[10px] font-black uppercase text-slate-800 font-black">Log Transaction ID</label>
                                          <input 
                                             type="text" 
                                             placeholder="Bank Audit Code..." 
                                             value={utr}
                                             onChange={(e) => setUtr(e.target.value)}
                                             className="w-full bg-white border border-slate-200 rounded-2xl p-4 text-xs font-bold focus:ring-4 focus:ring-primary/5 focus:outline-none" 
                                          />
                                       </div>
                                    </div>
                                 )}

                                 <button onClick={() => { setSettlingStaff(selectedStaff); setIsSettleModalOpen(true); }} className="w-full py-5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-900/20 hover:bg-primary transition-all">
                                    Release Accrued Payment
                                 </button>
                               </>
                             )}
                           </>
                        ) : (
                           <div className="bg-emerald-500 p-8 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden">
                              <div className="relative z-10 text-center">
                                 <CheckCircle2 size={40} className="mx-auto mb-4" />
                                 <p className="text-[11px] font-black uppercase italic tracking-[0.2em]">Audit Finalized</p>
                                 <p className="text-xs font-bold text-white/80 mt-2 uppercase italic tracking-tighter">
                                    Disbursed via {selectedStaff.settlementDetails?.paymentMethod}
                                 </p>
                                 {selectedStaff.settlementDetails?.transactionId && (
                                    <div className="mt-4 pt-4 border-t border-white/20">
                                       <p className="text-[8px] font-black uppercase opacity-60 mb-1">Audit Record (UTR)</p>
                                       <p className="text-xs font-black tracking-widest">{selectedStaff.settlementDetails.transactionId}</p>
                                    </div>
                                 )}
                              </div>
                              <IndianRupee className="absolute -bottom-8 -right-8 text-white/10" size={120} />
                           </div>
                        )}
                        
                        {/* Earning Breakdown Summary */}
                        <div className="space-y-4 pt-6 border-t border-slate-100">
                           <div className="flex justify-between text-[10px] font-black uppercase text-slate-600 italic">
                             <span>Daily Accrual Rate</span>
                             <span className="text-slate-800">₹{(Math.round(selectedStaff.salary / 30)).toLocaleString()} / Day</span>
                           </div>
                           <div className="flex justify-between text-[10px] font-black uppercase text-slate-800 italic underline decoration-emerald-500 underline-offset-4">
                             <span>Gross Earnings ({selectedStaff.totalPaidDays}D)</span>
                             <span className="text-slate-800">₹{selectedStaff.earnings?.toLocaleString()}</span>
                           </div>
                           {selectedStaff.advance > 0 && (
                             <div className="flex justify-between text-[10px] font-black uppercase text-red-500 italic font-black">
                               <span>Advance Deduction</span>
                               <span>- ₹{selectedStaff.advance?.toLocaleString()}</span>
                             </div>
                           )}
                        </div>
                     </div>
                  </div>

                  {/* Right Panel: Daily Journal */}
                  <div className="flex-1 p-10 bg-white overflow-y-auto">
                     <div className="flex items-center gap-4 mb-10">
                        <CalendarDays className="text-primary" />
                        <h4 className="text-xl font-black text-slate-800 italic uppercase font-black">Workforce Audit Journal</h4>
                     </div>
                      <div className="grid grid-cols-7 gap-4">
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => <div key={d} className="text-center text-[9px] font-black uppercase text-slate-800 tracking-widest font-black">{d}</div>)}
                        
                        {/* Empty slots to align the 1st day of the month */}
                        {Array.from({ length: (new Date(selectedYear, selectedMonth - 1, 1).getDay() === 0 ? 6 : new Date(selectedYear, selectedMonth - 1, 1).getDay() - 1) }).map((_, i) => (
                          <div key={`empty-${i}`} className="aspect-square" />
                        ))}

                        {getDaysInMonth(selectedMonth, selectedYear).map(day => {
                           const log = attendanceHistory.find(l => { 
                             const d = new Date(l.date); 
                             return d.getDate() === day && (d.getMonth()+1) === selectedMonth;
                           });
                           const status = log ? log.status : 'None';
                           return (
                              <div key={day} className={`aspect-square rounded-[1.5rem] border flex flex-col items-center justify-center gap-1 transition-all
                                ${status === 'Present' ? 'bg-emerald-500 border-emerald-600' : 
                                  status === 'Leave' ? 'bg-slate-800 border-slate-900' : 
                                  status === 'Uninformed' ? 'bg-red-500 border-red-600' : 'bg-slate-50 border-slate-100 opacity-40'}`}>
                                 <span className={`text-[10px] font-black ${status !== 'None' ? 'text-white' : 'text-slate-800'}`}>{day}</span>
                                 {status === 'Present' ? <Check size={14} className="text-white" /> : 
                                  status === 'Leave' ? <FileText size={12} className="text-white opacity-40" /> :
                                  status === 'Uninformed' ? <X size={14} className="text-white" /> : <Clock size={12} className="text-slate-200" />}
                              </div>
                           );
                        })}
                      </div>

                     <div className="mt-12 flex gap-8 items-center border-t pt-8">
                        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500"/><span className="text-[9px] font-black uppercase text-slate-800 font-black">Paid Day</span></div>
                        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-slate-800"/><span className="text-[9px] font-black uppercase text-slate-800 font-black">Approved (Paid)</span></div>
                        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500"/><span className="text-[9px] font-black uppercase text-slate-800 font-black">Unpaid Day</span></div>
                     </div>
                  </div>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Settle Confirmation */}
      <AnimatePresence>
         {isSettleModalOpen && settlingStaff && (
           <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsSettleModalOpen(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
             <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative bg-white w-full max-w-lg rounded-[3rem] p-12 text-center shadow-2xl">
                <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
                   <ShieldCheck size={48} />
                </div>
                <h3 className="text-3xl font-black text-slate-800 italic uppercase mb-2 leading-none">Authorization</h3>
                <p className="text-slate-800 text-sm mb-10 font-black uppercase tracking-widest leading-relaxed">
                   Authorized payout of <span className="text-emerald-600 italic">₹{settlingStaff.netSalary.toLocaleString()}</span> for {settlingStaff.totalPaidDays} Days work?
                   <br/><span className="text-[10px] text-red-500 italic font-black uppercase underline decoration-red-500/20 underline-offset-4">Audit will be locked upon reconciliation.</span>
                </p>
                <div className="flex gap-4">
                   <button onClick={() => setIsSettleModalOpen(false)} className="flex-1 py-5 bg-slate-50 text-slate-800 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-slate-100">Cancel</button>
                   <button onClick={handleSettlement} className="flex-1 py-5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-900/20">Finalize Ledger</button>
                </div>
             </motion.div>
           </div>
         )}
      </AnimatePresence>

      {/* Registration Modal */}
      <AnimatePresence>
         {isAddModalOpen && (
           <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsAddModalOpen(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
             <motion.div className="relative bg-white w-full max-w-2xl rounded-[3rem] p-10 shadow-2xl overflow-y-auto max-h-[90vh]">
                <h3 className="text-2xl font-black text-slate-800 italic uppercase mb-8">Onboard Personnel</h3>
                <form className="space-y-6" onSubmit={handleRegister}>
                   <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                         <label className="text-[10px] font-black uppercase text-slate-800 font-black">Full Name</label>
                         <input type="text" value={newStaff.name} onChange={(m) => setNewStaff({...newStaff, name: m.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs font-bold" required />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black uppercase text-slate-800 font-black">Role</label>
                         <input type="text" value={newStaff.role} onChange={(m) => setNewStaff({...newStaff, role: m.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs font-bold" required />
                      </div>
                   </div>
                   <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                         <label className="text-[10px] font-black uppercase text-slate-800 font-black">Fixed Salary (₹)</label>
                         <input type="number" value={newStaff.salary} onChange={(m) => setNewStaff({...newStaff, salary: m.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs font-bold" required />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black uppercase text-slate-800 font-black">Initial Advance</label>
                         <input type="number" value={newStaff.advance} onChange={(m) => setNewStaff({...newStaff, advance: m.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs font-bold" />
                      </div>
                   </div>
                   <button type="submit" className="w-full py-5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl font-black">Commit Entry</button>
                </form>
             </motion.div>
           </div>
         )}
      </AnimatePresence>

      {/* Edit Modal (Advance Support) */}
      <AnimatePresence>
         {isEditModalOpen && editingStaff && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsEditModalOpen(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
              <motion.div className="relative bg-white w-full max-w-2xl rounded-[3rem] p-10 shadow-2xl overflow-y-auto max-h-[90vh]">
                 <h3 className="text-2xl font-black text-slate-800 italic uppercase mb-8">Audit Modifier</h3>
                 <form className="space-y-6" onSubmit={handleEditSubmit}>
                    <div className="grid grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-slate-800 font-black font-black">Staff Name</label>
                          <input type="text" value={editingStaff.name} onChange={(e) => setEditingStaff({...editingStaff, name: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs font-bold" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-slate-800 font-black font-black">Fixed Salary</label>
                          <input type="number" value={editingStaff.salary} onChange={(e) => setEditingStaff({...editingStaff, salary: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs font-bold" />
                       </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-red-500 font-black font-black">Total Salary Advance (₹)</label>
                          <input type="number" value={editingStaff.advance} onChange={(e) => setEditingStaff({...editingStaff, advance: e.target.value})} className="w-full bg-red-50 border border-red-100 rounded-2xl p-4 text-xs font-bold text-red-600 font-black" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-slate-800 font-black font-black">Leaves Allowed</label>
                          <input type="number" value={editingStaff.allowedLeaves} onChange={(e) => setEditingStaff({...editingStaff, allowedLeaves: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs font-bold" />
                       </div>
                    </div>
                    <button type="submit" className="w-full py-5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl">Apply Audit Updates</button>
                 </form>
              </motion.div>
            </div>
         )}
      </AnimatePresence>
    </div>
  );
}
