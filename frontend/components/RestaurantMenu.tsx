"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    ShoppingBag, Plus, Minus, X, ChevronRight,
    Utensils, Loader2, CreditCard, Search,
    Star, Timer, Info, Percent, CheckCircle2, AlertCircle,
    ArrowRight, Gift, Clock, Calendar
} from "lucide-react";
import OrderSuccess from "./OrderSuccess";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface RestaurantMenuProps {
    partnerId: string;
    businessName: string;
    isLight: boolean;
}

const FOOD_BACKEND = process.env.NEXT_PUBLIC_FOOD_API_URL;
const MAIN_API = process.env.NEXT_PUBLIC_API_URL;

export default function RestaurantMenu({ partnerId, businessName, isLight }: RestaurantMenuProps) {
    const router = useRouter();
    const { cart, addToCart, removeFromCart, updateQuantity, total: subtotal, clearCart } = useCart();
    const [categories, setCategories] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [reviews, setReviews] = useState<any[]>([]);
    const [coupons, setCoupons] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState<string>("All");
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [orderType, setOrderType] = useState<'Takeaway' | 'Dine-in'>('Takeaway');
    const [tableNumber, setTableNumber] = useState('');
    const [searchQuery, setSearchQuery] = useState("");
    const [isSticky, setIsSticky] = useState(false);
    const [scheduledTime, setScheduledTime] = useState("");

    // Modal States
    const [isReviewsModalOpen, setIsReviewsModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<any>(null); // For Ingredients Modal

    // Coupon State
    const [couponInput, setCouponInput] = useState("");
    const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
    const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
    // Success State
    const [placedOrder, setPlacedOrder] = useState<any>(null);
    const [isTrackingOpen, setIsTrackingOpen] = useState(false);

    // Reservation State
    const [viewMode, setViewMode] = useState<'Menu' | 'Reservation'>('Menu');
    const [reservationData, setReservationData] = useState({
        name: '',
        phone: '',
        guests: 2,
        date: new Date().toISOString().split('T')[0],
        timeSlot: '07:00 PM'
    });
    const [isSubmittingReservation, setIsSubmittingReservation] = useState(false);
    const [bookingSuccess, setBookingSuccess] = useState<any>(null);
    const [dineoutSettings, setDineoutSettings] = useState<any>(null);
    const [settings, setSettings] = useState<any>(null);
    const [storeStatus, setStoreStatus] = useState<any>(null);
    const [activeShift, setActiveShift] = useState<'Lunch' | 'Dinner'>('Dinner');
    const [loggedUserId, setLoggedUserId] = useState<string | null>(null); // Track who placed the order
    const [isBusinessAccount, setIsBusinessAccount] = useState(false); // Business accounts cannot order
    const [userResolved, setUserResolved] = useState(false); // True after auth check completes

    // Lock body scroll when any modal is open
    useEffect(() => {
        if (selectedProduct || isCartOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [selectedProduct, bookingSuccess, isCartOpen]);

    // Persistence Support: Hydrate from localStorage on mount
    useEffect(() => {
        const savedType = localStorage.getItem(`dbi_order_type_${partnerId}`);
        const savedView = localStorage.getItem(`dbi_view_mode_${partnerId}`);
        const savedTime = localStorage.getItem(`dbi_scheduled_time_${partnerId}`);

        if (savedType === 'Dine-in' || savedType === 'Takeaway') {
            setOrderType(savedType);
        }
        if (savedView === 'Menu' || savedView === 'Reservation') {
            setViewMode(savedView);
        }
        if (savedTime) {
            setScheduledTime(savedTime);
        }
    }, [partnerId]);

    // Persistence Support: Sync to localStorage on change
    useEffect(() => {
        localStorage.setItem(`dbi_order_type_${partnerId}`, orderType);
        localStorage.setItem(`dbi_view_mode_${partnerId}`, viewMode);
        if (scheduledTime) {
            localStorage.setItem(`dbi_scheduled_time_${partnerId}`, scheduledTime);
        }
    }, [orderType, viewMode, scheduledTime, partnerId]);

    // Helper: Convert time string "HH:MM AM/PM" to minutes from midnight
    const timeToMinutes = (timeStr: string) => {
        if (!timeStr) return 0;
        const [time, modifier] = timeStr.split(' ');
        let [hours, minutes] = time.split(':').map(Number);
        if (modifier === 'PM' && hours < 12) hours += 12;
        if (modifier === 'AM' && hours === 12) hours = 0;
        return hours * 60 + minutes;
    };

    // Calculate Operational Status
    const getOperationalStatus = () => {
        // Handle initial loading state
        if (storeStatus === null && settings === null) {
            return { isOpen: false, message: 'Syncing...', todayHours: 'Syncing Status...' };
        }

        // 1. Manual Toggle Check (Highest Priority)
        // If storeStatus has been fetched and explicitly says closed, it's CLOSED.
        // If storeStatus fetch failed or hasn't returned yet, we default to CLOSED for safety.
        const isMasterOpen = storeStatus?.isOpen === true;
        if (storeStatus && !isMasterOpen) {
            return { isOpen: false, message: 'CLOSED NOW', todayHours: 'Store Not Accepting Orders' };
        }

        // 2. Settings / Business Hours Check
        if (!settings) {
            // If store status is OPEN but settings haven't loaded, we show as OPEN but with generic hours
            return {
                isOpen: isMasterOpen,
                message: isMasterOpen ? 'OPEN NOW' : 'CLOSED NOW',
                todayHours: 'Syncing Business Hours...'
            };
        }

        const now = new Date();
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const today = days[now.getDay()];
        const shifts = settings.businessHours?.[today] || [];

        if (shifts.length === 0) {
            return { isOpen: false, message: 'CLOSED TODAY', todayHours: 'No Registered Hours' };
        }

        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        const isOpenNow = shifts.some((s: any) => {
            const start = timeToMinutes(s.from);
            const end = timeToMinutes(s.to);
            return currentMinutes >= start && currentMinutes <= end;
        });

        const sortedShifts = [...shifts].sort((a: any, b: any) => timeToMinutes(a.from) - timeToMinutes(b.from));
        const hoursStr = sortedShifts.map((s: any) => `${s.from} - ${s.to}`).join(', ');

        // Final Decision: Must be both Master Open AND within Hours
        const finalOpen = isMasterOpen && isOpenNow;

        return {
            isOpen: finalOpen,
            message: finalOpen ? 'OPEN NOW' : 'CLOSED NOW',
            todayHours: hoursStr
        };
    };

    // Sync Service Selection to LocalStorage
    useEffect(() => {
        localStorage.setItem(`dbi_order_type_${partnerId}`, orderType);
        localStorage.setItem(`dbi_scheduled_time_${partnerId}`, scheduledTime);
    }, [orderType, scheduledTime, partnerId]);

    const statusObj = getOperationalStatus();
    const isOperational = statusObj.isOpen;

    // Polling for status updates (elevated to parent for Live Bar sync)
    useEffect(() => {
        if (!placedOrder) return;

        // If order finished, clear persistence
        if (placedOrder.status === 'Completed') {
            localStorage.removeItem(`active_food_order_${partnerId}`);
            return;
        }

        const pollStatus = async () => {
            try {
                const res = await fetch(`${FOOD_BACKEND}/orders/${placedOrder.id}`, {
                    headers: { "x-partner-id": partnerId }
                });
                if (res.ok) {
                    const latestOrder = await res.json();
                    setPlacedOrder(latestOrder);
                }
            } catch (err) {
                console.error("Status check failed", err);
            }
        };

        const interval = setInterval(pollStatus, 10000); // 10s polling
        return () => clearInterval(interval);
    }, [placedOrder?.id, placedOrder?.status, partnerId]);

    // Hydration: Check for active order on mount
    useEffect(() => {
        const hydrateOrder = async () => {
            const savedOrderId = localStorage.getItem(`active_food_order_${partnerId}`);
            if (savedOrderId && !placedOrder) {
                try {
                    const res = await fetch(`${FOOD_BACKEND}/orders/${savedOrderId}`, {
                        headers: { "x-partner-id": partnerId }
                    });
                    if (res.ok) {
                        const existingOrder = await res.json();
                        if (existingOrder.status !== 'Completed') {
                            setPlacedOrder(existingOrder);
                            // Only auto-open if it's the first hit
                            setIsTrackingOpen(true);
                        } else {
                            localStorage.removeItem(`active_food_order_${partnerId}`);
                        }
                    }
                } catch (err) {
                    console.error("Hydration failed", err);
                }
            }
        };
        hydrateOrder();

        const fetchSettings = async () => {
            try {
                const res = await fetch(`${FOOD_BACKEND}/settings`, {
                    headers: { "x-partner-id": partnerId }
                });
                if (res.ok) {
                    const data = await res.json();
                    setSettings(data);
                }
            } catch (err) {
                console.error("Settings fetch failed", err);
            }
        };

        const fetchStoreStatus = async () => {
            try {
                const res = await fetch(`${FOOD_BACKEND}/store-status`, {
                    headers: { "x-partner-id": partnerId }
                });
                if (res.ok) {
                    const data = await res.json();
                    setStoreStatus(data);
                }
            } catch (err) {
                console.error("Store status fetch failed", err);
            }
        };

        const fetchDineoutSettings = async () => {
            try {
                const res = await fetch(`${FOOD_BACKEND}/dineout/settings`, {
                    headers: { "x-partner-id": partnerId }
                });
                if (res.ok) {
                    const data = await res.json();
                    setDineoutSettings(data.data);
                }
            } catch (err) {
                console.error("Dineout settings fetch failed", err);
            }
        };

        const fetchUser = async () => {
            const bToken = localStorage.getItem("businessToken");
            const uToken = localStorage.getItem("userToken");

            if (bToken) {
                try {
                    const res = await fetch(`${MAIN_API}/business/me`, {
                        headers: { Authorization: `Bearer ${bToken}` }
                    });
                    const data = await res.json();
                    if (data.success) {
                        const user = data.data;
                        setLoggedUserId(user._id);
                        setIsBusinessAccount(true); // Block ordering for biz accounts
                        setReservationData(prev => ({
                            ...prev,
                            name: user.brandName || user.businessName || '',
                            phone: user.primaryContactNumber || ''
                        }));
                    } else {
                        // Token is stale/expired — remove it so guests aren't blocked
                        localStorage.removeItem("businessToken");
                    }
                } catch (err) {
                    // Network error — remove stale token to unblock guests
                    localStorage.removeItem("businessToken");
                    console.error("Business user fetch failed", err);
                }
            } else if (uToken) {
                try {
                    const res = await fetch(`${MAIN_API}/auth/me`, {
                        headers: { Authorization: `Bearer ${uToken}` }
                    });
                    const data = await res.json();
                    if (data.success) {
                        const user = data.data;
                        setLoggedUserId(user._id);
                        setReservationData(prev => ({
                            ...prev,
                            name: user.name || '',
                            phone: user.phone || ''
                        }));
                    } else {
                        // Stale user token — remove it
                        localStorage.removeItem("userToken");
                    }
                } catch (err) { console.error("Regular user fetch failed", err); }
            }
        };

        fetchSettings();
        fetchStoreStatus();
        fetchDineoutSettings();
        fetchUser();

        // Load Razorpay Script globally
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, [partnerId]);

    // Auto-switch shift if current one is finished for Today
    useEffect(() => {
        const isToday = reservationData.date === new Date().toISOString().split('T')[0];
        if (isToday && activeShift === 'Lunch') {
            const now = new Date();
            const currentMins = now.getHours() * 60 + now.getMinutes();
            let lunchSlots: string[] = [];
            if (dineoutSettings) {
                lunchSlots = dineoutSettings.lunchSlots || [];
            }
            if (lunchSlots.length > 0) {
                const isLunchFinished = lunchSlots.every(s => timeToMinutes(s) <= currentMins + 15);
                if (isLunchFinished) {
                    setActiveShift('Dinner');
                }
            }
        }
    }, [reservationData.date, activeShift, dineoutSettings]);

    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                const headers = { "x-partner-id": partnerId };
                const [catRes, prodRes, revRes, promoRes] = await Promise.all([
                    fetch(`${FOOD_BACKEND}/categories`, { headers }),
                    fetch(`${FOOD_BACKEND}/products`, { headers }),
                    fetch(`${FOOD_BACKEND}/reviews`, { headers }),
                    fetch(`${FOOD_BACKEND}/promotions`, { headers })
                ]);

                const [cats, prods, revs, promos] = await Promise.all([
                    catRes.json(), prodRes.json(), revRes.json(), promoRes.json()
                ]);

                setCategories(Array.isArray(cats) ? cats : []);
                setProducts(Array.isArray(prods) ? prods : []);
                setReviews(Array.isArray(revs) ? revs : []);
                setCoupons(Array.isArray(promos) ? promos : []);

                if (cats.length > 0) setActiveCategory("All");
            } catch (err) {
                console.error("Failed to fetch menu data", err);
            } finally {
                setLoading(false);
            }
        };

        if (partnerId) fetchAllData();

        const handleScroll = () => {
            if (menuRef.current) {
                const rect = menuRef.current.getBoundingClientRect();
                setIsSticky(rect.top <= 80);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [partnerId]);

    // Pricing Logic
    const taxRate = (settings?.taxPercentage ?? 5) / 100;
    const tax = subtotal * taxRate;
    const restaurantCharges = settings?.restaurantCharges ?? 0;
    const reservationFeePerPerson = settings?.dineoutBookingFee ?? 0;
    const totalReservationFee = reservationFeePerPerson * reservationData.guests;

    const finalizeReservation = async (paymentId?: string) => {
        try {
            const res = await fetch(`${FOOD_BACKEND}/dineout/reservations`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    partnerId,
                    userId: loggedUserId || null,
                    customerName: reservationData.name,
                    customerPhone: reservationData.phone,
                    guests: reservationData.guests,
                    date: reservationData.date,
                    timeSlot: reservationData.timeSlot,
                    paymentId,
                    feeAmount: totalReservationFee
                })
            });
            const data = await res.json();
            if (res.ok) {
                toast.success("Table Reserved Successfully!");
                const b = data.data;
                router.push(`/reservation-success?id=${b.bookingId}&name=${encodeURIComponent(b.customerName)}&date=${encodeURIComponent(reservationData.date)}&time=${encodeURIComponent(b.timeSlot)}&guests=${b.guests}`);
            } else {
                toast.error(data.message || "Failed to book table");
            }
        } catch (err) {
            toast.error("Failed to complete reservation");
        } finally {
            setIsSubmittingReservation(false);
        }
    };

    const handleBooking = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmittingReservation) return;

        // Block business owners from booking at their own restaurant
        if (isBusinessAccount && loggedUserId === partnerId) {
            toast.error("You cannot make a dineout reservation at your own business.", { duration: 5000 });
            return;
        }

        setIsSubmittingReservation(true);

        try {
            if (totalReservationFee > 0) {
                // Razorpay Payment Flow for Reservation
                if (!(window as any).Razorpay) {
                    toast.error("Razorpay SDK not loaded yet. Please wait a moment.");
                    setIsSubmittingReservation(false);
                    return;
                }

                const options = {
                    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                    amount: Math.round(totalReservationFee * 100),
                    currency: "INR",
                    name: businessName,
                    description: `Reservation Fee for ${reservationData.guests} People`,
                    image: "/assets/DLOGO.png",
                    handler: async function (response: any) {
                        await finalizeReservation(response.razorpay_payment_id);
                    },
                    modal: {
                        ondismiss: function () {
                            setIsSubmittingReservation(false);
                        }
                    },
                    prefill: {
                        name: reservationData.name,
                        contact: reservationData.phone
                    },
                    theme: { color: "#4894fe" }
                };

                const rzp = new (window as any).Razorpay(options);
                rzp.on('payment.failed', function () {
                    setIsSubmittingReservation(false);
                    toast.error("Payment Failed");
                });
                rzp.open();
            } else {
                // Free Reservation
                await finalizeReservation();
            }
        } catch (err) {
            toast.error("Something went wrong with the payment");
            setIsSubmittingReservation(false);
        }
    };
    let discount = 0;
    if (appliedCoupon) {
        if (appliedCoupon.type === 'Percentage') {
            discount = (subtotal * appliedCoupon.value) / 100;
        } else if (appliedCoupon.type === 'Flat Off') {
            discount = appliedCoupon.value;
        }
    }
    const grandTotal = Math.max(0, subtotal + tax + restaurantCharges - discount);

    const handleApplyCoupon = async (codeOverride?: string) => {
        const code = codeOverride || couponInput;
        if (!code) return;
        setIsApplyingCoupon(true);
        try {
            const res = await fetch(`${FOOD_BACKEND}/promotions/validate`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-partner-id": partnerId
                },
                body: JSON.stringify({ code, amount: subtotal })
            });
            const data = await res.json();
            if (res.ok && data.valid) {
                setAppliedCoupon(data.coupon);
                setCouponInput(code);
                toast.success(`Coupon "${code}" applied!`);
            } else {
                toast.error(data.message || "Invalid coupon code");
            }
        } catch (err) {
            toast.error("Failed to validate coupon");
        } finally {
            setIsApplyingCoupon(false);
        }
    };

    // Slot Generation / Filtering Logic
    const getSlotsForShift = () => {
        let slots: string[] = [];
        const isToday = reservationData.date === new Date().toISOString().split('T')[0];
        const now = new Date();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();

        if (!dineoutSettings) {
            slots = activeShift === 'Lunch' ? ["12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM"] : ["07:00 PM", "08:00 PM", "09:00 PM", "10:00 PM"];
        } else if (activeShift === 'Lunch') {
            slots = dineoutSettings.lunchSlots && dineoutSettings.lunchSlots.length > 0
                ? dineoutSettings.lunchSlots
                : ["12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM"];
        } else {
            slots = dineoutSettings.dinnerSlots && dineoutSettings.dinnerSlots.length > 0
                ? dineoutSettings.dinnerSlots
                : ["07:00 PM", "08:00 PM", "09:00 PM", "10:00 PM", "11:00 PM"];
        }

        // Sort slots chronologically
        let sortedSlots = [...slots].sort((a, b) => timeToMinutes(a) - timeToMinutes(b));

        // Filter past slots if today is selected
        if (isToday) {
            sortedSlots = sortedSlots.filter(slot => timeToMinutes(slot) > currentMinutes + 15); // 15 mins buffer
        }

        return sortedSlots;
    };

    const handleCheckout = async () => {
        if (cart.length === 0) return;

        // Block business owners from ordering their own food
        if (isBusinessAccount && loggedUserId === partnerId) {
            toast.error("You cannot place food orders from your own business.", { duration: 5000 });
            return;
        }

        const loadScript = (src: string) => {
            return new Promise((resolve) => {
                const script = document.createElement("script");
                script.src = src;
                script.onload = () => resolve(true);
                script.onerror = () => resolve(false);
                document.body.appendChild(script);
            });
        };

        const res = await loadScript("https://checkout.razorpay.com/v1/checkout.js");
        if (!res) return toast.error("Razorpay SDK failed to load.");

        const options = {
            key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
            amount: Math.round(grandTotal * 100),
            currency: "INR",
            name: businessName,
            description: "Food Order Payment",
            image: "/assets/DLOGO.png",
            handler: async function (response: any) {
                try {
                    const orderData = {
                        partnerId,
                        userId: loggedUserId || null,
                        customer: "Web Customer",
                        items: cart.map(item => `${item.name} x ${item.quantity}`).join(", "),
                        itemsArray: cart.map(item => ({
                            name: item.name,
                            quantity: item.quantity,
                            price: item.price,
                            prepTime: item.prepTime || 15
                        })),
                        total: Math.round(grandTotal),
                        subtotal,
                        tax,
                        discount,
                        couponCode: appliedCoupon?.code,
                        paymentMethod: "Online",
                        payment: "Paid",
                        orderType,
                        tableNumber,
                        status: "Pending"
                    };
                    const saveRes = await fetch(`${FOOD_BACKEND}/orders`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json", "x-partner-id": partnerId },
                        body: JSON.stringify(orderData)
                    });
                    if (saveRes.ok) {
                        const savedOrder = await saveRes.json();
                        toast.success("Order placed successfully!");
                        clearCart();
                        setAppliedCoupon(null);
                        setIsCartOpen(false);
                        setPlacedOrder(savedOrder);
                        setIsTrackingOpen(true); // Automatically pop up the tracker

                        // Persist across refreshes
                        localStorage.setItem(`active_food_order_${partnerId}`, savedOrder.id);
                    }
                } catch (err) {
                    console.error(err);
                    toast.error("Failed to create order. Please contact support.");
                }
            },
            modal: {
                ondismiss: function () {
                    console.log("Razorpay modal closed");
                }
            },
            prefill: { name: "Customer Name", email: "customer@example.com", contact: "9999999999" },
            theme: { color: "#4894fe" }
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 min-h-[400px]">
                <Loader2 size={40} className="text-[#4894fe] animate-spin mb-4" />
                <p className="text-sm font-medium opacity-50">Preparing your personalized menu...</p>
            </div>
        );
    }

    return (
        <div ref={menuRef} className="mt-8 md:mt-16 relative">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-10 mb-12 md:mb-20">
                <div className="space-y-3 md:space-y-4">
                    <div className="flex items-center gap-2 md:gap-3">
                        <div className="w-8 md:w-12 h-0.5 bg-[#4894fe]" />
                        <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] md:tracking-[0.4em] text-[#4894fe]">Digital Book of India â€” Official Partner</span>
                    </div>
                    <h2 className={`text-3xl md:text-6xl font-black italic uppercase tracking-tighter leading-[0.8] ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        {viewMode === 'Menu' ? (orderType === 'Takeaway' ? 'Express' : 'Premium') : 'Premium'}<br />
                        <span className="text-[#4894fe]">{viewMode === 'Menu' ? (orderType === 'Takeaway' ? 'Takeaway Menu' : 'Dine-in Menu') : 'Dining Experience'}</span>
                    </h2>
                </div>

                <div className="flex flex-col gap-4 md:gap-6 min-w-full md:min-w-[320px]">
                    {/* High Level Switcher */}
                    <div className="p-1.5 bg-white/5 backdrop-blur-3xl rounded-[2rem] border border-white/10 flex items-center relative gap-1">
                        <button
                            onClick={() => { setViewMode('Menu'); setOrderType('Takeaway'); }}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 md:py-4 rounded-xl md:rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all z-10 ${viewMode === 'Menu' && orderType === 'Takeaway' ? 'bg-[#4894fe] text-white shadow-xl' : 'text-slate-400 hover:text-white'}`}
                        >
                            <Utensils size={12} className="md:w-3.5 md:h-3.5" /> Takeaway
                        </button>
                        <button
                            onClick={() => { setViewMode('Menu'); setOrderType('Dine-in'); }}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 md:py-4 rounded-xl md:rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all z-10 ${viewMode === 'Menu' && orderType === 'Dine-in' ? 'bg-[#4894fe] text-white shadow-xl' : 'text-slate-400 hover:text-white'}`}
                        >
                            <ShoppingBag size={12} className="md:w-3.5 md:h-3.5" /> Dine-in
                        </button>
                        <button
                            onClick={() => { setViewMode('Reservation'); setOrderType('Dine-in'); }}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 md:py-4 rounded-xl md:rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all z-10 ${viewMode === 'Reservation' ? 'bg-[#4894fe] text-white shadow-xl' : 'text-slate-400 hover:text-white'}`}
                        >
                            <Clock size={12} className="md:w-3.5 md:h-3.5" /> Dineout
                        </button>
                    </div>

                    {/* Dine-in Scheduling UI */}
                    {viewMode === 'Menu' && orderType === 'Dine-in' && (
                        <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            className={`rounded-3xl p-6 space-y-6 border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/10'}`}
                        >
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-[#4894fe]/10 flex items-center justify-center border border-[#4894fe]/20">
                                        <Clock size={24} className="text-[#4894fe]" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black uppercase tracking-[0.2em] text-[#4894fe]">Schedule Arrival</p>
                                        <p className={`text-[10px] font-bold uppercase opacity-50 ${isLight ? 'text-slate-900' : 'text-white'}`}>Choose your dining slot</p>
                                    </div>
                                </div>

                                <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10">
                                    {['Lunch', 'Dinner'].map((shift: any) => (
                                        <button
                                            key={shift}
                                            onClick={() => setActiveShift(shift)}
                                            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeShift === shift ? 'bg-[#4894fe] text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                                        >
                                            {shift}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-3 md:grid-cols-5 gap-3 max-h-[180px] overflow-y-auto pr-2 scrollbar-custom">
                                {getSlotsForShift().map((slot) => (
                                    <button
                                        key={slot}
                                        onClick={() => setScheduledTime(slot)}
                                        className={`py-3 rounded-xl border-2 text-[10px] font-black uppercase tracking-widest transition-all ${scheduledTime === slot 
                                            ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg scale-[1.05]' 
                                            : isLight ? 'bg-white border-slate-100 text-slate-400 hover:border-slate-200' : 'bg-white/5 border-white/10 text-white/30 hover:border-white/20'}`}
                                    >
                                        {slot}
                                    </button>
                                ))}
                                {getSlotsForShift().length === 0 && (
                                    <div className="col-span-full py-8 text-center opacity-30 text-[10px] font-black uppercase tracking-widest">
                                        No slots available for this shift
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    <div className="flex items-center gap-6 md:gap-8 px-4 md:px-0">
                        <div className="flex flex-col gap-1">
                            <span className="text-[8px] font-black text-[#4894fe] uppercase tracking-[0.2em]">Status</span>
                            <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${isOperational ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'} `} />
                                <span className={`text-[10px] font-black uppercase ${isLight ? 'text-slate-900' : 'text-white'}`}>
                                    {statusObj.message}
                                </span>
                            </div>
                        </div>
                        <div className="w-[1px] h-8 bg-white/10" />
                        <div className="flex flex-col gap-1">
                            <span className="text-[8px] font-black text-[#4894fe] uppercase tracking-[0.2em]">Today's Timing</span>
                            <span className={`text-[10px] font-black uppercase ${isLight ? 'text-slate-900' : 'text-white'}`}>
                                {statusObj.todayHours}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {viewMode === 'Menu' ? (
                    <motion.div
                        key="menu"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="px-4 md:px-0"
                    >
                        {!isOperational && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="mb-8 p-6 bg-red-600/10 border border-red-600/20 rounded-3xl flex items-center gap-4 text-red-500"
                            >
                                <AlertCircle size={24} />
                                <div>
                                    <p className="text-xs font-black uppercase tracking-widest">Currently Not Accepting Orders</p>
                                    <p className="text-[10px] font-bold opacity-80 mt-1">Our kitchen is currently closed. You can still browse the menu, but ordering is disabled.</p>
                                </div>
                            </motion.div>
                        )}
                        {/* Sticky Category Bar */}
                        <div className={`sticky ${isSticky ? 'top-20' : ''} z-40 mb-8 md:mb-12 transition-all duration-300`}>
                            <div className={`flex gap-3 overflow-x-auto pb-4 scrollbar-hide py-3 ${isSticky ? (isLight ? 'bg-white/90 shadow-xl' : 'bg-[#020631]/90 shadow-2xl shadow-black/50') + ' backdrop-blur-3xl px-6 -mx-6 rounded-b-3xl' : ''}`}>
                                <button
                                    onClick={() => setActiveCategory("All")}
                                    className={`px-6 md:px-8 py-2 md:py-2.5 rounded-full font-black text-[10px] md:text-xs uppercase tracking-widest transition-all whitespace-nowrap border-2 ${activeCategory === "All"
                                            ? "bg-[#4894fe] text-white border-[#4894fe] shadow-lg shadow-red-600/20"
                                            : isLight ? "bg-white border-slate-100 text-slate-500 hover:border-slate-200" : "bg-white/5 border-white/5 text-slate-400 hover:border-white/10"
                                        }`}
                                >
                                    All Items
                                </button>
                                {categories.map((cat) => (
                                    <button
                                        key={cat._id}
                                        onClick={() => setActiveCategory(cat.name)}
                                        className={`px-6 md:px-8 py-2 md:py-2.5 rounded-full font-black text-[10px] md:text-xs uppercase tracking-widest transition-all whitespace-nowrap border-2 ${activeCategory === cat.name
                                                ? "bg-[#4894fe] text-white border-[#4894fe] shadow-lg shadow-red-600/20"
                                                : isLight ? "bg-white border-slate-100 text-slate-500 hover:border-slate-200" : "bg-white/5 border-white/5 text-slate-400 hover:border-white/10"
                                            }`}
                                    >
                                        {cat.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Search Bar for Menu */}
                        <div className="mb-8 md:mb-12">
                            <div className={`relative flex-1 group`}>
                                <Search className="absolute left-5 md:left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#4894fe] transition-colors" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search cravings..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className={`w-full pl-14 md:pl-16 pr-6 md:pr-8 py-4 md:py-5 rounded-2xl md:rounded-[2rem] border-2 outline-none transition-all font-bold text-base md:text-lg ${isLight
                                            ? "bg-white border-slate-100 focus:border-[#4894fe] text-slate-900 shadow-xl"
                                            : "bg-white/5 border-white/5 focus:border-[#4894fe] text-white"
                                        }`}
                                />
                            </div>
                        </div>

                        {/* Menu Sections */}
                        <div className="space-y-12 md:space-y-24">
                            {(() => {
                                const grouped: Record<string, any[]> = {};
                                products.forEach(p => {
                                    const cat = p.category || "Others";
                                    if (!grouped[cat]) grouped[cat] = [];
                                    grouped[cat].push(p);
                                });
                                const keys = Object.keys(grouped).filter(k => activeCategory === "All" || k === activeCategory);

                                return keys.map(catName => {
                                    const categoryItems = grouped[catName].filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
                                    if (categoryItems.length === 0) return null;

                                    return (
                                        <div key={catName} className="scroll-mt-40" id={catName}>
                                            <h3 className={`text-2xl md:text-4xl font-black mb-6 md:mb-12 flex items-center gap-3 md:gap-4 italic tracking-tight uppercase ${isLight ? 'text-slate-900' : 'text-white'}`}>
                                                {catName}
                                                <span className={`text-[10px] md:text-sm font-bold px-3 md:px-4 py-0.5 md:py-1 rounded-full opacity-50 ${isLight ? 'bg-slate-100' : 'bg-white/5'}`}>{categoryItems.length} Items</span>
                                            </h3>

                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-16 gap-y-10 md:gap-y-20">
                                                {categoryItems.map((prod) => {
                                                    const cartItem = cart.find(i => i._id === prod._id);
                                                    const hasDiscount = prod.originalPrice && prod.originalPrice > prod.price;

                                                    return (
                                                        <motion.div
                                                            key={prod._id}
                                                            initial={{ opacity: 0, y: 20 }}
                                                            whileInView={{ opacity: 1, y: 0 }}
                                                            viewport={{ once: true }}
                                                            className={`flex gap-3 md:gap-8 group px-4 md:px-0`}
                                                        >
                                                            <div className="flex-1 space-y-1.5 md:space-y-3 min-w-0">
                                                                <div className="flex items-center gap-2 md:gap-3 mb-1 md:mb-2">
                                                                    <div className={`w-3 h-3 md:w-4 md:h-4 rounded border flex items-center justify-center p-0.5 ${prod.isVeg ? 'border-emerald-600' : 'border-red-600'}`}>
                                                                        <div className={`w-full h-full rounded-full ${prod.isVeg ? 'bg-emerald-600' : 'bg-red-600'}`} />
                                                                    </div>
                                                                    {prod.isBestseller && <span className="text-[7px] md:text-[10px] font-black uppercase text-amber-500 bg-amber-500/10 px-1.5 md:px-2 py-0.5 rounded-full border border-amber-500/20">Bestseller</span>}
                                                                </div>

                                                                <h4 className={`text-lg md:text-3xl font-black tracking-tight truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>{prod.name}</h4>

                                                                <div className="flex flex-wrap items-center gap-x-2 md:gap-x-4 gap-y-1">
                                                                    <div className="flex items-center gap-1.5 md:gap-2">
                                                                        <span className={`text-lg md:text-2xl font-black ${isLight ? 'text-[#4894fe]' : 'text-[#ff4d61]'}`}>{prod.price}</span>
                                                                        {hasDiscount && (
                                                                            <div className="flex items-center gap-2">
                                                                                <span className={`text-xs md:text-base font-bold opacity-30 line-through ${isLight ? 'text-slate-900' : 'text-white'}`}>
                                                                                    {prod.originalPrice}
                                                                                </span>
                                                                                <span className="text-emerald-500 text-[7px] md:text-[9px] font-black uppercase tracking-tight bg-emerald-500/10 px-1.5 md:px-2 py-0.5 rounded-full border border-emerald-500/20 whitespace-nowrap">
                                                                                    {Math.round(((prod.originalPrice - prod.price) / prod.originalPrice) * 100)}% OFF
                                                                                </span>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    {prod.prepTime && (
                                                                        <div className={`flex items-center gap-1 text-[7px] md:text-[10px] font-black uppercase tracking-widest px-1 md:px-2 py-0.5 md:py-1 rounded-md border ${isLight ? 'bg-slate-100 border-slate-200 text-slate-900' : 'bg-white/5 border-white/10 text-white'}`}>
                                                                            <Timer size={8} className="text-[#4894fe] fill-current md:w-3 md:h-3" />
                                                                            {prod.prepTime} min
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                {(prod.description || prod.detailedDescription) && (
                                                                    <p className={`text-[10px] md:text-sm leading-relaxed font-medium line-clamp-1 md:line-clamp-3 ${isLight ? 'text-slate-600' : 'text-white/90'}`}>
                                                                        {prod.description || prod.detailedDescription}
                                                                    </p>
                                                                )}

                                                                <button
                                                                    onClick={() => setSelectedProduct(prod)}
                                                                    className={`flex items-center gap-1 text-[7px] md:text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer group/info pt-0.5 md:pt-2 ${isLight ? 'text-slate-500 hover:text-slate-900' : 'text-white/70 hover:text-white'}`}
                                                                >
                                                                    <Info size={10} className="group-hover/info:scale-110 transition-transform fill-current opacity-50 md:w-3.5 md:h-3.5" />
                                                                    <span>Ingredient Details</span>
                                                                </button>
                                                            </div>

                                                            <div className="relative w-24 md:w-44 h-24 md:h-44 shrink-0">
                                                                <div className={`w-full h-full rounded-2xl md:rounded-[2.5rem] overflow-hidden shadow-lg md:shadow-2xl border ${isLight ? 'border-slate-100' : 'border-white/5'}`}>
                                                                    <img
                                                                        src={prod.coverImage || '/assets/food-placeholder.jpg'}
                                                                        className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-110 ${!prod.available ? 'grayscale opacity-50' : ''}`}
                                                                        alt={prod.name}
                                                                    />
                                                                </div>

                                                                <div className="absolute -bottom-3 md:-bottom-5 left-1/2 -translate-x-1/2 w-[90%] md:w-[85%]">
                                                                    {!prod.available ? (
                                                                        <div className="bg-slate-800 text-white text-[7px] md:text-[10px] font-black uppercase tracking-widest text-center py-2 md:py-4 rounded-lg md:rounded-2xl border border-white/10 shadow-2xl">
                                                                            Sold Out
                                                                        </div>
                                                                    ) : (isBusinessAccount && loggedUserId === partnerId) ? (
                                                                        <div
                                                                            onClick={() => toast.error("You cannot order from your own business.", { duration: 4000 })}
                                                                            className="w-full font-black uppercase text-[8px] md:text-[10px] tracking-widest py-2 md:py-4 rounded-lg md:rounded-2xl border text-center cursor-pointer select-none bg-slate-900/95 backdrop-blur-xl text-white border-white/20 shadow-[0_20px_40px_rgba(0,0,0,0.6)] flex items-center justify-center gap-1.5 md:gap-2 hover:bg-slate-800 transition-colors"
                                                                        >
                                                                            <span className="text-amber-400">🔒</span>
                                                                            <span className="opacity-90">OWNER</span>
                                                                        </div>
                                                                    ) : cartItem ? (
                                                                        <div className="bg-white text-[#4894fe] font-black flex items-center justify-between px-2 md:px-4 py-1.5 md:py-3 rounded-lg md:rounded-2xl border-2 border-[#4894fe]/10 shadow-[0_15px_40px_rgba(224,53,70,0.2)]">
                                                                            <button onClick={() => updateQuantity(prod._id, -1)} className="p-0.5 md:p-1 hover:bg-slate-50 rounded-lg transition-colors"><Minus size={12} className="md:w-[18px] md:h-[18px]" /></button>
                                                                            <span className="text-sm md:text-lg w-4 md:w-6 text-center">{cartItem.quantity}</span>
                                                                            <button onClick={() => updateQuantity(prod._id, 1)} className="p-0.5 md:p-1 hover:bg-slate-50 rounded-lg transition-colors"><Plus size={12} className="md:w-[18px] md:h-[18px]" /></button>
                                                                        </div>
                                                                    ) : (
                                                                        <button
                                                                            disabled={!isOperational}
                                                                            onClick={() => addToCart({ ...prod, partnerId, restaurantName: businessName })}
                                                                            className={`w-full font-black uppercase text-[8px] md:text-xs tracking-widest py-2 md:py-4 rounded-lg md:rounded-2xl border-2 transition-all shadow-[0_15px_40px_rgba(224,53,70,0.2)] 
                                                                                ${isOperational
                                                                                    ? "bg-white text-[#4894fe] border-[#4894fe]/10 hover:bg-slate-50 hover:-translate-y-1 active:scale-95"
                                                                                    : "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-70 shadow-none"
                                                                                }`}
                                                                        >
                                                                            {isOperational ? 'ADD' : 'CLOSED'}
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                });
                            })()}
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="reservation"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="px-6 md:px-12 pb-12 max-w-7xl mx-auto"
                    >
                        {!isOperational && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="mb-12 p-8 bg-red-600/10 border border-red-600/20 rounded-[2.5rem] flex items-center gap-6 text-red-500 max-w-4xl mx-auto"
                            >
                                <Clock size={32} />
                                <div>
                                    <p className="text-sm font-black uppercase tracking-widest">Reservations Temporarily Paused</p>
                                    <p className="text-xs font-bold opacity-80 mt-1 text-left">We are currently not accepting new table reservations. Please check our operational hours above.</p>
                                </div>
                            </motion.div>
                        )}
                        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                            <div className="space-y-8">
                                <div className="inline-block px-4 py-1.5 bg-[#4894fe]/10 border border-[#4894fe]/20 rounded-full">
                                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#4894fe]">Fine Dining Reservations</span>
                                </div>
                                <h3 className={`text-4xl md:text-5xl font-black italic uppercase tracking-tighter leading-[0.8] ${isLight ? 'text-slate-900' : 'text-white'}`}>
                                    Reserve Your<br />
                                    <span className="text-[#4894fe]">Dineout Service</span>
                                </h3>
                                <p className={`text-lg leading-relaxed ${isLight ? 'text-slate-600' : 'text-white/60'}`}>Skip the waiting line. Pre-book your table for a seamless dining experience with premium hospitality.</p>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="bg-white/5 p-6 rounded-3xl border border-white/10">
                                        <Utensils className="text-[#4894fe] mb-4" size={24} />
                                        <h5 className="font-black text-xs uppercase tracking-widest mb-1">Premium Seating</h5>
                                        <p className="text-[10px] opacity-40">Choose from indoor or garden views.</p>
                                    </div>
                                    <div className="bg-white/5 p-6 rounded-3xl border border-white/10">
                                        <Percent className="text-emerald-500 mb-4" size={24} />
                                        <h5 className="font-black text-xs uppercase tracking-widest mb-1">Guest Privilege</h5>
                                        <p className="text-[10px] opacity-40">Get 10% off on pre-booked slots.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white/5 backdrop-blur-3xl border border-white/10 p-8 md:p-10 rounded-[3.5rem] shadow-2xl">
                                <form onSubmit={handleBooking} className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 ml-4">Full Name</label>
                                            <input
                                                required
                                                type="text"
                                                placeholder="Your Name"
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-[#4894fe] transition-all font-bold"
                                                value={reservationData.name}
                                                onChange={(e) => setReservationData({ ...reservationData, name: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 ml-4">Mobile Number</label>
                                            <input
                                                required
                                                type="tel"
                                                placeholder="+91 00000 00000"
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-[#4894fe] transition-all font-bold"
                                                value={reservationData.phone}
                                                onChange={(e) => setReservationData({ ...reservationData, phone: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 ml-4">Guests</label>
                                            <select
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-[#4894fe] transition-all font-bold appearance-none"
                                                value={reservationData.guests}
                                                onChange={(e) => setReservationData({ ...reservationData, guests: parseInt(e.target.value) })}
                                            >
                                                {[1, 2, 3, 4, 5, 6, 8, 10].map(n => <option key={n} value={n} className="bg-slate-900">{n} People</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-1.5 relative">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 ml-4">Date</label>
                                            <div className="relative">
                                                <input
                                                    required
                                                    type="date"
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-[#4894fe] transition-all font-bold [color-scheme:dark] [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:left-0 [&::-webkit-calendar-picker-indicator]:top-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                                                    value={reservationData.date}
                                                    onChange={(e) => setReservationData({ ...reservationData, date: e.target.value })}
                                                />
                                                <Calendar size={20} className="absolute right-6 top-1/2 -translate-y-1/2 text-white pointer-events-none opacity-40" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 ml-4">Select Shift</label>
                                        <div className="grid grid-cols-2 gap-4 bg-white/5 p-1.5 rounded-2xl border border-white/5">
                                            {['Lunch', 'Dinner'].map((shift: any) => {
                                                const isToday = reservationData.date === new Date().toISOString().split('T')[0];
                                                const now = new Date();
                                                const currentMins = now.getHours() * 60 + now.getMinutes();

                                                // Determine if shift is disabled for today
                                                let isShiftDisabled = false;
                                                if (isToday) {
                                                    let shiftSlots: string[] = [];
                                                    if (dineoutSettings) {
                                                        shiftSlots = shift === 'Lunch' ? (dineoutSettings.lunchSlots || []) : (dineoutSettings.dinnerSlots || []);
                                                    }
                                                    if (shiftSlots.length > 0) {
                                                        // Disabled if all slots in this shift have passed
                                                        isShiftDisabled = shiftSlots.every(s => timeToMinutes(s) <= currentMins + 15);
                                                    }
                                                }

                                                return (
                                                    <button
                                                        key={shift}
                                                        type="button"
                                                        disabled={isShiftDisabled}
                                                        onClick={() => setActiveShift(shift)}
                                                        className={`py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isShiftDisabled ? 'opacity-20 cursor-not-allowed grayscale' : ''} ${activeShift === shift ? 'bg-[#4894fe] text-white shadow-xl' : 'text-white/40 hover:text-white'}`}
                                                    >
                                                        {shift}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 ml-4">Preferred Slot</label>
                                        <div className="grid grid-cols-4 gap-2">
                                            {getSlotsForShift().map(slot => (
                                                <button
                                                    key={slot}
                                                    type="button"
                                                    onClick={() => setReservationData({ ...reservationData, timeSlot: slot })}
                                                    className={`py-3 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${reservationData.timeSlot === slot ? 'bg-[#4894fe] border-[#4894fe] text-white' : 'bg-white/5 border-white/10 text-white/40 hover:text-white hover:border-white/20'}`}
                                                >
                                                    {slot}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        {totalReservationFee > 0 && (
                                            <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl flex items-center justify-between mb-4 text-left">
                                                <div>
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500 opacity-60">Booking Charges</p>
                                                    <p className="text-xs font-bold text-white/80">{reservationFeePerPerson} x {reservationData.guests} Person</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xl font-black italic text-emerald-500">{totalReservationFee}</p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Business owner cannot make reservations at their own restaurant */}
                                        {(isBusinessAccount && loggedUserId === partnerId) ? (
                                            <div className="w-full p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0 text-base">⚠️</div>
                                                <div>
                                                    <p className="text-xs font-black uppercase tracking-wider">Business Account Detected</p>
                                                    <p className="text-[10px] font-medium opacity-70 mt-0.5">Reservations can only be made from a personal user account.</p>
                                                </div>
                                            </div>
                                        ) : !loggedUserId ? (
                                            <Button
                                                type="button"
                                                onClick={() => { router.push(`/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`); }}
                                                className="w-full bg-slate-800 hover:bg-slate-700 h-auto p-6 rounded-2xl font-black uppercase tracking-[0.2em] text-sm shadow-2xl transition-all active:scale-95 text-white"
                                            >
                                                Login to Reserve
                                            </Button>
                                        ) : (
                                        <Button
                                            disabled={isSubmittingReservation || !isOperational}
                                            className="w-full bg-[#4894fe] hover:bg-[#c32d3d] h-auto p-6 rounded-2xl font-black uppercase tracking-[0.2em] text-sm shadow-2xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isSubmittingReservation ? (
                                                <Loader2 className="animate-spin" />
                                            ) : isOperational ? (
                                                totalReservationFee > 0 ? `Pay ${totalReservationFee} & Confirm` : "Confirm Reservation"
                                            ) : (
                                                "Restaurant Currently Closed"
                                            )}
                                        </Button>
                                        )}
                                    </div>
                                </form>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Reviews Summary Section - Show on both Menu and Reservation for unified look */}
            {reviews.length > 0 && (
                <div className="mt-32 pb-20 overflow-hidden px-6 md:px-12 max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#4894fe] mb-3">Authentic Feedbacks</p>
                            <h3 className={`text-4xl font-black flex items-center gap-4 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                                What foodies say
                            </h3>
                        </div>
                        <button
                            onClick={() => setIsReviewsModalOpen(true)}
                            className="bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest px-8 py-3 rounded-full hover:bg-[#4894fe] hover:text-white transition-all shadow-xl"
                        >
                            View All {reviews.length} Reviews
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {reviews.slice(0, 3).map((rev) => (
                            <div key={rev._id} className={`p-8 rounded-[3rem] border transition-all hover:-translate-y-2 ${isLight ? 'bg-white border-slate-100 shadow-sm' : 'bg-white/5 border-white/5'}`}>
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-14 h-14 rounded-[1.25rem] bg-gradient-to-br from-[#4894fe] to-pink-500 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-red-500/20">
                                        {rev.customer.charAt(0)}
                                    </div>
                                    <div>
                                        <h5 className="font-black text-base">{rev.customer}</h5>
                                        <div className="flex items-center gap-1 text-amber-500 mt-0.5">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} size={14} className={i < rev.rating ? "fill-current" : "opacity-20"} />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <p className={`text-sm italic leading-relaxed opacity-60 font-medium`}>"{rev.comment}"</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}






            {/* Live Tracking Floating Bar (Persistent) */}
            <AnimatePresence>
                {placedOrder && !isTrackingOpen && (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        className="fixed bottom-6 left-0 right-0 z-[70] px-4 flex justify-center pointer-events-none"
                    >
                        <div
                            onClick={() => setIsTrackingOpen(true)}
                            className="bg-slate-900 text-white p-3 md:p-4 rounded-2xl shadow-2xl flex items-center justify-between border border-white/10 backdrop-blur-3xl overflow-hidden relative w-full max-w-lg pointer-events-auto cursor-pointer group hover:bg-slate-800 transition-colors"
                        >
                            <div className="absolute top-0 left-0 w-1/3 h-full bg-gradient-to-r from-[#4894fe]/10 to-transparent pointer-events-none" />
                            <div className="flex items-center gap-3 relative">
                                <div className="w-10 h-10 bg-[#4894fe] rounded-xl flex items-center justify-center animate-pulse">
                                    <Clock size={20} className="text-white" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-[#4894fe] mb-0.5">Live Tracking</p>
                                    <p className="text-sm font-black italic uppercase truncate">
                                        {placedOrder.status === 'Pending' ? 'Waiting for Acceptance...' :
                                            placedOrder.status === 'Completed' ? 'Delivered!' :
                                                `Order ${placedOrder.status}...`}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 px-4 border-l border-white/10 ml-4 group-hover:translate-x-1 transition-transform">
                                <span className="text-[10px] font-black uppercase tracking-widest opacity-50">View Details</span>
                                <ChevronRight size={16} className="text-[#4894fe]" />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Order Success Detail Drawer */}
            <AnimatePresence>
                {isTrackingOpen && placedOrder && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-xl"
                            onClick={() => setIsTrackingOpen(false)}
                        />
                        <motion.div
                            initial={{ x: "100%", y: 0 }}
                            animate={{
                                x: 0,
                                y: typeof window !== 'undefined' && window.innerWidth < 768 ? 0 : 0
                            }}
                            exit={{ x: "100%", y: 0 }}
                            transition={{ type: "spring", damping: 35, stiffness: 350 }}
                            className="fixed bottom-0 right-0 z-[111] h-screen w-full md:w-[450px] shadow-2xl flex flex-col bg-white overflow-hidden"
                        >
                            <div className="flex items-center justify-between px-6 py-4 border-b shrink-0 bg-slate-50 md:hidden">
                                <span className="font-black italic uppercase text-xs">Live Tracker</span>
                                <div className="w-12 h-1.5 bg-slate-300 rounded-full cursor-pointer" onClick={() => setIsTrackingOpen(false)} />
                                <X size={20} onClick={() => setIsTrackingOpen(false)} />
                            </div>
                            <div className="flex-1 overflow-y-auto scrollbar-hide">
                                <OrderSuccess
                                    order={placedOrder}
                                    onOrderMore={() => {
                                        setPlacedOrder(null);
                                        setIsTrackingOpen(false);
                                    }}
                                    partnerId={partnerId}
                                    onClose={() => setIsTrackingOpen(false)}
                                />
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* View All Reviews Modal */}
            <AnimatePresence>
                {isReviewsModalOpen && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setIsReviewsModalOpen(false)}
                            className="absolute inset-0 bg-black/90 backdrop-blur-3xl"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative w-full max-w-4xl bg-white rounded-[3rem] md:rounded-[4rem] p-8 md:p-12 shadow-2xl overflow-hidden max-h-[85vh] flex flex-col"
                        >
                            <div className="flex justify-between items-center mb-10 shrink-0">
                                <div>
                                    <h3 className="text-3xl md:text-4xl font-black italic uppercase text-slate-900 tracking-tight">Real Customer Voices</h3>
                                    <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30 mt-2">Verified foodies in your area</p>
                                </div>
                                <button onClick={() => setIsReviewsModalOpen(false)} className="p-4 bg-white shadow-xl border border-slate-100 rounded-full hover:bg-black hover:text-white transition-all text-black">
                                    <X size={24} />
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto pr-4 scrollbar-hide space-y-6">
                                {reviews.map((rev) => (
                                    <div key={rev._id} className="p-8 md:p-10 rounded-[2.5rem] bg-slate-50 border border-slate-100 hover:border-[#4894fe]/20 transition-all group">
                                        <div className="flex items-center justify-between mb-6">
                                            <div className="flex items-center gap-5">
                                                <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-[#4894fe] flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-red-500/10">
                                                    {rev.customer.charAt(0)}
                                                </div>
                                                <div>
                                                    <h5 className="text-lg md:text-xl font-black text-slate-900">{rev.customer}</h5>
                                                    <p className="text-[10px] font-bold opacity-30 uppercase tracking-widest mt-1">Verified Purchase</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1.5 bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm">
                                                <Star className="text-amber-500 fill-current" size={16} />
                                                <span className="text-lg md:text-xl font-black text-slate-900">{rev.rating}.0</span>
                                            </div>
                                        </div>
                                        <p className="text-base md:text-lg italic leading-relaxed text-slate-600 font-medium capitalize">
                                            &quot;{rev.comment}&quot;
                                        </p>
                                        <div className="mt-6 pt-6 border-t border-slate-200/50 flex items-center justify-between opacity-30 text-slate-900">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Helpful review?</span>
                                            <div className="flex gap-4 font-black">
                                                <span className="cursor-pointer hover:text-emerald-500 transition-colors">Yes</span>
                                                <span className="cursor-pointer hover:text-red-500 transition-colors">No</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Product Detailed Information Modal (Ingredients & Info) */}
            <AnimatePresence>
                {selectedProduct && (
                    <div className="fixed inset-0 z-[200] flex items-end md:items-center justify-center p-0 md:p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedProduct(null)}
                            className="fixed inset-0 bg-black/40 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ y: "100%", opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: "100%", opacity: 0 }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="relative w-full max-w-lg bg-white rounded-t-[2.5rem] md:rounded-[3.5rem] overflow-hidden shadow-2xl flex flex-col max-h-[92vh] md:max-h-[90vh]"
                        >
                            <div className="relative h-44 md:h-64 shrink-0">
                                <img src={selectedProduct.coverImage} className="w-full h-full object-cover" alt="" />
                                <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent" />
                                <button
                                    onClick={() => setSelectedProduct(null)}
                                    className="absolute top-4 right-4 p-2.5 md:p-3 bg-white/80 backdrop-blur-md shadow-lg rounded-full hover:scale-110 transition-all text-black z-20"
                                >
                                    <X size={20} />
                                </button>
                                <div className="absolute bottom-4 left-6 md:bottom-8 md:left-10 z-10 w-[80%]">
                                    <div className={`w-3.5 h-3.5 mb-2 rounded border-2 flex items-center justify-center p-0.5 ${selectedProduct.isVeg ? 'border-emerald-600' : 'border-red-600'}`}>
                                        <div className={`w-full h-full rounded-full ${selectedProduct.isVeg ? 'bg-emerald-600' : 'bg-red-600'}`} />
                                    </div>
                                    <h3 className="text-2xl md:text-4xl font-black text-slate-900 italic uppercase tracking-tighter leading-tight">{selectedProduct.name}</h3>
                                </div>
                            </div>
                            <div className="p-5 md:p-8 space-y-6 md:space-y-8 overflow-y-auto scrollbar-hide max-h-[60vh]">
                                {selectedProduct.ingredients && (
                                    <div className="space-y-2 md:space-y-3">
                                        <h4 className="flex items-center gap-3 text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] text-[#4894fe]">
                                            <Utensils size={12} /> Ingredients
                                        </h4>
                                        <p className="text-sm md:text-lg font-bold text-slate-700 leading-relaxed italic">
                                            {selectedProduct.ingredients}
                                        </p>
                                    </div>
                                )}
                                {selectedProduct.detailedDescription && (
                                    <div className="space-y-2 md:space-y-3">
                                        <h4 className="flex items-center gap-3 text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] text-emerald-600">
                                            <Info size={12} /> Chef&apos;s Story
                                        </h4>
                                        <p className="text-xs md:text-base font-medium text-slate-400 leading-relaxed capitalize">
                                            {selectedProduct.detailedDescription}
                                        </p>
                                    </div>
                                )}
                                {!selectedProduct.ingredients && !selectedProduct.detailedDescription && (
                                    <div className="py-8 text-center text-slate-200">
                                        <AlertCircle size={32} className="mx-auto mb-3" />
                                        <p className="text-[10px] font-black uppercase tracking-widest">No details provided</p>
                                    </div>
                                )}
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 bg-slate-50/80 backdrop-blur-sm p-3 rounded-2xl border border-slate-100 flex items-center justify-center gap-3">
                                        <Timer className="text-[#4894fe]" size={16} />
                                        <div className="flex flex-col">
                                            <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Prep Time</p>
                                            <p className="text-sm font-black text-slate-900">{selectedProduct.prepTime} Mins</p>
                                        </div>
                                    </div>
                                    <div className="flex-1 bg-slate-50/80 backdrop-blur-sm p-3 rounded-2xl border border-slate-100 flex items-center justify-center gap-3">
                                        <div className={`p-1 rounded-full ${selectedProduct.isVeg ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                                            <Utensils size={14} />
                                        </div>
                                        <div className="flex flex-col">
                                            <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Dietary</p>
                                            <p className={`text-sm font-black ${selectedProduct.isVeg ? 'text-emerald-600' : 'text-red-600'}`}>{selectedProduct.isVeg ? 'Vegetarian' : 'Non-Veg'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
