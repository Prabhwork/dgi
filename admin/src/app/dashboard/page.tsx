"use client";

export default function DashboardPage() {
    return (
        <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-8">Dashboard Overview</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Stats Cards */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="text-sm font-medium text-slate-500 mb-1">Total Categories</div>
                    <div className="text-3xl font-bold text-slate-900">12</div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="text-sm font-medium text-slate-500 mb-1">Total Subcategories</div>
                    <div className="text-3xl font-bold text-slate-900">45</div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="text-sm font-medium text-slate-500 mb-1">System Status</div>
                    <div className="text-3xl font-bold text-green-600">Online</div>
                </div>
            </div>

            <div className="mt-8 bg-white rounded-xl border border-slate-200 shadow-sm p-8 text-center">
                <p className="text-slate-500 text-lg">Welcome to the Digital Book of India Admin Panel.</p>
                <p className="text-slate-400 mt-2">Use the sidebar to manage categories and application data.</p>
            </div>
        </div>
    );
}
