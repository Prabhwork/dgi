"use client";

import { useEffect, useState } from "react";
import { 
    Search, CheckCircle, XCircle, Eye, 
    Building2, ExternalLink, AlertCircle, ShieldCheck
} from "lucide-react";

interface Business {
    _id: string;
    businessName: string;
    brandName?: string;
    businessCategory: string;
    officialEmailAddress: string;
    primaryContactNumber: string;
    officialWhatsAppNumber?: string;
    aadhaarNumber?: string;
    aadhaarVerified: boolean;
    registeredOfficeAddress: string;
    openingTime?: string;
    closingTime?: string;
    weeklyOff?: string;
    description?: string;
    keywords?: string[];
    website?: string;
    joinBulkBuying: boolean;
    joinFraudAlerts: boolean;
    aadhaarCard?: string;
    ownerIdentityProof?: string;
    establishmentProof?: string;
    approvalStatus: string;
    rejectionReason?: string;
    hasPendingChanges?: boolean;
    paymentStatus?: string;
    amountPaid?: number;
    razorpayPaymentId?: string;
    razorpayOrderId?: string;
    razorpaySignature?: string;
    createdAt: string;
    claims?: Claim[];
}

interface Claim {
    _id: string;
    fullName: string;
    phoneNumber: string;
    email: string;
    ownerProof: string;
    status: string;
    createdAt: string;
}

