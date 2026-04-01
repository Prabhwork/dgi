"use client";

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { FunnelQuestion, FunnelOption } from '@/types';
import * as LucideIcons from 'lucide-react';
import { Plus, Edit2, Trash2, X, ChevronDown, ChevronUp } from 'lucide-react';

const ICON_OPTIONS = [
    'TrendingUp', 'Rocket', 'Users', 'BarChart3', 'Megaphone',
    'Briefcase', 'Layout', 'Globe', 'MoreHorizontal', 'DollarSign',
    'Target', 'ShieldCheck', 'Mail', 'Phone', 'User', 'Store'
];

const COLOR_OPTIONS = [
    { label: 'Blue Cyan', value: 'from-blue-500 to-cyan-400' },
    { label: 'Purple Pink', value: 'from-purple-500 to-pink-500' },
    { label: 'Emerald Teal', value: 'from-emerald-500 to-teal-400' },
    { label: 'Amber Orange', value: 'from-amber-500 to-orange-400' },
    { label: 'Rose Red', value: 'from-rose-500 to-red-500' },
    { label: 'Indigo Blue', value: 'from-indigo-400 to-blue-600' },
    { label: 'Slate Gray', value: 'from-slate-500 to-slate-600' }
];

const DynamicIcon = ({ name, size = 18, className = "" }: { name: string, size?: number, className?: string }) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const IconComponent = (LucideIcons as any)[name] || LucideIcons.HelpCircle;
    return <IconComponent size={size} className={className} />;
};

