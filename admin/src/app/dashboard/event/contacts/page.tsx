"use client";

import { useState, useEffect } from 'react';
import { Search, Mail, User, Calendar, Tag } from 'lucide-react';

interface ContactInquiry {
    _id: string;
    fullName: string;
    email: string;
    subject: string;
    message: string;
    createdAt: string;
}

export default function EventContactsPage() {
    const [contacts, setContacts] = useState<ContactInquiry[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchContacts();
    }, []);

    const fetchContacts = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_EVENT_API_URL}/admin/contacts`);
            const data = await res.json();
            setContacts(data);
        } catch (err) {
            console.error("Failed to fetch event contacts", err);
        } finally {
            setLoading(false);
        }
    };

    const filteredContacts = contacts.filter(c => 
        c.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.message.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-800">Event Inquiries</h1>
                <div className="text-sm text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">
                    Total: {contacts.length}
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
                        placeholder="Search by name, email, subject or message..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white rounded border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-sm min-w-[800px]">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-slate-700">
                                <th className="py-4 px-6 font-semibold">User Info</th>
                                <th className="py-4 px-6 font-semibold">Message Detail</th>
                                <th className="py-4 px-6 font-semibold">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={3} className="py-12 text-center text-slate-500">
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                                            <span>Loading messages...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredContacts.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="py-12 text-center text-slate-500">
                                        No messages found.
                                    </td>
                                </tr>
                            ) : (
                                filteredContacts.map((contact) => (
                                    <tr key={contact._id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                                        <td className="py-4 px-6">
                                            <div className="space-y-1.5">
                                                <div className="flex items-center gap-2 font-black text-slate-900 uppercase italic">
                                                    <User size={14} className="text-teal-500" />
                                                    {contact.fullName}
                                                </div>
                                                <div className="flex items-center gap-2 text-slate-600 font-bold">
                                                    <Mail size={14} className="text-slate-400" />
                                                    {contact.email}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 max-w-md">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2 px-2 py-0.5 bg-slate-100 rounded text-[10px] font-black uppercase text-slate-600 w-fit">
                                                    <Tag size={10} />
                                                    {contact.subject}
                                                </div>
                                                <div className="text-slate-700 italic font-medium leading-relaxed bg-slate-50/50 p-4 rounded-2xl border border-slate-100/50">
                                                    &quot;{contact.message}&quot;
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-slate-500">
                                            <div className="flex items-center gap-2">
                                                <Calendar size={14} className="text-slate-400" />
                                                {new Date(contact.createdAt).toLocaleDateString(undefined, {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
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
