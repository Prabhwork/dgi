"use client";

import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '@/lib/api';
import { Edit2, Trash2, X, Check, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';

interface MainCategory {
    _id: string;
    name: string;
}

interface MainSubcategory {
    _id: string;
    name: string;
    mainCategory: MainCategory | string;
    isActive: boolean;
}

export default function MainSubcategoriesPage() {
    const [mainCategories, setMainCategories] = useState<MainCategory[]>([]);
    const [subcategories, setSubcategories] = useState<MainSubcategory[]>([]);
    const [loading, setLoading] = useState(true);

    // Pagination state
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const limit = 20;

    const [searchTerm, setSearchTerm] = useState('');
    const [filterMainCategory, setFilterMainCategory] = useState('');

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedMainCategoryId, setSelectedMainCategoryId] = useState('');
    const [newName, setNewName] = useState('');
    const [error, setError] = useState('');

    const [editingItem, setEditingItem] = useState<MainSubcategory | null>(null);
    const [editName, setEditName] = useState('');
    const [editMainCategoryId, setEditMainCategoryId] = useState('');

    const fetchMainCategories = useCallback(async () => {
        try {
            const res = await apiFetch('/main-categories?limit=200');
            if (res.success) setMainCategories(res.data);
        } catch (err) {
            console.error("Failed to fetch main categories", err);
        }
    }, []);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            // Updated URL logic: if filter is applied, use the specific category endpoint
            let url = `/main-subcategories?page=${page}&limit=${limit}`;
            if (searchTerm) url += `&name=${encodeURIComponent(searchTerm)}`;
            
            // If filtering by category, use the specific category endpoint which supports pagination
            if (filterMainCategory) {
                url = `/main-categories/${filterMainCategory}/main-subcategories?page=${page}&limit=${limit}`;
                if (searchTerm) url += `&name=${encodeURIComponent(searchTerm)}`;
            }
            
            const subcatsRes = await apiFetch(url);
            if (subcatsRes.success) {
                setSubcategories(subcatsRes.data);
                setTotalPages(subcatsRes.pages || 1);
                setTotalItems(subcatsRes.total || (subcatsRes.data?.length === 0 ? 0 : subcatsRes.total) || 0);
            }
        } catch (err) {
            console.error("Failed to fetch subcategories", err);
        } finally {
            setLoading(false);
        }
    }, [page, searchTerm, filterMainCategory]);

    useEffect(() => {
        fetchMainCategories();
    }, [fetchMainCategories]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Reset to page 1 when filter or search changes
    useEffect(() => {
        setPage(1);
    }, [searchTerm, filterMainCategory]);

    const handleCreateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!selectedMainCategoryId) { setError('Please select a main category'); return; }
        if (!newName.trim()) { setError('Name is required'); return; }

        try {
            const data = await apiFetch(`/main-categories/${selectedMainCategoryId}/main-subcategories`, {
                method: 'POST',
                body: JSON.stringify({ name: newName })
            });
            if (data.success) {
                fetchData();
                setIsCreateModalOpen(false);
                setNewName('');
                setSelectedMainCategoryId('');
            } else {
                setError(data.error || 'Failed to create');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create');
        }
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingItem) return;
        try {
            const data = await apiFetch(`/main-subcategories/${editingItem._id}`, {
                method: 'PUT',
                body: JSON.stringify({ name: editName, mainCategory: editMainCategoryId })
            });
            if (data.success) { fetchData(); setEditingItem(null); }
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to update');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this subcategory?')) return;
        try {
            await apiFetch(`/main-subcategories/${id}`, { method: 'DELETE' });
            fetchData();
        } catch { alert('Failed to delete'); }
    };

    const handleToggleStatus = async (item: MainSubcategory) => {
        try {
            const data = await apiFetch(`/main-subcategories/${item._id}`, {
                method: 'PUT',
                body: JSON.stringify({ isActive: !item.isActive })
            });
            if (data.success) fetchData();
        } catch { alert('Failed to update status'); }
    };

    const openEditModal = (item: MainSubcategory) => {
        setEditingItem(item);
        setEditName(item.name);
        const parentId = typeof item.mainCategory === 'string' ? item.mainCategory : item.mainCategory._id;
        setEditMainCategoryId(parentId);
    };

    return (
        <div className="space-y-6 text-slate-800">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Main Category → Subcategories</h1>
                    <p className="text-slate-500 text-sm mt-1">Found {totalItems} subcategories</p>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-teal-500 hover:bg-teal-600 text-white font-medium py-2 px-4 rounded shadow transition-colors"
                >
                    Add Subcategory
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded border border-slate-200 shadow-sm">
                <div className="relative w-full md:w-1/2">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <Search className="w-5 h-5 text-slate-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full p-2.5 pl-10 text-sm text-slate-900 border border-slate-300 rounded focus:ring-teal-500 focus:border-teal-500 bg-slate-50"
                        placeholder="Search by subcategory name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="relative w-full md:w-1/2">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <Filter className="w-4 h-4 text-slate-400" />
                    </div>
                    <select
                        className="block w-full p-2.5 pl-10 text-sm font-medium text-slate-900 border border-slate-300 rounded focus:ring-teal-500 focus:border-teal-500 bg-white"
                        value={filterMainCategory}
                        onChange={(e) => setFilterMainCategory(e.target.value)}
                    >
                        <option value="" className="text-slate-800">Filter by Main Category</option>
                        {mainCategories.map((cat) => (
                            <option key={cat._id} value={cat._id} className="text-slate-800 font-medium">
                                {cat.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="bg-white rounded border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-sm">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-slate-700">
                                <th className="py-4 px-6 font-bold uppercase tracking-wider w-20">No.</th>
                                <th className="py-4 px-6 font-bold uppercase tracking-wider">Main Category</th>
                                <th className="py-4 px-6 font-bold uppercase tracking-wider">Subcategory Name</th>
                                <th className="py-4 px-6 font-bold uppercase tracking-wider w-40 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr><td colSpan={4} className="py-20 text-center text-slate-500">Loading data...</td></tr>
                            ) : subcategories.length === 0 ? (
                                <tr><td colSpan={4} className="py-20 text-center text-slate-500 font-medium">No results found for your search/filter.</td></tr>
                            ) : (
                                subcategories.map((item, index) => {
                                    const mainCatName = typeof item.mainCategory === 'object' ? item.mainCategory.name : 'Unknown';
                                    return (
                                        <tr key={item._id} className={`hover:bg-slate-50/80 transition-colors ${!item.isActive ? 'opacity-50' : ''}`}>
                                            <td className="py-4 px-6 text-slate-500">{(page - 1) * limit + index + 1}</td>
                                            <td className="py-4 px-6">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                                                    {mainCatName}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 font-bold text-slate-900">{item.name}</td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button onClick={() => openEditModal(item)} className="p-2 transition-colors bg-teal-50 text-teal-600 rounded-lg hover:bg-teal-500 hover:text-white" title="Edit">
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button onClick={() => handleDelete(item._id)} className="p-2 transition-colors bg-red-50 text-red-600 rounded-lg hover:bg-red-500 hover:text-white" title="Delete">
                                                        <Trash2 size={16} />
                                                    </button>
                                                    <button onClick={() => handleToggleStatus(item)} className={`p-2 transition-colors rounded-lg ${item.isActive ? 'bg-orange-50 text-orange-600 hover:bg-orange-500 hover:text-white' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white'}`} title={item.isActive ? "Deactivate" : "Activate"}>
                                                        {item.isActive ? <X size={16} /> : <Check size={16} />}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {!loading && subcategories.length > 0 && (
                    <div className="px-6 py-4 bg-white border-t border-slate-100 flex items-center justify-between">
                        <div className="text-sm text-slate-600">
                            Showing page <span className="font-bold text-slate-900">{page}</span> of <span className="font-bold text-slate-900">{totalPages}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className={`p-2 rounded-lg border transition-all ${page === 1 ? 'border-slate-100 text-slate-300 cursor-not-allowed' : 'border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 shadow-sm'}`}
                            >
                                <ChevronLeft size={20} />
                            </button>
                            
                            <div className="flex items-center gap-1.5 mx-2">
                                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                                    let pageNum = page;
                                    if (totalPages <= 5) pageNum = i + 1;
                                    else if (page <= 3) pageNum = i + 1;
                                    else if (page >= totalPages - 2) pageNum = totalPages - 4 + i;
                                    else pageNum = page - 2 + i;

                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => setPage(pageNum)}
                                            className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-bold transition-all ${page === pageNum ? 'bg-teal-500 text-white shadow-md shadow-teal-100' : 'bg-white text-slate-600 border border-slate-200 hover:border-teal-400 hover:text-teal-600'}`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                            </div>

                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className={`p-2 rounded-lg border transition-all ${page === totalPages ? 'border-slate-100 text-slate-300 cursor-not-allowed' : 'border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 shadow-sm'}`}
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modals are unchanged except for styling tweaks */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-slate-100">
                        <div className="bg-white px-8 py-6 border-b border-slate-100 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-slate-800">Add New Subcategory</h2>
                            <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-50 transition-colors"><X size={24} /></button>
                        </div>
                        <div className="p-8">
                            {error && <div className="mb-6 p-4 bg-red-50 text-red-700 text-sm rounded-xl border border-red-100 flex items-center gap-2 font-medium">
                                <X size={16} /> {error}
                            </div>}
                            <form onSubmit={handleCreateSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 ml-1 uppercase tracking-wider">Main Category</label>
                                    <select
                                        value={selectedMainCategoryId}
                                        onChange={(e) => setSelectedMainCategoryId(e.target.value)}
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all font-medium"
                                        required
                                    >
                                        <option value="" disabled>Select parent category...</option>
                                        {mainCategories.map(cat => (
                                            <option key={cat._id} value={cat._id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 ml-1 uppercase tracking-wider">Subcategory Name</label>
                                    <input
                                        type="text"
                                        value={newName}
                                        onChange={(e) => setNewName(e.target.value)}
                                        placeholder="Enter name (e.g. Chinese Restaurant)"
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all font-medium"
                                        required
                                    />
                                </div>
                                <button type="submit" className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-teal-100 transition-all transform active:scale-[0.98] mt-4">Save Subcategory</button>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {editingItem && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-slate-100">
                        <div className="bg-white px-8 py-6 border-b border-slate-100 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-slate-800">Edit Subcategory</h2>
                            <button onClick={() => setEditingItem(null)} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-50 transition-colors"><X size={24} /></button>
                        </div>
                        <div className="p-8">
                            <form onSubmit={handleEditSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 ml-1 uppercase tracking-wider">Main Category</label>
                                    <select
                                        value={editMainCategoryId}
                                        onChange={(e) => setEditMainCategoryId(e.target.value)}
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all font-medium"
                                        required
                                    >
                                        <option value="" disabled>Select parent category...</option>
                                        {mainCategories.map(cat => (
                                            <option key={cat._id} value={cat._id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 ml-1 uppercase tracking-wider">Subcategory Name</label>
                                    <input
                                        type="text"
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all font-medium"
                                        required
                                    />
                                </div>
                                <div className="flex gap-4 pt-4">
                                    <button type="button" onClick={() => setEditingItem(null)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-4 rounded-xl transition-all">Cancel</button>
                                    <button type="submit" className="flex-[2] bg-teal-500 hover:bg-teal-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-teal-100 transition-all">Update Changes</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
