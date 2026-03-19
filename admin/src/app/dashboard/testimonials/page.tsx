"use client";

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, X, CheckCircle, XCircle } from 'lucide-react';
import { Testimonial } from '@/types';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';

export default function TestimonialsPage() {
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    // Delete Modal State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [testimonialToDelete, setTestimonialToDelete] = useState<Testimonial | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    useEffect(() => {
        fetchTestimonials();
    }, []);

    const fetchTestimonials = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('adminToken');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/testimonials?all=true`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const data = await res.json();

            if (data.success) {
                setTestimonials(data.data);
            } else {
                setError(data.error || 'Failed to fetch testimonials');
            }
        } catch (err: any) {
            setError(err.message || 'Error connecting to server');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleActive = async (testimonial: Testimonial) => {
        try {
            const token = localStorage.getItem('adminToken');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/testimonials/${testimonial._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ isActive: !testimonial.isActive })
            });

            const data = await res.json();
            if (data.success) {
                setTestimonials(testimonials.map(t => t._id === testimonial._id ? { ...t, isActive: data.data.isActive } : t));
            } else {
                alert(data.error || 'Failed to update status');
            }
        } catch (err) {
            console.error(err);
            alert('Error updating status');
        }
    };

    const confirmDelete = (testimonial: Testimonial) => {
        setTestimonialToDelete(testimonial);
        setIsDeleteModalOpen(true);
    };

    const handleDelete = async () => {
        if (!testimonialToDelete) return;

        try {
            setDeleteLoading(true);
            const token = localStorage.getItem('adminToken');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/testimonials/${testimonialToDelete._id}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const data = await res.json();

            if (data.success) {
                setTestimonials(testimonials.filter((t) => t._id !== testimonialToDelete._id));
                setIsDeleteModalOpen(false);
                setTestimonialToDelete(null);
            } else {
                alert(data.error || 'Failed to delete testimonial');
            }
        } catch (err) {
            console.error(err);
            alert('Error deleting testimonial');
        } finally {
            setDeleteLoading(false);
        }
    };

    const filteredTestimonials = testimonials.filter(t =>
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.phone.includes(searchTerm) ||
        t.quote.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center text-slate-800">
                <h1 className="text-2xl font-bold tracking-tight">Testimonials / Reviews</h1>
                <div className="relative w-64">
                    <input
                        type="text"
                        placeholder="Search testimonials..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                    />
                    <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
                </div>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg">
                    {error}
                </div>
            )}

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-slate-800">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm">
                            <tr>
                                <th className="px-6 py-4 font-semibold">User Info</th>
                                <th className="px-6 py-4 font-semibold">Review</th>
                                <th className="px-6 py-4 font-semibold text-center">Date</th>
                                <th className="px-6 py-4 font-semibold text-center">Status</th>
                                <th className="px-6 py-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                        <div className="flex justify-center items-center space-x-2">
                                            <div className="w-4 h-4 rounded-full bg-teal-500 animate-bounce" />
                                            <div className="w-4 h-4 rounded-full bg-teal-500 animate-bounce" style={{ animationDelay: '0.1s' }} />
                                            <div className="w-4 h-4 rounded-full bg-teal-500 animate-bounce" style={{ animationDelay: '0.2s' }} />
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredTestimonials.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                        No testimonials found. Wait for users to submit reviews.
                                    </td>
                                </tr>
                            ) : (
                                filteredTestimonials.map((testimonial) => (
                                    <tr key={testimonial._id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium">{testimonial.name}</div>
                                            <div className="text-sm text-slate-500">{testimonial.email}</div>
                                            <div className="text-sm text-slate-500">{testimonial.phone}</div>
                                            <div className="text-xs font-semibold px-2 py-0.5 bg-slate-100 text-slate-600 rounded mt-1.5 inline-block">{testimonial.role}</div>
                                        </td>
                                        <td className="px-6 py-4 max-w-sm">
                                            <p className="text-sm text-slate-700 line-clamp-3 italic">"{testimonial.quote}"</p>
                                        </td>
                                        <td className="px-6 py-4 text-center text-sm text-slate-500">
                                            {new Date(testimonial.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => handleToggleActive(testimonial)}
                                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                                                    testimonial.isActive 
                                                        ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' 
                                                        : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                                                }`}
                                            >
                                                {testimonial.isActive ? (
                                                    <><CheckCircle size={14} /> Active</>
                                                ) : (
                                                    <><XCircle size={14} /> Pending</>
                                                )}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => confirmDelete(testimonial)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                title="Delete Testimonial"
                message={`Are you sure you want to delete the testimonial from "${testimonialToDelete?.name}"? This action cannot be undone.`}
                isLoading={deleteLoading}
            />
        </div>
    );
}
