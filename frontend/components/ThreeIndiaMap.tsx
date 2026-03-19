"use client";

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const GEOJSON_URL = "https://raw.githubusercontent.com/johan/world.geo.json/master/countries/IND.geo.json";

const CITIES = [
    { name: "Delhi", lat: 28.6139, lng: 77.2090, color: 0xFF4444 },
    { name: "Mumbai", lat: 19.0760, lng: 72.8777, color: 0x4444FF },
    { name: "Chennai", lat: 13.0827, lng: 80.2707, color: 0xFFFF44 },
    { name: "Kolkata", lat: 22.5726, lng: 88.3639, color: 0x44FF44 }
];

export default function ThreeIndiaMap() {
    const mountRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!mountRef.current) return;
        const container = mountRef.current;
        let width = container.clientWidth || 400, height = container.clientHeight || 400;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.appendChild(renderer.domElement);
        camera.position.set(0, 0, 14);

        scene.add(new THREE.AmbientLight(0xffffff, 1.2));
        const pointLight = new THREE.PointLight(0x60A5FA, 3, 100);
        pointLight.position.set(10, 10, 20);
        scene.add(pointLight);

        const proj = (lng: number, lat: number): [number, number] => [(lng - 82) * 0.32, (lat - 22) * 0.32];
        const mapGroup = new THREE.Group();
        mapGroup.scale.set(0, 0, 0);
        scene.add(mapGroup);

        const createLabel = (text: string, color: number) => {
            const canvas = document.createElement('canvas');
            canvas.width = 256; canvas.height = 64;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.fillStyle = 'rgba(0,0,0,0)';
                ctx.fillRect(0,0,256,64);
                ctx.font = 'bold 36px Arial';
                ctx.fillStyle = '#' + new THREE.Color(color).getHexString();
                ctx.textAlign = 'center';
                ctx.fillText(text, 128, 45);
            }
            const tex = new THREE.CanvasTexture(canvas);
            const spr = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex }));
            spr.scale.set(2, 0.5, 1);
            return spr;
        };

        const createAirplane = (color: number) => {
            const group = new THREE.Group();
            
            // Sleek Metallic Body Material
            const mat = new THREE.MeshStandardMaterial({ 
                color: 0xffffff, 
                metalness: 0.8, 
                roughness: 0.2,
                emissive: color,
                emissiveIntensity: 0.3
            });

            // Fuselage (Body)
            const bodyGeom = new THREE.CylinderGeometry(0.035, 0.035, 0.6, 16);
            bodyGeom.rotateX(Math.PI / 2);
            const body = new THREE.Mesh(bodyGeom, mat);
            group.add(body);

            // Nose (Rounded)
            const noseGeom = new THREE.SphereGeometry(0.035, 16, 16);
            noseGeom.translate(0, 0, 0.3);
            const nose = new THREE.Mesh(noseGeom, mat);
            group.add(nose);

            // Main Wings (Realistic Swept Shape)
            const wingShape = new THREE.Shape();
            wingShape.moveTo(0, 0);
            wingShape.lineTo(0.35, -0.15);
            wingShape.lineTo(0.35, -0.22);
            wingShape.lineTo(0, -0.08);
            wingShape.lineTo(-0.35, -0.22);
            wingShape.lineTo(-0.35, -0.15);
            wingShape.lineTo(0, 0);
            
            const wingGeom = new THREE.ExtrudeGeometry(wingShape, { depth: 0.012, bevelEnabled: false });
            const wings = new THREE.Mesh(wingGeom, mat);
            wings.rotateX(Math.PI / 2);
            wings.position.set(0, 0, 0.12);
            group.add(wings);

            // Tail Wings (Horizontal Stabilizers)
            const tailWingShape = new THREE.Shape();
            tailWingShape.moveTo(0, 0);
            tailWingShape.lineTo(0.14, -0.06);
            tailWingShape.lineTo(0.14, -0.1);
            tailWingShape.lineTo(0, -0.04);
            tailWingShape.lineTo(-0.14, -0.1);
            tailWingShape.lineTo(-0.14, -0.06);
            tailWingShape.lineTo(0, 0);

            const tailWingGeom = new THREE.ExtrudeGeometry(tailWingShape, { depth: 0.01, bevelEnabled: false });
            const tailWings = new THREE.Mesh(tailWingGeom, mat);
            tailWings.rotateX(Math.PI / 2);
            tailWings.position.set(0, 0, -0.22);
            group.add(tailWings);

            // Vertical Stabilizer (Tail Fin)
            const finShape = new THREE.Shape();
            finShape.moveTo(0, 0);
            finShape.lineTo(0.14, 0.12);
            finShape.lineTo(0.04, 0);
            finShape.lineTo(0, 0);

            const finGeom = new THREE.ExtrudeGeometry(finShape, { depth: 0.01, bevelEnabled: false });
            const fin = new THREE.Mesh(finGeom, mat);
            fin.rotateY(Math.PI / 2);
            fin.position.set(0, 0.035, -0.28);
            group.add(fin);

            // Engines (Under-wing detail)
            const engineGeom = new THREE.CylinderGeometry(0.02, 0.02, 0.1, 12);
            engineGeom.rotateX(Math.PI / 2);
            
            const leftEngine = new THREE.Mesh(engineGeom, mat);
            leftEngine.position.set(-0.12, -0.03, 0.05);
            group.add(leftEngine);
            
            const rightEngine = new THREE.Mesh(engineGeom, mat);
            rightEngine.position.set(0.12, -0.03, 0.05);
            group.add(rightEngine);

            // Glow Trail (Refined)
            const glowMat = new THREE.MeshBasicMaterial({
                color: color,
                transparent: true,
                opacity: 0.35,
                blending: THREE.AdditiveBlending,
                depthWrite: false
            });
            const glow = new THREE.Mesh(new THREE.SphereGeometry(0.05, 16, 16), glowMat);
            glow.position.set(0, 0, -0.3);
            glow.scale.z = 4.5;
            group.add(glow);

            // Final Scale adjustment
            group.scale.set(0.9, 0.9, 0.9);
            return group;
        };

        const starPos = new Float32Array(200 * 3);
        for (let i = 0; i < 200; i++) {
            starPos[i * 3] = (Math.random() - 0.5) * 50;
            starPos[i * 3 + 1] = (Math.random() - 0.5) * 50;
            starPos[i * 3 + 2] = (Math.random() - 0.5) * 30;
        }
        const starGeom = new THREE.BufferGeometry();
        starGeom.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
        const stars = new THREE.Points(starGeom, new THREE.PointsMaterial({ color: 0x60A5FA, size: 0.04, transparent: true, opacity: 0.4 }));
        scene.add(stars);

        let frameId: number;
        const planes: { mesh: THREE.Group, path: THREE.CatmullRomCurve3, progress: number }[] = [];

        const animate = () => {
            frameId = requestAnimationFrame(animate);
            planes.forEach(p => {
                p.progress += 0.003; // Smooth slower motion
                if (p.progress > 1) p.progress = 0;
                
                // use easing for natural flight (optional, but a constant speed is fine for maps)
                const pos = p.path.getPointAt(p.progress);
                const nextPos = p.path.getPointAt(Math.min(0.999, p.progress + 0.01));
                
                p.mesh.position.copy(pos);
                // Critical for correct rotation on a 2D map extruded in Z:
                p.mesh.up.set(0, 0, 1);
                p.mesh.lookAt(nextPos);
            });
            if (mapGroup.scale.x < 1) {
                const s = Math.min(1, mapGroup.scale.x + 0.012);
                mapGroup.scale.set(s, s, s);
            }
            stars.rotation.y += 0.0001;
            renderer.render(scene, camera);
        };
        animate();

        fetch(GEOJSON_URL)
            .then(res => res.json())
            .then(data => {
                const geometry = data.features[0].geometry;
                const shapes: THREE.Shape[] = [];
                const processPoly = (poly: number[][]) => {
                    const s = new THREE.Shape();
                    poly.forEach((c, j) => {
                        const [x, y] = proj(c[0], c[1]);
                        if (j === 0) s.moveTo(x, y);
                        else s.lineTo(x, y);
                    });
                    return s;
                };
                if (geometry.type === "MultiPolygon") {
                    geometry.coordinates.forEach((p: any) => shapes.push(processPoly(p[0])));
                } else {
                    shapes.push(processPoly(geometry.coordinates[0]));
                }

                shapes.forEach(shape => {
                    const extrudeGeom = new THREE.ExtrudeGeometry(shape, { depth: 0.1, bevelEnabled: false });
                    mapGroup.add(new THREE.Mesh(extrudeGeom, new THREE.MeshStandardMaterial({
                        color: 0x1E3A8A, emissive: 0x60A5FA, emissiveIntensity: 0.1,
                        metalness: 0.4, roughness: 0.2
                    })));
                    mapGroup.add(new THREE.LineSegments(new THREE.EdgesGeometry(extrudeGeom), new THREE.LineBasicMaterial({ color: 0x60A5FA, transparent: true, opacity: 0.6 })));
                });

                const cityPos: THREE.Vector3[] = [];
                CITIES.forEach((city) => {
                    const [px, py] = proj(city.lng, city.lat);
                    const pos = new THREE.Vector3(px, py, 0.15);
                    cityPos.push(pos);
                    const cityMesh = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 16), new THREE.MeshBasicMaterial({ color: city.color }));
                    cityMesh.position.copy(pos);
                    mapGroup.add(cityMesh);
                    const label = createLabel(city.name, city.color);
                    label.position.set(px, py + 0.6, 0.3);
                    mapGroup.add(label);
                    const ring = new THREE.Mesh(new THREE.CircleGeometry(0.25, 32), new THREE.MeshBasicMaterial({ color: city.color, transparent: true, opacity: 0.4, side: THREE.DoubleSide }));
                    ring.position.set(px, py, 0.16);
                    mapGroup.add(ring);
                });

                for (let i = 0; i < cityPos.length; i++) {
                    const start = cityPos[i], end = cityPos[(i + 1) % cityPos.length];
                    const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
                    mid.z += 1.5;
                    const curve = new THREE.CatmullRomCurve3([start, mid, end]);
                    const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(50)), new THREE.LineDashedMaterial({ color: 0x60A5FA, dashSize: 0.2, gapSize: 0.1, transparent: true, opacity: 0.3 }));
                    line.computeLineDistances();
                    mapGroup.add(line);
                    const airplane = createAirplane(CITIES[i].color);
                    mapGroup.add(airplane);
                    planes.push({ mesh: airplane, path: curve, progress: Math.random() });
                }
            })
            .catch(err => console.error("3D Map Geometry Error:", err));

        const updateSize = () => {
            if (!container) return;
            const w = container.clientWidth, h = container.clientHeight;
            if (w === 0 || h === 0) return;
            renderer.setSize(w, h);
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
        };

        const resizeObserver = new ResizeObserver(updateSize);
        resizeObserver.observe(container);
        const timer = setTimeout(updateSize, 100);

        return () => {
            clearTimeout(timer);
            resizeObserver.disconnect();
            cancelAnimationFrame(frameId);
            if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
            renderer.dispose();
        };
    }, []);

    return (
        <div 
            ref={mountRef} 
            className="w-full h-full absolute inset-0 overflow-hidden" 
            style={{ zIndex: 1 }}
        />
    );
}
