"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useTheme } from "./ThemeProvider";

export default function MiniGlobe() {
    const mountRef = useRef<HTMLDivElement>(null);
    const { theme } = useTheme();

    useEffect(() => {
        const mount = mountRef.current;
        if (!mount) return;

        // Get size after a tick to ensure layout is computed
        const setup = () => {
            const w = mount.offsetWidth || 400;
            const h = mount.offsetHeight || 400;

            const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
            renderer.setSize(w, h);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            renderer.setClearColor(0x000000, 0);
            mount.appendChild(renderer.domElement);

            const scene = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera(42, w / h, 0.1, 100);
            camera.position.z = 3;

            // Load Earth texture
            const loader = new THREE.TextureLoader();
            const earthTex = loader.load("/earth.jpg");

            // Earth
            const earth = new THREE.Mesh(
                new THREE.SphereGeometry(1, 64, 64),
                new THREE.MeshPhongMaterial({ map: earthTex, specular: new THREE.Color(0x1a6fa8), shininess: 15 })
            );
            earth.rotation.y = -0.5;
            scene.add(earth);

            // Removed grid overlay per request

            // Removed atmosphere glow per request
            /*
            const atmosphereColor = theme === "light" ? 0x0044ff : 0x0055ff;
            ...
            */

            // Stars - hidden or subtle in light mode
            if (theme === "dark") {
                const starPos = new Float32Array(2000 * 3);
                for (let i = 0; i < starPos.length; i++) starPos[i] = (Math.random() - 0.5) * 60;
                const sg = new THREE.BufferGeometry();
                sg.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
                scene.add(new THREE.Points(sg, new THREE.PointsMaterial({ color: 0xffffff, size: 0.07, transparent: true, opacity: 0.65 })));
            }

            // Lights - Brighter in light mode
            const ambientIntensity = theme === "light" ? 1.2 : 0.7;
            const ambientColor = theme === "light" ? 0xffffff : 0x224488;
            scene.add(new THREE.AmbientLight(ambientColor, ambientIntensity));

            const sun = new THREE.DirectionalLight(0xffffff, 1.8); sun.position.set(5, 3, 5); scene.add(sun);
            const rim = new THREE.DirectionalLight(0x0033aa, 0.5); rim.position.set(-4, -2, -3); scene.add(rim);

            let animId: number;
            const tick = () => {
                animId = requestAnimationFrame(tick);
                earth.rotation.y += 0.002;
                renderer.render(scene, camera);
            };
            tick();

            const ro = new ResizeObserver(() => {
                const nw = mount.offsetWidth || w;
                const nh = mount.offsetHeight || h;
                renderer.setSize(nw, nh);
                camera.aspect = nw / nh;
                camera.updateProjectionMatrix();
            });
            ro.observe(mount);

            return () => {
                cancelAnimationFrame(animId);
                ro.disconnect();
                renderer.dispose();
                if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
            };
        };

        // Delay one tick for layout to settle
        const timer = setTimeout(() => {
            const cleanup = setup();
            return cleanup;
        }, 0);

        return () => clearTimeout(timer);
    }, [theme]);

    return <div ref={mountRef} style={{ width: "100%", height: "100%" }} />;
}
