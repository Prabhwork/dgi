"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, X, CheckCircle2, Gift, Loader2, MessageSquare, AlertCircle, CreditCard, Banknote, ArrowRight, Clock, Utensils, Wallet, Plus, ShieldCheck, Info } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CursorGlow from "@/components/CursorGlow";

import { useTheme } from "@/components/ThemeProvider";
import OrderSuccess from "@/components/OrderSuccess";
import WalletPinModal from "@/components/WalletPinModal";

const FOOD_BACKEND = process.env.NEXT_PUBLIC_FOOD_API_URL;
const MAIN_API = process.env.NEXT_PUBLIC_API_URL;

export default function CheckoutPage() {
    const router = useRouter();
    const { cart, clearCart, removeFromCart, isHydrated } = useCart();
    const { theme } = useTheme();
    const isLight = theme === "light";

    const [loading, setLoading] = useState(true);
    const [settings, setSettings] = useState<any>(null);
    const [coupons, setCoupons] = useState<any[]>([]);
    
    const [couponInput, setCouponInput] = useState("");
    const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
    const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
    

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loggedUser, setLoggedUser] = useState<any>(null);
    const [loggedUserId, setLoggedUserId] = useState<string | null>(null);
    const [isBusinessAccount, setIsBusinessAccount] = useState(false);
    const [pendingReviewOrder, setPendingReviewOrder] = useState<any>(null);

    // Dine-in Scheduling
    const [orderType, setOrderType] = useState<'Takeaway' | 'Dine-in'>('Takeaway');
    const [scheduledTime, setScheduledTime] = useState("");
    const [activeShift, setActiveShift] = useState<'Lunch' | 'Dinner'>('Dinner');
    const [wasPreSelected, setWasPreSelected] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'Online' | 'Cash' | 'Wallet'>('Wallet');
    const [wallet, setWallet] = useState<{ balance: number; isPinSet: boolean } | null>(null);
    const [isBalanceLoading, setIsBalanceLoading] = useState(true);
    const [isRecharging, setIsRecharging] = useState(false);
    const [showPinModal, setShowPinModal] = useState(false);

    useEffect(() => {
        // Wait for cart to hydrate before making any redirect decisions
        if (!isHydrated) return;

        // Redirect if cart is empty after hydration
        if (cart.length === 0) {
            router.push("/");
            return;
        }

        // Hydrate order settings from localStorage
        const partnerId = cart[0]?.partnerId;
        
        // Safety Redirect: Multi-restaurant carts MUST go through /review-orders
        const uniquePartners = new Set(cart.map(item => item.partnerId));
        if (uniquePartners.size > 1) {
            router.push("/review-orders");
            return;
        }

        if (partnerId) {
            const savedType = localStorage.getItem(`dbi_order_type_${partnerId}`);
            const savedTime = localStorage.getItem(`dbi_scheduled_time_${partnerId}`);
            if (savedType === 'Dine-in' || savedType === 'Takeaway') {
                setOrderType(savedType);
                if (savedType === 'Dine-in') setWasPreSelected(true);
            }
            if (savedTime) setScheduledTime(savedTime);
        }

        const bToken = localStorage.getItem("businessToken");
        const uToken = localStorage.getItem("userToken");

        if (bToken) setIsBusinessAccount(true);

        const checkPendingReviews = async (uid: string) => {
            try {
                const res = await fetch(`${FOOD_BACKEND}/orders/user/${uid}`);
                if (res.ok) {
                    const orders = await res.json();
                    const unreviewed = orders.find((o: any) => o.status === "Completed" && !o.isReviewed);
                    if (unreviewed) {
                        setPendingReviewOrder(unreviewed);
                    }
                }
            } catch (err) {
                console.error("Failed to check reviews", err);
            }
        };

        const fetchUser = async () => {
            if (uToken) {
                try {
                    const [userRes, walletRes] = await Promise.all([
                        fetch(`${MAIN_API}/auth/me`, {
                            headers: { "Authorization": `Bearer ${uToken}` }
                        }),
                        fetch(`${MAIN_API}/wallet/balance`, {
                            headers: { "Authorization": `Bearer ${uToken}` }
                        })
                    ]);
                    
                    const userData = await userRes.json();
                    const walletData = await walletRes.json();

                    if (userData.success) {
                        setLoggedUser(userData.data);
                        setLoggedUserId(userData.data._id);
                        checkPendingReviews(userData.data._id);
                    }
                    if (walletData.success) {
                        setWallet(walletData);
                    }
                } catch (err) {
                    console.error("Failed to fetch user/wallet", err);
                } finally {
                    setIsBalanceLoading(false);
                }
            } else if (bToken) {
                try {
                    const res = await fetch(`${MAIN_API}/business/me`, {
                        headers: { "Authorization": `Bearer ${bToken}` }
                    });
                    const d = await res.json();
                    if (d.success) {
                        setLoggedUser(d.data);
                        setLoggedUserId(d.data._id);
                        checkPendingReviews(d.data._id);
                    }
                } catch { }
                setIsBalanceLoading(false);
            } else {
                setIsBalanceLoading(false);
            }
        };

        const fetchData = async () => {
            if (cart.length > 0) {
                const partnerId = cart[0].partnerId;

                // Restoring preferences from Menu selection
                const savedType = localStorage.getItem(`dbi_order_type_${partnerId}`);
                const savedTime = localStorage.getItem(`dbi_scheduled_time_${partnerId}`);
                if (savedType) setOrderType(savedType as any);
                if (savedTime) {
                    setScheduledTime(savedTime);
                    setWasPreSelected(true);
                }

                try {
                    const [setRes, coupRes] = await Promise.all([
                        fetch(`${FOOD_BACKEND}/settings`, { headers: { "x-partner-id": partnerId } }),
                        fetch(`${FOOD_BACKEND}/promotions`, { headers: { "x-partner-id": partnerId } })
                    ]);
                    
                    if (setRes.ok) setSettings(await setRes.json());
                    if (coupRes.ok) {
                        const data = await coupRes.json();
                        setCoupons(Array.isArray(data) ? data : []);
                    }
                } catch (err) {
                    console.error("Failed to fetch checkout data", err);
                }
            }
            setLoading(false);
        };

        fetchData();
        fetchUser();
    }, [isHydrated, cart.length]);

    const handleQuickRecharge = async () => {
        const rechargeAmount = Math.ceil(grandTotal - (wallet?.balance || 0));
        if (rechargeAmount <= 0) return;

        setIsRecharging(true);
        const token = localStorage.getItem("userToken");

        try {
            if (!(window as any).Razorpay) {
                const script = document.createElement("script");
                script.src = "https://checkout.razorpay.com/v1/checkout.js";
                script.async = true;
                document.body.appendChild(script);
                await new Promise((resolve) => {
                    script.onload = resolve;
                });
            }

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

            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: orderData.amount * 100,
                currency: "INR",
                name: "DBI Quick Recharge",
                description: `Top up for your order`,
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
                            // Refresh balance
                            const walletRes = await fetch(`${MAIN_API}/wallet/balance`, {
                                headers: { "Authorization": `Bearer ${token}` }
                            });
                            const wData = await walletRes.json();
                            if (wData.success) setWallet(wData);
                        } else {
                            toast.error(verifyData.error || "Payment verification failed");
                        }
                    } catch (err) {
                        toast.error("Error verifying payment");
                    }
                },
                prefill: {
                    name: loggedUser?.name || "",
                    email: loggedUser?.email || "",
                    contact: loggedUser?.phone || ""
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

    const getSlotsForShift = () => {
        if (!settings?.dineoutSettings) {
            return activeShift === 'Lunch' ? ["12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM"] : ["07:00 PM", "08:00 PM", "09:00 PM", "10:00 PM"];
        }
        const slots = activeShift === 'Lunch' 
            ? (settings.dineoutSettings.lunchSlots || ["12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM"])
            : (settings.dineoutSettings.dinnerSlots || ["07:00 PM", "08:00 PM", "09:00 PM", "10:00 PM", "11:00 PM"]);
        
        return [...slots].sort((a: string, b: string) => {
            const timeToMins = (t: string) => {
                const [time, mod] = t.split(' ');
                let [h, m] = time.split(':').map(Number);
                if (mod === 'PM' && h < 12) h += 12;
                if (mod === 'AM' && h === 12) h = 0;
                return h * 60 + m;
            };
            return timeToMins(a) - timeToMins(b);
        });
    };

    const handleApplyCoupon = async (codeStr?: string) => {
        const codeToApply = codeStr || couponInput;
        if (!codeToApply) return;
        setIsApplyingCoupon(true);

        if (cart.length === 0) {
            toast.error("Cart is empty");
            setIsApplyingCoupon(false);
            return;
        }

        try {
            const partnerId = cart[0].partnerId;
            const res = await fetch(`${FOOD_BACKEND}/promotions/validate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-partner-id': partnerId },
                body: JSON.stringify({ code: codeToApply, cartTotal: subtotal })
            });
            const data = await res.json();
            if (res.ok && data.valid) {
                setAppliedCoupon(data.coupon);
                setCouponInput('');
                toast.success('Coupon Applied Successfully!');
            } else {
                toast.error(data.message || 'Invalid coupon');
                setAppliedCoupon(null);
            }
        } catch (err) {
            toast.error('Failed to validate coupon');
            setAppliedCoupon(null);
        } finally {
            setIsApplyingCoupon(false);
        }
    };

    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const taxRate = settings?.taxPercentage ?? 5;
    const tax = subtotal * (taxRate / 100);
    const discount = appliedCoupon ? (
        appliedCoupon.type === 'Percentage' ? (subtotal * (appliedCoupon.value / 100)) :
            appliedCoupon.type === 'Flat Off' ? Number(appliedCoupon.value) : 0
    ) : 0;
    const finalDiscount = discount > (appliedCoupon?.maxLimit || Infinity) ? appliedCoupon.maxLimit : discount;
    const restaurantCharges = settings?.restaurantCharges ?? 0;
    const grandTotal = Math.max(0, subtotal + tax + restaurantCharges - finalDiscount);

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handleCheckout = async () => {
        if (!loggedUserId) {
            router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
            return;
        }

        if (cart.length === 0) return;
        const partnerId = cart[0].partnerId;

        if (isBusinessAccount && loggedUserId === partnerId) {
            toast.error("Business accounts cannot order from their own establishment.");
            return;
        }

        setIsSubmitting(true);
        try {
            // 1. Load Razorpay Script
            const isLoaded = await loadRazorpayScript();
            if (!isLoaded) {
                toast.error("Razorpay SDK failed to load. Please check your internet.");
                setIsSubmitting(false);
                return;
            }

            const itemsProcessed = cart.map(item => ({
                menuItem: item._id,
                quantity: item.quantity,
                price: item.price,
                name: item.name
            }));

            // 2. Trigger Razorpay Modal
            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: Math.round(grandTotal * 100),
                currency: "INR",
                name: settings?.businessName || "Digital Book of India",
                description: `Payment for Order at ${settings?.businessName || "Partner Restaurant"}`,
                image: "/assets/DLOGO.png",
                handler: async function (response: any) {
                    try {
                        const payload = {
                            items: itemsProcessed,
                            itemsArray: itemsProcessed,
                            subtotal: subtotal,
                            tax: tax,
                            discount: finalDiscount,
                            total: grandTotal,
                            couponCode: appliedCoupon ? appliedCoupon.code : null,
                            paymentMethod: "Online",
                            payment: "Paid",
                            razorpayPaymentId: response.razorpay_payment_id,
                            userId: loggedUserId,
                            customer: loggedUser?.name || 'Guest',
                            customerEmail: loggedUser?.email || '',
                            customerPhone: loggedUser?.displayPhone || loggedUser?.phone || '',
                            orderType: orderType,
                            restaurantCharges: restaurantCharges,
                            time: orderType === 'Dine-in' ? scheduledTime : 'ASAP'
                        };

                        const res = await fetch(`${FOOD_BACKEND}/orders`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json", "x-partner-id": partnerId },
                            body: JSON.stringify(payload)
                        });

                        const data = await res.json();

                        if (res.ok) {
                            clearCart();
                            if (typeof window !== "undefined") {
                                window.dispatchEvent(new Event("cartSync"));
                            }
                            toast.success("Order Placed Successfully!");
                            router.push("/user-profile");
                        } else {
                            toast.error(data.message || 'Failed to place order');
                        }
                    } catch (err) {
                        toast.error('Network error while placing order');
                    } finally {
                        setIsSubmitting(false);
                    }
                },
                prefill: {
                    name: loggedUser?.name || "",
                    email: loggedUser?.email || "",
                    contact: loggedUser?.displayPhone || loggedUser?.phone || ""
                },
                theme: { color: "#E03546" },
                modal: {
                    ondismiss: function () {
                        setIsSubmitting(false);
                    }
                }
            };

            const rzp = new (window as any).Razorpay(options);
            rzp.on('payment.failed', function (response: any) {
                toast.error("Payment Failed: " + response.error.description);
                setIsSubmitting(false);
            });
            rzp.open();

        } catch (err) {
            toast.error('Failed to initialize payment');
            setIsSubmitting(false);
        }
    };

    const handleCashCheckout = async () => {
        if (!loggedUserId) {
            router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
            return;
        }

        if (cart.length === 0) return;
        const partnerId = cart[0].partnerId;

        setIsSubmitting(true);
        try {
            const itemsProcessed = cart.map(item => ({
                menuItem: item._id,
                quantity: item.quantity,
                price: item.price,
                name: item.name
            }));

            const payload = {
                items: itemsProcessed,
                itemsArray: itemsProcessed,
                subtotal: subtotal,
                tax: tax,
                discount: finalDiscount,
                total: grandTotal,
                couponCode: appliedCoupon ? appliedCoupon.code : null,
                paymentMethod: "Cash",
                payment: "Pending",
                userId: loggedUserId,
                customer: loggedUser?.name || 'Guest',
                customerEmail: loggedUser?.email || '',
                customerPhone: loggedUser?.displayPhone || loggedUser?.phone || '',
                orderType: orderType,
                restaurantCharges: restaurantCharges,
                time: orderType === 'Dine-in' ? scheduledTime : 'ASAP'
            };

            const res = await fetch(`${FOOD_BACKEND}/orders`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "x-partner-id": partnerId },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (res.ok) {
                clearCart();
                if (typeof window !== "undefined") {
                    window.dispatchEvent(new Event("cartSync"));
                }
                toast.success("Order Placed Successfully!");
                router.push("/user-profile");
            } else {
                toast.error(data.message || 'Failed to place order');
            }
        } catch (err) {
            toast.error('Network error while placing order');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleWalletCheckout = async () => {
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

    const handlePlaceWalletOrder = async (pin: string) => {
        setIsSubmitting(true);
        try {
            const token = localStorage.getItem("userToken");
            const partnerId = cart[0]?.partnerId;
            if (!partnerId) throw new Error("Partner missing");

            // 1. Process Wallet Payment
            const payRes = await fetch(`${MAIN_API}/wallet/pay`, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ 
                    amount: grandTotal, 
                    pin,
                    description: `Order at ${settings?.businessName || 'Restaurant'}`
                })
            });

            const payData = await payRes.json();
            if (!payData.success) {
                throw new Error(payData.error || "Payment Failed");
            }

            // 2. Place Restaurant Order
            const itemsProcessed = cart.map(item => ({
                menuItem: item._id,
                quantity: item.quantity,
                price: item.price,
                name: item.name
            }));

            const payload = {
                items: itemsProcessed,
                itemsArray: itemsProcessed,
                subtotal: subtotal,
                tax: tax,
                discount: finalDiscount,
                total: grandTotal,
                couponCode: appliedCoupon ? appliedCoupon.code : null,
                paymentMethod: "Wallet",
                payment: "Paid",
                userId: loggedUserId,
                customer: loggedUser?.name || 'Guest',
                customerEmail: loggedUser?.email || '',
                customerPhone: loggedUser?.displayPhone || loggedUser?.phone || '',
                orderType: orderType,
                restaurantCharges: restaurantCharges,
                time: orderType === 'Dine-in' ? scheduledTime : 'ASAP'
            };

            const res = await fetch(`${FOOD_BACKEND}/orders`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "x-partner-id": partnerId },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                clearCart();
                if (typeof window !== "undefined") {
                    window.dispatchEvent(new Event("cartSync"));
                }
                setShowPinModal(false);
                toast.success("Payment & Order Success!");
                router.push("/user-profile?tab=orders");
            } else {
                const errData = await res.json();
                throw new Error(errData.message || 'Payment deducted but order placement failed. Contact support.');
            }
        } catch (err: any) {
            toast.error("Ordering Error", { description: err.message });
        } finally {
            setIsSubmitting(false);
        }
    };

    const onCheckoutClick = () => {
        if (paymentMethod === 'Cash') {
            handleCashCheckout();
        } else if (paymentMethod === 'Wallet') {
            handleWalletCheckout();
        } else {
            handleCheckout();
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center text-foreground">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
                <p className="mt-4 uppercase tracking-widest text-xs opacity-50">Loading Checkout...</p>
            </div>
        );
    }



    return (
        <div className={`min-h-screen relative overflow-hidden bg-background text-foreground`}>
          
            <CursorGlow />
            <Navbar />

            <main className="pt-28 md:pt-36 pb-24 relative z-10 px-4 max-w-2xl mx-auto space-y-6">
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                            <ShoppingBag className="text-primary w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-display font-bold uppercase tracking-widest leading-none">Secure Checkout</h1>
                            <p className="opacity-50 text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] mt-1.5">Review your order & Pay</p>
                        </div>
                    </div>
                </motion.div>

                {/* Customer Details Box */}
                {loggedUser && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
                        className={`rounded-[2rem] p-6 md:p-8 backdrop-blur-xl border shadow-xl ${isLight ? 'bg-white/90 border-slate-200 shadow-slate-200/50' : 'bg-slate-900/60 border-white/10 shadow-black/50'}`}
                    >
                        <h3 className={`text-xs font-black uppercase tracking-widest mb-6 pb-4 border-b border-dashed ${isLight ? 'text-slate-400 border-slate-200' : 'text-white/30 border-white/10'}`}>Contact Information</h3>
                        <div className="flex flex-col sm:flex-row flex-wrap gap-6 md:gap-10">
                            <div className="flex-1 min-w-[150px]">
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-1">Name</p>
                                <p className="font-bold truncate">{loggedUser.name}</p>
                            </div>
                            <div className="flex-[2] min-w-[200px]">
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-1">Email</p>
                                <p className="font-bold truncate" title={loggedUser.email}>{loggedUser.email}</p>
                            </div>
                            <div className="flex-1 min-w-[120px]">
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-1">Phone</p>
                                <p className="font-bold truncate">{loggedUser.displayPhone || loggedUser.phone || 'N/A'}</p>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Wallet Info Box */}
                {!isBusinessAccount && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }} 
                        animate={{ opacity: 1, scale: 1 }} 
                        className={`p-8 rounded-[2.5rem] bg-gradient-to-br border shadow-2xl relative overflow-hidden group transition-all ${
                            isLight 
                            ? 'from-blue-50 to-indigo-50 border-blue-100' 
                            : 'from-indigo-500/10 to-purple-500/10 border-white/10'
                        }`}
                    >
                        <div className={`absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity ${isLight ? 'text-blue-500' : 'text-white'}`}>
                            <Wallet size={120} />
                        </div>
                        <div className="relative z-10 flex justify-between items-center">
                            <div className="space-y-1">
                                <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${isLight ? 'text-blue-600' : 'text-indigo-400'}`}>DBI Digital Wallet</p>
                                <p className={`text-3xl font-black tracking-tight italic ${isLight ? 'text-slate-900' : 'text-white'}`}>₹{wallet?.balance?.toFixed(2) || '0.00'}</p>
                            </div>
                            <div className="text-right">
                                <p className={`text-[10px] font-black uppercase tracking-widest ${isLight ? 'text-slate-400' : 'text-white/40'}`}>Bill Total</p>
                                <p className={`text-2xl font-black tracking-tight italic ${wallet !== null && wallet.balance < grandTotal ? 'text-red-500' : 'text-emerald-500'}`}>
                                    ₹{grandTotal.toFixed(2)}
                                </p>
                            </div>
                        </div>
                        {wallet !== null && wallet.balance < grandTotal && (
                            <div className={`mt-6 pt-6 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${isLight ? 'border-blue-100' : 'border-white/5'}`}>
                                <div className="flex items-center gap-2 text-red-500">
                                    <AlertCircle size={16} />
                                    <p className="text-[11px] font-black uppercase italic tracking-wider">Insufficient funds. Recharge to proceed.</p>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleQuickRecharge();
                                    }}
                                    disabled={isRecharging}
                                    className="relative z-50 bg-[#E03546] hover:bg-[#c42e3c] active:scale-95 text-white rounded-xl px-6 py-4 flex items-center gap-2 font-black uppercase text-[10px] tracking-widest transition-all shadow-xl shadow-red-600/30 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
                )}

                {/* Items Section */}
                <motion.div 
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    className={`rounded-[2rem] p-6 md:p-8 backdrop-blur-xl border shadow-xl ${isLight ? 'bg-white/90 border-slate-200 shadow-slate-200/50' : 'bg-slate-900/60 border-white/10 shadow-black/50'}`}
                >
                    <h3 className={`text-xs font-black uppercase tracking-widest mb-6 pb-4 border-b border-dashed ${isLight ? 'text-slate-400 border-slate-200' : 'text-white/30 border-white/10'}`}>Order Items</h3>
                    <div className="space-y-4">
                        {cart.map((item) => (
                            <div key={item._id} className="flex items-start gap-4 group">
                                <div className={`w-4 h-4 mt-1 rounded border-2 flex items-center justify-center shrink-0 ${item.isVeg ? 'border-emerald-600' : 'border-red-600'}`}>
                                    <div className={`w-1.5 h-1.5 rounded-full ${item.isVeg ? 'bg-emerald-600' : 'bg-red-600'}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-base font-bold truncate">{item.name}</div>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-xs font-bold uppercase tracking-wider opacity-50">Qty: {item.quantity}</span>
                                        <span className="text-xs font-medium opacity-20">•</span>
                                        <span className="text-xs font-bold uppercase tracking-wider opacity-50">₹{item.price} each</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="font-bold text-lg">₹{item.price * item.quantity}</div>
                                    <button
                                        onClick={() => removeFromCart(item._id)}
                                        className="w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:bg-red-500/20 hover:border-red-500/40 hover:text-red-400 transition-all ml-2"
                                        title="Remove item"
                                    >
                                        <X size={12} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Offers & Coupons - ONLY FOR TAKEAWAY */}
                {orderType === 'Takeaway' && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                        className={`rounded-[2rem] p-6 md:p-8 backdrop-blur-xl border shadow-xl ${isLight ? 'bg-white/90 border-slate-200 shadow-slate-200/50' : 'bg-slate-900/60 border-white/10 shadow-black/50'}`}
                    >
                        <h3 className={`text-xs font-black uppercase tracking-widest mb-6 pb-4 border-b border-dashed ${isLight ? 'text-slate-400 border-slate-200' : 'text-white/30 border-white/10'}`}>Save on Order</h3>
                        
                        {coupons.filter(c => !c.isPrivate && c.status === 'Active').length > 0 && (
                            <div className="mb-6 flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                                {coupons.filter(c => !c.isPrivate && c.status === 'Active').map((cpn: any) => (
                                    <button
                                        key={cpn._id}
                                        onClick={() => handleApplyCoupon(cpn.code)}
                                        className={`min-w-[160px] p-4 rounded-2xl border text-left transition-all ${appliedCoupon?.code === cpn.code
                                            ? 'bg-emerald-600/10 border-emerald-600 text-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.15)]'
                                            : isLight ? 'bg-slate-50 border-slate-200 text-slate-900 hover:border-slate-300' : 'bg-white/5 border-white/10 text-white hover:border-white/20'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between mb-1.5">
                                            <span className="font-black text-[10px] tracking-widest uppercase">{cpn.code}</span>
                                            <Gift size={12} className={appliedCoupon?.code === cpn.code ? "opacity-100" : "opacity-40"} />
                                        </div>
                                        <p className="font-bold text-[10px] truncate opacity-70 tracking-wide uppercase">{cpn.description || `${cpn.type} ${cpn.value}`}</p>
                                    </button>
                                ))}
                            </div>
                        )}

                        {appliedCoupon ? (
                            <div className={`flex items-center justify-between p-4 rounded-2xl border ${isLight ? 'bg-emerald-50 border-emerald-200' : 'bg-emerald-500/10 border-emerald-500/30'}`}>
                                <div className="flex items-center gap-3">
                                    <CheckCircle2 size={18} className="text-emerald-500" />
                                    <p className="font-bold text-[11px] md:text-xs text-emerald-600 dark:text-emerald-400 tracking-wider uppercase">Savings Applied: {appliedCoupon.code}</p>
                                </div>
                                <button onClick={() => setAppliedCoupon(null)} className="text-[10px] font-black text-[#E03546] hover:underline uppercase tracking-widest">Remove</button>
                            </div>
                        ) : (
                            <div className={`flex items-center gap-3 p-1 pl-5 rounded-2xl border transition-all focus-within:border-[#E03546] ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/10'}`}>
                                <Gift size={16} className="opacity-30" />
                                <input
                                    type="text"
                                    placeholder="Enter Coupon Code"
                                    value={couponInput}
                                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                                    className="flex-1 bg-transparent py-4 text-xs font-bold outline-none placeholder:font-bold placeholder:opacity-30 uppercase tracking-wider"
                                />
                                <button
                                    onClick={() => handleApplyCoupon()}
                                    disabled={!couponInput || isApplyingCoupon}
                                    className="px-6 py-3 rounded-xl font-black text-[10px] tracking-widest uppercase bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-slate-900 transition-colors mr-1"
                                >
                                    {isApplyingCoupon ? "..." : "Apply"}
                                </button>
                            </div>
                        )}
                    </motion.div>
                )}

                {/* Payment method selection */}
                <motion.div 
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
                    className={`rounded-[2rem] p-6 md:p-8 backdrop-blur-xl border shadow-xl ${isLight ? 'bg-white/90 border-slate-200 shadow-slate-200/50' : 'bg-slate-900/60 border-white/10 shadow-black/50'}`}
                >
                    <h3 className={`text-xs font-black uppercase tracking-widest mb-6 pb-4 border-b border-dashed ${isLight ? 'text-slate-400 border-slate-200' : 'text-white/30 border-white/10'}`}>Payment Method</h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {[
                            { id: 'Wallet', label: 'Digital Wallet', icon: Wallet, color: 'text-indigo-500' },
                            { id: 'Online', label: 'Pay Online', icon: CreditCard, color: 'text-emerald-500' },
                            { id: 'Cash', label: 'Cash / COD', icon: Banknote, color: 'text-amber-500' }
                        ].map((method) => (
                            <button
                                key={method.id}
                                onClick={() => setPaymentMethod(method.id as any)}
                                className={`p-6 rounded-[1.5rem] border-2 transition-all flex flex-col items-center gap-3 ${paymentMethod === method.id 
                                    ? `bg-slate-900 border-slate-900 text-white shadow-xl scale-[1.02]` 
                                    : isLight ? 'bg-slate-50 border-slate-100 text-slate-400 hover:border-slate-200' : 'bg-white/5 border-white/10 text-white/30 hover:border-white/20'
                                }`}
                            >
                                <method.icon size={24} className={paymentMethod === method.id ? 'text-white' : method.color} />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">{method.label}</span>
                            </button>
                        ))}
                    </div>
                </motion.div>
                <motion.div 
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                    className={`rounded-[2rem] p-6 md:p-8 backdrop-blur-xl border shadow-xl ${isLight ? 'bg-white/90 border-slate-200 shadow-slate-200/50' : 'bg-slate-900/60 border-white/10 shadow-black/50'}`}
                >
                    <h3 className={`text-xs font-black uppercase tracking-widest mb-6 pb-4 border-b border-dashed ${isLight ? 'text-slate-400 border-slate-200' : 'text-white/30 border-white/10'}`}>Bill Summary</h3>
                    
                    <div className="space-y-4 mb-8">
                        <div className="flex justify-between items-center text-xs md:text-sm font-bold opacity-70">
                            <span>Item Total</span>
                            <span>₹{subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs md:text-sm font-bold opacity-70">
                            <span>Taxes & GST ({taxRate}%)</span>
                            <span>₹{tax.toFixed(2)}</span>
                        </div>
                        {restaurantCharges > 0 && (
                            <div className="flex justify-between items-center text-xs md:text-sm font-bold opacity-70">
                                <span>Restaurant Charges</span>
                                <span>₹{restaurantCharges.toFixed(2)}</span>
                            </div>
                        )}
                        {appliedCoupon && (
                            <div className="flex justify-between items-center text-xs md:text-sm font-black text-emerald-600 dark:text-emerald-400">
                                <span>Coupon Offer Discount</span>
                                <span>- ₹{discount.toFixed(2)}</span>
                            </div>
                        )}
                    </div>

                    <div className={`p-6 rounded-[1.5rem] border flex items-center justify-between mb-8 ${isLight ? 'bg-slate-900 text-white border-slate-900' : 'bg-[#E03546]/10 text-white border-[#E03546]/30'}`}>
                        <div className="flex flex-col">
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-60">To Pay</p>
                            <p className="text-3xl font-black tracking-tight mt-1">₹{grandTotal.toFixed(2)}</p>
                        </div>
                        <div className="hidden sm:flex items-center gap-2 opacity-80 text-[10px] font-black uppercase tracking-wider bg-white/10 px-4 py-2 rounded-xl">
                            <CheckCircle2 size={16} /> Secure
                        </div>
                    </div>

                    {/* Secure Payment Trigger */}
                    <div>
                        {pendingReviewOrder ? (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="w-full p-6 rounded-[2rem] bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400"
                            >
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center">
                                        <MessageSquare className="animate-bounce" />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-sm uppercase tracking-widest">Feedback Required</h4>
                                        <p className="text-[10px] opacity-70 font-bold uppercase tracking-wider mt-0.5">Please rate your last order first</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => router.push('/user-profile?tab=orders')}
                                    className="w-full py-4 bg-amber-500 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-lg shadow-amber-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                                >
                                    Rate {pendingReviewOrder.id}
                                </button>
                            </motion.div>
                        ) : (isBusinessAccount && loggedUserId === cart[0]?.partnerId) ? (
                            <div className="w-full p-6 rounded-[1.5rem] bg-amber-500/10 border border-amber-500/30 text-amber-500 flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">⚠️</div>
                                <div>
                                    <p className="text-[11px] font-black uppercase tracking-wider">Business Restriction</p>
                                    <p className="text-[10px] font-medium opacity-80 mt-1 leading-relaxed">You cannot order from your own business account. Please login as a user.</p>
                                </div>
                            </div>
                        ) : !loggedUserId ? (
                            <Button
                                onClick={() => { router.push(`/login?redirect=/checkout`); }}
                                className="w-full py-8 rounded-[1.5rem] bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 text-sm transition-all active:scale-[0.98]"
                            >
                                <ShoppingBag size={20} />
                                Login to Process Order
                            </Button>
                        ) : (
                            <Button
                        onClick={onCheckoutClick}
                        disabled={isSubmitting}
                        className="w-full py-8 rounded-[1.5rem] bg-[#E03546] hover:bg-[#c32d3d] text-white font-black uppercase tracking-widest shadow-xl shadow-red-600/20 flex items-center justify-center gap-3 text-sm transition-all active:scale-[0.98]"
                    >
                        {isSubmitting ? (
                            <Loader2 className="animate-spin w-5 h-5" />
                        ) : (
                            <>
                                {paymentMethod === 'Cash' ? <Banknote size={20} /> : paymentMethod === 'Wallet' ? <Wallet size={20} /> : <ShoppingBag size={20} />}
                                {paymentMethod === 'Cash' ? 'Confirm Cash Order' : paymentMethod === 'Wallet' ? 'Pay via Wallet & Confirm' : `Pay ₹${grandTotal.toFixed(2)} & Confirm`}
                            </>
                        )}
                    </Button>
                )}
            </div>
        </motion.div>
    </main>

    <WalletPinModal 
        isOpen={showPinModal} 
        onClose={() => setShowPinModal(false)} 
        onVerify={handlePlaceWalletOrder} 
        isVerifying={isSubmitting} 
    />
</div>
    );
}
