"use client";

import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '@/lib/api';
import { Edit2, Trash2, X, Check, Search, ChevronLeft, ChevronRight } from 'lucide-react';

interface GoogleCategory {
    _id: string;
    name: string;
    isActive: boolean;
}

export default function GoogleCategoriesPage() {
    const [categories, setCategories] = useState<GoogleCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [error, setError] = useState('');

    // Pagination & Search state
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [total, setTotal] = useState(0);

    // Edit logic
    const [editingCategory, setEditingCategory] = useState<GoogleCategory | null>(null);
    const [editName, setEditName] = useState('');

    const fetchCategories = useCallback(async () => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString()
            });
            if (searchTerm) {
                queryParams.append('search', searchTerm);
            }

            const data = await apiFetch(`/google-categories?${queryParams.toString()}`);
            if (data.success) {
                setCategories(data.data);
                setTotal(data.total || data.count);
            }
        } catch (err) {
            console.error("Failed to fetch google categories", err);
        } finally {
            setLoading(false);
        }
    }, [page, limit, searchTerm]);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const handleCreateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!newCategoryName.trim()) {
            setError('Category name is required');
            return;
        }

        try {
            const data = await apiFetch('/google-categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newCategoryName })
            });

            if (data.success) {
                setCategories([...categories, data.data]);
                setIsCreateModalOpen(false);
                setNewCategoryName('');
                fetchCategories(); // Refresh to ensure correct sorting/pagination
            }
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Failed to create google category';
            setError(errorMsg);
        }
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingCategory) return;

        try {
            const data = await apiFetch(`/google-categories/${editingCategory._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: editName })
            });

            if (data.success) {
                setCategories(categories.map(c => c._id === editingCategory._id ? data.data : c));
                setEditingCategory(null);
                setEditName('');
            }
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Failed to update google category';
            alert(errorMsg);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this google category?')) return;

        try {
            await apiFetch(`/google-categories/${id}`, { method: 'DELETE' });
            setCategories(categories.filter(c => c._id !== id));
        } catch {
            alert('Failed to delete google category');
        }
    };

    const handleToggleStatus = async (category: GoogleCategory) => {
        try {
            const data = await apiFetch(`/google-categories/${category._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActive: !category.isActive })
            });

            if (data.success) {
                setCategories(categories.map(c => c._id === category._id ? data.data : c));
            }
        } catch {
            alert('Failed to update status');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-800">Google Categories</h1>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-teal-500 hover:bg-teal-600 text-white font-medium py-2 px-4 rounded shadow transition-colors flex items-center gap-2"
                >
                    Add Google Category
                </button>
            </div>

            {/* Search Bar */}
            <div className="flex bg-white p-4 rounded border border-slate-200 shadow-sm">
                <div className="relative w-full max-w-md">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <Search className="w-5 h-5 text-slate-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full p-2.5 pl-10 text-sm text-slate-900 border border-slate-300 rounded focus:ring-teal-500 focus:border-teal-500 bg-slate-50"
                        placeholder="Search categories by name..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setPage(1);
                        }}
                    />
                </div>
            </div>

            <div className="bg-white rounded border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-sm min-w-[600px]">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-slate-700">
                                <th className="py-3 px-6 font-semibold w-24">Seq. No</th>
                                <th className="py-3 px-6 font-semibold">Category Name</th>
                                <th className="py-3 px-6 font-semibold w-32">Status</th>
                                <th className="py-3 px-6 font-semibold w-48">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="py-8 text-center text-slate-500">Loading categories...</td>
                                </tr>
                            ) : categories.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="py-8 text-center text-slate-500">No categories found.</td>
                                </tr>
                            ) : (
                                categories.map((category, index) => (
                                    <tr key={category._id} className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${!category.isActive ? 'opacity-60 bg-slate-50/50' : ''}`}>
                                        <td className="py-3 px-6 text-slate-600">{(page - 1) * limit + index + 1}</td>
                                        <td className="py-3 px-6 font-medium text-slate-800">{category.name}</td>
                                        <td className="py-3 px-6">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${category.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}`}>
                                                {category.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="py-3 px-6">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => {
                                                        setEditingCategory(category);
                                                        setEditName(category.name);
                                                    }}
                                                    className="p-1.5 bg-teal-400 text-white rounded hover:bg-teal-500 transition-colors" title="Edit"
                                                >
                                                    <Edit2 size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(category._id)}
                                                    className="p-1.5 bg-red-400 text-white rounded hover:bg-red-500 transition-colors" title="Delete"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handleToggleStatus(category)}
                                                    className={`p-1.5 text-white rounded transition-colors ${category.isActive ? 'bg-orange-400 hover:bg-orange-500' : 'bg-green-400 hover:bg-green-500'}`}
                                                    title={category.isActive ? "Deactivate" : "Activate"}
                                                >
                                                    {category.isActive ? <X size={14} /> : <Check size={14} />}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {!loading && categories.length > 0 && total > limit && (
                    <div className="flex items-center justify-between border-t border-slate-200 bg-white px-4 py-3 sm:px-6">
                        <div className="flex flex-1 items-center justify-between">
                            <p className="text-sm text-slate-700">
                                Showing <span className="font-medium">{(page - 1) * limit + 1}</span> to <span className="font-medium">{Math.min(page * limit, total)}</span> of <span className="font-medium">{total}</span> results
                            </p>
                            <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm">
                                <button
                                    onClick={() => setPage(page - 1)}
                                    disabled={page === 1}
                                    className="relative inline-flex items-center rounded-l-md px-2 py-2 text-slate-400 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 disabled:opacity-50"
                                >
                                    <ChevronLeft className="h-5 w-5" />
                                </button>
                                <button
                                    onClick={() => setPage(page + 1)}
                                    disabled={page * limit >= total}
                                    className="relative inline-flex items-center rounded-r-md px-2 py-2 text-slate-400 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 disabled:opacity-50"
                                >
                                    <ChevronRight className="h-5 w-5" />
                                </button>
                            </nav>
                        </div>
                    </div>
                )}
            </div>

            {/* Create Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white w-full max-w-lg rounded shadow-xl overflow-hidden">
                        <div className="bg-teal-500 text-white px-6 py-4 flex justify-between items-center">
                            <h2 className="text-xl font-medium">Add Google Category</h2>
                            <button onClick={() => setIsCreateModalOpen(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6">
                            {error && <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded border border-red-100">{error}</div>}
                            <form onSubmit={handleCreateSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-slate-600 font-medium mb-2">Category Name</label>
                                    <input
                                        type="text"
                                        value={newCategoryName}
                                        onChange={(e) => setNewCategoryName(e.target.value)}
                                        placeholder="Enter Google Category Name"
                                        className="w-full px-4 py-2 border border-slate-300 rounded text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
                                        required
                                    />
                                </div>
                                <div className="flex justify-end gap-3 pt-2">
                                    <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-6 py-2 border border-slate-300 rounded text-slate-600 hover:bg-slate-50">Cancel</button>
                                    <button type="submit" className="bg-teal-500 hover:bg-teal-600 text-white font-medium py-2 px-8 rounded">Save</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {editingCategory && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white w-full max-w-lg rounded shadow-xl overflow-hidden">
                        <div className="bg-teal-500 text-white px-6 py-4 flex justify-between items-center">
                            <h2 className="text-xl font-medium">Edit Google Category</h2>
                            <button onClick={() => setEditingCategory(null)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6">
                            <form onSubmit={handleEditSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-slate-600 font-medium mb-2">Category Name</label>
                                    <input
                                        type="text"
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        placeholder="Enter Category Name"
                                        className="w-full px-4 py-2 border border-slate-300 rounded text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
                                        required
                                    />
                                </div>
                                <div className="flex justify-end gap-3 pt-2">
                                    <button type="button" onClick={() => setEditingCategory(null)} className="px-6 py-2 border border-slate-300 rounded text-slate-600 hover:bg-slate-50">Cancel</button>
                                    <button type="submit" className="bg-teal-500 hover:bg-teal-600 text-white font-medium py-2 px-8 rounded">Update</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
