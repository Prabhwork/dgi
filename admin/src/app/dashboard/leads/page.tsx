"use client";

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { FunnelLead } from '@/types';
import { 
    Search, Filter, Download, 
    Mail, Phone, Calendar, 
    XCircle, User, Briefcase, FileText, ChevronRight
} from 'lucide-react';

const StatusBadge = ({ status }: { status: string }) => {
    const styles = {
        new: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
        contacted: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
        qualified: 'bg-teal-500/10 text-teal-500 border-teal-500/20',
        closed: 'bg-slate-500/10 text-slate-500 border-slate-500/20'
    };
    const style = styles[status as keyof typeof styles] || styles.new;
    return (
        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${style}`}>
            {status}
        </span>
    );
};

export default function BusinessLeadsPage() {
    const [leads, setLeads] = useState<FunnelLead[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLead, setSelectedLead] = useState<FunnelLead | null>(null);

    useEffect(() => {
        fetchLeads();
    }, []);

    const fetchLeads = async () => {
        try {
            setLoading(true);
            const data = await apiFetch('/funnel/leads');
            if (data.success) setLeads(data.data);
        } catch { /* Silent catch */ }
        finally { setLoading(false); }
    };

    const updateLeadStatus = async (id: string, newStatus: string) => {
        try {
            const status = newStatus as FunnelLead['status'];
            setLeads(leads.map(l => l._id === id ? { ...l, status } : l));
            if (selectedLead?._id === id) setSelectedLead({ ...selectedLead, status });
        } catch { alert('Failed to update status'); }
    };

    const filteredLeads = leads.filter(l => 
        l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const exportToCSV = () => {
        const headers = ['Date', 'Name', 'Phone', 'Email', 'Business Name', 'Status'];
        const rows = filteredLeads.map(l => [
            new Date(l.createdAt).toLocaleDateString(),
            l.name,
            l.phone,
            l.email,
            l.businessName,
            l.status
        ]);
        
        const csvContent = "data:text/csv;charset=utf-8," 
            + headers.join(",") + "\n" 
            + rows.map(e => e.join(",")).join("\n");
            
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `dbi_leads_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="p-6 space-y-6 bg-slate-50/30 min-h-screen">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tighter">Business Intelligence Leads</h1>
                    <p className="text-slate-500 mt-2 text-sm font-medium">Track and manage high-intent business inquiries from the growth funnel.</p>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <button 
                        onClick={exportToCSV}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-slate-800 transition-all shadow-lg"
                    >
                        <Download size={16} /> Export CSV
                    </button>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Leads List */}
                <div className="flex-1 bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm flex flex-col">
                    <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row gap-4 justify-between items-center">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input 
                                type="text"
                                placeholder="Search by name, company, or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/5 transition-all text-sm font-medium text-slate-900"
                            />
                        </div>
                        <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-wider">
                            <Filter size={14} /> {filteredLeads.length} Entries Found
                        </div>
                    </div>

                    <div className="overflow-x-auto min-h-[400px]">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100">
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Date</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Business Name</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Lead Contact</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Status</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loading ? (
                                    <tr><td colSpan={5} className="px-6 py-20 text-center text-slate-400 font-medium italic">Synchronizing business intelligence data...</td></tr>
                                ) : filteredLeads.length === 0 ? (
                                    <tr><td colSpan={5} className="px-6 py-20 text-center text-slate-400 font-medium italic">No leads detected in the system.</td></tr>
                                ) : (
                                    filteredLeads.map((lead) => (
                                        <tr 
                                            key={lead._id} 
                                            onClick={() => setSelectedLead(lead)}
                                            className={`hover:bg-teal-50/30 transition-colors cursor-pointer group ${selectedLead?._id === lead._id ? 'bg-teal-50/50' : ''}`}
                                        >
                                            <td className="px-6 py-5 whitespace-nowrap">
                                                <div className="text-xs font-bold text-slate-700 flex items-center gap-2">
                                                    <Calendar size={12} className="text-slate-400" />
                                                    {new Date(lead.createdAt).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="text-sm font-black text-slate-900 leading-tight">{lead.businessName}</div>
                                                <div className="text-[10px] font-bold text-teal-600 uppercase tracking-widest mt-0.5">Verified Entity</div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="text-sm font-bold text-slate-700">{lead.name}</div>
                                                <div className="text-xs text-slate-400 truncate max-w-[180px]">{lead.email}</div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <StatusBadge status={lead.status} />
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-teal-500 group-hover:text-white transition-all">
                                                    <ChevronRight size={18} />
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Lead Detail Panel */}
                <div className="w-full lg:w-96 shrink-0 transition-all">
                    {selectedLead ? (
                        <div className="bg-[#0f172a] rounded-[2.5rem] p-8 text-white sticky top-6 shadow-2xl border border-slate-800 overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
                            
                            <div className="relative z-10 space-y-8">
                                <div className="flex justify-between items-start">
                                    <div className="bg-teal-500/20 p-4 rounded-2xl border border-teal-500/30">
                                        <Briefcase size={28} className="text-teal-400" />
                                    </div>
                                    <button onClick={() => setSelectedLead(null)} className="text-slate-500 hover:text-white transition-colors"><XCircle size={20} /></button>
                                </div>

                                <div>
                                    <h2 className="text-3xl font-black tracking-tighter text-white leading-none">{selectedLead.businessName}</h2>
                                    <p className="text-slate-400 text-sm mt-3 leading-relaxed font-medium">&quot;{selectedLead.description}&quot;</p>
                                </div>

                                <div className="space-y-4 pt-4 border-t border-slate-800">
                                    <div className="flex items-center gap-4 group">
                                        <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center group-hover:bg-teal-500 transition-colors">
                                            <User size={18} className="text-slate-400 group-hover:text-white" />
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Full Name</div>
                                            <div className="text-sm font-bold text-white">{selectedLead.name}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 group">
                                        <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center group-hover:bg-teal-500 transition-colors">
                                            <Mail size={18} className="text-slate-400 group-hover:text-white" />
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Email Address</div>
                                            <a href={`mailto:${selectedLead.email}`} className="text-sm font-bold text-teal-400 hover:underline">{selectedLead.email}</a>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 group">
                                        <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center group-hover:bg-teal-500 transition-colors">
                                            <Phone size={18} className="text-slate-400 group-hover:text-white" />
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Phone Number</div>
                                            <a href={`tel:${selectedLead.phone}`} className="text-sm font-bold text-white">{selectedLead.phone}</a>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4 pt-6 border-t border-slate-800">
                                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Growth Funnel Intelligence</div>
                                    <div className="space-y-3">
                                        {Object.entries(selectedLead.answers || {}).map(([q, a], idx) => (
                                            <div key={idx} className="bg-slate-800/50 p-4 rounded-2xl border border-white/5">
                                                <div className="text-[9px] font-black text-slate-500 uppercase tracking-wider mb-2">Question {q}</div>
                                                <div className="text-sm font-bold text-white leading-snug">{a}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-8">
                                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4 text-center">Update Relationship Status</div>
                                    <div className="grid grid-cols-2 gap-2">
                                        {['new', 'contacted', 'qualified', 'closed'].map(s => (
                                            <button 
                                                key={s}
                                                onClick={() => updateLeadStatus(selectedLead._id, s)}
                                                className={`px-3 py-2 text-[10px] font-black uppercase tracking-tighter rounded-xl transition-all border ${selectedLead.status === s ? 'bg-teal-500 border-teal-500 text-white shadow-lg' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'}`}
                                            >
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-[2.5rem] p-12 text-center border-2 border-dashed border-slate-200 text-slate-400 sticky top-6 min-h-[500px] flex flex-col items-center justify-center gap-4">
                            <FileText size={48} className="opacity-10" />
                            <p className="text-sm font-bold uppercase tracking-widest leading-relaxed">Select a lead <br/>to view details</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
