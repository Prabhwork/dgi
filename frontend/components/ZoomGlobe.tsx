"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useTheme } from "./ThemeProvider";

const LOCATIONS = [
    { name: "Delhi", lat: 28.61, lon: 77.21 },
    { name: "Mumbai", lat: 19.07, lon: 72.87 },
    { name: "Gujarat", lat: 23.21, lon: 72.63 },
    { name: "Punjab", lat: 31.14, lon: 75.34 },
    { name: "Kashmir", lat: 34.08, lon: 74.79 }
];

// Helper to create text texture for 3D labels
function createTextSprite(text: string) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return new THREE.Sprite();

    const fontSize = 48;
    ctx.font = `Bold ${fontSize}px Inter, system-ui, sans-serif`;
    const textWidth = ctx.measureText(text).width;

    canvas.width = textWidth + 20;
    canvas.height = fontSize + 20;

    // Redraw with correct size
    ctx.font = `Bold ${fontSize}px Inter, system-ui, sans-serif`;
    ctx.fillStyle = 'rgba(255, 255, 255, 1)';
    ctx.shadowColor = 'rgba(0, 255, 255, 0.8)';
    ctx.shadowBlur = 10;
    ctx.fillText(text, 10, fontSize);

    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({ map: texture, transparent: true, opacity: 0 });
    const sprite = new THREE.Sprite(material);

    // Scale sprite based on aspect ratio
    const scale = 0.05;
    sprite.scale.set(scale * (canvas.width / canvas.height), scale, 1);
    return sprite;
}

export default function ZoomGlobe() {
    const mountRef = useRef<HTMLDivElement>(null);
    const { theme } = useTheme();

    useEffect(() => {
        const mount = mountRef.current;
        if (!mount) return;

        const w = mount.offsetWidth || 500;
        const h = mount.offsetHeight || 500;

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(w, h);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        mount.appendChild(renderer.domElement);

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
        camera.position.z = 5; // Start far away

        const loader = new THREE.TextureLoader();
        const earthTex = loader.load("/earth.jpg");

        // Earth
        const earth = new THREE.Mesh(
            new THREE.SphereGeometry(1, 128, 128),
            new THREE.MeshPhongMaterial({
                map: earthTex,
                specular: new THREE.Color(0x111111),
                shininess: 5,
            })
        );
        scene.add(earth);

        // Lighting
        scene.add(new THREE.AmbientLight(0xffffff, 1.4));
        const sun = new THREE.DirectionalLight(0xffffff, 1.0);
        sun.position.set(5, 3, 5);
        scene.add(sun);

        // Texture Alignment: Standard textures have 0 lon at the center.
        // We adjust the mapping to match the Three.js sphere UVs.
        const getCoords = (lat: number, lon: number, radius: number) => {
            const phi = (90 - lat) * (Math.PI / 180);
            const theta = (lon + 180) * (Math.PI / 180);
            return new THREE.Vector3(
                -radius * Math.sin(phi) * Math.cos(theta),
                radius * Math.cos(phi),
                radius * Math.sin(phi) * Math.sin(theta)
            );
        };

        // India Center for Camera Focus
        const camTargetPos = getCoords(20.59, 78.96, 1.7); // Backed out to 1.7 for better view

        // State Markers Container - Child of Earth to rotate together
        const markersGroup = new THREE.Group();
        earth.add(markersGroup);

        LOCATIONS.forEach(loc => {
            const pos = getCoords(loc.lat, loc.lon, 1.01);
            const x = pos.x;
            const y = pos.y;
            const z = pos.z;

            // Pulse Dot
            const markerGeo = new THREE.SphereGeometry(0.007, 12, 12);
            const markerMat = new THREE.MeshBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0 });
            const marker = new THREE.Mesh(markerGeo, markerMat);
            marker.position.set(x, y, z).multiplyScalar(1.005);
            markersGroup.add(marker);

            // Halo
            const haloGeo = new THREE.RingGeometry(0.012, 0.016, 24);
            const haloMat = new THREE.MeshBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0, side: THREE.DoubleSide });
            const halo = new THREE.Mesh(haloGeo, haloMat);
            halo.position.copy(marker.position).multiplyScalar(1.001);
            halo.lookAt(marker.position.clone().multiplyScalar(2));
            markersGroup.add(halo);

            // Text Label Sprite
            const label = createTextSprite(loc.name);
            label.position.copy(marker.position).multiplyScalar(1.03);
            markersGroup.add(label);

            // Interaction properties
            (marker as any).isDot = true;
            (halo as any).isHalo = true;
            (label as any).isLabel = true;
        });

        let phase = 1; // 1: Rotate, 2: Zoom, 3: Finale
        let progress = 0;
        let rotationCounter = 0;
        const rotationLimit = 120; // Frames for rotation
        let animId: number;

        const tick = () => {
            animId = requestAnimationFrame(tick);

            if (phase === 1) {
                // Phase 1: Globe Movement (Rotation)
                earth.rotation.y += 0.01;
                rotationCounter++;
                if (rotationCounter >= rotationLimit) phase = 2;
            } else if (phase === 2) {
                // Phase 2: Cinematic Zoom
                progress += 0.006;
                const easeProgress = 1 - Math.pow(1 - progress, 5); // Pentic ease-out
                camera.position.lerpVectors(new THREE.Vector3(0, 0, 5), camTargetPos, easeProgress);
                camera.lookAt(0, 0, 0);
                if (progress >= 1) phase = 3;
            } else {
                // Phase 3: Finale (Reveal Markers & subtle movement)
                earth.rotation.y += 0.0002;

                markersGroup.children.forEach(child => {
                    const mat = (child as any).material;
                    if (mat.opacity < 0.8) mat.opacity += 0.02;

                    if ((child as any).isHalo) {
                        const s = 1 + Math.sin(Date.now() * 0.006) * 0.4;
                        child.scale.set(s, s, s);
                        mat.opacity = Math.min(mat.opacity, 0.6 - (s - 1) * 0.8);
                    }
                });
            }

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
    }, [theme]);

    return <div ref={mountRef} className="w-full h-full" />;
}
