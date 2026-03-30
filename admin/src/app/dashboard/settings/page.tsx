"use client";

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { Save, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';

interface GlobalSettings {
    _id?: string;
    liveListingBase: number;
    liveListingCurrent: number;
    liveListingMinIncrement: number;
    liveListingMaxIncrement: number;
    liveListingMinInterval: number;
    liveListingMaxInterval: number;
    liveListingStartTime: number;
    liveListingEndTime: number;
    liveListingEnabled: boolean;
}

export default function SettingsPage() {
    const [settings, setSettings] = useState<GlobalSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const data = await apiFetch('/global-settings');
            if (data.success) {
                setSettings(data.data);
            }
        } catch (err) {
            console.error("Failed to fetch settings", err);
            setMessage({ type: 'error', text: 'Failed to load settings' });
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!settings) return;

        try {
            setSaving(true);
            setMessage({ type: '', text: '' });
            const data = await apiFetch('/global-settings', {
                method: 'PUT',
                body: JSON.stringify(settings)
            });

            if (data.success) {
                setSettings(data.data);
                setMessage({ type: 'success', text: 'Settings updated successfully!' });
                
                // Clear success message after 3 seconds
                setTimeout(() => setMessage({ type: '', text: '' }), 3000);
            }
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Failed to update settings';
            setMessage({ type: 'error', text: errorMsg });
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        if (!settings) return;

        setSettings({
            ...settings,
            [name]: type === 'checkbox' ? checked : (type === 'number' ? Number(value) : value)
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-800">Global Settings</h1>
                <button
                    onClick={fetchSettings}
                    className="p-2 text-slate-500 hover:text-teal-600 hover:bg-teal-50 rounded-full transition-colors"
                    title="Refresh Settings"
                >
                    <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                </button>
            </div>

            {message.text && (
                <div className={`p-4 rounded-lg flex items-center gap-3 border ${
                    message.type === 'success' 
                        ? 'bg-teal-50 border-teal-100 text-teal-700' 
                        : 'bg-red-50 border-red-100 text-red-700'
                }`}>
                    {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                    <p className="font-medium">{message.text}</p>
                </div>
            )}

            <form onSubmit={handleUpdate} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                    <h2 className="text-lg font-semibold text-slate-800">Live Listing Counter Control</h2>
                    <p className="text-sm text-slate-600 mt-1">Configure how the live listing counter behaves across all devices.</p>
                </div>

                <div className="p-6 space-y-8">
                    {/* Synchronized Toggle */}
                    <div className="flex items-center justify-between p-4 bg-teal-50/50 rounded-xl border border-teal-100">
                        <div>
                            <h3 className="font-semibold text-slate-800">Enable Live Counter</h3>
                            <p className="text-sm text-slate-500">When enabled, the counter will automatically increase during office hours.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                                type="checkbox" 
                                name="liveListingEnabled"
                                checked={settings?.liveListingEnabled} 
                                onChange={handleChange}
                                className="sr-only peer" 
                            />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500"></div>
                        </label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Base Seeding */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wider">Base Numbers</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-800 mb-1">Base Count (Historical)</label>
                                    <input 
                                        type="number" 
                                        name="liveListingBase"
                                        value={settings?.liveListingBase}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 bg-white border border-slate-300 text-slate-900 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition-all shadow-sm"
                                    />
                                    <p className="text-[11px] text-slate-600 font-medium mt-1">The initial number used for calculations.</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-800 mb-1">Current Sync Count</label>
                                    <input 
                                        type="number" 
                                        name="liveListingCurrent"
                                        value={settings?.liveListingCurrent}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 bg-white border border-teal-200 text-teal-700 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition-all font-mono font-bold shadow-sm"
                                    />
                                    <p className="text-[11px] text-slate-600 font-medium mt-1">Manual override for the current number shown to users.</p>
                                </div>
                            </div>
                        </div>

                        {/* Timing Control */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wider">Office Hours (24h Format)</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-800 mb-1">Start Hour</label>
                                    <input 
                                        type="number" 
                                        name="liveListingStartTime"
                                        min="0" max="23"
                                        value={settings?.liveListingStartTime}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 bg-white border border-slate-300 text-slate-900 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition-all shadow-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-800 mb-1">End Hour</label>
                                    <input 
                                        type="number" 
                                        name="liveListingEndTime"
                                        min="0" max="23"
                                        value={settings?.liveListingEndTime}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 bg-white border border-slate-300 text-slate-900 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition-all shadow-sm"
                                    />
                                </div>
                            </div>
                            <p className="text-[11px] text-slate-600 font-medium">Current set to: {settings?.liveListingStartTime}:00 to {settings?.liveListingEndTime}:00 daily.</p>
                        </div>

                        {/* Random Increment Range */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wider">Increment Range</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-800 mb-1">Min. Increment</label>
                                    <input 
                                        type="number" 
                                        name="liveListingMinIncrement"
                                        value={settings?.liveListingMinIncrement}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 bg-white border border-slate-300 text-slate-900 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition-all shadow-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-800 mb-1">Max. Increment</label>
                                    <input 
                                        type="number" 
                                        name="liveListingMaxIncrement"
                                        value={settings?.liveListingMaxIncrement}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 bg-white border border-slate-300 text-slate-900 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition-all shadow-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Interval Timing */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wider">Interval Range (ms)</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-800 mb-1">Min. Interval</label>
                                    <input 
                                        type="number" 
                                        name="liveListingMinInterval"
                                        step="500"
                                        value={settings?.liveListingMinInterval}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 bg-white border border-slate-300 text-slate-900 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition-all shadow-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-800 mb-1">Max. Interval</label>
                                    <input 
                                        type="number" 
                                        name="liveListingMaxInterval"
                                        step="500"
                                        value={settings?.liveListingMaxInterval}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 bg-white border border-slate-300 text-slate-900 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition-all shadow-sm"
                                    />
                                </div>
                            </div>
                            <p className="text-[11px] text-slate-500 font-medium">1000ms = 1 second.</p>
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
                    <button
                        type="submit"
                        disabled={saving}
                        className="bg-teal-500 hover:bg-teal-600 disabled:bg-teal-300 text-white font-bold py-2.5 px-8 rounded-lg shadow-lg shadow-teal-500/20 transition-all flex items-center gap-2"
                    >
                        {saving ? (
                            <RefreshCw className="animate-spin" size={18} />
                        ) : (
                            <Save size={18} />
                        )}
                        {saving ? 'Saving...' : 'Save Settings'}
                    </button>
                </div>
            </form>
        </div>
    );
}
