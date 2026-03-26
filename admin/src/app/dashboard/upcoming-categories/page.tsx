"use client";

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { UpcomingCategory, Category } from '@/types';
import * as LucideIcons from 'lucide-react';
import { Plus, Edit2, Trash2, X, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type EditorComponentType = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ClassicEditorType = any;

let CKEditorComponent: EditorComponentType = null;
let ClassicEditorClass: ClassicEditorType = null;

// Available Lucide icon names for the dropdown
const ICON_OPTIONS = [
    'TrendingUp', 'Rocket', 'CalendarClock', 'MapPin', 'Navigation',
    'GraduationCap', 'Briefcase', 'Building2', 'Wallet', 'UserCheck',
    'Building', 'CreditCard', 'ShoppingCart', 'Heart', 'Star',
    'Zap', 'Globe', 'Shield', 'Award', 'Target',
    'BookOpen', 'Truck', 'Phone', 'Camera', 'Music',
    'Film', 'Monitor', 'Cpu', 'Database', 'Cloud',
    'Gift', 'Coffee', 'Smile', 'ThumbsUp', 'Bell',
    'Layers', 'Package', 'Compass', 'Map', 'Home'
];

// Helper to render dynamic icons by name
const DynamicIcon = ({ name, size = 20, className = "" }: { name: string, size?: number, className?: string }) => {
    const IconComponent = (LucideIcons as any)[name] || LucideIcons.HelpCircle;
    return <IconComponent size={size} className={className} />;
};

export default function UpcomingCategoriesPage() {
    const [upcomingCategories, setUpcomingCategories] = useState<UpcomingCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<UpcomingCategory | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [editorLoaded, setEditorLoaded] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        icon: 'Rocket',
        description: '',
        category: '',
        order: 0,
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
        fetchUpcomingCategories();
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const data = await apiFetch('/categories?limit=100');
            if (data.success) setCategories(data.data);
        } catch (err) { console.error(err); }
    };

    const fetchUpcomingCategories = async () => {
        try {
            setLoading(true);
            const data = await apiFetch('/upcoming-categories');
            if (data.success) setUpcomingCategories(data.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
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

        if (!formData.title) {
            setError('Please add a title');
            setSubmitting(false);
            return;
        }

        try {
            const body = new FormData();
            body.append('title', formData.title);
            body.append('icon', formData.icon);
            if (formData.description) body.append('description', formData.description);
            if (formData.category) body.append('category', formData.category);
            body.append('order', formData.order.toString());
            body.append('isActive', formData.isActive.toString());
            if (formData.image) body.append('image', formData.image);

            const url = editingItem ? `/upcoming-categories/${editingItem._id}` : '/upcoming-categories';
            const method = editingItem ? 'PUT' : 'POST';
            const token = localStorage.getItem('adminToken');

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${url}`, {
                method,
                headers: { 'Authorization': `Bearer ${token}` },
                body
            });
            const data = await response.json();

            if (data.success) {
                fetchUpcomingCategories();
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

    const handleEdit = (item: UpcomingCategory) => {
        setEditingItem(item);
        const catId = typeof item.category === 'object' ? item.category?._id : item.category;

        setFormData({
            title: item.title,
            icon: item.icon || 'Rocket',
            description: item.description || '',
            category: catId || '',
            order: item.order || 0,
            image: null,
            isActive: item.isActive
        });

        if (item.image && item.image !== 'no-photo.jpg') {
            const baseUrl = (process.env.NEXT_PUBLIC_API_URL || '').replace('/api', '');
            const imagePath = (item.image || '').startsWith('uploads') ? item.image : 'uploads/' + item.image;
            setImagePreview(`${baseUrl}/${imagePath}`);
        }
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this upcoming category?')) return;
        try {
            const data = await apiFetch(`/upcoming-categories/${id}`, { method: 'DELETE' });
            if (data.success) setUpcomingCategories(upcomingCategories.filter(d => d._id !== id));
        } catch { alert('Failed to delete'); }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
        setFormData({ title: '', icon: 'Rocket', description: '', category: '', order: 0, image: null, isActive: true });
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

            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold text-slate-100">Upcoming Categories</h1>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-teal-500 hover:bg-teal-600 text-white font-medium py-2 px-4 rounded-xl shadow-lg transition-all flex items-center gap-2"
                >
                    <Plus size={18} /> Add New
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {loading ? (
                    <div className="col-span-full py-20 text-center text-slate-400">Loading your premium categories...</div>
                ) : upcomingCategories.length === 0 ? (
                    <div className="col-span-full py-20 text-center text-slate-400">No categories found. Start by adding one!</div>
                ) : (
                    <>
                        {upcomingCategories.map((item) => (
                            <div 
                                key={item._id} 
                                className="group relative bg-[#0a0f1e] border border-slate-800 rounded-2xl p-6 transition-all hover:border-teal-500/50 hover:shadow-[0_0_20px_rgba(20,184,166,0.1)] flex flex-col h-full"
                            >
                                {/* Header with Icon */}
                                <div className="mb-6">
                                    <div className="w-10 h-10 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-400">
                                        <DynamicIcon name={item.icon || 'Rocket'} size={24} />
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-teal-400 transition-colors">
                                        {item.title}
                                    </h3>
                                    <div 
                                        className="text-slate-400 text-sm leading-relaxed line-clamp-4"
                                        dangerouslySetInnerHTML={{ __html: item.description || '' }}
                                    />
                                </div>

                                {/* Order & Status Badge */}
                                <div className="mt-6 flex items-center justify-between">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                        Order: {item.order}
                                    </span>
                                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${item.isActive ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                                        {item.isActive ? 'Active' : 'Draft'}
                                    </span>
                                </div>

                                {/* Action Buttons - Visible on Hover for Desktop */}
                                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); handleEdit(item); }}
                                        className="p-2 bg-slate-800/80 hover:bg-teal-500 text-white rounded-lg transition-colors"
                                        title="Edit"
                                    >
                                        <Edit2 size={14} />
                                    </button>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); handleDelete(item._id); }}
                                        className="p-2 bg-slate-800/80 hover:bg-red-500 text-white rounded-lg transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}

                        {/* Request New Category Card */}
                        <div 
                            onClick={() => setIsModalOpen(true)}
                            className="bg-[#0a0f1e]/50 border-2 border-dashed border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-teal-500/50 hover:bg-[#0a0f1e] transition-all group min-h-[250px]"
                        >
                            <div className="w-12 h-12 rounded-full border border-slate-700 flex items-center justify-center text-slate-500 group-hover:text-teal-400 group-hover:border-teal-400 transition-all">
                                <Plus size={24} />
                            </div>
                            <span className="text-slate-400 font-medium group-hover:text-white transition-colors">Request New Category</span>
                        </div>
                    </>
                )}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
                    <div className="bg-white w-full max-w-4xl rounded shadow-xl overflow-hidden my-8">
                        <div className="bg-teal-500 text-white px-6 py-4 flex justify-between items-center">
                            <h2 className="text-xl font-medium">{editingItem ? 'Edit Upcoming Category' : 'Add New Upcoming Category'}</h2>
                            <button onClick={handleCloseModal} className="text-teal-100 hover:text-white"><X size={20} /></button>
                        </div>
                        <div className="p-6">
                            {error && <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded border border-red-100">{error}</div>}
                            <form onSubmit={handleSubmit} className="space-y-5">

                                <div className="flex flex-col md:flex-row md:items-center gap-4">
                                    <label className="text-slate-700 font-bold md:w-1/3">Title *</label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                        className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg text-slate-900 bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none shadow-sm"
                                        placeholder="e.g. Grow Your Existing Business"
                                        required
                                    />
                                </div>

                                <div className="flex flex-col md:flex-row md:items-center gap-4">
                                    <label className="text-slate-700 font-bold md:w-1/3">Icon Name</label>
                                    <select
                                        value={formData.icon}
                                        onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                                        className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg text-slate-900 bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none shadow-sm"
                                    >
                                        {ICON_OPTIONS.map(icon => <option key={icon} value={icon}>{icon}</option>)}
                                    </select>
                                </div>

                                <div className="flex flex-col md:flex-row md:items-center gap-4">
                                    <label className="text-slate-700 font-bold md:w-1/3">Category (optional)</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                                        className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg text-slate-900 bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none shadow-sm"
                                    >
                                        <option value="">None</option>
                                        {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
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
                                                onChange={(_event: unknown, editor: { getData: () => string }) => {
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
                                        <span className="text-sm text-slate-600">{formData.isActive ? 'Active' : 'Inactive'}</span>
                                    </label>
                                </div>

                                <div className="flex flex-col md:flex-row md:items-start gap-4 pt-2">
                                    <label className="text-slate-700 font-bold md:w-1/3 pt-1">Upload Image</label>
                                    <div className="flex-1 flex items-start gap-4">
                                        <div className="flex-1">
                                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
                                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                    <ImageIcon className="w-8 h-8 text-slate-400 mb-2" />
                                                    <p className="text-sm text-slate-500 font-medium">Click to upload</p>
                                                    <p className="text-xs text-slate-400">PNG, JPG or WEBP (Max 5MB)</p>
                                                </div>
                                                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                                            </label>
                                        </div>
                                        {imagePreview && (
                                            <div className="w-32 h-32 rounded-lg border border-slate-200 overflow-hidden relative group shrink-0">
                                                <Image src={imagePreview} alt="Preview" width={128} height={128} className="w-full h-full object-cover" />
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
                                        {submitting ? 'Submitting...' : editingItem ? 'Update' : 'Submit'}
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