export default function BusinessesPage() {
    const [businesses, setBusinesses] = useState<Business[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
    const [rejectionReason, setRejectionReason] = useState("");
    const [showRejectionInput, setShowRejectionInput] = useState(false);
    const [filter, setFilter] = useState("all"); // all, pending, approved, rejected
    const [searchTerm, setSearchTerm] = useState("");
    const [statusLoading, setStatusLoading] = useState(false);

    useEffect(() => {
        fetchBusinesses();
    }, []);

    const fetchBusinesses = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/business`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await res.json();
            if (data.success) {
                setBusinesses(data.data);
            }
        } catch (error) {
            console.error("Failed to fetch businesses", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id: string, status: string) => {
        if (status === 'rejected' && !rejectionReason && !showRejectionInput) {
            setShowRejectionInput(true);
            return;
        }

        setStatusLoading(true);
        console.log(`Updating status for ${id} to ${status} with reason: ${rejectionReason}`);

        try {
            const token = localStorage.getItem('adminToken');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/business/${id}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ 
                    status, 
                    reason: status === 'rejected' ? rejectionReason : '' 
                })
            });
            const data = await res.json();
            console.log('Update response:', data);
            if (data.success) {
                // Update local state
                setBusinesses(prev => prev.map(b => b._id === id ? data.data : b));
                setSelectedBusiness(data.data);
                setShowRejectionInput(false);
                setRejectionReason("");
                alert('Status updated successfully!');
            } else {
                alert(`Error: ${data.error}`);
            }
        } catch (error) {
            console.error("Failed to update status", error);
            alert('Failed to connect to server. Check console for details.');
        } finally {
            setStatusLoading(false);
        }
    };

    const filteredBusinesses = businesses.filter(b => {
        const matchesFilter = filter === "all" || b.approvalStatus === filter;
        const matchesSearch = b.businessName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             b.officialEmailAddress.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Business Management</h1>
                    <p className="text-slate-500 mt-1">Review and manage DBI Community registrations.</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="relative flex-1 min-w-[300px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input 
                        type="text" 
                        placeholder="Search by business name or email..."
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-sm text-slate-900"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
                    {['all', 'pending', 'approved', 'rejected'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                                filter === f 
                                ? "bg-white text-teal-600 shadow-sm" 
                                : "text-slate-500 hover:text-slate-800"
                            }`}
                        >
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid xl:grid-cols-3 gap-8 items-start">
                {/* List Table */}
                <div className="xl:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Business</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Category</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-900">
                                {loading ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-slate-400">Loading...</td>
                                    </tr>
                                ) : filteredBusinesses.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-slate-400">No businesses found.</td>
                                    </tr>
                                ) : (
                                    filteredBusinesses.map(b => (
                                        <tr 
                                            key={b._id} 
                                            className={`hover:bg-slate-50 transition-colors cursor-pointer ${selectedBusiness?._id === b._id ? 'bg-teal-50/50' : ''}`}
                                            onClick={() => {
                                                setSelectedBusiness(b);
                                                setShowRejectionInput(false);
                                            }}
                                        >
                                            <td className="px-6 py-4">
                                                <div className="font-semibold text-slate-900">{b.businessName}</div>
                                                <div className="text-xs text-slate-500">{b.officialEmailAddress}</div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600">{b.businessCategory}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1">
                                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider w-fit ${
                                                        b.approvalStatus === 'approved' ? 'bg-green-100 text-green-700' :
                                                        b.approvalStatus === 'rejected' ? 'bg-red-100 text-red-700' :
                                                        'bg-amber-100 text-amber-700'
                                                    }`}>
                                                        {b.approvalStatus}
                                                    </span>
                                                    {b.hasPendingChanges && b.approvalStatus !== 'approved' && (
                                                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-orange-100 text-orange-700 w-fit tracking-wide">
                                                            ⚠ Changes Pending
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <button className="p-2 text-slate-400 hover:text-teal-600 transition-colors">
                                                    <Eye size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Details Side Panel */}
                <div className="xl:col-span-1 border-slate-200">
                    {selectedBusiness ? (
                        <div className="bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden sticky top-8">
                            <div className="p-6 border-b border-slate-100 bg-slate-50">
                                <h3 className="text-lg font-bold text-slate-900">Review Application</h3>
                                <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">Details & Documents</p>
                            </div>
                            
                            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                                {selectedBusiness.hasPendingChanges && selectedBusiness.approvalStatus !== 'approved' && (
                                    <div className="flex items-start gap-3 bg-orange-50 border border-orange-200 rounded-xl p-3">
                                        <span className="text-orange-500 text-lg">⚠️</span>
                                        <div>
                                            <p className="text-xs font-bold text-orange-700">Profile Updated by Business</p>
                                            <p className="text-[11px] text-orange-600 mt-0.5">This business has updated their details. Review and approve to clear this flag.</p>
                                        </div>
                                    </div>
                                )}
                                <div className="space-y-3">
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">General Information</div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex flex-col gap-1 text-sm">
                                            <span className="text-xs text-slate-400">Registered</span>
                                            <span className="text-slate-700 font-medium">{new Date(selectedBusiness.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex flex-col gap-1 text-sm">
                                            <span className="text-xs text-slate-400">Category</span>
                                            <span className="text-slate-700 font-medium">{selectedBusiness.businessCategory}</span>
                                        </div>
                                        {selectedBusiness.brandName && (
                                            <div className="col-span-2 flex flex-col gap-1 text-sm">
                                                <span className="text-xs text-slate-400">Brand Name</span>
                                                <span className="text-slate-700 font-medium">{selectedBusiness.brandName}</span>
                                            </div>
                                        )}
                                        <div className="flex flex-col gap-1 text-sm">
                                            <span className="text-xs text-slate-400">Primary Contact</span>
                                            <span className="text-slate-700 font-medium">{selectedBusiness.primaryContactNumber}</span>
                                        </div>
                                        {selectedBusiness.officialWhatsAppNumber && (
                                            <div className="flex flex-col gap-1 text-sm">
                                                <span className="text-xs text-slate-400">WhatsApp</span>
                                                <span className="text-slate-700 font-medium">{selectedBusiness.officialWhatsAppNumber}</span>
                                            </div>
                                        )}
                                        <div className="col-span-2 flex flex-col gap-1 text-sm">
                                            <span className="text-xs text-slate-400">Official Email</span>
                                            <span className="text-slate-700 font-medium truncate">{selectedBusiness.officialEmailAddress}</span>
                                        </div>
                                        <div className="col-span-2 flex flex-col gap-1 text-sm">
                                            <span className="text-xs text-slate-400">Aadhaar</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-slate-700 font-medium">
                                                    {selectedBusiness.aadhaarNumber 
                                                        ? (selectedBusiness.aadhaarNumber.length === 12 && !selectedBusiness.aadhaarNumber.includes('X') 
                                                            ? 'XXXXXXXX' + selectedBusiness.aadhaarNumber.slice(-4) 
                                                            : selectedBusiness.aadhaarNumber)
                                                        : 'N/A'}
                                                </span>
                                                {selectedBusiness.aadhaarVerified && (
                                                    <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-bold">VERIFIED</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Payment Information Section */}
                                    <div className="pt-4 border-t border-slate-100 mt-4 space-y-3 bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center justify-between">
                                            <span>Payment Details</span>
                                            <span className="text-emerald-600">Razorpay</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 mt-2">
                                            <div className="flex flex-col gap-1 text-sm">
                                                <span className="text-xs text-slate-500">Status</span>
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase w-fit tracking-wider ${
                                                    selectedBusiness.paymentStatus === 'completed' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                                                    selectedBusiness.paymentStatus === 'failed' ? 'bg-red-100 text-red-700 border border-red-200' :
                                                    'bg-amber-100 text-amber-700 border border-amber-200'
                                                }`}>
                                                    {selectedBusiness.paymentStatus || 'Pending'}
                                                </span>
                                            </div>
                                            <div className="flex flex-col gap-1 text-sm">
                                                <span className="text-xs text-slate-500">Amount Paid</span>
                                                <span className="text-slate-900 font-bold font-mono">₹{selectedBusiness.amountPaid || '0.00'}</span>
                                            </div>
                                            {selectedBusiness.razorpayPaymentId && (
                                                <div className="col-span-2 flex flex-col gap-1 text-sm">
                                                    <span className="text-xs text-slate-500">Payment ID</span>
                                                    <span className="text-slate-700 font-medium font-mono text-xs">{selectedBusiness.razorpayPaymentId}</span>
                                                </div>
                                            )}
                                            {selectedBusiness.razorpayOrderId && (
                                                <div className="col-span-2 flex flex-col gap-1 text-sm">
                                                    <span className="text-xs text-slate-500">Order ID</span>
                                                    <span className="text-slate-700 font-medium font-mono text-xs">{selectedBusiness.razorpayOrderId}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Additional Info Section */}
                                    <div className="pt-4 border-t border-slate-100 mt-4 space-y-3">
                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Business Operations</div>
                                        
                                        <div className="col-span-2 flex flex-col gap-1 text-sm">
                                            <span className="text-xs text-slate-400">Address</span>
                                            <span className="text-slate-700 font-medium">{selectedBusiness.registeredOfficeAddress || 'N/A'}</span>
                                        </div>
                                        
                                        <div className="grid grid-cols-2 gap-4 mt-2">
                                            <div className="flex flex-col gap-1 text-sm">
                                                <span className="text-xs text-slate-400">Timings</span>
                                                <span className="text-slate-700 font-medium">
                                                    {selectedBusiness.openingTime && selectedBusiness.closingTime 
                                                        ? `${selectedBusiness.openingTime} - ${selectedBusiness.closingTime}` 
                                                        : 'N/A'}
                                                </span>
                                            </div>
                                            <div className="flex flex-col gap-1 text-sm">
                                                <span className="text-xs text-slate-400">Weekly Off</span>
                                                <span className="text-slate-700 font-medium">{selectedBusiness.weeklyOff || 'None'}</span>
                                            </div>
                                        </div>

                                        {selectedBusiness.description && (
                                            <div className="col-span-2 flex flex-col gap-1 text-sm mt-2">
                                                <span className="text-xs text-slate-400">Description</span>
                                                <span className="text-slate-700 text-xs leading-relaxed">{selectedBusiness.description}</span>
                                            </div>
                                        )}
                                        
                                        {selectedBusiness.keywords && selectedBusiness.keywords.length > 0 && (
                                            <div className="col-span-2 flex flex-col gap-1 text-sm mt-2">
                                                <span className="text-xs text-slate-400">Keywords</span>
                                                <div className="flex flex-wrap gap-1">
                                                    {selectedBusiness.keywords.map((kw: string, i: number) => (
                                                        <span key={i} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">{kw}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="pt-4 border-t border-slate-100 mt-4 space-y-3">
                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Community & Links</div>
                                        {selectedBusiness.website && (
                                            <div className="flex items-center gap-2 text-sm">
                                                <ExternalLink className="w-3 h-3 text-slate-400" />
                                                <a href={selectedBusiness.website.startsWith('http') ? selectedBusiness.website : `https://${selectedBusiness.website}`} target="_blank" className="text-teal-600 hover:underline truncate font-medium flex-1">
                                                    {selectedBusiness.website}
                                                </a>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-4 mt-2">
                                            <div className={`text-[10px] px-2 py-1 flex-1 text-center rounded font-bold uppercase ${selectedBusiness.joinBulkBuying ? 'bg-teal-50 text-teal-700 border border-teal-200' : 'bg-slate-50 text-slate-400 border border-slate-200'}`}>Bulk Buying</div>
                                            <div className={`text-[10px] px-2 py-1 flex-1 text-center rounded font-bold uppercase ${selectedBusiness.joinFraudAlerts ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-slate-50 text-slate-400 border border-slate-200'}`}>Fraud Alerts</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3 pt-4 border-t border-slate-100">
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Verification Documents</div>
                                    
                                    {/* Aadhaar Card */}
                                    <div className="group relative bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between hover:border-teal-500 transition-all">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-white rounded-lg border border-slate-200 flex items-center justify-center text-teal-600">
                                                <AlertCircle size={20} />
                                            </div>
                                            <div className="text-left">
                                                <div className="text-xs font-bold text-slate-900">Aadhaar Card</div>
                                                <div className="text-[10px] text-slate-500">Manual Verification</div>
                                            </div>
                                        </div>
                                        {selectedBusiness.aadhaarCard ? (
                                            <a 
                                                href={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}/${selectedBusiness.aadhaarCard}`} 
                                                target="_blank" 
                                                className="p-2 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                                            >
                                                <ExternalLink size={16} />
                                            </a>
                                        ) : (
                                            <span className="text-[10px] text-slate-400 italic">Not Uploaded</span>
                                        )}
                                    </div>

                                    {/* Identity Proof (PAN) */}
                                    <div className="group relative bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between hover:border-teal-500 transition-all">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-white rounded-lg border border-slate-200 flex items-center justify-center text-teal-600">
                                                <ShieldCheck size={20} />
                                            </div>
                                            <div className="text-left">
                                                <div className="text-xs font-bold text-slate-900">PAN Card</div>
                                                <div className="text-[10px] text-slate-500">Owner Identity</div>
                                            </div>
                                        </div>
                                        {selectedBusiness.ownerIdentityProof ? (
                                            <a 
                                                href={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}/${selectedBusiness.ownerIdentityProof}`} 
                                                target="_blank" 
                                                className="p-2 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                                            >
                                                <ExternalLink size={16} />
                                            </a>
                                        ) : (
                                            <span className="text-[10px] text-slate-400 italic">Not Uploaded</span>
                                        )}
                                    </div>

                                    {/* Establishment Proof */}
                                    <div className="group relative bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between hover:border-teal-500 transition-all">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-white rounded-lg border border-slate-200 flex items-center justify-center text-teal-600">
                                                <Building2 size={20} />
                                            </div>
                                            <div className="text-left">
                                                <div className="text-xs font-bold text-slate-900">Establishment Proof</div>
                                                <div className="text-[10px] text-slate-500">Shop Front / License</div>
                                            </div>
                                        </div>
                                        {selectedBusiness.establishmentProof ? (
                                            <a 
                                                href={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}/${selectedBusiness.establishmentProof}`} 
                                                target="_blank" 
                                                className="p-2 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                                            >
                                                <ExternalLink size={16} />
                                            </a>
                                        ) : (
                                            <span className="text-[10px] text-slate-400 italic">Not Uploaded</span>
                                        )}
                                    </div>
                                </div>

                                {selectedBusiness.approvalStatus === 'rejected' && (
                                    <div className="p-4 bg-red-50 border border-red-100 rounded-xl">
                                        <div className="text-[10px] font-bold text-red-700 uppercase tracking-widest mb-1">Current Rejection Reason</div>
                                        <p className="text-xs text-red-600 italic">&quot;{selectedBusiness.rejectionReason}&quot;</p>
                                    </div>
                                )}

                                {/* Ownership Claims Section */}
                                {selectedBusiness.claims && selectedBusiness.claims.length > 0 && (
                                    <div className="pt-6 border-t border-slate-100 mt-6 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ownership Claims</div>
                                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-blue-100 text-blue-700 uppercase tracking-wider">
                                                {selectedBusiness.claims.length} {selectedBusiness.claims.length === 1 ? 'Claim' : 'Claims'}
                                            </span>
                                        </div>
                                        
                                        <div className="space-y-4">
                                            {selectedBusiness.claims.map((claim) => (
                                                <div key={claim._id} className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <div className="text-sm font-bold text-slate-900">{claim.fullName}</div>
                                                        <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider ${
                                                            claim.status === 'pending' ? 'bg-amber-100 text-amber-700' : 
                                                            claim.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                        }`}>
                                                            {claim.status}
                                                        </span>
                                                    </div>
                                                    
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div className="flex flex-col gap-0.5">
                                                            <span className="text-[10px] text-slate-400">Phone</span>
                                                            <span className="text-xs text-slate-700 font-medium">{claim.phoneNumber}</span>
                                                        </div>
                                                        <div className="flex flex-col gap-0.5">
                                                            <span className="text-[10px] text-slate-400">Email</span>
                                                            <span className="text-xs text-slate-700 font-medium truncate">{claim.email}</span>
                                                        </div>
                                                    </div>

                                                    <div className="pt-2 border-t border-blue-100/50">
                                                        <a 
                                                            href={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}/${claim.ownerProof}`}
                                                            target="_blank"
                                                            className="flex items-center justify-center gap-2 w-full py-2 bg-white border border-blue-200 rounded-xl text-xs font-bold text-blue-700 hover:bg-blue-50 transition-colors"
                                                        >
                                                            <ExternalLink size={14} /> View Owner Proof
                                                        </a>
                                                    </div>
                                                    <p className="text-[9px] text-slate-400 italic text-center">Submitted on {new Date(claim.createdAt).toLocaleDateString()}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {showRejectionInput && (
                                    <div className="space-y-3 pt-4 border-t border-slate-100 animate-in slide-in-from-bottom-2 duration-300">
                                        <label className="text-xs font-bold text-slate-700">Specify Rejection Reason</label>
                                        <textarea 
                                            className="w-full p-3 text-sm text-slate-900 border border-red-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none min-h-[100px]"
                                            placeholder="Explain why the application is being rejected..."
                                            value={rejectionReason}
                                            onChange={(e) => setRejectionReason(e.target.value)}
                                        />
                                        <div className="flex gap-2">
                                            <button 
                                                type="button"
                                                onClick={() => handleUpdateStatus(selectedBusiness._id, 'rejected')}
                                                disabled={statusLoading}
                                                className="flex-1 bg-red-600 text-white py-2 rounded-lg text-sm font-bold hover:bg-red-700 transition-colors disabled:opacity-50"
                                            >
                                                {statusLoading ? "Processing..." : "Confirm Reject"}
                                            </button>
                                            <button 
                                                onClick={() => setShowRejectionInput(false)}
                                                className="px-4 bg-slate-100 text-slate-600 py-2 rounded-lg text-sm font-bold hover:bg-slate-200 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {!showRejectionInput && (
                                <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3">
                                    <button 
                                        type="button"
                                        onClick={() => handleUpdateStatus(selectedBusiness._id, 'approved')}
                                        disabled={(selectedBusiness.approvalStatus === 'approved' && !selectedBusiness.hasPendingChanges) || statusLoading}
                                        className="flex-1 flex items-center justify-center gap-2 bg-teal-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md active:scale-95"
                                    >
                                        <CheckCircle size={18} /> {statusLoading ? "Wait..." : (selectedBusiness.approvalStatus === 'approved' && selectedBusiness.hasPendingChanges ? "Clear Flag" : "Approve")}
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => setShowRejectionInput(true)}
                                        disabled={selectedBusiness.approvalStatus === 'rejected' || statusLoading}
                                        className="flex-1 flex items-center justify-center gap-2 bg-white border border-red-200 text-red-600 py-3 rounded-xl font-bold text-sm hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
                                    >
                                        <XCircle size={18} /> Reject
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="bg-slate-100/50 border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center h-full flex flex-col items-center justify-center">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-slate-300 mb-4 shadow-sm">
                                <Eye size={32} />
                            </div>
                            <h3 className="text-slate-500 font-bold">No Business Selected</h3>
                            <p className="text-slate-400 text-sm mt-1 max-w-[200px]">Click on a business from the list to review their application details.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
