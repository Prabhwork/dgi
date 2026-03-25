"use client";

import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '@/lib/api';
import { Edit2, Trash2, X, Check, Search, Filter } from 'lucide-react';

interface ParentCategory {
    _id: string;
    name: string;
    isActive: boolean;
}

interface Subcategory {
    _id: string;
    name: string;
    category: ParentCategory | string;
    isActive: boolean;
}

export default function SubcategoriesPage() {
    const [categories, setCategories] = useState<ParentCategory[]>([]);
    const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
    const [loading, setLoading] = useState(true);

    // Search & Filter state
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('');

    // Create Modal state
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedMainCategoryId, setSelectedMainCategoryId] = useState('');
    const [newSubcategoryName, setNewSubcategoryName] = useState('');
    const [catSearchQuery, setCatSearchQuery] = useState('');
    const [showCatResults, setShowCatResults] = useState(false);
    const [error, setError] = useState('');

    // Edit Modal state
    const [editingSubcategory, setEditingSubcategory] = useState<Subcategory | null>(null);
    const [editName, setEditName] = useState('');
    const [editMainCategoryId, setEditMainCategoryId] = useState('');
    const [editCatSearchQuery, setEditCatSearchQuery] = useState('');
    const [showEditCatResults, setShowEditCatResults] = useState(false);

    const fetchInitialData = useCallback(async () => {
        setLoading(true);
        try {
            const [catsRes, subcatsRes] = await Promise.all([
                apiFetch('/categories?limit=200'),
                apiFetch('/subcategories')
            ]);

            if (catsRes.success) setCategories(catsRes.data);
            if (subcatsRes.success) setSubcategories(subcatsRes.data);
        } catch (err) {
            console.error("Failed to fetch data", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchInitialData();
    }, [fetchInitialData]);

    const handleCreateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!selectedMainCategoryId) {
            setError('Please select a main category');
            return;
        }
        if (!newSubcategoryName.trim()) {
            setError('Subcategory name is required');
            return;
        }

        try {
            const data = await apiFetch(`/categories/${selectedMainCategoryId}/subcategories`, {
                method: 'POST',
                body: JSON.stringify({ name: newSubcategoryName, description: newSubcategoryName })
            });

            if (data.success) {
                fetchInitialData();
                setIsCreateModalOpen(false);
                setNewSubcategoryName('');
                setSelectedMainCategoryId('');
            } else {
                setError(data.error || 'Failed to create subcategory');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create subcategory');
        }
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingSubcategory) return;

        try {
            const data = await apiFetch(`/subcategories/${editingSubcategory._id}`, {
                method: 'PUT',
                body: JSON.stringify({
                    name: editName,
                    description: editName,
                    mainCategory: editMainCategoryId
                })
            });

            if (data.success) {
                fetchInitialData();
                setEditingSubcategory(null);
                setEditName('');
                setEditMainCategoryId('');
            }
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to update subcategory');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this subcategory?')) return;
        try {
            await apiFetch(`/subcategories/${id}`, { method: 'DELETE' });
            setSubcategories(subcategories.filter(s => s._id !== id));
        } catch {
            alert('Failed to delete subcategory');
        }
    };

    const handleToggleStatus = async (subcat: Subcategory) => {
        try {
            const data = await apiFetch(`/subcategories/${subcat._id}`, {
                method: 'PUT',
                body: JSON.stringify({ isActive: !subcat.isActive })
            });
            if (data.success) fetchInitialData();
        } catch {
            alert('Failed to update status');
        }
    };

    const openEditModal = (subcat: Subcategory) => {
        setEditingSubcategory(subcat);
        setEditName(subcat.name);
        const parentId = typeof subcat.category === 'string' ? subcat.category : subcat.category._id;
        const parentName = typeof subcat.category === 'object' ? subcat.category.name : '';
        setEditMainCategoryId(parentId);
        setEditCatSearchQuery(parentName);
    };

    // Filtered subcategories
    const filtered = subcategories.filter(subcat => {
        const parentCatName = typeof subcat.category === 'object' ? subcat.category.name : '';
        const parentCatId = typeof subcat.category === 'object' ? subcat.category._id : subcat.category;
        const matchSearch = subcat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            parentCatName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchFilter = filterCategory ? parentCatId === filterCategory : true;
        return matchSearch && matchFilter;
    });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-800">Sub Category Details</h1>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-teal-500 hover:bg-teal-600 text-white font-medium py-2 px-4 rounded shadow transition-colors flex items-center gap-2"
                >
                    Add Sub Category
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
                        placeholder="Search subcategories..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="relative w-full md:w-1/3">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <Filter className="w-4 h-4 text-slate-400" />
                    </div>
                    <select
                        className="block w-full p-2.5 pl-10 text-sm text-slate-900 border border-slate-300 rounded focus:ring-teal-500 focus:border-teal-500 bg-slate-50 appearance-none"
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                    >
                        <option value="">All Categories</option>
                        {categories.map((cat: ParentCategory) => (
                            <option key={cat._id} value={cat._id}>{cat.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="bg-white rounded border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-sm min-w-[700px]">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-slate-700">
                                <th className="py-3 px-6 font-semibold w-24">Seq. No</th>
                                <th className="py-3 px-6 font-semibold">Category</th>
                                <th className="py-3 px-6 font-semibold">Sub Category Name</th>
                                <th className="py-3 px-6 font-semibold w-48">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="py-8 text-center text-slate-500">Loading subcategories...</td>
                                </tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="py-8 text-center text-slate-500">No subcategories found.</td>
                                </tr>
                            ) : (
                                filtered.map((subcat, index) => {
                                    const parentCatName = typeof subcat.category === 'object' ? subcat.category.name : 'Unknown';
                                    return (
                                        <tr key={subcat._id} className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${!subcat.isActive ? 'opacity-60 bg-slate-50/50' : ''}`}>
                                            <td className="py-3 px-6 text-slate-600">{index + 1}</td>
                                            <td className="py-3 px-6 text-slate-600">{parentCatName}</td>
                                            <td className="py-3 px-6 font-medium text-slate-800">{subcat.name}</td>
                                            <td className="py-3 px-6">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => openEditModal(subcat)}
                                                        className="p-1.5 bg-teal-400 text-white rounded hover:bg-teal-500 transition-colors" title="Edit"
                                                    >
                                                        <Edit2 size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(subcat._id)}
                                                        className="p-1.5 bg-red-400 text-white rounded hover:bg-red-500 transition-colors" title="Delete"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleToggleStatus(subcat)}
                                                        className={`p-1.5 text-white rounded transition-colors ${subcat.isActive ? 'bg-red-400 hover:bg-red-500' : 'bg-slate-400 hover:bg-slate-500'}`}
                                                        title={subcat.isActive ? "Deactivate" : "Activate"}
                                                    >
                                                        {subcat.isActive ? <Check size={14} /> : <X size={14} />}
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
            </div>

            {/* Create Subcategory Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white w-full max-w-lg rounded shadow-xl overflow-hidden">
                        <div className="bg-teal-500 text-white px-6 py-4 flex justify-between items-center">
                            <h2 className="text-xl font-medium">Add Sub Category</h2>
                            <button onClick={() => setIsCreateModalOpen(false)} className="text-teal-100 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6">
                            {error && <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded border border-red-100">{error}</div>}
                            <form onSubmit={handleCreateSubmit} className="space-y-6">
                                <div className="flex flex-col md:flex-row md:items-start gap-4">
                                    <label className="text-slate-600 font-medium md:w-1/3 mt-2">Category</label>
                                    <div className="flex-1 relative">
                                        <input
                                            type="text"
                                            value={catSearchQuery}
                                            onChange={(e) => {
                                                setCatSearchQuery(e.target.value);
                                                setShowCatResults(true);
                                            }}
                                            onFocus={() => setShowCatResults(true)}
                                            placeholder="Search category..."
                                            className="w-full px-4 py-2 border border-slate-300 rounded text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500 bg-white"
                                            required
                                        />
                                        {showCatResults && (
                                            <div className="absolute z-[70] left-0 right-0 mt-1 bg-white border border-slate-200 rounded shadow-xl max-h-48 overflow-y-auto">
                                                {categories
                                                    .filter(c => c.name.toLowerCase().includes(catSearchQuery.toLowerCase()))
                                                    .slice(0, 100) // Limit results for performance
                                                    .map(cat => (
                                                        <button
                                                            key={cat._id}
                                                            type="button"
                                                            onClick={() => {
                                                                setSelectedMainCategoryId(cat._id);
                                                                setCatSearchQuery(cat.name);
                                                                setShowCatResults(false);
                                                            }}
                                                            className={`w-full text-left px-4 py-2 hover:bg-teal-50 text-sm ${selectedMainCategoryId === cat._id ? 'bg-teal-50 text-teal-700 font-bold' : 'text-slate-700'}`}
                                                        >
                                                            {cat.name}
                                                        </button>
                                                    ))
                                                }
                                                {categories.filter(c => c.name.toLowerCase().includes(catSearchQuery.toLowerCase())).length === 0 && (
                                                    <div className="px-4 py-2 text-sm text-slate-500 italic">No category found</div>
                                                )}
                                            </div>
                                        )}
                                        {selectedMainCategoryId && (
                                            <div className="mt-1 text-xs text-teal-600 font-medium">Selected: {categories.find(c => c._id === selectedMainCategoryId)?.name}</div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-col md:flex-row md:items-center gap-4">
                                    <label className="text-slate-600 font-medium md:w-1/3">Sub Category Name</label>
                                    <input
                                        type="text"
                                        value={newSubcategoryName}
                                        onChange={(e) => setNewSubcategoryName(e.target.value)}
                                        placeholder="Enter Sub Category Name"
                                        className="flex-1 px-4 py-2 border border-slate-300 rounded text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
                                        required
                                    />
                                </div>

                                <div className="flex md:pl-[33%] pl-0 pt-2">
                                    <button type="submit" className="bg-teal-500 hover:bg-teal-600 text-white font-medium py-2 px-8 rounded transition-colors">
                                        Submit
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Subcategory Modal */}
            {editingSubcategory && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white w-full max-w-lg rounded shadow-xl overflow-hidden">
                        <div className="bg-teal-500 text-white px-6 py-4 flex justify-between items-center">
                            <h2 className="text-xl font-medium">Edit Sub Category</h2>
                            <button onClick={() => setEditingSubcategory(null)} className="text-teal-100 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6">
                            <form onSubmit={handleEditSubmit} className="space-y-6">
                                <div className="flex flex-col md:flex-row md:items-start gap-4">
                                    <label className="text-slate-600 font-medium md:w-1/3 mt-2">Main Category</label>
                                    <div className="flex-1 relative">
                                        <input
                                            type="text"
                                            value={editCatSearchQuery}
                                            onChange={(e) => {
                                                setEditCatSearchQuery(e.target.value);
                                                setShowEditCatResults(true);
                                            }}
                                            onFocus={() => setShowEditCatResults(true)}
                                            placeholder="Search category..."
                                            className="w-full px-4 py-2 border border-slate-300 rounded text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500 bg-white"
                                            required
                                        />
                                        {showEditCatResults && (
                                            <div className="absolute z-[70] left-0 right-0 mt-1 bg-white border border-slate-200 rounded shadow-xl max-h-48 overflow-y-auto">
                                                {categories
                                                    .filter(c => c.name.toLowerCase().includes(editCatSearchQuery.toLowerCase()))
                                                    .slice(0, 100)
                                                    .map(cat => (
                                                        <button
                                                            key={cat._id}
                                                            type="button"
                                                            onClick={() => {
                                                                setEditMainCategoryId(cat._id);
                                                                setEditCatSearchQuery(cat.name);
                                                                setShowEditCatResults(false);
                                                            }}
                                                            className={`w-full text-left px-4 py-2 hover:bg-teal-50 text-sm ${editMainCategoryId === cat._id ? 'bg-teal-50 text-teal-700 font-bold' : 'text-slate-700'}`}
                                                        >
                                                            {cat.name}
                                                        </button>
                                                    ))
                                                }
                                                {categories.filter(c => c.name.toLowerCase().includes(editCatSearchQuery.toLowerCase())).length === 0 && (
                                                    <div className="px-4 py-2 text-sm text-slate-500 italic">No category found</div>
                                                )}
                                            </div>
                                        )}
                                        {editMainCategoryId && (
                                            <div className="mt-1 text-xs text-teal-600 font-medium">Selected: {categories.find(c => c._id === editMainCategoryId)?.name}</div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-col md:flex-row md:items-center gap-4">
                                    <label className="text-slate-600 font-medium md:w-1/3">Sub Category Name</label>
                                    <input
                                        type="text"
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        placeholder="Enter Sub Category Name"
                                        className="flex-1 px-4 py-2 border border-slate-300 rounded text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
                                        required
                                    />
                                </div>

                                <div className="flex md:pl-[33%] pl-0 pt-2 gap-3">
                                    <button type="submit" className="bg-teal-500 hover:bg-teal-600 text-white font-medium py-2 px-8 rounded transition-colors">
                                        Update
                                    </button>
                                    <button type="button" onClick={() => setEditingSubcategory(null)} className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium py-2 px-6 rounded transition-colors">
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
