"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { motion } from "framer-motion";
import { useTheme } from "./ThemeProvider";

export default function GlobeHeroSection() {
    const mountRef = useRef<HTMLDivElement>(null);
    const { theme } = useTheme();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        const mount = mountRef.current;
        if (!mount) return;

        const w = window.innerWidth;
        const h = window.innerHeight;

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(w, h);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        mount.appendChild(renderer.domElement);

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(42, w / h, 0.1, 100);
        camera.position.z = 2.8;

        const loader = new THREE.TextureLoader();
        const earthTex = loader.load("/earth.jpg");

        // Earth
        const earth = new THREE.Mesh(
            new THREE.SphereGeometry(1, 128, 128),
            new THREE.MeshPhongMaterial({
                map: earthTex,
                specular: new THREE.Color(0x1a6fa8),
                shininess: 15,
            })
        );
        earth.rotation.y = -0.5; // Face India toward viewer
        scene.add(earth);

        // Removed grid / wireframe overlay per request

        // Removed atmosphere layers per request
        /*
        const atmosphereColor = theme === "light" ? 0x0044ff : 0x0055ff;
        ...
        */

        // Simple lights - high ambient to remove heavy shadows
        scene.add(new THREE.AmbientLight(0xffffff, 1.4));
        const sun = new THREE.DirectionalLight(0xffffff, 1.2);
        sun.position.set(5, 3, 5);
        scene.add(sun);

        let animId: number;
        const tick = () => {
            animId = requestAnimationFrame(tick);
            earth.rotation.y += 0.0012;
            renderer.render(scene, camera);
        };
        tick();

        const onResize = () => {
            const nw = window.innerWidth;
            const nh = window.innerHeight;
            renderer.setSize(nw, nh);
            camera.aspect = nw / nh;
            camera.updateProjectionMatrix();
        };
        window.addEventListener("resize", onResize);

        return () => {
            cancelAnimationFrame(animId);
            window.removeEventListener("resize", onResize);
            renderer.dispose();
            if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
        };
    }, [theme]);

    const isLight = theme === "light";

    return (
        <section
            className="relative overflow-hidden transition-all duration-700"
            style={{
                height: "100vh",
                background: isLight
                    ? "linear-gradient(180deg, #0095ff 0%, #4dbbff 20%, #ffffff 50%, #8cd3ff 80%, #0095ff 100%)"
                    : "radial-gradient(ellipse at 50% 50%, #051a45 0%, #020c20 50%, #010812 100%)"
            }}
        >
            <div ref={mountRef} className="absolute inset-0" style={{ zIndex: 5 }} />

            {/* Removed Glow behind globe per request */}

            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4" style={{ zIndex: 10 }}>
                <motion.div
                    initial={{ opacity: 0, y: -12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7 }}
                    className={`px-4 py-1 mb-[14px] rounded-full flex items-center gap-2 border border-solid transition-all duration-300 ${isLight
                        ? 'bg-white/80 border-blue-600 text-primary shadow-none'
                        : 'glass border-white/20 text-white'
                        }`}
                >
                    <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#0077ff", boxShadow: "0 0 8px #0077ff", display: "inline-block" }} />
                    <span className="text-[11px] font-bold tracking-[0.22em] uppercase">
                        Coming Live Soon
                    </span>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.88 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1, ease: "easeOut", delay: 0.1 }}
                    className="glass p-[30px_40px] rounded-[22px] max-w-[480px]"
                >
                    <h1
                        className="font-display font-black uppercase text-white"
                        style={{
                            fontSize: "clamp(2.4rem, 7.5vw, 4.5rem)",
                            letterSpacing: "0.18em",
                            lineHeight: 1.05,
                        }}
                    >
                        PRE LAUNCH
                    </h1>

                    <div className="h-px bg-white/20 my-4" />

                    <motion.p
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
                        className="text-[clamp(0.95rem,2.2vw,1.15rem)] font-semibold mb-[10px] text-accent"
                    >
                        Prepared To Be Amazed!!
                    </motion.p>

                    <motion.p
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }}
                        className="text-[clamp(0.78rem,1.8vw,0.9rem)] font-bold leading-[1.6] text-yellow-400"
                    >
                        Digital Book Of India is on its way to make your way of living more easier..stay tuned.
                    </motion.p>
                </motion.div>
            </div>

            <div
                className="absolute bottom-0 left-0 w-full h-32 pointer-events-none"
                style={{
                    zIndex: 11,
                    background: isLight
                        ? "linear-gradient(to top, rgba(255,255,255,0.8) 0%, transparent 100%)"
                        : "linear-gradient(to top, #050d1a 0%, transparent 100%)"
                }}
            />
        </section>
    );
}
