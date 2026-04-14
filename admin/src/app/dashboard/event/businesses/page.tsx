"use client";

import { useState, useEffect } from 'react';
import { Search, Mail, User, Calendar, FileText, Camera, Building2 } from 'lucide-react';

interface BusinessApp {
    _id: string;
    businessName: string;
    ownerName: string;
    email: string;
    mobileNumber: string;
    category: string;
    registrationType: string;
    fundingRequired: string;
    equityOffering: string;
    aadhaarNumber: string;
    gstNumber: string;
    message?: string;
    selfie?: string;
    pitchDeck?: string;
    createdAt: string;
}

export default function EventBusinessesPage() {
    const [businesses, setBusinesses] = useState<BusinessApp[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchBusinesses();
    }, []);

    const fetchBusinesses = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_EVENT_API_URL}/admin/businesses`);
            const data = await res.json();
            setBusinesses(data);
        } catch (err) {
            console.error("Failed to fetch event businesses", err);
        } finally {
            setLoading(false);
        }
    };

    const filteredBusinesses = businesses.filter(b => 
        b.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-800">Event Business Applications</h1>
                <div className="text-sm text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">
                    Total: {businesses.length}
                </div>
            </div>

            {/* Search */}
            <div className="bg-white p-4 rounded border border-slate-200 shadow-sm">
                <div className="relative max-w-md">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <Search className="w-5 h-5 text-slate-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full p-2.5 pl-10 text-sm text-slate-900 border border-slate-300 rounded focus:ring-teal-500 focus:border-teal-500 bg-slate-50"
                        placeholder="Search by business, owner or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white rounded border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-sm min-w-[1000px]">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-slate-700">
                                <th className="py-4 px-6 font-semibold">Business Info</th>
                                <th className="py-4 px-6 font-semibold">Profile & Financials</th>
                                <th className="py-4 px-6 font-semibold text-center">Verification</th>
                                <th className="py-4 px-6 font-semibold">Media</th>
                                <th className="py-4 px-6 font-semibold">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="py-12 text-center text-slate-500">
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                                            <span>Loading...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredBusinesses.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-12 text-center text-slate-500">
                                        No applications found.
                                    </td>
                                </tr>
                            ) : (
                                filteredBusinesses.map((b) => (
                                    <tr key={b._id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                                        <td className="py-4 px-6">
                                            <div className="space-y-1.5">
                                                <div className="flex items-center gap-2 font-black text-slate-900 uppercase italic">
                                                    <Building2 size={14} className="text-teal-500" />
                                                    {b.businessName}
                                                </div>
                                                <div className="flex items-center gap-2 text-slate-600 font-bold">
                                                    <User size={14} className="text-slate-400" />
                                                    {b.ownerName}
                                                </div>
                                                <div className="flex items-center gap-2 text-slate-600">
                                                    <Mail size={14} className="text-slate-400" />
                                                    {b.email}
                                                </div>
                                                {b.message && (
                                                    <div className="text-slate-700 italic font-medium leading-relaxed bg-slate-50/50 p-4 rounded-2xl border border-slate-100/50">
                                                        &quot;{b.message}&quot;
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="space-y-1">
                                                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Funding Required</div>
                                                <div className="text-lg font-black text-teal-600 italic tracking-tighter">{b.fundingRequired}</div>
                                                <div className="text-xs font-medium text-slate-500 italic">Equity: {b.equityOffering}</div>
                                                <div className="inline-block mt-2 px-2 py-0.5 bg-slate-100 rounded text-[10px] font-bold text-slate-600 uppercase">{b.category}</div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-center">
                                            <div className="space-y-1">
                                                <div className="text-[10px] font-bold text-slate-400">AADHAAR</div>
                                                <div className="font-mono text-xs">{b.aadhaarNumber}</div>
                                                <div className="text-[10px] font-bold text-slate-400 mt-2">GST</div>
                                                <div className="font-mono text-xs">{b.gstNumber}</div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex flex-col gap-2">
                                                {b.selfie && (
                                                    <a href={`${process.env.NEXT_PUBLIC_EVENT_BASE_URL}/${b.selfie}`} target="_blank" className="flex items-center gap-2 text-sky-600 hover:underline font-bold italic text-xs">
                                                        <Camera size={14} /> VIEW SELFIE
                                                    </a>
                                                )}
                                                {b.pitchDeck && (
                                                    <a href={`${process.env.NEXT_PUBLIC_EVENT_BASE_URL}/${b.pitchDeck}`} target="_blank" className="flex items-center gap-2 text-teal-600 hover:underline font-bold italic text-xs">
                                                        <FileText size={14} /> DOWNLOAD PITCH DECK
                                                    </a>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-slate-500">
                                            <div className="flex items-center gap-2">
                                                <Calendar size={14} className="text-slate-400" />
                                                {new Date(b.createdAt).toLocaleDateString()}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
