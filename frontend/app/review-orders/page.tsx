"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
    ShoppingBag, CheckCircle2, AlertCircle, Loader2, 
    ArrowRight, Wallet, ShieldCheck, Phone, Info,
    X, ShoppingCart, CreditCard, Lock, Trash2, Plus
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CursorGlow from "@/components/CursorGlow";

import WalletPinModal from "@/components/WalletPinModal";

const FOOD_BACKEND = process.env.NEXT_PUBLIC_FOOD_API_URL;
const MAIN_API = process.env.NEXT_PUBLIC_API_URL;

export default function ReviewOrdersPage() {
    const router = useRouter();
    const { cart, removeFromCart, clearCart, isHydrated, isLoggedIn, isAuthLoading } = useCart();
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isRecharging, setIsRecharging] = useState(false);
    const [wallet, setWallet] = useState<{ balance: number; isPinSet: boolean } | null>(null);
    const [isBalanceLoading, setIsBalanceLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [showPinModal, setShowPinModal] = useState(false);
    const [fetchedNames, setFetchedNames] = useState<Record<string, string>>({});
    const [restaurantSettings, setRestaurantSettings] = useState<Record<string, { charges: number; tax: number }>>({});
    
    // Order info from localStorage
    const [orderType, setOrderType] = useState<string>("Takeaway");
    const [scheduledTime, setScheduledTime] = useState<string>("ASAP");

    // Fallback constants
    const GST_RATE = 0.05;
    const RESTAURANT_CHARGE = 20;

    // Group items by restaurant and calculate individual restaurant totals
    const groupedOrders = cart.reduce((acc: any, item: any) => {
        if (!acc[item.partnerId]) {
            acc[item.partnerId] = {
                partnerId: item.partnerId,
                restaurantName: fetchedNames[item.partnerId] || item.restaurantName || "Restaurant",
                items: [],
                subtotal: 0
            };
        }
        acc[item.partnerId].items.push(item);
        acc[item.partnerId].subtotal += item.price * item.quantity;
        return acc;
    }, {});

    const partnerIds = Object.keys(groupedOrders);

    // Fetch missing restaurant names and individual settings
    useEffect(() => {
        const fetchMissingData = async () => {
            const missingIds = partnerIds.filter(pid => 
                !fetchedNames[pid] || !restaurantSettings[pid]
            );

            if (missingIds.length === 0) return;

            const newNames = { ...fetchedNames };
            const newSettings = { ...restaurantSettings };

            for (const pid of missingIds) {
                // 1. Fetch Name from Main API if missing
                if (!fetchedNames[pid]) {
                    try {
                        const res = await fetch(`${MAIN_API}/business/${pid}`);
                        const data = await res.json();
                        if (data.success && data.data.businessName) {
                            newNames[pid] = data.data.businessName;
                        }
                    } catch (err) {
                        console.error(`Failed to fetch name for ${pid}`, err);
                    }
                }

                // 2. Fetch Settings from Food API for Charges/Tax
                if (!restaurantSettings[pid]) {
                    try {
                        const res = await fetch(`${FOOD_BACKEND}/settings`, {
                            headers: { "x-partner-id": pid }
                        });
                        if (res.ok) {
                            const data = await res.json();
                            newSettings[pid] = {
                                charges: data.restaurantCharges ?? RESTAURANT_CHARGE,
                                tax: (data.taxPercentage ?? 5) / 100
                            };
                        }
                    } catch (err) {
                        console.error(`Failed to fetch settings for ${pid}`, err);
                    }
                }
            }
            setFetchedNames(newNames);
            setRestaurantSettings(newSettings);
        };

        if (partnerIds.length > 0) {
            fetchMissingData();
        }
    }, [cart, partnerIds.length]);

    // Calculate detailed totals with dynamic settings
    const breakdown = partnerIds.map(pid => {
        const group = groupedOrders[pid];
        const settings = restaurantSettings[pid] || { tax: GST_RATE, charges: RESTAURANT_CHARGE };
        
        const tax = group.subtotal * settings.tax;
        const charges = settings.charges;
        const total = group.subtotal + tax + charges;
        return { ...group, tax, charges, total, taxRate: settings.tax * 100 };
    });

    const grandTotal = breakdown.reduce((sum, b) => sum + b.total, 0);

    const fetchUserAndWallet = async () => {
        const token = localStorage.getItem("userToken");
        if (!token) return;

        try {
            const [userRes, walletRes] = await Promise.all([
                fetch(`${MAIN_API}/auth/me`, {
                    headers: { "Authorization": `Bearer ${token}` }
                }),
                fetch(`${MAIN_API}/wallet/balance`, {
                    headers: { "Authorization": `Bearer ${token}` }
                })
            ]);
            
            const userData = await userRes.json();
            const walletData = await walletRes.json();

            if (userData.success) setUser(userData.data);
            if (walletData.success) setWallet(walletData);

        } catch (err) {
            console.error("Failed to fetch info", err);
        } finally {
            setIsBalanceLoading(false);
        }
    };

    useEffect(() => {
        if (!isHydrated || isAuthLoading) return;
        if (!isLoggedIn) {
            router.push("/login?redirect=/review-orders");
            return;
        }
        if (cart.length === 0) {
            router.push("/");
            return;
        }

        // Load Order Preferences from first partner in cart
        if (cart.length > 0) {
            const pid = cart[0].partnerId;
            const savedType = localStorage.getItem(`dbi_order_type_${pid}`);
            const savedTime = localStorage.getItem(`dbi_scheduled_time_${pid}`);
            if (savedType) setOrderType(savedType);
            if (savedTime) setScheduledTime(savedTime);
        }

        fetchUserAndWallet();
    }, [isHydrated, isLoggedIn, isAuthLoading, cart.length]);

    const handleQuickRecharge = async () => {
        const rechargeAmount = Math.ceil(grandTotal - (wallet?.balance || 0));
        if (rechargeAmount <= 0) return;

        setIsRecharging(true);
        const token = localStorage.getItem("userToken");

        try {
            // 0. Load Razorpay Script manually if not present
            if (!(window as any).Razorpay) {
                const script = document.createElement("script");
                script.src = "https://checkout.razorpay.com/v1/checkout.js";
                script.async = true;
                document.body.appendChild(script);
                await new Promise((resolve) => {
                    script.onload = resolve;
                });
            }

            // 1. Create Order
            const orderRes = await fetch(`${MAIN_API}/wallet/recharge/order`, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ amount: rechargeAmount })
            });

            const orderData = await orderRes.json();
            if (!orderData.success) throw new Error(orderData.error);

            // 2. Load Razorpay Options
            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: orderData.amount * 100,
                currency: "INR",
                name: "DBI Quick Recharge",
                description: `Top up for your order bundle`,
                image: "/assets/DLOGO.png",
                order_id: orderData.orderId,
                handler: async function (response: any) {
                    try {
                        const verifyRes = await fetch(`${MAIN_API}/wallet/recharge/verify`, {
                            method: "POST",
                            headers: { 
                                "Content-Type": "application/json",
                                "Authorization": `Bearer ${token}`
                            },
                            body: JSON.stringify({
                                razorpayOrderId: response.razorpay_order_id,
                                razorpayPaymentId: response.razorpay_payment_id,
                                razorpaySignature: response.razorpay_signature
                            })
                        });

                        const verifyData = await verifyRes.json();
                        if (verifyData.success) {
                            toast.success(`Wallet Top-up Successful! ₹${rechargeAmount} added.`);
                            fetchUserAndWallet(); // Refresh balance
                        } else {
                            toast.error(verifyData.error || "Payment verification failed");
                        }
                    } catch (err) {
                        toast.error("Error verifying payment");
                    }
                },
                prefill: {
                    name: user?.name || "",
                    email: user?.email || "",
                    contact: user?.phone || ""
                },
                theme: { color: "#3066FF" }
            };

            const rzp = new (window as any).Razorpay(options);
            rzp.open();

        } catch (err: any) {
            console.error("Quick recharge error:", err);
            toast.error(err.message || "Recharge failed");
        } finally {
            setIsRecharging(false);
        }
    };

    const handleConfirmOrders = async () => {
        if (!wallet) return;
        
        if (wallet.balance < grandTotal) {
            toast.error("Insufficient Wallet Balance", {
                description: `You need ₹${(grandTotal - wallet.balance).toFixed(2)} more.`
            });
            return;
        }

        if (!wallet.isPinSet) {
            toast.error("Security PIN Required", {
                description: "Go to Wallet to set your 4-digit PIN first.",
                action: {
                    label: "Go to Wallet",
                    onClick: () => router.push("/wallet")
                }
            });
            return;
        }

        setShowPinModal(true);
    };

    const handlePlaceMultiOrder = async (pin: string) => {
        setIsSubmitting(true);
        try {
            const token = localStorage.getItem("userToken");
            
            // 1. Process Wallet Payment (Deduction)
            const payRes = await fetch(`${MAIN_API}/wallet/pay`, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ 
                    amount: grandTotal, 
                    pin,
                    description: `Bundle Order (${breakdown.length} Restaurants)`
                })
            });

            const payData = await payRes.json();
            if (!payData.success) {
                throw new Error(payData.error || "Payment Failed");
            }

            // 2. Place Individual Restaurant Orders
            const processedOrders = [];

            for (const group of breakdown) {
                const itemsProcessed = group.items.map((item: any) => ({
                    menuItem: item._id,
                    quantity: item.quantity,
                    price: item.price,
                    name: item.name
                }));

                const payload = {
                    items: itemsProcessed,
                    itemsArray: itemsProcessed,
                    restaurantName: group.restaurantName,
                    subtotal: group.subtotal,
                    tax: group.tax,
                    restaurantCharges: group.charges,
                    total: group.total,
                    paymentMethod: "Wallet",
                    payment: "Paid",
                    userId: user?._id || 'UNKNOWN',
                    customer: user?.name || 'User',
                    customerEmail: user?.email || '',
                    customerPhone: user?.phone || '',
                    orderType: orderType,
                    time: scheduledTime
                };

                const res = await fetch(`${FOOD_BACKEND}/orders`, {
                    method: "POST",
                    headers: { 
                        "Content-Type": "application/json", 
                        "x-partner-id": group.partnerId 
                    },
                    body: JSON.stringify(payload)
                });

                if (res.ok) {
                    processedOrders.push(group.partnerId);
                } else {
                    console.error(`Failed to place order for ${group.restaurantName}`);
                }
            }

            toast.success("Wallet Payment Success!", {
                description: `₹${grandTotal.toFixed(2)} deducted. ${processedOrders.length} orders placed.`
            });
            clearCart();
            if (typeof window !== "undefined") {
              window.dispatchEvent(new Event("cartSync"));
            }
            setShowPinModal(false);
            router.push("/user-profile?tab=orders");

        } catch (err: any) {
            toast.error("Ordering Error", {
                description: err.message
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isHydrated || isBalanceLoading) {
        return (
            <div className="min-h-screen bg-[#020631] flex flex-col items-center justify-center text-white">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
                <p className="mt-4 uppercase tracking-widest text-xs opacity-50">Reviewing Cart Integrity...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen relative overflow-hidden bg-[#020631] text-white">
      
            <CursorGlow />
            <Navbar />

            <main className="pt-28 md:pt-36 pb-24 relative z-10 px-4 max-w-2xl mx-auto space-y-6">
                {/* Header */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                            <ShoppingCart className="text-primary w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-display font-bold uppercase tracking-widest leading-none italic">CHECKOUT</h1>
                            <p className="opacity-50 text-[10px] md:text-xs font-black uppercase tracking-[0.2em] mt-1.5 flex items-center gap-2">
                                <ShieldCheck size={12} className="text-emerald-500" /> Multi-Restaurant Session Secure
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Wallet Info Box */}
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-8 rounded-[2.5rem] bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-white/10 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Wallet size={120} />
                    </div>
                    <div className="relative z-10 flex justify-between items-center">
                        <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">DBI Digital Wallet</p>
                            <p className="text-3xl font-black tracking-tight italic">₹{wallet?.balance?.toFixed(2) || '0.00'}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Total Bundle Cost</p>
                            <p className={`text-2xl font-black tracking-tight italic ${wallet !== null && wallet.balance < grandTotal ? 'text-red-500' : 'text-emerald-500'}`}>
                                ₹{grandTotal.toFixed(2)}
                            </p>
                        </div>
                    </div>
                    {wallet !== null && wallet.balance < grandTotal && (
                        <div className="mt-6 pt-6 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-2 text-red-500">
                                <AlertCircle size={16} />
                                <p className="text-[11px] font-black uppercase italic tracking-wider">Insufficient funds. Recharge to proceed.</p>
                            </div>
                            <button
                                onClick={(e) => {
                                    console.log("Recharge clicked");
                                    handleQuickRecharge();
                                }}
                                disabled={isRecharging}
                                className="relative z-50 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white rounded-xl px-6 py-4 flex items-center gap-2 font-black uppercase text-[10px] tracking-widest transition-all shadow-xl shadow-blue-600/30 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isRecharging ? (
                                    <Loader2 className="animate-spin w-4 h-4" />
                                ) : (
                                    <>
                                        <Plus size={14} strokeWidth={3} />
                                        <span>Add ₹{Math.ceil(grandTotal - (wallet?.balance || 0))}</span>
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </motion.div>

                {/* Grouped Orders */}
                <div className="space-y-8">
                    {breakdown.map((group, idx) => (
                        <motion.div key={group.partnerId} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + (idx * 0.1) }} className="bg-slate-900/40 border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl backdrop-blur-xl">
                            <div className="bg-white/5 px-8 py-5 flex justify-between items-center border-b border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                                    <h3 className="text-sm font-black uppercase tracking-widest italic text-white/90">{group.restaurantName}</h3>
                                </div>
                                <span className="text-xs font-black text-primary italic">₹{group.total.toFixed(0)}</span>
                            </div>
                            <div className="p-8 space-y-6">
                                {group.items.map((item: any) => (
                                    <div key={item._id} className="flex justify-between items-center group">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-3 h-3 rounded-sm border flex items-center justify-center shrink-0 ${item.isVeg ? 'border-emerald-600' : 'border-red-600'}`}>
                                                <div className={`w-1 h-1 rounded-full ${item.isVeg ? 'bg-emerald-600' : 'bg-red-600'}`} />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-black opacity-90 truncate">{item.name}</p>
                                                <p className="text-[10px] font-bold opacity-30 uppercase tracking-widest">Quantity: {item.quantity}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <span className="text-sm font-black text-white/80 italic">₹{item.price * item.quantity}</span>
                                            <button 
                                                onClick={() => removeFromCart(item._id)}
                                                className="p-2 md:p-2.5 rounded-xl bg-red-500/10 text-red-500 transition-all hover:bg-red-500 hover:text-white shadow-lg active:scale-95"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                {/* Extended Price Breakdown */}
                                <div className="pt-6 mt-6 border-t border-white/5 space-y-3">
                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest opacity-40">
                                        <span>Subtotal</span>
                                        <span>₹{group.subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-emerald-400">
                                        <span>GST (5%)</span>
                                        <span>₹{group.tax.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-blue-400">
                                        <span>Restaurant Charges</span>
                                        <span>₹{group.charges.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-xs font-black uppercase tracking-widest pt-3 text-white border-t border-white/5">
                                        <span className="italic">Partner Total</span>
                                        <span className="text-primary italic">₹{group.total.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Final Footer Alert */}
                <div className="p-6 rounded-[2.5rem] bg-amber-500/5 border border-amber-500/10 backdrop-blur-md">
                    <div className="flex gap-4">
                        <Info className="text-amber-500 shrink-0" size={20} />
                        <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase tracking-widest text-amber-500 italic">Order Preferences: {orderType} • {scheduledTime}</p>
                            <p className="text-[10px] font-medium opacity-50 leading-relaxed uppercase tracking-tight italic">
                                Bundle ordering is final. Prices include all applicable taxes and flat restaurant charges.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Submit Action */}
                <div className="pt-8">
                    <Button onClick={handleConfirmOrders} disabled={isSubmitting || (wallet !== null && wallet.balance < grandTotal) || partnerIds.length > 3} className="w-full py-10 rounded-[2rem] bg-[#E03546] hover:bg-[#c32d3d] text-white font-black uppercase tracking-[0.2em] shadow-2xl shadow-red-600/30 flex flex-col items-center justify-center gap-1.5 text-base transition-all active:scale-[0.98] disabled:opacity-50 group relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                        {isSubmitting ? (
                            <Loader2 className="animate-spin w-6 h-6" />
                        ) : (
                            <>
                                <div className="flex items-center gap-3">
                                    <CheckCircle2 size={24} className="text-white/80" />
                                    {partnerIds.length > 3 ? 'LIMIT EXCEEDED' : `Confirm & Pay ₹${grandTotal.toFixed(2)}`}
                                </div>
                                <span className="text-[9px] opacity-60 tracking-[0.4em] font-black uppercase">Instant Wallet Authorization</span>
                            </>
                        )}
                    </Button>
                    
                    <WalletPinModal isOpen={showPinModal} onClose={() => setShowPinModal(false)} onVerify={handlePlaceMultiOrder} isVerifying={isSubmitting} />
                    <button onClick={() => router.back()} className="w-full mt-6 text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-white transition-all italic underline underline-offset-4">
                        Abandon Bundle & Return
                    </button>
                </div>
            </main>

            <Footer />
        </div>
    );
}
