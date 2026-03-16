"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useTheme } from "@/components/ThemeProvider";

const CITIES = [
    { name: "North: Delhi", x: 195, y: 155 },
    { name: "West: Mumbai", x: 125, y: 395 },
    { name: "East: Kolkata", x: 425, y: 355 },
    { name: "South: Chennai", x: 265, y: 535 },
];

const CONNECTIONS = [
    { from: 0, to: 1 }, // Delhi - Mumbai
    { from: 0, to: 2 }, // Delhi - Kolkata
    { from: 1, to: 3 }, // Mumbai - Chennai
    { from: 2, to: 3 }, // Kolkata - Chennai
    { from: 0, to: 3 }, // Delhi - Chennai (North-South)
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
                className="w-full h-full drop-shadow-[0_0_30px_rgba(0,149,255,0.2)]"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
           
                <motion.path
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={isVisible ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
                    transition={{
                        duration: 3,
                        ease: "easeInOut",
                        repeat: Infinity,
                        repeatDelay: 2
                    }}
                    d="M194.5 35L178.5 45.5L163 70.5L163 87.5L152 101L156.5 116.5L168.5 125L181.5 142.5L181.5 158.5L173.5 168.5L156.5 174.5L145 187.5L138.5 204.5L129 204.5L118 198.5L112.5 187.5L96.5 187.5L88 198.5L78 198.5L72.5 214.5L78 227L88 238L104 238L112.5 248.5L112.5 264.5L112.5 280.5L104 291L118 291L129 291L138.5 304L145 321L145 334.5L138.5 351L129 367L118 382.5L104 397L104 411.5L112.5 425L129 435.5L145 444L163 459L181.5 478.5L200.5 504L214 521.5L226.5 540L239 556L251 573L251 594L261 612.5L268 626L282 638L297.5 644L313 638L326 626L333 607L342 594L355.5 573L363 556L363 540L370 528.5L379.5 513L394.5 497L403.5 487L403.5 469.5L403.5 450.5L414 440.5L425.5 440.5L441 450.5L452.5 450.5L466.5 440.5L482 430.5L497.5 425L511 418L520.5 411.5L528 403.5L535.5 391L535.5 373L544.5 367L544.5 351L535.5 342L520.5 342L511 342L497.5 351L482 355.5L466.5 351L458 342L458 321L466.5 304L482 291L497.5 291L482 278L466.5 264.5L458 248.5L458 232.5L466.5 221L482 214.5L497.5 204.5L482 193L466.5 182L452.5 182L441 193L425.5 204.5L414 214.5L399.5 214.5L383 204.5L370 193L370 176.5L379.5 162.5L383 148L383 133L379.5 116.5L370 106.5L355.5 106.5L342 116.5L333 133L326 148L313 158.5L302.5 168.5L302.5 151L295.5 136.5L302.5 116.5L295.5 101L285 91L272.5 83L261 74.5L261 57.5L251 45.5L239 35L221.5 31.5L200.5 31.5L194.5 35Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-primary/40"
                    fill="url(#mapGradient)"
                    fillOpacity="0.1"
                />

                <defs>
                    <radialGradient id="mapGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                        <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
                    </radialGradient>
                </defs>

                {/* Connection Lines & Airplanes */}
                {isLoaded && CONNECTIONS.map((conn, i) => {
                    const fromCity = CITIES[conn.from];
                    const toCity = CITIES[conn.to];
                    const angle = Math.atan2(toCity.y - fromCity.y, toCity.x - fromCity.x) * (180 / Math.PI);

                    return (
                        <g key={`connection-${i}`}>
                            <motion.line
                                x1={fromCity.x}
                                y1={fromCity.y}
                                x2={toCity.x}
                                y2={toCity.y}
                                stroke="currentColor"
                                strokeWidth="1"
                                className="text-primary/20"
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={isVisible ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
                                transition={{ duration: 1.5, delay: 2.5 + i * 0.2 }}
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
                                    duration: 3,
                                    delay: 3 + i * 0.5,
                                    repeat: Infinity,
                                    repeatDelay: 2,
                                    ease: "linear"
                                }}
                                className="text-primary"
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ transform: 'translate(-7px, -7px)' }}>
                                    <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
                                </svg>
                            </motion.g>
                        </g>
                    );
                })}

                {/* City Markers */}
                {isLoaded && CITIES.map((city, i) => (
                    <g key={i}>
                        <motion.circle
                            cx={city.x}
                            cy={city.y}
                            r="12"
                            className="fill-primary/20"
                            initial={{ scale: 0 }}
                            animate={isVisible ? { scale: [1, 1.5, 1] } : { scale: 0 }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                delay: 3 + i * 0.3
                            }}
                        />
                        <motion.circle
                            cx={city.x}
                            cy={city.y}
                            r="4"
                            className="fill-primary"
                            initial={{ scale: 0 }}
                            animate={isVisible ? { scale: 1 } : { scale: 0 }}
                            transition={{ duration: 0.5, delay: 3 + i * 0.3 }}
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
