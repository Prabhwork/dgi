"use client";

import { useState, useEffect, useRef } from 'react';
import { apiFetch } from '@/lib/api';
import { PageDetail, Category, Subcategory } from '@/types';
import { Plus, Edit2, Trash2, X, Image as ImageIcon } from 'lucide-react';

let CKEditorComponent: any = null;
let ClassicEditorClass: any = null;

export default function PageDetailsPage() {
    const [pageDetails, setPageDetails] = useState<PageDetail[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDetail, setEditingDetail] = useState<PageDetail | null>(null);
    const [editorLoaded, setEditorLoaded] = useState(false);

    const [categories, setCategories] = useState<Category[]>([]);
    const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
    const [filteredSubcategories, setFilteredSubcategories] = useState<Subcategory[]>([]);

    const [formData, setFormData] = useState({
        category: '',
        subcategory: '',
        description: '',
        image: null as File | null,
        isActive: true
    });
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        Promise.all([
            import('@ckeditor/ckeditor5-react').then(m => { CKEditorComponent = m.CKEditor; }),
            import('@ckeditor/ckeditor5-build-classic').then(m => { ClassicEditorClass = m.default; }),
        ]).then(() => setEditorLoaded(true))
            .catch(err => console.error('CKEditor load error:', err));
    }, []);

    useEffect(() => {
        fetchPageDetails();
        fetchCategories();
        fetchSubcategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const data = await apiFetch('/categories?limit=100');
            if (data.success) setCategories(data.data);
        } catch (err) { console.error(err); }
    };

    const fetchSubcategories = async () => {
        try {
            const data = await apiFetch('/subcategories?limit=500');
            if (data.success) setSubcategories(data.data);
        } catch (err) { console.error(err); }
    };

    const fetchPageDetails = async () => {
        try {
            setLoading(true);
            const data = await apiFetch('/page-details');
            if (data.success) setPageDetails(data.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const handleCategoryChange = (categoryId: string) => {
        setFormData(prev => ({ ...prev, category: categoryId, subcategory: '' }));
        const filtered = subcategories.filter(sub => {
            const id = typeof sub.category === 'object' ? sub.category._id : sub.category;
            return id === categoryId;
        });
        setFilteredSubcategories(filtered);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            const file = e.target.files[0];
            setFormData(prev => ({ ...prev, image: file }));
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const insertTableTemplate = () => {
        const tableHtml = `<table><thead><tr><th>Feature</th><th>Traditional</th><th>Instant Digital</th></tr></thead><tbody><tr><td>Feature Name</td><td>Slow / Offline</td><td>Fast / Online</td></tr></tbody></table><p>&nbsp;</p>`;
        setFormData(prev => ({ ...prev, description: prev.description + tableHtml }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);

        if (!formData.category || !formData.description) {
            setError('Please fill in all required fields (Category and Description)');
            setSubmitting(false);
            return;
        }

        try {
            const body = new FormData();
            body.append('category', formData.category);
            if (formData.subcategory) body.append('subcategory', formData.subcategory);
            body.append('description', formData.description);
            body.append('isActive', formData.isActive.toString());
            if (formData.image) body.append('image', formData.image);

            const url = editingDetail ? `/page-details/${editingDetail._id}` : '/page-details';
            const method = editingDetail ? 'PUT' : 'POST';
            const token = localStorage.getItem('adminToken');

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${url}`, {
                method,
                headers: { 'Authorization': `Bearer ${token}` },
                body
            });
            const data = await response.json();

            if (data.success) {
                fetchPageDetails();
                handleCloseModal();
            } else {
                setError(data.error || 'Failed to save page detail');
            }
        } catch (err: any) {
            setError(err.message || 'Something went wrong');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (detail: PageDetail) => {
        setEditingDetail(detail);
        const catId = typeof detail.category === 'object' ? detail.category._id : detail.category;
        const subId = typeof detail.subcategory === 'object' ? detail.subcategory?._id : detail.subcategory;

        setFormData({
            category: catId,
            subcategory: subId || '',
            description: detail.description,
            image: null,
            isActive: detail.isActive
        });

        const filtered = subcategories.filter(sub => {
            const id = typeof sub.category === 'object' ? sub.category._id : sub.category;
            return id === catId;
        });
        setFilteredSubcategories(filtered);

        if (detail.image) {
            setImagePreview(`${process.env.NEXT_PUBLIC_API_URL}/uploads/${detail.image}`);
        }
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this page detail?')) return;
        try {
            const data = await apiFetch(`/page-details/${id}`, { method: 'DELETE' });
            if (data.success) setPageDetails(pageDetails.filter(d => d._id !== id));
        } catch { alert('Failed to delete'); }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingDetail(null);
        setFormData({ category: '', subcategory: '', description: '', image: null, isActive: true });
        setImagePreview(null);
        setError('');
    };

    const editorConfig = {
        toolbar: [
            'heading', '|',
            'bold', 'italic', 'underline', 'strikethrough', '|',
            'bulletedList', 'numberedList', '|',
            'outdent', 'indent', '|',
            'link', '|',
            'insertTable', '|',
            'blockQuote', '|',
            'undo', 'redo'
        ],
        table: {
            contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells']
        }
    };

    return (
        <div className="space-y-6">
            <style>{`
                .ck-editor__editable_inline {
                    min-height: 280px !important;
                    color: #0f172a !important;
                    font-size: 15px;
                    padding: 12px 16px !important;
                }
                .ck-editor__editable table {
                    border-collapse: collapse !important;
                    width: 100% !important;
                    margin: 12px 0 !important;
                }
                .ck-editor__editable table td,
                .ck-editor__editable table th {
                    border: 1px solid #cbd5e1 !important;
                    padding: 10px 14px !important;
                    text-align: left !important;
                    min-width: 80px;
                }
                .ck-editor__editable table th {
                    background-color: #f8fafc !important;
                    font-weight: 600 !important;
                }
                .ck.ck-editor {
                    border: 1px solid #cbd5e1 !important;
                    border-radius: 8px !important;
                    overflow: hidden;
                }
                .ck.ck-toolbar {
                    border-bottom: 1px solid #e2e8f0 !important;
                    background: #f8fafc !important;
                }
            `}</style>

            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-800">Page Details</h1>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-teal-500 hover:bg-teal-600 text-white font-medium py-2 px-4 rounded shadow transition-colors flex items-center gap-2"
                >
                    <Plus size={18} /> Add New
                </button>
            </div>

            <div className="bg-white rounded border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-sm min-w-[700px]">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-slate-700">
                                <th className="py-3 px-6 font-semibold w-24">Seq.</th>
                                <th className="py-3 px-6 font-semibold">Category</th>
                                <th className="py-3 px-6 font-semibold">Subcategory</th>
                                <th className="py-3 px-6 font-semibold">Preview</th>
                                <th className="py-3 px-6 font-semibold w-32">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={5} className="py-8 text-center text-slate-500">Loading...</td></tr>
                            ) : pageDetails.length === 0 ? (
                                <tr><td colSpan={5} className="py-8 text-center text-slate-500">No page details found.</td></tr>
                            ) : (
                                pageDetails.map((detail, index) => (
                                    <tr key={detail._id} className="border-b border-slate-100 hover:bg-slate-50">
                                        <td className="py-3 px-6 text-slate-600">{index + 1}</td>
                                        <td className="py-3 px-6 text-slate-600 font-medium">
                                            {typeof detail.category === 'object' ? detail.category.name : 'N/A'}
                                        </td>
                                        <td className="py-3 px-6 text-slate-800 font-bold">
                                            {typeof detail.subcategory === 'object' ? detail.subcategory?.name : 'N/A'}
                                        </td>
                                        <td className="py-3 px-6 max-w-xs truncate text-slate-500">
                                            <div dangerouslySetInnerHTML={{ __html: detail.description.substring(0, 100) + '...' }} />
                                        </td>
                                        <td className="py-3 px-6">
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => handleEdit(detail)} className="p-1.5 bg-teal-400 text-white rounded hover:bg-teal-500"><Edit2 size={14} /></button>
                                                <button onClick={() => handleDelete(detail._id)} className="p-1.5 bg-red-400 text-white rounded hover:bg-red-500"><Trash2 size={14} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
                    <div className="bg-white w-full max-w-4xl rounded shadow-xl overflow-hidden my-8">
                        <div className="bg-teal-500 text-white px-6 py-4 flex justify-between items-center">
                            <h2 className="text-xl font-medium">{editingDetail ? 'Edit Page Detail' : 'Add New Page Detail'}</h2>
                            <button onClick={handleCloseModal} className="text-teal-100 hover:text-white"><X size={20} /></button>
                        </div>
                        <div className="p-6">
                            {error && <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded border border-red-100">{error}</div>}
                            <form onSubmit={handleSubmit} className="space-y-5">

                                <div className="flex flex-col md:flex-row md:items-center gap-4">
                                    <label className="text-slate-700 font-bold md:w-1/3">Select Category</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => handleCategoryChange(e.target.value)}
                                        className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg text-slate-900 bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none shadow-sm"
                                        required
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
                                    </select>
                                </div>

                                <div className="flex flex-col md:flex-row md:items-center gap-4">
                                    <label className="text-slate-700 font-bold md:w-1/3">Select Sub Category</label>
                                    <select
                                        value={formData.subcategory}
                                        onChange={(e) => setFormData(prev => ({ ...prev, subcategory: e.target.value }))}
                                        className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg text-slate-900 bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none shadow-sm disabled:bg-slate-50 disabled:text-slate-400"
                                        disabled={!formData.category}
                                    >
                                        <option value="">Select Sub Category</option>
                                        {filteredSubcategories.map(sub => <option key={sub._id} value={sub._id}>{sub.name}</option>)}
                                    </select>
                                </div>

                                <div className="flex flex-col md:flex-row gap-4">
                                    <div className="md:w-1/3 pt-2">
                                        <label className="text-slate-700 font-bold">Description / Content</label>
                                        <p className="text-xs text-slate-400 mt-1">Use the template button to quickly add comparison tables.</p>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-end mb-2">
                                            <button
                                                type="button"
                                                onClick={insertTableTemplate}
                                                className="text-xs bg-slate-100 hover:bg-teal-50 text-slate-600 hover:text-teal-600 px-3 py-1.5 rounded-lg border border-slate-200 transition-colors flex items-center gap-1.5 font-medium shadow-sm"
                                            >
                                                <Plus size={12} /> Insert Table Template
                                            </button>
                                        </div>
                                        {editorLoaded && CKEditorComponent && ClassicEditorClass ? (
                                            <CKEditorComponent
                                                editor={ClassicEditorClass}
                                                data={formData.description}
                                                config={editorConfig}
                                                onChange={(_: any, editor: any) => {
                                                    setFormData(prev => ({ ...prev, description: editor.getData() }));
                                                }}
                                            />
                                        ) : (
                                            <div className="border border-slate-300 rounded-lg p-4 min-h-[280px] flex items-center justify-center text-slate-400 text-sm">
                                                Loading editor...
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-col md:flex-row md:items-start gap-4 pt-4">
                                    <label className="text-slate-700 font-bold md:w-1/3 pt-1">Upload Image</label>
                                    <div className="flex-1 flex items-start gap-4">
                                        <div className="flex-1">
                                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
                                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                    <ImageIcon className="w-8 h-8 text-slate-400 mb-2" />
                                                    <p className="text-sm text-slate-500 font-medium">Click to upload or drag & drop</p>
                                                    <p className="text-xs text-slate-400">PNG, JPG or WEBP (Max 2MB)</p>
                                                </div>
                                                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                                            </label>
                                        </div>
                                        {imagePreview && (
                                            <div className="w-32 h-32 rounded-lg border border-slate-200 overflow-hidden relative group shrink-0">
                                                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                                <button
                                                    type="button"
                                                    onClick={() => { setImagePreview(null); setFormData(prev => ({ ...prev, image: null })); }}
                                                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                                                >
                                                    <X size={12} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex md:pl-[33%] pl-0 justify-start gap-3 pt-6 border-t border-slate-100">
                                    <button type="submit" disabled={submitting} className="px-8 py-2 bg-teal-500 hover:bg-teal-600 text-white font-medium rounded shadow transition-colors disabled:opacity-50 min-w-[120px]">
                                        {submitting ? 'Submitting...' : editingDetail ? 'Update' : 'Submit'}
                                    </button>
                                    <button type="button" onClick={handleCloseModal} className="px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded transition-colors">Cancel</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}