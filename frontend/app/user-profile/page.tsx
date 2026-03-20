"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
    User, Mail, Phone, ShieldCheck, Camera, Save, ArrowLeft, Loader2, CheckCircle2, AlertCircle, Edit2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CursorGlow from "@/components/CursorGlow";
import ParticleNetworkWrapper from "@/components/ParticleNetworkWrapper";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function UserProfilePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [user, setUser] = useState<any>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [avatarFile, setAvatarFile] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: ""
    });

    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        const token = localStorage.getItem("userToken");
        if (!token) {
            router.push("/login");
            return;
        }

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            const data = await res.json();
            if (data.success) {
                const userData = data.data;
                const cleanPhone = userData.phone && userData.phone.startsWith("PENDING_") ? "" : userData.phone;
                setUser(userData);
                setFormData({
                    name: userData.name,
                    email: userData.email,
                    phone: cleanPhone || ""
                });
            } else {
                localStorage.removeItem("userToken");
                router.push("/login");
            }
        } catch (err) {
            setError("Failed to fetch user profile.");
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);

        const token = localStorage.getItem("userToken");
        try {
            const body = {
                ...formData,
                avatar: avatarFile || user.avatar
            };

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/update-me`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(body)
            });

            const data = await res.json();
            if (data.success) {
                const updatedUser = data.data;
                const cleanPhone = updatedUser.phone && updatedUser.phone.startsWith("PENDING_") ? "" : updatedUser.phone;
                setUser(updatedUser);
                setFormData(prev => ({ ...prev, phone: cleanPhone || "" }));
                setIsEditing(false);
                toast.success("Profile updated successfully!");
            } else {
                setError(data.error || "Update failed.");
                toast.error(data.error || "Update failed.");
            }
        } catch (err) {
            setError("Something went wrong. Please try again.");
            toast.error("Something went wrong.");
        } finally {
            setSaving(false);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                toast.error("Image size should be less than 2MB");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarFile(reader.result as string);
                setIsEditing(true);
            };
            reader.readAsDataURL(file);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background relative overflow-hidden text-white">
            <ParticleNetworkWrapper className="z-0 opacity-40" />
            <CursorGlow />
            <Navbar />

            <main className="pt-32 pb-24 relative z-10 px-4">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row items-center gap-8 mb-12">
                        <div className="relative group">
                            <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 border border-white/10 flex items-center justify-center overflow-hidden relative shadow-2xl">
                                {avatarFile || user?.avatar ? (
                                    <img src={avatarFile || user.avatar} alt={user.name} className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-16 h-16 text-primary" />
                                )}
                                <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                                    <Camera className="text-white w-6 h-6" />
                                    <input 
                                        type="file" 
                                        className="hidden" 
                                        accept="image/*"
                                        onChange={handleImageChange}
                                    />
                                </label>
                            </div>
                            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary rounded-xl flex items-center justify-center shadow-lg border-2 border-background">
                                <CheckCircle2 className="text-white w-4 h-4" />
                            </div>
                        </div>

                        <div className="text-center md:text-left">
                            <div className="flex items-center gap-4 mb-2 justify-center md:justify-start">
                                <h1 className="text-4xl font-display font-bold uppercase tracking-wider">{user?.name}</h1>
                                <span className="bg-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-primary/20">User Profile</span>
                            </div>
                            <p className="text-muted-foreground uppercase tracking-[0.2em] text-xs mb-4">Member since {new Date(user?.createdAt).toLocaleDateString()}</p>
                            <div className="flex items-center gap-4">
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="rounded-xl border-white/10 hover:bg-white/5 text-[10px] uppercase font-bold tracking-widest"
                                    onClick={() => setIsEditing(!isEditing)}
                                >
                                    {isEditing ? <><ArrowLeft className="mr-2 w-3 h-3" /> Cancel</> : <><Edit2 className="mr-2 w-3 h-3" /> Edit Profile</>}
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Status Cards */}
                        <div className="lg:col-span-1 space-y-6">
                            <div className="glass-strong border-white/10 rounded-[2rem] p-6 shadow-xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <ShieldCheck className="w-12 h-12 text-primary" />
                                </div>
                                <h3 className="text-xs font-bold uppercase tracking-widest text-primary mb-4">Account Security</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-white/60">Phone Verified</span>
                                        {user?.phone && !user.phone.startsWith("PENDING_") ? (
                                            <span className="text-[10px] bg-green-500/10 text-green-400 px-2 py-0.5 rounded-full border border-green-500/20 font-bold uppercase">Active</span>
                                        ) : (
                                            <span className="text-[10px] bg-yellow-500/10 text-yellow-500 px-2 py-0.5 rounded-full border border-yellow-500/20 font-bold uppercase">Pending</span>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-white/60">Email Verified</span>
                                        <span className={`text-[10px] ${user?.isEmailVerified ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-500'} px-2 py-0.5 rounded-full border ${user?.isEmailVerified ? 'border-green-500/20' : 'border-yellow-500/20'} font-bold uppercase`}>
                                            {user?.isEmailVerified ? 'Verified' : 'Pending'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-white/60">2FA Status</span>
                                        <span className={`text-[10px] ${user?.isTwoFactorEnabled ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-500'} px-2 py-0.5 rounded-full border ${user?.isTwoFactorEnabled ? 'border-green-500/20' : 'border-red-500/20'} font-bold uppercase`}>
                                            {user?.isTwoFactorEnabled ? 'Enabled' : 'Disabled'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Main Content */}
                        <div className="lg:col-span-2">
                            <div className="glass-strong border-white/10 rounded-[2.5rem] p-8 md:p-10 shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
                                
                                {isEditing ? (
                                    <form onSubmit={handleUpdateProfile} className="space-y-6">
                                        <div className="space-y-2">
                                            <Label className="text-white/70 text-[10px] uppercase tracking-widest ml-1">Full Name</Label>
                                            <div className="relative">
                                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                                                <Input
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleInputChange}
                                                    className="bg-white/5 border-white/10 text-white pl-11 h-12 rounded-xl focus:ring-primary/50"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-white/70 text-[10px] uppercase tracking-widest ml-1">Email Address (Read-only)</Label>
                                            <div className="relative">
                                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                                                <Input
                                                    name="email"
                                                    type="email"
                                                    value={formData.email}
                                                    readOnly
                                                    className="bg-white/5 border-white/10 text-white/40 cursor-not-allowed pl-11 h-12 rounded-xl focus:ring-transparent"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-white/70 text-[10px] uppercase tracking-widest ml-1">Phone Number</Label>
                                            <div className="relative">
                                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                                                <Input
                                                    name="phone"
                                                    type="tel"
                                                    value={formData.phone}
                                                    onChange={handleInputChange}
                                                    className="bg-white/5 border-white/10 text-white pl-11 h-12 rounded-xl focus:ring-primary/50"
                                                />
                                            </div>
                                        </div>

                                        {error && (
                                            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-3">
                                                <AlertCircle size={18} />
                                                <span className="text-xs font-medium">{error}</span>
                                            </div>
                                        )}

                                        <div className="pt-4">
                                            <Button
                                                type="submit"
                                                variant="glow"
                                                disabled={saving}
                                                className="w-full h-12 rounded-xl font-display uppercase tracking-[0.2em] text-xs bg-primary text-white"
                                            >
                                                {saving ? <><Loader2 className="mr-2 w-4 h-4 animate-spin" /> Saving...</> : <><Save className="mr-2 w-4 h-4" /> Save Changes</>}
                                            </Button>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="space-y-8">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-1">
                                                <span className="text-[10px] uppercase tracking-widest text-primary font-bold">Full Name</span>
                                                <p className="text-lg font-medium">{user?.name}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <span className="text-[10px] uppercase tracking-widest text-primary font-bold">Email Address</span>
                                                <p className="text-lg font-medium">{user?.email}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <span className="text-[10px] uppercase tracking-widest text-primary font-bold">Phone Number</span>
                                                <p className="text-lg font-medium">
                                                    {user?.phone && !user.phone.startsWith("PENDING_") ? user.phone : 'Not provided'}
                                                </p>
                                            </div>
                                            <div className="space-y-1">
                                                <span className="text-[10px] uppercase tracking-widest text-primary font-bold">Account Type</span>
                                                <p className="text-lg font-medium uppercase tracking-wider">{user?.profileType || 'User'}</p>
                                            </div>
                                        </div>
                                        
                                        <div className="pt-8 border-t border-white/10">
                                            <h4 className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-4">Quick Links</h4>
                                            <div className="flex flex-wrap gap-4">
                                                <Button variant="outline" className="rounded-xl border-white/10 hover:bg-white/5 text-[10px] uppercase tracking-widest h-10 px-6">Manage Reviews</Button>
                                                <Button variant="outline" className="rounded-xl border-white/10 hover:bg-white/5 text-[10px] uppercase tracking-widest h-10 px-6">Claim History</Button>
                                                <Button variant="outline" className="rounded-xl border-white/10 hover:bg-white/5 text-[10px] uppercase tracking-widest h-10 px-6 text-red-400 border-red-400/20 hover:bg-red-400/10">Deactivate</Button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
