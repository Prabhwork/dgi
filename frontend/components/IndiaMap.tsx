"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useTheme } from "@/components/ThemeProvider";

const CITIES = [
    { name: "North: Delhi", x: 235, y: 175, color: "#ff3b30" }, // Red
    { name: "West: Mumbai", x: 135, y: 395, color: "#007aff" }, // Blue
    { name: "East: Kolkata", x: 455, y: 345, color: "#34c759" }, // Green
    { name: "South: Chennai", x: 275, y: 535, color: "#ffcc00" }, // Yellow
];

const CONNECTIONS = [
    { from: 0, to: 1 }, // Delhi - Mumbai
    { from: 0, to: 2 }, // Delhi - Kolkata
    { from: 1, to: 3 }, // Mumbai - Chennai
    { from: 2, to: 3 }, // Kolkata - Chennai
    { from: 0, to: 3 }, // Delhi - Chennai
];

interface IndiaMapProps {
    isVisible?: boolean;
}

export default function IndiaMap({ isVisible = true }: IndiaMapProps) {
    const [isLoaded, setIsLoaded] = useState(false);
    const { theme } = useTheme();

    useEffect(() => {
        setIsLoaded(true);
    }, []);

    return (
        <div className="relative w-full h-full flex items-center justify-center bg-transparent group select-none">
            <svg
                viewBox="0 0 600 700"
                className="w-full h-full drop-shadow-[0_0_40px_rgba(0,149,255,0.15)]"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                {/* Improved India Path - Accurate Borders */}
                <motion.path
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={isVisible ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
                    transition={{
                        duration: 3,
                        ease: "linear",
                        repeat: Infinity,
                        repeatDelay: 5
                    }}
                    d="M211,46 L201,54 L203,72 L188,96 L195,123 L180,131 L187,143 L180,157 L157,175 L143,189 L126,192 L111,182 L96,183 L83,197 L75,208 L78,225 L106,243 L108,266 L100,286 L118,294 L129,315 L119,343 L109,372 L96,398 L103,418 L113,425 L133,441 L168,468 L196,501 L211,530 L229,555 L244,582 L248,603 L256,626 L269,635 L288,642 L312,634 L323,618 L334,595 L352,569 L363,546 L374,534 L381,518 L401,496 L407,477 L401,452 L411,444 L435,444 L458,452 L473,446 L493,430 L514,418 L533,397 L538,377 L546,364 L541,348 L526,346 L503,349 L486,354 L468,349 L461,338 L460,323 L471,304 L483,293 L486,281 L468,261 L456,244 L458,228 L475,214 L489,198 L482,185 L466,177 L448,187 L426,195 L415,212 L396,215 L383,204 L372,192 L368,172 L378,158 L386,145 L384,129 L378,114 L368,103 L351,102 L339,112 L329,124 L319,139 L315,153 L301,164 L298,148 L285,125 L276,108 L263,98 L244,81 L234,68 L221,55 L211,46 Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="text-primary/30"
                    fill="url(#indiaGradient)"
                    fillOpacity="0.08"
                />

                <defs>
                    <radialGradient id="indiaGradient" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
                    </radialGradient>
                </defs>

                {/* Connection Lines with Multi-Color Airplanes */}
                {isLoaded && CONNECTIONS.map((conn, i) => {
                    const fromCity = CITIES[conn.from];
                    const toCity = CITIES[conn.to];
                    const angle = Math.atan2(toCity.y - fromCity.y, toCity.x - fromCity.x) * (180 / Math.PI);
                    const color = fromCity.color; // Match airplane to 'from' city

                    return (
                        <g key={`connection-${i}`}>
                            <motion.line
                                x1={fromCity.x}
                                y1={fromCity.y}
                                x2={toCity.x}
                                y2={toCity.y}
                                stroke={color}
                                strokeWidth="0.8"
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={isVisible ? { pathLength: 1, opacity: 0.15 } : { pathLength: 0, opacity: 0 }}
                                transition={{ duration: 2, delay: 2.5 + i * 0.2 }}
                            />

                            {/* Animated Airplane */}
                            <motion.g
                                initial={{ opacity: 0, x: fromCity.x, y: fromCity.y, rotate: angle + 90 }}
                                animate={isVisible ? {
                                    opacity: [0, 1, 1, 0],
                                    x: [fromCity.x, toCity.x],
                                    y: [fromCity.y, toCity.y]
                                } : { opacity: 0 }}
                                transition={{
                                    duration: 4,
                                    delay: 3 + i * 0.6,
                                    repeat: Infinity,
                                    repeatDelay: 1,
                                    ease: "easeInOut"
                                }}
                                style={{ color }}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ transform: 'translate(-8px, -8px)' }}>
                                    <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
                                </svg>
                                {/* Airplane glow trail */}
                                <div className="absolute w-8 h-8 rounded-full blur-md opacity-20 pointer-events-none" style={{ backgroundColor: color }} />
                            </motion.g>
                        </g>
                    );
                })}

                {/* City Markers - Glow Pulse in their respective colors */}
                {isLoaded && CITIES.map((city, i) => (
                    <g key={i}>
                        <motion.circle
                            cx={city.x}
                            cy={city.y}
                            r="15"
                            fill={city.color}
                            fillOpacity="0.1"
                            initial={{ scale: 0 }}
                            animate={isVisible ? { scale: [1, 1.8, 1] } : { scale: 0 }}
                            transition={{
                                duration: 2.5,
                                repeat: Infinity,
                                delay: 3 + i * 0.4
                            }}
                        />
                        <motion.circle
                            cx={city.x}
                            cy={city.y}
                            r="4.5"
                            fill={city.color}
                            initial={{ scale: 0 }}
                            animate={isVisible ? { scale: 1 } : { scale: 0 }}
                            transition={{ duration: 0.8, delay: 3 + i * 0.4 }}
                            style={{ 
                                filter: `drop-shadow(0 0 8px ${city.color})` 
                            }}
                        />
                    </g>
                ))}
            </svg>

            {/* City Names */}
            {isLoaded && CITIES.map((city, i) => (
                <motion.div
                    key={`name-${i}`}
                    className="absolute pointer-events-none whitespace-nowrap px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full border border-primary/20 bg-background/80 backdrop-blur-md text-[8px] sm:text-[9px] md:text-[11px] font-bold text-primary shadow-[0_4px_20px_rgba(0,149,255,0.2)] z-30"
                    style={{
                        left: `${(city.x / 600) * 100}%`,
                        top: `${(city.y / 700) * 100}%`,
                        transform: 'translate(-50%, -150%)'
                    }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                    transition={{ duration: 0.5, delay: 3.5 + i * 0.3 }}
                >
                    {city.name}
                </motion.div>
            ))}

        </div>
    );
}
