"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Theme = "dark" | "light";

const ThemeContext = createContext<{
    theme: Theme;
    toggle: () => void;
}>({ theme: "dark", toggle: () => { } });

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setTheme] = useState<Theme>("dark");

    useEffect(() => {
        // Force dark mode for now as requested
        // const saved = localStorage.getItem("dbi-theme") as Theme | null;
        // if (saved) setTheme(saved);
        setTheme("dark");
    }, []);

    useEffect(() => {
        const root = document.documentElement;
        if (theme === "light") {
            root.classList.add("light");
            root.classList.remove("dark");
        } else {
            root.classList.add("dark");
            root.classList.remove("light");
        }
        localStorage.setItem("dbi-theme", theme);
    }, [theme]);

    const toggle = () => {
        // Toggle disabled as per user request to stay on dark theme
        // setTheme(t => (t === "dark" ? "light" : "dark"));
    };

    return (
        <ThemeContext.Provider value={{ theme, toggle }}>
            {children}
        </ThemeContext.Provider>
    );
}

export const useTheme = () => useContext(ThemeContext);
