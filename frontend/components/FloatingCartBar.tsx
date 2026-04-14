"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { ShoppingBag, ArrowRight } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

export default function FloatingCartBar() {
    const { cart, total, isHydrated, isLoggedIn } = useCart();
    const router = useRouter();
    const pathname = usePathname();

    // Don't show on checkout page itself or any authentication pages
    const hiddenRoutes = ["/checkout", "/review-orders", "/login", "/register", "/business-login", "/business-signup", "/community/register"];
    const isHidden = hiddenRoutes.includes(pathname);

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    // Grouping check for multi-restaurant flow
    const uniquePartners = new Set(cart.map(item => item.partnerId));
    const isMultiRestaurant = uniquePartners.size > 1;

    const handleCheckout = () => {
        if (isMultiRestaurant) {
            router.push("/review-orders");
        } else {
            router.push("/checkout");
        }
    };

    return (
        <AnimatePresence>
            {isHydrated && cart.length > 0 && !isHidden && isLoggedIn && (
                <div className="fixed bottom-6 left-0 right-0 z-[9999] px-4 flex justify-center pointer-events-none">
                    <motion.div
                        key="floating-cart"
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        className="w-full max-w-sm pointer-events-auto"
                    >
                    <button
                        onClick={handleCheckout}
                        className="w-full flex items-center justify-between gap-4 bg-white text-primary border-2 border-slate-900 rounded-3xl px-6 py-4 shadow-[0_20px_50px_rgba(0,122,355,0.15)] active:scale-95 transition-all duration-300 backdrop-blur-md"
                    >
                        {/* Left: count badge + label */}
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <ShoppingBag size={22} className="text-slate-900" />
                                <span className="absolute -top-2 -right-2 bg-primary text-white text-[10px] font-black rounded-full w-5 h-5 flex items-center justify-center shadow-md">
                                    {totalItems}
                                </span>
                            </div>
                             <div className="text-left">
                                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-900">
                                    {isMultiRestaurant ? 'Multi-Restaurant Mode' : `${totalItems} ${totalItems === 1 ? 'Item' : 'Items'} Added`}
                                </p>
                                <p className="text-lg font-black leading-none tracking-tight text-slate-900">
                                    ₹{total.toFixed(1)}
                                </p>
                            </div>
                        </div>

                        {/* Right: CTA */}
                        <div className="flex items-center gap-2 bg-primary text-white rounded-xl px-5 py-2.5 shadow-lg shadow-primary/20 group transition-all hover:bg-primary/90">
                            <span className="text-[10px] font-black uppercase tracking-widest">
                                {isMultiRestaurant ? 'Review' : 'Checkout'}
                            </span>
                            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                    </button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
