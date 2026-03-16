"use client";

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { Category, Feature, PaginationInfo } from '@/types';
import { Edit2, Trash2, X, Check, Search, ChevronLeft, ChevronRight, Filter } from 'lucide-react';

export default function FeaturesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [features, setFeatures] = useState<Feature[]>([]);
    const [loading, setLoading] = useState(true);

    // Search, Filter & Pagination state
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [pagination, setPagination] = useState<PaginationInfo | null>(null);
    const [total, setTotal] = useState(0);

    // Create Modal state
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedCategoryId, setSelectedCategoryId] = useState('');
    const [error, setError] = useState('');

    // Edit Modal state
    const [editingFeature, setEditingFeature] = useState<Feature | null>(null);
    const [editCategoryId, setEditCategoryId] = useState('');

    useEffect(() => {
        fetchInitialData();
    }, [page, limit, searchTerm, filterCategory]);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const [catsRes, featuresRes] = await Promise.all([
                apiFetch('/categories'),
                apiFetch('/features')
            ]);

            if (catsRes.success) setCategories(catsRes.data);
            if (featuresRes.success) setFeatures(featuresRes.data);
        } catch (err) {
            console.error("Failed to fetch data", err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!selectedCategoryId) {
            setError('Please select a category');
            return;
        }

        try {
            const data = await apiFetch(`/categories/${selectedCategoryId}/features`, {
                method: 'POST',
                body: JSON.stringify({})
            });

            if (data.success) {
                fetchInitialData();
                setIsCreateModalOpen(false);
                setSelectedCategoryId('');
            }
        } catch (err: any) {
            setError(err.message || 'Failed to create feature');
        }
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingFeature) return;

        try {
            const data = await apiFetch(`/features/${editingFeature._id}`, {
                method: 'PUT',
                body: JSON.stringify({
                    category: editCategoryId
                })
            });

            if (data.success) {
                fetchInitialData();
                setEditingFeature(null);
                setEditCategoryId('');
            }
        } catch (err: any) {
            alert(err.message || 'Failed to update feature');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this feature?')) return;

        try {
            await apiFetch(`/features/${id}`, { method: 'DELETE' });
            setFeatures(features.filter(s => s._id !== id));
        } catch (err) {
            alert('Failed to delete feature');
        }
    };

    const handleToggleStatus = async (feature: Feature) => {
        try {
            const data = await apiFetch(`/features/${feature._id}`, {
                method: 'PUT',
                body: JSON.stringify({ isActive: !feature.isActive })
            });

            if (data.success) {
                fetchInitialData();
            }
        } catch (err) {
            alert('Failed to update status');
        }
    };

    const openEditModal = (feature: Feature) => {
        setEditingFeature(feature);
        // Safely extract category ID string whether it's an object or string
        const parentId = typeof feature.category === 'string' ? feature.category : feature.category._id;
        setEditCategoryId(parentId);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-800">Features Details</h1>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-teal-500 hover:bg-teal-600 text-white font-medium py-2 px-4 rounded shadow transition-colors flex items-center gap-2"
                >
                    Add Feature
                </button>
            </div>

            {/* Filters and Search */}
            <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded border border-slate-200 shadow-sm">
                <div className="relative w-full md:w-1/2 max-w-md">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <Search className="w-5 h-5 text-slate-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full p-2.5 pl-10 text-sm text-slate-900 border border-slate-300 rounded focus:ring-teal-500 focus:border-teal-500 bg-slate-50"
                        placeholder="Search features..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setPage(1);
                        }}
                    />
                </div>

                <div className="relative w-full md:w-1/3">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <Filter className="w-4 h-4 text-slate-400" />
                    </div>
                    <select
                        className="block w-full p-2.5 pl-10 text-sm text-slate-900 border border-slate-300 rounded focus:ring-teal-500 focus:border-teal-500 bg-slate-50 appearance-none"
                        value={filterCategory}
                        onChange={(e) => {
                            setFilterCategory(e.target.value);
                            setPage(1);
                        }}
                    >
                        <option value="">All Categories</option>
                        {categories.map((cat) => (
                            <option key={cat._id} value={cat._id}>{cat.name}</option>
                        ))}
                    </select>
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
                                    <td colSpan={4} className="py-8 text-center text-slate-500">Loading features...</td>
                                </tr>
                            ) : features.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="py-8 text-center text-slate-500">No features found.</td>
                                </tr>
                            ) : (
                                features.map((feature, index) => {
                                    const categoryName = typeof feature.category === 'object' ? feature.category.name : 'Unknown Category';

                                    return (
                                        <tr key={feature._id} className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${!feature.isActive ? 'opacity-60 bg-slate-50/50' : ''}`}>
                                            <td className="py-3 px-6 text-slate-600">{(page - 1) * limit + index + 1}</td>
                                            <td className="py-3 px-6 text-slate-600">{categoryName}</td>
                                            <td className="py-3 px-6">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => openEditModal(feature)}
                                                        className="p-1.5 bg-teal-400 text-white rounded hover:bg-teal-500 transition-colors" title="Edit"
                                                    >
                                                        <Edit2 size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(feature._id)}
                                                        className="p-1.5 bg-red-400 text-white rounded hover:bg-red-500 transition-colors" title="Delete"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleToggleStatus(feature)}
                                                        className={`p-1.5 text-white rounded transition-colors ${feature.isActive ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}`}
                                                        title={feature.isActive ? "Deactivate" : "Activate"}
                                                    >
                                                        {feature.isActive ? <Check size={14} /> : <X size={14} />}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {!loading && features.length > 0 && (
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

            {/* Create Feature Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white w-full max-w-lg rounded shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="bg-teal-500 text-white px-6 py-4 flex justify-between items-center">
                            <h2 className="text-xl font-medium">Add Feature</h2>
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
                                    <select
                                        value={selectedCategoryId}
                                        onChange={(e) => setSelectedCategoryId(e.target.value)}
                                        className="flex-1 px-4 py-2 border border-slate-300 rounded text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 bg-white"
                                        required
                                    >
                                        <option value="" disabled>Select Category</option>
                                        {categories.map(cat => (
                                            <option key={cat._id} value={cat._id}>{cat.name}</option>
                                        ))}
                                    </select>
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

            {/* Edit Feature Modal */}
            {editingFeature && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white w-full max-w-lg rounded shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="bg-teal-500 text-white px-6 py-4 flex justify-between items-center">
                            <h2 className="text-xl font-medium">Edit Feature</h2>
                            <button
                                onClick={() => setEditingFeature(null)}
                                className="text-teal-100 hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6">
                            <form onSubmit={handleEditSubmit} className="space-y-6">
                                <div className="flex flex-col md:flex-row md:items-center gap-4">
                                    <label className="text-slate-600 font-medium md:w-1/3">Category Name</label>
                                    <select
                                        value={editCategoryId}
                                        onChange={(e) => setEditCategoryId(e.target.value)}
                                        className="flex-1 px-4 py-2 border border-slate-300 rounded text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 bg-white"
                                        required
                                    >
                                        <option value="" disabled>Select Category</option>
                                        {categories.map(cat => (
                                            <option key={cat._id} value={cat._id}>{cat.name}</option>
                                        ))}
                                    </select>
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
                                        onClick={() => setEditingFeature(null)}
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
