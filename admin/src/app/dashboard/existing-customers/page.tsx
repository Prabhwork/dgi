"use client";

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { ExistingCustomer } from '@/types';
import { Plus, Edit2, Trash2, X, Image as ImageIcon, ExternalLink, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';

export default function ExistingCustomersPage() {
    const [customers, setCustomers] = useState<ExistingCustomer[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<ExistingCustomer | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        link: '',
        order: 0,
        logo: null as File | null,
        isActive: true
    });
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    const BASE_URL = (process.env.NEXT_PUBLIC_API_URL!).replace('/api', '');

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            setLoading(true);
            const data = await apiFetch('/existing-customers');
            if (data.success) {
                setCustomers(data.data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            const file = e.target.files[0];
            setFormData(prev => ({ ...prev, logo: file }));
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);

        if (!formData.name) {
            setError('Please add a customer name');
            setSubmitting(false);
            return;
        }

        try {
            const body = new FormData();
            body.append('name', formData.name);
            if (formData.link) body.append('link', formData.link);
            body.append('order', formData.order.toString());
            body.append('isActive', formData.isActive.toString());
            if (formData.logo) body.append('logo', formData.logo);

            const url = editingItem ? `/existing-customers/${editingItem._id}` : '/existing-customers';
            const method = editingItem ? 'PUT' : 'POST';
            const token = localStorage.getItem('adminToken');

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${url}`, {
                method,
                headers: { 'Authorization': `Bearer ${token}` },
                body
            });
            
            const data = await response.json();

            if (data.success) {
                fetchCustomers();
                handleCloseModal();
            } else {
                setError(data.error || 'Failed to save');
            }
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Something went wrong';
            setError(errorMsg);
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (item: ExistingCustomer) => {
        setEditingItem(item);
        setFormData({
            name: item.name,
            link: item.link || '',
            order: item.order || 0,
            logo: null,
            isActive: item.isActive
        });

        if (item.logo && item.logo !== 'no-photo.jpg') {
            setImagePreview(`${BASE_URL}/uploads/${item.logo}`);
        } else {
            setImagePreview(null);
        }
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this customer?')) return;
        try {
            const data = await apiFetch(`/existing-customers/${id}`, { method: 'DELETE' });
            if (data.success) {
                setCustomers(customers.filter(c => c._id !== id));
            }
        } catch {
            alert('Failed to delete');
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
        setFormData({ name: '', link: '', order: 0, logo: null, isActive: true });
        setImagePreview(null);
        setError('');
    };

    const filteredCustomers = customers.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredCustomers.length / ITEMS_PER_PAGE);
    const paginatedCustomers = filteredCustomers.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold text-slate-800">Existing Customers</h1>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-64">
                        <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search customers..."
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white text-sm text-slate-800"
                        />
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-teal-500 hover:bg-teal-600 text-white font-medium py-2 px-4 rounded shadow transition-colors flex items-center gap-2 whitespace-nowrap"
                    >
                        <Plus size={18} /> Add Customer
                    </button>
                </div>
            </div>

            <div className="bg-white rounded border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-sm min-w-[700px]">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-slate-700">
                                <th className="py-3 px-6 font-semibold w-20">Order</th>
                                <th className="py-3 px-6 font-semibold w-24">Logo</th>
                                <th className="py-3 px-6 font-semibold">Name</th>
                                <th className="py-3 px-6 font-semibold">Link</th>
                                <th className="py-3 px-6 font-semibold w-24">Status</th>
                                <th className="py-3 px-6 font-semibold w-32">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={6} className="py-8 text-center text-slate-500">Loading...</td></tr>
                            ) : filteredCustomers.length === 0 ? (
                                <tr><td colSpan={6} className="py-8 text-center text-slate-500">{searchTerm ? 'No results found.' : 'No customers found.'}</td></tr>
                            ) : (
                                paginatedCustomers.map((item) => (
                                    <tr key={item._id} className="border-b border-slate-100 hover:bg-slate-50">
                                        <td className="py-3 px-6 text-slate-600 font-medium">{item.order}</td>
                                        <td className="py-3 px-6">
                                            {item.logo && item.logo !== 'no-photo.jpg' ? (
                                                <div className="w-12 h-12 rounded bg-white shadow-sm border border-slate-200 flex items-center justify-center p-1 relative overflow-hidden">
                                                    <Image 
                                                        src={`${BASE_URL}/uploads/${item.logo}`}
                                                        alt={item.name}
                                                        width={40} height={40}
                                                        className="object-contain"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="w-12 h-12 rounded bg-slate-100 border border-slate-200 flex items-center justify-center">
                                                    <ImageIcon className="w-5 h-5 text-slate-400" />
                                                </div>
                                            )}
                                        </td>
                                        <td className="py-3 px-6 text-slate-800 font-medium">{item.name}</td>
                                        <td className="py-3 px-6 text-slate-600">
                                            {item.link ? (
                                                <a href={item.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-teal-600 hover:underline">
                                                    Link <ExternalLink size={12} />
                                                </a>
                                            ) : (
                                                <span className="text-slate-400">—</span>
                                            )}
                                        </td>
                                        <td className="py-3 px-6">
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${item.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {item.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="py-3 px-6">
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => handleEdit(item)} className="p-1.5 bg-teal-400 text-white rounded hover:bg-teal-500 transition-colors" title="Edit">
                                                    <Edit2 size={14} />
                                                </button>
                                                <button onClick={() => handleDelete(item._id)} className="p-1.5 bg-red-400 text-white rounded hover:bg-red-500 transition-colors" title="Delete">
                                                    <Trash2 size={14} />
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

            {/* Pagination */}
            {!loading && filteredCustomers.length > ITEMS_PER_PAGE && (
                <div className="flex items-center justify-between border-t border-slate-200 bg-white px-4 py-3 rounded-b-lg">
                    <p className="text-sm text-slate-600">
                        Showing <span className="font-medium">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to{' '}
                        <span className="font-medium">{Math.min(currentPage * ITEMS_PER_PAGE, filteredCustomers.length)}</span> of{' '}
                        <span className="font-medium">{filteredCustomers.length}</span> customers
                    </p>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                            <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                                    page === currentPage
                                        ? 'bg-teal-500 text-white'
                                        : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                                }`}
                            >
                                {page}
                            </button>
                        ))}
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
                    <div className="bg-white w-full max-w-2xl rounded shadow-xl overflow-hidden my-8 mt-16 animate-in fade-in zoom-in duration-200">
                        <div className="bg-teal-500 text-white px-6 py-4 flex justify-between items-center">
                            <h2 className="text-xl font-medium">{editingItem ? 'Edit Customer' : 'Add New Customer'}</h2>
                            <button onClick={handleCloseModal} className="text-teal-100 hover:text-white transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6">
                            {error && (
                                <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded border border-red-100">
                                    {error}
                                </div>
                            )}
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="flex flex-col md:flex-row md:items-center gap-4">
                                    <label className="text-slate-700 font-bold md:w-1/3">Customer Name *</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                        className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg text-slate-900 bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none shadow-sm"
                                        placeholder="e.g. Acme Corp"
                                        required
                                    />
                                </div>

                                <div className="flex flex-col md:flex-row md:items-center gap-4">
                                    <label className="text-slate-700 font-bold md:w-1/3">Website Link (optional)</label>
                                    <input
                                        type="url"
                                        value={formData.link}
                                        onChange={(e) => setFormData(prev => ({ ...prev, link: e.target.value }))}
                                        className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg text-slate-900 bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none shadow-sm"
                                        placeholder="e.g. https://example.com"
                                    />
                                </div>

                                <div className="flex flex-col md:flex-row md:items-center gap-4">
                                    <label className="text-slate-700 font-bold md:w-1/3">Display Order</label>
                                    <input
                                        type="number"
                                        value={formData.order}
                                        onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                                        className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg text-slate-900 bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none shadow-sm"
                                        min={0}
                                    />
                                </div>

                                <div className="flex flex-col md:flex-row md:items-center gap-4">
                                    <label className="text-slate-700 font-bold md:w-1/3">Active</label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.isActive}
                                            onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                                            className="w-4 h-4 accent-teal-500"
                                        />
                                        <span className="text-sm text-slate-600">{formData.isActive ? 'Active' : 'Hidden'}</span>
                                    </label>
                                </div>

                                <div className="flex flex-col md:flex-row md:items-start gap-4 pt-2">
                                    <label className="text-slate-700 font-bold md:w-1/3 pt-1">Company Logo (optional)</label>
                                    <div className="flex-1 flex items-start gap-4">
                                        <div className="flex-1">
                                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
                                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                    <ImageIcon className="w-8 h-8 text-slate-400 mb-2" />
                                                    <p className="text-sm text-slate-500 font-medium">Click to upload logo</p>
                                                    <p className="text-xs text-slate-400">PNG, JPG or WEBP (transparent background recommended)</p>
                                                </div>
                                                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                                            </label>
                                        </div>
                                        {imagePreview && (
                                            <div className="w-32 h-32 rounded-lg border border-slate-200 bg-slate-50 overflow-hidden relative group shrink-0 flex items-center justify-center">
                                                <Image src={imagePreview} alt="Preview" width={128} height={128} className="w-full h-full object-contain p-2" />
                                                <button
                                                    type="button"
                                                    onClick={() => { setImagePreview(null); setFormData(prev => ({ ...prev, logo: null })); }}
                                                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                                                >
                                                    <X size={12} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex md:pl-[33%] pl-0 justify-start gap-3 pt-6 border-t border-slate-100">
                                    <button 
                                        type="submit" 
                                        disabled={submitting} 
                                        className="px-8 py-2.5 bg-teal-500 hover:bg-teal-600 text-white font-medium rounded shadow transition-colors disabled:opacity-50 min-w-[120px]"
                                    >
                                        {submitting ? 'Submitting...' : editingItem ? 'Update Customer' : 'Add Customer'}
                                    </button>
                                    <button 
                                        type="button" 
                                        onClick={handleCloseModal} 
                                        className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
