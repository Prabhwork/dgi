"use client";

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { Contact } from '@/types';
import { Trash2, Search, Mail, Phone, User, Calendar, MessageSquare } from 'lucide-react';

export default function ContactsPage() {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchContacts();
    }, []);

    const fetchContacts = async () => {
        setLoading(true);
        try {
            const res = await apiFetch('/contact');
            if (res.success) {
                setContacts(res.data);
            }
        } catch (err) {
            console.error("Failed to fetch contact messages", err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this message?')) return;

        try {
            const res = await apiFetch(`/contact/${id}`, { method: 'DELETE' });
            if (res.success) {
                setContacts(contacts.filter(c => c._id !== id));
            }
        } catch {
            alert('Failed to delete message');
        }
    };

    const filteredContacts = contacts.filter(contact => 
        contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.message.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-800">Contact Messages</h1>
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
                                <th className="py-4 px-6 font-semibold text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="py-12 text-center text-slate-500">
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                                            <span>Loading messages...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredContacts.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="py-12 text-center text-slate-500">
                                        No messages found.
                                    </td>
                                </tr>
                            ) : (
                                filteredContacts.map((contact) => (
                                    <tr key={contact._id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                                        <td className="py-4 px-6">
                                            <div className="space-y-1.5">
                                                <div className="flex items-center gap-2 font-medium text-slate-900">
                                                    <User size={14} className="text-teal-500" />
                                                    {contact.name}
                                                </div>
                                                <div className="flex items-center gap-2 text-slate-600">
                                                    <Mail size={14} className="text-slate-400" />
                                                    {contact.email}
                                                </div>
                                                <div className="flex items-center gap-2 text-slate-600">
                                                    <Phone size={14} className="text-slate-400" />
                                                    {contact.phone}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 max-w-md">
                                            <div className="space-y-1.5">
                                                <div className="font-semibold text-slate-800 line-clamp-1">
                                                    {contact.subject}
                                                </div>
                                                <div className="text-slate-600 line-clamp-3 whitespace-pre-wrap flex gap-2">
                                                    <MessageSquare size={14} className="text-slate-400 shrink-0 mt-1" />
                                                    {contact.message}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-slate-500">
                                            <div className="flex items-center gap-2">
                                                <Calendar size={14} className="text-slate-400" />
                                                {new Date(contact.createdAt).toLocaleDateString(undefined, {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-center">
                                            <button
                                                onClick={() => handleDelete(contact._id)}
                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors group"
                                                title="Delete Message"
                                            >
                                                <Trash2 size={18} className="group-hover:scale-110 transition-transform" />
                                            </button>
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
