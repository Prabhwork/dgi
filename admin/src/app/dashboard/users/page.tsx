"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { 
    Search, User, Mail, Phone, ShieldCheck, 
    Calendar, Shield, Loader2, Eye, ShieldAlert
} from "lucide-react";

interface UserData {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
    isTwoFactorEnabled: boolean;
    isEmailVerified: boolean;
    role: string;
    status: 'active' | 'suspended';
    createdAt: string;
}

export default function UsersPage() {
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedUser, setSelectedUser] = useState<UserData | null>(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/users`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await res.json();
            if (data.success) {
                setUsers(data.data);
            }
        } catch (error) {
            console.error("Failed to fetch users", error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id: string, currentStatus: string) => {
        const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
        if (!confirm(`Are you sure you want to ${newStatus} this account?`)) return;

        try {
            const token = localStorage.getItem('adminToken');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/users/${id}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });
            const data = await res.json();
            if (data.success) {
                setUsers(prev => prev.map(u => u._id === id ? { ...u, status: newStatus } : u));
                if (selectedUser?._id === id) {
                    setSelectedUser(prev => prev ? { ...prev, status: newStatus } : null);
                }
                alert(`Account ${newStatus} successfully`);
            } else {
                alert(data.error || 'Failed to update status');
            }
        } catch {
            alert('Something went wrong');
        }
    };

    const filteredUsers = users.filter(u => 
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.phone && u.phone.includes(searchTerm))
    );

    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 font-display">User Management</h1>
                    <p className="text-slate-500 mt-1 uppercase tracking-widest text-[10px] font-bold">Monitor and manage registered individuals</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="relative flex-1 min-w-[300px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input 
                        type="text" 
                        placeholder="Search by name, email or phone..."
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm text-slate-900 font-medium"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid xl:grid-cols-3 gap-8 items-start">
                {/* List Table */}
                <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Profile</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">2FA</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Joined</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center">
                                            <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
                                        </td>
                                    </tr>
                                ) : filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-medium">No users found.</td>
                                    </tr>
                                ) : (
                                    filteredUsers.map(u => (
                                        <tr 
                                            key={u._id} 
                                            className={`hover:bg-slate-50/80 transition-colors cursor-pointer group ${selectedUser?._id === u._id ? 'bg-primary/5' : ''}`}
                                            onClick={() => setSelectedUser(u)}
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                                                        {u.avatar ? (
                                                            <Image src={u.avatar} alt={u.name} width={40} height={40} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <User size={18} className="text-slate-400" />
                                                        )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="font-bold text-slate-900 truncate">{u.name}</div>
                                                        <div className="text-[10px] text-slate-500 font-medium truncate uppercase tracking-wider">{u.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1">
                                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider w-fit ${u.isEmailVerified ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                                                        Email: {u.isEmailVerified ? 'Verified' : 'Pending'}
                                                    </span>
                                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider w-fit ${u.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                        Account: {u.status}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className={`flex items-center gap-1.5 ${u.isTwoFactorEnabled ? 'text-green-600' : 'text-slate-300'}`}>
                                                    <ShieldCheck size={16} />
                                                    <span className="text-[10px] font-black uppercase tracking-wider">{u.isTwoFactorEnabled ? 'On' : 'Off'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                                {new Date(u.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <button className="p-2 text-slate-300 group-hover:text-primary transition-colors">
                                                    <Eye size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Details Panel */}
                <div className="xl:col-span-1">
                    {selectedUser ? (
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden sticky top-8 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="p-8 text-center bg-slate-50 border-b border-slate-100 font-display">
                                <div className="w-24 h-24 rounded-3xl bg-white border-2 border-slate-200 mx-auto mb-4 flex items-center justify-center overflow-hidden shadow-inner">
                                    {selectedUser.avatar ? (
                                        <Image src={selectedUser.avatar} alt={selectedUser.name} width={96} height={96} className="w-full h-full object-cover" />
                                    ) : (
                                        <User size={40} className="text-slate-200" />
                                    )}
                                </div>
                                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">{selectedUser.name}</h2>
                                <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mt-1">{selectedUser.role} Profile</p>
                            </div>

                            <div className="p-8 space-y-8">
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Contact Details</h4>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                            <Mail className="w-4 h-4 text-slate-400" />
                                            <span className="text-xs font-bold text-slate-700 truncate">{selectedUser.email}</span>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                            <Phone className="w-4 h-4 text-slate-400" />
                                            <span className="text-xs font-bold text-slate-700">{selectedUser.phone || 'Not Provided'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Security Overview</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className={`p-4 rounded-2xl border text-center space-y-2 ${selectedUser.isTwoFactorEnabled ? 'bg-green-50 border-green-100 text-green-700' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>
                                            <ShieldCheck size={24} className="mx-auto" />
                                            <div className="text-[10px] font-black uppercase tracking-widest">2FA Enabled</div>
                                            <div className="text-xs font-black">{selectedUser.isTwoFactorEnabled ? 'YES' : 'NO'}</div>
                                        </div>
                                        <div className={`p-4 rounded-2xl border text-center space-y-2 ${selectedUser.status === 'active' ? 'bg-blue-50 border-blue-100 text-blue-700' : 'bg-rose-50 border-rose-100 text-rose-700'}`}>
                                            <Shield size={24} className="mx-auto" />
                                            <div className="text-[10px] font-black uppercase tracking-widest">Account Status</div>
                                            <div className="text-xs font-black uppercase">{selectedUser.status}</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
                                    <div className="flex items-center gap-2 text-xs text-slate-400 font-bold uppercase tracking-widest bg-slate-50 p-3 rounded-xl">
                                        <Calendar size={14} />
                                        Member Since: {new Date(selectedUser.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </div>
                                    
                                    <button 
                                        onClick={() => handleStatusUpdate(selectedUser._id, selectedUser.status)}
                                        className={`w-full py-4 border rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-colors flex items-center justify-center gap-2 ${
                                            selectedUser.status === 'active' 
                                                ? 'bg-rose-50 border-rose-100 text-rose-600 hover:bg-rose-100' 
                                                : 'bg-emerald-50 border-emerald-100 text-emerald-600 hover:bg-emerald-100'
                                        }`}
                                    >
                                        <ShieldAlert size={14} /> {selectedUser.status === 'active' ? 'Suspend Account' : 'Activate Account'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-slate-100/50 border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center h-full flex flex-col items-center justify-center">
                            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-slate-200 mb-6 shadow-sm">
                                <User size={32} />
                            </div>
                            <h3 className="text-slate-400 font-black uppercase tracking-widest text-xs">Select a user</h3>
                            <p className="text-slate-400 text-[10px] mt-2 max-w-[180px] font-bold uppercase tracking-widest leading-relaxed">Choose an individual from the list to view their full credentials</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