export default function FunnelQuestionsPage() {
    const [questions, setQuestions] = useState<FunnelQuestion[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<FunnelQuestion | null>(null);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        question: '',
        options: [] as FunnelOption[],
        order: 0,
        isActive: true
    });

    useEffect(() => {
        fetchQuestions();
    }, []);

    const fetchQuestions = async () => {
        try {
            setLoading(true);
            const data = await apiFetch('/funnel/questions');
            if (data.success) setQuestions(data.data);
        } catch { /* Silent catch */ }
        finally { setLoading(false); }
    };

    const addOption = () => {
        setFormData(prev => ({
            ...prev,
            options: [...prev.options, { label: '', icon: 'MoreHorizontal', color: 'from-blue-500 to-cyan-400' }]
        }));
    };

    const removeOption = (index: number) => {
        setFormData(prev => ({
            ...prev,
            options: prev.options.filter((_, i) => i !== index)
        }));
    };

    const updateOption = (index: number, field: keyof FunnelOption, value: string) => {
        const newOptions = [...formData.options];
        newOptions[index] = { ...newOptions[index], [field]: value };
        setFormData(prev => ({ ...prev, options: newOptions }));
    };

    const moveOption = (index: number, direction: 'up' | 'down') => {
        if ((direction === 'up' && index === 0) || (direction === 'down' && index === formData.options.length - 1)) return;
        const newOptions = [...formData.options];
        const swapIndex = direction === 'up' ? index - 1 : index + 1;
        [newOptions[index], newOptions[swapIndex]] = [newOptions[swapIndex], newOptions[index]];
        setFormData(prev => ({ ...prev, options: newOptions }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.question || formData.options.length === 0) {
            setError('Please provide a question and at least one option.');
            return;
        }

        setError('');
        setSubmitting(true);

        try {
            const url = editingItem ? `/funnel/questions/${editingItem._id}` : '/funnel/questions';
            const method = editingItem ? 'PUT' : 'POST';
            const data = await apiFetch(url, { 
                method, 
                body: JSON.stringify(formData) 
            });

            if (data.success) {
                fetchQuestions();
                handleCloseModal();
            } else {
                setError(data.error || 'Failed to save question');
            }
        } catch {
            setError('Something went wrong. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (item: FunnelQuestion) => {
        setEditingItem(item);
        setFormData({
            question: item.question,
            options: [...item.options],
            order: item.order || 0,
            isActive: item.isActive
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this funnel question?')) return;
        try {
            const data = await apiFetch(`/funnel/questions/${id}`, { method: 'DELETE' });
            if (data.success) setQuestions(questions.filter(q => q._id !== id));
        } catch { alert('Failed to delete'); }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
        setFormData({ question: '', options: [], order: 0, isActive: true });
        setError('');
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center bg-[#0a0f1e] p-6 rounded-2xl border border-slate-800 shadow-xl">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Business Funnel Questions</h1>
                    <p className="text-slate-400 mt-2 text-sm">Manage the interactive questions shown on the website&apos;s growth funnel.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 px-6 rounded-xl shadow-[0_0_20px_rgba(20,184,166,0.2)] transition-all flex items-center gap-2"
                >
                    <Plus size={20} /> Add Question
                </button>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {loading ? (
                    <div className="py-20 text-center text-slate-400 font-medium">Crunching dynamic question data...</div>
                ) : questions.length === 0 ? (
                    <div className="py-20 text-center bg-[#0a0f1e] border-2 border-dashed border-slate-800 rounded-3xl text-slate-500">
                        No questions found. Creating a smarter funnel starts here.
                    </div>
                ) : (
                    questions.map((q) => (
                        <div key={q._id} className="bg-[#0a0f1e] border border-slate-800 rounded-3xl overflow-hidden group hover:border-teal-500/30 transition-all shadow-lg">
                            <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="flex-1 space-y-4">
                                    <div className="flex items-center gap-3">
                                        <span className="w-8 h-8 rounded-full bg-teal-500/10 text-teal-400 flex items-center justify-center font-bold text-sm border border-teal-500/20">
                                            {q.order}
                                        </span>
                                        <h3 className="text-xl font-bold text-white tracking-tight">{q.question}</h3>
                                        {!q.isActive && <span className="bg-red-500/10 text-red-500 text-[10px] font-bold uppercase px-2 py-0.5 rounded border border-red-500/20">Inactive</span>}
                                    </div>
                                    
                                    <div className="flex flex-wrap gap-3">
                                        {q.options.map((opt, i) => (
                                            <div key={i} className="flex items-center gap-2 bg-slate-900/50 border border-slate-800 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300">
                                                <div className={`w-4 h-4 rounded bg-gradient-to-br ${opt.color}`} />
                                                <DynamicIcon name={opt.icon} size={14} className="text-slate-500" />
                                                {opt.label}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                    <button 
                                        onClick={() => handleEdit(q)}
                                        className="p-3 bg-slate-800 text-white rounded-xl hover:bg-teal-500 transition-colors"
                                        title="Edit"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(q._id)}
                                        className="p-3 bg-slate-800 text-white rounded-xl hover:bg-red-500 transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
                    <div className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                        <div className="bg-[#0f172a] text-white px-8 py-6 flex justify-between items-center border-b border-slate-800">
                            <div>
                                <h2 className="text-2xl font-bold leading-none">{editingItem ? 'Edit Funnel Question' : 'Define New Funnel Question'}</h2>
                                <p className="text-slate-400 text-sm mt-2">Design a step for the lead generation funnel.</p>
                            </div>
                            <button onClick={handleCloseModal} className="text-slate-400 hover:text-white transition-colors bg-white/5 p-2 rounded-full"><X size={20} /></button>
                        </div>
                        
                        <div className="p-8 max-h-[80vh] overflow-y-auto bg-slate-50/50">
                            {error && <div className="mb-6 p-4 bg-red-50 text-red-700 text-sm rounded-2xl border border-red-100 flex items-center gap-3 font-medium"> <X size={16} /> {error}</div>}
                            
                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div className="space-y-2">
                                    <label className="text-slate-700 font-black uppercase text-[10px] tracking-widest ml-1">Question Text</label>
                                    <input
                                        type="text"
                                        value={formData.question}
                                        onChange={(e) => setFormData(prev => ({ ...prev, question: e.target.value }))}
                                        className="w-full px-5 py-4 border-2 border-slate-200 rounded-2xl text-slate-900 bg-white focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all font-bold text-lg"
                                        placeholder="e.g. What is your biggest business challenge?"
                                        required
                                    />
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <label className="text-slate-700 font-black uppercase text-[10px] tracking-widest ml-1">Interactive Options</label>
                                        <button 
                                            type="button" 
                                            onClick={addOption}
                                            className="text-teal-600 hover:text-teal-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
                                        >
                                            <Plus size={14} /> Add Option
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        {formData.options.length === 0 && (
                                            <div className="p-10 border-2 border-dashed border-slate-200 rounded-3xl text-center text-slate-400 text-sm font-medium italic">
                                                No options added yet. Every question needs answers.
                                            </div>
                                        )}
                                        {formData.options.map((opt, index) => (
                                            <div key={index} className="bg-white border-2 border-slate-100 p-5 rounded-3xl shadow-sm flex flex-col md:flex-row items-center gap-4 transition-all hover:bg-white hover:shadow-md">
                                                <div className="flex gap-1 flex-col shrink-0">
                                                    <button type="button" onClick={() => moveOption(index, 'up')} className="text-slate-300 hover:text-teal-500"><ChevronUp size={20} /></button>
                                                    <button type="button" onClick={() => moveOption(index, 'down')} className="text-slate-300 hover:text-teal-500"><ChevronDown size={20} /></button>
                                                </div>
                                                
                                                <div className="flex-1 w-full">
                                                    <input
                                                        type="text"
                                                        value={opt.label}
                                                        onChange={(e) => updateOption(index, 'label', e.target.value)}
                                                        className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none focus:border-teal-400 transition-all font-bold text-slate-900"
                                                        placeholder="Option Label"
                                                        required
                                                    />
                                                </div>

                                                <select
                                                    value={opt.icon}
                                                    onChange={(e) => updateOption(index, 'icon', e.target.value)}
                                                    className="px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none focus:border-teal-400 font-bold text-sm text-slate-900 w-full md:w-auto"
                                                >
                                                    {ICON_OPTIONS.map(icon => <option key={icon} value={icon}>{icon}</option>)}
                                                </select>

                                                <select
                                                    value={opt.color}
                                                    onChange={(e) => updateOption(index, 'color', e.target.value)}
                                                    className="px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none focus:border-teal-400 font-bold text-sm text-slate-900 w-full md:w-auto"
                                                >
                                                    {COLOR_OPTIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                                                </select>

                                                <button 
                                                    type="button" 
                                                    onClick={() => removeOption(index)}
                                                    className="p-3 text-red-400 hover:bg-red-50 rounded-xl transition-colors"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6 pt-4">
                                    <div className="space-y-2">
                                        <label className="text-slate-700 font-black uppercase text-[10px] tracking-widest ml-1">Sequence Order</label>
                                        <input
                                            type="number"
                                            value={formData.order}
                                            onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                                            className="w-full px-5 py-4 border-2 border-slate-200 rounded-2xl text-slate-900 bg-white focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all font-bold"
                                            min={0}
                                        />
                                    </div>
                                    <div className="flex items-center gap-4 pt-8">
                                        <label className="text-slate-700 font-bold text-sm">Status:</label>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={formData.isActive}
                                                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500"></div>
                                            <span className="ml-3 text-sm font-black text-slate-600 uppercase tracking-widest">{formData.isActive ? 'Active' : 'Draft'}</span>
                                        </label>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-8 border-t border-slate-100 mt-10">
                                    <button 
                                        type="button" 
                                        onClick={handleCloseModal} 
                                        className="px-8 py-4 bg-slate-200 hover:bg-slate-300 text-slate-700 font-black uppercase tracking-widest text-xs rounded-2xl transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit" 
                                        disabled={submitting} 
                                        className="px-12 py-4 bg-[#0f172a] hover:bg-teal-600 text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl shadow-slate-200 transition-all disabled:opacity-50 min-w-[160px]"
                                    >
                                        {submitting ? 'Transmitting...' : editingItem ? 'Update Logic' : 'Initiate Funnel'}
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
