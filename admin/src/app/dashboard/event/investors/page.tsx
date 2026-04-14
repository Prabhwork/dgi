"use client";

import { useState, useEffect } from 'react';
import { Search, Mail, User, Calendar, Camera, ShieldCheck, Briefcase } from 'lucide-react';

interface InvestorApp {
    _id: string;
    fullName: string;
    email: string;
    mobileNumber: string;
    location: string;
    investmentRange: string;
    preferredCategories: string[];
    investmentType: string[];
    availability: string;
    selfie?: string;
    documentUpload?: string;
    createdAt: string;
    industryExperience?: string;
    portfolio?: string;
}

export default function EventInvestorsPage() {
    const [investors, setInvestors] = useState<InvestorApp[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchInvestors();
    }, []);

    const fetchInvestors = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_EVENT_API_URL}/admin/investors`);
            const data = await res.json();
            setInvestors(data);
        } catch (err) {
            console.error("Failed to fetch event investors", err);
        } finally {
            setLoading(false);
        }
    };

    const filteredInvestors = investors.filter(i => 
        i.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.location.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-800">Event Investor Profiles</h1>
                <div className="text-sm text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">
                    Total: {investors.length}
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
                        placeholder="Search by name, email or location..."
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
                                <th className="py-4 px-6 font-semibold">Investor Info</th>
                                <th className="py-4 px-6 font-semibold">Investment Criteria</th>
                                <th className="py-4 px-6 font-semibold">Experience</th>
                                <th className="py-4 px-6 font-semibold">Verification</th>
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
                            ) : filteredInvestors.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-12 text-center text-slate-500">
                                        No investors found.
                                    </td>
                                </tr>
                            ) : (
                                filteredInvestors.map((i) => (
                                    <tr key={i._id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                                        <td className="py-4 px-6">
                                            <div className="space-y-1.5">
                                                <div className="flex items-center gap-2 font-black text-slate-900 uppercase italic">
                                                    <User size={14} className="text-teal-500" />
                                                    {i.fullName}
                                                </div>
                                                <div className="flex items-center gap-2 text-slate-600">
                                                    <Mail size={14} className="text-slate-400" />
                                                    {i.email}
                                                </div>
                                                <div className="flex items-center gap-2 text-slate-500 italic text-xs">
                                                    <MapPin size={12} className="text-slate-300" />
                                                    {i.location}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="space-y-1">
                                                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Range</div>
                                                <div className="text-lg font-black text-teal-600 italic tracking-tighter">{i.investmentRange}</div>
                                                <div className="text-xs font-bold text-slate-500 bg-sky-50 px-2 py-0.5 rounded border border-sky-100 inline-block mt-1">{i.availability}</div>
                                                <div className="text-[10px] text-slate-400 mt-1 line-clamp-1">{i.preferredCategories}</div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 max-w-xs">
                                            <div className="space-y-1.5">
                                                <div className="flex items-start gap-2 text-slate-600">
                                                    <Briefcase size={14} className="text-slate-400 mt-1 shrink-0" />
                                                    <span className="line-clamp-2 text-xs font-medium">{i.industryExperience}</span>
                                                </div>
                                                <div className="text-[10px] text-slate-400 italic">Portfolio: {i.portfolio || 'N/A'}</div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="space-y-2">
                                                {i.selfie && (
                                                    <a href={`${process.env.NEXT_PUBLIC_EVENT_BASE_URL}/${i.selfie}`} target="_blank" className="flex items-center gap-2 text-sky-600 hover:underline font-bold italic text-xs">
                                                        <Camera size={14} /> VIEW SELFIE
                                                    </a>
                                                )}
                                                {i.documentUpload && (
                                                    <a href={`${process.env.NEXT_PUBLIC_EVENT_BASE_URL}/${i.documentUpload}`} target="_blank" className="flex items-center gap-2 text-teal-600 hover:underline font-bold italic text-xs">
                                                        <ShieldCheck size={14} /> VIEW DOCUMENT
                                                    </a>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-slate-500">
                                            <div className="flex items-center gap-2">
                                                <Calendar size={14} className="text-slate-400" />
                                                {new Date(i.createdAt).toLocaleDateString()}
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

function MapPin({ size = 24, ...props }: React.SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg
      {...props}
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}
