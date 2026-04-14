"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { toast } from 'sonner';

interface CartItem {
    _id: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
    partnerId: string;
    restaurantName?: string;
    isVeg?: boolean;
    prepTime?: number;
}

interface CartContextType {
    cart: CartItem[];
    addToCart: (item: any) => void;
    removeFromCart: (id: string) => void;
    updateQuantity: (id: string, delta: number) => void;
    clearCart: () => void;
    total: number;
    isHydrated: boolean;
    currentRestaurantId: string | null;
    currentRestaurantName: string | null;
    isLoggedIn: boolean;
    isAuthLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const pathname = usePathname();
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isHydrated, setIsHydrated] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);
    const [isCartLoaded, setIsCartLoaded] = useState(false);
    const [isAuthLoading, setIsAuthLoading] = useState(true);

    // Get Backend URLs
    const FOOD_API = process.env.NEXT_PUBLIC_FOOD_API_URL || "http://localhost:3004/api";
    const AUTH_API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002/api";

    // 1. Identification & User Loading
    useEffect(() => {
        const checkUser = async () => {
            const token = localStorage.getItem("userToken");
            if (!token) {
                setUserId(null);
                setCart([]); // Clear cart state on logout
                setIsCartLoaded(false); // Reset load status
                localStorage.removeItem('dbi_cart'); // Clear local storage on logout
                setIsAuthLoading(false);
                return;
            }
            try {
                const res = await fetch(`${AUTH_API}/auth/me`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                const data = await res.json();
                if (data.success) {
                    setUserId(data.data._id);
                } else {
                    localStorage.removeItem("userToken");
                    setUserId(null);
                    setCart([]);
                    setIsCartLoaded(false);
                    localStorage.removeItem('dbi_cart');
                }
            } catch (err) {
                console.error("Auth me error:", err);
            } finally {
                setIsAuthLoading(false);
            }
        };

        if (isHydrated) {
            checkUser();
        }
    }, [isHydrated, AUTH_API, pathname]);

    // 2. Fetch Cart from DB on Login
    useEffect(() => {
        const fetchDBCart = async () => {
            if (!userId) {
                setIsCartLoaded(false);
                return;
            }
            try {
                const res = await fetch(`${FOOD_API}/cart/${userId}`);
                if (res.ok) {
                    const data = await res.json();
                    // If user has a cart in DB, load it.
                    if (data.items && data.items.length > 0) {
                        setCart(data.items);
                    }
                    // Mark as loaded so sync can start
                    setIsCartLoaded(true);
                } else {
                    // Even if fetch fails or no cart, mark as loaded so we can start fresh
                    setIsCartLoaded(true);
                }
            } catch (err) {
                console.error("Fetch DB cart error:", err);
                setIsCartLoaded(true); // Allow sync even on error to prevent being stuck
            }
        };

        fetchDBCart();
    }, [userId, FOOD_API]);

    // 3. Persistence & Sync (Local + DB)
    useEffect(() => {
        const savedCart = localStorage.getItem('dbi_cart');
        if (savedCart) {
            try {
                setCart(JSON.parse(savedCart));
            } catch (e) {
                console.error("Failed to parse cart", e);
            }
        }
        setIsHydrated(true);
    }, []);

    useEffect(() => {
        if (isHydrated) {
            localStorage.setItem('dbi_cart', JSON.stringify(cart));
            
            // Database Sync (Debounced)
            // CRITICAL: Only sync if we have a userId AND the cart has been loaded from DB
            // This prevents overwriting the cloud cart with an empty local state during login
            if (userId && isCartLoaded) {
                const timer = setTimeout(async () => {
                    try {
                        await fetch(`${FOOD_API}/cart/${userId}`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ items: cart })
                        });
                    } catch (err) {
                        console.error("Sync cart error:", err);
                    }
                }, 1000); // 1 second debounce
                return () => clearTimeout(timer);
            }
        }
    }, [cart, isHydrated, userId, FOOD_API]);

    const currentRestaurantId = cart.length > 0 ? cart[0].partnerId : null;
    const currentRestaurantName = cart.length > 0 ? (cart[0].restaurantName || null) : null;

    const addToCart = (item: any) => {
        setCart(prev => {
            const existing = prev.find(i => i._id === item._id && i.partnerId === item.partnerId);
            if (existing) {
                return prev.map(i => (i._id === item._id && i.partnerId === item.partnerId) ? { ...i, quantity: i.quantity + 1 } : i);
            }
            return [...prev, { ...item, quantity: 1 }];
        });
        
        // Helpful toast about multi-restaurant session
        const hasOtherRestaurant = cart.some(i => i.partnerId !== item.partnerId);
        if (hasOtherRestaurant) {
            toast.info(`Multi-Restaurant Order`, {
                description: `Adding items from ${item.restaurantName || 'another restaurant'}. Check review screen for details.`,
                icon: '🛍️'
            });
        }
    };

    const removeFromCart = (id: string) => {
        setCart(prev => prev.filter(i => i._id !== id));
    };

    const updateQuantity = (id: string, delta: number) => {
        setCart(prev => prev.map(i => {
            if (i._id === id) {
                const newQty = Math.max(0, i.quantity + delta);
                return { ...i, quantity: newQty };
            }
            return i;
        }).filter(i => i.quantity > 0));
    };

    const clearCart = () => setCart([]);

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return (
        <CartContext.Provider value={{
            cart, addToCart, removeFromCart, updateQuantity, clearCart,
            total, isHydrated, currentRestaurantId, currentRestaurantName,
            isLoggedIn: !!userId,
            isAuthLoading
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) throw new Error("useCart must be used within a CartProvider");
    return context;
};
