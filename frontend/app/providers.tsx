"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { useState } from "react";
import { ThemeProvider } from "@/components/ThemeProvider";
import GoogleAuthProviderWrapper from "@/components/GoogleAuthProvider";

import { CartProvider } from "@/context/CartContext";

export default function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => new QueryClient());

    return (
        <ThemeProvider>
            <CartProvider>
                <QueryClientProvider client={queryClient}>
                    <GoogleAuthProviderWrapper>
                        <TooltipProvider>
                            <Toaster />
                            <Sonner />
                            {children}
                        </TooltipProvider>
                    </GoogleAuthProviderWrapper>
                </QueryClientProvider>
            </CartProvider>
        </ThemeProvider>
    );
}
