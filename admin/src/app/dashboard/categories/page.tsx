"use client";

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { Category, MainCategory, PaginationInfo } from '@/types';
import { Plus, Edit2, Trash2, X, Check, Search, ChevronLeft, ChevronRight, Filter } from 'lucide-react';

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [error, setError] = useState('');

    // Pagination & Search state
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [pagination, setPagination] = useState<PaginationInfo | null>(null);
    const [total, setTotal] = useState(0);

    // Edit logic
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [editName, setEditName] = useState('');

    useEffect(() => {
        fetchCategories();
    }, [page, limit, searchTerm]);


    const fetchCategories = async () => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString()
            });
            if (searchTerm) {
                queryParams.append('search', searchTerm);
            }

            const data = await apiFetch(`/categories?${queryParams.toString()}`);
            if (data.success) {
                setCategories(data.data);
                setPagination(data.pagination);
                setTotal(data.total);
            }
        } catch (err) {
            console.error("Failed to fetch categories", err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!newCategoryName.trim()) {
            setError('Category name is required');
            return;
        }

        try {
            const data = await apiFetch('/categories', {
                method: 'POST',
                body: JSON.stringify({
                    name: newCategoryName,
                    description: newCategoryName
                })
            });

            if (data.success) {
                fetchCategories();
                setIsCreateModalOpen(false);
                setNewCategoryName('');
            }
        } catch (err: any) {
            setError(err.message || 'Failed to create category');
        }
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingCategory) return;

        try {
            const data = await apiFetch(`/categories/${editingCategory._id}`, {
                method: 'PUT',
                body: JSON.stringify({
                    name: editName,
                    description: editName
                })
            });

            if (data.success) {
                fetchCategories();
                setEditingCategory(null);
                setEditName('');
            }
        } catch (err: any) {
            alert(err.message || 'Failed to update category');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this category?')) return;

        try {
            await apiFetch(`/categories/${id}`, { method: 'DELETE' });
            setCategories(categories.filter(c => c._id !== id));
        } catch (err) {
            alert('Failed to delete category');
        }
    };

    const handleToggleStatus = async (category: Category) => {
        try {
            const data = await apiFetch(`/categories/${category._id}`, {
                method: 'PUT',
                body: JSON.stringify({ isActive: !category.isActive })
            });

            if (data.success) {
                setCategories(categories.map(c => c._id === category._id ? data.data : c));
            }
        } catch (err) {
            alert('Failed to update status');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-800">Category Details</h1>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-teal-500 hover:bg-teal-600 text-white font-medium py-2 px-4 rounded shadow transition-colors flex items-center gap-2"
                >
                    Create Category
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
                            setPage(1); // Reset to page 1 on new search
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
                                    <td colSpan={4} className="py-8 text-center text-slate-500">No categories found. Create one to get started.</td>
                                </tr>
                            ) : (
                                categories.map((category, index) => (
                                    <tr key={category._id} className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${!category.isActive ? 'opacity-60 bg-slate-50/50' : ''}`}>
                                        <td className="py-3 px-6 text-slate-600">{(page - 1) * limit + index + 1}</td>
                                        <td className="py-3 px-6 font-medium text-slate-800">{category.name}</td>
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
                                                    className={`p-1.5 text-white rounded transition-colors ${category.isActive ? 'bg-red-400 hover:bg-red-500' : 'bg-slate-400 hover:bg-slate-500'}`}
                                                    title={category.isActive ? "Deactivate" : "Activate"}
                                                >
                                                    {/* Based on User screenshot, the rightmost button is red with a checkmark meaning Active. We'll use Check icon. */}
                                                    {category.isActive ? <Check size={14} /> : <X size={14} />}
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
                {!loading && categories.length > 0 && (
                    <div className="flex items-center justify-between border-t border-slate-200 bg-white px-4 py-3 sm:px-6">
                        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-slate-700">
                                    Showing <span className="font-medium">{(page - 1) * limit + 1}</span> to <span className="font-medium">{Math.min(page * limit, total)}</span> of{' '}
                                    <span className="font-medium">{total}</span> results
                                </p>
                            </div>
                            <div>
                                <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                                    <button
                                        onClick={() => setPage(page - 1)}
                                        disabled={!pagination?.prev}
                                        className="relative inline-flex items-center rounded-l-md px-2 py-2 text-slate-400 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <span className="sr-only">Previous</span>
                                        <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                                    </button>
                                    <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-slate-900 ring-1 ring-inset ring-slate-300 focus:z-20 focus:outline-offset-0">
                                        Page {page}
                                    </span>
                                    <button
                                        onClick={() => setPage(page + 1)}
                                        disabled={!pagination?.next}
                                        className="relative inline-flex items-center rounded-r-md px-2 py-2 text-slate-400 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <span className="sr-only">Next</span>
                                        <ChevronRight className="h-5 w-5" aria-hidden="true" />
                                    </button>
                                </nav>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Create Category Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white w-full max-w-lg rounded shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="bg-teal-500 text-white px-6 py-4 flex justify-between items-center">
                            <h2 className="text-xl font-medium">Create Category</h2>
                            <button
                                onClick={() => setIsCreateModalOpen(false)}
                                className="text-teal-100 hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6">
                            {error && (
                                <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded border border-red-100">
                                    {error}
                                </div>
                            )}
                            <form onSubmit={handleCreateSubmit} className="space-y-6">
                                <div className="flex flex-col md:flex-row md:items-center gap-4">
                                    <label className="text-slate-600 font-medium md:w-1/3">Category Name</label>
                                    <input
                                        type="text"
                                        value={newCategoryName}
                                        onChange={(e) => setNewCategoryName(e.target.value)}
                                        placeholder="Enter Category Name"
                                        className="flex-1 px-4 py-2 border border-slate-300 rounded text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
                                        required
                                    />
                                </div>

                                <div className="flex md:pl-[33%] pl-0 pt-2">
                                    <button
                                        type="submit"
                                        className="bg-teal-500 hover:bg-teal-600 text-white font-medium py-2 px-8 rounded transition-colors"
                                    >
                                        Submit
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Category Modal */}
            {editingCategory && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white w-full max-w-lg rounded shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="bg-teal-500 text-white px-6 py-4 flex justify-between items-center">
                            <h2 className="text-xl font-medium">Edit Category</h2>
                            <button
                                onClick={() => setEditingCategory(null)}
                                className="text-teal-100 hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6">
                            <form onSubmit={handleEditSubmit} className="space-y-6">
                                <div className="flex flex-col md:flex-row md:items-center gap-4">
                                    <label className="text-slate-600 font-medium md:w-1/3">Category Name</label>
                                    <input
                                        type="text"
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        placeholder="Enter Category Name"
                                        className="flex-1 px-4 py-2 border border-slate-300 rounded text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
                                        required
                                    />
                                </div>

                                <div className="flex md:pl-[33%] pl-0 pt-2 gap-3">
                                    <button
                                        type="submit"
                                        className="bg-teal-500 hover:bg-teal-600 text-white font-medium py-2 px-8 rounded transition-colors"
                                    >
                                        Update
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setEditingCategory(null)}
                                        className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium py-2 px-6 rounded transition-colors"
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
