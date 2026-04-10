"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

interface CartItem {
    _id: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
    partnerId: string;
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
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isHydrated, setIsHydrated] = useState(false);

    // Persistence
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
        }
    }, [cart, isHydrated]);

    const addToCart = (item: any) => {
        setCart(prev => {
            const existing = prev.find(i => i._id === item._id);
            if (existing) {
                return prev.map(i => i._id === item._id ? { ...i, quantity: i.quantity + 1 } : i);
            }
            return [...prev, { ...item, quantity: 1 }];
        });
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
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, total, isHydrated }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) throw new Error("useCart must be used within a CartProvider");
    return context;
};
