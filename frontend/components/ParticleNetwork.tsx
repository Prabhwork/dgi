"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "./ThemeProvider";

export default function ParticleNetwork({ className = "" }: { className?: string }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { theme } = useTheme();

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let animId: number;
        
        // Responsive particle count and connection distance
        const isMobile = window.innerWidth < 768;
        const PARTICLE_COUNT = isMobile ? 25 : 100;
        const CONNECTION_DISTANCE = isMobile ? 180 : 220;

        // Colors based on theme
        const particleColor = theme === "light" 
            ? "rgba(100, 150, 255, 0.3)"   // Subtle blue dots for light mode
            : "rgba(255, 255, 255, 0.4)";  // Even lighter dots for dark mode
        const strokeColorBase = theme === "light" 
            ? "rgba(100, 150, 255, "        // Subtle blue connections in light mode
            : "rgba(255, 255, 255, ";
        const baseOpacityMultiplier = theme === "light" ? 0.08 : 0.08;
        const particleRadius = theme === "light" ? 1.5 : 2.0; 

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener("resize", resize);

        interface Particle {
            x: number;
            y: number;
            vx: number;
            vy: number;
        }

        const particles: Particle[] = Array.from({ length: PARTICLE_COUNT }, () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.25,
            vy: (Math.random() - 0.5) * 0.25,
        }));

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particles.forEach((p) => {
                p.x += p.vx;
                p.y += p.vy;
                if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
                if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

                // Draw Particle with Glow
                ctx.beginPath();
                ctx.shadowBlur = 10;
                ctx.shadowColor = particleColor;
                ctx.arc(p.x, p.y, particleRadius, 0, Math.PI * 2);
                ctx.fillStyle = particleColor;
                ctx.fill();
                
                // Reset shadow for lines
                ctx.shadowBlur = 0;
            });

            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < CONNECTION_DISTANCE) {
                        const opacity = (1 - dist / CONNECTION_DISTANCE) * baseOpacityMultiplier;
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = `${strokeColorBase}${opacity})`;
                        ctx.lineWidth = 1;
                        ctx.stroke();
                    }
                }
            }

            animId = requestAnimationFrame(draw);
        };

        draw();

        return () => {
            cancelAnimationFrame(animId);
            window.removeEventListener("resize", resize);
        };
    }, [theme]);

    return (
        <canvas
            ref={canvasRef}
            className={`fixed inset-0 ${className}`}
            style={{ pointerEvents: "none" }}
        />
    );
}
